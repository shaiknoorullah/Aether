# f3 scenario: theming (pywal/base16 ingestion). Spec §5 visual states:
#   1. default theme — no wal file, builtin gruvbox, pixel-equivalent to f1/f2
#   2. wal palette A (gruvbox-ish) applied via :theme_reload
#   3. wal palette B (high-contrast blue) applied via :theme_reload — live reload
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 40+ to sort after f2's 30-33.

AETHER_USER_CONFIG_DIR="$HOME/.config/aether"
AETHER_USER_CONFIG="$AETHER_USER_CONFIG_DIR/aether.toml"
AETHER_CONFIG_BACKUP="$SHOTS/aether.toml.f3-backup"
F3_WAL_JSON="$SHOTS/f3-wal-colors.json"

# Preserve whatever config the machine already has; put it back when the
# scenario ends (or dies — set -e) so a test run never eats a real dotfile.
f3_restore_config() {
  if [[ -f "$AETHER_CONFIG_BACKUP" ]]; then
    mv "$AETHER_CONFIG_BACKUP" "$AETHER_USER_CONFIG"
  else
    rm -f "$AETHER_USER_CONFIG"
  fi
  rm -f "$F3_WAL_JSON"
}
# (if-form, not `&&` — run.sh runs with set -e and a false test would abort)
if [[ -f "$AETHER_USER_CONFIG" ]]; then
  cp "$AETHER_USER_CONFIG" "$AETHER_CONFIG_BACKUP"
fi
# Sourced into run.sh's shell: chain onto its cleanup trap rather than
# replacing it, and put the original trap back when we're done.
trap 'f3_restore_config; cleanup' EXIT

# Point wal_json at a scratch file we control instead of ~/.cache/wal.
mkdir -p "$AETHER_USER_CONFIG_DIR"
cat > "$AETHER_USER_CONFIG" <<EOF
# f3 visual-test dotfile: wal ingestion from a scratch palette file.
[theme]
source = "auto"
wal_json = "$F3_WAL_JSON"
EOF

# f3_write_wal <bg> <fg> <c0> <c1> ... <c15> — emit a pywal-shaped colors.json
f3_write_wal() {
  local bg="$1" fg="$2"; shift 2
  {
    printf '{\n  "special": { "background": "%s", "foreground": "%s", "cursor": "%s" },\n' "$bg" "$fg" "$fg"
    printf '  "colors": {\n'
    local i=0 sep=""
    for c in "$@"; do
      printf '%s    "color%d": "%s"' "$sep" "$i" "$c"
      sep=$',\n'
      i=$((i + 1))
    done
    printf '\n  }\n}\n'
  } > "$F3_WAL_JSON"
}

# f3_theme_reload — run :theme_reload through the command palette
f3_theme_reload() {
  key colon
  type_text "theme_reload"
  key Return
  sleep 1
}

# --- state 1: no wal file → builtin gruvbox ----------------------------------
# Must be pixel-equivalent to the f1/f2 shots: same gruvbox statusbar, badges,
# and content-void colors, now flowing through --aether-* vars.
rm -f "$F3_WAL_JSON"
relaunch_browser
nav "file://$HERE/pages/playground.html" 3
wait_title "Aether playground" 10 || {
  echo "[f3] playground nav did not land, retrying"
  key Escape
  nav "file://$HERE/pages/playground.html" 5
}
wait_title "Aether playground" 15
shot 40-f3-default-builtin

# --- state 2: wal palette A (gruvbox-ish, but visibly warmer bg) -------------
# Statusbar/palette recolor without a relaunch — :theme_reload only.
f3_write_wal "#32302f" "#fbf1c7" \
  "#282828" "#cc241d" "#98971a" "#d79921" "#458588" "#b16286" "#689d6a" "#a89984" \
  "#928374" "#fb4934" "#b8bb26" "#fabd2f" "#83a598" "#d3869b" "#8ec07c" "#ebdbb2"
f3_theme_reload
shot 41-f3-wal-palette-a

# --- state 3: wal palette B (high-contrast blue) → live reload ---------------
f3_write_wal "#0a1a2f" "#e8f0ff" \
  "#0a1a2f" "#ff5c57" "#5af78e" "#f3f99d" "#57c7ff" "#ff6ac1" "#9aedfe" "#f1f1f0" \
  "#123a63" "#ff9f43" "#7bed9f" "#eccc68" "#1e90ff" "#e056fd" "#7efff5" "#ffffff"
f3_theme_reload
shot 42-f3-wal-palette-b-reload

# --- leave the harness the way we found it -----------------------------------
f3_restore_config
trap cleanup EXIT
relaunch_browser
