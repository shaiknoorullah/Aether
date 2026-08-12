# Aether Overlay — v1.1.0 (the adoption floor + boosts + resurrection)

Zero-chrome, modal, themed, workspace-aware Firefox overlay. No fork, no build
step, no dependencies. The loader is our own ~45 lines of autoconfig
(`loader/`); everything Aether is in this directory.

**Budget audit (v1.1.0)**: 5,137 lines total on the runtime path —
4,451 privileged JS, 331 chrome markup/CSS, 355 config/prefs/loader/install
(+1,502 over the v1.0.0 audit figure; see the changelog in
`docs/execution-plan.md`). Still zero npm packages, zero runtime dependencies,
zero build steps: tests run on bare `node --test`, the browser loads the files
as-is.

## What's here (each claim is test-proven, see `test/`)

- **Zero-chrome + modal keys** — tab strip/nav-bar hidden; urlbar summons on
  `o`/`:` and hides on blur; four modes (normal/insert/hint/palette); reserved
  chords (Ctrl+W/T/N, Ctrl+Tab) are Aether's in *every* mode; normal-mode
  printable keys never reach page content. (f1 unit tests + spike shots)
- **Command palette** — `:` opens an input strip; every command runnable by
  name; prefix completion with Tab cycling; unknown commands get neutral copy
  (`no command: x`), never error styling. (f1)
- **Statusbar widgets** — TOML-ordered widget registry; builtins `mode`
  `workspace` `focus` `url` `msg` `tabs` `ai` `clock` `date`; unknown ids skip
  silently; a throwing widget renders an empty slot, never breaks the bar. (f2)
- **Theming** — pywal `colors.json` → `[theme.colors]` TOML → builtin gruvbox,
  all-or-nothing validation (`#rrggbb` only, which is also the CSS injection
  barrier); `:theme_reload` re-reads from disk live. (f3)
- **Vertical tabs + graveyard** — native vertical tabs restyled and hidden at
  rest, summoned with `T`; every real tab close is archived to a 500-entry ring
  (`<profile>/aether-graveyard.json`); `:graveyard [query]` searches newest-first,
  Enter resurrects; survives relaunch. Private windows never recorded. (f4)
- **Workspaces + persistence** — `:ws <name>` switch-or-create, `gw` cycles;
  each workspace container-isolated (contextualIdentities); other workspaces'
  tabs hidden, not closed; full state restores across restart from
  `<profile>/aether-workspaces.json`. (f5)
- **EF supports** — `:focus <task>` starts a session (never a timer: ends only
  on `:done` or a workspace switch); statusbar shows task + calm elapsed time;
  web notifications suppressed during a session with a crash-safe restore
  marker; clock **and** date in the default bar (ambient time anchoring). A
  lexicon sweep asserts no string in the overlay contains shame vocabulary
  (`fail`, `streak`, `wasted`, …) — the non-shaming guarantee is mechanical. (f6)
- **Local AI sidebar** — `a` toggles a chrome-owned chat panel streaming from
  an OpenAI-compatible gateway (`/v1/chat/completions`); **loopback hosts
  only**, enforced in code; hard kill switch, default OFF — when off the
  network path throws (the visual test proves zero requests leave); model
  output is `textContent` only, never rendered or executed. (f7)
- **Site boosts, deterministic** — per-domain CSS dotfiles
  (`~/.config/aether/boosts/<domain>.css`) applied to matching http(s) pages on
  load: exact normalized host first, then parent domains down to two labels
  (naive suffix walk, no PSL — documented edge). `:zap` enters an element
  picker on the hint machinery (distinct red badges — pick-to-hide never looks
  like pick-to-click); picking appends a dated `display: none !important` rule
  to the domain's dotfile and re-applies. The dotfile alone persists the zap
  across relaunch — no hidden state store; undo is deleting the line in vim.
  `:boost_off` restores the pristine page (session-scoped by design;
  visual-proven), `:boost_on` re-enables (registry-level unit test). All boost
  CSS passes a lexical sanitizer on every apply: `@import`, non-`data:`
  `url()`, and `image-set()` sources are stripped, escape-decoded spellings
  included — a boost file has no known network-fetch channel. (b1)
