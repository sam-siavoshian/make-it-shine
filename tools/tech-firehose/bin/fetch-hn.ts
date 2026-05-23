#!/usr/bin/env bun
// Fetch Hacker News posts. Top, new, best, show, ask, job.

import { fromHN } from "../sources";
import { topStories, newStories, bestStories, askStories, showStories, jobStories, items } from "../hn";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";
import type { Post } from "../sources";

if (
  helpHeader("fetch-hn", "Hacker News posts", [
    "--feed=top|new|best|show|ask|job|all  Default: all (top+show+ask+job)",
    "--count=N                              How many ids to fetch per feed (default 25)",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));
const feed = (args.feed as string) || "all";
const count = parseInt((args.count as string) || "25", 10);

const feedMap: Record<string, () => Promise<number[]>> = {
  top: topStories,
  new: newStories,
  best: bestStories,
  show: showStories,
  ask: askStories,
  job: jobStories,
};

let ids: number[] = [];
if (feed === "all") {
  ids = await fromHN().then((ps) => ps.map((p) => parseInt(p.id, 10)));
  // fromHN already returned full Post[], shortcut:
  const posts = await fromHN();
  output(applyFilters(posts, args), args);
  process.exit(0);
} else {
  const fn = feedMap[feed];
  if (!fn) {
    console.error(`unknown feed: ${feed}. choices: ${Object.keys(feedMap).join(",")},all`);
    process.exit(1);
  }
  ids = (await fn()).slice(0, count);
}

const its = await items(ids);
const posts: Post[] = its
  .filter((i) => i && !i.deleted && !i.dead && i.title)
  .map((i) => ({
    source: "hn",
    id: String(i.id),
    title: i.title!,
    url: i.url ?? `https://news.ycombinator.com/item?id=${i.id}`,
    permalink: `https://news.ycombinator.com/item?id=${i.id}`,
    author: i.by,
    score: i.score,
    comments: i.descendants,
    createdAt: i.time ?? 0,
    tags: [i.type ?? "story"],
  }));

output(applyFilters(posts, args), args);
