# h3 — r3 which-key. Spec §5 states 1–6 (overlay/specs/r3-*.md). Shots 120+.
# pending_timeout_ms is raised to 2500 so a screenshot (≈0.3s) taken while the
# panel is up cannot itself expire the sequence; which_key_ms stays at 400.
source "$HERE/lib/h-common.sh"
h_backup_config h3

h3_config() {
  printf '[options]\nconfig_watch = false\npending_timeout_ms = 2500\nwhich_key_ms = %s\n' "$1" > "$H_CONFIG"
}

h3_config 400
relaunch_browser
# scroll-title: the window title is the scroll position, so every "the page
# scrolled" claim below is an assertion, not a screenshot.
h_nav "file://$HERE/pages/scroll-title.html" "scroll at-top" || true

# state 1: panel after a prefix pause
keys G
xdotool key --clearmodifiers g
sleep 0.8
shot 120-h3-panel-after-pause
# not a numbered state: once the sequence times out the panel must go with it
sleep 3
shot 121-h3-panel-gone-after-timeout
h_note "121: panel must be gone once the sequence times out (visual)"

# state 2: sequence completes, panel gone, page at top
keys G
keys g g
h_check "r3.2 gg completes the sequence (top)" wait_title "scroll at-top" 6
shot 122-h3-gg-top-no-panel

# state 3: root list, truncated with +N more
xdotool key --clearmodifiers question
sleep 0.6
shot 123-h3-root-list

# state 6: root list dismissal — 'j' closes it AND scrolls (not swallowed)
key j
h_check "r3.6 the dismissing j is handled, not swallowed (page scrolled)" wait_title "scroll middle" 6
shot 124-h3-root-dismissed-by-j

# state 4: timing unaffected — the panel must be UP when the completing g lands
keys G
xdotool key --clearmodifiers g
sleep 0.8
shot 125-h3-panel-up-before-completion
xdotool key --clearmodifiers g
h_check "r3.4 completing g with the panel up still fires (top)" wait_title "scroll at-top" 6
shot 125b-h3-completed-top-no-panel

# state 5: disabled — no panel ever, sequence still resolves
h3_config -1
h_cmd config_reload
keys G
xdotool key --clearmodifiers g
sleep 1.2
shot 126-h3-disabled-no-panel
xdotool key --clearmodifiers g
h_check "r3.5 with which-key disabled the sequence still resolves (top)" wait_title "scroll at-top" 6
shot 126b-h3-disabled-sequence-resolves

h_end
