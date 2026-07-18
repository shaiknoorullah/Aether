# f3 — Theming (pywal/base16 ingestion)

## 1. Today → Instead → Thinnest

**Today**: pywal restyles the terminal, polybar, and everything else in the rice — but the browser ignores it. Gruvbox hexes are hardcoded and scattered through `userChrome.css` (`#1d2021`, `#ebdbb2`, `#98971a`, `#458588`, `#d79921`, `#b16286`); changing the system palette means hand-editing CSS and restarting.

**Instead**: the browser inherits the system palette. `~/.cache/wal/colors.json` (or a base16-style `[theme.colors]` TOML table) becomes CSS custom properties on the chrome document; statusbar, palette strip, mode badges, and the content void all recolor. `:theme_reload` re-reads from disk — run wal, reload, the browser matches the rice. Execution-plan floor item 3: "cheap, high joy, do it early."

**Thinnest**: one pure module `aether-theme.sys.mjs` — parse, validate, emit CSS text. Glue reads files and swaps the text of a single `<style id="aether-theme">` element in browser.xhtml. `userChrome.css` swaps its hardcoded hexes for `var(--aether-*, <same hex>)` so the default render is pixel-identical to today. No file watching, no color math, no restart.

## 2. Exact behavior

**Palette shape** (validated): `{bg, fg, accent, color0..color15}` — every value strict `#rrggbb` hex (case-insensitive in, lowercased out). A source is **all-or-nothing**: any missing key or invalid value rejects the whole source (one `console.info` in glue), never a half-applied theme. `accent` is optional in both sources and defaults to `color4`.

**Sources, in `auto` precedence**: (1) pywal `colors.json` (`bg` = `special.background`, `fg` = `special.foreground`, colors from `colors.color0..15`) → (2) `[theme.colors]` TOML table (user values deep-merge over defaults as usual) → (3) builtin `GRUVBOX` constant, which always validates. `[theme] source` forces one of `"auto" | "wal" | "toml" | "builtin"`; a forced source that fails validation still falls back to builtin — a broken dotfile or wal run never bricks the chrome.

**CSS emission**: `emitCss(palette)` → `:root { --aether-bg: …; --aether-fg: …; --aether-accent: …; --aether-color0..15: …; }`. Validation is the injection barrier: values that could escape the declaration block (anything not `#rrggbb`) never reach emission. `userChrome.css` consumes the vars with today's hexes as fallbacks; mode badges map to slots that reproduce current gruvbox exactly: normal→`color2`, insert→`color4`, hint→`color3`, palette→`color5`, badge text→`bg`. Statusbar/palette-strip background→`bg`, text→`fg`, selected candidate→`accent`. Content void (the browser container behind/around pages) gets `bg` — chrome-side only; page content is untouched.

**Reload**: new palette registry command `theme_reload` (the plan's `:theme-reload`, spelled with `_` like every other command), no args, completable. Re-reads sources, replaces the style element text, and reports neutrally via the statusbar msg widget: `theme: wal` / `theme: toml` / `theme: builtin` — states what applied, never scolds about what failed. Startup applies the theme once through the same path. **No new keybindings.**

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; `DEFAULTS.theme.colors` references the same `GRUVBOX` constant so builtin/default/example are one source of truth):

```toml
[theme]
source = "auto"                          # auto | wal | toml | builtin
wal_json = "~/.cache/wal/colors.json"    # ~ expands to $HOME

[theme.colors]                           # base16-style fallback palette
bg = "#1d2021"
fg = "#ebdbb2"
accent = "#458588"
color0 = "#282828"
# … color1..color15, gruvbox values
```

## 3. Pure vs glue

