#!/usr/bin/env bun
// Fetch Lobsters hottest stories.

import { fromLobsters } from "../sources";
import { parseArgs, applyFilters, output, helpHeader } from "./_lib";

if (helpHeader("fetch-lobsters", "Lobsters hottest stories", [])) process.exit(0);

const args = parseArgs(process.argv.slice(2));
const posts = await fromLobsters();
output(applyFilters(posts, args), args);
