# Research Mode

Research repos are storefronts for a paper, not a product. The audience is other researchers and reviewers, not engineers shopping for a tool. The polish moves change accordingly.

## Table of contents

- [When to activate](#when-to-activate)
- [Mode-specific Phase 2 subagents](#mode-specific-phase-2-subagents)
- [Research README skeleton](#research-readme-skeleton)
- [Voice notes (academic-crisp)](#voice-notes-academic-crisp)
- [Research-specific topics taxonomy](#research-specific-topics-taxonomy)
- [CITATION.cff — required for research repos](#citationcff--required-for-research-repos)
- [Reproducibility section — required](#reproducibility-section--required)
- [LICENSE notes for research repos](#license-notes-for-research-repos)
- [Anti-patterns](#anti-patterns)

---

## When to activate

Research mode runs **in addition to** the regular polish workflow. Activate it when ANY of:

- User explicitly asks (`--research`, "research repo", "paper repo", "this is for a paper").
- `scripts/detect_research.sh` prints `research=yes` (score ≥5).
- `scripts/detect_research.sh` prints `research=ambiguous` (score 3-4). Print the signal list to the user, then ask once: `Treat as research repo? (yes/no)`. Default to no on silence.
- `CITATION.cff` or `paper*.pdf` present in repo root — citation file alone is enough.

Regular-mode rules still apply (hard rules, isolated commits, no AI slop). Research mode ADDS sections (CITATION.cff, reproducibility) and SWAPS the README skeleton + topic taxonomy. Signal weights + thresholds live in `scripts/detect_research.sh` — read the script if you need to tune them.

---

## Mode-specific Phase 2 subagents

Override **two** of the five Explore agents for research mode. Keep the other three (#3 install, #4 layout, #5 audience) — they still apply but tweak the prompts as noted.

### Agent 1 (research variant) — "What does this paper claim?"

```
Repo path: {{REPO_PATH}}

Your job: extract the paper's core claim, method, and headline result from the
repo. Not a marketing pitch — the actual contribution.

Read:
1. README.md (paper title, abstract excerpt, results)
2. paper*.pdf if present (first 2 pages + results section if you can read PDFs;
   otherwise note it exists and trust README abstract)
3. CITATION.cff if present (paper metadata)
4. configs/ or experiments/ for the experimental setup
5. eval/ or evaluation/ for the metrics they report

Return:

1. **Paper title + venue + year** — exact title, conference/journal, year.
   Example: "FlashAttention-2: Faster Attention with Better Parallelism and Work
   Partitioning, NeurIPS 2023"
2. **Authors** — first 3-4 + "et al." if more. Affiliations if listed.
3. **One-paragraph abstract** — paraphrase the README/paper abstract into 3-4
   sentences a non-expert in the subfield can grok.
4. **Core method** — 2-3 bullets naming the actual technique. Not vague
   "a new approach to X" — the specific mechanism.
5. **Headline result** — the number that matters. "Beats SOTA by 2.3 BLEU on
   WMT14 En-De" beats "improves translation quality."
6. **Datasets used** — list with citations/links.
7. **Hardware** — what GPUs/TPUs, how many, for how long.
```

### Agent 2 (research variant) — "How is the codebase organized + what runs what?"

```
Repo path: {{REPO_PATH}}

Your job: map the code to the paper. For each table/figure in the paper, where
is the code that produced it?

Read:
1. configs/ — config files for each experiment
2. scripts/ or shell scripts that drive experiments
3. eval/, evaluation/, benchmarks/
4. Any train.py / run.py / main.py
5. Makefile if it exists
6. README "How to reproduce" or "Experiments" sections

Return:

1. **Stack** — Python version, framework (PyTorch / JAX / TF), key deps (with
   versions if pinned). CUDA version if obvious.
2. **Architecture sketch** — model class, key modules. Cite source files.
3. **Entry points** — for each major result in the paper, the command:
   - Table 1 → `python scripts/eval_main.py --config configs/main.yaml`
   - Table 3 (ablation) → `bash experiments/ablate_layers.sh`
   - Figure 5 → `python scripts/plot_figure5.py`
4. **Pretrained checkpoints** — URLs, sizes, what dataset they're trained on,
   how to download.
5. **Seeds + determinism** — are seeds set? Pinned via config? Or non-reproducible
   by design? Flag this honestly.
```

### Agents 3, 4, 5 — unchanged

Use the regular prompts from `exploration-plan.md`. For Agent 5 (audience),
swap "target user" question to "target reader" — fellow researchers in the
subfield, reviewers, practitioners trying to apply the method.

---

## Research README skeleton

Replaces the regular skeleton. Length: usually multi-section (~250-450 lines)
because reproducibility, results, and citation each deserve a section.

```markdown
# {{Paper Title}}

{{Authors line: First Last¹, First Last², ... (¹University, ²Lab)}}

**Paper:** [arXiv:{{id}}]({{url}}) · **Venue:** {{Conference Year}} · **Project page:** {{url}}

<p align="center">
  <img src="{{teaser_or_results_figure}}" alt="{{paper title}}" width="720">
</p>

> {{One-sentence summary of the paper's claim. NOT marketing fluff. The actual contribution in plain words.}}

{{2-3 sentence abstract paraphrase. End with the headline result number.}}

[![arXiv](https://img.shields.io/badge/arXiv-{{id}}-b31b1b.svg)](https://arxiv.org/abs/{{id}})
[![License: {{license}}](https://img.shields.io/badge/License-{{license}}-blue.svg)](LICENSE)
[![Citation](https://img.shields.io/badge/Cite-CITATION.cff-yellow.svg)](CITATION.cff)

---

## TL;DR

3-5 bullets a reviewer can read in 20 seconds.

- {{problem we solved}}
- {{our method, in one phrase}}
- {{key result, with the number}}
- {{why it matters / what it unlocks}}
- {{honest limitation}}

---

## install

```bash
git clone https://github.com/{{owner}}/{{repo}}
cd {{repo}}
conda env create -f environment.yml   # or: pip install -r requirements.txt
conda activate {{env}}
```

**Hardware:** {{exact hardware used in paper, e.g. "8× A100 80GB"}}. Smaller setups: {{notes — what scales down, what does not}}.

---

## reproduce the paper

Each table/figure maps to one command. All seeds pinned.

| Result | Command | Time | Hardware |
|---|---|---|---|
| Table 1 (main) | `python scripts/eval_main.py --config configs/main.yaml` | ~6h | 8× A100 |
| Table 3 (ablation) | `bash experiments/ablate_layers.sh` | ~2h each | 1× A100 |
| Figure 5 | `python scripts/plot_figure5.py --logs runs/main/` | <1min | CPU |

Numbers in the table will match the paper within ±{{tolerance}} (different CUDA / hardware tolerance).

If a result is missing a command, file an issue — that's a reproducibility bug, not a missing feature.

---

## checkpoints

| Model | Dataset | Size | Link |
|---|---|---|---|
| {{name-base}} | {{dataset}} | {{size}} | [download]({{url}}) |
| {{name-large}} | {{dataset}} | {{size}} | [download]({{url}}) |

```bash
bash scripts/download_checkpoints.sh
# → puts files in checkpoints/
```

---

## datasets

{{For each dataset, name + how to obtain + the citation for it.}}

- **{{Dataset 1}}** — {{1-line what it is}}. Download: {{instructions}}. Cite: `@inproceedings{...}`.
- **{{Dataset 2}}** — ...

If you redistribute a derived dataset, respect the original license.

---

## results

{{Reproduce the headline result table from the paper. Include baselines. Be honest about what alternatives do better.}}

| Method | Metric A | Metric B | Metric C |
|---|---|---|---|
| Baseline 1 | x.xx | x.xx | x.xx |
| Baseline 2 | x.xx | x.xx | x.xx |
| **Ours** | **x.xx** | **x.xx** | x.xx |

{{One paragraph honest take. "We win on A and B but lose on C because Z. Use baseline 2 if your workload is dominated by C."}}

---

## quickstart (use the model, not the paper)

For practitioners who just want to use the released model:

```python
from {{package}} import {{Model}}

model = {{Model}}.from_pretrained("{{owner}}/{{model-name}}")
out = model({{example_input}})
```

---

## method

{{2-4 paragraphs sketching the method. This is a teaser to make the reader open the paper, not a replacement for it.}}

For the full method, math, and proofs, see the [paper]({{url}}).

---

## repo layout

```
{{annotated tree}}
```

---

## citing this work

If you use this code, the released checkpoints, or build on this method, please cite:

```bibtex
@inproceedings{<CITE_KEY>,
  title     = {<PAPER TITLE>},
  author    = {<First Last and First Last and ...>},
  booktitle = {<VENUE NAME>},
  year      = {<YYYY>},
  url       = {<URL>}
}
```

(Placeholders use `<...>` here because BibTeX itself uses `{...}` as syntax. Replace each `<...>` literally.)

A machine-readable [CITATION.cff](CITATION.cff) is also provided. GitHub renders a "Cite this repository" button from it.

---

## license

Code: [{{license}}](LICENSE). Released model weights: {{model_license}}. Generated outputs: {{output_terms}}.

This repository is not the paper. Code rights and paper rights can differ. Read both.

---

## acknowledgments

{{Funding, compute credits, collaborators not on the author list. One paragraph.}}

## contact

Issues: [GitHub Issues]({{url}}/issues). Questions: {{email or @handle}}.
```

---

## Voice notes (academic-crisp)

Base rules + bans live in `voice-crisp.md`. Research mode adds three tweaks:

1. **Numbers over adjectives.** "2.3 BLEU improvement on WMT14 En-De" beats "significant improvement on translation."
2. **Cite baselines.** Always name the alternatives you compare to. Reviewers will check.
3. **Honest limitations.** A "limitations" or "what we don't claim" section signals scientific honesty and disarms reviewer concerns.

Extra allowances on top of crisp: math notation, dataset shorthand (En-De, ImageNet-1K), well-known model names without expansion (BERT, GPT, ResNet).

---

## Research-specific topics taxonomy

When the polish workflow reaches topic-setting (Phase 5), use this taxonomy in place of the general one in `seo-topics.md`. Same shape (max 20, mix the buckets), different vocabulary — subfield + artifact-type + venue/framework + method.

### Bucket 1 — Subfield (3-5 topics)

`nlp`, `computer-vision`, `reinforcement-learning`, `machine-learning`, `deep-learning`, `graph-neural-networks`, `multimodal`, `speech-recognition`, `representation-learning`, `generative-models`, `diffusion-models`, `transformers`, `language-models`, `large-language-models`, `vision-language-models`

### Bucket 2 — Artifact type (2-4 topics)

`paper`, `paper-implementation`, `official-implementation`, `research`, `benchmark`, `dataset`, `pretrained-models`, `model-zoo`, `reference-implementation`, `code-release`

### Bucket 3 — Venue + framework (3-6 topics)

Venue: `neurips`, `icml`, `iclr`, `cvpr`, `eccv`, `iccv`, `acl`, `emnlp`, `naacl`, `aaai`, `kdd`, `sigir`, `interspeech`
Framework: `pytorch`, `jax`, `tensorflow`, `flax`, `transformers`, `huggingface`, `pytorch-lightning`

### Bucket 4 — Method / domain keyword (3-6 topics)

The specific thing your paper is about. Examples: `attention`, `flash-attention`, `mixture-of-experts`, `rlhf`, `dpo`, `quantization`, `lora`, `peft`, `retrieval-augmented-generation`, `chain-of-thought`, `agents`, `tool-use`, `robotics`, `protein-structure`, `molecular-dynamics`, `weather-forecasting`, etc.

### Worked example

For a paper on "Efficient long-context attention for LLMs, NeurIPS 2026":

```
nlp, large-language-models, transformers, attention,
long-context, efficient-inference, pretrained-models,
paper-implementation, neurips, pytorch, huggingface,
inference-optimization, kv-cache, research, deep-learning
```

15 topics, all bucket-balanced, all real terms used in the field.

---

## CITATION.cff — required for research repos

GitHub renders a "Cite this repository" button when this file exists, and Zotero / Mendeley / Papers parse it automatically. Single highest-leverage move for citation tracking.

### Minimum viable CITATION.cff

```yaml
cff-version: 1.2.0
message: "If you use this work, please cite the paper below."
title: "{{Paper Title}}"
authors:
  - family-names: "{{Last}}"
    given-names: "{{First}}"
    orcid: "https://orcid.org/0000-0000-0000-0000"
    affiliation: "{{University or Lab}}"
  - family-names: "{{Last}}"
    given-names: "{{First}}"
    affiliation: "{{University or Lab}}"
preferred-citation:
  type: conference-paper
  title: "{{Paper Title}}"
  authors:
    - family-names: "{{Last}}"
      given-names: "{{First}}"
  conference:
    name: "{{Conference name, e.g. NeurIPS}}"
  year: {{YYYY}}
  url: "{{paper URL, e.g. https://arxiv.org/abs/2401.00000}}"
  doi: "{{DOI if available}}"
```

### Field rules

- `cff-version: 1.2.0` — current as of 2026, do not invent.
- `message` — what shows in the citation widget. Keep it one sentence.
- `authors` (top level) — code authors. Often equal to paper authors, sometimes not.
- `preferred-citation` — what people should cite. Different from the code-author list because it points at the PAPER, not the repo.
- `type` — one of: `article` (journal), `conference-paper`, `thesis`, `book`, `software`, `dataset`, `generic`. Pick the most specific.
- `orcid` — optional but recommended for first authors. Standard form: `https://orcid.org/####-####-####-####`.

### Validating

```bash
pip install cffconvert
cffconvert --validate -i CITATION.cff
# or render the BibTeX it would produce:
cffconvert -f bibtex -i CITATION.cff
```

If `cffconvert` is missing, GitHub itself validates on push and surfaces errors in the repo UI.

### What to ask the user for

Before writing CITATION.cff, the user must provide (or confirm):

1. Paper title (exact)
2. Authors with affiliations (and ORCIDs if available)
3. Venue (conference / journal name, year)
4. URL (arXiv preferred, DOI if published)
5. BibTeX key preference (often `lastname2026shorttitle`)

If the user doesn't have any of these, draft with `{{TODO}}` placeholders and tell them in the final summary.

---

## Reproducibility section — required

Non-negotiable in research mode. Must include:

1. **Exact environment** — Python version, CUDA version, framework version, OS. Pin in `requirements.txt` or `environment.yml`.
2. **Seeds** — random seed values used in the paper. If not set, state that explicitly: "non-deterministic by design; expect ±X% variance."
3. **Hardware** — exact GPUs/TPUs, count, memory. "8× A100 80GB" not "GPU cluster."
4. **Per-result commands** — every table/figure in the paper gets one command in the README. If a result has no command, that's a reproducibility hole — file a TODO with a clear ask to the maintainer.
5. **Expected runtime** — wall-clock estimate per command. Reviewers re-running need to plan.
6. **Tolerance** — within how many decimal places should the reproduced number match the paper? Different CUDA / driver / hardware introduces noise.

If the user can't fill these, leave clear TODOs in the README and list them in the final summary. **Do not silently skip.** A research README without repro is worse than no research README — it implies you're hiding something.

---

## LICENSE notes for research repos

Code and paper artifacts often have **different** licenses. Common pairs:

| Code | Weights | Generated outputs |
|---|---|---|
| MIT | MIT | Public domain |
| Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Apache-2.0 | Custom (e.g. Llama 2 license) | Subject to weights license |
| BSD-3-Clause | CC-BY-NC-4.0 | Non-commercial only |
| GPL-3.0 | n/a | n/a |

Spell this out in the LICENSE section of the README. Do not assume code license = weights license. Reviewers and corporate users care.

If the paper is published in a journal that retains rights (e.g., Elsevier), the **paper PDF** in the repo may have different rights too. Note "preprint" if applicable.

---

## Anti-patterns

These are the most common ways research READMEs fail. Avoid all of them.

- **"Coming soon" placeholders** — pretrained models, eval scripts, anything labeled "coming soon" that's been there for >2 months is dead. Delete or commit.
- **Results table without baselines** — comparing only to "vanilla" gives no signal. Always include at least the prior SOTA.
- **No environment file** — `pip install -r requirements.txt` without pinned versions ages out within a year.
- **Pretrained models behind email request** — fine for restricted datasets, suspicious for code releases. Justify the gate.
- **Unverifiable numbers** — claims like "10× faster" with no reproduce command. Add the command or remove the claim.
- **Walls of acknowledgments before the method** — readers want the method, not the funding agencies. Acknowledgments go LAST.
- **One README that's also the paper** — if the README is 2000 lines, split into `docs/` and link from a clean 300-line README.
