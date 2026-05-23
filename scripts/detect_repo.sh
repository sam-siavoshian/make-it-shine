#!/usr/bin/env bash
# Resolve owner/repo from current git remote. Prints "owner/repo" to stdout.
# Usage: ./detect_repo.sh [path]
set -euo pipefail

DIR="${1:-.}"
cd "$DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: not inside a git repository ($DIR)" >&2
  exit 1
fi

URL="$(git config --get remote.origin.url || true)"
if [ -z "$URL" ]; then
  echo "error: no remote.origin.url set" >&2
  exit 1
fi

# Normalize:
#   git@github.com:owner/repo.git
#   https://github.com/owner/repo.git
#   https://github.com/owner/repo
SLUG="$(printf '%s' "$URL" \
  | sed -E 's#^git@github\.com:##; s#^https://github\.com/##; s#\.git$##')"

if [[ ! "$SLUG" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "error: could not parse owner/repo from '$URL' (got '$SLUG')" >&2
  exit 1
fi

printf '%s\n' "$SLUG"
