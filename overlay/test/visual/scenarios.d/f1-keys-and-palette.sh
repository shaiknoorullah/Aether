# f1 scenario: command palette (ex-mode) + pending-sequence statusbar +
# mode-badge regressions from the spike. Spec §5 visual states.
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title are
# available. Shots are numbered 10+ so they sort after the spike's 00-08 series.

# local test page (links + form field) — same fixture as the spike.
# The first scenario after startup can race the compositor and drop the nav
# keystrokes, so *assert* the page landed (window title) and retry once;
# a second miss aborts the run rather than shooting misleading frames.
nav "file://$HERE/pages/playground.html" 3
wait_title "Aether playground" 10 || {
  echo "[f1] playground nav did not land, retrying"
  key Escape
  nav "file://$HERE/pages/playground.html" 5
}
wait_title "Aether playground" 15

# regression: NORMAL badge unchanged from spike
shot 10-f1-normal-badge

# --- pending multi-key sequence ----------------------------------------------
# 'g' alone → statusbar shows the pending buffer (NORMAL g)
key g
shot 11-f1-pending-g
# pending_timeout_ms (default 800) expires → buffer gone, badge back to NORMAL
sleep 1.2
shot 12-f1-pending-cleared

# --- palette -----------------------------------------------------------------
# ':' opens the input strip above the statusbar, empty, PALETTE badge
key colon
shot 13-f1-palette-open
# typing narrows completions: candidates for 'ta' rendered above the input
type_text "ta"
shot 14-f1-palette-completions
# Tab completes the name token in the input
key Tab
shot 15-f1-palette-tab-completed
# Tab again cycles to the next candidate
key Tab
shot 16-f1-palette-tab-cycled
key Escape

# unknown command → neutral statusbar copy ("no command: zzz"), palette stays open
key colon
type_text "zzz"
key Return
shot 17-f1-palette-unknown-neutral
key Escape

# ':tab <n>' — open a second tab (reserved C-t), then switch back by number
key ctrl+t
key Escape
key colon
type_text "tab 1"
key Return
wait_title "Aether playground" 10
shot 18-f1-palette-tab-switch
# clean up the leftover blank tab WITHOUT killing the playground: switch to it
# and close it there (reserved C-w) — selection falls back to the playground.
key colon
type_text "tab 2"
key Return
key ctrl+w
wait_title "Aether playground" 10

# --- mode badge regressions (spike behavior must survive the extraction) -----
key o
shot 19-f1-insert-badge
key Escape
key f
shot 20-f1-hint-badge
key Escape
shot 21-f1-back-to-normal

# --- reserved chord inside the palette must not orphan the strip -------------
# C-t while the palette is open: strip closes, OUR blank tab opens with the
# urlbar focused (INSERT badge). Regression shot for the mode/UI desync fix.
key colon
key ctrl+t
shot 22-f1-palette-reserved-ctrl-t
