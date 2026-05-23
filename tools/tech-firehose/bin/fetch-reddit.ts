#!/usr/bin/env bun
// Fetch Reddit hot posts from one or more subs.

import { fromReddit } from "../sources";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";

const DEFAULT_SUBS = [
  "startups",
  "ycombinator",
  "sanfrancisco",
  "hackernews",
  "programming",
  "sideproject",
  "webdev",
];

if (
  helpHeader("fetch-reddit", "Reddit hot posts", [
    `--subs=a,b,c    Subreddits (default: ${DEFAULT_SUBS.join(",")})`,
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));
const subs = args.subs ? (args.subs as string).split(",").map((s) => s.trim()) : DEFAULT_SUBS;

const posts = await fromReddit(subs);
output(applyFilters(posts, args), args);
