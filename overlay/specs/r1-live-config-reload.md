# r1 — Live Config Reload (`:reload`, no restart)

## 1. Today → Instead → Thinnest

**Today**: `AetherConfig.load()` runs once at init (`aether.uc.js:2023`) and every consumer reads the object it produced. `:theme_reload` re-reads the *wal file* from disk but takes `tomlColors` from that startup config, so changing `[theme.colors]`, a keybinding, or the widget order means quitting the browser. Friction-log entry #2, day 1: restarting a browser to change a colour is the least riceable thing in the overlay, and it is the single largest obstacle to tuning anything.

**Instead**: `:reload` re-reads `~/.config/aether/aether.toml` (plus the local overlay file, r5) and re-applies everything that can be re-applied without a restart — theme, keymap, statusbar widgets, options, boosts config. Optionally a watcher, so **saving the file is the reload**. Hyprland's actual magic isn't its config language; it's that you save and it's already there.

**Thinnest**: one pure module (`aether-reload.sys.mjs`) that diffs two config objects into a set of *reapply domains*, one `applyConfig(config, domains)` glue function that the existing init path also calls, and one `nsIFileWatcher`-free polling watcher on mtime (the same decision b1 already made for boost files — mtime on an interval, no file-watching API). No new TOML beyond one switch.

## 2. Exact behavior

**`:reload`** (palette; zero-arg; completable; no default binding — bindable like any registry command). Re-reads the config sources, deep-merges as at startup, diffs against the live config, and applies only the domains that changed:

| Domain | Reapplied by | Notes |
|---|---|---|
| `theme` | existing `applyTheme()` | now takes `tomlColors` from the *fresh* config |
| `style` | r2's `applyStyle()` | radius/gaps/motion vars |
| `keymap` | rebuild the key matcher | pending sequence cancelled first |
| `statusbar` | rebuild widget registry | running schedulers cancelled, re-created |
| `options` | read through | `scroll_step`, `hint_chars`, `pending_timeout_ms` are read per-use already |
| `boosts` | invalidate mtime cache, re-apply to open tabs | reuses b1's apply path |
| `ai` | update `aiConfig` | in-flight request untouched; persisted pref still wins over TOML |

Statusbar message names what actually changed: `reloaded: theme, keymap` — or `reloaded: nothing changed` (neutral; a no-op reload is a normal outcome, not an error).

**Restart-only domains** are reported, never silently ignored: `workspaces.default`, `graveyard.cap`, and `[keymap.reserved]` (bound at window creation) can change in the file but do not take effect until restart. The message says so once: `reloaded: theme — restart for: graveyard.cap`. Naming them is the whole feature; a config system that silently ignores half your edits is worse than one that requires a restart.

**Parse failure is a no-op.** A malformed TOML file leaves the live config completely untouched and prints one calm line (`config unchanged: line 41`). The f3 all-or-nothing rule generalized: a broken dotfile never half-applies and never bricks the chrome. This is the property that makes editing config in a live browser safe.

**Watcher** (`[options] config_watch`, default `true`): a 1s interval `IOUtils.stat` on each config source; an mtime change triggers the same path as `:reload`. Cheap, no new API surface, and identical semantics to typing the command — one code path, two triggers. `false` disables it and `:reload` still works.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[options]
config_watch = true   # save-to-apply; false = :reload only
```

New registry command: `reload` — zero-arg, completable. `theme_reload` **stays** as an alias for the theme-only path (muscle memory, and it is genuinely cheaper).

## 3. Pure vs glue

- **`aether-reload.sys.mjs`** (pure, Node-testable): `diffConfig(oldCfg, newCfg)` → `{changed: Set<domain>, restartOnly: Set<key>}` — deep structural comparison over a declared domain map, not a generic deep-diff; `describeReload(changed, restartOnly)` → the statusbar string; `DOMAIN_MAP` — the one table saying which TOML paths belong to which reapply domain, and which are restart-only.
- **`aether-config.sys.mjs`**: `AetherConfig.load()` gains a `{sources}` return so the watcher knows what to stat; parse errors surface as a rejected result rather than a partial object.
- **`aether.uc.js`** (glue): `applyConfig(config, domains)` — the shared path init and `:reload` both call; watcher interval; cancel-and-rebuild for the key matcher and widget schedulers; boost cache invalidation.
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
10. `DOMAIN_MAP` covers every top-level section present in `DEFAULTS` — guard against a new TOML section silently belonging to no domain
11. reload copy from `aether-strings` is non-empty and passes the f6 lexicon sweep (parse-failure copy asserted neutral — a typo is not a failure state)

`overlay/test/unit/r1-config.test.mjs`:

12. config sync guard: `DEFAULTS.options.config_watch` parses identically from `overlay/config/aether.toml` (f0 pattern)
13. `reload` in REGISTRY, zero-arg, parses; `complete("re")` finds `reload` and `theme_reload`

## 5. Visual states — `overlay/test/visual/scenarios.d/h1-live-config-reload.sh`

(`h` prefix keeps combined-run ordering after the `g` boost scenarios — the v1.1.0 lesson.)

1. **baseline** — browser running, gruvbox, default widget order
2. **theme changed without restart** — scenario rewrites `[theme.colors]` on disk, runs `:reload`, shot shows recoloured chrome and `reloaded: theme` in the statusbar
3. **keymap changed without restart** — rebind `j`, `:reload`, press the new key, shot proves the new binding is live
4. **watcher path** — with `config_watch = true`, write the file and *don't* run any command; shot after the interval shows the change applied
5. **broken config is a no-op** — write invalid TOML, wait past the interval: chrome unchanged, one calm line, and the previous config still active (asserted by pressing a rebound key)

## 6. Non-goals (budget protection)

- **No config write path.** `:reload` reads. Writing is r5's job and it writes a *different* file.
- **No hot-swap of restart-only domains** — reserved chords and workspace/graveyard construction stay startup-bound. Naming them honestly is the feature; making them dynamic is a rewrite of three subsystems.
- **No file-watching API** (`nsIFileWatcher`, inotify) — mtime polling at 1s, same decision b1 made. One less platform surface to maintain.
- **No partial application on parse failure**, and no "best effort" merge of a broken file. All-or-nothing, per f3.
- **No config migration/versioning machinery** — the TOML subset is small enough that additive keys are the only change shape.
- **No reload hooks for user scripts** — that arrives with x1's facade, which registers its own reload participant then.
