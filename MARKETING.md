# make-it-shine. marketing copy

Source-of-truth for one-liners, social posts, and external messaging. Voice: crisp.

## Hook (≤15 words)
Polish your repo and post it to X + Show HN, all from one Claude Code skill. No API keys.

## One-liner / repo description (≤100 chars)
Polish a project for launch: README, marketing copy, social posting. Reads code first, no AI slop.

## Tagline / sub-hook (≤80 chars)
Polish + post your repo from one Claude Code skill. No API keys, no scraping.

## Value props (3, 1 line each)
1. Writes README from actual code via 5 parallel exploration agents. No hallucinated features.
2. Posts to X and Hacker News through your real Brave session via CDP. No API keys.
3. Queue model stages posts; you drain when ready. No midnight blasts.

## Vs alternatives
| | make-it-shine | hand-rolled README | other AI README tools |
| --- | --- | --- | --- |
| Grounded in actual code | yes (parallel explore agents) | yes (you do it) | usually no |
| Posts to X / Show HN | yes (CDP-attach to real Brave) | no | no |
| No API keys for posting | yes | no | no |
| Voice calibration vs current dev slang | yes (fresh-lang scan) | yes (your taste) | rarely |
| Effort to use | one command | hours | one command |

Honest: hand-rolled wins on care + intent for a single repo. make-it-shine wins on volume + consistency + post-side automation.

## Social blurbs

### X (≤280)
```
made-it-shine: claude code skill that polishes a repo and posts it to X + Show HN from your terminal

reads code with parallel agents, no hallucinated features
posts via CDP-attach to your real Brave session, no API keys
queue model so no midnight blasts

https://github.com/sam-siavoshian/make-it-shine
```

### Show HN title (≤80)
```
Show HN: make-it-shine – polish your repo and post it from one Claude Code skill
```

### Show HN body (used if posting as Ask HN)
```
Two artifacts in one repo:

1. A Claude Code skill that polishes a GitHub repo: reads the code with parallel exploration agents, then writes README/LICENSE/topics/description grounded in what it actually found. Includes a fresh-language scan of recent HN+Reddit+dev.to titles to avoid sounding like 2023.

2. A Bun CLI ("tech-firehose") that reads tech news (HN, Reddit, Lobsters, PH, RSS) and posts back to X + Hacker News. No API keys: a one-time browser-up.sh relaunches Brave with debug port + your real profile, then post-x.ts and post-hn.ts attach via puppeteer-core CDP and drive the existing logged-in session.

Queue model means the skill stages posts but never auto-drains. You review and pull the trigger.

I built this to stop spending hours on each public launch. Reading code first beats both "let AI write your README" and "fight a template". The CDP-attach posting trick works around X paid API + HN missing API in one move.

Repo: https://github.com/sam-siavoshian/make-it-shine
```

## Anti-patterns to avoid in any copy
- AI vocab (delve, crucial, robust, leverage, foster, landscape)
- "Industry-leading", "best-in-class", "effortlessly"
- Em dashes (use commas, periods, or colons)
- "Excited to share", "thrilled to announce"
- Hashtag stacking (`#AI #devtools #automation`)
- "I built" in HN titles
