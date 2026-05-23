# Research social variants

When the user is announcing a research artifact (paper + code), the share-snippet shape differs from regular Show HN. Three variants here. Ask the user which (multi-select OK) via AskUserQuestion at Phase 7. Voice = academic-crisp (numbers over adjectives, name baselines, declare limitations).

## Variant A. Show HN: paper + code (full announce)

**Use when:** the paper is the primary artifact and the code is a faithful reproduction. Audience: HN front-page readers.

**Shape:**

```
Title (≤80):
Show HN: <project name> – <one-line method or finding> (<venue if notable>)

Body (Ask HN textarea, used if no URL submission):
Paper: <arxiv / openreview / venue URL>
Code: <repo URL>

What it does:
<1 sentence, concrete>

Key result:
<one specific number vs one named baseline. e.g. "2.4× faster than FlashAttention-2 on H100 at 8K context, matches accuracy on PG-19">

What's in this release:
- <thing 1, e.g. "reproduction scripts for Table 3">
- <thing 2, e.g. "trained checkpoints (3B + 7B)">
- <thing 3, e.g. "datasets pre-tokenized">

Limitations:
<one or two honest caveats>

Happy to answer questions in the thread.
```

**Notes:**
- For HN submission, prefer URL=repo (story type). Put the body above into the Ask HN body field ONLY if posting without a URL.
- Title rules same as regular Show HN: no clickbait, no "I built". Stating a venue (`NeurIPS 2024`, `ICLR 2025`) is fine and earns trust.
- Limitations section is non-negotiable. HN readers smell promotional copy instantly; declared limitations buy credibility.

## Variant B. X thread (hook + key result + URL)

**Use when:** the audience is researchers + builders on X. Goal: get the link clicked.

**Shape (3-5 tweets max):**

```
Tweet 1 (hook, ≤280):
<one-line finding that would make a researcher stop scrolling>
<no link in tweet 1. link suppression hurts reach>

Tweet 2 (key result):
On <task / dataset>:
- <metric>: <number> (baseline: <named baseline> at <number>)
- <metric 2>: <number>
- <wall-clock or compute cost>

Tweet 3 (what's released):
Code: <repo URL>
Paper: <arxiv URL>
Checkpoints: <hf link or "in repo">

Tweet 4 (optional. limitations or context):
<honest 1-2 sentence caveat or "next step" framing>

Tweet 5 (optional. author credit / thanks):
<co-authors, advisors, compute sponsors if relevant>
```

**Notes:**
- Tweet 1 carries the entire post. If a researcher only reads the first tweet, they should know whether this is worth their time.
- NO "🧵 thread incoming". wastes characters and signals filler. Just write tweet 1 as a complete hook.
- Numbers > adjectives. "2.4× faster" beats "much faster". "Matches accuracy" beats "competitive accuracy".
- Name baselines. "vs FlashAttention-2" beats "vs prior work".
- Drop in tweet 3, not tweet 1. X's algorithm de-ranks link-only first tweets.

## Variant C. Tagline + repo link only

**Use when:** the artifact speaks for itself OR the user wants minimal blast (X profile pin, casual post). Audience: existing followers.

**Shape (single tweet ≤280, OR HN title ≤80):**

```
X (≤280):
<one tight sentence with the finding + repo link>

# Example shapes:
"2.4× faster long-context attention with no accuracy loss. Paper + code: <url>"
"Open-source reproduction of <paper>: <url>"
"Trained on <X>, <result>: <url>"

HN title (≤80):
<project name> – <method or finding> (<venue if notable>)
# url=repo
```

**Notes:**
- Use when you want signal without commitment to engagement (no thread, no comments expected).
- HN variant here is a regular story submission (no "Show HN:" prefix unless it qualifies). Just a clean title + repo URL.
- Lowest effort, lowest reach, lowest risk.

## Picking the variant

| Situation | Variant |
|-----------|---------|
| Paper accepted at major venue, reproduction is solid | A (full Show HN) + B (X thread) |
| Smaller / workshop paper, niche audience | B (X thread) + C (tagline if on HN) |
| Just an artifact drop, user doesn't want big engagement | C only |
| Code-first, paper secondary | A but emphasize the code in title |
| Paper-first, code is partial reproduction | A but be honest in limitations, B with clear caveat |

If user picks multiple variants, enqueue them as separate queue entries. Don't try to cram all three into one post.

## Always

- **Limitations declared.** Every variant. Researchers and HN readers respect honesty.
- **Numbers > adjectives.** No "impressive", "state-of-the-art", "powerful".
- **Named baselines.** "vs FlashAttention-2" not "vs prior work".
- **Real URL.** Repo, paper, checkpoint links must work. Verify before enqueue.
- **CITATION.cff exists.** Phase 5 should have generated it. If user clicks "Cite this repository" on the repo and it's empty, that's bad for trust.
- **Author handles.** If co-authors are on X, list their handles in the X thread (tweet 5). Earns goodwill + cross-posts.
