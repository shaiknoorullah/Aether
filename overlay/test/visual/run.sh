#!/usr/bin/env bash
# Aether visual test harness: launches a Gecko browser (LibreWolf in CI/container,
# any Firefox via AETHER_APP_DIR) under Xvfb with the overlay wired in, drives it
# with xdotool, and captures labeled PNG screenshots for manual + automated review.
#
# Usage: run.sh [scenario...]   (default: all scenarios in scenarios.d/, sorted)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVERLAY="$(cd "$HERE/../.." && pwd)"
APP="${AETHER_APP_DIR:-/home/user/librewolf}"
BIN="${AETHER_APP_BIN:-$APP/librewolf}"
CFG="$(ls "$APP"/*.cfg 2>/dev/null | head -1 || true)"
PROFILE="${AETHER_TEST_PROFILE:-/home/user/.aether-test-profile}"
SHOTS="${AETHER_SHOTS_DIR:-$HERE/shots}"
DISPLAY_NUM="${AETHER_DISPLAY:-:99}"
RES="${AETHER_RES:-1600x900x24}"
STARTUP_WAIT="${AETHER_STARTUP_WAIT:-14}"

[[ -x "$BIN" ]] || { echo "no browser binary at $BIN (set AETHER_APP_DIR/AETHER_APP_BIN)" >&2; exit 1; }

# --- 1. wire the loader into the app dir (idempotent) ------------------------
if [[ -n "$CFG" ]]; then
  grep -q "AETHER-LOADER" "$CFG" || cat "$OVERLAY/loader/aether-loader.cfg" >> "$CFG"
else
  # stock Firefox: install config.js fresh (first line is skipped by autoconfig)
  { echo "// aether"; cat "$OVERLAY/loader/aether-loader.cfg"; } > "$APP/config.js"
  cat > "$APP/defaults/pref/config-prefs.js" <<'EOF'
pref("general.config.filename", "config.js");
pref("general.config.obscure_value", 0);
EOF
fi
cp "$OVERLAY/loader/zz-aether.js" "$APP/defaults/pref/zz-aether.js"

# --- 2. fresh test profile ----------------------------------------------------
rm -rf "$PROFILE"
mkdir -p "$PROFILE"
ln -sfn "$OVERLAY/chrome" "$PROFILE/chrome"
cat "$OVERLAY/prefs/user.js" "$HERE/test-prefs.js" > "$PROFILE/user.js"

# --- 3. X server + browser ----------------------------------------------------
mkdir -p "$SHOTS"
Xvfb "$DISPLAY_NUM" -screen 0 "$RES" -nolisten tcp &
XVFB_PID=$!
cleanup() {
  kill "$BROWSER_PID" 2>/dev/null || true
  wait "$BROWSER_PID" 2>/dev/null || true
  kill "$XVFB_PID" 2>/dev/null || true
}
trap cleanup EXIT
sleep 1

export DISPLAY="$DISPLAY_NUM"
export MOZ_DISABLE_CONTENT_SANDBOX=1
"$BIN" --no-remote --new-instance -profile "$PROFILE" "${AETHER_START_URL:-about:blank}" \
  > "$SHOTS/browser.log" 2>&1 &
BROWSER_PID=$!
sleep "$STARTUP_WAIT"

# --- 4. scenario DSL ----------------------------------------------------------
shot() { xwd -root -silent | convert xwd:- "$SHOTS/$1.png"; echo "[shot] $1"; }
key()  { xdotool key --clearmodifiers "$@"; sleep 0.6; }
keys() { for k in "$@"; do xdotool key --clearmodifiers "$k"; sleep 0.25; done; sleep 0.5; }
type_text() { xdotool type --delay 40 "$1"; sleep 0.4; }
nav()  { keys o; type_text "$1"; key Return; sleep "${2:-5}"; }
browser_alive() { kill -0 "$BROWSER_PID" 2>/dev/null; }

browser_alive || { echo "browser died on startup — see $SHOTS/browser.log" >&2; exit 2; }

# --- 5. run scenarios ---------------------------------------------------------
if [[ $# -gt 0 ]]; then
  scenarios=("$@")
else
  scenarios=()
  while IFS= read -r f; do scenarios+=("$f"); done < <(ls "$HERE"/scenarios.d/*.sh 2>/dev/null | sort)
fi
for s in "${scenarios[@]}"; do
  echo "[scenario] $s"
  # shellcheck source=/dev/null
  source "$s"
  browser_alive || { echo "browser died during $s — see $SHOTS/browser.log" >&2; exit 2; }
done

echo "[done] screenshots in $SHOTS"
