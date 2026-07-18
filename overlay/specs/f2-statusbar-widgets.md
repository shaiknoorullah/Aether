# f2 — Statusbar Widgets

## 1. Today → Instead → Thinnest

**Today**: the statusbar is four hardcoded spans built inline in `aether.uc.js` (mode, url, message, clock), each with its own ad-hoc update path; the clock owns a private `setInterval` with `Date.now`/`new Date()` untestable outside a running browser. Adding a segment (tab count, later workspace/Timewarrior-class widgets) means editing chrome glue.

**Instead**: the statusbar is a widget framework — TOML declares *which* slots in *what* order; each slot is a small render function on a shared scheduler. New widgets become additions (a registry entry + a CSS class), not rewrites. This is execution-plan floor item 4 ("Widget API from the start").

**Thinnest**: one pure module `aether-widgets.sys.mjs` holding the builtin registry, config resolution, interval bookkeeping (injected clock, no `Date.now` in pure code), and the builtin render functions. `aether.uc.js` shrinks its statusbar code to: build spans from the resolved list, feed events/ticks into renders, map `{text, class}` onto spans. **Default output is pixel-equivalent to today** — same span order, same class names, same clock format — so f1's regression shots still pass.

## 2. Exact behavior

**Widget contract**: `{id, refresh_s, render(ctx) -> {text, class}}`. `refresh_s` absent/0 ⇒ event-driven only (re-rendered when glue signals a change); `refresh_s > 0` ⇒ also re-rendered on schedule. `ctx` is a plain object built by glue: `{mode, buffer, url, message, tabCount, nowMs, locale}` (`locale` undefined ⇒ system; tests inject a fixed one).

**Builtins** (ids and renders):
- `mode` — `NORMAL` / `NORMAL g` (uppercase mode + pending buffer), class `aether-mode`. Event-driven.
- `url` — current URI spec, class `aether-url`. Event-driven (location change, tab select).
- `msg` — transient palette/tab messages, class `aether-message`. Event-driven. It is a widget so the TOML list fully describes the bar.
- `tabs` — open-tab count as a plain decimal string (`"3"`), class `aether-tabs`; any prefix/glyph is CSS's job (`::before`). Event-driven (TabOpen/TabClose/TabSelect).
- `clock` — `HH:MM` via `Intl.DateTimeFormat(locale, {hour: "2-digit", minute: "2-digit"})` on `ctx.nowMs`, class `aether-clock`, `refresh_s = 30` (today's cadence).
- `date` — via `Intl.DateTimeFormat(locale, {weekday: "short", day: "2-digit", month: "short"})` (ambient time anchoring, EF), class `aether-date`, `refresh_s = 300`.

**Resolution rules**: order comes from config verbatim. Unknown ids are *skipped silently* (no warning styling, one console.info in glue) — so `"workspace"` can sit in a dotfile today and light up when the workspaces feature registers it. Duplicate ids: first occurrence wins. `statusbar_clock = false` (existing option, kept for back-compat) removes `clock` from the effective list. A `render` that throws yields `{text: ""}` and never breaks the rest of the bar — a broken widget is an empty slot, not an error state.

**Scheduler**: pure interval bookkeeping. `createScheduler(widgets, nowMs)` → `{periodMs, tick(nowMs) -> [ids due]}`. `periodMs` = min `refresh_s` among scheduled widgets (ms), or `null` when none — glue then creates zero timers. Late ticks fire a widget once and rebase from the tick time (no catch-up bursts, no double-fires). Glue owns the single `setInterval(periodMs)` and calls `tick` with real time.

**Keybindings**: none added or changed. No new palette commands (palette listing of widgets is a later f1 extension, not this feature).

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; array-of-strings already parses):

```toml
[statusbar]
widgets = ["mode", "url", "msg", "clock"]   # order = render order; add "tabs"/"date", reserve "workspace"
```

Default list is exactly today's bar. Refresh intervals are builtin constants, not config (see non-goals).

## 3. Pure vs glue

- **`aether-widgets.sys.mjs`** (pure, Node-testable — no Services/Ci/IOUtils/DOM, no `Date.now`): `BUILTINS` registry; `resolveWidgets(config)` → ordered widget defs (config order, unknown-skip, dupe-first-wins, `statusbar_clock` back-compat); `createScheduler(widgets, nowMs)`; `renderWidget(widget, ctx)` → `{text, class}` with throw containment; the builtin render functions.
- **`aether.uc.js`** (chrome glue, not unit-tested): builds one span per resolved widget inside `#aether-statusbar` (span gets the render's class; `data-mode` on the bar stays as-is for badge colors); builds `ctx` from `gBrowser`/engine state; wires events → targeted re-renders (mode/buffer → `mode`, location/TabSelect → `url`+`tabs`, TabOpen/TabClose → `tabs`, messages → `msg`); one interval at `periodMs` driving `tick`; teardown on unload. Existing `showMessage`/`clearMessage`/`renderStatus` call sites become renders of `msg`/`mode`.
- **`userChrome.css`**: existing statusbar rules untouched; add `.aether-tabs`, `.aether-date` (clock-like opacity).

## 4. Unit tests (behavioral) — `overlay/test/unit/f2-widgets.test.mjs`

1. default resolution yields `mode, url, msg, clock` in that order — pixel-equivalence guard
2. custom `[statusbar] widgets` reorders and subsets; resolved order matches config exactly
3. unknown id (`"workspace"`) is skipped without throwing; the rest of the list survives
4. duplicate id resolves once (first position wins)
5. `statusbar_clock = false` drops `clock` from the resolved list; the rest is unchanged
6. mode render: uppercase mode; pending buffer appended (`NORMAL g`); class `aether-mode`
7. url and msg renders echo ctx values; empty message renders empty text (no placeholder copy)
8. tabs render: decimal string of `tabCount`; changes when ctx changes
9. clock render: fixed epoch + injected locale → expected `HH:MM`; epochs a minute apart render differently
10. date render: fixed epoch + injected locale → expected weekday/day/month string
11. scheduler: clock due at `t0 + 30s`, not at `t0 + 29s`; due again 30s after firing
12. scheduler: list with no `refresh_s` widgets → `periodMs === null` and `tick` returns `[]`
13. scheduler: mixed intervals (clock 30, date 300) → `periodMs` = 30s; date not returned until its own deadline
14. scheduler: a late tick (e.g. `t0 + 95s` after a stall) returns the widget once and rebases — no double-fire on the next tick
15. throwing render is contained: `renderWidget` returns empty text, sibling widgets render normally
16. config sync guard: `DEFAULTS` statusbar section parses identically from `overlay/config/aether.toml` (extends `f0-config.test.mjs` pattern)

## 5. Visual states — `overlay/test/visual/scenarios.d/f2-widgets.sh`

1. statusbar with default widget set (pixel-equivalent to f1 shots: mode badge, url, clock)
2. statusbar with reordered/custom TOML widget config — tabs count visible and correct after opening tabs

## 6. Non-goals (budget protection)

- No user-supplied JS widgets loaded from disk — builtins only; the contract is the extension point, dotfile-loaded modules wait until I have a second real widget need.
- No `workspace` widget implementation — the id is reserved and skip-safe until workspaces (floor item 5) exist.
- No network/exec widgets (ArgoCD, GitHub, Timewarrior) — those are post-floor additions on top of this contract.
- No per-widget TOML options, colors, or refresh overrides — order-only config; styling stays in CSS classes.
- No async renders, no sub-second refresh, no click/hover interactivity, no widget animations.
- No new palette commands or keybindings; no removal of `statusbar_clock` (kept, honored, documented as legacy).
