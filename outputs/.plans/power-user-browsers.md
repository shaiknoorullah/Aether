# Comparison Plan: power-user-browsers

**Slug**: `power-user-browsers`
**Date**: 2026-06-10

## Subjects
1. Vivaldi (proprietary Chromium fork, highly configurable GUI)
2. qutebrowser (Python/Qt, keyboard-driven, minimal)
3. Nyxt (Common Lisp, fully programmable)
4. Luakit (WebKit, Lua-scriptable, minimal)
5. Arc (Chromium, spatial/visual workspace focus)
6. Zen (Firefox fork, privacy + customization)

## Dimensions
| # | Dimension | What we're comparing |
|---|-----------|----------------------|
| 1 | Keyboard control | Keybindings coverage, modal input, vim-like support, rebind depth |
| 2 | Customization depth | UI theming, layout, CSS injection, feature toggles |
| 3 | Workspace / spatial org | Tab grouping, spaces, sidebars, vertical tabs, visual nav |
| 4 | Scripting & config model | Language, REPL, config file format, hot-reload |
| 5 | Extensibility | Extension APIs, custom JS/Lua/Lisp hooks, plugin ecosystems |

## Sources to Gather
- Official docs / wikis for each browser
- GitHub repos (config examples, feature lists)
- Recent (2025-2026) reviews and community comparisons
- Reddit / HN threads for power-user opinion
- Release notes for latest versions

## Output Structure
1. Comparison matrix (per dimension × browser)
2. Agreement / Disagreement / Uncertainty callouts
3. Mermaid architecture diagram of config/scripting models
4. Sources section with direct URLs

## Evidence Types Expected
- Official: docs, README, changelogs
- Community: Reddit, HN, forums
- Review: tech press, independent blog posts

## Confidence Model
- High (≥0.8): verified in official docs or direct code
- Medium (0.5–0.8): community sources or indirect docs reference
- Low (<0.5): anecdotal or unverified claim

## Files
- Plan: `outputs/.plans/power-user-browsers.md` (this file)
- Output: `outputs/power-user-browsers-comparison.md`
