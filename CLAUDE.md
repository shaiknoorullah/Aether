# AI-Native Browser Project (Codename: Aether)

## Project Overview

Local-first, AI-native, keyboard-driven browser designed to protect attention. Positioning: **executive-function prosthesis + power-user workshop + agent-safe AI runtime**. License: AGPL-3.0-or-later. Status: research/RFC — **no browser, UI, or extension code exists yet**.

Five priority segments: power users, knowledge workers, neurodivergent/ADHD builders, privacy advocates, AI agent builders. The ADHD/executive-function focus was elevated to a core thesis during v2 research (replacing "casual users").

## Current Phase: Research COMPLETE → Decision Ratification

Both research waves have been executed. The next milestone is **roadmap v0.0: formally ratify the engine decision**, then define the monetization hypothesis and begin RFC/prototyping.

### v1 pipeline (2026-04) — COMPLETE
5-wave, ~28-agent pipeline (discovery → competitive intel → market → CoVe validation → 5-persona executive council). Outputs: `docs/research-data/` + `docs/feature-matrix.md`.
- 142 candidates → 50 council-scored → 30 feature cards.
- **Only 4 features reached Must consensus**: native ad/tracker blocking, vertical tabs, WebExtension support, zero telemetry (+ Chrome migration elevated). Identity features (workspaces, vim, local AI) honestly rated Should.
- Kill-criterion on record: if <30% of beta users create a second workspace within 30 days, reconsider the product thesis.
- Validation wave caveats: "300% push-spam increase" UNVERIFIED (underpins the #2-ranked feature); "19.7% agent success" is a derivation (0.85^10), not a measurement; "660K vim users" unconfirmed aggregate; report consistency partly reflects citation echo (shared single sources), not independent verification.

### v2 pipeline (2026-06-10) — COMPLETE
20-team Feynman fleet (5 depts: discovery ×5, competitive ×6, market ×4, technical ×3, synthesis/red-team ×2), run via tmux + agent-manager, then a 4-phase Claude workflow (synthesize → adversarial CoVe verify → 5-persona council → assemble). Raw briefs in `outputs/` (14 of 22 have `.provenance.md` citation sidecars; the 8 comparison docs do not), synthesis in `docs/research-v2/`, final matrix: `docs/research-v2/feature-matrix-v2.md`.
- 139 deduped candidates: **26 Must / 58 Should / 49 Could / 6 Won't**.
- Top-ranked: uBO-class native blocking (RICE 18.2), WebExtensions/AMO bridge, modern-site compat, arkenfox-in-the-UI privacy, hardened default profile, Gecko thin-fork (keystone), zero telemetry + reproducible builds, permission-gated agent runtime (most-duplicated candidate ~10×).
- New evidence bodies vs v1: ADHD/executive-function cluster and the agent-safety architecture.

## Decisions On Record

1. **Engine: Gecko/Firefox thin-fork** (LibreWolf/Zen-class overlay, <100-line-diff discipline), with Chromium/CEF as pre-documented fallback (flip trigger: CWS compat becoming non-negotiable). Custom WebView shell and privileged extension ELIMINATED (extension can't override Ctrl+W/T/N or hide chrome; no cross-platform WebView). Rationale: Firefox chrome is a privileged web stack (full chrome replacement + pre-accelerator keyboard interception with zero C++ changes); Firefox keeps blocking webRequest under MV3; Xray vision beats isolated worlds for agent bridges. Sources: `docs/research-v2/technical/tech-engine-decision.md`, `outputs/browser-delivery-vehicle-comparison.md`. Formal ratification = v0.0.
2. **Agent control plane**: MCP (consent/tool layer) → sender-validated WebExtension messaging → Xray-protected `exportFunction`/`cloneInto` content bridge → scoped WebExt APIs → optional OS-sandboxed Native Messaging Host. **CDP and WebDriver BiDi rejected for production agent control** (CDP has zero auth). Per-tool consent, log every action, never trust content-script messages. `docs/ipc-research.md` (Firefox-path, still valid), `outputs/agent-safe-browser-ipc.md`, `docs/research-v2/technical/tech-ai-control-ipc.md`.
3. **Sync: ONE Yjs-based E2EE CRDT engine** (`yrs` on the native side; encrypt content values, CRDT metadata clear — Proton Docs pattern). Syncthing rejected. Open tension to resolve: `crdt-sync-browser-stack.md` recommends Iroh transport, `workflow-sync-self-hosted.md` says Iroh has no browser WASM client and js-libp2p is the only production browser-native P2P — reconcile as native-tier Iroh vs in-browser js-libp2p, explicitly.
4. **Durable workflows**: Temporal (MIT, true durable replay) or Windmill (lowest ops); n8n rejected (1-hour ceiling, fair-code license).
5. **MVP posture**: table-stakes floor first (the 4 consensus Musts); **developer/Linux wedge** as launch positioning (no capable agentic browser supports Linux); agents shipped as a safe permission-gated substrate, not autonomy marketing; prompt injection marketed honestly as unsolved; consolidate ~9 sync candidates into one engine and ~10 agent candidates into one runtime epic.
6. **Storage**: Postgres/Redis were never provisioned — all research lives as markdown/JSON in-repo (the `ultraplan.md` fallback). DB migration deferred indefinitely.

## Key Risks (from red-team + risk registers)

- **Browser-building is a distribution-and-sustainability problem, not a feature problem.** Top-2 browsers = 86% (OS defaults); no proven surveillance-free monetization (Mozilla = 86% Google money; subscription browsers are a graveyard). Define revenue model before Phase 2.
- Arc novelty tax: only 5.52% of Arc DAU used >1 Space. Gate every novel feature on >15–20% WAU or kill it.
- Gecko sustainability: Firefox 2.19% share, Mozilla's Google-deal dependence, DOJ remedy unresolved. Keep the fork thin; maintain 2+yr contingency migration horizon.
- Prompt injection possibly structurally unsolvable — never claim it's solved; human-in-the-loop for cross-origin agent actions.
- ADHD evidence is small-n (N=23–27, no browser-feature RCTs) — ship as accommodation/productivity tool, never as treatment; SDT-based non-shaming design, no timers/streaks/failure states.
- Niche-within-a-niche: realistic keyboard-power-user wedge is 1–3M people.

## Repository Map

- `README.md` — public-facing vision + current state (most current narrative doc)
- `docs/research-v2/feature-matrix-v2.md` — **authoritative feature matrix** (extends v1)
- `docs/feature-matrix.md` — v1 matrix (30 cards, preserved)
- `docs/research-data/` — v1 pipeline outputs (discovery/competitive/market/validation/council)
- `docs/research-v2/` — v2 fleet synthesis by dept + fleet manifest/log/status
- `outputs/` — 22 raw Feynman research briefs + provenance sidecars (`.drafts/` = intermediates)
- `docs/research/power-user-jtbd-pain-points.md` — 28 sourced JTBD pain points
- `docs/research-plan.md`, `docs/ultraplan.md` — v1 planning docs (historical)
- `docs/ipc-research.md`, `docs/competitive-landscape.md`, `docs/agent-orchestration-research.md` — session-1 research
- `agents/EMP_0001–0020.md` — v2 fleet launch configs, GENERATED by `scripts/gen_research_fleet.py` (don't hand-edit)
- `scripts/` — fleet generator, tmux runner (`run_fleet.sh`), brief↔manifest reconciler (`build_synth_args.py`), council synthesis workflow (`synthesis_workflow.js`)

## Known Inconsistencies / Cleanup Backlog

- `AGENTS.md` is STALE (predates v2; still describes unprovisioned Postgres schema and "not yet executed" plan).
- Scripts hardcode the original dev machine (`/home/devsupreme/work/aether-browser`, `~/.local/bin/feynman`) — won't run in other checkouts without edits.
- 8 comparison briefs in `outputs/` lack provenance sidecars.
- Several load-bearing stats are single-source or vendor-sourced (Shift 81% switching intent, Incogni 52%, CMU 25% tab-crash) — treat as directional.
- Iroh vs js-libp2p transport tension (see decision 3).

## Next Steps

1. Ratify the engine decision (v0.0) — or challenge it before any code.
2. Define the monetization hypothesis (pre-Phase-2 gate; Vivaldi's employee-owned ~4M-user profitability is the only proven small-team template).
3. Resolve the sync-transport tension explicitly.
4. Refresh `AGENTS.md`; de-hardcode `scripts/` paths.
5. First technical spike: thin Gecko overlay proving zero-chrome + modal keyboard interception (Zen/LibreWolf pattern).

## Tools & Infrastructure

- **Feynman** (research agent): `~/.local/bin/feynman`, skills at `~/.codex/skills/feynman/` — used for all v2 raw briefs. `lit` workflow blocked (alphaXiv unauthenticated); use `deepresearch`.
- MCP servers available: Memory-Keeper, Tmux, Linear, Slack, Playwright, Context7 (Postgres/Redis listed historically but never provisioned).

## User Profile

- Platform architect / engineering lead
- Arch Linux, tmux, vim-oriented workflow; learning Rust
- Prefers terse responses, no trailing summaries
- Values secure-by-design, data-driven decisions

## Conventions

- Every claim needs a source URL; verified claims get `.provenance.md` sidecars.
- Never overwrite v1 research — v2 and later extend additively.
- Feature scoring: weighted 5-persona council (PS/TA ×1.2, UA/SA/DA ×1.0), RICE + MoSCoW (Must = ≥3 Must votes) + Kano.
- Use agents extensively — parallel swarms when possible; Feynman for long-form sourced research, Claude agents for extraction/synthesis/council mechanics.
