# f5 scenario: workspaces + persistence. Spec §5 visual states:
#   1. workspace "main" with its tabs and statusbar name (pages open, the
#      workspace widget shows the active name)
#   2. workspace "dev" after :ws dev — main's tabs hidden, fresh container
#      tab, statusbar name flips (tab count visible in the strip drops)
#   3. after relaunch_browser (same profile): dev intact — its tab restored,
#      main still present but hidden, statusbar name proves persistence
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 60+ to sort after f4's 50-54.

PLAYGROUND="file://$HERE/pages/playground.html"

# f5_open_tab <url> — open a new tab on <url> (reserved C-t leaves the urlbar
# focused / INSERT), land it, drop back to NORMAL. TabOpen adoption puts it in
# the active workspace.
f5_open_tab() {
  key ctrl+t
  type_text "$1"
  key Return
  wait_title "Aether playground" 15
  key Escape
}

# --- state 1: workspace "main" with its tabs ---------------------------------
# Fresh profile: the single default workspace adopted the startup tab. Two
# distinct urls (same fixture) make the tabs tellable apart later.
nav "$PLAYGROUND?ws-main-one" 3
wait_title "Aether playground" 10 || {
  echo "[f5] playground nav did not land, retrying"
  key Escape
  nav "$PLAYGROUND?ws-main-one" 5
}
wait_title "Aether playground" 15
f5_open_tab "$PLAYGROUND?ws-main-two"
shot 60-f5-workspace-main

# --- state 2: :ws dev — switch-or-create -------------------------------------
# New name: a container is minted, main's tabs hide, dev opens with one fresh
# about:blank tab in that container, the statusbar name flips to "dev".
key colon
type_text "ws dev"
key Return
sleep 2
shot 61-f5-workspace-dev-created

# give dev a distinctive page so the restore shot can't lie
f5_open_tab "$PLAYGROUND?ws-dev-one"
shot 62-f5-workspace-dev-tab

# gw cycles back to main (creation order): its tabs return, dev's hide
keys g w
sleep 1.5
shot 63-f5-cycle-back-main

# land on dev again so the relaunch must restore dev as the active workspace
key colon
type_text "ws dev"
key Return
sleep 2

# --- state 3: everything survives a relaunch on the same profile -------------
# Full quit/restart: workspaces, membership, and the active selection come
# back from <profile>/aether-workspaces.json. dev's playground tab is
# restored and selected (its lastActive tab); main is present but hidden.
relaunch_browser
wait_title "Aether playground" 20
sleep 1
shot 64-f5-persist-active-dev

# main survived too: one gw lands back on it with its two restored tabs
keys g w
sleep 2
wait_title "Aether playground" 15
shot 65-f5-persist-cycle-main
key Escape

# --- regression probe: x on a workspace's only tab must not close the window --
# With every other workspace hidden, gBrowser's last-tab logic sees one
# visible tab; a naive close took the whole browser (and every hidden
# workspace) down. The workspace must survive as one fresh tab instead.
key colon
type_text "ws solo"
key Return
sleep 2
key x
sleep 2
browser_alive || { echo "[f5] browser died closing a workspace's last tab" >&2; exit 2; }
shot 66-f5-last-tab-close-survives

# every other workspace is still alive: cycling from solo wraps to main,
# which restores its remembered playground tab
keys g w
sleep 2
wait_title "Aether playground" 15
shot 67-f5-cycle-after-close
key Escape
