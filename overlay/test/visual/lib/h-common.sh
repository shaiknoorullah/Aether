# Shared helpers for the v1.2.0 h-series scenarios (h1–h5). Sourced by each
# h-scenario, which is itself sourced into run.sh — so shot/key/keys/type_text/
# nav/wait_title/relaunch_browser, $HERE, $SHOTS, $PROFILE and $BROWSER_WIN are
# all in scope. Lives outside scenarios.d/ so run.sh never executes it alone.
#
# Unlike wait_title (fail-fast), h_check RECORDS a verdict and keeps going: a
# version that has never been visually verified is worth one complete list of
# what fails, not the first failure. Verdicts land in $SHOTS/h-results.txt.

H_CONFIG_DIR="$HOME/.config/aether"
H_CONFIG="$H_CONFIG_DIR/aether.toml"
H_LOCAL="$H_CONFIG_DIR/aether.local.toml"
H_RESULTS="$SHOTS/h-results.txt"

# h_backup_config <tag> — preserve the machine's dotfiles (both layers) and
# chain the restore onto run.sh's cleanup trap, the f3 pattern.
h_backup_config() {
  H_TAG="$1"
  mkdir -p "$H_CONFIG_DIR"
  local f
  for f in "$H_CONFIG" "$H_LOCAL"; do
    if [[ -f "$f" ]]; then cp "$f" "$SHOTS/$(basename "$f").$H_TAG-backup"; fi
  done
  trap 'h_restore_config; cleanup' EXIT
}

h_restore_config() {
  local f b
  for f in "$H_CONFIG" "$H_LOCAL"; do
    b="$SHOTS/$(basename "$f").$H_TAG-backup"
    if [[ -f "$b" ]]; then mv "$b" "$f"; else rm -f "$f"; fi
  done
}

# h_end — put the dotfiles back and hand the next scenario a clean browser.
h_end() {
  h_restore_config
  trap cleanup EXIT
  relaunch_browser
}

# h_cmd <palette line> [settle_s=1] — run one command through ':'.
h_cmd() {
  key colon
  type_text "$1"
  key Return
  sleep "${2:-1}"
}

# h_title — the browser window's current title (_NET_WM_NAME, see wait_title).
h_title() { xdotool getwindowname "$BROWSER_WIN" 2>/dev/null || true; }

# h_check <description> <command...> — record PASS/FAIL, never abort.
h_check() {
  local desc="$1"
  shift
  if "$@"; then
    echo "PASS  $desc" | tee -a "$H_RESULTS"
  else
    echo "FAIL  $desc" | tee -a "$H_RESULTS"
  fi
}

# h_note <text> — a line in the results file that is evidence, not a verdict.
h_note() { echo "NOTE  $*" | tee -a "$H_RESULTS"; }

# h_nav <url> <title-substring> — navigate with one retry, NON-fatal: returns
# 1 and records a NOTE instead of aborting the whole run (a loaded machine
# drops keystrokes; one lost nav must not cost every later state its evidence).
h_nav() {
  nav "$1" 3
  wait_title "$2" 10 && return 0
  key Escape
  nav "$1" 5
  wait_title "$2" 15 && return 0
  h_note "nav to $1 never landed (wanted title *$2*)"
  return 1
}

# The playground fixture, with the first-nav compositor-race retry every
# scenario needs.
h_playground() {
  h_nav "file://$HERE/pages/playground.html" "Aether playground" || true
}

# Strict #rrggbb palette for [theme.colors] (all-or-nothing): h_colors <bg> <accent>
h_colors() {
  cat <<EOF
[theme.colors]
bg = "$1"
fg = "#ebdbb2"
accent = "$2"
color0 = "#282828"
color1 = "#cc241d"
color2 = "#98971a"
color3 = "#d79921"
color4 = "$2"
color5 = "#b16286"
color6 = "#689d6a"
color7 = "#a89984"
color8 = "#928374"
color9 = "#fb4934"
color10 = "#b8bb26"
color11 = "#fabd2f"
color12 = "#83a598"
color13 = "#d3869b"
color14 = "#8ec07c"
color15 = "#ebdbb2"
EOF
}
