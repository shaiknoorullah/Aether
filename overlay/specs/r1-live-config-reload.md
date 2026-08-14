# r1 — Live Config Reload (`:reload`, no restart)

## 1. Today → Instead → Thinnest

**Today**: `AetherConfig.load()` runs once at init (`aether.uc.js:2023`) and every consumer reads the object it produced. `:theme_reload` re-reads the *wal file* from disk but takes `tomlColors` from that startup config, so changing `[theme.colors]`, a keybinding, or the widget order means quitting the browser. Friction-log entry #2, day 1: restarting a browser to change a colour is the least riceable thing in the overlay, and it is the single largest obstacle to tuning anything.

**Instead**: `:reload` re-reads `~/.config/aether/aether.toml` (plus the local overlay file, r5) and re-applies everything that can be re-applied without a restart — theme, keymap, statusbar widgets, options, boosts config. Optionally a watcher, so **saving the file is the reload**. Hyprland's actual magic isn't its config language; it's that you save and it's already there.

**Thinnest**: one pure module (`aether-reload.sys.mjs`) that diffs two config objects into a set of *reapply domains*, one `applyConfig(config, domains)` glue function that the existing init path also calls, and one polling watcher on mtime, owned by a process-wide service. No new TOML beyond one switch.

> **Note**: this is the overlay's first persistent polling timer. b1 is *not* a precedent — `readBoost` stats on demand, once per navigation, behind a per-domain mtime cache. Polling is new here, and it is chosen over `nsIFileWatcher` because one 1s `IOUtils.stat` is cheaper to maintain than a platform file-watching surface, not because anything else already does it.

## 2. Exact behavior

**`:config_reload`** (palette; zero-arg; completable; no default binding — bindable like any registry command). **Not `reload`**: that name is taken by the shipped page-reload command (`aether-palette.sys.mjs:30`, bound to `r` in `aether.toml:114`), and registering over it would silently turn `r` into a config reload. The name is symmetric with `theme_reload`.

Re-reads the config sources, deep-merges as at startup, diffs against the live config, and applies only the domains that changed:

| Domain | Reapplied by | Notes |
|---|---|---|
| `theme` | existing `applyTheme()` | now takes `tomlColors` from the *fresh* config |
| `style` | r2's `applyStyle()` | radius/gaps/motion vars |
| `keymap` | rebuild the key matcher | see the mode-preservation rule below |
| `statusbar` | rebuild widget registry | running schedulers cancelled, re-created |
| `options` | read through | `scroll_step`, `hint_chars`, `pending_timeout_ms` are read per-use already |
| `boosts` | rebuild registry from `dir`, invalidate cache, then re-apply **or `BoostClear`** per open tab according to `enabled` | a disabled boost must be *removed*, not left applied until the next navigation |
| `ai` | update `aiConfig` | in-flight request untouched; persisted pref still wins over TOML |
| `focus` | read through | `quiet_notifications` is consulted at session start |
| `workspaces.resurrect` | read through | b3 reads it per-capture |

Statusbar message names what actually changed: `reloaded: theme, keymap` — or `reloaded: nothing changed` (neutral; a no-op reload is a normal outcome, not an error).

**Restart-only paths** are reported, never silently ignored: `workspaces.default`, `graveyard.cap`, and `[keymap.reserved]` (bound at window creation). The message says so once: `reloaded: theme — restart for: graveyard.cap`. Naming them is the whole feature; a config system that silently ignores half your edits is worse than one that requires a restart.

`DOMAIN_MAP` is **path-level, not section-level** — `workspaces.resurrect` is live-reloadable while its sibling `workspaces.default` is not, and a section-level map cannot express that. Every later spec that adds a TOML section adds its own entry in the same change (r2 `[style]`, r4 `[panels]`, r5 `[privacy]`, and so on).