- **AI CSS boosts** — `:boost` samples the page's *structure* (top selectors +
  computed colors/fonts — never page text, proven by the visual scenario's
  request-log sentinel check), renders it with the active `--aether-*` palette
  into a prompt, and streams a CSS-only reskin from the f7 gateway into a
  preview panel with a strip summary (each sanitized-away rule named, or
  `nothing stripped`). Enter accepts — dated append to the b1 dotfile,
  re-applied through the same sanitizer; Esc dismisses. Nothing is ever
  auto-applied or auto-written; one generation per explicit `:boost`; replies
  must be a single fenced CSS block, hard 32 KiB gate cap. Kill switch off →
  the exact f7 off-state, zero requests (mock-log-proven). (b2)
- **Context resurrection** — scroll position is part of workspace context.
  Throttled top-frame scroll samples (1/s + pagehide flush) store
  `{url, scrollY, capturedAt}` per tab inside `aether-workspaces.json`
  (schema 2; old schema-less files still deserialize). A restart-restored tab
  whose completed load exactly matches the recorded url gets one silent
  instant scroll — the user scrolling first disarms it, a url mismatch drops
  the stale record, and `y = 0` deletes rather than stores. Records prune at
  30 days, on orphaned ids, and on url drift; closing a tab drops its record.
  No UI, no banner, no new strings, no keybinding — `[workspaces]
  resurrect = false` turns capture and restore off. (b3)

## Keybindings (defaults from `config/aether.toml`)

| Key | Command | | Key | Command |
|---|---|---|---|---|
| `j` / `k` | scroll down / up | | `t` | new tab |
| `d` / `u` | half-page down / up | | `x` | close tab (→ graveyard) |
| `gg` / `G` | top / bottom | | `J` / `K` | next / previous tab |
| `H` / `L` | history back / forward | | `T` | toggle vertical tabs |
| `o` | open (summon urlbar) | | `r` | reload |
| `O` | open in new tab | | `f` | link hints (home-row labels) |
| `i` | insert mode | | `a` | toggle AI sidebar |
| `gw` | next workspace | | `:` | command palette |

Reserved chords, Aether's in every mode: `Ctrl+W` close tab, `Ctrl+T`/`Ctrl+N`
new tab, `Ctrl+Tab` next tab. `Escape` returns to normal from any mode. In the
palette: `Tab` cycles completions/candidates, `Enter` runs, `Escape` closes.

Palette-only commands (no default binding): `open <url>`, `tab <n>`,
`ws <name>`, `ws_rename <name>`, `ws_next`, `graveyard [query]`,
`focus <task>`, `done`, `theme_reload`, `ai_on`, `ai_off`, `zap`, `boost`,
`boost_on`, `boost_off`, `boost_edit` (opens the resolved boost dotfile in a
tab — real editing happens in vim). All five boost/zap commands are zero-arg
and completable; any can be bound in `[keymap.normal]` like every registry
command.

## Layout

```
overlay/
  install.sh              provision the 'aether' profile + autoconfig loader
  bin/aether              launcher (firefox --no-remote -P aether)
  prefs/user.js           telemetry-off + hardening + vertical-tab/restore prefs
  config/aether.toml      keymap + options → ~/.config/aether/aether.toml
  loader/                 our autoconfig loader (replaces fx-autoconfig)
  specs/                  f1–f7 + b1–b3 feature specs (behavior + tests + non-goals)
  test/                   unit (node --test, zero deps) + visual (real browser)
  chrome/
    userChrome.css        zero-chrome, statusbar, palette, sidebar theming
    ai-sidebar.html       static chrome page for the AI panel (no script)
    JS/
      aether.uc.js                     chrome glue: DOM, events, fetch, dispatch
      aether-config.sys.mjs            TOML subset parser + defaults
      aether-keys.sys.mjs              pure mode machine + key matcher
      aether-palette.sys.mjs           pure command registry/parse/completion
      aether-widgets.sys.mjs           pure widget registry + scheduler
      aether-theme.sys.mjs             pure palette parse/validate/emit CSS
      aether-graveyard.sys.mjs         pure ring store + search + serde
      aether-graveyard-service.sys.mjs singleton + JSON persistence (glue)
      aether-workspaces.sys.mjs        pure workspace model + serde
      aether-workspaces-service.sys.mjs singleton + atomic JSON writes (glue)
      aether-focus.sys.mjs             pure focus session + elapsed formatting
      aether-strings.sys.mjs           EF copy — the lexicon-sweep target
      aether-ai-client.sys.mjs         pure request builder + SSE parser
      aether-ai-state.sys.mjs          pure kill switch + conversation model
      aether-boosts.sys.mjs            pure domain match + registry + zap selector + CSS sanitizer
      aether-boost-gen.sys.mjs         pure skeleton serializer + prompt + extract + acceptance gate
      aether-resurrect.sys.mjs         pure scroll-context records + prune + serde guards
      aether-actors.sys.mjs            JSWindowActor registration (once)
      aether-content-parent.sys.mjs    actor: content → chrome relay
      aether-content-child.sys.mjs     actor: scroll, hints, focus tracking
```

