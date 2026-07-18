# Aether Overlay — Phase 0 Spike

Zero-chrome + modal keyboard interception on stock Firefox. No fork, no build.
The loader is [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) (MIT,
vendored at install time, gitignored); everything Aether is in this directory.

## Layout

```
overlay/
  install.sh              provision the 'aether' profile + autoconfig
  bin/aether              launcher (firefox --no-remote -P aether)
  prefs/user.js           telemetry-off + hardening + spike dev prefs
  config/aether.toml      keymap + options → ~/.config/aether/aether.toml
  chrome/
    userChrome.css        zero-chrome, statusbar styling
    userContent.css       (placeholder)
    utils/                fx-autoconfig loader (vendored by install.sh, not in git)
    JS/
      aether.uc.js                modal engine, statusbar, tab/nav commands (per-window)
      aether-config.sys.mjs       TOML subset parser + config loader
      aether-actors.sys.mjs       JSWindowActor registration (once)
      aether-content-parent.sys.mjs  actor: content → chrome relay
      aether-content-child.sys.mjs   actor: scroll, hints, focus tracking in content
```

## Install (Arch)

```sh
cd overlay
./install.sh            # needs sudo only for the two autoconfig files in /usr/lib/firefox
./bin/aether            # first run; -purge to clear the startup cache after script edits
```

`install.sh` does: fetch fx-autoconfig → copy `config.js` + `defaults/pref/config-prefs.js`
into the Firefox install dir (env `FIREFOX_DIR` to override detection) → create the
`aether` profile → symlink `overlay/chrome` into it → install `user.js` → seed
`~/.config/aether/aether.toml` if absent.

## After editing scripts

Firefox caches autoconfig scripts in the profile's `startupCache`. Either run
`./bin/aether -purge`, or in-browser: `about:support` → "Clear startup cache".
`userChrome.css` changes need only a restart; TOML changes apply on restart too.

## Debugging

`user.js` enables the Browser Toolbox (`devtools.chrome.enabled`,
`devtools.debugger.remote-enabled`). Open it with Ctrl+Alt+Shift+I.
Errors from the overlay land in the Browser Console (Ctrl+Shift+J).

## Spike exit criteria (from docs/execution-plan.md)

- Chrome hidden; urlbar summons on `o`/`:` and hides on blur.
- Ctrl+W/T/N and Ctrl+Tab handled by Aether, not Firefox.
- Normal-mode printable keys never reach page content.
- `j/k d/u gg/G H/L o t x J/K f` work on real sites.
- Survives a Firefox point release with zero changes.

## Known spike limitations (accepted)

- Hints are top-frame only, MVP label placement.
- Insert-mode detection = content focus tracking + urlbar focus; edge cases expected.
- No workspaces/statusbar widgets yet — those are floor items, not spike scope.
