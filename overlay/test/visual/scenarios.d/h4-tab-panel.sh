# h4 — r4 panel primitive + tab panel. Spec §5 states 1–9
# (overlay/specs/r4-*.md), plus a pin probe. Shots 130+.
source "$HERE/lib/h-common.sh"
h_backup_config h4

H4_GRAVE="$PROFILE/aether-graveyard.json"
H4_WS="$PROFILE/aether-workspaces.json"
H4_PAGE="file://$HERE/pages/named.html"

h4_grave_count() {
  python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1])).get("records", [])))' "$H4_GRAVE" 2>/dev/null || echo 0
}
# h4_title_part — "h4 <name>" out of the window title
h4_title_part() { h_title | grep -oE 'h4 [a-z0-9-]+' | head -1; }

printf '[options]\nconfig_watch = false\n\n[panels]\nscope = "workspace"\n' > "$H_CONFIG"
relaunch_browser

# --- eight named tabs ----------------------------------------------------------
h_nav "$H4_PAGE#alpha" "h4 alpha" || true
for name in bravo charlie delta echo foxtrot golf hotel; do
  key t
  type_text "$H4_PAGE#$name"
  key Return
  wait_title "h4 $name" 10 || h_note "title h4 $name not reached"
done
# MRU setup: visit charlie, then come back to hotel — charlie is "previous"
h_cmd "tab 3"
wait_title "h4 charlie" 10 || h_note "title h4 charlie not reached"
h_cmd "tab 8"
wait_title "h4 hotel" 10 || h_note "title h4 hotel not reached"

# state 1: panel open, focused on search, previous tab (charlie) at row 1
key T
sleep 0.5
shot 130-h4-panel-open-mru

# states 2 + 8: typing reaches the search field and narrows the list
type_text "cha"
sleep 0.4
shot 131-h4-filtered-typing-reaches-input

# state 3: Enter switches
key Return
h_check "r4.3 Enter on a filtered row switches to it" wait_title "h4 charlie" 10
shot 132-h4-switched-by-enter

# state 4: multi-select close — three marks, Tab to 'close', Enter
H4_BEFORE="$(h4_grave_count)"
key T
sleep 0.4
key ctrl+space
key Down
key ctrl+space
key Down
key ctrl+space
key Tab
shot 133-h4-three-marked-close-action
key Return
sleep 1.5
shot 133b-h4-three-closed
key Escape
H4_AFTER="$(h4_grave_count)"
h_note "graveyard records before=$H4_BEFORE after=$H4_AFTER"
h_check "r4.4 multi-select close archives exactly three tabs" test "$((H4_AFTER - H4_BEFORE))" -eq 3

# state 5: rename persists across relaunch. The panel's 'rename' action needs a
# name prompt; first probe whether it is wired at all…
key T
sleep 0.4
key Tab
key Tab
key Tab
shot 134-h4-panel-rename-action-selected
key Return
sleep 0.6
shot 134b-h4-panel-rename-result
key Escape
# …the rename action hands off to the palette prefilled with
# `tab_rename <id> `: type the name, Enter.
H4_RENAMED_FROM="$(h4_title_part)"
h_note "renaming via the panel: $H4_RENAMED_FROM"
key T
sleep 0.4
type_text "${H4_RENAMED_FROM#h4 }"
key Tab
key Tab
key Tab
key Return
sleep 0.6
shot 134c-h4-rename-prefilled-palette
type_text "renamed-by-h4"
key Return
sleep 1
h_check "r4.5 rename is persisted to the workspaces file" grep -q 'renamed-by-h4' "$H4_WS"
relaunch_browser
key T
sleep 0.4
type_text "renamed"
sleep 0.4
shot 135-h4-rename-after-relaunch
key Escape

# state 6: rename survives the graveyard — close it, relaunch, find it, resurrect
H4_RENAMED_TAB_FOUND=0
key T
sleep 0.4
type_text "renamed"
key Return
sleep 1
if [[ "$(h4_title_part)" == "$H4_RENAMED_FROM" ]]; then H4_RENAMED_TAB_FOUND=1; fi
h_check "r4.6 setup: the renamed tab is selectable after relaunch" test "$H4_RENAMED_TAB_FOUND" -eq 1
key x
sleep 1
h_check "r4.6 the graveyard record carries the rename" grep -q 'renamed-by-h4' "$H4_GRAVE"
relaunch_browser
key colon
type_text "graveyard ${H4_RENAMED_FROM#h4 }"
sleep 0.5
shot 136-h4-graveyard-shows-rename
key Return
sleep 2
h_check "r4.6 resurrecting from the graveyard reopens the page" wait_title "$H4_RENAMED_FROM" 10
key T
sleep 0.4
type_text "renamed"
sleep 0.4
shot 137-h4-resurrected-tab-keeps-rename
key Escape

# state 7: mark and jump, then jump to a CLOSED marked tab (graveyard path)
h_cmd "tab 1"
H4_MARKED="$(h4_title_part)"
h_note "marking: $H4_MARKED"
keys m a
key J
sleep 0.5
keys apostrophe a
h_check "r4.7 'a jumps back to the marked tab" wait_title "$H4_MARKED" 8
shot 138-h4-mark-jump-live
key x
sleep 1
keys apostrophe a
sleep 2
h_check "r4.7 'a on a closed marked tab resurrects that page" wait_title "$H4_MARKED" 8
shot 139-h4-mark-jump-from-graveyard
key Escape

# pin probe (not a numbered state): pin a tab from the panel, jump with its digit
key T
sleep 0.4
type_text "delta"
for _ in 1 2 3 4 5; do key Tab; done
shot 140-h4-pin-action-selected
key Return
sleep 0.5
key Escape
h_cmd "tab 1"
key 1
h_check "r4 pin: digit 1 jumps to the tab pinned from the panel" wait_title "h4 delta" 8

# state 9: no sidebar anywhere, at rest and after T/Escape
key Escape
sleep 0.5
shot 141-h4-no-sidebar-at-rest

h_end
