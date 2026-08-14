# r4 — Panel Primitive + Tab Panel (tabs stop being a strip)

## 1. Today → Instead → Thinnest

**Today**: f4 restyled Firefox's native vertical tabs and summons them with `T`. Daily-driving it produced friction-log entry #3 on day one: **a spatial strip is not how I find a tab.** I don't remember where a tab *is*, I remember what it *was* — so I want to type three characters of it. A strip also scales badly precisely when it matters (40 tabs), and it costs screen width permanently to solve a problem that occurs in bursts.

**Instead**: tabs become a **panel** — opens focused on a search field, fuzzy, **MRU-sorted** so the top row is always the tab I just came from and the panel doubles as alt-tab. Plus the things a list can do that a strip can't: rename, tag, pin, duplicate, mark for direct return, and close without leaving the list. The vertical strip is deleted, along with its CSS.

**Thinnest**: build the **panel primitive** once — a chrome surface with a search input, a candidate list, a keyboard contract, and r2 styling — then implement tabs as its first *source*. Bookmarks, history, graveyard and downloads (p1) are later sources on the identical surface, not new UI. The primitive is deliberately the same shape as the palette's candidate list so the two never diverge in feel.

## 2. Exact behavior

### The primitive

A panel is `{title, source, actions, onPick}`. Opening one: focuses the search input, renders the source's rows, and takes the keyboard. Contract, identical for every panel forever:

