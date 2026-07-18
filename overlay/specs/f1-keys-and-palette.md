# f1 — Keys and Palette

## 1. Today → Instead → Thinnest

**Today**: the spike's modal engine lives inline in `aether.uc.js` — mode state, pending buffer, sequence matching, and reserved-chord handling are tangled with DOM glue, untestable outside a running browser. There is no ex-mode; anything not bound to a key means touching the mouse or the urlbar.

**Instead**: the browser decides *what a keypress means* in a pure module I can test in Node, and `:` opens a command palette so every command is reachable by name — vim's ex-mode for the browser.

**Thinnest**: extract decision logic into `aether-keys.sys.mjs` (no DOM, no Services); `aether.uc.js` shrinks to glue that translates `keydown` → descriptor → decision → effect. Palette is one chrome-owned `<input>` strip above the statusbar plus a pure `aether-palette.sys.mjs` for registry/parse/completion. No new UI framework, no fuzzy matcher.

## 2. Exact behavior

**Modes**: `normal`, `insert`, `hint`, `palette` (new).

**Key engine** (all decided by the pure module):
- Reserved chords (`[keymap.reserved]`, e.g. `C-w`, `C-t`) → **our action in every mode**, including insert and palette. This is the spike's Ctrl+T proof, now asserted in unit tests with a remapped `C-t`.
- `Escape` → return to `normal` from any mode (closes hints/palette, blurs urlbar/fields via glue effects).
- normal: printable keys are matched against `[keymap.normal]` sequences. Exact match → action; prefix of a longer binding (`g` of `gg`) → pending, buffer shown in statusbar (`NORMAL g`); pending expires via an injected timeout event (`options.pending_timeout_ms`, default 800). Printable keys are always swallowed in normal mode — matched or not, they never reach content. Unmodified non-printables (arrows, F-keys, Tab) and unreserved modified chords (`C-c`) pass through.
- insert: everything except reserved chords and Escape passes through.
- hint: unmodified single characters → hint-key actions (swallowed); modified chords pass through.
- palette: printable keys go to the input (passthrough to the chrome input); `Tab`, `Enter`, `Escape` are palette-owned.

**Palette**: `:` in normal mode opens the strip above the statusbar, prefilled empty, mode badge `PALETTE`.
- `:open <url>` — navigate current tab (URL fixup delegated to Firefox in glue).
- `:tab <n>` — switch to tab n (1-based).
- Every command in the registry (`scroll_down`, `tab_close`, `hints`, …the full set from the spike) runnable by name, no args.
- `Tab` cycles prefix completions of the command-name token (wraps; candidates rendered above the input); `Enter` parses and runs, then closes; `Escape` closes, runs nothing. Unknown command: statusbar shows `no command: <name>` and the palette stays open — neutral wording, no error styling beyond the message (non-shaming applies to chrome copy too).

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`):
```toml
[options]
pending_timeout_ms = 800   # multi-key sequence window (was hardcoded)
palette_max_items = 8      # completions rendered at once

[keymap.normal]
":" = "palette"            # joins the existing bindings; new command name
```
New command: `palette` (open the strip). Everything else unchanged.

## 3. Pure vs glue

- **`aether-keys.sys.mjs`** (pure, Node-testable): mode machine + matcher. `createEngine(config)` holding `{mode, buffer}`; `handleKey(descriptor)` and `handleTimeout()` each return a decision: `{kind: "action", command}` | `{kind: "pending", buffer}` | `{kind: "passthrough"}` | `{kind: "swallow"}`, plus mode transitions via `setMode`/decision side-band. Descriptors are plain objects `{key, ctrl, alt, meta}` — no `KeyboardEvent`. No timers: the glue owns `setTimeout` and injects expiry.
- **`aether-palette.sys.mjs`** (pure, Node-testable): command registry, `parse(input)` → `{name, args}` | `{unknown}`, `complete(input, registry)` → ordered candidates, `cycle(state)` for Tab wrapping. Command *implementations* stay in glue.
- **`aether.uc.js`** (chrome glue, not unit-tested): keydown → descriptor, decision → `preventDefault`/command dispatch, timeout scheduling, palette DOM (input strip + candidate row), statusbar rendering, actor messaging. Target: no branching logic that isn't a straight decision→effect map.

## 4. Unit tests (behavioral)

Keys — `overlay/test/unit/f1-keys.test.mjs`:
1. single bound key in normal → action, swallowed
2. `g` → pending with buffer `g`; then `g` → `top` action, buffer cleared
3. injected timeout clears pending; the next key matches fresh
4. unmatched printable in normal → swallow (never reaches content), pending cleared
5. unmatched non-printable (ArrowDown, F5) in normal → passthrough
6. unreserved modified chord (`C-c`) in normal → passthrough
7. **reserved-chord proof**: config remaps `C-t` to a custom command; engine returns *our* action for it in normal, insert, hint, and palette modes
8. insert mode: printable keys passthrough; Escape → normal
9. hint mode: single letters → hint-key action swallowed; `C-c` passthrough; Escape → normal
10. `:` in normal → `palette` action; engine enters palette mode; printables then passthrough to the input
11. Escape in palette/hint/insert always lands in normal with cleared buffer
12. config keymap overrides defaults (remap `j`; old default no longer fires)

Palette — `overlay/test/unit/f1-palette.test.mjs`:
13. `parse("open example.com")` → `{name: "open", args: ["example.com"]}`; tolerant of extra whitespace
14. `parse("tab 3")` → tab with numeric arg; `parse("tab")` without arg → unknown/invalid, not a crash
15. `parse("zzz")` → unknown; message text contains no punitive wording (spot-check the copy constant)
16. `complete("ta")` → all `tab*` commands, stable deterministic order
17. Tab cycling wraps: cycling past the last candidate returns to the first
18. unique prefix completes fully in one Tab
19. empty input completion lists the whole registry (capped by `palette_max_items`)
20. every command name in the default keymap/registry is completable (property test over the registry)
21. completion rewrites only the command-name token; typed args survive cycling

Config — extend `f0-config.test.mjs`: defaults include `pending_timeout_ms`, `palette_max_items`, and the `":"` binding; example TOML in `overlay/config/aether.toml` parses to exactly the defaults (sync guard).

## 5. Visual states

1. palette open with completions visible
2. palette after Tab-completion
3. statusbar showing pending multi-key sequence (`g`…)
4. NORMAL/INSERT/HINT badges unchanged from spike (regression shots)

## 6. Non-goals (budget protection)

- No fuzzy matching, scoring, or frecency — prefix completion only.
- No command history, no aliases, no user-defined commands, no macros, no vim counts (`5j`).
- No Shift-Tab reverse cycling; no argument completion (URLs, tab titles).
- No URL fixup logic in pure code — Firefox's URIFixup via glue.
- No per-mode user keymaps beyond `normal` + `reserved`; hint chars stay an option, not a keymap.
- No urlbar replacement — `o` still summons the stock urlbar; the palette is for commands, not search.
