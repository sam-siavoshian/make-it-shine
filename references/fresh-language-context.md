# Fresh language context

Purpose: calibrate README voice to how devs are talking **right now**, not to stale 2023-era training data. Run a quick fetch of recent posts on the repo's topic, scan for cadence + terminology + what's been beaten to death, then write.

## Why this exists

Default LLM-written READMEs have telltale slop: "comprehensive solution," "leverage cutting-edge," "robust framework," "delve into," em-dashes everywhere, "Welcome to <project>!" openers, three rocket emojis. Devs sniff this out in two seconds and bounce.

The fix is exposure. Reading 30-50 recent posts from devs talking about the same topic gives the writer Claude a fresh reference point for:

- Current terminology (e.g. "agent harness" vs older "AI workflow")
- What phrases are overused this month (so they can be avoided, not adopted)
- Cadence and sentence length actual devs ship in
- Which jokes / framings are still funny vs already dead
- What baseline reader knowledge can be assumed

## How to run

`scripts/fetch_lang_samples.sh "<primary kw>" ["<kw2>" "<kw3>" ...]`

Pick 2-4 keywords from the Phase 2 exploration findings:

| Repo type | Good keywords |
|-----------|---------------|
| CLI tool  | tool name, primary language ("Rust CLI"), domain ("git workflow") |
| Library   | library name, the problem ("auth middleware"), stack ("Next.js auth") |
| AI/ML     | technique ("RAG"), framework ("LangChain"), use case ("local LLM") |
| Web app   | category ("note-taking app"), differentiator ("local-first") |
| Research  | method name, subfield ("diffusion model"), venue ("NeurIPS 2024") |

Avoid one-word generic keywords ("AI", "agent", "bun") — they pull too-broad noise. Pair them ("AI agent harness", "bun runtime") for cleaner hits.

## How to read the output

The script returns three sections: Hacker News (titles + comment counts), Reddit (programming + sideproject + webdev + startups), dev.to (recent posts on topic).

**Extract these signals, NOT phrases to copy:**

1. **Overused phrases** — if 5 posts say "vibe coding," readme should NOT say "vibe coding." Saturation = stale.
2. **Active terminology** — what current word do devs use for the thing? "Agent harness" beats "AI workflow framework" if devs are saying the former.
3. **Cadence** — are devs writing fragments, short paragraphs, long-form? Match the audience's register.
4. **Pain points** — what are people complaining about in this space? README hook should name one of those.
5. **What's funny** — current memes. (Use sparingly. One reference, max.)

**Do NOT:**

- Copy phrases verbatim. The samples are NOT source material. They are a tuning fork.
- Trust noise. Short generic keywords pull unrelated content. Filter mentally.
- Adopt the cringe. Some devs post AI slop too. Detect it, do not mirror it.

## When to skip

- The repo is a joke / one-liner project. Voice is whatever the joke is.
- The repo is in an obscure niche where there are <5 recent posts. Skip and rely on `voice-crisp.md` defaults.
- The repo is a research paper code release. Use the academic-crisp voice from `research-mode.md` regardless of dev social chatter.

## Output integration

After running the script and reading the output, write ONE line of synthesis to the user before Phase 3:

```
Fresh-lang scan: "agent harness" is the live term, devs are tired of "RAG" framing
(saturated), short fragments dominate. Voice: crisp, lead with the harness angle.
```

Then proceed to voice + length pick (Phase 3) with that calibration in hand.

## Cost / time

~3-5s total. Three parallel fetches under the hood. Fail-soft per source (one source 500s, others still return).
