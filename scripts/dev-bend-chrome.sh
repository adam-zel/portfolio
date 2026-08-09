#!/usr/bin/env bash
# Launch Chrome with HTML-in-Canvas enabled so Bend works locally
# without an origin-trial token.
set -euo pipefail
URL="${1:-http://127.0.0.1:5173/}"
PROFILE="${TMPDIR:-/tmp}/portfolio-bend-chrome"
exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$PROFILE" \
  --enable-features=CanvasDrawElement \
  --enable-blink-features=CanvasDrawElement \
  --new-window \
  "$URL"