- **`aether-theme.sys.mjs`** (pure, Node-testable — no Services/IOUtils/DOM): `GRUVBOX` constant; `parseWalJson(text)` → palette | null; `parseThemeColors(table)` → palette | null; `validatePalette(obj)` (hex + completeness); `resolvePalette({source, walText, tomlColors})` → `{palette, sourceUsed}`; `emitCss(palette)` → string; `expandPath(path, home)` for `~`.
- **`aether-config.sys.mjs`**: `DEFAULTS.theme` added (imports `GRUVBOX` for `theme.colors`; no cycle — theme is pure).
- **`aether-palette.sys.mjs`**: `theme_reload` registry entry.
- **`aether.uc.js`** (chrome glue, not unit-tested): `applyTheme()` — read `wal_json` file text via IOUtils (missing file → null, not an error), call `resolvePalette`, create-or-update `<style id="aether-theme">` in the chrome document; called at init and by the `theme_reload` command implementation, which also `showMessage("theme: <sourceUsed>")`.
- **`userChrome.css`**: hex → `var(--aether-*, hex)` swaps only; plus the content-void background rule.

## 4. Unit tests (behavioral) — `overlay/test/unit/f3-theme.test.mjs`

1. valid pywal colors.json → palette with `bg`/`fg` from `special`, `color0..15` from `colors`, `accent` = `color4`
2. malformed JSON text → null, no throw
3. well-formed JSON with an invalid color value (`"red"`, `"#fff"`, `"#zzzzzz"`) → whole source rejected
4. missing key (e.g. no `color7`) → source rejected — no partial palettes
5. uppercase hex accepted and normalized to lowercase in the palette
6. TOML colors table validates; `accent` absent → defaults to `color4`
7. `auto` precedence: valid wal wins; invalid wal → toml colors; both invalid → `GRUVBOX`; `sourceUsed` reports `wal`/`toml`/`builtin` correctly in each case
8. forced `source = "toml"` ignores a valid wal file; forced `"wal"` with unreadable/invalid wal falls back to builtin (never a broken theme)
9. `GRUVBOX` passes `validatePalette` — the fallback can never itself fail (guard)
10. `emitCss` emits exactly one declaration per palette key (`--aether-bg` … `--aether-color15`), balanced braces, no `undefined` text
11. injection guard: a value like `"#123456; } :root { --evil: 1"` is rejected by validation, and emitted CSS never contains braces sourced from values
12. `expandPath`: `~/x` + home → `home/x`; absolute paths and paths without `~` pass through unchanged
13. `theme_reload` is in the palette REGISTRY, parses with no args, and `complete("theme")` finds it (extends f1 palette tests)
14. config sync guard: `DEFAULTS.theme` (incl. full gruvbox colors table) parses identically from `overlay/config/aether.toml` (extends `f0-config.test.mjs` pattern)

## 5. Visual states — `overlay/test/visual/scenarios.d/f3-theming.sh`

Scenario writes a test `~/.config/aether/aether.toml` pointing `wal_json` at a scratch file, uses `relaunch_browser` to pick the config up, then swaps throwaway palette files (gruvbox-ish A, high-contrast blue B) and runs `:theme_reload` between shots:

1. default theme (no wal file — builtin gruvbox, pixel-equivalent to f1/f2 shots)
2. wal palette A applied (statusbar/palette recolored)
3. palette B applied proving live reload

## 6. Non-goals (budget protection)

- **No file watching** — reload is `:theme_reload` only; wal users add one line to their wal hook.
- No page-content theming — no userContent.css vars, no per-site boosts; that's the personalized-web ladder (Tier 0+ per-domain zaps, Tier 1 AI boosts), post-gate.
- No base16 YAML/scheme-file ingestion — the TOML table is the base16-style path; two parsers is one too many.
- No color math in JS (lighten/darken/contrast/alpha) — derived shades stay in CSS via `color-mix`.
- No Firefox theme/LWT integration, no `browser.theme` API, no toolbar-theme sync — one style element, that's it.
- No per-widget or per-mode color config in TOML — the palette is the API; styling stays in CSS.
- No 3-digit hex, rgb(), or named-color support — `#rrggbb` only (pywal emits exactly this).
- No writing wal templates or exporting the palette anywhere — read-only ingestion.
