# Marketing copy (repo-tied)

Marketing here = copy for the repo itself. Hooks, taglines, one-liners, social blurbs, value props, alternatives framing. **NOT** landing pages, ad copy, email sequences, or pricing.

Use the same voice picked in Phase 3 (crisp or warm). Use the fresh-language scan from Phase 2.5 to avoid this-month's overused phrases.

## Deliverables

Output a single `MARKETING.md` (or inline if the user asks). Sections in order:

```markdown
# <project name>. marketing copy

## Hook (≤15 words)
<what hurts without it, what it gets you. Not "X is a Y for Z">

## One-liner / repo description (≤100 chars)
<lead with the verb, name the outcome>

## Tagline / sub-hook (≤80 chars)
<punchier riff, used on social>

## Value props (3, 1 line each)
1. <concrete outcome>
2. <concrete outcome>
3. <concrete outcome>

## Vs alternatives (only if named alternatives exist)
| | This | <alt 1> | <alt 2> |
| --- | --- | --- | --- |
| <axis> | <wins> | <neutral / honest> | <neutral / honest> |

## Social blurbs
- X (≤280): <text>
- Show HN title (≤80): <title>
```

If polish mode also picked → fold these into README:
- Hook → first 3 lines of README
- One-liner → GitHub repo `description`
- Social blurbs → Phase 7 share-snippet drafts

## Hook writing rules

1. **Name the pain, then the relief.** Bad: "tech-firehose is a multi-source aggregator." Good: "Tired of tab-hopping HN, Reddit, and Lobsters? One CLI, every source, ranked."
2. **Concrete > abstract.** Not "powerful" or "comprehensive." Name what specifically.
3. **No identity statements.** Skip "X is a Y for Z" openers. They read as filler.
4. **Cut adjectives.** Adjectives signal lack of conviction. State what it DOES, not what it IS.
5. **Permission to be funny.** Warm voice → wry/dry one-liners welcome. Crisp voice → still allow one sharp turn of phrase.
6. **Verb-first.** "Ship faster" beats "A platform that helps you ship faster."

## Tagline writing rules

- ≤80 chars hard.
- Punchier than the hook. Often the hook compressed.
- Works standalone (no "..." setup required).
- Used in social preview cards, X bio replacements, "made with" footers.

Examples (real shape, not copy):
- Crisp: `Self-hosted Plausible alternative. ~20MB binary. Stupid simple.`
- Warm: `the tool I built because alt-tabbing 5 dashboards every morning made me lose my mind`

## Value-prop rules

- 3 max. Three is the magic number. More = "we don't know what matters."
- Each one = a CONCRETE outcome the user gets, not a feature. "Cuts your CI time from 8min to 80s" beats "Faster CI".
- Ordered by importance. Top one is the strongest.
- If you can't fill 3 concrete outcomes from the actual code/repo, write fewer. Don't pad.

## Vs-alternatives rules

- Only include if there are real named alternatives. Not "vs traditional approaches" / "vs other tools".
- Be honest about what alternatives do BETTER. Defensive copy is detectable in 2 seconds and tanks credibility.
- Axes should be things the target user actually cares about, not vanity (stars, lines of code).
- 3 axes max. More = noise.

## Social blurb rules

**X (≤280)**:
- Lead with the hook OR a specific outcome.
- One link, end of post (or as part of the embed card).
- No "thread 🧵" unless you actually have a thread coming.
- No "1/n" without n posts queued.
- Skip hashtags (they read as desperate on builder-X).
- Skip "excited to share" / "thrilled to announce".

**Show HN title (≤80)**:
- Format: `Show HN: <project name> – <one-line of what it is>`.
- HN guideline: title should describe the artifact, not market it.
- No "I built", no "the easiest way", no "revolutionary".
- The dash is preferred (not colon after the name).

## Anti-patterns

- **AI vocab leaking in.** Delve, crucial, robust, leverage, foster, landscape, tapestry, navigate, unpack. NUKE.
- **"Industry-leading".** Skip. Nobody believes it.
- **"Effortlessly".** Cringe. The user knows it took effort.
- **Stacking adjectives.** "Modern, fast, simple, powerful tool." That's four lies in five words.
- **Em dashes.** Use commas/periods/parens instead.
- **Boilerplate framing.** "In today's fast-paced world..." / "Have you ever wondered..." / "Imagine if..."
- **Apologizing for the product.** "It's not perfect, but..." → either it ships or it doesn't.
