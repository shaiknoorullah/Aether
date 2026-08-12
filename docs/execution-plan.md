# Execution Plan — Research → Daily Driver

Prime directive: every phase fits the maintenance budget. Rebases get an evening a month; features get evenings and weekends. Anything that doesn't fit gets cut, not stretched.

Second directive, learned immediately: **I won't adopt a bare browser, even my own.** The daily-drive switch happens when *my* floor exists, not when a minimal spike works. The floor is defined below and it is allowed to take months — a gate I'll actually pass beats a fast one I won't.

## The Adoption Floor (what "switchable" means for me)

1. Vim modal keys + command palette
2. Workspaces with session persistence
3. Tab graveyard + vertical tabs
4. Statusbar with widgets (tmux/polybar-class)
5. EF supports (ambient time anchoring, task-conditioned focus, non-shaming structure)
6. Theming — pywal/base16 system inheritance
7. Local-AI sidebar (OpenAI-compatible gateway, hard kill switch)

Explicitly *not* floor: context resurrection beyond what workspaces+persistence already give (deferred), native blocking (uBO works on Firefox; revisit only if it fails me), agent runtime (last, after the floor is daily-driven).

## Phase 0 — The Spike (no fork, no build)

Goal: prove zero-chrome + modal keyboard interception on **stock Firefox** via the autoconfig/userChromeJS pattern (fx-autoconfig). No build infrastructure — the overlay starts as a dotfiles-style directory symlinked into a dedicated `aether` profile. Cheapest possible test of the engine decision: if privileged autoconfig JS can own the keyboard and the chrome, the thin-fork thesis holds before I own a single patch.

Tasks:
1. **Scaffold** `overlay/`: `chrome/` (userChrome.css, userContent.css), autoconfig loader (`config.js` + `defaults/pref/config-prefs.js`), `user.js` prefs, install script provisioning the `aether` profile.
2. **Zero-chrome**: hide tab strip, nav-bar, urlbar (summonable); full-viewport content.
3. **Modal input**: capture-phase keydown listener in privileged JS. Prove the load-bearing claims: override Ctrl+W/T/N/Tab; normal-mode keys never reach page content.
4. **Minimum navigable set**: `j/k`, `d/u`, `gg/G`, `H/L`, `o`, `t`/`x`, `J/K`, `f` hints (MVP quality).
5. **Config as data**: keymap + options in TOML under `~/.config/aether/`.
6. **Prefs baseline**: telemetry off, arkenfox-lite hardening.

Exit: shortcuts overridden, chrome hidden, modal browsing works on real sites, survives a Firefox point release with zero changes. Estimate: 1–2 weeks of evenings. If autoconfig can't do some interception, that finding is the first legitimate source patch and Phase 2 starts early, with data.

## Phase 1 — Build the Floor

Order chosen by dependency and by how fast each piece makes the profile feel like *mine* (adoption is psychological; joy is load-bearing):

1. **Modal keys + palette** — from the spike; add ex-mode/command palette (urlbar repurposed or custom panel).
2. **Statusbar** — the chrome frame everything else hangs on: mode indicator, workspace name, URL, **clock (first EF piece: ambient time anchor)**. Widget API from the start: a widget = TOML entry + JS module returning text/color, so ArgoCD/GitHub/Timewarrior-class widgets are additions, not rewrites.
3. **Theming** — ingest pywal/base16 colors from disk into CSS variables; browser matches the rest of the rice. Cheap, high joy, do it early.
4. **Vertical tabs + graveyard** — style Firefox's native vertical tabs (136+) rather than rebuild; graveyard = auto-archive closed/stale tabs to local store, recallable from the palette. No tab death.
5. **Workspaces + persistence** — contextualIdentities for isolation + named session groups saved to disk, restore-on-open. (This already covers most of context resurrection.)
6. **EF supports** — task-conditioned focus mode (workspace-scoped tab filter + notification suppression, ends when the task ends, not on a timer), non-shaming language everywhere, time-in-context display. No streaks, no failure states.
7. **Local-AI sidebar** — sidebar panel → OpenAI-compatible gateway (`OLLAMA_ORIGINS`), kill switch in the statusbar.

Cadence: one floor item at a time, thinnest implementation that I'd actually use, 2-week personal verdict (keep/fix/kill) before the next. **Partial adoption starts early**: once items 1–4 exist, the aether profile becomes my browser for one real project; full switch waits for the floor.

Realistic cost: 2–4 months of evenings. That's the honest price of a gate I'll pass.

## Phase 2 — The Daily-Drive Gate

Floor complete → switch default browser for 30 days. Extensions: uBO + Bitwarden, nothing keyboard-related. Friction log, one line per annoyance. Gate: am I opening another browser out of *need*? Each instance is a fix or a scope cut. If the floor doesn't hold me for a month, the thesis needs rework before more building.

