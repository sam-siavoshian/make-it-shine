#!/usr/bin/env bun
// Remove queued entries by id or by status.

import { listEntries, removeEntry, type Status } from "../queue";
import { parseArgs, helpHeader } from "./_lib";

if (
  helpHeader("queue-clear", "Remove entries from the queue", [
    "--id=ID                       Remove one entry",
    "--status=sent|failed|partial  Remove all entries with this status",
    "--all                         Remove EVERYTHING (be careful)",
    "--yes                         Confirm destructive removes (--status, --all)",
  ])
)
  process.exit(0);

const args = parseArgs(process.argv.slice(2));

if (typeof args.id === "string") {
  const ok = await removeEntry(args.id);
  console.log(ok ? `removed ${args.id}` : `not found: ${args.id}`);
  process.exit(ok ? 0 : 1);
}

if (args.all || typeof args.status === "string") {
  if (!args.yes) {
    console.error("destructive op. add --yes to confirm.");
    process.exit(2);
  }
  const filter = args.all ? { status: "all" as const } : { status: args.status as Status };
  const entries = await listEntries(filter);
  let removed = 0;
  for (const e of entries) {
    if (await removeEntry(e.id)) removed++;
  }
  console.log(`removed ${removed} entries`);
  process.exit(0);
}

console.error("need --id, --status, or --all. see --help.");
process.exit(2);
