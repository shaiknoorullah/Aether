#!/usr/bin/env bash
# The thin-fork budget, enforced. Fails when the glue file grows past its
# ceiling; reports the runtime-path line count every time.
#
# The design review (docs/design-review-2026-08-14.md §6, #57) found that a
# glue refactor promised "as a side effect of feature work" never happens, and
# recommended a CI line ceiling on aether.uc.js. v1.2.0 left it at 2,688. The
# ceiling below is that plus a small margin: growth past it means either the
# extraction happens first, or the ceiling is raised in a commit that says why.
set -euo pipefail

GLUE_CEILING=2700

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
O="$ROOT/overlay"
GLUE="$O/chrome/JS/aether.uc.js"

count() { cat "$@" 2>/dev/null | wc -l | tr -d ' '; }

shopt -s nullglob
js=("$O"/chrome/JS/*.mjs "$O"/chrome/JS/*.js)
chrome=("$O"/chrome/*.css "$O"/chrome/*.html "$O"/chrome/chrome.manifest)
cfg=("$O"/config/* "$O"/prefs/* "$O"/loader/* "$O"/install.sh)

glue=$(count "$GLUE")
n_js=$(count "${js[@]}")
n_chrome=$(count "${chrome[@]}")
n_cfg=$(count "${cfg[@]}")

printf 'runtime path: %d lines\n' $((n_js + n_chrome + n_cfg))
printf '  privileged JS                %6d  (%d files)\n' "$n_js" "${#js[@]}"
printf '  chrome CSS/HTML/manifest     %6d\n' "$n_chrome"
printf '  config/prefs/loader/install  %6d\n' "$n_cfg"
printf 'glue aether.uc.js: %d / ceiling %d\n' "$glue" "$GLUE_CEILING"

if (( glue > GLUE_CEILING )); then
  echo "budget: aether.uc.js is over its ceiling by $((glue - GLUE_CEILING)) lines — extract into a pure module, or raise GLUE_CEILING in a commit that says why" >&2
  exit 1
fi
