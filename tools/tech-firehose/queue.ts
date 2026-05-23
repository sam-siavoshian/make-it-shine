// queue.ts — file-backed post queue.
//
// Why a queue: posts are best sent deliberately, not at midnight after a long
// repo polish session. The agent can stage drafts during work; the user reviews
// and drains them when ready.
//
// Storage: ~/.config/tech-firehose/queue/<id>.json
// One file per queued post. Status field tracks pending/sent/failed/partial.

import { homedir } from "node:os";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const QUEUE_DIR =
  process.env.TECH_FIREHOSE_QUEUE_DIR ??
  join(homedir(), ".config", "tech-firehose", "queue");

export type Platform = "x" | "hn";
export type Status = "pending" | "sent" | "failed" | "partial";

export interface QueueEntry {
  id: string;
  createdAt: number; // unix sec
  text: string;
  platforms: Platform[];
  // Per-platform extras (only used if that platform selected):
  hnUrl?: string; // HN story URL; if absent, submitted as Ask HN with body=text
  hnTitle?: string; // explicit HN title; default = first line of text trimmed to 80
  source?: string; // free-form tag, e.g. "github-repo-polisher:my-repo"
  status: Status;
  // Per-platform results, populated by queue-drain:
  results?: Partial<Record<Platform, PlatformResult>>;
  sentAt?: number;
  lastError?: string;
}

export interface PlatformResult {
  ok: boolean;
  url?: string; // posted URL on success
  error?: string; // error message on failure
  at: number; // unix sec
}

async function ensureDir(): Promise<void> {
  if (!existsSync(QUEUE_DIR)) await mkdir(QUEUE_DIR, { recursive: true });
}

function newId(): string {
  // Short kebab id: time + 4 random hex chars.
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 0x10000)
    .toString(16)
    .padStart(4, "0");
  return `${t}-${r}`;
}

function pathFor(id: string): string {
  return join(QUEUE_DIR, `${id}.json`);
}

export async function addEntry(
  input: Omit<QueueEntry, "id" | "createdAt" | "status">,
): Promise<QueueEntry> {
  await ensureDir();
  const entry: QueueEntry = {
    id: newId(),
    createdAt: Math.floor(Date.now() / 1000),
    status: "pending",
    ...input,
  };
  await writeFile(pathFor(entry.id), JSON.stringify(entry, null, 2));
  return entry;
}

export async function getEntry(id: string): Promise<QueueEntry | null> {
  try {
    const raw = await readFile(pathFor(id), "utf8");
    return JSON.parse(raw) as QueueEntry;
  } catch {
    return null;
  }
}

export async function updateEntry(entry: QueueEntry): Promise<void> {
  await writeFile(pathFor(entry.id), JSON.stringify(entry, null, 2));
}

export async function removeEntry(id: string): Promise<boolean> {
  try {
    await unlink(pathFor(id));
    return true;
  } catch {
    return false;
  }
}

export async function listEntries(filter?: {
  status?: Status | "all";
}): Promise<QueueEntry[]> {
  await ensureDir();
  const files = (await readdir(QUEUE_DIR)).filter((f) => f.endsWith(".json"));
  const out: QueueEntry[] = [];
  for (const f of files) {
    try {
      const raw = await readFile(join(QUEUE_DIR, f), "utf8");
      const e = JSON.parse(raw) as QueueEntry;
      if (filter?.status && filter.status !== "all" && e.status !== filter.status) continue;
      out.push(e);
    } catch {
      // Skip malformed.
    }
  }
  out.sort((a, b) => a.createdAt - b.createdAt);
  return out;
}

export function summarize(entry: QueueEntry): string {
  const firstLine = entry.text.split("\n")[0].slice(0, 70);
  const stat = entry.status === "pending" ? "○" : entry.status === "sent" ? "✓" : entry.status === "partial" ? "◐" : "✗";
  return `${stat} ${entry.id}  [${entry.platforms.join(",")}]  ${firstLine}${entry.text.split("\n")[0].length > 70 ? "..." : ""}`;
}
