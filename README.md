# make-it-shine

Most repos ship looking abandoned: auto-generated README, no description, no topics, three rocket emojis, "Welcome to my project!" header. Then the same author tries to share it on X / Show HN with copy that screams AI: "comprehensive solution leveraging cutting-edge technology to seamlessly..."

This repo fixes both ends, in one Claude Code skill plus a CLI.

- **make-it-shine** (the skill) — polishes the repo. Reads code with parallel exploration subagents, writes a README grounded in actual functions, picks topics that GitHub indexes, generates LICENSE / .gitignore / CONTRIBUTING, all in per-step commits.
- **tech-firehose** (the CLI under `tools/`) — reads tech news (HN, Reddit, Lobsters, Product Hunt, RSS) and posts back to X + Hacker News using your real Brave session (no API keys, no scraping, no passwords).

Both refuse AI slop. Both run on Bun, zero secret-management for the post side.

## What's in the box

```
make-it-shine/
├── SKILL.md                    Claude Code skill entry point
├── scripts/                    bash helpers (detect, audit, fetch lang, enqueue posts)
├── references/                 voice guides, README skeletons, queue model
└── tools/tech-firehose/        CLI: fetch tech content + post to X/HN
```

## The skill

A Claude Code skill triggered by phrases like `polish this repo`, `ship this`, `make this shine`, `write marketing copy`, `Show HN for this`. Four modes, picked upfront via AskUserQuestion (combinable):

| Mode | What it does |
|------|--------------|
| **polish** | README + LICENSE + .gitignore + CONTRIBUTING + topics + description + issue templates, grounded in actual code |
| **marketing** | Repo-tied copy: hook, one-liner, tagline, value props, social blurbs |
| **research** | Paper variant: CITATION.cff, reproduce-the-paper README, academic voice, research topics |
| **social** | Enqueue X + Show HN share snippets via the tech-firehose queue (never auto-posts) |

The skill never writes a line that isn't in the actual code. 5 parallel `Explore` subagents map the repo first (entry points, stack, install/run, layout, target audience). Synthesis is cross-checked against files.

Before voice pick, the skill runs `scripts/fetch_lang_samples.sh` to pull recent HN + Reddit + dev.to titles for the topic. This calibrates against training-data slop. Result: writing that matches how devs are actually talking *this week*, not 2023.

### Install the skill

