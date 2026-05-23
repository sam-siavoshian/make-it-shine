#!/usr/bin/env bash
# fetch_lang_samples.sh — grab fresh dev-language samples for voice calibration.
#
# Pulls recent posts from HN, Reddit, and dev.to using keywords derived from
# the repo (stack, domain, project name). The output is NOT for copy-paste —
# it's a fresh-language signal so the writer Claude calibrates tone to how
# devs are actually talking THIS WEEK, not to stale training data.
#
# Usage:
#   fetch_lang_samples.sh "kw1" ["kw2" "kw3" ...]
#
# Example:
#   fetch_lang_samples.sh "Bun" "TypeScript CLI"
#   fetch_lang_samples.sh "RAG agent" "LangChain" "local LLM"
#
# Output: plain-text block (titles + short text snippets) grouped by source.
# Designed for direct injection into the writer Claude's context.

set -u
set -o pipefail

# Path to the tech-firehose scripts. Hard-coded since this is a personal skill.
FIREHOSE_DIR="${TECH_FIREHOSE_DIR:-/Users/samsiavoshian/Desktop/Coding Stuff/Scripts Stuff/tech-firehose}"

if [ ! -d "$FIREHOSE_DIR/bin" ]; then
  echo "ERR: tech-firehose not found at $FIREHOSE_DIR" >&2
  echo "Set TECH_FIREHOSE_DIR env var or install at the expected path." >&2
  exit 1
fi

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 \"kw1\" [\"kw2\" \"kw3\" ...]" >&2
  exit 2
fi

PRIMARY_KW="$1"

cd "$FIREHOSE_DIR" || exit 1

echo "# Fresh language samples — primary keyword: $PRIMARY_KW"
echo "# (last ~72h, NOT for copy-paste, only for tone calibration)"
echo

echo "## Hacker News (titles + show/ask context)"
echo
bun run bin/fetch-hn.ts \
  --feed=all \
  --keyword="$PRIMARY_KW" \
  --since-hours=72 \
  --limit=15 \
  --json 2>/dev/null \
  | jq -r '.[] | "- [\(.score // 0)↑ \(.comments // 0)💬] \(.title)"' \
  || echo "(hn fetch failed)"

echo
echo "## Reddit (programming + sideproject + webdev)"
echo
bun run bin/fetch-reddit.ts \
  --subs=programming,sideproject,webdev,startups \
  --keyword="$PRIMARY_KW" \
  --since-hours=72 \
  --limit=15 \
  --json 2>/dev/null \
  | jq -r '.[] | "- [\(.score // 0)↑] \(.title)"' \
  || echo "(reddit fetch failed)"

echo
echo "## dev.to (recent posts on topic)"
echo
bun run bin/fetch-rss.ts \
  --preset=devto \
  --keyword="$PRIMARY_KW" \
  --since-hours=72 \
  --limit=10 \
  --json 2>/dev/null \
  | jq -r '.[] | "- \(.title)"' \
  || echo "(devto fetch failed)"

echo
echo "# end samples — extract tone signals only (cadence, terminology, what's overused)"
