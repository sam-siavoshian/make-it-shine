# Star Farming — high-leverage moves that aren't sleazy

"Star farming" sounds gross. But there's a legit version: make it easy for people who *would* star the repo if they found it, to find it. That's all this file is.

The user's rule: **only do these if they're earned.** Don't sprinkle badges to fill space. Don't fake a comparison table. Don't write a tweet about a repo that's not ready.

---

## Badges — when, what, and the strict rules

### When to include badges

Include a badge if and only if it answers a question a stranger would ask before installing:

| Question | Badge |
|---|---|
| Is this maintained? | last-commit |
| Does it actually build? | CI status |
| What version is this? | npm/crates/pypi version |
| What's the license? | license (if it's NOT MIT or unusual) |
| Is anyone using this? | stars (ONLY if >500) |
| Is there a community? | Discord / Twitter link |

### Banned badges

- "Made with ❤️"
- "PRs welcome" (just say it in the README)
- "Visitors counter" — meaningless, looks 2003
- "Awesome list" inclusion — fine to mention, not as a badge
- More than 6 badges in a row — that's salad

### Format

Use [shields.io](https://shields.io). Single line, under the H1, before the opener.

```markdown
[![CI](https://github.com/{{owner}}/{{repo}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{owner}}/{{repo}}/actions)
[![npm](https://img.shields.io/npm/v/{{pkg}})](https://www.npmjs.com/package/{{pkg}})
[![license](https://img.shields.io/github/license/{{owner}}/{{repo}})](LICENSE)
```

3 badges is plenty. 5 is the absolute max.

### How to check what to add

Run the audit. If `ci=missing`, don't add a CI badge — there's nothing to badge. Same for npm: only add a version badge if the package is actually published.

---

## Demo GIF / screenshot — the single biggest README upgrade

If the repo does **anything visible** (UI, CLI output, automation), a demo asset is the biggest hook you can add. It's worth more than 500 words of description.

### Detect-then-flag pattern

In the polish workflow:

1. Look for existing assets in `docs/`, `assets/`, `.github/`, `media/` (any `.gif`, `.png`, `.mp4`, `.webm`).
2. If found and relevant, embed in README under the opener.
3. If missing, add a placeholder comment in the README and tell the user in the final summary.

### Placeholder pattern

```markdown
<!-- TODO: add demo.gif (1280x720 ideal, <5MB).
     Record with QuickTime → File > New Screen Recording → trim to 8-12s.
     Convert with: ffmpeg -i demo.mov -vf "fps=15,scale=1280:-1" -c:v gif -q:v 8 demo.gif
     Save to docs/demo.gif and replace this block. -->
```

### What makes a good demo asset

- **Under 5MB.** GIF or short MP4. GitHub won't autoplay >5MB GIFs reliably.
- **Loop seamlessly.** First and last frame match.
- **8-12 seconds.** Long enough to show the value, short enough to repeat-watch.
- **No cursor jitter.** Make the demo deliberate.
- **Show the BEFORE → ACTION → AFTER.** Not just the after.

### Recording tips (give the user these in the final summary)

For macOS:
- QuickTime Player → File → New Screen Recording (Cmd+Shift+5 for selection)
- Use `peek` or `gifski` to convert MOV → GIF
- For CLI demos: use `asciinema` then `agg` to render to GIF

For Windows / Linux:
- `peek`, `ScreenToGif`, `OBS Studio`

---

## "Why this exists" hook — the first-3-lines move

Most READMEs start by describing what the tool IS. Better READMEs start by describing what HURTS without it.

### Bad opener

> Cursor Companion is a SwiftUI overlay that follows your cursor and responds to long-presses with voice input.

(What it is. Yawn. Skip.)

### Good opener

> Talking to AI agents is fine until you have to alt-tab to a chat window mid-task. Cursor Companion puts the agent in your cursor — long-press, talk, watch it click. No window switch, no copy-paste, no "and please do X with the selection."

The good opener:
- Names a specific friction ("alt-tab mid-task")
- Promises the outcome ("no window switch")
- Hints at the how, briefly ("long-press, talk, watch it click")

### Recipe

Write 3 candidate openers from Agent 5's "hook candidates" output. Pick the one that:
1. A target user would nod at within 5 seconds.
2. Doesn't start with the project name.
3. Doesn't use AI vocab (delve, robust, leverage, comprehensive).

If none of the 3 candidates work, ask Agent 5 to re-generate with more specificity.

---

## Compare table — when to add, how to do it honestly

### Add only if:

- There are ≥2 specific, named alternatives.
- The differences are real and verifiable, not marketing.
- You can name what the alternatives do BETTER too.

### Format

```markdown
## comparison

|  | {{this repo}} | {{alt 1}} | {{alt 2}} |
|---|---|---|---|
| {{trait}} | ✓ | ✗ | ✓ |
| {{trait}} | ✓ | ✓ | ✗ |
| {{trait}} | ~ partial | ✓ | ✓ |
| {{trait}} | $0 | $$ paid | $0 |

{{One honest paragraph after the table — mention something the alternatives do better. This is what builds trust.}}
```

### Anti-patterns

❌ A table where the user's column has all ✓ and competitors have all ✗.
   → Nobody believes that. Either you don't understand alternatives, or you're lying.

❌ Comparing to "other tools" or "the legacy approach" without naming them.
   → Cowardly. Either name names or skip the section.

### Skip the section entirely if:

- The project is too new or niche to have peers.
- You can't honestly say what alternatives do better.
- The whole table would just be "we exist, they don't."

---

## Share snippets — paste-ready promotion

Generate on request only. Don't auto-post anywhere. The user posts these themselves.

### X (Twitter) — 2 variants

Variant 1 — "shipped a thing":

```
i built {{thing}}.

{{1-line problem}}.
{{1-line solution}}.

{{1 specific detail that makes it concrete}}.

{{repo URL}}
```

Variant 2 — "interesting technical thing":

```
{{technical hook — e.g. "you can put a Claude agent inside the MacBook notch"}}

how it works: {{1-line how}}.

{{1 line on the gotcha or surprise}}.

code: {{repo URL}}
```

### Show HN

```
Title: Show HN: {{name}} – {{one-line description}}

Body:

Hi HN! I built {{name}} because {{specific friction}}.

It {{1-2 lines: what it does, how}}.

{{What's interesting technically — 2-3 lines}}.

{{What doesn't work yet — 1-2 lines. honesty wins on HN}}.

Repo: {{URL}}
Demo: {{GIF or video URL if available}}

Happy to answer questions.
```

### Reddit — r/MacApps, r/SwiftUI, r/programming, etc.

Subreddit-specific. Generally:

- Lead with the screenshot/GIF.
- Title: "I made [thing] – [what's interesting about it]"
- Body: short paragraph + repo link.
- DO NOT title with "Show HN" or post in r/programming if the project is small.

### Anti-patterns

❌ "Hi guys! 🚀 Just dropped this amazing new project 🔥🔥🔥 lmk what you think 👀"
❌ Tagging "@anthropicAI @vercel @nextjs" in tweets to fish for retweets
❌ Posting the same exact post to 10 subreddits in 1 hour

The honest version of star-farming is: ship something good, show it once, clearly, where the right people are.

---

## Final readiness check before declaring "polished"

Use this checklist in Phase 7:

- [ ] README first 3 lines hook (problem → solution → how/who)
- [ ] All install/run commands verified against actual repo
- [ ] At most 5 badges, all carry information
- [ ] Demo asset embedded OR TODO comment added with recording instructions
- [ ] Repo description set (≤100 chars, one sentence)
- [ ] 10-20 topics applied
- [ ] Homepage URL set (if exists) OR explicitly skipped
- [ ] LICENSE present (LICENSE file, not just "MIT" in README)
- [ ] .gitignore present and matches stack
- [ ] If comparison table: includes at least one thing alternatives do better
- [ ] Share snippets generated (if user asked)
- [ ] Social preview brief sent to user (1280×640, what to put on it)
