# f2 scenario: statusbar widget framework. Spec §5 visual states:
#   1. default widget set — pixel-equivalent to the f1 bar (mode badge, url, clock)
#   2. custom [statusbar] widgets TOML — reordered bar with a correct tab count
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 30+ to sort after f1's 10-22.

AETHER_USER_CONFIG_DIR="$HOME/.config/aether"
AETHER_USER_CONFIG="$AETHER_USER_CONFIG_DIR/aether.toml"
AETHER_CONFIG_BACKUP="$SHOTS/aether.toml.f2-backup"

# Preserve whatever config the machine already has; put it back when the
# scenario ends (or dies — set -e) so a test run never eats a real dotfile.
f2_restore_config() {
  if [[ -f "$AETHER_CONFIG_BACKUP" ]]; then
    mv "$AETHER_CONFIG_BACKUP" "$AETHER_USER_CONFIG"
  else
    rm -f "$AETHER_USER_CONFIG"
  fi
}
# (if-form, not `&&` — run.sh runs with set -e and a false test would abort)
if [[ -f "$AETHER_USER_CONFIG" ]]; then
  cp "$AETHER_USER_CONFIG" "$AETHER_CONFIG_BACKUP"
fi
# Sourced into run.sh's shell: chain onto its cleanup trap rather than
# replacing it, and put the original trap back when we're done.
trap 'f2_restore_config; cleanup' EXIT

# --- state 1: default widget set (no user [statusbar] config) ----------------
# Bar must be pixel-equivalent to f1: mode badge, url, clock — same spans,
# same order, same classes, same clock format.
rm -f "$AETHER_USER_CONFIG"
relaunch_browser
nav "file://$HERE/pages/playground.html" 3
wait_title "Aether playground" 10 || {
  echo "[f2] playground nav did not land, retrying"
  key Escape
  nav "file://$HERE/pages/playground.html" 5
}
wait_title "Aether playground" 15
shot 30-f2-default-widgets

# --- state 2: custom TOML — reordered list with tabs (and date) --------------
mkdir -p "$AETHER_USER_CONFIG_DIR"
cat > "$AETHER_USER_CONFIG" <<'EOF'
# f2 visual-test dotfile: reorder the bar, light up tabs + date.
[statusbar]
widgets = ["mode", "tabs", "url", "clock", "date"]
EOF
relaunch_browser
nav "file://$HERE/pages/playground.html" 3
wait_title "Aether playground" 15
# single tab: tabs widget shows "1", sitting between the mode badge and the url
shot 31-f2-custom-order-tabs-one

# open two more tabs (reserved C-t) → count updates to "3"
key ctrl+t
key Escape
key ctrl+t
key Escape
shot 32-f2-custom-tabs-three

# close one (reserved C-w) → count drops to "2" — event-driven, no reload needed
key ctrl+w
shot 33-f2-custom-tabs-two

# --- leave the harness the way we found it -----------------------------------
f2_restore_config
trap cleanup EXIT
relaunch_browser
