# Aether — My Browser

## What This Is

Aether is the browser I want to live in: local-first, keyboard-driven, built as a **thin Gecko overlay**. It's shaped by how I actually work — Arch, tmux, vim, everything in dotfiles — and published as free software (AGPL-3.0-or-later) because that's how I think software should exist. **This is not a startup. Not a product. I will never monetize it.** If other people adopt it the way Zen or LibreWolf got adopted, cool; if nobody ever installs it but me, it still succeeded.

Honest status: I've produced ~50 research documents and zero lines of browser code. The research phase is over. Next milestone: the spike.

## Rules I Hold Myself To

- Requirements are what I actually use. No market-derived features, no personas, no imaginary users. I already tried thinking like a startup here — that machinery is retired.
- **The thin-fork discipline is the prime constraint**: the overlay diff stays small enough that I can rebase against Firefox's 4-week release cadence in an evening a month. A feature that threatens that budget gets cut. Yes, even the cool one.
- A feature earns its place by me using it daily — not by stars, adoption, or how good it would look in a screenshot.
- Generalizing for a hypothetical audience is *my documented failure mode* on this project. When in doubt, build the personal version.

## Decisions I've Made (and won't relitigate without new evidence)

1. **Engine: Gecko/Firefox thin-fork** (LibreWolf/Zen-class overlay, <100-line-diff discipline). I eliminated the custom WebView shell and the privileged-extension route — an extension can't override Ctrl+W/T/N or hide chrome, and there's no cross-platform WebView. Firefox chrome is a privileged web stack: full chrome replacement and pre-accelerator keyboard interception with zero C++ changes, blocking webRequest survives MV3, and Xray vision beats isolated worlds for agent bridges. Chromium/CEF is the fallback only if Gecko becomes unmaintainable for one person. Sources: `docs/research-v2/technical/tech-engine-decision.md`, `outputs/browser-delivery-vehicle-comparison.md`.
2. **Agent control plane**: MCP (consent/tool layer) → sender-validated WebExtension messaging → Xray-protected `exportFunction`/`cloneInto` content bridge → scoped WebExt APIs → optional OS-sandboxed Native Messaging Host. **CDP and WebDriver BiDi rejected for agent control** — CDP has literally zero auth. Per-tool consent, log every action, never trust a content-script message. `docs/ipc-research.md`, `outputs/agent-safe-browser-ipc.md`, `docs/research-v2/technical/tech-ai-control-ipc.md`.
3. **Sync: ONE Yjs-based E2EE CRDT engine** (`yrs` on the native side; encrypt content values, leave CRDT metadata clear — the Proton Docs pattern). Syncthing rejected. Open tension I'm deliberately not resolving yet: Iroh (native tier, no browser WASM client) vs js-libp2p (only production in-browser P2P). I'll decide when I actually build sync.
4. **Durable personal automation**: Temporal (MIT, true durable replay) or Windmill (lowest ops). n8n rejected — 1-hour execution ceiling and a fair-code license.
5. **Storage**: research lives as markdown/JSON in this repo. I never provisioned the Postgres/Redis stack from the original plan; that migration is dead and I'm fine with it.

## Design Principles (the research findings I actually live with)

- **Daily-driver floor first**: uBO-class native blocking, WebExtension/AMO support, zero telemetry, hardened privacy defaults, modern-site compat. If the floor isn't flawless I won't daily-drive my own browser, and then this whole thing is theater.
- **Executive function, externalized, never shamed**: my browser should hold my working memory, not scold me for how my brain works. Task-conditioned focus (not timers — timers kill hyperfocus and manufacture shame), no streaks, no failure states, no punitive language, ambient time anchoring so the browser isn't a time void, typography as a first-class control, all sensing on-device. These are my accommodations. The evidence base is small-n (N=23–27, no RCTs) and I will never dress this up as treatment.
- **Agents are a permission-gated substrate, not magic**: prompt injection is unsolved and I build like it stays unsolved. Human-in-the-loop for cross-origin actions, always.
- **Local-first AI**: one OpenAI-compatible gateway (Ollama/LM Studio/llama-server all converged on `/v1` anyway), a hard kill switch, cloud only when I explicitly choose it per case.
- **Config as data**: git-committable dotfiles (TOML/YAML). No accounts. No cloud dependencies. My browser config belongs next to my nvim config.

## What Can Actually Kill This