**Reloading the keymap must not change your mode.** `createEngine(config)` owns `{mode, buffer}`, and a fresh one starts in `normal`. Rebuilding it while you are typing in a textarea drops you to normal mid-sentence and the rest of your keystrokes are swallowed with no visible cause — the exact class of bug that makes live reload feel haunted. So: the pending buffer is cancelled, the new engine inherits the old mode, and the `keymap` domain is **deferred entirely while `mode !== "normal"`**, applied on the next return to normal. Hint mode additionally has live child-process state, so deferring is the only correct answer there.

**Parse failure is a no-op — which requires a parser that can fail.** The shipped `parseToml` cannot: lines without `=` are skipped, unterminated sections are skipped, junk becomes a string value, nothing throws, and no line number is tracked. Combined with `deepMerge(DEFAULTS, parsed)`, a *partially read* file resolves its absent keys to **DEFAULTS, not to the previously live values** — so the watcher catching a file mid-write silently reverts the whole keymap and cheerfully reports `reloaded: keymap`.

Two changes, both in this spec's scope:

1. `parseToml` returns `{ok, sections, errorLine}` and rejects on the first line that is neither blank, comment, `[section]`, nor `key = value`. `AetherConfig.load()` treats `!ok` as *keep the previous config* and reports `config unchanged: line 41`.
2. The watcher **stats twice, one interval apart, and reads only when size and mtime are stable**, so a file being written non-atomically (`>` redirect, `sed -i`, `git checkout`) is never parsed at all.

The f3 all-or-nothing rule generalized: a broken dotfile never half-applies and never bricks the chrome.

