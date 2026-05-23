# SEO — Repo Description + Topics

Two highest-leverage repo metadata fields:

1. **Description** — shows in search results, on the repo card, in `gh repo view`. ≤100 chars.
2. **Topics** — show as clickable tags. Up to 20. They drive both GitHub's internal search and external SEO (Google indexes them).

Stars come and go. Topics + description are forever (until you change them) and they keep working while you sleep.

---

## Description rules

### Format

- **≤100 chars.** GitHub truncates at ~135 but readability dies at 100.
- **One sentence.** Period at the end.
- **Lead with a verb** when possible. ("Turns X into Y" > "An X that does Y")
- **No emojis.** They eat character budget and look childish in search results.
- **No project name** — that's already the repo name. Don't waste 8 chars repeating it.

### Templates that work

| Pattern | Example |
|---|---|
| Verb-led: {{action}} {{object}} {{constraint}} | `Turns a YAML spec into an Xcode project in one command.` |
| Form-factor + audience: A {{form}} for {{audience}} that {{verb}} | `A macOS menu-bar app for engineers tracking deploys.` |
| Tagline + how: {{outcome}}. {{how}}. | `Voice-controlled computer-use agent. Lives in the MacBook notch.` |
| Comparison: Like {{known thing}} but {{differentiator}} | `Like Postman but for terminal commands. Saves and replays HTTP requests.` |

### Anti-patterns

❌ "🚀 A revolutionary new framework for building modern web applications with AI"
   — emojis, "revolutionary," vague, no concrete differentiator
❌ "make-it-shine is a tool that helps you with your GitHub repos"
   — repeats name, says "is a tool that," vacuous
❌ "Comprehensive solution leveraging cutting-edge AI for next-gen developer experience"
   — AI-slop word salad, says nothing

### Examples

For the user's repo styles:

- Notch computer-use agent: `Notch-mounted macOS computer-use agent driven by voice and long-press.`
- Repo polisher: `Reads your repo with parallel agents, then rewrites README, tags, and description.`
- Hackathon submission: `TritonHacks 2026 — a Claude agent that lives in your MacBook notch.`

---

## Topics rules

### Format constraints (enforced by GitHub)

- Lowercase only.
- a-z, 0-9, hyphens only. No spaces, underscores, dots.
- Max 35 chars per topic.
- Max 20 topics per repo.

### What to pick

Mix three buckets in roughly even proportion:

#### Bucket 1 — Language / stack (3-5 topics)

The fastest filter people apply. Always include the primary language, the framework, the runtime.

`swift`, `swiftui`, `typescript`, `react`, `nextjs`, `nodejs`, `python`, `fastapi`, `rust`, `go`, `kotlin`, `flutter`

#### Bucket 2 — Domain / category (3-5 topics)

What kind of thing this is.

`cli`, `developer-tools`, `automation`, `productivity`, `agent`, `chatbot`, `static-site-generator`, `framework`, `library`, `sdk`, `extension`, `plugin`, `dashboard`, `monitoring`

#### Bucket 3 — Specific niche / buzzword tags (3-5 topics)

Where you actually want to be findable. Pick the words people search.

AI / agent-adjacent:
- `claude`, `anthropic`, `openai`, `llm`, `ai-agent`, `computer-use`, `mcp`, `gemini`, `whisper`, `voice-ai`, `rag`, `embedding`, `vector-search`, `prompt-engineering`

macOS / Apple:
- `macos`, `apple-silicon`, `accessibility-api`, `applescript`, `menubar`, `notch`, `screen-capture`

Dev infrastructure:
- `github-actions`, `docker`, `kubernetes`, `terraform`, `serverless`, `edge-computing`

Frontend:
- `tailwindcss`, `shadcn-ui`, `framer-motion`, `web-components`, `design-system`

### Hackathon / event tags

If submitted to one, include the tag — judges and other participants browse them:
- `hackathon`, `tritonhacks`, `tritonhacks2026`, `winner` (if applicable)

### Topic checking

GitHub doesn't care if a topic exists already, but topics with prior repos get search traffic. Browse `https://github.com/topics/{{topic}}` before committing — if the page shows zero repos, the topic is useless.

### Topic ordering

Order does NOT affect display (GitHub sorts alphabetically). Don't waste time on it.

---

## Worked example

For `AgentNotch` (Sam's notch project), 18 topics:

```
swift, swiftui, macos, apple-silicon, notch, accessibility-api,
computer-use, claude, anthropic, ai-agent, voice-ai, whisper,
mcp, automation, productivity, menubar, screen-capture, llm
```

Three buckets:
- Stack: `swift`, `swiftui`, `macos`, `apple-silicon`, `accessibility-api`, `screen-capture`
- Domain: `automation`, `productivity`, `menubar`, `ai-agent`
- Niche/buzzword: `notch`, `computer-use`, `claude`, `anthropic`, `voice-ai`, `whisper`, `mcp`, `llm`

That's 18 topics, covers every search someone might use to find this repo, no padding.

---

## How to apply

Use `scripts/apply_meta.sh`:

```bash
scripts/apply_meta.sh sam-siavoshian/tritonhacks2026 \
  --description "Notch-mounted macOS computer-use agent driven by voice and long-press." \
  --homepage "https://github.com/sam-siavoshian/tritonhacks2026" \
  --topics "swift,swiftui,macos,apple-silicon,notch,accessibility-api,computer-use,claude,anthropic,ai-agent,voice-ai,whisper,mcp,automation,productivity,menubar,screen-capture,llm"
```

The script:
- Validates topic format.
- Lowercases.
- Replaces all topics in one PUT (idempotent).
- Refuses if `gh` isn't authed.

---

## Description + topics checklist (use before applying)

- [ ] Description ≤100 chars, one sentence, ends with period.
- [ ] Description doesn't repeat the repo name.
- [ ] Description leads with a verb OR a concrete noun (form factor).
- [ ] No emoji in description.
- [ ] 10-20 topics, lowercase, hyphenated.
- [ ] Primary language is the first language topic.
- [ ] At least one topic per bucket (stack / domain / niche).
- [ ] No invented topics — every topic has prior repos at `github.com/topics/{{topic}}`.
- [ ] Homepage URL is reachable (or omitted).