## Phase 3 — Own the Build (LibreWolf pattern) — only when forced

Trigger: the first requirement autoconfig cannot express (compile-time telemetry/Pocket removal, true pre-parse interception, branding). Not before.
- `patches/*.patch` + `mozconfig` + prefs + branding + build script; track the Firefox **release** channel.
- Monthly rebase drill from day one: pull tag, reapply, build, log wall-clock. Budget: one evening. Two consecutive over-budget months ⇒ cut features or evaluate ESR.

## Phase 4 — Beyond the Floor

Only after the gate passes: agent runtime (decision #2 control plane — MCP → validated WebExt messaging → Xray bridge, per-tool consent, everything logged), context resurrection deepening, native blocking if uBO ever fails, sync (resolve Iroh vs js-libp2p then).

Also post-gate: the **personalized-web ladder** (`docs/research/openui-ai-personalized-web.md`) — Tier 0 deterministic theming ships early inside floor item 3 (pywal/base16 + Zen-Boosts-style per-domain zaps + `base-select` UA theming when Gecko ships it); Tier 1 AI-generated CSS-only site boosts (local model → dotfile → deterministic apply) follows the local-AI sidebar; Tier 2 semantic calm-views and Tier 3 generative own-surface UIs (wandb-OpenUI patterns) are post-gate. Generated JS near page context is a different trust class — per-case consent, always.

## Standing Drills

- **Monthly**: Firefox update + rebase (or autoconfig no-op check), cost logged.
- **Per floor item**: friction-log review before starting the next.
- **Never**: adoption metrics, roadmaps for other people, or resurrecting the council.

## Changelog

### v1.0.0 — 2026-07-18

Phase 0 and Phase 1 complete: the spike plus all seven floor items, in order (f1 keys+palette, f2 statusbar widgets, f3 theming, f4 vertical tabs+graveyard, f5 workspaces+persistence, f6 EF supports, f7 local-AI sidebar). Next gate is Phase 2: daily-drive it for 30 days.

**Shipped** (specs in `overlay/specs/`, every behavioral claim backed by a test):

- Zero-chrome modal engine with four modes; reserved chords (Ctrl+W/T/N/Tab) ours in every mode; normal-mode printables never reach content.
- Command palette (`:`) with prefix completion; per-command candidate providers for exactly `graveyard` and `ws`, no more.
- Widget statusbar (9 builtins, TOML-ordered, throw-contained, pure scheduler).
- pywal/base16/builtin theming with all-or-nothing validation and `:theme_reload`.
- Native vertical tabs restyled + summoned on `T`; tab graveyard (500-entry ring, persistent, resurrectable, private windows never recorded).
- Container-isolated named workspaces with owned restore (sessionstore disabled); hidden-not-closed switching.
- EF supports: task-conditioned focus sessions (no timers, ever), notification suppression with crash-safe restore marker, ambient clock+date, mechanical non-shaming lexicon sweep over every string in the overlay.
- Local-AI sidebar: streaming chat against a loopback-only OpenAI-compatible gateway; hard kill switch default-OFF whose off state makes the network path throw — proven by a mock-gateway request log, not asserted in prose.
- Own ~45-line autoconfig loader (`overlay/loader/`) replacing the vendored fx-autoconfig dependency.

**Measured** (the thin-fork budget, audited): 3,635 lines on the runtime path — 2,982 privileged JS (largest file `aether.uc.js` at 1,439; 13 pure `.sys.mjs` modules + 4 glue), 314 chrome CSS/HTML/manifest, 339 config/prefs/loader/install. Zero source patches to Firefox, zero npm/runtime dependencies, zero build steps. Tests: 224 unit tests passing on bare `node --test`; 8 visual scenarios (spike + f1–f7) with per-feature screenshot/evidence runs, plus a combined final regression run.

**Cut, per spec non-goals** (budget protection; each revisitable only with daily-driving evidence): fuzzy matching, command history, aliases, macros, vim counts; user-supplied/network/exec widgets and per-widget config; theme file watching, base16 YAML ingestion, color math, page-content theming; own tab UI, stale-tab auto-archiving, graveyard dedup/session-state; workspace delete/merge/move-tab, multi-window semantics, lazy restore; focus timers/history/stats/persistence (identity, not deferral); AI page-context injection, output rendering, remote gateways, retries, model-parameter UI. Also still out per plan: native blocking (uBO on Firefox suffices), agent runtime, sync (Phase 4).

**Post-audit hardening** (main session, after manual verification of the full shot suite): prototype-pollution guard in the TOML parser (`__proto__`/`constructor`/`prototype` inert, unit-tested); cross-origin subframes can no longer flip auto-INSERT (same-origin-with-top gate on `Aether:Focus`); graveyard writes made atomic (`tmpPath`); spike scenario step 06 reordered before scrolling and marked best-effort; stale fx-autoconfig references removed. Unit count after hardening: 225.

**Honest edges**: hints top-frame only; insert-mode detection heuristic; per-primary-window model; "survives a Firefox point release" remains the monthly drill, not a repo-provable test — v1.0.0 verified against the harness's LibreWolf build.

### v1.1.0 — 2026-08-12

First post-floor increment: personalized-web ladder Tiers 0 and 1 (Phase 4 note) plus the "context resurrection deepening" item, scoped to scroll. Specs `overlay/specs/b1–b3`, every behavioral claim test-backed.

**Shipped**:

- **b1 — site boosts, deterministic**: per-domain CSS dotfiles (`~/.config/aether/boosts/<domain>.css`) applied on load; exact host first, parent-domain fallback (naive suffix walk, no PSL); IP/single-label hosts exact-only, IPv6 canonicalized. `:zap` element picker on the hint machinery (distinct red badges), appending dated `display: none !important` rules; relaunch persistence via the dotfile alone (visual-proven). `:boost_off`/`:boost_on` session-scoped toggles; `:boost_edit` opens the dotfile. Lexical sanitizer on every apply — `@import`, non-`data:` `url()`, `image-set()` sources stripped, escape-decoded spellings included; exfil fixture emerges with zero fetchable URLs.
- **b2 — AI CSS boosts**: `:boost` samples page structure only (selectors + computed colors/fonts; whitelist enforced twice, the request-log sentinel check proves page text never leaves), prompts the f7 gateway with the active `--aether-*` palette, streams into a preview with a strip summary. Enter accepts (dated append to the b1 dotfile, same sanitizer, one trust path), Esc dismisses; nothing auto-applied, one generation per invocation (log-proven), single-fenced-block contract, 32 KiB gate cap; `expression()`/`-moz-binding` stripped and named. Kill switch off → zero requests, mock-log-proven. Zero new TOML keys.
- **b3 — context resurrection**: per-tab `{url, scrollY, capturedAt}` records inside `aether-workspaces.json` (schema 2, additive; v1 files tolerated, hostile/malformed entries dropped individually, no prototype pollution). Capture via throttled top-frame scroll samples + pagehide flush; `y = 0` deletes; debounced atomic persistence. Restore: restart-restored tabs get one silent instant scroll on exact url match — user scroll disarms first, mismatch drops the record; workspace switches need no message (hidden-not-closed). 30-day/orphan/url-drift pruning. No UI, no strings, no keybinding; `[workspaces] resurrect` is the one switch.

**Measured** (the thin-fork budget, audited): 5,137 lines on the runtime path — 4,451 privileged JS (largest file `aether.uc.js` at 2,009; three new pure modules: `aether-boosts` 286, `aether-boost-gen` 208, `aether-resurrect` 82), 331 chrome CSS/HTML/manifest, 355 config/prefs/loader/install. Delta: **+1,502** over the documented v1.0.0 audit figure of 3,635 (that figure was taken before the post-audit hardening; v1.0.0 as committed measures 3,660, so the true feature delta is +1,477). Still zero source patches to Firefox, zero npm/runtime dependencies, zero build steps — verified: no package/lock/build files anywhere, no imports beyond `node:`/`chrome://`/`resource://`/relative. Tests: 322 unit tests passing on bare `node --test` (was 225); 11 visual scenarios (spike + f1–f7 + b1–b3) with evidence files (b1 dotfile persistence, b2 request-log sentinel + kill-switch zero-entries + one-shot assertion, b3 relaunch scroll shots), plus a combined `final-v11` regression run.

**Cut, per spec non-goals** (budget protection; revisitable only with daily-driving evidence): b1 — PSL, Shadow DOM/iframe styling, boost manager UI, un-zap command, cross-domain wildcards, file watching, persisted disable state, specificity machinery. b2 — JS output (ever; identity, not deferral), page text/attributes/screenshots in the prompt, remote gateways, auto-regeneration or per-pageload calls, iteration chat, overwrite/merge semantics, model/prompt tuning surface, cross-domain/batch mode. b3 — form/SPA state, per-history-entry scroll, iframe/nested scrollers, `scrollX`, retry-until-settled, same-session-reload restore, per-site opt-out, configurable retention, separate context file.

**Honest edges**: the naive suffix walk can over-match `co.uk`-class domains (exact-host file is the fix); the sanitizer is lexical, scoped to known fetch vectors, not a CSS parser; `:boost_edit` is proven only as a registry command and `:boost_on` only at the registry level — the visual scenario exercises `:boost_off`, not the re-enable or the edit tab; scroll restore is one-shot with the clamp accepted (lazy-loading feeds restore short), restart-restore arming and exact-url match only. Budget note, stated plainly: privileged JS grew ~49% in one release and the glue file `aether.uc.js` is now 2,009 lines — glue growth, not module growth, is the pressure point to watch at the monthly rebase drill.