## Install (Arch)

```sh
cd overlay
./install.sh            # needs sudo only for the loader files in /usr/lib/firefox
./bin/aether            # first run; -purge to clear the startup cache after script edits
```

`install.sh` does: install `loader/aether-loader.cfg` (+ `zz-aether.js` pref)
into the Firefox install dir (env `FIREFOX_DIR` to override detection) → create
the `aether` profile → symlink `overlay/chrome` into it → install `user.js` →
seed `~/.config/aether/aether.toml` if absent.

## Tests

```sh
node --test overlay/test/unit/      # 322 tests, node:test + node:assert only
overlay/test/visual/run.sh          # real-browser scenarios under Xvfb
```

Unit tests cover the pure modules (key engine, palette, widgets, theme,
graveyard, workspaces, focus, strings, AI client/state, boosts, boost-gen,
resurrect, config sync guards). Visual scenarios prove what purity keeps out
of unit tests: chord interception, chrome hiding, graveyard/workspace
persistence across relaunch, notification pref suppress/restore (prefs.js
evidence), the AI kill switch (mock-gateway request log gains zero entries
while off — asserted again through `:boost`), zap persistence via the dotfile
alone across relaunch, the b2 request-log sentinel check (page text never
reaches the model; one request per generation), and scroll position surviving
a workspace round-trip and a relaunch.

## After editing scripts

Firefox caches autoconfig scripts in the profile's `startupCache`. Either run
`./bin/aether -purge`, or in-browser: `about:support` → "Clear startup cache".
`userChrome.css` changes need only a restart; TOML changes apply on restart too.

## Debugging

`user.js` enables the Browser Toolbox (`devtools.chrome.enabled`,
`devtools.debugger.remote-enabled`). Open it with Ctrl+Alt+Shift+I.
Errors from the overlay land in the Browser Console (Ctrl+Shift+J).

## Known limitations (accepted, v1.1.0)

- Boost domain fallback is a naive suffix walk, no PSL — a `co.uk`-class
  parent can over-match; the fix is the exact-host dotfile.
- Boost CSS styles the top document only: no Shadow DOM, no iframes.
- The sanitizer is lexical and scoped to the known fetch vectors it strips —
  it is not a CSS parser.
- `:boost_off` is session-scoped; permanence lives in the dotfile.
- `:boost_edit` is proven as a registry command only; its open-in-tab behavior
  is glue. `:boost_on` re-enable is unit-proven at the registry level; the
  visual scenario exercises `:boost_off` only.
- Scroll restore is one shot, instant, clamp accepted — lazy-loading pages may
  restore short. Arming happens on restart restore only, and only on an exact
  url match.

- Hints are top-frame only, MVP label placement.
- Insert-mode detection = content focus tracking + urlbar focus; edge cases expected.
- Workspaces/focus/AI conversation are per-primary-window; multi-window gets
  only the f6 notification-restore stand-down, nothing more.
- Restored tabs are fresh loads (url+title, no scroll/form/history state) —
  same rule for graveyard resurrection.
- The "survives a Firefox point release" criterion is a standing monthly drill,
  not something this repo's tests can prove; last verified against the
  LibreWolf build the visual harness runs.
