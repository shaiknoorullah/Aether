# r4 — Panel Primitive + Tab Panel (tabs stop being a strip)

## 1. Today → Instead → Thinnest

**Today**: f4 restyled Firefox's native vertical tabs and summons them with `T`. Daily-driving it produced friction-log entry #3 on day one: **a spatial strip is not how I find a tab.** I don't remember where a tab *is*, I remember what it *was* — so I want to type three characters of it. A strip also scales badly precisely when it matters (40 tabs), and it costs screen width permanently to solve a problem that occurs in bursts.

**Instead**: tabs become a **panel** — opens focused on a search field, fuzzy, **MRU-sorted** so the top row is always the tab I just came from and the panel doubles as alt-tab. Plus the things a list can do that a strip can't: rename, tag, pin, duplicate, mark for direct return, and close without leaving the list. The vertical strip is deleted, along with its CSS.

**Thinnest**: build the **panel primitive** once — a chrome surface with a search input, a candidate list, a keyboard contract, and r2 styling — then implement tabs as its first *source*. Bookmarks, history, graveyard and downloads (p1) are later sources on the identical surface, not new UI. The primitive is deliberately the same shape as the palette's candidate list so the two never diverge in feel.

## 2. Exact behavior

### The primitive

A panel is `{title, source, actions, onPick}`. Opening one: focuses the search input, renders the source's rows, and takes the keyboard.

**This requires a fifth mode in the key engine.** `aether.uc.js` installs a capture-phase keydown listener that routes every key through `createEngine`'s modes before the DOM sees it; in normal mode all printables return `swallow` and the glue calls `preventDefault`. The palette works only because `aether-keys.sys.mjs` has an explicit `case "palette"` returning `passthrough` for printables. Without a `panel` mode, the panel opens with its search field focused and every keystroke is eaten — and every unit test in this spec still passes, because they test the pure module with no engine attached. So `aether-keys.sys.mjs` is in scope for this spec (§3), and f1's mode tests extend.

Contract, identical for every panel forever:

