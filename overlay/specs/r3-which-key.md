# r3 — Which-Key (discovery by using the keyboard)

## 1. Today → Instead → Thinnest

**Today**: the keymap is in a TOML file I wrote, which means I know it — until I add fifteen mod commands (x2) and stop knowing it. The existing discovery path is `:` and prefix completion, which only helps if I already know the command's *name*. Nyxt solves this with `describe-bindings` and a manual; that is the developer-designed answer, and it's the half of Nyxt worth rejecting. Reading documentation about a keyboard is not how you learn a keyboard.

**Instead**: press `g` and hold. After a short delay, a panel fades in listing every binding that starts with `g` — `gg → top`, `gw → next workspace` — and disappears the moment the sequence completes or is cancelled. Discovery happens in the moment of use, at the cost of one pause, and it teaches by motion and typography rather than by prose.

**Thinnest**: the key engine already tracks a pending sequence and already has a timeout (`pending_timeout_ms`). Which-key is a *render of state that already exists*: one pure function turning the pending prefix plus the keymap into a sorted list, and one chrome element. No new input handling, no new state machine, no interception changes.

## 2. Exact behavior

**Trigger**: whenever the key engine holds a non-empty pending sequence for longer than `which_key_ms` (default `400`), the panel appears listing every binding whose key sequence starts with that prefix. It disappears on sequence completion, on `Escape`, on timeout (`pending_timeout_ms` — unchanged), or on any key that makes the prefix unmatchable.

The panel is **never** the reason a keystroke is delayed. It renders *alongside* the existing pending state; the sequence resolves on exactly the same timing it does today, whether the panel is up or not. This is the load-bearing property: which-key must be free to ignore.

**Content**: one row per candidate, `<remaining keys> → <command description>`, sorted by remaining-key length then alphabetically, so single-key completions come first. Rows show the *description* from the registry entry (the same string `:describe` and the settings panel use — one text, three consumers), falling back to the command name where a description is absent. Capped at `palette_max_items` rows plus a neutral `+N more` line — a mod that defines 40 `git:` commands must not paint a full-screen wall.

**Root list**: `?` in normal mode (bindable; default `?` = `which_key`) shows the panel for the *empty* prefix — every top-level binding. That is the "what can I even do" surface, and it is the same renderer with a different prefix.

It is also a **distinct state**, not the pending-prefix path with an empty string. `?` is an exact keymap match, so it fires as an action and the engine's pending buffer is empty — which is precisely the condition the "never a permanent HUD" guard forbids. So `shouldShow` takes an explicit `forced` flag, and the root list has its own dismissal rule: **any key closes it, and that key is then handled normally**. Without that, the root panel has no exit but `Escape` and no timeout, because there is no sequence to complete.

**Modes**: normal mode only. Insert mode has no sequences; palette mode has its own completion UI; hint mode is already a labelled overlay. Rendering which-key over any of them would be noise competing with the thing you're doing.

**Styling** is r2's vars — same radius, blur, motion, font. The fade-in *is* the affordance: an instant panel reads as an interruption, a 120ms fade reads as an offer.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[options]
which_key_ms = 400        # pause before the panel appears; 0 = instant, -1 = never

