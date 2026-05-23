#!/usr/bin/env bun
// Submit to Hacker News via CDP attach to your running Brave.
// No HN_USER/HN_PASSWORD env vars needed — uses your real Brave session.
//
// Setup (one time per Brave restart, shared with post-x.ts):
//   bash bin/browser-up.sh
//
// Then submit:
//   # Story
//   bun run bin/post-hn.ts --title="Show HN: my tool" --url=https://github.com/me/x --yes
//
//   # Ask HN / Show HN with body
//   bun run bin/post-hn.ts --title="Ask HN: how do you ship?" --text="long-form question..." --yes
//
// Risks:
//   - HN may throttle / shadow-ban scripted submissions. Use sparingly.
//   - HN form structure can change. Selectors are simple (input[name=title/url/text]) so quite stable.
//   - Title rules apply: <=80 chars, no clickbait.

import { hnSubmitViaCdp } from "../hn-cdp";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("post-hn", "Submit to Hacker News (CDP attach, uses your real Brave HN session)", [
    "--title=\"STR\"     Submission title (1-80 chars, REQUIRED)",
    "--url=URL         Story URL (story submission)",
    "--text=\"STR\"      Body text (Ask HN / Show HN with body)",
    "--text-file=PATH  Read body text from file",
    "--timeout=MS      Per-step timeout (default 30000)",
    "--yes             ACTUALLY POST (default is dry-run)",
    "--json            Output result JSON",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));

const title = typeof args.title === "string" ? args.title : "";
if (!title) {
  console.error("--title is required.");
  process.exit(2);
}
if (title.length > 80) {
  console.error(`title is ${title.length} chars, max 80.`);
  process.exit(2);
}

const url = typeof args.url === "string" ? args.url : undefined;
let text: string | undefined;
if (typeof args.text === "string") text = args.text;
else if (typeof args["text-file"] === "string")
  text = (await Bun.file(args["text-file"]).text()).trim();

if (!url && !text) {
  console.error("need --url (story) or --text/--text-file (Ask HN).");
  process.exit(2);
}
if (url && text) {
  console.error("--url and --text are mutually exclusive on HN.");
  process.exit(2);
}

console.error(`\n=== DRAFT ${args.yes ? "(WILL POST)" : "(DRY RUN — pass --yes to post)"} ===`);
console.error(`title: ${title}`);
if (url) console.error(`url:   ${url}`);
if (text) {
  console.error(`text:`);
  console.error(text);
}
console.error("");

if (!args.yes) {
  console.error("(dry run — add --yes to actually post)");
  process.exit(0);
}

const timeout = typeof args.timeout === "string" ? parseInt(args.timeout, 10) : undefined;

console.error("attaching to Brave...");
let result;
try {
  result = await hnSubmitViaCdp({ title, url, text, timeoutMs: timeout });
} catch (e) {
  console.error(`submit failed: ${(e as Error).message}`);
  process.exit(1);
}

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`submitted: ${result.url}`);
  if (result.itemId) console.log(`item id: ${result.itemId}`);
  if (result.warning) console.error(`⚠ ${result.warning}`);
}
