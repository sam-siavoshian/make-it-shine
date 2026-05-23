// Shared CLI helpers. Imported by every fetch-* script.

import type { Post } from "../sources";

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const a of argv) {
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) out[a.slice(2, eq)] = a.slice(eq + 1);
      else out[a.slice(2)] = true;
    }
  }
  return out;
}

export function applyFilters(
  posts: Post[],
  args: Record<string, string | boolean>,
): Post[] {
  let out = posts;
  if (typeof args.keyword === "string") {
    const kw = args.keyword.toLowerCase();
    out = out.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) || p.text?.toLowerCase().includes(kw),
    );
  }
  if (typeof args["min-score"] === "string") {
    const m = parseInt(args["min-score"], 10);
    out = out.filter((p) => (p.score ?? 0) >= m);
  }
  if (typeof args["since-hours"] === "string") {
    const h = parseFloat(args["since-hours"]);
    const cutoff = Math.floor(Date.now() / 1000) - h * 3600;
    out = out.filter((p) => (p.createdAt ?? 0) >= cutoff);
  }
  if (args.sort === "score") {
    out = out.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  } else if (args.sort === "recent") {
    out = out.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }
  // If --sort not given, preserve input order (source's natural ranking).
  if (typeof args.limit === "string") {
    out = out.slice(0, parseInt(args.limit, 10));
  }
  return out;
}

export function timeAgo(ts: number): string {
  if (!ts) return "?";
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function output(posts: Post[], args: Record<string, string | boolean>) {
  if (args.json) {
    console.log(JSON.stringify(posts, null, 2));
    return;
  }
  if (args.ndjson) {
    for (const p of posts) console.log(JSON.stringify(p));
    return;
  }
  for (const p of posts) {
    const bits = [
      `[${p.source}]`,
      timeAgo(p.createdAt),
      p.score != null ? `↑${p.score}` : "",
      p.comments != null ? `💬${p.comments}` : "",
      p.author ? `@${p.author}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    console.log(`${bits}`);
    console.log(`  ${p.title}`);
    console.log(`  ${p.url}`);
    if (p.permalink && p.permalink !== p.url) console.log(`  (${p.permalink})`);
    console.log();
  }
  console.error(`\n${posts.length} posts`);
}

export function helpHeader(name: string, desc: string, flags: string[]): boolean {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log(`${name} — ${desc}\n`);
    console.log("Usage:");
    console.log(`  bun run bin/${name}.ts [flags]\n`);
    console.log("Flags:");
    for (const f of flags) console.log(`  ${f}`);
    console.log("\nCommon flags (all scripts):");
    console.log("  --json              Output JSON array");
    console.log("  --ndjson            Output one JSON object per line");
    console.log("  --limit=N           Cap result count");
    console.log("  --keyword=STR       Filter title/text contains STR");
    console.log("  --min-score=N       Filter score >= N");
    console.log("  --since-hours=N     Only posts within last N hours");
    console.log("  --sort=score|recent Default recent");
    console.log("  --help              This help");
    return true;
  }
  return false;
}
