# h5 — r5 settings panel. Spec §5 states 1–6 (overlay/specs/r5-*.md), plus a
# persistence probe across relaunch. Shots 150+.
source "$HERE/lib/h-common.sh"
h_backup_config h5

h5_keys() { grep -cE '^[[:space:]]*[A-Za-z0-9_"-]+[[:space:]]*=' "$H_LOCAL" 2>/dev/null || true; }

cat > "$H_CONFIG" <<'EOF'
[options]
config_watch = false
statusbar_clock = true

[privacy]
doh = "fallback"
EOF
rm -f "$H_LOCAL"
H5_SHA="$(sha256sum "$H_CONFIG" | cut -d' ' -f1)"
relaunch_browser
h_playground

# state 1: sections, values, provenance
h_cmd settings 0.5
shot 150-h5-settings-open

# state 2: search
type_text "theme"
sleep 0.4
shot 151-h5-search-theme
key Escape

# state 3: edit applies live — toggle statusbar_clock, the clock leaves the bar
h_cmd settings 0.5
type_text "statusbar_clock"
key Return
sleep 2
shot 152-h5-edit-applies-live

# state 4: the dotfile is never written; the local file holds exactly one key
h_check "r5.4 aether.toml is byte-identical after an edit" \
  test "$(sha256sum "$H_CONFIG" | cut -d' ' -f1)" = "$H5_SHA"
h_check "r5.4 aether.local.toml exists" test -f "$H_LOCAL"
h_check "r5.4 aether.local.toml holds exactly one key" test "$(h5_keys)" = "1"
h_note "local after edit: $(grep -v '^#' "$H_LOCAL" 2>/dev/null | tr '\n' '|')"

# state 5: reset — Tab to 'reset', Enter; the key leaves the local file
key Tab
key Return
sleep 2
shot 153-h5-reset
key Escape
h_check "r5.5 reset leaves no keys in aether.local.toml" test "$(h5_keys)" = "0"
h_note "local after reset: $(grep -v '^#' "$H_LOCAL" 2>/dev/null | tr '\n' '|')"

# state 6: read-only keymap browser with descriptions
h_cmd settings 0.5
type_text "keymap"
sleep 0.4
shot 154-h5-keymap-browser
key Escape

# probe (not a numbered state): local overrides survive a relaunch — edit one
# key, relaunch, edit another; both must be in the local file afterwards.
rm -f "$H_LOCAL"
relaunch_browser
h_cmd settings 0.5
type_text "statusbar_clock"
key Return
sleep 2
key Escape
relaunch_browser
h_cmd settings 0.5
type_text "privacy.doh"
key Return
sleep 2
key Escape
h_note "local after relaunch + second edit: $(grep -v '^#' "$H_LOCAL" 2>/dev/null | tr '\n' '|')"
h_check "r5 probe: the first override survives a relaunch + second edit" \
  grep -q 'statusbar_clock' "$H_LOCAL"
shot 155-h5-overrides-after-relaunch

h_end
