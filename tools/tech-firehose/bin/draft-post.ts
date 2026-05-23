#!/usr/bin/env bun
// Compose helper. Reads draft text, shows preview per platform, optionally
// fans out to post-x / post-hn.
//
// Per-platform char limits:
//   x: 280  | hn: 80 (title only)
//
// HN is title-only via this helper. For Ask HN / Show HN bodies, use
// bin/post-hn.ts directly.
//
// Examples:
//   bun run bin/draft-post.ts --file=draft.md                     # preview x
//   bun run bin/draft-post.ts --file=draft.md --platforms=x,hn    # preview both
//   bun run bin/draft-post.ts --file=share.md --platforms=x,hn --send  # fan-out
//   bun run bin/draft-post.ts \
//     --text="Show HN: my tool" \
//     --platforms=hn \
//     --hn-url=https://github.com/me/x \
//     --send

import { splitForX } from "../posters";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("draft-post", "Preview a draft and (optionally) fan-out to x/hn", [
    "--text=\"STR\"        Draft text",
    "--file=PATH         Read from file",
    "--stdin             Read from stdin",
    "--platforms=LIST    Comma list: x,hn (default x)",
    "--thread            Force thread split even if under limit",
    "--send              Actually post to selected platforms (each script runs with --yes)",
    "--hn-url=URL        HN story URL (if HN selected, used as the linked URL)",
    "--hn-title=\"STR\"    Override HN title (default: first line / first 80 chars of draft)",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));
const platforms = (typeof args.platforms === "string" ? args.platforms : "x")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

for (const p of platforms) {
  if (!["x", "hn"].includes(p)) {
    console.error(`unknown platform: ${p}. choices: x,hn`);
    process.exit(2);
  }
}

let text = "";
if (typeof args.text === "string") text = args.text;
else if (typeof args.file === "string") text = await Bun.file(args.file).text();
else if (args.stdin) text = await Bun.stdin.text();
else {
  console.error("need --text, --file, or --stdin.");
  process.exit(2);
}
text = text.trim();
if (!text) {
  console.error("empty draft.");
  process.exit(2);
}

// Per-platform previews.
console.log(`=== draft preview (${text.length} chars source) ===\n`);

const platformChunks: Record<string, string[]> = {};
for (const p of platforms) {
  let chunks: string[];
  let limit: number;
  if (p === "x") {
    chunks = args.thread || text.length > 280 ? splitForX(text) : [text];
    limit = 280;
  } else {
    // HN: title only, derived from first line (or whole text trimmed to 80)
    const firstLine = text.split("\n")[0].trim();
    const title =
      typeof args["hn-title"] === "string"
        ? args["hn-title"]
        : firstLine.length <= 80
          ? firstLine
          : firstLine.slice(0, 77) + "...";
    chunks = [title];
    limit = 80;
  }
  platformChunks[p] = chunks;

  console.log(`--- ${p.toUpperCase()} (${chunks.length} post(s)) ---`);
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  [${i + 1}/${chunks.length}] (${chunks[i].length}/${limit}) ${chunks[i]}`);
  }
  if (p === "hn") {
    if (typeof args["hn-url"] === "string") console.log(`  url: ${args["hn-url"]}`);
    else
      console.log(
        `  WARN: HN selected but no --hn-url. Will submit as Ask HN with body = full draft text.`,
      );
  }
  console.log();
}

if (!args.send) {
  console.log(`(preview only. add --send to actually post to: ${platforms.join(", ")})`);
  process.exit(0);
}

// Fan-out send.
const scriptDir = `${import.meta.dir}/`;
const failures: { platform: string; err: string }[] = [];

for (const p of platforms) {
  console.log(`\n=== sending to ${p} ===`);
  let cmd: string[];

  if (p === "x") {
    const chunks = platformChunks.x;
    cmd = ["bun", "run", `${scriptDir}post-x.ts`, "--yes"];
    if (chunks.length > 1) cmd.push("--thread");
    cmd.push(`--text=${text}`);
  } else {
    // hn
    const title = platformChunks.hn[0];
    cmd = ["bun", "run", `${scriptDir}post-hn.ts`, "--yes", `--title=${title}`];
    if (typeof args["hn-url"] === "string") {
      cmd.push(`--url=${args["hn-url"]}`);
    } else {
      cmd.push(`--text=${text}`);
    }
  }

  const proc = Bun.spawn(cmd, { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) failures.push({ platform: p, err: `exit ${code}` });
}

if (failures.length) {
  console.error(`\n${failures.length} platform(s) failed: ${failures.map((f) => f.platform).join(", ")}`);
  process.exit(1);
}
console.log(`\nposted to all ${platforms.length} platform(s)`);
