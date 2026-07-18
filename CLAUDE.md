# Aether — A Personal Browser

## What This Is

A personal, local-first, keyboard-driven browser built as a **thin Gecko overlay** — the author's daily driver, shaped by an Arch/tmux/vim workflow, published as free software (AGPL-3.0-or-later). **Not a startup, not a product. No monetization, ever.** If others adopt it Zen/LibreWolf-style, fine; adoption is not a goal and is never a design input.

Status: research complete, no browser code yet. Next milestone: the first overlay spike.

## Scope Rules

- Requirements = what the author actually uses. No market-derived features, no personas, no segments.
- **Thin-fork discipline is the prime constraint**: the overlay diff must stay small enough to rebase against Firefox's 4-week release cadence in roughly an evening a month. A feature that threatens that budget gets cut, no matter how good.
- A novel feature earns its place by being used daily by the author — not by adoption metrics.
- Generalizing for a hypothetical audience is the known failure mode of this project. When in doubt, build the personal version.

## Decisions On Record

1. **Engine: Gecko/Firefox thin-fork** (LibreWolf/Zen-class overlay, <100-line-diff discipline). Custom WebView shell and privileged extension ELIMINATED (extension can't override Ctrl+W/T/N or hide chrome; no cross-platform WebView). Rationale: Firefox chrome is a privileged web stack — full chrome replacement + pre-accelerator keyboard interception with zero C++ changes; Firefox keeps blocking webRequest under MV3; Xray vision beats isolated worlds for agent bridges. Fallback (Chromium/CEF) only if Gecko becomes unmaintainable for one person. Sources: `docs/research-v2/technical/tech-engine-decision.md`, `outputs/browser-delivery-vehicle-comparison.md`.
2. **Agent control plane**: MCP (consent/tool layer) → sender-validated WebExtension messaging → Xray-protected `exportFunction`/`cloneInto` content bridge → scoped WebExt APIs → optional OS-sandboxed Native Messaging Host. **CDP and WebDriver BiDi rejected for agent control** (CDP has zero auth). Per-tool consent, log every action, never trust content-script messages. `docs/ipc-research.md`, `outputs/agent-safe-browser-ipc.md`, `docs/research-v2/technical/tech-ai-control-ipc.md`.
3. **Sync: ONE Yjs-based E2EE CRDT engine** (`yrs` on the native side; encrypt content values, CRDT metadata clear — Proton Docs pattern). Syncthing rejected. Open tension: Iroh (native tier, no browser WASM client) vs js-libp2p (only production in-browser P2P) — resolve when sync is actually built.
4. **Durable personal automation**: Temporal (MIT, true durable replay) or Windmill (lowest ops); n8n rejected (1-hour ceiling, fair-code license).
5. **Storage**: all research lives as markdown/JSON in-repo. Postgres/Redis were never provisioned; DB migration is dead.

## Design Principles (research findings the author actually lives with)

- **Daily-driver floor**: uBO-class native blocking, WebExtension/AMO support, zero telemetry, hardened privacy defaults, modern-site compat. Non-negotiable before anything novel.
- **Executive-function support, non-shaming**: externalize working memory and structure; task-conditioned (not timer-based) focus; no streaks, no failure states, no punitive language; ambient time anchoring; typography as a first-class control; on-device sensing only. This is a personal accommodation — the evidence base is small-n (N=23–27, no RCTs) and it is never a treatment claim.
- **Agents as a permission-gated substrate**: prompt injection is treated as unsolved — human-in-the-loop for cross-origin actions, always.
- **Local-first AI**: OpenAI-compatible gateway (Ollama/LM Studio/llama-server all converged on `/v1`), hard kill switch, cloud only by explicit per-case choice.
- **Config as data**: git-committable dotfiles (TOML/YAML), no accounts, no cloud dependencies.

## Sustainability Risks (personal framing)

- **Maintenance budget is the only real existential risk**: hours, not money. Keep the overlay thin or the rebase treadmill kills the project.
- Mozilla/Gecko upstream instability (Firefox 2.19% share, Google-deal/DOJ exposure) — keep a contingency migration horizon, stay modular.
- Solo-maintainer burnout is the documented death of every comparable project (Zen bus factor 1, Luakit dormant). Scope ruthlessly.
- Prompt injection possibly structurally unsolvable — never claim otherwise.

## Research Corpus (historical reference)

Two multi-agent research waves produced this repo's corpus: v1 (2026-04, 5-wave/~28-agent pipeline → `docs/research-data/`, `docs/feature-matrix.md`) and v2 (2026-06-10, 20-team Feynman fleet → `outputs/`, `docs/research-v2/`, final matrix `docs/research-v2/feature-matrix-v2.md`).

**How to read it now**: the *technical* findings (engine comparison, IPC/agent safety, CRDT sync, local-AI capability, ADHD design science, power-user JTBD) remain load-bearing. The *market* machinery — RICE councils, MoSCoW tiers, TAM sizing, switching-intent surveys, monetization gates, beachhead positioning, beta-adoption kill-criteria — was startup framing, **retired 2026-07-18** when the project rescoped to a personal tool. Read it as history; don't extend it.

Validation caveats preserved for honesty: "300% push-spam" unverified; "19.7% agent success" is arithmetic (0.85^10), not measurement; several stats single-source/vendor-sourced; corpus consistency partly citation echo.

## Repository Map

- `README.md` — vision doc (still carries startup framing; update pending)
- `docs/research-v2/feature-matrix-v2.md` — v2 matrix (historical scoring; technical content still useful)
- `docs/feature-matrix.md` — v1 matrix (preserved)
- `docs/research-data/`, `docs/research-v2/` — v1/v2 pipeline outputs
- `outputs/` — 22 raw Feynman briefs (14 with `.provenance.md` sidecars; `.drafts/` = intermediates)
- `docs/research/power-user-jtbd-pain-points.md` — 28 sourced pain points
- `docs/ipc-research.md`, `docs/competitive-landscape.md`, `docs/agent-orchestration-research.md` — session-1 research
- `docs/research-plan.md`, `docs/ultraplan.md` — v1 planning (historical)
- `agents/EMP_0001–0020.md`, `scripts/` — v2 fleet tooling (historical; scripts hardcode the original dev machine paths)
- `AGENTS.md` — STALE (predates v2 and the rescope)

## Next Steps

1. **The spike**: thin Gecko overlay proving zero-chrome + modal keyboard interception (Zen/LibreWolf pattern). Then daily-drive it. This validates the engine decision by use, not ratification.
2. Grow the overlay feature-by-feature from the author's actual workflow (keybindings → blocking → workspaces → local-AI bridge → agent runtime), each gated by the maintenance budget.
3. Update `README.md` to the personal-tool framing; refresh or delete `AGENTS.md`.
4. Resolve the Iroh vs js-libp2p tension when sync is actually built, not before.

## Tools & Infrastructure

- **Feynman** (research agent): `~/.local/bin/feynman`, skills at `~/.codex/skills/feynman/` — produced the v2 briefs. `lit` workflow blocked (alphaXiv unauthenticated); use `deepresearch`.
- MCP servers available: Memory-Keeper, Tmux, Linear, Slack, Playwright, Context7.

## The Author

- Platform architect / engineering lead
- Arch Linux, tmux, vim-oriented workflow; learning Rust
- Prefers terse responses, no trailing summaries
- Values secure-by-design, data-driven decisions
- ADHD-informed workflow: the browser's design principles are the author's own accommodations

## Conventions

- Every research claim needs a source URL; verified claims get `.provenance.md` sidecars.
- Research is additive — never overwrite earlier waves.
- New feature ideas are judged by daily personal use and the maintenance budget, not scoring frameworks (council/RICE/MoSCoW machinery is retired).
- Use agents extensively — parallel swarms for research/synthesis; Feynman for long-form sourced research.
