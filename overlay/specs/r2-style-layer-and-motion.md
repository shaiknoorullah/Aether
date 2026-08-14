# r2 — Style Layer and Motion (rice beyond colour)

## 1. Today → Instead → Thinnest

**Today**: f3 gave the chrome a palette — 19 colour vars and nothing else. Every other visual decision (corner radius, padding, panel width, the fact that nothing animates) is a hardcoded constant inside `userChrome.css`. Changing how the statusbar *feels* means editing CSS in the repo, which is not ricing, it's patching. And nothing moves: panels appear and disappear instantly, which is the single largest gap between "themed" and "designed."

**Instead**: a second var layer, `[style]`, driven from TOML exactly like `[theme.colors]` — radius, gaps, padding, panel widths, opacity, blur, border weight, font family/size, and motion (duration + easing). Plus a motion pass on the surfaces that already exist: statusbar, palette strip, sidebar, and (r4) panels. With r1's live reload, tuning is save-and-see.

**Thinnest**: extend the pure theme module with a second validated emitter rather than inventing a parallel system — `emitStyleCss(style)` next to `emitCss(palette)`, one `<style id="aether-style">` element next to the theme one. `userChrome.css` swaps constants for `var(--aether-*, <same constant>)`, so an empty config renders pixel-identical to today. Motion is CSS transitions on vars; no JS animation, no library, no keyframe engine.

## 2. Exact behavior

**Style shape** (validated, all-or-nothing per key *class*, not per file — see below):

```toml
[style]
radius        = "8px"       # corner radius, chrome-wide
gap           = "6px"       # space between statusbar slots
pad           = "4px 8px"   # inner padding of chrome surfaces
border        = "1px"
panel_width   = "38rem"     # palette / panel surfaces
panel_height  = "60vh"
opacity       = 0.96        # chrome surface opacity
blur          = "12px"      # backdrop blur; "0" disables
font          = "monospace" # chrome font family
font_size     = "13px"
motion_ms     = 120         # transition duration
motion_ease   = "cubic-bezier(0.22, 1, 0.36, 1)"
motion        = true        # master switch; false = 0ms everywhere
```

**Validation is per-key with typed validators**, not the palette's whole-source rejection — a bad `radius` falls back to the default `radius` and everything else still applies, with one calm line naming the key (`style: radius ignored`). Colours are all-or-nothing because a half-applied palette is unreadable; a half-applied style layer is merely less tuned. **Every validator is an allow-list**: lengths match `^-?[0-9.]+(px|rem|em|%|vh|vw)$`, unitless numbers a bounded range, easing must match a `cubic-bezier(...)`/`linear`/`ease*`/`steps(...)` grammar, and `font` is matched against a family-name grammar (no `url()`, no commas that could close a declaration). Same principle as f3: **validation is the CSS injection barrier**, and anything that fails it never reaches emission.

**Emission**: `:root { --aether-radius: …; --aether-gap: …; … }` into `<style id="aether-style">`, a sibling of the theme element. Two elements, not one, so `:theme_reload` and a style change stay independently applicable.

**Motion**: `--aether-motion-ms` and `--aether-motion-ease` are consumed by transition rules in `userChrome.css` on exactly four surfaces — statusbar (message slot changes), palette strip (open/close), AI sidebar (open/close), and r4 panels (open/close). Opening transitions animate opacity and a small transform; nothing animates position-of-content, and nothing loops. `motion = false` sets the duration var to `0ms`, which disables every transition through one value — and the same happens automatically when the OS reports `prefers-reduced-motion`, which is a hard override the config cannot re-enable.

**`[style]` participates in r1's reload** as its own domain: change a value, save, see it.

## 3. Pure vs glue

