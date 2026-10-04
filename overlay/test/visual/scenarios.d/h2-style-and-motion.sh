# h2 — r2 style layer + motion. Spec §5 states 1–5 (overlay/specs/r2-*.md).
# Shots 110+. Watcher off throughout: every change goes through :config_reload
# so each shot has exactly one cause.
#
# State 1's compatibility claim (an untouched [style] renders pixel-identical
# to v1.1.0) needs a v1.1.0 render to compare against; this scenario produces
# the v1.2.0 side (110/110b). Compare by running the same two shots from the
# v1.1.0 tree — the statusbar/palette crop must match outside the clock.
source "$HERE/lib/h-common.sh"
h_backup_config h2

# h2_config [style lines...]
h2_config() {
  {
    printf '[options]\nconfig_watch = false\n\n[style]\n'
    local line
    for line in "$@"; do printf '%s\n' "$line"; done
  } > "$H_CONFIG"
}

# state 1: no [style] keys at all → the shipped constants
h2_config
relaunch_browser
h_playground
shot 110-h2-default-style
key colon
type_text "ta"
shot 110b-h2-default-palette
key Escape

# state 2: restyled — large radius, wide gaps, translucent + blurred, bigger type
h2_config 'radius = "14px"' 'gap = "2em"' 'pad_x = "20px"' 'row_pad_y = "6px"' \
  'opacity = 80' 'blur = "6px"' 'font_size = "15px"' 'panel_width = "50rem"'
h_cmd config_reload
shot 111-h2-restyled-bar
key colon
type_text "ta"
shot 111b-h2-restyled-palette
key Escape

# state 3: one invalid value among valid ones — partial, named, not fatal
h2_config 'radius = "banana"' 'gap = "2em"' 'font_size = "15px"'
h_cmd config_reload
shot 112-h2-rejected-key-named

# state 4: motion on — slow it down so a mid-transition frame is catchable
h2_config 'motion = true' 'motion_ms = 1500'
h_cmd config_reload
xdotool key --clearmodifiers colon
sleep 0.25
shot 113-h2-motion-on-midframe
sleep 2
key Escape
sleep 2

# state 5: motion off — same timing, the panel is already fully opaque
h2_config 'motion = false' 'motion_ms = 1500'
h_cmd config_reload
xdotool key --clearmodifiers colon
sleep 0.25
shot 114-h2-motion-off-sameframe
key Escape

h_end
