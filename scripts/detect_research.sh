#!/usr/bin/env bash
# Detect whether a repo is a research / paper-implementation repo.
# Emits key=value lines + a final "research=yes|no" verdict.
# Usage: ./detect_research.sh [path]
set -euo pipefail

DIR="${1:-.}"
cd "$DIR"

score=0
reasons=()

bump() {
  score=$((score + $1))
  reasons+=("$2")
}

# --- file signals ---
# CITATION.cff = explicit signal
if [ -f CITATION.cff ] || [ -f CITATION.bib ] || [ -f citation.bib ]; then
  bump 5 "citation file present"
fi

# Paper PDF in root or papers/
if compgen -G "paper*.pdf" >/dev/null \
   || compgen -G "papers/*.pdf" >/dev/null \
   || compgen -G "docs/paper*.pdf" >/dev/null; then
  bump 4 "paper.pdf present"
fi

# BibTeX files anywhere shallow
if compgen -G "*.bib" >/dev/null || compgen -G "docs/*.bib" >/dev/null; then
  bump 3 "BibTeX file present"
fi

# Notebooks dir or *.ipynb at top
if [ -d notebooks ] || compgen -G "*.ipynb" >/dev/null; then
  bump 2 "Jupyter notebooks present"
fi

# Research-shaped dirs
for d in experiments configs/experiments checkpoints weights data/raw data/processed models/pretrained eval evaluation benchmarks ablations; do
  if [ -d "$d" ]; then
    bump 1 "research dir: $d"
  fi
done

# Sphinx / mkdocs / paper compile scripts
if compgen -G "scripts/compile_paper*" >/dev/null || [ -f Makefile.paper ]; then
  bump 2 "paper build script"
fi

# --- README content signals (case-insensitive, pure-bash glob match, zero forks) ---
if [ -f README.md ]; then
  body="$(tr '[:upper:]' '[:lower:]' < README.md)"

  case "$body" in *arxiv.org*)                                              bump 4 "arxiv link in README" ;; esac
  case "$body" in *@article{*|*@inproceedings{*|*@misc{*|*@conference{*)    bump 5 "BibTeX block in README" ;; esac
  case "$body" in *citation*|*citing*|*"cite this"*)                        bump 2 "citation language in README" ;; esac
  case "$body" in *neurips*|*icml*|*iclr*|*cvpr*|*eccv*|*iccv*|*acl*|*emnlp*|*naacl*|*aaai*|*kdd*|*sigir*|*nips*) bump 3 "conference name in README" ;; esac
  case "$body" in *abstract*|*methodology*|*reproducib*|*baseline*|*ablation*|*benchmark*|*sota*|*"state-of-the-art"*) bump 2 "research vocabulary in README" ;; esac
  case "$body" in *"model checkpoint"*|*"pretrained weight"*|*"hugging face"*|*huggingface.co/*) bump 2 "model checkpoint references" ;; esac
  case "$body" in *"table "[0-9]*|*"fig. "[0-9]*|*"figure "[0-9]*|*"equation "[0-9]*) bump 1 "tables/figures referenced" ;; esac
fi

# Note: live GitHub topic check intentionally skipped here to avoid hanging on
# slow / unauthed `gh` calls. The polisher workflow already fetches topics via
# audit_repo.sh; the model can apply the same keyword check from that output.

# --- emit ---
if [ "${#reasons[@]}" -gt 0 ]; then
  for r in "${reasons[@]}"; do
    echo "signal: $r"
  done
fi
echo "score=$score"

# Threshold: 5+ = research, 3-4 = ambiguous (ask user), <3 = not research
if [ "$score" -ge 5 ]; then
  echo "research=yes"
elif [ "$score" -ge 3 ]; then
  echo "research=ambiguous"
else
  echo "research=no"
fi
