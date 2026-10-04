# Aether logo

The alchemical fire triangle (🜂) drawn as a gold **Λ** whose base is a blue
bar — the statusbar, the one piece of chrome Aether keeps. Gruvbox palette:
tile `#1d2021` (edge `#3c3836`), flame `#fabd2f → #d79921`, base `#458588`.

| File | Use |
|---|---|
| `aether.svg` | source of truth; installed as the hicolor `scalable` app icon |
| `aether-symbolic.svg` | one-colour filled path (`#2e3436`) for panels/trays that recolour `*-symbolic` icons |
| `png/aether-<N>.png` | 16–512 px renders for launchers that only read PNGs |

PNGs are committed so `overlay/install.sh` stays dependency-free. After editing
`aether.svg`, re-render with `scripts/render-icons.sh` (needs `rsvg-convert`) and
commit both. The 16 px render is the one to check by eye.

License: AGPL-3.0-or-later, same as the project (decided 2026-10-04; see
`LICENSE` at the repository root).
