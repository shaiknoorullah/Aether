#!/usr/bin/env bash
# Render assets/logo/aether.svg into the hicolor PNG sizes launchers ask for.
# Output: assets/logo/png/aether-<N>.png. Needs rsvg-convert (librsvg).
#
# The PNGs are committed, not generated at install: install.sh must stay
# zero-dependency (it runs on any box with bash + firefox), and a launcher
# that only reads PNGs (some docks, older KDE panels) must still get an icon.
# Re-run this after editing the SVG and commit both.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/assets/logo/aether.svg"
OUT="$ROOT/assets/logo/png"
SIZES=(16 24 32 48 64 128 256 512)

command -v rsvg-convert >/dev/null || { echo "rsvg-convert not found (pacman -S librsvg)" >&2; exit 1; }
mkdir -p "$OUT"
for size in "${SIZES[@]}"; do
  rsvg-convert --width "$size" --height "$size" --keep-aspect-ratio "$SRC" --output "$OUT/aether-$size.png"
done
echo "rendered ${#SIZES[@]} sizes into ${OUT#"$ROOT"/}"