- **The maintenance budget. That's it — hours, not money.** If the overlay gets thick, the rebase treadmill wins and the project dies. Every comparable project that died, died of maintainer exhaustion (Zen is bus-factor 1, Luakit went dormant). Scope ruthlessly.
- Mozilla/Gecko upstream instability (2.19% share, Google-deal/DOJ exposure). I keep the overlay modular and a contingency migration horizon in my head.
- My own pattern: elaborate meta-systems instead of the thing. Fifty research docs, zero code. The antidote is shipping the spike and daily-driving it.
- Prompt injection may be structurally unsolvable. I never claim otherwise, in code or in words.

## The Research Corpus (history — useful history, but history)

Two multi-agent research waves built this repo: v1 (2026-04, 5-wave/~28-agent pipeline → `docs/research-data/`, `docs/feature-matrix.md`) and v2 (2026-06-10, 20-team Feynman fleet → `outputs/`, `docs/research-v2/`, final matrix `docs/research-v2/feature-matrix-v2.md`).

**How I read it now**: the *technical* findings (engine comparison, IPC/agent safety, CRDT sync, local-AI capability, ADHD design science, power-user JTBD) are load-bearing — I trust them and build on them. The *market* machinery — RICE councils, MoSCoW tiers, TAM sizing, switching surveys, monetization gates, beachhead positioning, beta kill-criteria — was me cosplaying a startup. **Retired 2026-07-18** when I rescoped this to a personal tool. It stays in the repo as history; nobody extends it.

Caveats I keep on record because honesty is the point: "300% push-spam" was never verified; "19.7% agent success" is arithmetic (0.85^10), not measurement; several stats are single-source or vendor-sourced; the corpus agrees with itself partly because reports cited the same sources.

## Repository Map

- `README.md` — vision doc (still carries the startup framing; rewrite pending)
- `docs/research-v2/feature-matrix-v2.md` — v2 matrix (scoring is historical; technical content still useful)
- `docs/feature-matrix.md` — v1 matrix (preserved)
- `docs/research-data/`, `docs/research-v2/` — v1/v2 pipeline outputs
- `outputs/` — 22 raw Feynman briefs (14 with `.provenance.md` sidecars; `.drafts/` = intermediates)
- `docs/research/power-user-jtbd-pain-points.md` — 28 sourced pain points
- `docs/ipc-research.md`, `docs/competitive-landscape.md`, `docs/agent-orchestration-research.md` — session-1 research
- `docs/research-plan.md`, `docs/ultraplan.md` — v1 planning (historical)
- `agents/EMP_0001–0020.md`, `scripts/` — v2 fleet tooling (historical; scripts hardcode my old machine's paths)
- `AGENTS.md` — STALE (predates v2 and the rescope)

## Next

1. **The spike.** Thin Gecko overlay proving zero-chrome + modal keyboard interception (the Zen/LibreWolf pattern). Then I daily-drive it. The engine decision gets validated by use, not by another document.
2. Grow the overlay feature-by-feature from my actual workflow — keybindings → blocking → workspaces → local-AI bridge → agent runtime — each one gated by the maintenance budget.
3. Rewrite `README.md` in this framing; refresh or delete `AGENTS.md`.
4. Iroh vs js-libp2p: decided when sync gets built, not before.

## Tools & Infrastructure

- **Feynman** (my research agent): `~/.local/bin/feynman`, skills at `~/.codex/skills/feynman/` — produced the v2 briefs. `lit` workflow is blocked (alphaXiv unauthenticated); use `deepresearch`.
- MCP servers available: Memory-Keeper, Tmux, Linear, Slack, Playwright, Context7.

## About Me (for any agent working in this repo)

- Platform architect / engineering lead. Arch, tmux, vim; learning Rust.
- Terse responses. No trailing summaries. Don't flatter me.
- Secure-by-design, data-driven — but data means sources, not vibes.
- ADHD-informed workflow: this browser's design principles are my own accommodations, which is exactly why they're trustworthy requirements and exactly why they don't generalize into claims.

## Conventions

- Every research claim gets a source URL; verified claims get `.provenance.md` sidecars.
- Research is additive — never overwrite earlier waves.
- New feature ideas are judged by daily personal use and the maintenance budget. The council/RICE/MoSCoW machinery is retired; don't resurrect it.
- Use agents extensively — parallel swarms for research/synthesis; Feynman for long-form sourced research.