| Key | Action |
|---|---|
| type | filter (x3's matcher; substring until x3 lands) |
| `↓` / `↑` | move selection |
| `Ctrl+Space` | toggle mark on the selected row |
| `Enter` | primary action on selection |
| `Tab` | cycle *actions* for the selected row |
| `Esc` | close, no side effects |

Two keys deliberately **not** in that table. `Ctrl+n` is a reserved chord — Aether's in every mode, which is f1's core proof — so binding it to "move down" would either open a tab under the panel or break the proof; `Ctrl+p` is unbound and would reach Firefox's print accelerator. And `Space` cannot both type a character and toggle a mark while a text input has focus, so marking is `Ctrl+Space`.

Marks are multi-select: mark six rows, then one action applies to all six. That is Nyxt's prompt-buffer idea, and it is the reason a list beats a strip — a strip cannot express "these six."

**Rows are keyed, and the row set can change under you.** `replaceRows(state, rows, {keyBy})` is part of the pure API, because three consumers need it: p3's transfers finish on their own, p2's forget removes rows, p1's delete does too — and this spec's own "close from the list removes the row without closing the panel" needs it. Selection and marks are resolved **by stable row key**, never by index; a mark whose key vanishes is **dropped, and the count of dropped marks is reported** rather than silently retargeted. Without that rule, marking row 2 and pressing `Tab`→`Enter` 200 ms later can cancel a different download or forget a different URL — destructive actions landing on the wrong row is the failure mode this primitive exists to prevent.

Rows render `textContent` only. A panel never renders remote content, never executes anything from a row, and never auto-acts on selection change (moving the cursor is not an action).

**Every panel action is also a registry command.** Not a closure hanging off the panel — `tab_close(id)`, `tab_rename(id, name)`, and so on, with the panel invoking the same entry the palette and a keybinding would. This is a1's entire premise ("everything I can do is a registry command, so the agent's tool list is a projection of the registry") and it is free here and expensive later: retrofitting ~30 argument-taking commands at v2.1 is a rewrite, while defining them as commands now costs a line each. Multi-select applies one command over the marked keys, and that "apply to these six" shape is part of the command contract from the start.

### The tab source

`:tabs` (and `T`, rebound from the deleted strip) opens the tab panel:

- **MRU order, current tab excluded from the top** — the current tab sorts *last* when the panel is unfiltered, so row 1 is the tab you just came from and `Enter` is alt-tab. Strict "most recently used first" would put the tab you are already on at row 1, and `Enter` would do nothing; the alt-tab property is the reason this ordering was chosen, so it is stated rather than implied.
- **Rows**: `[pin] [mark] title — host [tags]`. Renamed tabs show the rename, with the real title dimmed after it (a rename must never hide what the page actually is).
- **Scope**: current workspace by default; `Tab`-cycled action `all workspaces` widens it, and picking a tab from another workspace switches workspace and focuses it.
- **Actions** (`Tab` cycles): switch (default), close, duplicate, rename, tag, pin, move-to-workspace.
- **Close from the list** removes the row without closing the panel, and the close goes through the existing f4 graveyard path — closing from the panel and pressing `x` are the same act with the same archive.

### Tab metadata

Rename, tags, pin, and mark-letter are per-tab metadata for **live** tabs, persisted in `aether-workspaces.json` (**schema 3**, additive, same pattern and guards as b3's scroll records — old files deserialize, malformed entries drop individually).

**A closed tab's metadata moves with it into the graveyard.** The two stores have no common identifier — graveyard records carry their own `nextId`, and a resurrected tab is a fresh `gBrowser` tab — so "metadata follows a tab into the graveyard" is unimplementable as a cross-store lookup. Instead f4's record shape gains an additive `meta?` field (malformed `meta` drops to `{}`, per f4's existing per-record tolerance): one store owns a dead tab, one owns a live one, and the handoff is a field copy at bury and exhume time. Mark resolution checks live tabs first, then the graveyard — which is what makes `'r` reopen a marked tab you closed.

### Marks and pins

- `m<char>` in normal mode marks the current tab with a letter; `'<char>` jumps to it. A mark is a single letter, one tab per letter, reassignment is silent.
- Pinned tabs get `1`–`9` in normal mode. Pins are per-workspace and sort to the top of the panel above the MRU rows.

**These need a new decision kind in the key engine.** The shipped matcher compares the buffer against *literal sequences present in the keymap*: `"m" = "mark_set"` is an exact match, so it fires on `m` with no way to capture the next character, and `a` then toggles the AI sidebar. So the engine gains `{kind: "await_arg", command}` — one new decision, one new keymap value shape (`"m" = "mark_set<char>"`) — and `aether-keys.sys.mjs` is listed in §3 alongside the `panel` mode.

**TOML surface** — all eleven bindings, because `DEFAULTS` entries absent from `overlay/config/aether.toml` break the f0 sync guard every prior spec extends:

```toml
[panels]
scope = "workspace"   # workspace | all — default tab-panel scope

[keymap.normal]
"T" = "tabs"
"m" = "mark_set<char>"
"'" = "mark_jump<char>"
"1" = "tab_pin_goto 1"
"2" = "tab_pin_goto 2"
# … 3–9
```

Panel width comes from `[style] panel_width` (r2) and **nothing else**. A `[panels] width` that "falls back to" the style value would be dead config: `deepMerge(DEFAULTS, parsed)` means any key in `DEFAULTS` is always present at runtime, so "absent" is not representable and the fallback could never fire — leaving two rows in r5's settings panel, one of which silently does nothing.

New registry commands: `tabs`, `tab_close(id)`, `tab_rename(id, name)`, `tab_tag(id, tags)`, `tab_pin(id)`, `tab_duplicate(id)`, `tab_move_ws(id, ws)`, `tab_pin_goto(n)`, `mark_set(char)`, `mark_jump(char)` — every panel action among them, per the registry-is-the-API rule above.

## 3. Pure vs glue

- **`aether-panel.sys.mjs`** (pure): `createPanelState({rows, actions, keyBy})`; `move`, `toggleMark`, `cycleAction`, `filter`, and **`replaceRows(state, rows)`** → `{state, droppedMarks}` — the entire keyboard contract as a state machine, zero DOM. Designed against **two structurally different sources in this same pass** — tabs (flat rows, actions) and r5's settings (grouped rows, inline editors) — because a primitive validated against one consumer is a primitive that gets rewritten at the second. d2's mini-player and d4's timeline are explicitly *not* sources; they are custom surfaces and are budgeted as such in their own specs.
- **`aether-keys.sys.mjs`** (pure): a `panel` mode (printables passthrough; arrows/`Tab`/`Enter`/`Ctrl+Space`/`Escape` panel-owned) and the `await_arg` decision kind. f1's mode tests extend.
- **`aether-tabsource.sys.mjs`** (pure): `buildRows(tabs, metadata, {scope, workspace, currentId})` → MRU-ordered rows, pins first, current tab last; `applyMeta(meta, change)`; `serializeMeta` / `deserializeMeta` with b3-class hostile-input guards; `markResolve(marks, char, {liveTabs, graveyard})`.
- **`aether-workspaces.sys.mjs`** (pure): schema 3 — live-tab metadata alongside scroll records, additive, v1/v2 files tolerated.
- **`aether-graveyard.sys.mjs`** (pure): additive `meta?` on the record; malformed `meta` drops to `{}`.
- **`aether.uc.js`** (glue): panel element create/show/hide; `gBrowser` enumeration and MRU tracking (a `TabSelect` listener); the command implementations; close routed through the existing graveyard path.
- **`prefs/user.js`**: **revert `sidebar.revamp` and `sidebar.verticalTabs`.** f4 shipped two halves — those prefs turn Firefox's native strip *on*, and `userChrome.css:26-77` hides it. Deleting only the CSS leaves the strip and the sidebar launcher rendering permanently and unstyled, which destroys zero-chrome, the overlay's founding property. Also delete `tabs_toggle` from REGISTRY, `DEFAULTS`, the example TOML and the README table, or it remains a completable command that silently flips an attribute nothing reads.
- **`userChrome.css`**: the panel surface on r2 vars; **deletion** of the f4 vertical-tab rules.
- **`aether-strings.sys.mjs`**: panel copy — lexicon-swept, and new exports shaped to survive f6 test 11's harness.

## 4. Unit tests (behavioral)

`overlay/test/unit/r4-panel.test.mjs`:
1. `move` wraps at both ends and is a no-op on an empty list
2. `toggleMark` accumulates independent marks; `filter` **preserves marks on rows that scroll out of view** (marking six, then typing, then acting, must not silently drop four)
3. `cycleAction` cycles and wraps; the default action is index 0 on open
4. `filter` with an empty query restores the full list in the original order (filtering is not destructive)
5. selection stays on the same *row identity* across a filter change where possible, else clamps to 0 — never dangles past the end
6. `replaceRows` re-resolves selection and marks **by key**: a row that moved position keeps its mark; a row whose key vanished has its mark **dropped and counted** in `droppedMarks`, never transferred to a neighbour
7. `replaceRows` mid-interaction: with a mark on row 2 and the action cursor on `close`, a replacement that removes row 2 leaves zero marks and reports one dropped — the destructive-action-on-the-wrong-row guard
8. the primitive drives a **grouped, inline-editing** source (r5's shape) as well as a flat one — same state machine, asserted with both fixtures, so the "one contract forever" claim is tested against two consumers rather than one

`overlay/test/unit/r4-tabsource.test.mjs`:
9. `buildRows` orders by MRU with the **current tab last**: given a three-tab recency list, row 1 is the *second*-most-recent tab, not the current one (asserted directly — plain "most recent first" satisfies a version where `Enter` does nothing). Pinned rows sort above regardless, in pin order
10. `scope: "workspace"` excludes other workspaces' tabs; `"all"` includes them and each row names its workspace
11. a renamed tab exposes both the rename and the real title (guard: a rename can never hide the origin)
12. tags round-trip through serialize/deserialize; hostile metadata (prototype keys, wrong types, huge strings) drops per-entry without throwing and without polluting the prototype (b3's guard, re-asserted here)
13. schema 3 deserializes schema 2 and schema-less files; a schema-3 file round-trips byte-stably
14. `markResolve` resolves against **live tabs first, then the graveyard**: a mark on an open tab returns that tab; after closing it, the same letter returns the graveyard record; reassigning a letter moves it and leaves no duplicate
15. **metadata rides the graveyard record**: burying a renamed, tagged tab writes `meta` into the graveyard record, and exhuming restores the rename and tags — asserted across serialize/deserialize of *both* stores, since the two files have no shared identifier and a cross-store lookup would have no key
16. a graveyard record with malformed `meta` deserializes with `meta = {}` rather than dropping the whole record

`overlay/test/unit/r4-keys.test.mjs`:
17. `panel` mode passes printables through (mirrors f1's palette-mode test) while arrows/`Tab`/`Enter`/`Escape` stay panel-owned
18. reserved chords still fire in `panel` mode (f1's core proof holds in the new mode)
19. `await_arg`: `m` followed by `a` dispatches `mark_set("a")` as one action; `m` followed by `Escape` cancels and dispatches nothing; `m` alone past the pending timeout cancels

`overlay/test/unit/r4-palette.test.mjs`:
20. all ten new commands in REGISTRY with descriptions (r3's guard applies) and correct arity, and `complete("tab")` finds the tab family
21. every panel action maps to a registry command — an inventory assertion over the tab source's action table, so an action can never exist that the palette, a keybinding, and (later) the agent cannot reach
22. panel copy passes the f6 lexicon sweep

## 5. Visual states — `overlay/test/visual/scenarios.d/h4-tab-panel.sh`

1. **panel open, focused on search** — eight tabs open, `T`, shot shows the search field focused and MRU order with the previous tab at row 1
2. **filtered** — type three characters, shot shows the narrowed list with selection on row 1
3. **switch by Enter** — shot of the resulting page, proving the pick path
4. **multi-select close** — `Ctrl+Space` on three rows, `Tab` to the close action, `Enter`; shot shows three rows gone from the list, and the scenario asserts three new graveyard entries exist (one close path, proven)
5. **rename persists across relaunch** — rename a tab, `relaunch_browser`, open the panel: the rename is still there (schema-3 persistence, proven by file, not asserted)
6. **rename survives the graveyard** — rename a tab, close it, `relaunch_browser`, `:graveyard`: the record carries the rename, and resurrecting restores it
7. **mark and jump** — `ma`, switch away, `'a`, shot of the original page; then close the marked tab and press `'a` again — it resurrects from the graveyard
8. **typing reaches the search field** — the `panel` mode's whole point: type three characters and assert they appear in the input and filter the list (without the new mode this is the first thing that breaks, and no unit test can see it)
9. **no sidebar exists at all** — assert **no sidebar element is visible**, not merely that `T` doesn't produce one; with the prefs reverted the native strip and launcher must be gone entirely

## 6. Non-goals (budget protection)

- **No tab previews, thumbnails, or favicon grid.** Text rows. A preview is a screenshot pipeline and a memory cost for a problem search already solves.
- **No tab tree / hierarchy / parent-child relationships.** Flat, MRU, tagged — the same decision as bookmarks-are-flat.
- **No drag-and-drop reordering.** MRU is the order; pins are the exception; there is no third.
- **No tab groups as a distinct concept** — that's workspaces and tags, and a third grouping primitive is how tab UIs die.
- **No auto-tagging, no AI clustering** in this spec — the metadata store exists so v2.1 can propose tags later, behind consent.
- **No tab hibernation/unloading** — a separate concern with its own failure modes.
- **No mouse affordances beyond click-to-pick.** No context menus, no hover actions.
- **No cross-window panel** — per-primary-window, like everything else (f5/f6/f7's standing limit).
