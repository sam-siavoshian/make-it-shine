#!/usr/bin/env bash
# Audit the current repo's polish state. Emits a key=value report to stdout.
# Usage: ./audit_repo.sh [owner/repo]
#   If owner/repo omitted, derives it from `git remote get-url origin`.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  SLUG="$("$HERE/detect_repo.sh")"
fi

echo "repo=$SLUG"

# --- local file checks (cwd = repo root) ---
if [ -f README.md ]; then
  size=$(wc -l < README.md | tr -d ' ')
  echo "readme=present"
  echo "readme_lines=$size"
else
  echo "readme=missing"
  echo "readme_lines=0"
fi

for f in LICENSE LICENSE.md LICENSE.txt; do
  if [ -f "$f" ]; then
    echo "license=$f"
    break
  fi
done | head -1
grep -q '^license=' <<<"$(echo)" || true  # noop; presence printed above

if ! ls LICENSE* >/dev/null 2>&1; then
  echo "license=missing"
fi

if [ -f .gitignore ]; then
  echo "gitignore=present"
  echo "gitignore_lines=$(wc -l < .gitignore | tr -d ' ')"
else
  echo "gitignore=missing"
  echo "gitignore_lines=0"
fi

if [ -f CONTRIBUTING.md ] || [ -f .github/CONTRIBUTING.md ]; then
  echo "contributing=present"
else
  echo "contributing=missing"
fi

if [ -d .github/ISSUE_TEMPLATE ] && [ -n "$(ls -A .github/ISSUE_TEMPLATE 2>/dev/null)" ]; then
  echo "issue_templates=present"
else
  echo "issue_templates=missing"
fi

if [ -d .github/workflows ] && [ -n "$(ls -A .github/workflows 2>/dev/null)" ]; then
  echo "ci=present"
else
  echo "ci=missing"
fi

# Heuristic: any tests dir or *_test* file?
if compgen -G "tests" >/dev/null || compgen -G "test" >/dev/null \
   || git ls-files | grep -Eqi '(_test\.|\.test\.|tests?/)'; then
  echo "tests=present"
else
  echo "tests=missing"
fi

# Default branch
DEFAULT_BRANCH="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##' || echo '')"
[ -z "$DEFAULT_BRANCH" ] && DEFAULT_BRANCH="$(git branch --show-current || echo main)"
echo "default_branch=$DEFAULT_BRANCH"

# Primary language (rough guess by file count)
LANG="$(git ls-files | sed -nE 's/.*\.([A-Za-z0-9]+)$/\1/p' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')"
echo "primary_lang=${LANG:-unknown}"

# --- live GitHub metadata via gh ---
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  DESC="$(gh repo view "$SLUG" --json description --jq '.description // ""' 2>/dev/null || echo '')"
  HOMEPAGE="$(gh repo view "$SLUG" --json homepageUrl --jq '.homepageUrl // ""' 2>/dev/null || echo '')"
  TOPICS="$(gh repo view "$SLUG" --json repositoryTopics --jq '[.repositoryTopics[].name] | join(",")' 2>/dev/null || echo '')"
  STARS="$(gh repo view "$SLUG" --json stargazerCount --jq '.stargazerCount' 2>/dev/null || echo '0')"
  VISIBILITY="$(gh repo view "$SLUG" --json visibility --jq '.visibility' 2>/dev/null || echo 'unknown')"
  echo "gh_description=${DESC}"
  echo "gh_homepage=${HOMEPAGE}"
  echo "gh_topics=${TOPICS}"
  echo "gh_stars=${STARS}"
  echo "gh_visibility=${VISIBILITY}"
else
  echo "gh_error=gh_not_available_or_not_authenticated"
fi
