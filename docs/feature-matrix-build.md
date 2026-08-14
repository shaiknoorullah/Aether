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
| v1.2.0 | The rice pass | Specs written, not started |
| v1.3.0 | The extension pass | Specs written, not started |
| v1.4.0 | Panel sources | Committed scope, specs at approach |
| v2.0.0 | `aetherd` and integrations | Committed scope, specs after the daemon spike |
| v2.1.0 | The agent | Committed scope, specs after v1.3 lands |

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

Riding along: extract from `aether.uc.js` (2,009 lines) as each area is touched. Not a separate milestone.

## v1.3.0 — The Extension Pass

| Spec | Feature | Why now |
|---|---|---|
| `x1` | Command facade | The one thing TOML structurally cannot express — without embedding a runtime |
| `x2` | Mods + trust tiers | Packaging for what already exists; style/code split is a real boundary, not a warning |
| `x3` | Fuzzy + frecency | **Reverses a v1.0.0 cut** on logged evidence (friction-log, day 1) |
| `x4` | GitHub mod | The reference consumer that finds the API's flaws before it freezes |

## v1.4.0 — Panel Sources *(committed scope)*

Bookmarks (flat + tags, no hierarchy), history, downloads — all sources on r4's primitive. Marks and pins generalized. Specs written at approach; the friction log ranks them.

## v2.0.0 — `aetherd` *(committed scope)*

Local Rust daemon, one loopback API, integration weight off the rebase treadmill.

| Track | Notes |
|---|---|
| MPRIS media + visualizer | First. Smallest adapter, harmless failures, proves the architecture |
| Rules engine + auto-registration | Browser as sensor for taskwarrior/timewarrior |
| Time-data enrichment | Ground truth first, AI second; measured and inferred never mix |
| VPS surfaces (powerhouse, gnosis) | Daemon holds credentials — blocked on knowing what they expose |
| Per-workspace proxy | Blocked on an `nsIProtocolProxyService` spike |
| Encryption at rest | Decision #3's Yjs E2EE pattern; keys in the daemon |

## v2.1.0 — The Agent *(committed scope)*

Registry-as-API, `risk`-class consent policy, plan-as-workflow execution, taint tracking, complete action log, and the focus-session nudge. Prompt injection assumed unsolved.

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
