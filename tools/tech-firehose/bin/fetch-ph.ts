#!/usr/bin/env bun
// Fetch Product Hunt posts (Algolia public index).

import { fromProductHunt } from "../sources";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";

if (helpHeader("fetch-ph", "Product Hunt latest", [])) process.exit(0);

const args = parseArgs(process.argv.slice(2));
const posts = await fromProductHunt();
output(applyFilters(posts, args), args);
