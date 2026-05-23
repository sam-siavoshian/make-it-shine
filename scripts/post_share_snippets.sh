#!/usr/bin/env bash
# post_share_snippets.sh — enqueue share snippets via tech-firehose queue.
#
# Default behavior: ENQUEUE (don't post). User drains the queue when ready.
#
# Usage:
#   post_share_snippets.sh <draft-file> <repo-url> [platforms]
#
# Args:
#   draft-file  Path to the share snippet text.
#   repo-url    Public repo URL.
#   platforms   Comma-separated subset of x,hn (default x).
#
# Env overrides:
#   TECH_FIREHOSE_DIR  Override firehose location.
#   POST_FOR_REAL=1    Enqueue AND drain immediately.
#
# Default flow:
#   1. Validate inputs.
#   2. Enqueue via queue-add.ts. Print entry id + drain command.
#   3. User runs `bun run bin/queue-list.ts` to review.
#   4. User runs `bun run bin/queue-drain.ts --id=<id> --yes` to send.

set -u
set -o pipefail

FIREHOSE_DIR="${TECH_FIREHOSE_DIR:-/Users/samsiavoshian/Desktop/Coding Stuff/Scripts Stuff/tech-firehose}"

if [ ! -d "$FIREHOSE_DIR/bin" ]; then
  echo "ERR: tech-firehose not found at $FIREHOSE_DIR" >&2
  exit 1
fi

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <draft-file> <repo-url> [platforms]" >&2
  exit 2
fi

DRAFT_FILE="$1"
REPO_URL="$2"
PLATFORMS="${3:-x}"

if [ ! -f "$DRAFT_FILE" ]; then
  echo "ERR: draft file not found: $DRAFT_FILE" >&2
  exit 2
fi

for p in $(echo "$PLATFORMS" | tr ',' ' '); do
  case "$p" in
    hn|x) ;;
    *) echo "ERR: unknown platform '$p'. choices: x,hn" >&2; exit 2 ;;
  esac
done

cd "$FIREHOSE_DIR" || exit 1

REPO_NAME=$(basename "$REPO_URL" | sed 's/\.git$//')

ENTRY_JSON=$(bun run bin/queue-add.ts \
  --file="$DRAFT_FILE" \
  --platforms="$PLATFORMS" \
  --hn-url="$REPO_URL" \
  --source="make-it-shine:$REPO_NAME" \
  --json)

ENTRY_ID=$(echo "$ENTRY_JSON" | bun -e 'const j = await Bun.stdin.json(); console.log(j.id)')

echo "queued: $ENTRY_ID (platforms: $PLATFORMS)"
echo
echo "next steps for the user:"
echo "  review:   cd \"$FIREHOSE_DIR\" && bun run bin/queue-list.ts"
echo "  details:  bun run bin/queue-list.ts --id=$ENTRY_ID"
echo "  drain:    bun run bin/queue-drain.ts --id=$ENTRY_ID --yes"
echo "  cancel:   bun run bin/queue-clear.ts --id=$ENTRY_ID"

if [ "${POST_FOR_REAL:-0}" = "1" ]; then
  echo
  echo "POST_FOR_REAL=1 set. Draining now..."
  bun run bin/queue-drain.ts --id="$ENTRY_ID" --yes
fi
