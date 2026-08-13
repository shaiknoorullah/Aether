# b3 scenario: context resurrection — scroll position survives workspace
# switches and browser restarts. Spec overlay/specs/b3-context-resurrection.md
# §5 visual states:
#   1. scrolled deep in a workspace — statusbar + bottom-of-page content prove
#      the position
#   2. after switching away and back — same content region visible, same
#      scroll position (hidden-not-closed keeps it natively)
#   3. after relaunch_browser — the restored tab lands at the same position,
#      not the top
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 100+ to follow b2's 96–99b.

PLAYGROUND="file://$HERE/pages/playground.html"

# Dedicated workspace names: a full-suite run has already minted main/dev/solo
# (f5) — b3 stays out of their way and off their tabs.
key colon
type_text "ws b3a"
key Return
sleep 2

# --- state 1: scrolled deep in workspace b3a ---------------------------------
nav "$PLAYGROUND?b3-deep" 3
wait_title "Aether playground" 10 || {
  echo "[b3] playground nav did not land, retrying"
  key Escape
  nav "$PLAYGROUND?b3-deep" 5
}
wait_title "Aether playground" 15
# G to the bottom — maximally far from where a fresh load lands; the shot must
# show the "Bottom of the page" section, not the h1.
key G
sleep 3 # scroll sample (1/s throttle) + persist debounce (1 s) both land
shot 100-b3-scrolled-deep

# --- state 2: switch away and back — position held ---------------------------
key colon
type_text "ws b3b"
key Return
sleep 2
shot 101-b3-switched-away
key colon
type_text "ws b3a"
key Return
sleep 2
shot 102-b3-back-position-held

# --- state 3: relaunch — the restored tab lands where it was, not at the top -
# Same profile: workspaces + contexts come back from aether-workspaces.json;
# once the playground finishes loading at the same url, the armed one-shot
# restore fires and the bottom section is visible again with zero keystrokes.
relaunch_browser
wait_title "Aether playground" 20
sleep 3 # load completes, the single Aether:ScrollTo restore applies
shot 103-b3-relaunch-position-restored
key Escape
