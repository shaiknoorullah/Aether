# Spike scenario: zero-chrome, modal states, urlbar summon, reserved override.
# Runs inside run.sh via source — shot/key/keys/type_text/nav are available.

shot 00-startup-blank

# local test page with links + a form field (hints + insert-mode targets)
nav "file://$HERE/pages/playground.html" 3
shot 01-normal-on-page

# urlbar summon → INSERT badge + visible nav-bar
key o
shot 02-urlbar-summoned
key Escape
shot 03-back-to-normal

# hint mode
key f
shot 04-hints-visible
key Escape

# insert mode via content field (BEST-EFFORT: label assignment can vary run to
# run; authoritative INSERT evidence is f1 shot 19). Hint BEFORE scrolling (scrolled
# pages may have zero visible targets, which ends hint mode instantly). With
# the playground's five targets the input's home-row label is 'g'.
key f
keys g
shot 06-after-hint-activate
key Escape

# scroll (j x5) — content should have moved
keys j j j j j
shot 05-scrolled

# reserved override proof: Ctrl+T must open OUR blank tab + urlbar (not crash),
# Ctrl+W must close it and land back on the playground
key ctrl+t
shot 07-ctrl-t-ours
key Escape
key ctrl+w
shot 08-ctrl-w-closed