- **`aether-style.sys.mjs`** (pure, Node-testable — no Services/DOM): `DEFAULTS_STYLE` constant (the exact values `userChrome.css` ships with, so default == builtin == example, one source of truth, per f3's precedent); `VALIDATORS` — one typed allow-list validator per key; `buildStyle(table)` → `{style, rejected: [key]}` (never throws, never partial-per-key); `emitStyleCss(style)` → the `:root` text.
- **`aether-config.sys.mjs`**: `DEFAULTS.style` imports `DEFAULTS_STYLE` (no cycle — style is pure).
- **`aether-reload.sys.mjs`** (r1): `style` joins `DOMAIN_MAP`.
- **`aether.uc.js`** (glue): `applyStyle()` — create-or-update `<style id="aether-style">`; one message naming rejected keys; `prefers-reduced-motion` media query listener forcing the duration var to `0ms`.
- **`userChrome.css`**: constants → `var(--aether-*, <same constant>)`; transition rules on the four surfaces.

## 4. Unit tests (behavioral) — `overlay/test/unit/r2-style.test.mjs`

1. empty/missing `[style]` → `buildStyle` returns exactly `DEFAULTS_STYLE`, `rejected` empty (the default render is unchanged, which is the compatibility guarantee)
2. every documented key round-trips: a valid value for each appears in `emitStyleCss` output under its `--aether-*` name
3. a bad length (`"8"`, `"8pt"`, `"calc(1px)"`) → that key falls back to its default and is named in `rejected`; **other keys still apply** (per-key, not per-source)
4. injection guard: `radius = "8px; } :root { --evil: 1"` is rejected, and emitted CSS contains no braces sourced from values
5. injection guard 2: `font = "monospace; background: url(http://x)"` and `motion_ease = "cubic-bezier(0,0,0,0); } *{display:none"` are both rejected by grammar, not by escaping
6. `opacity` outside `0..1` and `motion_ms` outside a bounded range → rejected, defaulted, named
7. `motion = false` → the emitted duration var is exactly `0ms` (one value disables everything, no second switch)
8. `blur = "0"` is valid and emits `0` (disabling blur is not an error)
9. `emitStyleCss` emits one declaration per key, balanced braces, no `undefined` text (mirrors f3 test 10)
10. `DEFAULTS_STYLE` passes every validator — the fallback can never itself fail (guard, mirrors f3 test 9)
11. `buildStyle` is idempotent: feeding its own output back yields identical output

`overlay/test/unit/r2-config.test.mjs`:

12. config sync guard: `DEFAULTS.style` parses identically from `overlay/config/aether.toml` (f0 pattern)
13. r1 integration: a changed `[style]` value diffs to exactly the `style` domain

## 5. Visual states — `overlay/test/visual/scenarios.d/h2-style-and-motion.sh`

1. **default style** — pixel-equivalent to the f1/f2 baseline shots (the compatibility claim, proven by comparison rather than asserted)
2. **restyled chrome** — a scenario `[style]` with large radius, wide gaps, low opacity + blur; `:reload`; shot shows the same widgets, visibly different chrome
3. **rejected key is partial, not fatal** — one invalid value among valid ones: the valid ones applied, statusbar names the rejected key, nothing reverts to default wholesale
4. **motion on** — palette open captured mid-transition (short shutter after the keypress) showing intermediate opacity
5. **motion off** — `motion = false`, same capture timing, fully-opaque panel in the same frame (no intermediate state exists)

## 6. Non-goals (budget protection)

- **No per-widget or per-surface style config.** One radius, one gap, one font for the whole chrome. Per-element styling is what `userChrome.css` is for, and it stays a file you can edit.
- **No colour math** (lighten/darken/alpha/contrast) — f3 already ruled this out; derived shades stay in CSS via `color-mix`.
- **No JS animation, no keyframes, no spring physics, no animation library.** Transitions on vars, four surfaces, one duration.
- **No layout config** — position of the statusbar, side of the sidebar, panel anchoring stay CSS constants. Making layout configurable multiplies every visual test by the number of layouts.
- **No icon themes, no font *loading*** (family names only, from fonts you already have — a config that can fetch a font is a config that can phone home).
- **No theme packs / presets shipped in-repo.** A `[style]` block is nine lines; a preset system is a distribution problem, and distribution is x2's job.
- **No animated page content** — chrome only, always.
