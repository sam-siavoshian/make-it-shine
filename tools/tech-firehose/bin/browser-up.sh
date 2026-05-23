#!/usr/bin/env bash
# browser-up.sh — relaunch Brave with remote debugging using your REAL profile.
#
# After this runs, Brave is back open with all your tabs/cookies/extensions
# AND a debug port at 9222 that post-x.ts AND post-hn.ts can attach to.
#
# Do this once per Brave restart. Both post-x.ts and post-hn.ts then work
# using your real Brave session (real X login, real HN login, no passwords).
#
# Env:
#   DEBUG_PORT  default 9222
#   BRAVE_BIN   default "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
#   BRAVE_PROFILE default "$HOME/Library/Application Support/BraveSoftware/Brave-Browser"

set -u

PORT="${DEBUG_PORT:-9222}"
BRAVE="${BRAVE_BIN:-/Applications/Brave Browser.app/Contents/MacOS/Brave Browser}"
PROFILE="${BRAVE_PROFILE:-$HOME/Library/Application Support/BraveSoftware/Brave-Browser}"

if [ ! -x "$BRAVE" ]; then
  echo "ERR: Brave not found at: $BRAVE" >&2
  exit 1
fi

# Check if port already responsive.
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/json/version" | grep -q "200"; then
  echo "Brave already running with debug port $PORT. Nothing to do."
  exit 0
fi

# Brave running but without debug port — must close and relaunch.
if pgrep -f "Brave Browser" >/dev/null; then
  echo "Brave is running WITHOUT debug port. Will close and relaunch with debug port."
  echo "Your tabs will restore (Brave's session restore handles it)."
  read -r -p "Proceed? (y/N) " ANS
  case "$ANS" in
    y|Y|yes|YES) ;;
    *) echo "aborted."; exit 1 ;;
  esac
  echo "closing Brave..."
  osascript -e 'tell application "Brave Browser" to quit' 2>/dev/null || true
  # Wait for clean shutdown (Brave needs time to flush).
  for i in 1 2 3 4 5 6 7 8 9 10; do
    pgrep -f "Brave Browser" >/dev/null || break
    sleep 0.5
  done
  pgrep -f "Brave Browser" >/dev/null && {
    echo "Brave still running. Force-killing."
    pkill -9 -f "Brave Browser" || true
    sleep 1
  }
fi

echo "launching Brave with debug port $PORT + real profile..."
# Launch detached so this script exits cleanly.
nohup "$BRAVE" \
  --remote-debugging-port="$PORT" \
  --remote-allow-origins=* \
  --user-data-dir="$PROFILE" \
  --restore-last-session \
  >/dev/null 2>&1 &
disown

# Wait for debug endpoint to come up (max 15s).
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/json/version" | grep -q "200"; then
    echo "Brave up on port $PORT. Ready for post-x.ts."
    exit 0
  fi
  sleep 0.5
done

echo "ERR: Brave launched but debug port never responded." >&2
exit 1
