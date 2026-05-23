#!/usr/bin/env bun
// Drain pending entries from the queue. Posts via existing post-* scripts.
//
// Dry-run default. --yes to actually post.
// Per entry: tries each platform sequentially, records result, marks
// sent / partial / failed.

import { listEntries, getEntry, updateEntry, type QueueEntry, type Platform, type PlatformResult } from "../queue";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("queue-drain", "Post queued entries", [
    "--id=ID          Drain one entry by id",
    "--all            Drain ALL pending entries",
    "--platforms=LIST Limit per-entry to subset of its platforms (e.g. --platforms=x)",
    "--rate=N         Sleep N seconds between platform posts (default 0)",
    "--yes            ACTUALLY POST (default: dry-run)",
    "--retry-failed   Re-drain entries with failed/partial status",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));

let entries: QueueEntry[];
if (typeof args.id === "string") {
  const e = await getEntry(args.id);
  if (!e) {
    console.error(`not found: ${args.id}`);
    process.exit(1);
  }
  entries = [e];
} else if (args.all) {
  entries = await listEntries({ status: "pending" });
  if (args["retry-failed"]) {
    const failed = await listEntries({ status: "failed" });
    const partial = await listEntries({ status: "partial" });
    entries = [...entries, ...failed, ...partial];
  }
} else {
  console.error("need --id=ID or --all. see --help.");
  process.exit(2);
}

const platformLimit =
  typeof args.platforms === "string"
    ? new Set(args.platforms.split(",").map((s) => s.trim().toLowerCase()) as Platform[])
    : null;

const rateMs = typeof args.rate === "string" ? parseFloat(args.rate) * 1000 : 0;
const live = !!args.yes;

console.error(`\n=== ${live ? "DRAINING" : "DRY RUN"} ${entries.length} entries ===\n`);

// Use import.meta.dir (Bun-native) to avoid URL-encoding spaces in paths.
const scriptDir = `${import.meta.dir}/`;

function platformCmd(entry: QueueEntry, platform: Platform): string[] {
  if (platform === "x") {
    const cmd = ["bun", "run", `${scriptDir}post-x.ts`, "--yes", `--text=${entry.text}`];
    if (entry.text.length > 280) cmd.push("--thread");
    return cmd;
  }
  // hn
  const title =
    entry.hnTitle ??
    (entry.text.split("\n")[0].slice(0, 77) +
      (entry.text.split("\n")[0].length > 77 ? "..." : ""));
  const cmd = ["bun", "run", `${scriptDir}post-hn.ts`, "--yes", `--title=${title}`];
  if (entry.hnUrl) cmd.push(`--url=${entry.hnUrl}`);
  else cmd.push(`--text=${entry.text}`);
  return cmd;
}

// Returns posted URL if detectable from script stdout.
function extractUrl(stdout: string, platform: Platform): string | undefined {
  // post-x line format: "posted N/M: https://..."
  // post-hn line format: "submitted: https://news.ycombinator.com/item?id=..."
  const m = stdout.match(/(?:posted|submitted)(?:\s\d+\/\d+)?:\s+(https?:\/\/\S+)/);
  if (m) return m[1];
  void platform;
  return undefined;
}

for (const entry of entries) {
  console.error(`--- ${entry.id} (${entry.platforms.join(",")}) ---`);
  console.error(`  ${entry.text.split("\n")[0].slice(0, 100)}`);

  const targetPlatforms = entry.platforms.filter((p) => !platformLimit || platformLimit.has(p));
  if (targetPlatforms.length === 0) {
    console.error(`  (no platforms after filter, skipping)`);
    continue;
  }

  if (!live) {
    for (const p of targetPlatforms) {
      const cmd = platformCmd(entry, p);
      // Replace --yes with nothing so the dry-run preview fires.
      const previewCmd = cmd.filter((a) => a !== "--yes");
      console.error(`  [dry] ${p}: ${previewCmd[2]} (preview only)`);
      const proc = Bun.spawn(previewCmd, { stdout: "pipe", stderr: "pipe" });
      await proc.exited;
      const out = await new Response(proc.stdout).text();
      console.error(out.split("\n").filter((l) => l.trim()).slice(0, 2).map((l) => `      ${l}`).join("\n"));
    }
    continue;
  }

  // LIVE.
  const newResults: Partial<Record<Platform, PlatformResult>> = { ...(entry.results ?? {}) };
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetPlatforms.length; i++) {
    const p = targetPlatforms[i];
    // Skip if already succeeded in a previous drain.
    if (newResults[p]?.ok) {
      console.error(`  [skip] ${p}: already sent → ${newResults[p]?.url}`);
      successCount++;
      continue;
    }
    console.error(`  [send] ${p} ...`);
    const cmd = platformCmd(entry, p);
    const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
    const code = await proc.exited;
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    if (code === 0) {
      const url = extractUrl(stdout, p);
      newResults[p] = { ok: true, url, at: Math.floor(Date.now() / 1000) };
      console.error(`        ✓ ${url ?? "(posted, no URL parsed)"}`);
      successCount++;
    } else {
      const errLine = stderr.split("\n").filter((l) => l.trim()).slice(-3).join(" | ");
      newResults[p] = { ok: false, error: errLine || `exit ${code}`, at: Math.floor(Date.now() / 1000) };
      console.error(`        ✗ ${errLine}`);
      failCount++;
    }

    if (rateMs && i < targetPlatforms.length - 1) {
      await new Promise((r) => setTimeout(r, rateMs));
    }
  }

  const newStatus =
    failCount === 0 ? "sent" : successCount === 0 ? "failed" : "partial";
  entry.results = newResults;
  entry.status = newStatus;
  entry.sentAt = Math.floor(Date.now() / 1000);
  if (newStatus !== "sent") {
    entry.lastError = Object.entries(newResults)
      .filter(([, r]) => r && !r.ok)
      .map(([k, r]) => `${k}: ${r?.error}`)
      .join(" | ");
  } else {
    entry.lastError = undefined;
  }
  await updateEntry(entry);
  console.error(`  → ${newStatus} (${successCount}/${targetPlatforms.length} ok)\n`);
}

console.error("done.");
