# Voice — Warm (indie hacker / personal project)

For side projects, hackathons, weekend builds, learning experiments, "I built this for me but maybe you want it too" repos. Audience: other curious devs. They want to know the *story* almost as much as the *what*.

## Core rules

1. **First person is fine.** "I built this because..." works. Don't fake it though — if you didn't build it solo, say "we."
2. **Title-case or sentence-case headers** — author's choice, just be consistent.
3. **Story before specs.** Lead with the moment of friction that made you build it. THEN explain what it does.
4. **Personality is allowed.** A joke, an aside, a parenthetical opinion. Earn them — one per section, not one per paragraph.
5. **Still no AI slop.** Warm doesn't mean sloppy. Same banned phrases as crisp. No em dashes, no "Welcome to...!", no buzzword soup.
6. **One emoji per section, max.** Some warm READMEs use 🎯 / 🚧 / ✨ as section icons. Fine if disciplined. Skip if you're not sure.
7. **Show your face.** Link to the author's Twitter / blog / portfolio at the end. The story has an author — name them.

## Opening hook formula

Three sentences:

```
[Sentence 1: the moment of friction — what bugged you?]
[Sentence 2: what you made — in normal-human language]
[Sentence 3: who it might be for, lightly — "if you're like me..."]
```

### Good openers (study these)

**htmx-style (warm-ish):**
> I missed the days when you could ship a web app without a build step. So I made htmx — it lets you do all the modern interactive stuff with just HTML attributes. If you've ever opened your `node_modules` folder and felt nothing but despair, this might be for you.

**Indie game devlog repo:**
> Most pixel-art tools force you to pick between Aseprite ($20, paid) or a clunky web app. I wanted something I could open instantly, draw a quick sprite, and close. So I built one in a weekend. It's small, it's keyboard-driven, it does maybe 12 things.

### Generated examples (for repos like Sam's)

For a notch-mounted computer-use agent (warm version):
> A few months ago I realized the notch on my MacBook was just wasted real estate — a black bar I'd trained myself to ignore. So I put an agent in it. Long-press the cursor, talk, watch Claude take over my screen. It's the weirdest thing I've ever built and I use it every day.

For a hackathon submission:
> Built this in 36 hours at TritonHacks 2026. The notch on M-series MacBooks is just sitting there, doing nothing — so we filled it with a Claude-powered agent that you summon by long-pressing your cursor.

## Section ordering (warm)

```
1. one-line description (yes, even in warm mode)
2. story-style opener (3 sentences max)
3. demo GIF or screenshot — non-negotiable in warm mode
4. "the gist" or "how it works" (a few bullets, conversational)
5. install + try it (code block)
6. what's inside (annotated structure if interesting)
7. honest section: "what doesn't work yet" / "rough edges"
8. credits + thanks + a link to talk to the author
```

The **"what doesn't work yet"** section is the warm-voice signature move. It builds trust, sets expectations, invites contribution. Don't skip it.

## Voice examples

### Description line

✅ "A weekend-project Markdown editor I built because I missed iA Writer's typewriter mode."

### "The gist"

✅
```
## the gist

You long-press your cursor (~300ms hold of the left button).
The cursor companion lights up. You talk.
Claude transcribes via Whisper, decides what to do, and starts clicking.
That's it. There's no chat window. The screen IS the chat window.
```

### "What doesn't work yet"

✅
```
## what's rough

- M1 MacBook Air only tested. Probably fine on M2/M3, definitely not Intel.
- The agent sometimes clicks the wrong button in Spotify. Working on it.
- No Windows/Linux. The whole thing is a love letter to macOS.
```

This kind of honesty is **the killer feature** of warm READMEs. It's why people star indie projects.

## Closing section

```
## thanks

Built by [@samsia](https://twitter.com/samsia). DM me if you try it
and something breaks — I want to know. PRs welcome.

If this gave you an idea or made you laugh, a star helps.
```

That last line is OK in warm mode (not in crisp). Warm mode is allowed to be warm.

## When to NOT pick warm

- The repo is a serious tool other companies depend on.
- The author is a brand / company, not a person.
- The codebase looks production-grade (CI, tests, semver releases).

In those cases, crisp wins. Save warm for genuinely personal projects.
