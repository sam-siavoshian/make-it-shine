# Voice — Crisp (Linear / Vercel / Bun)

For libraries, CLIs, SDKs, devtools, infrastructure. Audience: other engineers. They want to know what it is and whether to use it in under 30 seconds.

## Core rules

1. **Lowercase headers.** `## install` beats `## Installation`. Optional but a strong signal.
2. **Sentences, not slogans.** Lead with verbs and nouns. No "✨ The future of X ✨" lines.
3. **Information density.** Every line earns its rent. If a sentence doesn't add a fact, cut it.
4. **No personification.** The library doesn't "love" anything. It "returns" things.
5. **Code blocks over prose** for anything install-y, configurable, or callable. A 4-line snippet beats a 4-paragraph explanation.
6. **Em dashes BANNED.** Use commas, periods, parentheses, colons.
7. **Banned phrases (Sam's house rules + AI tells):**
   - "comprehensive", "robust", "leverage", "delve", "crucial", "nuanced",
   - "underscore", "foster", "landscape", "tapestry", "pivotal",
   - "Here's the kicker", "Here's the thing", "Let me break this down",
   - "Welcome to ...", "Made with ❤️", "powered by AI"
8. **Acronyms unexplained on first use are fine** if the audience knows them. `LSP`, `AST`, `JIT` — fine for a devtool. Spell out only if mixed audience.
9. **Names matter.** Use real type/module names from the code. `IntentRouter.tryHandle` beats "the routing system."

## Opening hook formula

Three sentences, three jobs:

```
[Sentence 1: what the thing is, in plain category terms]
[Sentence 2: the specific problem it solves, with a concrete pain]
[Sentence 3: one differentiator or how it works, in a phrase]
```

### Good openers (study these)

**Bun** (real-world):
> Bun is a fast all-in-one JavaScript runtime. Bundler, test runner, npm-compatible package manager, all built in. Designed as a drop-in replacement for Node.js.

**Astro** (real-world):
> Astro is the web framework for content-driven websites. Astro powers the world's fastest marketing sites, blogs, ecommerce websites, and so much more.

**Drizzle ORM** (real-world):
> Drizzle is a headless TypeScript ORM. If you know SQL, you know Drizzle.

### Generated examples (for repos like Sam's)

For a notch-mounted computer-use agent:
> Agent in the Notch puts a Claude-driven computer-use agent inside the MacBook notch. Long-press the cursor companion, speak, watch the agent click. No menu bar icon, no dock app, no window — it lives in the empty space above your screen.

For a CLI tool that polishes repos:
> make-it-shine reads your repo with parallel subagents, then rewrites your README, tags, and description. Direct commits, no AI slop, no badge salad. One command, your public page stops looking abandoned.

## Section ordering (crisp)

```
1. one-line description right under the title
2. opener (3 sentences max)
3. badges (only if they carry info)
4. install / quickstart (code block)
5. example usage (code block, 5-15 lines)
6. how it works (3-6 bullets or a short paragraph) — only if non-obvious
7. configuration / API (terse, link out for full docs if needed)
8. compatibility / requirements
9. comparison (only if there are real alternatives)
10. license + author
```

Skip sections that don't apply. Don't pad.

## Voice examples (transformations)

### Description line

❌ "A truly innovative and comprehensive solution that leverages cutting-edge AI to revolutionize how you work with your terminal."

✅ "A terminal where Claude lives. Type a question or pipe stdout in — Claude reads the buffer and answers in-line."

### Install section

❌
```
## 📥 Getting Started

To begin your journey with this amazing tool, you'll first need to make sure you have all the prerequisites installed on your system. We highly recommend using the latest LTS version of Node.js for the best experience!

### Step 1: Clone the repository
First, clone this repository to your local machine.
...
```

✅
```
## install

```bash
bun add make-it-shine
# or: npm i make-it-shine
```

Requires Node 18+ or Bun 1.0+. Set `GITHUB_TOKEN` with `repo` scope.
```

### "How it works"

❌ "Our advanced algorithm utilizes state-of-the-art techniques to..."

✅ "Five Explore subagents run in parallel: entry point, stack, install path, layout, audience. Their outputs feed a README skeleton picked by length tier."

## Closing section

```
## license

MIT © [@user](https://github.com/user)
```

Add one optional line if the repo wants stars/contribs:
> "Star if this saved you a yak shave. PRs welcome."

That's it. Nothing more.