One command (via [skills.sh](https://www.skills.sh/) CLI):

```bash
npx skills add sam-siavoshian/make-it-shine
```

Auto-detects your agent (Claude Code, Cursor, Codex, GitHub Copilot, OpenCode, Gemini CLI, Cline, Windsurf, etc.) and installs there. Restart your agent. Trigger with any phrase from the description.

Manual install (Claude Code only):

```bash
git clone https://github.com/sam-siavoshian/make-it-shine ~/make-it-shine
mkdir -p ~/.claude/skills/make-it-shine
cp -R ~/make-it-shine/SKILL.md \
      ~/make-it-shine/scripts \
      ~/make-it-shine/references \
      ~/.claude/skills/make-it-shine/
```

The skill expects `tools/tech-firehose/` reachable for fresh-language scans + share-snippet posting. The default path is `~/Desktop/Coding Stuff/Scripts Stuff/tech-firehose`; override with `TECH_FIREHOSE_DIR=/your/path` in the shell.

## tech-firehose (CLI)

Standalone Bun CLI under `tools/tech-firehose/`. Two halves.

### Read side

```bash
cd tools/tech-firehose
bun install

# Single source
bun run bin/fetch-hn.ts --feed=top --limit=20 --json

# Everything in parallel, deduped + ranked
bun run bin/fetch-all.ts --since-hours=24 --limit=50
```

Sources: Hacker News (firebase API), Reddit (`/hot.json` per sub), Lobsters (`.json` endpoint), Product Hunt (Algolia public index), RSS (YC blog, TechCrunch, dev.to, hackernoon). All scripts return the same `Post` schema. Pipe `--json` for machine consumption.

| Script | Source |
|--------|--------|
| `bin/fetch-hn.ts` | Hacker News |
| `bin/fetch-reddit.ts` | r/startups, ycombinator, sanfrancisco, hackernews, programming, sideproject, webdev |
| `bin/fetch-lobsters.ts` | Lobsters hottest |
| `bin/fetch-ph.ts` | Product Hunt |
| `bin/fetch-rss.ts --preset=yc-blog\|techcrunch\|devto\|hackernoon` | RSS feeds |
| `bin/fetch-all.ts` | All of the above, ranked + deduped |

### Write side

```bash
# One-time per Brave restart (relaunches Brave with debug port + your real profile)
bash bin/browser-up.sh

# Post a tweet
bun run bin/post-x.ts --text="shipped a thing" --yes

# Submit to HN
bun run bin/post-hn.ts \
  --title="Show HN: tool name – one-line description" \
  --url=https://github.com/me/tool \
  --yes
```

**No API keys**. `bin/browser-up.sh` relaunches Brave with `--remote-debugging-port=9222` pointing at your real profile. `post-x.ts` and `post-hn.ts` attach via `puppeteer-core` CDP and drive the existing logged-in session. No passwords stored anywhere, no scraping, no token chain.

Why this exists: X API is paywalled. HN has no API. Cookie-scraping is fragile and ToS-gray. Driving a real browser via your real session is the most stable + least sketchy path.

### Queue (staged posts)

Long polish sessions ending at 2am shouldn't push a Show HN immediately. The queue lets you stage drafts, review, then drain when you choose.

```bash
bun run bin/queue-add.ts \
  --file=share.md \
  --platforms=x,hn \
  --hn-url=https://github.com/me/repo \
  --source=launch
bun run bin/queue-list.ts
bun run bin/queue-drain.ts --all --rate=30 --yes   # 30s between platform posts
bun run bin/queue-clear.ts --status=sent --yes
```

Queue lives at `~/.config/tech-firehose/queue/<id>.json`. Per-platform success/failure tracked. Partial failures retry just the failed platform.

The skill's social mode enqueues; it never auto-drains. You always pull the trigger.

## Requirements

- macOS (the Brave CDP path is macOS-specific; Linux works if you set `BRAVE_BIN`)
- [Brave Browser](https://brave.com/) installed (used for X + HN posting)
- [Bun](https://bun.sh/) ≥ 1.0 (for tech-firehose CLI)
- [GitHub CLI (`gh`)](https://cli.github.com/) (used by the skill for repo metadata)
- Claude Code (for the skill itself)

You can use just the CLI without the skill, and just the skill without the CLI's write side, but they're designed to work together.

## Design choices

- **No API keys for posting.** X's paid API and HN's missing-API problem are both bypassed by attaching to a real browser via CDP. Bring your own Brave + your own logins.
- **Read before write.** The skill never writes a README line that isn't grounded in actual exploration findings. Hallucinated features are the #1 thing that makes AI-written docs feel cheap.
- **Queue, never auto-post.** The skill stages, the user drains. Avoids midnight blasts and lets you review across multiple repos before a daily drain.
- **Per-platform truth.** HN form structure is dead-simple HTML (selectors are stable for years). X uses modal-scoped selectors with fallback strategies. Both fail loudly with actionable error messages when something breaks.
- **No deps for the read side, minimal for write.** RSS parsing is regex. HN + Reddit + Lobsters use plain `fetch`. Only `puppeteer-core` is added for CDP-attach.

## Limitations

- **macOS-first.** The Brave CDP launcher (`bin/browser-up.sh`) assumes `/Applications/Brave Browser.app`. Override with `BRAVE_BIN`/`BRAVE_PROFILE` env vars.
- **X UI changes break selectors.** Selectors are scoped to the modal dialog with fallback chains, but no guarantees. Run with `--headed` to debug.
- **HN throttles automation.** Use sparingly. One submission per day max. Script warns if HN redirects to `/newest` (sign of throttling).
- **No media upload on X.** Text + thread only. Add if you need it.
- **Bluesky removed.** Was supported, then removed. Add back if you want by mirroring `x-cdp.ts`.

## Contributing

PRs welcome. Run `bun install` in `tools/tech-firehose/` first. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).

Built by [@sam-siavoshian](https://github.com/sam-siavoshian). Star if useful.
