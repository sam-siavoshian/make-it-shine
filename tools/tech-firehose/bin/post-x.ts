#!/usr/bin/env bun
// Post a tweet to X via CDP attach to your running Brave.
//
// Setup (one time per Brave restart):
//   bash bin/browser-up.sh        # relaunches Brave with debug port + your real profile
//
// Then post:
//   bun run bin/post-x.ts --text="hello" --yes
//   bun run bin/post-x.ts --file=draft.md --thread --yes
//   bun run bin/post-x.ts --text="reply" --reply-to=https://x.com/jack/status/123 --yes

import {
  xPostViaCdp as xPostViaPlaywright,
  xPostThreadViaCdp as xPostThreadViaPlaywright,
} from "../x-cdp";
import { splitForX } from "../posters";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("post-x", "Post a tweet to X (CDP attach, uses your real Brave session)", [
    "--text=\"STR\"           Tweet text (<=280 chars)",
    "--file=PATH            Read text from file",
    "--stdin                Read text from stdin",
    "--thread               Split long text into a thread",
    "--reply-to=URL         Reply to tweet (full x.com/<user>/status/<id> URL)",
    "--timeout=MS           Per-step timeout (default 30000)",
    "--yes                  ACTUALLY POST (default is dry-run)",
    "--json                 Output result JSON",
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

if (!args.thread && text.length > 280) {
  console.error(`text is ${text.length} chars, max 280. add --thread to auto-split.`);
  process.exit(2);
}

const chunks = args.thread ? splitForX(text) : [text];

console.error(`\n=== DRAFT ${args.yes ? "(WILL POST)" : "(DRY RUN — pass --yes to post)"} ===`);
for (let i = 0; i < chunks.length; i++) {
  console.error(`\n--- tweet ${i + 1}/${chunks.length} (${chunks[i].length}/280) ---`);
  console.error(chunks[i]);
}
if (typeof args["reply-to"] === "string") {
  console.error(`\nreply to: ${args["reply-to"]}`);
}
console.error("");

if (!args.yes) {
  console.error("(dry run — add --yes to actually post)");
  process.exit(0);
}

const timeout = typeof args.timeout === "string" ? parseInt(args.timeout, 10) : undefined;

console.error(`attaching to Brave...`);
let results: { url: string }[];
try {
  if (chunks.length > 1) {
    results = await xPostThreadViaPlaywright(chunks);
  } else {
    const r = await xPostViaPlaywright({
      text: chunks[0],
      replyToUrl: typeof args["reply-to"] === "string" ? args["reply-to"] : undefined,
      timeoutMs: timeout,
    });
    results = [r];
  }
} catch (e) {
  const msg = (e as Error).message;
  console.error(`post failed: ${msg}`);
  process.exit(1);
}

if (args.json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (let i = 0; i < results.length; i++) {
    console.log(`posted ${i + 1}/${results.length}: ${results[i].url}`);
  }
}
