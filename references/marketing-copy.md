# Marketing copy (repo-tied)

Copy for the repo itself. Hooks, taglines, one-liners, social blurbs, value props, alternatives framing.

NOT: landing pages, ad copy, email sequences, pricing.

Use the voice from Phase 3. Use the fresh-language scan from Phase 2.5. The point of both: do not sound like every other AI-written repo.

## The bar

Writing should pass this test: would a real builder, on a Tuesday, screenshot this and DM it to a friend? If no, rewrite.

Five tells that mean you failed:
1. It reads like a press release.
2. Adjectives doing the heavy lifting.
3. The reader has no idea what hurts without the tool.
4. Sentences are all the same length.
5. Em dashes anywhere.

## Deliverable

One `MARKETING.md`. Or inline if user asks.

```markdown
# <project name>. marketing copy

## Hook (≤15 words)
<the pain. then the relief. one beat each.>

## One-liner / repo description (≤100 chars)
<lead with the verb. name the outcome.>

## Tagline / sub-hook (≤80 chars)
<punchier riff. works alone.>

## Value props (3, 1 line each, concrete outcomes)
1. <outcome with a real number or named comparison>
2. <outcome with a real number or named comparison>
3. <outcome with a real number or named comparison>

## Vs alternatives (only if named alternatives exist)
| | This | <alt 1> | <alt 2> |
| --- | --- | --- | --- |
| <axis> | <wins> | <neutral, honest> | <neutral, honest> |

## Social blurbs
- X (≤280): <text>
- Show HN title (≤80): <title>
```

If polish mode is on too, fold into the README:
- Hook → first 3 lines of README
- One-liner → GitHub repo description field
- Social blurbs → Phase 7 share-snippet drafts

## Writing rules (non-negotiable)

Per the user's CLAUDE.md:

- **No em dashes.** Commas, periods, parens, or "..." Always.
- **No AI vocab.** Nuke on sight: delve, crucial, robust, leverage, foster, landscape, tapestry, comprehensive, nuanced, multifaceted, furthermore, moreover, additionally, pivotal, underscore, seamlessly, effortlessly, holistic, navigate (as a verb), unpack.
- **No banned phrases.** "Here's the kicker", "here's the thing", "plot twist", "let me break this down", "the bottom line", "make no mistake", "can't stress this enough", "excited to share", "thrilled to announce".
- **Short paragraphs.** Mix one-sentence paragraphs with 2-3 sentence runs.
- **Type fast.** Incomplete sentences sometimes. "Wild." "Not great." Parentheticals.
- **Name specifics.** Real file names. Real function names. Real numbers. "Cuts CI from 8min to 80s" beats "much faster".
- **Be direct.** "Well-designed" or "this is a mess." Don't dance around judgments.
- **Punchy standalone sentences.** "That's it." "This is the whole game."
- **End with the action.** Give the user the next step.

## Hook patterns that work

### Pattern: "Tired of X? Y."

```
Tired of alt-tabbing 5 dashboards every morning? One CLI. Every source. Ranked.
```

Pain first. Relief second. The reader sees themselves in the first sentence before the pitch lands.

### Pattern: "I kept doing X. So I built Y."

```
I kept submitting Show HNs at 2am after a polish session. Built this so I'd stop. Stages the post, you drain it morning.
```

Personal origin. Concrete behavior. The fix.

### Pattern: "X said it would Y. Mine actually Z."

```
Every AI README tool promised to read my code. None of them did. This one runs 5 parallel agents and quotes the actual file paths.
```

Calls out the category's failure. Then shows the diff.

### Pattern: "The trick is Z."

```
The trick: attach puppeteer-core to a Brave you launched with --remote-debugging-port=9222 + your real profile. No API keys. No scraping. No password env vars.
```

For technical readers. Lead with the mechanism that's interesting.

### Pattern: counter-intuitive

```
The best part of automation is the part where you don't automate. This skill stages your post but refuses to send it.
```

Surprises the reader. Then explains why.

## Anti-patterns (with rewrites)

| Bad | Why bad | Better |
|-----|---------|--------|
| "A comprehensive solution that leverages cutting-edge AI to seamlessly..." | All five tells at once | "Reads your repo with 5 parallel agents. Writes the README from what they actually found." |
| "tech-firehose is a multi-source dev news aggregator." | Identity statement. Filler. | "HN, Reddit, Lobsters, PH, RSS in one stream. Dedup + rank built in." |
| "Effortlessly post to X and Hacker News!" | Lies (it took effort to set up), uses banned word | "Posts to X + HN through your real Brave. No API keys. Run `bash bin/browser-up.sh` once." |
| "Powerful, flexible, modern, easy-to-use." | Four adjectives, zero content | Pick the most surprising specific thing. Just say that. |
| "Excited to share my new project!" | Banned phrase. Self-focus. | Skip. Start with the hook. |
| "make-it-shine — polish your repo with AI" | Em dash + vague | "make-it-shine: polish your repo, then post it. No AI slop in the output." |
| "Imagine if you could ship your repo in one command." | Boilerplate framing | "One command ships the repo: README, LICENSE, topics, Show HN draft. All grounded in your actual code." |

