# h1 — r1 live config reload. Spec §5 states 1–8 (overlay/specs/r1-*.md).
# Shots 100+. Two phases: :config_reload with the watcher OFF (states 1–3, 7),
# then the watcher ON (states 4–6, 8) — config_watch is restart-only.
source "$HERE/lib/h-common.sh"
h_backup_config h1

# h1_config <watch> <bg> <accent> [keymap lines...]
h1_config() {
  local watch="$1" bg="$2" accent="$3"
  shift 3
  {
    printf '[options]\nconfig_watch = %s\n\n[theme]\nsource = "toml"\n\n' "$watch"
    h_colors "$bg" "$accent"
    printf '\n[keymap.normal]\n'
    local line
    for line in "$@"; do printf '%s\n' "$line"; done
  } > "$H_CONFIG"
}

# --- phase A: watcher off, :config_reload is the only trigger ----------------
h1_config false "#1d2021" "#458588"
relaunch_browser
h_playground
shot 100-h1-baseline

# state 2: theme changed on disk, no restart
h1_config false "#0a1a2f" "#57c7ff"
h_cmd config_reload
shot 101-h1-theme-reloaded

# state 3: keymap changed on disk — 'n' newly bound to bottom. The scroll-title
# fixture makes the motion assertable: its window title is the scroll position.
h_nav "file://$HERE/pages/scroll-title.html" "scroll at-top" || true
h1_config false "#0a1a2f" "#57c7ff" '"n" = "bottom"'
h_cmd config_reload
key n
h_check "r1.3 a keymap edit applies on :config_reload ('n' reaches the bottom)" wait_title "scroll at-bottom" 6
shot 102-h1-keymap-live

# state 7: 'r' is still the PAGE reload (the config_reload collision guard)
h_nav "file://$HERE/pages/reload-stamp.html" "reload stamp" || true
H1_BEFORE="$(h_title)"
key r
sleep 2
H1_AFTER="$(h_title)"
h_note "r: title before='$H1_BEFORE' after='$H1_AFTER'"
h_check "r1.7 'r' reloads the page (title stamp changed)" \
  test "${H1_BEFORE#reload stamp }" != "$H1_BEFORE" -a "$H1_BEFORE" != "$H1_AFTER"
shot 103-h1-r-still-reloads

# --- phase B: watcher on ------------------------------------------------------
h1_config true "#0a1a2f" "#57c7ff" '"n" = "bottom"'
relaunch_browser
h_playground

# state 4: save is the reload — no command at all
h1_config true "#3c1f1e" "#fb4934" '"n" = "bottom"'
sleep 4
shot 104-h1-watcher-applied

# state 5: broken TOML (value cut mid-literal) is a no-op with one calm line
{
  printf '[options]\nconfig_watch = true\nhint_chars = "arst\n\n[theme]\nsource = "toml"\n\n'
  h_colors "#1d2021" "#458588"
  printf '\n[keymap.normal]\n"n" = "bottom"\n'
} > "$H_CONFIG"
sleep 4
shot 105-h1-broken-noop
h_nav "file://$HERE/pages/scroll-title.html" "scroll at-top" || true
key n
h_check "r1.5 after a broken save the previous keymap is still live" wait_title "scroll at-bottom" 6
shot 106-h1-broken-keymap-still-live

# state 6: mid-write — first chunk ends mid-literal inside the keymap, then a
# pause longer than the poll interval, then the rest. The keymap must never
# revert ('n' still reaches the bottom afterwards).
h1_config true "#3c1f1e" "#fb4934" '"n" = "bottom"' > /dev/null
H1_FULL="$(cat "$H_CONFIG")"
printf '%s' "${H1_FULL%%\"n\" = \"bot*}\"n\" = \"bot" > "$H_CONFIG"
sleep 1.5
printf '%s\n' "$H1_FULL" > "$H_CONFIG"
sleep 4
shot 107-h1-midwrite-settled
keys g g
h_check "r1.6 setup: back at the top" wait_title "scroll at-top" 6
key n
h_check "r1.6 a mid-write never reverted the keymap" wait_title "scroll at-bottom" 6
shot 108-h1-midwrite-keymap-intact

# state 8: insert mode survives a reload — type, touch the keymap, keep typing.
# Playground: its input's hint label is known ('g'). Hint from the TOP — a
# scrolled page has no visible targets and hint mode ends instantly.
h_playground
keys g g
key f
keys g
type_text "abc"
h1_config true "#3c1f1e" "#fb4934" '"n" = "bottom"' '"N" = "top"'
sleep 4
type_text "def"
shot 109-h1-insert-survives

# the other half of state 8: the keymap edit made while typing was DEFERRED,
# not dropped — back in NORMAL, 'N' (bound mid-sentence) must work.
key Escape
h_nav "file://$HERE/pages/scroll-title.html" "scroll at-top" || true
keys G
h_check "r1.8 setup: at the bottom" wait_title "scroll at-bottom" 6
key N
h_check "r1.8 the keymap saved mid-insert applies once back in NORMAL" wait_title "scroll at-top" 6
shot 109b-h1-deferred-keymap-after-escape

h_end
