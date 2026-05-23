#!/usr/bin/env bun
// Fetch arbitrary RSS feed(s).

import { fromRSS } from "../sources";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";

const PRESETS: Record<string, string> = {
  "yc-blog": "https://www.ycombinator.com/blog/rss.xml",
  techcrunch: "https://techcrunch.com/feed/",
  devto: "https://dev.to/feed",
  hackernoon: "https://hackernoon.com/feed",
};

if (
  helpHeader("fetch-rss", "RSS/Atom feed fetcher", [
    `--preset=NAME   Use built-in feed: ${Object.keys(PRESETS).join(",")}`,
    "--url=URL       Custom feed URL",
    "--name=NAME     Source label (optional, derived from URL)",
    "--all-presets   Fetch every built-in preset and merge",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));

let posts: Awaited<ReturnType<typeof fromRSS>> = [];

if (args["all-presets"]) {
  const results = await Promise.all(
    Object.entries(PRESETS).map(([name, url]) => fromRSS(name, url)),
  );
  posts = results.flat();
} else if (typeof args.preset === "string") {
  const url = PRESETS[args.preset];
  if (!url) {
    console.error(`unknown preset: ${args.preset}. choices: ${Object.keys(PRESETS).join(",")}`);
    process.exit(1);
  }
  posts = await fromRSS(args.preset, url);
} else if (typeof args.url === "string") {
  const name = (args.name as string) || new URL(args.url).hostname;
  posts = await fromRSS(name, args.url);
} else {
  console.error("need --preset, --url, or --all-presets. use --help.");
  process.exit(1);
}

output(applyFilters(posts, args), args);
