#!/usr/bin/env bun
// Enqueue a draft for later posting. Does NOT post.

import { addEntry, type Platform } from "../queue";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("queue-add", "Add a draft to the post queue", [
    "--text=\"STR\"       Draft text (mutually exclusive with --file/--stdin)",
    "--file=PATH        Read text from file",
    "--stdin            Read text from stdin",
    "--platforms=LIST   Comma-list: x,hn (REQUIRED)",
    "--source=\"STR\"     Free-form tag (e.g. github-repo-polisher:my-repo)",
    "--hn-url=URL       HN story URL (if HN selected; absent = Ask HN body=text)",
    "--hn-title=\"STR\"   HN title override (default: first line of text, 80-char trim)",
    "--json             Output result JSON",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));

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
  console.error("empty text.");
  process.exit(2);
}

if (typeof args.platforms !== "string") {
  console.error("--platforms required (csv of x,hn).");
  process.exit(2);
}
const platforms = args.platforms
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean) as Platform[];
for (const p of platforms) {
  if (!["x", "hn"].includes(p)) {
    console.error(`unknown platform: ${p}. choices: x,hn`);
    process.exit(2);
  }
}

const entry = await addEntry({
  text,
  platforms,
  source: typeof args.source === "string" ? args.source : undefined,
  hnUrl: typeof args["hn-url"] === "string" ? args["hn-url"] : undefined,
  hnTitle: typeof args["hn-title"] === "string" ? args["hn-title"] : undefined,
});

if (args.json) {
  console.log(JSON.stringify(entry, null, 2));
} else {
  console.log(`queued ${entry.id}  platforms=${platforms.join(",")}  ${text.split("\n")[0].slice(0, 70)}`);
  console.log(`drain: bun run bin/queue-drain.ts --id=${entry.id} --yes`);
}