| Key | Action |
|---|---|
| type | filter (x3's matcher; substring until then) |
| `Ctrl+n` / `Ctrl+p`, `↓` / `↑` | move selection |
| `Enter` | primary action on selection |
| `Tab` | cycle *actions* for the selected row |
| `Space` | toggle mark on the selected row |
| `Esc` | close, no side effects |

Marks are multi-select: mark six rows, then one action applies to all six. That is Nyxt's prompt-buffer idea, and it is the reason a list beats a strip — a strip cannot express "these six."

Rows render `textContent` only. A panel never renders remote content, never executes anything from a row, and never auto-acts on selection change (moving the cursor is not an action).

### The tab source

`:tabs` (and `T`, rebound from the deleted strip) opens the tab panel:

- **MRU order** — most recently used first, so row 1 is the previous tab. `Enter` on an unfiltered panel is therefore alt-tab, and no separate quick-switch feature is needed.
- **Rows**: `[pin] [mark] title — host [tags]`. Renamed tabs show the rename, with the real title dimmed after it (a rename must never hide what the page actually is).
- **Scope**: current workspace by default; `Tab`-cycled action `all workspaces` widens it, and picking a tab from another workspace switches workspace and focuses it.
- **Actions** (`Tab` cycles): switch (default), close, duplicate, rename, tag, pin, move-to-workspace.
- **Close from the list** removes the row without closing the panel, and the close goes through the existing f4 graveyard path — closing from the panel and pressing `x` are the same act with the same archive.

### Tab metadata

Rename, tags, pin, and mark-letter are per-tab metadata persisted in `aether-workspaces.json` (**schema 3**, additive, same pattern and guards as b3's scroll records — old files deserialize, malformed entries drop individually). Metadata follows a tab into the graveyard on close, so a resurrected tab keeps its name and tags. Records prune on the same schedule as b3's.

### Marks and pins

- `m<char>` in normal mode marks the current tab with a letter; `'<char>` jumps to it. Marks survive into the graveyard, so `'r` reopens a marked tab that was closed. A mark is a single letter, one tab per letter, reassignment is silent.
- Pinned tabs get `1`–`9` in normal mode. Pins are per-workspace and sort to the top of the panel above the MRU rows.

**TOML surface**:

```toml
[panels]
width  = "38rem"   # falls back to [style] panel_width
scope  = "workspace"  # workspace | all — default tab-panel scope

[keymap.normal]
"T" = "tabs"
"m" = "mark_set"     # prefix: m<char>
"'" = "mark_jump"    # prefix: '<char>
```

New registry commands: `tabs`, `tab_rename`, `tab_tag`, `tab_pin`, `tab_duplicate`, `mark_set`, `mark_jump` — all completable, all agent-callable (they are registry commands, which is v2.1's whole API).

## 3. Pure vs glue

- **`aether-panel.sys.mjs`** (pure): `createPanelState({rows, actions})`; `move(state, delta)`, `toggleMark(state)`, `cycleAction(state)`, `filter(state, query)` — the entire keyboard contract as a state machine, zero DOM. This is the module every future panel reuses.
- **`aether-tabsource.sys.mjs`** (pure): `buildRows(tabs, metadata, {scope, workspace})` → MRU-ordered rows with pins first; `applyMeta(meta, change)`; `serializeMeta` / `deserializeMeta` with b3-class hostile-input guards; `markResolve(marks, char)`.
- **`aether-workspaces.sys.mjs`** (pure): schema 3 — tab metadata alongside scroll records, additive, v1/v2 files tolerated.
- **`aether.uc.js`** (glue): panel element create/show/hide; `gBrowser` tab enumeration and MRU tracking (a `TabSelect` listener maintaining a recency list); the action implementations; wiring close through the existing graveyard path.
- **`userChrome.css`**: the panel surface on r2 vars; **deletion** of the f4 vertical-tab rules.
- **`aether-strings.sys.mjs`**: panel copy — lexicon-swept.

## 4. Unit tests (behavioral)

`overlay/test/unit/r4-panel.test.mjs`:
1. `move` wraps at both ends and is a no-op on an empty list
2. `toggleMark` accumulates independent marks; `filter` **preserves marks on rows that scroll out of view** (marking six, then typing, then acting, must not silently drop four)
3. `cycleAction` cycles and wraps; the default action is index 0 on open
4. `filter` with an empty query restores the full list in the original order (filtering is not destructive)
5. selection stays on the same *row identity* across a filter change where possible, else clamps to 0 — never dangles past the end

`overlay/test/unit/r4-tabsource.test.mjs`:
6. `buildRows` orders by MRU, most recent first; pinned rows sort above regardless of recency, in pin order
7. `scope: "workspace"` excludes other workspaces' tabs; `"all"` includes them and each row names its workspace
8. a renamed tab exposes both the rename and the real title (guard: a rename can never hide the origin)
9. tags round-trip through serialize/deserialize; hostile metadata (prototype keys, wrong types, huge strings) drops per-entry without throwing and without polluting the prototype (b3's guard, re-asserted here)
10. schema 3 deserializes schema 2 and schema-less files; a schema-3 file round-trips byte-stably
11. `markResolve` returns the tab for a set letter, nothing for an unset one; reassigning a letter moves it and leaves no duplicate
12. metadata for a closed tab is retained for graveyard resurrection and pruned on the b3 schedule for tabs that never come back

`overlay/test/unit/r4-palette.test.mjs`:
13. all seven new commands in REGISTRY with descriptions (r3's guard applies), parse correctly, and `complete("tab")` finds the tab family
14. panel copy passes the f6 lexicon sweep

## 5. Visual states — `overlay/test/visual/scenarios.d/h4-tab-panel.sh`

1. **panel open, focused on search** — eight tabs open, `T`, shot shows the search field focused and MRU order with the previous tab at row 1
2. **filtered** — type three characters, shot shows the narrowed list with selection on row 1
3. **switch by Enter** — shot of the resulting page, proving the pick path
4. **multi-select close** — `Space` on three rows, `Tab` to the close action, `Enter`; shot shows three rows gone from the list, and the scenario asserts three new graveyard entries exist (one close path, proven)
5. **rename persists across relaunch** — rename a tab, `relaunch_browser`, open the panel: the rename is still there (schema-3 persistence, proven by file, not asserted)
6. **mark and jump** — `ma`, switch away, `'a`, shot of the original page
7. **no vertical strip exists** — `T` no longer produces a sidebar; the f4 strip shots are deleted with the CSS

## 6. Non-goals (budget protection)

- **No tab previews, thumbnails, or favicon grid.** Text rows. A preview is a screenshot pipeline and a memory cost for a problem search already solves.
- **No tab tree / hierarchy / parent-child relationships.** Flat, MRU, tagged — the same decision as bookmarks-are-flat.
- **No drag-and-drop reordering.** MRU is the order; pins are the exception; there is no third.
- **No tab groups as a distinct concept** — that's workspaces and tags, and a third grouping primitive is how tab UIs die.
- **No auto-tagging, no AI clustering** in this spec — the metadata store exists so v2.1 can propose tags later, behind consent.
- **No tab hibernation/unloading** — a separate concern with its own failure modes.
- **No mouse affordances beyond click-to-pick.** No context menus, no hover actions.
- **No cross-window panel** — per-primary-window, like everything else (f5/f6/f7's standing limit).
