# tech-firehose

CLI tools to **read** tech content (HN, Reddit, Lobsters, Product Hunt, RSS) and **post** to X and Hacker News from your terminal.

No API keys for posting. Browser session via CDP attach to your real Brave.

## Quickstart

```bash
cd "/Users/samsiavoshian/Desktop/Coding Stuff/Scripts Stuff/tech-firehose"

# Read
bun run bin/fetch-hn.ts --json --limit=20
bun run bin/fetch-all.ts --since-hours=24 --limit=50 --json

# Post (one-time setup)
bash bin/browser-up.sh
# Then:
bun run bin/post-x.ts --text="hello" --yes
bun run bin/post-hn.ts --title="Show HN: my tool" --url=https://github.com/me/x --yes
```

## Scripts

### Read

| Script | What | Source |
|--------|------|--------|
| `bin/fetch-hn.ts` | Hacker News | hacker-news.firebaseio.com |
| `bin/fetch-reddit.ts` | Reddit hot posts | reddit.com/r/X/hot.json |
| `bin/fetch-lobsters.ts` | Lobsters hottest | lobste.rs/hottest.json |
| `bin/fetch-ph.ts` | Product Hunt | Algolia public index |
| `bin/fetch-rss.ts` | Any RSS/Atom feed | generic |
| `bin/fetch-all.ts` | All of the above, ranked + deduped | all |

### Write

| Script | What | Platform | Auth |
|--------|------|----------|------|
| `bin/draft-post.ts` | Preview a draft, auto-split per platform, optional fan-out send | x / hn | — |
| `bin/post-x.ts` | Post a tweet (CDP-attach to Brave, no API key) | X | browser session |
| `bin/post-hn.ts` | Submit a story or Ask HN (CDP-attach, no password) | Hacker News | browser session |
| `bin/browser-up.sh` | One-time: relaunch Brave with `--remote-debugging-port=9222` + your real profile | X / HN | — |

All write scripts default to **dry-run preview**. Pass `--yes` to actually send.

### Queue (staged posts)

| Script | What |
|--------|------|
| `bin/queue-add.ts` | Enqueue a draft (text + platforms + per-platform extras) |
| `bin/queue-list.ts` | List queued entries (pending by default; `--status=all`/`sent`/`failed`/`partial`) |
| `bin/queue-drain.ts` | Send pending entries. `--id=ID`, `--all`, `--retry-failed`, `--rate=N` |
| `bin/queue-clear.ts` | Remove entries (`--id`, `--status=sent`, `--all`) |

Queue at `~/.config/tech-firehose/queue/` (one JSON file per post). Override `TECH_FIREHOSE_QUEUE_DIR=/path`. Status: pending / sent / partial / failed. Retry partial+failed with `queue-drain --retry-failed --yes` — succeeded platforms auto-skip.

## Common flags (every script)

| Flag | Default | What |
|------|---------|------|
| `--json` | off | Output JSON array (machine-readable) |
| `--ndjson` | off | One JSON object per line |
| `--limit=N` | unlimited | Cap result count |
| `--keyword=STR` | none | Title/text contains STR (case-insensitive) |
| `--min-score=N` | 0 | Filter score >= N |
| `--since-hours=N` | unlimited | Only posts within last N hours |
| `--sort=score\|recent` | source default | Re-sort results |
| `--help` | — | Print usage |

## Script-specific flags

### fetch-hn
- `--feed=top|new|best|show|ask|job|all` — default `all` (top + show + ask + job)
- `--count=N` — ids per feed (default 25)

### fetch-reddit
- `--subs=a,b,c` — default `startups,ycombinator,sanfrancisco,hackernews,programming,sideproject,webdev`

### fetch-rss
- `--preset=yc-blog|techcrunch|devto|hackernoon`
- `--url=URL` — custom
- `--name=NAME` — optional label
- `--all-presets` — fetch every preset and merge

### fetch-all
- `--sources=a,b` — subset of `hn,lobsters,reddit,ph,rss`
- `--rank=blend|recent|score` — default blend (recency × 5 + log10(score))

### post-x
- `--text` / `--file` / `--stdin` — source the text
- `--thread` — auto-split >280 chars
- `--reply-to=URL` — reply (full x.com/<user>/status/<id> URL)
- `--timeout=MS` — per-step timeout (default 30000)
- `--yes` — actually post

### post-hn
- `--title="STR"` — REQUIRED, ≤80 chars
- `--url=URL` — story submission
- `--text="STR"` or `--text-file=PATH` — Ask HN / Show HN body (mutually exclusive with `--url`)
- `--timeout=MS` — default 30000
- `--yes` — actually post

