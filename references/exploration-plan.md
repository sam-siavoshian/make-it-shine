# Exploration Plan — 5 Parallel Subagents

This file gives the exact prompts to send to 5 `Explore` subagents **in parallel** (single message, multiple Agent tool calls) at Phase 2 of the polish workflow.

## Why 5 agents, not 1

A single agent reading the whole repo end-to-end:
- pulls more code into its context than needed
- mixes concerns (what the project does + how to install it + who it's for) into one summary
- loses specificity

Five focused agents, each given one sharp question, return tight, targeted facts that compose cleanly into a README. Cost ~the same as one big agent because each one reads less.

## How to dispatch

Send all 5 in a **single assistant message** with 5 separate Agent tool calls. Use `subagent_type: "Explore"` for each — that agent is read-only and designed for fast file lookup.

Repeat the **repo-root path** in every prompt so the agents don't waste turns finding it.

## The 5 prompts

Substitute `{{REPO_PATH}}`, `{{REPO_SLUG}}`, and `{{PRIMARY_LANG}}` from the Phase 1 audit before sending.

### Agent 1 — "What does it do?"

```
Repo path: {{REPO_PATH}}
Repo slug: {{REPO_SLUG}}

Your job: figure out what this project ACTUALLY does. Not what the README claims
— what the code does.

Read in this order:
1. Top-level README, if any (just to see what the author thinks they built)
2. The primary entry point (look for main.*, index.*, src/main.*, cmd/*, bin/*,
   App/AppDelegate.swift, manage.py, app.py, etc — pick by {{PRIMARY_LANG}})
3. The first 2-3 modules called from the entry point

Return EXACTLY two paragraphs:

Paragraph 1 — "what it is" (1-2 sentences). The category + form factor.
  Example: "A macOS menu-bar utility. A SwiftUI app distributed as a .dmg."
  Example: "A Rust CLI tool. Single binary, no daemon."
  Example: "A Next.js web app with a Postgres backend."

Paragraph 2 — "what it does" (2-4 sentences). The PRIMARY user-facing flow.
  What does a user trigger? What happens? What do they get back?
  Be specific. Name commands, file paths, models, services.

Do NOT speculate about features that aren't in the code. If the README mentions
something you can't find in the code, flag it as "claimed but unverified."
```

### Agent 2 — "How is it built?"

```
Repo path: {{REPO_PATH}}

Your job: map the technical stack and architecture.

Inspect:
- Package manifests: package.json, Cargo.toml, go.mod, pyproject.toml,
  Gemfile, Project.yml, *.xcodeproj, requirements*.txt
- Top-level config: tsconfig, vite.config, next.config, Dockerfile,
  fly.toml, vercel.json, etc.
- The 5-10 most-imported internal modules (use `rg "from \"\\." -l` or
  language-appropriate variant to find them)
- Any ARCHITECTURE.md, AGENTS.md, CLAUDE.md, ADR/ folders

Return:

1. **Stack** — bullet list. Language, framework, runtime, primary deps (≤6).
   Example: "Swift 5.10, SwiftUI, macOS 14+, Anthropic SDK, AVFoundation,
   ScreenCaptureKit"
2. **Architecture sketch** — 4-8 lines. Boxes-and-arrows in prose. Name the
   real types/modules.
   Example: "VoiceRecordingService → IntentRouter (fast-path) →
   ContextSelector → Mercury 2 → ComputerUseHarness → ToolDispatcher (CGEvent)"
3. **Key abstractions** — name 3-5 most important internal concepts a reader
   should know to navigate the code. One-line each.
4. **External services** — APIs called, DBs, queues. Endpoints if obvious.

No bullshit. If you can't tell, say "unclear from code."
```

### Agent 3 — "How do I install + run it?"

```
Repo path: {{REPO_PATH}}

Your job: write the EXACT install + run steps. A stranger on a fresh machine
should be able to follow them.

Inspect:
- Existing README install section (sanity check, not source of truth)
- Package manager files (package.json scripts, Makefile, justfile, Taskfile,
  pyproject [project.scripts], Cargo.toml [[bin]], Project.yml)
- CI workflows (.github/workflows/*.yml) — they show the canonical build/test
- .env.example, .env.sample, config templates
- Any scripts/bootstrap, scripts/setup, scripts/install

Return:

1. **Prereqs** — explicit. Versions. OS. Tools. Env vars.
   Example: "macOS 14+, Xcode 16, xcodegen (brew install xcodegen),
   ANTHROPIC_API_KEY in .env"
2. **Install** — code block of exact commands.
3. **Run** — code block of exact commands to get the dev/local version going.
4. **Test** — single command, if tests exist.
5. **Build for release / publish / deploy** — if applicable.

If a command in the existing README is wrong or out of date, flag it.
If env vars are required but not documented, list them with where they're read.
```

### Agent 4 — "What's the layout?"

```
Repo path: {{REPO_PATH}}

Your job: produce an annotated top-2-level directory tree.

Steps:
1. List top-level dirs and files (ignore .git, node_modules, .venv,
   dist, build, .next, target, Pods, .DS_Store)
2. For each top-level dir, list its immediate children (1 level deeper)
3. For each dir or significant file, write ONE LINE explaining what lives
   there and why. Read a few files inside to verify — don't guess from names.

Return as a single Markdown code block, tree format:

```
project-root/
├── App/                # SwiftUI app shell (AppDelegate, entry point)
├── Core/               # Cross-feature shared types and singletons
├── Features/           # Per-feature folders (Notch, Cursor, Agent, ...)
│   ├── Agent/          # Computer-use harness, Anthropic client, voice
│   └── Notch/          # Notch UI, settings panel
└── Project.yml         # xcodegen spec (generates .xcodeproj)
```

Then below the tree, a 3-5 line "How to navigate this repo" paragraph
that tells a contributor where to start reading.

Skip noise (LICENSE, .gitignore, etc) from the tree unless they're surprising.
```

### Agent 5 — "Who is this for + what problem does it solve?"

```
Repo path: {{REPO_PATH}}
Repo slug: {{REPO_SLUG}}

Your job: figure out the audience and the problem. This is the hardest one —
you have to read between the lines.

Inspect:
- README intro / first paragraph
- Commit messages (last 50 commits via `git log --oneline -50`)
- Issue titles (if any are checked into .github/ or visible via `gh issue list`)
- Author bio / org name / repo description
- Any DEMO.md, MARKETING.md, /docs/landing, or screenshots
- The "scratch your own itch" tells: what is the author themselves using this
  for? Look at their other repos via `gh api users/{owner}/repos` if visible

Return:

1. **Target user** — one sentence. Be specific. "Solo devs shipping macOS
   apps" beats "developers."
2. **Problem** — one sentence. What hurts WITHOUT this tool?
3. **Why this not alternatives** — list 1-3 differentiators based on code,
   not marketing. Name alternatives if obvious.
4. **Vibe** — one line. Crisp/devtool, warm/indie, joke/playful, serious/
   enterprise, research/academic. This drives README voice choice.
5. **Hook candidates** — 3 one-line opening hooks for the README that lead
   with problem + outcome. Write them as if you are the author.

If the project is a hackathon submission, internship demo, or class project,
flag that — the README voice should be different.
```

## After all 5 return

Synthesize into a working note. Cross-check Agent 1's "what it does" against
Agent 2's "architecture" — they should agree. Cross-check Agent 3's install
steps against the CI workflows referenced in Agent 2.

Any disagreement = re-read the code yourself, don't pick a winner. The synthesis
note becomes the source of truth for Phase 4 (writing the README).
