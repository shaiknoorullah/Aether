# f4 scenario: vertical tabs + graveyard. Spec §5 visual states:
#   1. vertical tabs hidden (zero-chrome preserved — full-viewport content)
#   2. vertical tabs summoned via T and themed (strip visible, selected tab
#      accented, statusbar intact)
#   3. graveyard palette listing archived tabs after closing several
#   4. resurrected tab open (Enter on a match; statusbar url/tab count confirm)
#   5. graveyard survives relaunch_browser — :graveyard still lists the
#      archive on the same profile
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 50+ to sort after f3's 40-42.

PLAYGROUND="file://$HERE/pages/playground.html"

# f4_open_and_close <url> — open a new tab on <url> (reserved C-t leaves the
# urlbar focused / INSERT), land it, drop to NORMAL, then close it with 'x'
# (tab_close) so the TabClose listener buries a real user close.
f4_open_and_close() {
  key ctrl+t
  type_text "$1"
  key Return
  wait_title "Aether playground" 15
  key Escape
  key x
  sleep 1
}

# --- state 1: vertical tabs hidden — zero-chrome resting state ---------------
# Regression vs the f1–f3 shots: full-viewport content, no strip, no sidebar
# header/launcher, statusbar only.
nav "$PLAYGROUND" 3
wait_title "Aether playground" 10 || {
  echo "[f4] playground nav did not land, retrying"
  key Escape
  nav "$PLAYGROUND" 5
}
wait_title "Aether playground" 15
shot 50-f4-tabs-hidden

# --- state 2: T summons the themed native strip ------------------------------
# Strip appears at --aether-tabs-width, selected tab accented, statusbar
# intact; focus is NOT stolen (still NORMAL — T again works immediately).
key T
shot 51-f4-tabs-summoned
# back to zero-chrome for the graveyard states
key T
sleep 0.5

# --- state 3: close several tabs, then :graveyard lists the archive ----------
# Distinct query strings give distinct urls (same fixture file) so the
# candidate rows are tellable apart in the shot.
f4_open_and_close "$PLAYGROUND?grave-one"
f4_open_and_close "$PLAYGROUND?grave-two"
key colon
type_text "graveyard"
sleep 0.5
shot 52-f4-graveyard-list

# --- state 4: Enter resurrects the first (newest) match ----------------------
# grave-two reopens in a new tab; statusbar url + tab count confirm.
key Return
wait_title "Aether playground" 15
sleep 1
shot 53-f4-resurrected

# --- state 5: the archive survives a relaunch on the same profile ------------
# grave-two was exhumed by the resurrection; grave-one must still be listed
# after a full quit/restart (persistence file in the profile dir). The
# shutdown close of the open tabs must NOT appear (real user closes only).
relaunch_browser
key colon
type_text "graveyard"
sleep 0.5
shot 54-f4-graveyard-persisted
key Escape
