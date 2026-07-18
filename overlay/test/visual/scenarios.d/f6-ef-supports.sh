# f6 scenario: EF supports — task-conditioned focus, ambient time, quiet
# notifications. Spec §5 visual states:
#   1. focus session active: statusbar shows task + calm elapsed next to
#      workspace/clock/date (default order now carries focus AND date)
#   2. session ended via :done — factual echo, no summary judgment, widget
#      just empties; then the bar at rest (Escape dismisses the echo)
#   3. notification suppression evidence read from the profile's prefs.js —
#      the glue flushes the pref flip/restore to disk immediately (crash
#      safety), so prefs.js is the durable record of both
#      dom.webnotifications.enabled and the aether.focus.notif_restore
#      marker. (about:config?filter= does not populate the search box in
#      LibreWolf 146 and chrome console output never reaches stdout in this
#      build, so those channels are blind.) The matching pref lines are
#      asserted mid-run and saved beside the shots as *-evidence.txt.
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title are
# available. Shots numbered 70+ to sort after f5's 60-67. No timers anywhere:
# every wait below is harness pacing, never a session countdown.

PLAYGROUND="file://$HERE/pages/playground.html"
NOTIF_FALSE_LINE='user_pref("dom.webnotifications.enabled", false)'
NOTIF_MARKER_SNIP='aether.focus.notif_restore'

# wait_prefs present|absent <fixed-string> [timeout_s=15] — poll the profile's
# prefs.js until the line appears/disappears (the flush is immediate but the
# write is async off-main-thread).
wait_prefs() {
  local want="$1" needle="$2" timeout="${3:-15}" waited=0
  while (( waited < timeout * 2 )); do
    if [[ "$want" == present ]]; then
      grep -qF "$needle" "$PROFILE/prefs.js" 2>/dev/null && return 0
    else
      grep -qF "$needle" "$PROFILE/prefs.js" 2>/dev/null || return 0
    fi
    sleep 0.5
    (( waited++ )) || true
  done
  echo "[f6] prefs.js never showed '$needle' as $want" >&2
  return 1
}

nav "$PLAYGROUND?f6-focus" 3
wait_title "Aether playground" 15 || {
  echo "[f6] playground nav did not land, retrying"
  key Escape
  nav "$PLAYGROUND?f6-focus" 5
  wait_title "Aether playground" 15
}

# --- state 1: :focus write f6 spec -------------------------------------------
# Transient "focus: write f6 spec" first, then Escape dismisses the echo and
# the widget settles into "write f6 spec · <1m" beside workspace/clock/date.
key colon
type_text "focus write f6 spec"
key Return
sleep 1
shot 70-f6-focus-started
key Escape
sleep 2
shot 71-f6-focus-session-active

# --- state 3a: pref suppressed mid-session (prefs.js evidence) ---------------
# dom.webnotifications.enabled=false and the restore marker must both be on
# disk while the session is live; the actual lines are saved beside the shot.
wait_prefs present "$NOTIF_FALSE_LINE" || exit 3
wait_prefs present "$NOTIF_MARKER_SNIP" || exit 3
{
  echo "# profile prefs.js mid-session (after :focus, before :done):"
  grep -F "dom.webnotifications.enabled" "$PROFILE/prefs.js"
  grep -F "$NOTIF_MARKER_SNIP" "$PROFILE/prefs.js"
} > "$SHOTS/72-f6-notifications-suppressed-evidence.txt"
shot 72-f6-notifications-suppressed

# --- state 2: :done — an echo, never a report card ---------------------------
# :done empties the widget and shows "done: write f6 spec" — no duration, no
# summary. Then Escape: the echo is dismissed and the bar is at rest.
nav "$PLAYGROUND?f6-after" 3
wait_title "Aether playground" 15
key colon
type_text "done"
key Return
sleep 1
shot 73-f6-done-echo
key Escape
sleep 2
shot 74-f6-bar-at-rest

# --- state 3b: pref restored after :done (prefs.js evidence) -----------------
# Restore-and-clear: the suppressed value and the marker both leave prefs.js
# (the pre-session value was the default, so no user value remains). The
# marker was provably present in 3a, so its disappearance is a fresh flush,
# not a vacuous absence.
wait_prefs absent "$NOTIF_FALSE_LINE" || exit 3
wait_prefs absent "$NOTIF_MARKER_SNIP" || exit 3
{
  echo "# profile prefs.js after :done (restore-and-clear):"
  grep -F "dom.webnotifications.enabled" "$PROFILE/prefs.js" ||
    echo "dom.webnotifications.enabled: no user value — back at its pre-session default (true)"
  grep -F "$NOTIF_MARKER_SNIP" "$PROFILE/prefs.js" ||
    echo "aether.focus.notif_restore: cleared"
} > "$SHOTS/75-f6-notifications-restored-evidence.txt"
shot 75-f6-notifications-restored

# leave the browser on a neutral page for any scenario sorted after this one
nav "$PLAYGROUND?f6-end" 3
wait_title "Aether playground" 15
key Escape
