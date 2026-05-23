# Share queue workflow

The tech-firehose share queue lets the polish skill **stage** share snippets without sending them. The user reviews, edits, then drains the queue when they're ready to actually post.

Supported platforms: **X** and **Hacker News** (both via CDP-attached Brave session, no API keys).

## Why queue, not immediate post

- **No accidental midnight blasts.** A long polish session ending at 2am should not push a Show HN post immediately. Bad timing kills reach.
- **Bulk review.** If the user polished 3 repos in a day, they can review all 3 share snippets together, edit any that need work, then drain in one pass.
- **Re-runnable.** A failed post can be retried with `queue-drain --id=<id> --retry-failed` without re-typing the draft.
- **Multi-platform tracking.** Each entry tracks per-platform success/failure. Partial sends (X ok, HN failed) get marked `partial` and can be retried just for the failed platform.

## Files

Queue lives at `~/.config/tech-firehose/queue/<id>.json`. One JSON file per queued post. Status field: `pending` / `sent` / `partial` / `failed`.

Override location: `TECH_FIREHOSE_QUEUE_DIR=/custom/path`.

## CLI reference

| Command | What |
|---------|------|
| `bin/queue-add.ts --file=draft.md --platforms=x,hn --source=tag` | Enqueue a post |
| `bin/queue-list.ts` | List pending (default filter) |
| `bin/queue-list.ts --status=all` | List everything |
| `bin/queue-list.ts --id=ID` | Full details (JSON) of one entry |
| `bin/queue-drain.ts --id=ID` | Dry-run preview |
| `bin/queue-drain.ts --id=ID --yes` | Send one entry to its platforms |
| `bin/queue-drain.ts --all --yes` | Send every pending entry |
| `bin/queue-drain.ts --all --retry-failed --yes` | Re-send failed/partial too |
| `bin/queue-drain.ts --id=ID --platforms=x --yes` | Restrict to subset of platforms |
| `bin/queue-drain.ts --all --rate=30 --yes` | Sleep 30s between platform posts |
| `bin/queue-clear.ts --id=ID` | Remove one entry |
| `bin/queue-clear.ts --status=sent --yes` | Drop all successfully-sent entries |

## How the skill uses it (Phase 7)

1. Polish work completes. Repo is shipped.
2. Agent drafts a share snippet matching the picked voice + fresh-language scan.
3. Snippet written to `/tmp/share-<repo>.md`.
4. Agent calls `scripts/post_share_snippets.sh /tmp/share-<repo>.md <repo-url> <platforms-csv>`.
5. Script enqueues + prints entry ID + drain command.
6. Agent shows the user the entry ID and the exact drain command.
7. User edits the snippet (queue entry text is editable — just edit the JSON file directly) or drains.

**Agent must NEVER auto-drain.** Always print the drain command and let the user decide when.

## Editing a queued draft

The text lives in the JSON file. User can:
- Edit directly: `vim ~/.config/tech-firehose/queue/<id>.json`
- Or remove + re-add: `bun run bin/queue-clear.ts --id=ID && bun run bin/queue-add.ts ...`

## Per-platform extras stored in the entry

| Field | Used by | What |
|-------|---------|------|
| `hnUrl` | hn | story URL (absent = submitted as Ask HN with body=text) |
| `hnTitle` | hn | title override (default: first line trimmed to 80) |
| `source` | tracking | free-form tag for traceability |

## When draining fails

- **X or HN** debug port unreachable → run `bash bin/browser-up.sh` (one-time per Brave restart, shared by both).
- **X session** not logged in → log in to x.com via the Brave window, then retry.
- **HN session** not logged in → log in to news.ycombinator.com via the Brave window, then retry.

Failed entries are kept (status=failed) for retry. Use `--retry-failed` on the next drain. Already-succeeded platforms auto-skip.

## Rate limits / etiquette

- HN: NO bulk submissions. One per day, max. HN throttles + shadow-bans automation. Script warns if redirected to `/newest`.
- X: ToS gray area. Don't drain 20 queued tweets back-to-back. Use `--rate=60` between sends for safety, or drain manually one at a time.

## Anti-patterns

- **Auto-draining without user confirmation.** Never. The whole point of the queue is human-in-the-loop.
- **Enqueuing duplicates.** Check `queue-list` before re-running `post_share_snippets.sh` on the same repo.
- **Posting to HN for low-effort repos.** HN guidelines matter. Only submit if the project meets Show HN criteria (working, on-topic, original). Skill should refuse HN platform for repos that obviously don't qualify.
