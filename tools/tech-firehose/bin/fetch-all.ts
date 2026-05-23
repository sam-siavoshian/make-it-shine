#!/usr/bin/env bun
// Fetch everything in parallel. Dedup by URL. Rank by recency + score.

import {
  fromHN,
  fromLobsters,
  fromReddit,
  fromProductHunt,
  fromRSS,
  type Post,
} from "../sources";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";

const REDDIT_SUBS = [
  "startups",
  "ycombinator",
  "sanfrancisco",
  "hackernews",
  "programming",
  "sideproject",
  "webdev",
];

const RSS_FEEDS = [
  { name: "yc-blog", url: "https://www.ycombinator.com/blog/rss.xml" },
  { name: "techcrunch", url: "https://techcrunch.com/feed/" },
  { name: "devto", url: "https://dev.to/feed" },
  { name: "hackernoon", url: "https://hackernoon.com/feed" },
];

const ALL_SOURCES: Record<string, () => Promise<Post[]>> = {
  hn: fromHN,
  lobsters: fromLobsters,
  reddit: () => fromReddit(REDDIT_SUBS),
  ph: fromProductHunt,
  rss: async () => (await Promise.all(RSS_FEEDS.map((f) => fromRSS(f.name, f.url)))).flat(),
};

if (
  helpHeader("fetch-all", "Multi-source firehose (HN + Reddit + Lobsters + PH + RSS)", [
    `--sources=a,b   Subset (default: all = ${Object.keys(ALL_SOURCES).join(",")})`,
    "--rank=blend|recent|score   Default blend (recency*5 + log10(score))",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));
const wantSources = typeof args.sources === "string" ? args.sources.split(",") : Object.keys(ALL_SOURCES);
const rankMode = (args.rank as string) || "blend";

const t0 = Date.now();
const results = await Promise.all(
  wantSources.map(async (name) => {
    const fn = ALL_SOURCES[name];
    if (!fn) {
      console.error(`unknown source: ${name}`);
      return [];
    }
    try {
      return await fn();
    } catch (e) {
      console.error(`[${name}] err: ${(e as Error).message}`);
      return [];
    }
  }),
);
console.error(`fetched ${wantSources.length} sources in ${Date.now() - t0}ms`);

let posts = results.flat();

// Dedup by URL.
const seen = new Set<string>();
posts = posts.filter((p) => {
  const k = (p.url || "").replace(/[#?].*$/, "").replace(/\/$/, "");
  if (!k) return true;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// Rank.
if (rankMode === "blend") {
  const now = Math.floor(Date.now() / 1000);
  posts = posts
    .map((p) => {
      const ageHrs = (now - (p.createdAt || now)) / 3600;
      const recency = Math.max(0, 1 - ageHrs / 48);
      const scoreLog = Math.log10(1 + (p.score ?? 0));
      return { p, blend: recency * 5 + scoreLog };
    })
    .sort((a, b) => b.blend - a.blend)
    .map((x) => x.p);
} else if (rankMode === "score") {
  posts = posts.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
} else {
  posts = posts.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

// applyFilters handles keyword/min-score/since-hours/limit. Sort already done.
const { sort: _ignored, ...restArgs } = args;
output(applyFilters(posts, restArgs), args);
