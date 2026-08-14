# Aether — Build Matrix

The one place feature status lives. **A version is complete or it isn't** — no per-feature ticks scattered through the docs, no partially-shipped versions.

This is *not* a successor to `docs/feature-matrix.md` (v1) or `docs/research-v2/feature-matrix-v2.md` (v2). Those are research artifacts, frozen as history, and their RICE/MoSCoW scoring machinery is retired — nobody extends them. This file tracks what gets built, in what version, against which spec.

**Ranking rule**: a feature earns its place by daily use and by fitting the maintenance budget. Anything without a spec is scope, not a commitment.

Last updated 2026-08-14.

---

## Status

| Version | Theme | Status |
|---|---|---|
| v1.0.0 | Spike + the seven floor items | **Complete** — 2026-07-18 |
| v1.1.0 | Site boosts, AI CSS boosts, context resurrection | **Complete** — 2026-08-12 |
| v1.2.0 | The rice pass | **Complete** — 2026-08-14 |
| v1.3.0 | The extension pass | Specs written (design-reviewed), not started |
| v1.4.0 | Panel sources | Specs written, not started |
| v2.0.0 | `aetherd` and integrations | Specs written, not started |
| v2.1.0 | The agent | Specs written, not started |

Phase 2 (the 30-day daily-drive gate) runs underneath all of it, from 2026-08-14. Its output is `docs/friction-log.md`, and that log — not this matrix — decides what v1.4.0 actually contains.

---

## v1.0.0 — Complete

| Spec | Feature |
|---|---|
| — | Zero-chrome shell, modal engine, reserved-chord interception (the spike) |
| `f1` | Modal keys + command palette |
| `f2` | Statusbar widgets (9 builtins, TOML-ordered) |
| `f3` | Theming — pywal / base16 / builtin, all-or-nothing validation |
| `f4` | Vertical tabs + tab graveyard |
| `f5` | Workspaces + persistence (container-isolated, owned restore) |
| `f6` | EF supports — task-conditioned focus, no timers, mechanical lexicon sweep |
| `f7` | Local-AI sidebar — loopback-only, hard kill switch, default OFF |

## v1.1.0 — Complete

| Spec | Feature |
|---|---|
| `b1` | Site boosts — per-domain CSS dotfiles, `:zap` picker, lexical sanitizer |
| `b2` | AI CSS boosts — structure-only sampling, preview + strip summary, nothing auto-applied |
| `b3` | Context resurrection — per-tab scroll records, one silent restore, no UI |

## v1.2.0 — The Rice Pass

| Spec | Feature | Why now |
|---|---|---|
| `r1` | Live config reload + watcher | Friction-log #2, day 1. Restarting to change a colour is the least riceable thing in the overlay |
| `r2` | Style layer + motion | Colour was never the whole rice; motion is most of what "designed" means |
| `r3` | Which-key | Discovery without a manual — the half of Nyxt worth keeping, minus the half worth rejecting |
| `r4` | Panel primitive + tab panel | Friction-log #3, day 1: a strip is not how I find a tab. **Cuts f4's vertical strip** |
| `r5` | Settings panel + DoH | Config discoverable without reading a spec; layered file so the dotfile is never rewritten |

**Built 2026-08-14.** Pure layer by 27 agents (five TDD teams of five, one foundation engineer, one integrator); glue wired serially afterwards. 322 → 787 tests, 786 pass, 1 todo. The vertical strip is cut: `T` opens the tab panel, `tabs_toggle` is deleted from the registry, and f4's `sidebar.revamp`/`verticalTabs` prefs are reverted in the same change so the native strip cannot render in its place.

**The ride-along refactor did not happen.** `aether.uc.js` went from 2,009 to 2,688 lines — it grew by a third instead of shrinking. This is exactly what the budget review predicted about a refactor promised as a side effect of feature work, and the CI line-count ceiling it recommended is still not in place. Either that ceiling lands before v1.3.0 or the promise should be dropped from the plan rather than repeated.

## v1.3.0 — The Extension Pass

| Spec | Feature | Why now |
|---|---|---|
| `x1` | Command facade | The one thing TOML structurally cannot express — without embedding a runtime |
| `x2` | Mods + trust tiers | Packaging for what already exists; style/code split is a real boundary, not a warning |
| `x3` | Fuzzy + frecency | **Reverses a v1.0.0 cut** on logged evidence (friction-log, day 1) |
| `x4` | GitHub mod | The reference consumer that finds the API's flaws before it freezes |

## v1.4.0 — Panel Sources

| Spec | Feature | Why now |
|---|---|---|
| `p1` | Bookmarks — flat, tagged, zero-decision capture | Folders force a decision at capture time, which is the decision I defer |
| `p2` | History — a search surface over Places, workspace-attributed | If finding a closed tab is easy, tabs stop being memory |
| `p3` | Downloads — widget that appears only when active, panel source | Transfers are currently invisible |

