# 🜂 Aether

**My browser.** Local-first, keyboard-driven, zero-chrome — a thin overlay on
stock Firefox, shaped by how I actually work: Arch, tmux, vim, everything in
dotfiles.

**This is not a startup. Not a product. It will never be monetized.** I built
it for me and published it as free software because that's how I think software
should exist. If it's useful to you the way Zen or LibreWolf are useful to
people, take it. If nobody but me ever runs it, it still succeeded.

Status: **v1.1.0 — working.** No fork, no build step, no dependencies, zero
Firefox source patches. The overlay is ~5,100 lines the browser loads as-is,
covered by 322 unit tests (bare `node --test`) and a real-browser visual suite.
Currently in its 30-day daily-drive gate.

## What it does

- **Zero-chrome, modal everything** — no tab strip, no toolbar; the urlbar
  appears when summoned and leaves when done. Vim-modal keys with a mode badge
  in a tmux-style statusbar. Reserved shortcuts (`Ctrl+W/T/N/Tab`) belong to
  the overlay in every mode, and normal-mode keys never reach page content —
  the two things extensions structurally cannot do, and the reason this is an
  overlay instead of an extension.
- **Command palette** — `:` runs everything by name with Tab completion.
- **Workspaces** — named, container-isolated (separate cookies), switch with
  `gw`; other workspaces' tabs hide rather than close; everything — including
  each tab's scroll position — survives restart.
- **Tab graveyard** — closing a tab archives it; `:graveyard <query>`
  resurrects. No tab death, no tab guilt.
- **Statusbar widgets** — TOML-ordered slots: mode, workspace, focus session,
  url, tab count, AI state, clock, date.
- **Theming** — pywal/base16 ingestion; run `wal`, then `:theme_reload`, and
  the browser matches the rest of the rice.
- **Executive-function support, never shame** — `:focus <task>` starts a
  session that ends when *you* say so (`:done`), never on a timer; calm elapsed
  time in the bar; web notifications quiet during sessions; ambient clock+date
  always visible. A unit test mechanically bans shame vocabulary from every
  user-visible string. These are my own ADHD accommodations, shipped as
  accommodations — never as treatment claims.
- **Local AI, hard kill switch** — `a` opens a sidebar chat streaming from an
  OpenAI-compatible loopback gateway (Ollama/LM Studio/llama-server). Loopback
  hosts only, enforced in code; default OFF; when off, the network path throws.
  Model output is text, never rendered, never executed.
- **Site boosts** — per-domain CSS dotfiles: `:zap` hint-picks an element and
  it's gone (a dated rule appended to `~/.config/aether/boosts/<domain>.css`;
  undo is deleting a line in vim). `:boost` asks the local model for a CSS-only
  reskin from a structural sample (never page text — test-proven) and shows a
  preview plus a list of every sanitizer-stripped rule before you accept.
  All boost CSS passes a lexical sanitizer that strips the known network-fetch
  vectors, escape-decoded spellings included.

Full feature docs, keybindings, and the test-evidence map: **[`overlay/README.md`](overlay/README.md)**.

## Install

```sh
git clone https://github.com/shaiknoorullah/Aether
cd Aether/overlay
./install.sh     # writes 3 small autoconfig files into the Firefox dir (sudo)
./bin/aether     # launches the dedicated 'aether' profile
```

Requirements: Firefox (or a Firefox-family browser — CI runs LibreWolf), and
optionally Ollama for the AI features. Your config lives at
`~/.config/aether/aether.toml` — git it with your dotfiles.

**Arch note**: `pacman -Syu` replaces `/usr/lib/firefox` and wipes the
autoconfig files — re-run `install.sh` after Firefox upgrades, or add a pacman
hook that does it for you. That re-run *is* the monthly rebase drill.

After editing overlay JS, restart with `./bin/aether -purge` (script cache).
Errors land in the Browser Console (`Ctrl+Shift+J`).

## Principles

1. **The maintenance budget is the prime constraint.** A thin overlay one
   person can rebase against Firefox's release cadence in an evening a month.
   Features that threaten that budget get cut — the repo's changelog records
   what was cut and why.
2. **Config as data.** TOML dotfiles, no accounts, no cloud. A broken dotfile
   falls back to defaults; it never bricks the browser.
3. **Externalize executive function, never police it.** No timers, no streaks,
   no failure states, no punitive copy — mechanically enforced by tests.
4. **Local-first AI with an off switch that means it.** One loopback gateway,
   default OFF, kill switch that aborts in-flight requests. AI output gets a
   CSS-only trust class; generated JS near page content does not exist here.
5. **Every claim is a test.** 322 unit tests plus a screenshot-verified visual
   suite driving a real browser under Xvfb. Security guarantees are scoped
   honestly (a lexical CSS sanitizer is named as such, with its limits).

## History

This repo began as a heavily over-researched product idea: two multi-agent
research waves, ~50 documents, feature matrices, market sizing, a five-persona
scoring council. The *technical* findings (engine decision, agent-safe IPC,
CRDT sync, local-AI capability, ADHD design science) were load-bearing and
became this browser. The *market* machinery was me cosplaying a startup; it was
retired when I rescoped this to a personal tool. It all stays in
`docs/` and `outputs/` as history — read `CLAUDE.md` for how to read it, and
`docs/execution-plan.md` for the plan this build actually followed, changelog
included.

Still ahead, gated behind daily-drive evidence: the permission-gated agent
runtime (MCP → validated messaging → Xray bridge; CDP rejected), E2EE CRDT
sync, and the deeper tiers of the personalized-web ladder
(`docs/research/openui-ai-personalized-web.md`).

## License

**AGPL-3.0-or-later.** If you run a modified version for others over a network,
share your changes. For a personal browser this is nearly moot — it exists to
keep the code and its forks free.

*Aether is a working codename. The name, like everything else here, is a
dotfile away from being yours.*
