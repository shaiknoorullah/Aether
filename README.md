# 🜂 Aether

My browser: local-first, keyboard-driven, zero-chrome — a thin overlay on
stock Firefox. Arch/tmux/vim workflow, everything in dotfiles.

**Not a startup. Not a product. Never monetized.** Built for me, published as
free software. Use it if it fits you.

## Status — v1.1.0, working

No fork, no build step, no dependencies, zero Firefox patches. 322 unit tests
+ a screenshot-verified visual suite. Currently in the 30-day daily-drive gate.

- [x] Zero-chrome + modal keys (reserved chords ours in every mode; normal-mode keys never reach pages)
- [x] Command palette (`:`, Tab completion)
- [x] Statusbar widgets (TOML-ordered: mode, workspace, focus, url, tabs, ai, clock, date)
- [x] Theming (pywal/base16 → `:theme_reload`)
- [x] Vertical tabs + tab graveyard (`:graveyard` resurrects; no tab death)
- [x] Workspaces (container-isolated, persistent across restart)
- [x] EF supports (`:focus <task>` — task-conditioned, never timers; non-shaming copy is test-enforced)
- [x] Local AI sidebar (loopback-only gateway, kill switch default OFF)
- [x] Site boosts (`:zap` element hiding; per-domain CSS dotfiles, sanitized)
- [x] AI CSS boosts (`:boost` — structural sample only, preview + explicit accept)
- [x] Context resurrection (scroll positions survive switches and restarts)
- [ ] Agent runtime (MCP → validated messaging → Xray bridge; post-gate)
- [ ] E2EE CRDT sync (Yjs; Iroh vs js-libp2p decided when built)
- [ ] Personalized-web tiers 2–3 (calm views, generative own surfaces)

Full docs, keybindings, evidence map: [`overlay/README.md`](overlay/README.md).
Plan + changelog: [`docs/execution-plan.md`](docs/execution-plan.md).

## Install

```sh
git clone https://github.com/shaiknoorullah/Aether
cd Aether/overlay
./install.sh     # 3 autoconfig files into the Firefox dir (sudo)
./bin/aether
```

Config: `~/.config/aether/aether.toml` — git it with your dotfiles.
Arch: `pacman -Syu` wipes the autoconfig files; re-run `install.sh` after
Firefox upgrades (or add a pacman hook). After editing overlay JS:
`./bin/aether -purge`. Errors: Browser Console (`Ctrl+Shift+J`).

## History

Started as an over-researched product idea (two multi-agent research waves,
~50 docs in `docs/` and `outputs/`). The technical findings became this
browser; the market machinery was retired when it became a personal tool.
`CLAUDE.md` explains how to read the corpus.

## License

AGPL-3.0-or-later. Aether is a working codename — rename to taste.