## Tagline writing rules

- ≤80 chars hard cap.
- Punchier than the hook. Often the hook compressed.
- Standalone. No "..." setup required.
- Used on social preview cards, X bio, "made with" footers.

Examples (shape, not content):
- Crisp: `Self-hosted Plausible alternative. 20MB binary. Stupid simple.`
- Warm: `the tool I built because alt-tabbing 5 dashboards was making me insane`
- Crisp: `Polish your repo, then post it. From one Claude Code skill.`
- Warm: `i polished 47 of my repos with this and stopped hating my own GitHub page`

## Value-prop rules

- 3 max. More = "we don't know what matters."
- Each = a concrete outcome with a number or named comparison.
- "Cuts CI from 8min to 80s" beats "Faster CI".
- "2.4× faster than FlashAttention-2" beats "much faster than existing solutions".
- Top one = strongest.
- If you can't fill 3 concrete outcomes, write fewer. Don't pad.

Bad: `1. Fast 2. Flexible 3. Easy to use`
Better: `1. Polishes a repo in 3 minutes (5-agent parallel explore + write) 2. Posts to X+HN with no API keys (puppeteer-core CDP to your Brave) 3. Queue model: stages drafts, you drain on your schedule`

## Vs-alternatives rules

- Only if named alternatives exist. "Vs traditional approaches" / "vs other tools" is filler.
- Be honest about what they do BETTER. Defensive copy is sniffed out instantly + tanks credibility.
- 3 axes max.
- Axes = things the target user actually cares about. Not vanity (stars, lines of code).

Example shape:

| | make-it-shine | hand-rolled README | other AI README tools |
|---|---|---|---|
| Grounded in code | yes (5 parallel explore) | yes (you do it) | usually no |
| Posts X/HN | yes (CDP-attach Brave) | no | no |
| Effort to use | one command | hours | one command |

Note the honest middle column. Hand-rolled wins on intent for a single repo.

## Social blurb rules

### X (≤280)

- Lead with the hook OR a specific outcome.
- Lower-case OK. Builder-X is casual.
- One link. End of post. Or via embed card.
- Skip "thread 🧵" unless a thread is queued.
- Skip "1/n" unless n posts queued.
- Skip hashtags. They read as desperate on builder-X.
- Skip "excited to share" / "thrilled to announce" / "just shipped".
- Numbers > adjectives.
- Real handles via @ when relevant.

### Show HN title (≤80)

Format: `Show HN: <project name> – <one-line of what it is>`

- HN guideline: title describes the artifact, doesn't market it.
- No "I built".
- No "the easiest way".
- No "revolutionary".
- The en-dash (`–`) is preferred over colon after the name.
- Stating venue (`NeurIPS 2024`) or stack (`(Rust)`) is fine and earns trust.

### Show HN body (used if Ask HN, or if URL submission needs more context)

Structure that actually works on HN:
1. **What it does** (1-2 sentences, concrete)
2. **Why it exists** (the itch you scratched, personal, not a market analysis)
3. **The non-obvious mechanism** (the part that's interesting to other builders)
4. **Limitations** (declared, not hidden — this is where you buy credibility)
5. **What you want from HN** (feedback on X, would Y be useful, etc.)

Skip the "I'd love your feedback" closer. Show the limitations and the question is implicit.

## Calibration: the launch-tweet test

Before you ship a social blurb, ask:

1. Does the first sentence make a real builder stop scrolling? If not, rewrite.
2. Could a reader explain the project to a friend after reading once? If not, the hook is wrong.
3. Is there a specific number, named comparison, or surprising mechanism? If not, you're in adjective territory.
4. Would I send this to my own group chat? If no, AI slop is leaking in.

## The post-mortem cycle

After the user actually posts: note what got engagement and what fell flat. Save to `references/launch-postmortems.md` (create if missing) with:
- Project name
- Final post text
- Platform
- 24h numbers (likes / replies / installs)
- One sentence on what worked or didn't

This is how the skill gets sharper over time. Future runs read past postmortems to avoid repeating misses.
