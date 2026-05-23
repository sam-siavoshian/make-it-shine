# README Skeletons — length-adaptive templates

Pick **one** skeleton at Phase 3. The right answer is the shortest one that still answers a stranger's questions.

Default to **1-page** if unsure. It's the right call ~70% of the time.

---

## Skeleton A — 4-line README (joke repos, single-file scripts)

Use when:
- Repo is a single script or one-file utility.
- The "how to use" fits in one shell command.
- The README is a wink, not docs.

```markdown
# {{name}}

{{one-line description}}

```bash
{{one-line usage}}
```

MIT. By [@{{user}}](https://github.com/{{user}}).
```

That's it. Four lines (plus blanks). Real-world examples: `cmatrix`, `cowsay`, any "do one thing" Unix utility.

---

## Skeleton B — 1-page README (the default, ~80-200 lines)

Use for: CLIs, libraries, SDKs, most side projects, most hackathon repos.

```markdown
# {{name}}

{{one-line description — ≤90 chars, ends in a period}}

{{3-sentence opener — pick voice from voice-crisp.md or voice-warm.md}}

<!-- demo asset goes here if visual. e.g.:
<p align="center"><img src="docs/demo.gif" width="640" alt="demo"></p>
-->

## install

```{{lang}}
{{exact install command from Agent 3's findings}}
```

{{prereqs paragraph — 1-3 lines. tools, versions, env vars.}}

## quickstart

```{{lang}}
{{5-15 line snippet showing the primary user-facing flow}}
```

## how it works

{{3-6 bullets OR one short paragraph — only if non-obvious. Skip section if the quickstart is self-explanatory.}}

- {{bullet 1 — a real internal mechanism, not marketing}}
- {{bullet 2}}
- {{bullet 3}}

## configuration

{{terse — env vars, flags, config keys. table OR bullets. Link out for full reference if it gets long.}}

| Key | What it does | Default |
|---|---|---|
| `{{KEY}}` | {{1-line purpose}} | `{{default}}` |

## requirements

{{2-5 lines. OS, runtime versions, services needed.}}

## license

MIT © [@{{user}}](https://github.com/{{user}})
```

### What to drop if the section is empty

- No real config? Drop "configuration."
- Quickstart is self-explanatory? Drop "how it works."
- One platform only? Fold requirements into install paragraph.

The skeleton is a max, not a min. Cut sections, don't pad them.

---

## Skeleton C — Multi-section README (~200-500 lines)

Use for: frameworks, products with multiple personas, anything contributors and integrators both touch.

```markdown
# {{name}}

{{tagline ≤90 chars}}

{{2-paragraph opener: problem + outcome + how it works in one line}}

<!-- hero asset: GIF, screenshot, or architecture diagram -->

## why

{{2-3 short paragraphs: the problem in the wild, the status-quo solutions, why those fall short, the wedge this takes.}}

## quickstart

```{{lang}}
{{minimum-to-feel-it commands}}
```

{{1-paragraph "what just happened"}}

## features

- **{{feature 1}}** — {{1-line}}
- **{{feature 2}}** — {{1-line}}
- **{{feature 3}}** — {{1-line}}
- **{{feature 4}}** — {{1-line}}

{{Cap at 6-8 bullets. If more, group into 2-3 buckets.}}

## how it works

{{3-7 paragraphs OR a labelled diagram. Use the architecture sketch from Agent 2. Name the real modules.}}

```
{{ASCII diagram if useful}}
```

## install + setup

```{{lang}}
{{install commands}}
```

### prereqs

{{bulleted list}}

### configuration

{{table OR file example with comments}}

## usage

### {{use-case 1}}

```{{lang}}
{{code}}
```

### {{use-case 2}}

```{{lang}}
{{code}}
```

## architecture

{{Annotated layout — pull from Agent 4's output. Top 2-3 dirs with one-line each.}}

```
project/
├── src/        # {{what lives here}}
├── tests/      # {{what lives here}}
└── docs/       # {{what lives here}}
```

## comparison

{{ONLY if there are real named alternatives. honest table.}}

|  | {{name}} | {{alt 1}} | {{alt 2}} |
|---|---|---|---|
| {{trait 1}} | ✓ | ✗ | ✓ |
| {{trait 2}} | ✓ | ✓ | ✗ |
| {{trait 3}} | ~ | ✓ | ✓ |

{{One-paragraph honest take. Mention what alts do better. Trust comes from honesty.}}

## roadmap

{{Optional. Only include if real. Short bullets, no dates unless you commit to them.}}

## contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## license

{{license}} © [@{{user}}](https://github.com/{{user}})
```

### Sections to skip aggressively

- **"Acknowledgments"** — skip unless someone actually contributed materially. "Thanks to my cat" is fine in warm mode, weird in crisp.
- **"FAQ"** — only if you actually got questions ≥3 times. Otherwise it's strawman padding.
- **"Comparisons"** — only if alternatives exist by name. Don't compare to "other solutions."

---

## Skeleton D — Full guide (500+ lines)

Use ONLY for:
- A platform with ≥3 SDKs.
- A framework with its own opinions about routing, data, etc.
- A protocol or spec.

Otherwise: split into README + `docs/`. Don't dump everything on the front page.

If you must:

```markdown
# {{name}}

{{tagline}}

{{long opener — 3-4 paragraphs}}

## table of contents

- [Why](#why)
- [Install](#install)
- [Concepts](#concepts)
- [Quickstart](#quickstart)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Examples](#examples)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

...
```

Even here, link out to `docs/` for anything past the conceptual overview. Don't try to be the docs site.

---

## Universal rules (apply to all skeletons)

### First 3 lines

After the H1, the next 3 lines decide whether someone scrolls. They must:

1. **Sentence 1** — say what it is in plain terms.
2. **Sentence 2** — say what pain it solves.
3. **Sentence 3** — say how (one phrase) or who it's for.

If you re-read your opener and only describe what the tool *is*, not what it *does for someone*, rewrite.

### Code blocks > prose

For anything install, config, or usage: code block beats paragraph every time. Annotate inside the block with `# comments`.

### Visual asset placement

If a GIF/screenshot exists, **directly under the opener**. Above install. People who scroll past the GIF wanted code anyway.

### What NEVER belongs in any README

- Personal blog-style intro paragraphs ("I'm a developer who...").
- "Built with [list of libraries]" badge salad.
- Lorem-ipsum-style filler.
- Copy-pasted "Contributors are welcome!" paragraphs with no specifics.
- A table of contents for a <300-line README.
- "Show some ❤️ by starring" begging.
