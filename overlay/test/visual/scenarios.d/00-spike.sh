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

# scroll (j x5) — content should have moved
keys j j j j j
shot 05-scrolled

# insert mode via content field: hint to the input (labels are home-row; the
# first candidate is 'a' when few targets — best-effort for the spike)
key f
keys a
shot 06-after-hint-activate

# reserved override proof: Ctrl+T must open OUR blank tab + urlbar (not crash),
# Ctrl+W must close it and land back on the playground
key ctrl+t
shot 07-ctrl-t-ours
key Escape
key ctrl+w
shot 08-ctrl-w-closed