## v2.0.0 — `aetherd`

Local Rust daemon, one loopback API, integration weight off the rebase treadmill. Ordered so the cheapest adapter proves the architecture first.

| Spec | Feature | Notes |
|---|---|---|
| `d1` | Daemon foundation — transport, token auth, adapters, capabilities | Origin-header rejection is the rule that kills drive-by-localhost |
| `d2` | Media — MPRIS control, mini-player, PipeWire visualizer | First. MPRIS *is* the backend-agnosticism; no per-service control adapters, ever |
| `d3` | Rules engine + auto-registration | Deterministic; no AI. Browser as sensor for taskwarrior/timewarrior |
| `d4` | Time-data enrichment | Ground truth first, AI second; measured and inferred never mix |
| `d5` | Remote surfaces (powerhouse, gnosis) | **Assumption-based** — the repos are private; see the spec's open-input block |
| `d6` | Per-workspace network identity | **Spike-gated** on `nsIProtocolProxyService` channel filters; fails closed, never to direct |
| `d7` | Encryption at rest | Decision #3's envelope pattern; keys in the daemon, never in chrome |

## v2.1.0 — The Agent

| Spec | Feature | Notes |
|---|---|---|
| `a1` | Control plane — registry-as-API, consent policy, taint, action log | Plan-as-workflow, not a live loop |
| `a2` | Page perception + action | Two capabilities, separate switches; cross-origin action always confirms |
| `a3` | The focus nudge | One offer per session; counting is structurally impossible, not merely discouraged |

Prompt injection assumed unsolved throughout.

---

## Design review log

Specs are written in one pass by one perspective, which is not the same as being right. Reviews recorded here.

**x1 + x2 (facade, hooks, mods) — stress-tested 2026-08-14.** Eight defects found and fixed in the specs before any code was written:

| # | Defect | Fix |
|---|---|---|
| 1 | `aether.hints.score = fn` — an assignment to a **frozen** object; would throw in strict mode. Direct contradiction inside the spec | Everything is a registration call (`setScorer`), which also gives every hook an owner |
| 2 | Hot reload re-imported modules without deregistering — hooks accumulate, so after three reloads `open-link` fires three times and it reads like a browser bug | Registration ledger keyed by owning file; revoke-then-reimport |
| 3 | Reload was non-transactional: a file failing on re-import left a half-loaded registry | Build off to the side, swap only on full success, keep the working version on failure |
| 4 | Hook `next` could be called twice → double navigation | `next` is call-once; a second call is ignored and reported |
| 5 | Async hooks unspecified — navigation would either race or hang | Sync decision only; promise-returning hooks rejected at registration |
| 6 | A slow hook was uncontained (only throwing was) — a 200ms scorer makes hints unusable without ever erroring | Per-call time budget, latch off after two exceedances |
| 7 | Self-declared `risk` was trusted → a mod labelling a destructive command `read` gets it auto-run by the agent | `riskFloor`: non-builtin commands floored at `mutate-local`; a declaration may restrict, never widen |
| 8 | Two mods could claim one namespace; mod style vs user boost precedence undefined; mod domain matching inherited b1's suffix walk | Namespaces globally unique and reserved; user dotfile always wins over mod style; exact-or-declared matching |

Not yet reviewed: r1–r5, p1–p3, d1–d7, a1–a3.

---

## Cut, and staying cut

Per-spec non-goals are the authority; this is the short list of things that come up repeatedly.

| Cut | Where | Reopens only if |
|---|---|---|
| Vertical tab strip | r4 | — (replaced, not deferred) |
| PSL for boost domains | b1 | a real over-match I can't fix with an exact-host file |
| Shadow DOM / iframe boosts | b1 | — |
| Generated JS near page context | b2 | never — identity, not deferral |
| Page content to the model (f7 chat) | f7 | v2.1's consent tiers, explicitly |
| Focus timers, streaks, stats | f6 | never — identity, not deferral |
| Command history buffer | x3 | frecency proves insufficient |
| Typo tolerance in matching | x3 | — |
| Mod registry / one-click code mods | x2 | never — the friction is the security model |
| Sandbox for code mods | x1/x2 | — (authorship is the boundary) |
| Multi-keyboard schemes (Emacs/CUA) | — | never — one user, one keymap |
| Config-as-code-in-a-runtime (Lisp image) | x1 | — (files + hooks cover it without the runtime) |
| Tauri / system-webview shell | — | never — borrowing the OS's engine is what a browser can't afford |
| Chromium/CEF | — | Gecko becomes unmaintainable for one person |