### draft-post
- `--text` / `--file` / `--stdin` — source the draft
- `--platforms=x,hn` — default `x`
- `--thread` — force split even if under limit
- `--send` — fan out + post to each platform
- `--hn-url=URL` — HN story URL if HN selected (absent = Ask HN body=draft)
- `--hn-title="STR"` — override default title

## Auth for posting

### X + HN (both via Brave session)

```bash
bash bin/browser-up.sh
```

One-time per Brave restart. Relaunches Brave with `--remote-debugging-port=9222` using your real profile (real X login, real HN login). Both post scripts attach via puppeteer-core CDP.

**Requirements:**
- Brave installed at `/Applications/Brave Browser.app`
- Already logged in to X (x.com) and HN (news.ycombinator.com) in that Brave profile

If your default browser isn't Brave, set: `BRAVE_BIN=/path/to/binary BRAVE_PROFILE=/path/to/profile`.

## Posting safety model

- **Dry-run by default.** Every post command shows a preview and exits unless `--yes` is passed.
- **No auto-post on drift.** `draft-post` preview is read-only. Only `--send` subprocesses the per-platform `--yes` scripts.
- **Length validated up-front.** Over-limit posts without `--thread` exit non-zero **before** browser attach.
- **Reply targets verified.** `--reply-to` checks the target exists first.
- **Fan-out is sequential, not transactional.** Queue marks `partial` if some platforms fail; `--retry-failed` re-sends only the failed ones.

## Per-platform notes & risks

### Hacker News
- **No official API.** CDP-attach to your real Brave session. Form selectors are dead-simple HTML (`input[name=title|url|text]`) so quite stable.
- HN throttles / shadow-bans scripted submissions. **No bulk posting** — one per day max. Script warns if HN redirects to `/newest` (sign of throttling).
- 2FA / login flow blocks: log in via the Brave window first to clear, then retry.
- Title rules (HN guidelines): no clickbait, no marketing copy, original headline if news article.
- ToS gray area.

### X (Twitter)
- **No API key.** CDP-attach to your real Brave session.
- Fragile to X UI changes. Selectors scoped to modal dialog to avoid mis-clicks.
- ToS gray area. Be human-paced. No bulk drains.
- No media upload implemented (text + thread only).

## Examples

```bash
# 1. What's hot on HN right now?
bun run bin/fetch-hn.ts --feed=top --limit=10

# 2. SF tech happenings in last 6h
bun run bin/fetch-reddit.ts --subs=sanfrancisco --since-hours=6

# 3. YC blog + TC + dev.to as one stream
bun run bin/fetch-rss.ts --all-presets --since-hours=48

# 4. AI mentions across everything, last day
bun run bin/fetch-all.ts --keyword=AI --since-hours=24 --limit=40

# 5. Pipe to jq for custom analysis
bun run bin/fetch-all.ts --json --since-hours=12 | jq '.[] | select(.score > 100) | .url'

# 6. One-shot tweet
bun run bin/post-x.ts --text="shipped a thing" --yes

# 7. Show HN
bun run bin/post-hn.ts \
  --title="Show HN: tech-firehose, multi-source dev news in one CLI" \
  --url=https://github.com/me/tech-firehose \
  --yes

# 8. Post a tweet thread
bun run bin/post-x.ts --file=long-draft.md --thread --yes

# 9. Queue workflow: stage now, drain later
bun run bin/queue-add.ts \
  --file=share.md \
  --platforms=x,hn \
  --hn-url=https://github.com/me/tech-firehose \
  --source=github-repo-polisher
bun run bin/queue-list.ts
bun run bin/queue-drain.ts --all --rate=30 --yes   # 30s between platform posts
bun run bin/queue-clear.ts --status=sent --yes
```

## Not supported (write side)

- **Bluesky**: removed (intentionally not supported).
- **Mastodon**: easy to add — per-instance access token.
- **Threads**: no public posting API.
- **LinkedIn**: paywalled posting API + manual app review.
- **Reddit**: needs full OAuth flow. Posting rate-limits make automation cumbersome.

## Post schema (read side)

```ts
interface Post {
  source: string;        // "hn" | "reddit/<sub>" | "lobsters" | "producthunt" | "rss/<name>"
  id: string;
  title: string;
  url: string;
  permalink: string;
  author?: string;
  score?: number;
  comments?: number;
  createdAt: number;     // unix seconds
  text?: string;
  tags?: string[];
}
```