[keymap.normal]
"?" = "which_key"         # the root list
```

New registry command: `which_key` — zero-arg, completable. `which_key_ms = -1` disables the feature entirely without removing the binding.

## 3. Pure vs glue

- **`aether-whichkey.sys.mjs`** (pure, Node-testable — no DOM/timers): `candidatesFor(keymap, prefix, registry)` → `[{remaining, command, description}]` sorted deterministically; `truncate(rows, max)` → `{rows, moreCount}`; `shouldShow({pendingKeys, elapsedMs, whichKeyMs, forced})` → boolean. **`elapsedMs` is a parameter**, not something the glue's `setTimeout` decides — otherwise the threshold rule lives entirely in untested glue and the pure function can only answer "is this enabled", which is not the question.
- **`aether-keys.sys.mjs`** (pure): exposes the pending sequence as readable state (it already holds it) — no behavioral change, no new timing.
- **`aether-palette.sys.mjs`** (pure): registry entries gain the `description` field which-key, `:describe`, and r5's settings panel all read; `which_key` REGISTRY entry.
- **`aether.uc.js`** (glue): one timer started when the pending sequence becomes non-empty and cleared on every resolution path; create/update/hide the panel element; row rendering as `textContent`.
- **`userChrome.css`**: the panel, using r2's vars.

## 4. Unit tests (behavioral) — `overlay/test/unit/r3-whichkey.test.mjs`

1. `candidatesFor` with prefix `g` over the default keymap → exactly `gg` and `gw`, with their remaining keys (`g`, `w`) and descriptions
2. empty prefix → every top-level binding, none duplicated, one row per distinct sequence
3. a prefix matching nothing → empty list (the caller hides; the function does not throw or invent)
4. sort order: shorter remaining first, then alphabetical — asserted with a fixture where both rules are needed to determine the order
5. rows carry the registry `description` when present and fall back to the command name when absent — never `undefined`, never blank
6. an unknown command referenced by the keymap (a typo, or a mod command not yet loaded) renders as a row with the raw command name rather than being silently dropped — a broken binding must be *visible*, that's the whole point of the feature
7. `truncate` at `palette_max_items` → exact row count plus a `moreCount` of the remainder; never a partial final row
8. `shouldShow`: `-1` never shows; `0` shows immediately; a positive value shows only once `elapsedMs >= whichKeyMs`, asserted at the boundary from both sides with an injected elapsed value
9. an empty pending sequence with `forced: false` never shows (guard: which-key is not a permanent HUD); with `forced: true` it shows the root list — the two states asserted separately, since the guard would otherwise forbid the `?` feature
10. 200 synthetic `git:*` bindings under one prefix → still capped, still deterministic order, no unbounded work

`overlay/test/unit/r3-config.test.mjs`:

11. config sync guard: `DEFAULTS.options.which_key_ms` and the `?` binding parse identically from `overlay/config/aether.toml`
12. `which_key` in REGISTRY, zero-arg; every builtin registry entry now has a non-empty `description` (guard: a command with no description is invisible in three surfaces at once)
13. every description passes the f6 lexicon sweep

## 5. Visual states — `overlay/test/visual/scenarios.d/h3-which-key.sh`

1. **panel after a prefix pause** — press `g`, wait past `which_key_ms`, shot shows `gg → top` and `gw → next workspace`
2. **sequence completes, panel gone** — press `g` then `g`; shot shows the page scrolled to top and no panel
3. **root list** — `?`, shot of the full top-level binding list, truncated with `+N more`
4. **timing is unaffected** — pause on `g` until the panel *is* up, then press the completing `g`: one shot asserts both that the action fired (page scrolled to top) and that the panel is gone. A run where the panel never renders exercises no panel code and would pass identically if which-key *were* on the dispatch path — it must be up for the test to mean anything.
5. **disabled** — `which_key_ms = -1`, long pause on `g`, no panel, sequence still resolves
6. **root list dismissal** — `?`, then press `j`: the panel closes *and* the page scrolls (the key is handled normally, not swallowed)

## 6. Non-goals (budget protection)

- **No manual, no tutorial, no in-browser docs pages.** This spec exists precisely to avoid building those.
- **No key-chord editing from the panel** — it's a display. Editing is TOML plus r5.
- **No which-key in insert/palette/hint modes**, and no persistent binding HUD.
- **No fuzzy search inside the panel** — it's a list of what the next keystroke can be, not a search surface. Search is the palette (x3).
- **No per-command help text beyond one line.** If a command needs a paragraph, the command is wrong.
- **No animation beyond r2's fade** — no staggered rows, no slide-in per item.