**Watcher** (`[options] config_watch`, default `true`): a 1s `IOUtils.stat` on each config source, owned by **one process-wide service** (`aether-reload-service.sys.mjs`), not by each window. `aether.uc.js` runs per browser window, so a per-window timer means N pollers, N reload passes and N statusbar messages per save — and a window opened after an edit holds a different baseline, so the same reload reports `reloaded: theme` in two windows and `nothing changed` in a third. The service owns the interval and the last-known mtimes and broadcasts to registered windows, matching the f4/f5 service pattern. `false` disables it; `:config_reload` still works.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[options]
config_watch = true   # save-to-apply; false = :reload only
```

New registry command: `config_reload` — zero-arg, completable. `theme_reload` **stays** (muscle memory, and it is genuinely cheaper); `reload` keeps its shipped meaning, page reload.

## 3. Pure vs glue

- **`aether-reload.sys.mjs`** (pure, Node-testable): `diffConfig(oldCfg, newCfg)` → `{changed: Set<domain>, restartOnly: Set<path>}` — deep structural comparison over a declared **path-level** map, not a generic deep-diff; `describeReload(changed, restartOnly)` → the statusbar string; `DOMAIN_MAP`; `deferKeymap(mode)` → whether the keymap domain applies now or on return to normal.
- **`aether-reload-service.sys.mjs`** (glue singleton): the one interval, the last-known mtimes, the stat-twice stability check, and the broadcast to registered windows. Matches the f4/f5 service pattern.
- **`aether-config.sys.mjs`**: `parseToml` gains the `{ok, sections, errorLine}` return; `AetherConfig.load()` gains a `{sources}` return so the service knows what to stat, and treats `!ok` as "keep previous".
- **`aether.uc.js`** (glue): `applyConfig(config, domains)` — the shared path init and `:config_reload` both call; engine rebuild preserving mode; widget scheduler teardown; boost registry rebuild plus per-tab re-apply or `BoostClear`.
- **`aether-strings.sys.mjs`**: reload/no-change/parse-failure/restart-required copy — inside the f6 lexicon sweep by construction.

## 4. Unit tests (behavioral) — `overlay/test/unit/r1-reload.test.mjs`

1. identical configs → `changed` empty; `describeReload` yields the neutral no-change line
2. a changed `[theme.colors]` value → `changed` contains exactly `theme`, nothing else
3. a changed keybinding → exactly `keymap`; a reordered `[statusbar] widgets` → exactly `statusbar`
4. two domains changed at once → both reported, in a deterministic order (message text is stable)
5. `graveyard.cap` changed → empty `changed`, `restartOnly` names it; `describeReload` states it explicitly
6. `[keymap.reserved]` changed → restart-only, never silently applied (regression guard: reserved chords bind at window creation)
7. added and removed keys (not just changed values) both register as changes
8. a domain whose value changes to a deep-equal object → **no** change reported (no spurious reapply from re-parsing)
9. hostile/malformed config object (null, missing sections, wrong types) → diff never throws, degrades to "no change"
10. `DOMAIN_MAP` covers every **leaf path** present in `DEFAULTS` — guard against a new TOML key silently belonging to no domain. Asserted against today's `DEFAULTS`, which includes `focus.quiet_notifications` and `workspaces.resurrect`; the map must classify both as live, and `workspaces.default`/`graveyard.cap` as restart-only
11. `deferKeymap`: normal → apply now; insert/hint/palette/panel → defer
12. reload copy from `aether-strings` is non-empty and passes the f6 lexicon sweep (parse-failure copy asserted neutral — a typo is not a failure state), and every new export survives the f6 test-11 harness, which calls each export as `fn(task, "34m")` — so exports take a single pre-joined string, or are named without `message`/`text`

**Parser (the change this spec makes to `aether-config.sys.mjs`)**:

13. `parseToml` on a valid file → `{ok: true}` with the same sections it produces today (byte-compatible with every existing config test)
14. a line that is neither blank, comment, `[section]` nor `key = value` → `{ok: false, errorLine: n}` with the correct line number
15. a **truncated** file (valid prefix, cut mid-line) → `{ok: false}` — the mid-write case, asserted directly
16. `load()` with `!ok` returns the previous config object identity-unchanged, never a `DEFAULTS` merge

`overlay/test/unit/r1-config.test.mjs`:

17. config sync guard: `DEFAULTS.options.config_watch` parses identically from `overlay/config/aether.toml` (f0 pattern)
18. `config_reload` and the shipped `reload` are **distinct REGISTRY entries with distinct descriptions**; `complete("re")` finds both plus `theme_reload`; `reload`'s implementation is still page reload (regression guard — the naive version of this feature silently overwrites it)

## 5. Visual states — `overlay/test/visual/scenarios.d/h1-live-config-reload.sh`

(`h` prefix keeps combined-run ordering after the `g` boost scenarios — the v1.1.0 lesson.)

1. **baseline** — browser running, gruvbox, default widget order
2. **theme changed without restart** — scenario rewrites `[theme.colors]` on disk, runs `:config_reload`, shot shows recoloured chrome and `reloaded: theme` in the statusbar
3. **keymap changed without restart** — rebind `j`, `:config_reload`, press the new key, shot proves the new binding is live
4. **watcher path** — with `config_watch = true`, write the file and *don't* run any command; shot after the interval shows the change applied
5. **broken config is a no-op** — write invalid TOML, wait past the interval: chrome unchanged, one calm line, and the previous config still active (asserted by pressing a rebound key)
6. **mid-write is never parsed** — write the file in two chunks with a pause longer than the interval between them; assert no reload fired on the truncated prefix and the keymap never reverted
7. **`r` still reloads the page** — after `:config_reload` exists, press `r` on a fixture page and assert a navigation occurred (the collision guard, on screen)
8. **insert mode survives a reload** — focus a textarea, touch the config on disk, keep typing: every character lands in the field and the mode badge still reads INSERT

## 6. Non-goals (budget protection)

- **No config write path.** `:reload` reads. Writing is r5's job and it writes a *different* file.
- **No hot-swap of restart-only domains** — reserved chords and workspace/graveyard construction stay startup-bound. Naming them honestly is the feature; making them dynamic is a rewrite of three subsystems.
- **No file-watching API** (`nsIFileWatcher`, inotify) — mtime polling at 1s, same decision b1 made. One less platform surface to maintain.
- **No partial application on parse failure**, and no "best effort" merge of a broken file. All-or-nothing, per f3.
- **No config migration/versioning machinery** — the TOML subset is small enough that additive keys are the only change shape.
- **No reload hooks for user scripts** — that arrives with x1's facade, which registers its own reload participant then.
