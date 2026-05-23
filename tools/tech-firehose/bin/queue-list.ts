#!/usr/bin/env bun
// List queued posts.

import { listEntries, summarize, QUEUE_DIR, type Status } from "../queue";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("queue-list", "List queued posts", [
    "--status=pending|sent|failed|partial|all   default: pending",
    "--json    Output JSON array",
    "--id=ID   Show full details of one entry",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));
const status = typeof args.status === "string" ? (args.status as Status) : "pending";

if (typeof args.id === "string") {
  const { getEntry } = await import("../queue");
  const e = await getEntry(args.id);
  if (!e) {
    console.error(`not found: ${args.id}`);
    process.exit(1);
  }
  console.log(JSON.stringify(e, null, 2));
  process.exit(0);
}

const entries = await listEntries({ status });
if (args.json) {
  console.log(JSON.stringify(entries, null, 2));
  process.exit(0);
}

console.error(`# queue: ${QUEUE_DIR}`);
console.error(`# status filter: ${status}  (${entries.length} entries)\n`);
if (entries.length === 0) {
  console.error("(empty)");
} else {
  for (const e of entries) console.log(summarize(e));
}
console.error(`\nstatus key: ○ pending  ✓ sent  ◐ partial  ✗ failed`);
console.error(`details: bun run bin/queue-list.ts --id=<ID>`);
console.error(`drain:   bun run bin/queue-drain.ts --id=<ID> --yes  (or --all --yes)`);
