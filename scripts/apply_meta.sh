#!/usr/bin/env bash
# Apply repo metadata changes via gh. Idempotent.
# Usage:
#   ./apply_meta.sh <owner/repo> --description "..." --homepage "..." --topics "a,b,c"
# Any flag omitted = leave that field alone.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh CLI not installed" >&2
  exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh not authenticated; run: gh auth login" >&2
  exit 2
fi

SLUG="${1:-}"
shift || true
if [ -z "$SLUG" ]; then
  echo "error: missing owner/repo" >&2
  exit 1
fi

DESC=""; HOMEPAGE=""; TOPICS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --description) DESC="$2"; shift 2 ;;
    --homepage)    HOMEPAGE="$2"; shift 2 ;;
    --topics)      TOPICS="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [ -n "$DESC" ]; then
  echo ">> setting description"
  gh repo edit "$SLUG" --description "$DESC"
fi

if [ -n "$HOMEPAGE" ]; then
  echo ">> setting homepage"
  gh repo edit "$SLUG" --homepage "$HOMEPAGE"
fi

if [ -n "$TOPICS" ]; then
  echo ">> setting topics: $TOPICS"
  # Normalize topics for GitHub (lowercase a-z 0-9 - only, max 20):
  #   split on comma → lowercase → collapse junk chars to dashes → strip blank lines → cap 20.
  # Then assemble a JSON array for `gh api --input` (GitHub's topics endpoint
  # rejects the `-f names=...` form because it expects an array, not a string).
  CLEAN="$(printf '%s' "$TOPICS" \
    | tr ',' '\n' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9-]+/-/g; s/^-+//; s/-+$//' \
    | awk 'NF' \
    | head -20)"
  JSON_ARR="$(printf '%s' "$CLEAN" | awk 'BEGIN{printf "["} {printf "%s\"%s\"", (NR>1?",":""), $0} END{print "]"}')"
  gh api -X PUT "repos/$SLUG/topics" \
    -H "Accept: application/vnd.github.mercy-preview+json" \
    --input <(printf '{"names":%s}' "$JSON_ARR") >/dev/null
fi

echo "done"
