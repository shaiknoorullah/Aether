# f4 — Vertical Tabs and Graveyard

## 1. Today → Instead → Thinnest

**Today**: tabs are invisible (`#TabsToolbar` collapsed since the spike) — the statusbar shows a count and `J/K/:tab n` switch blind. And closing a tab is death: `x` destroys context, so tabs accumulate as external working memory I'm afraid to prune. Ctrl+Shift+T is a 25-deep stack, not an archive.

**Instead**: Firefox's native vertical tabs (136+ sidebar), restyled to the `--aether-*` theme, hidden by default and summoned with one key — a tab *overview*, not permanent chrome. And no tab death: every real close is archived to a local graveyard — searchable from the palette, any entry resurrectable. Closing becomes safe, so the tab count can stay sane. Execution-plan floor item 4.

**Thinnest**: zero tab UI built by us — two prefs turn on native vertical tabs, `userChrome.css` restyles and collapses them, one command toggles an attribute. Graveyard is one pure module (`aether-graveyard.sys.mjs`: ring store + search + serde), one JSON file in the profile dir, one `TabClose` listener, and a palette command that reuses the existing candidate row.

## 2. Exact behavior

**Vertical tabs**
- `prefs/user.js` adds `sidebar.revamp = true`, `sidebar.verticalTabs = true`. Native sidebar renders the tab strip; we never build tab DOM.
- Hidden chrome philosophy holds: `#sidebar-main` is `visibility: collapse` by default; the `tabs_toggle` command flips an `aether-tabs` attribute on the chrome root and CSS shows the strip (width `--aether-tabs-width`, default 220px). Per-window, starts hidden every launch, never persisted — zero-chrome is the resting state.
- **New default binding: `T` = `tabs_toggle`** (normal mode; `t` stays `tab_new`). Also runnable as `:tabs_toggle`.
- Summoning never steals focus: normal-mode keys keep working, `J/K`/`:tab n` switch tabs and the strip reflects the selection live.
- Theming: strip background `--aether-bg`, tab text `--aether-fg`, selected tab `--aether-accent` with `--aether-bg` text (same slot language as the statusbar); sidebar header/splitter/tool buttons stay hidden (f-spike rules extend to the revamp's launcher/tools). All hexes are `var(--aether-*, fallback)` per f3.

**Graveyard**
- Record shape: `{id, url, title, closedAt, workspace?}` — `workspace` reserved for f5, always absent for now. Ring store capped by `[graveyard] cap` (default 500); burying past the cap drops the oldest. Newest-first is the canonical order.
- **What gets recorded — real user closes only**: the `TabClose` listener skips (a) closes during shutdown/window-close (a `quit-application-granted` observer sets a flag — session restore at next launch therefore never duplicates), (b) tabs adopted into another window (`event.detail.adoptedBy`), (c) private-browsing windows, (d) blank/`about:` tabs via pure `isBuriable(url)`. Native Ctrl+Shift+T/session-restore machinery is untouched and independent.
- Persistence: `<profile>/aether-graveyard.json`, read once at startup, written after each bury/exhume (async, queued; last write wins). The store is a process-wide singleton so multi-window closes share one graveyard. A missing/corrupt file deserializes to an empty store — never bricks, never scolds.
- **`:graveyard [query]`**: once the input is `graveyard …`, the candidate row switches from command-name completion to graveyard matches — newest first, case-insensitive substring of the whole query against title+url, capped by `palette_max_items`, each rendered via `formatRecord` (`title — url`; bare url when title is empty). No query lists the newest entries.
- `Tab` cycles the selection over matches (wraps) **without rewriting the input** — the query survives. `Enter` resurrects the selected match (or the first, if none selected): opens a new tab on the record's url, exhumes the record (it's no longer dead), persists, closes the palette. No matches → neutral statusbar copy `graveyard: no matches` (empty store: `graveyard: empty`), palette stays open. `Escape` closes, resurrects nothing.
- This is a single per-command candidate provider seam, not general argument completion — f1's non-goal stands for everything else.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`):

```toml
[graveyard]
cap = 500            # ring size; oldest entries fall off past this

[keymap.normal]
"T" = "tabs_toggle"  # joins existing bindings
```

New registry commands: `tabs_toggle`, `graveyard` (usage `graveyard [query]`, args optional).

## 3. Pure vs glue

- **`aether-graveyard.sys.mjs`** (pure, Node-testable — no Services/IOUtils/DOM/Date.now): `createStore(cap)`; `bury(store, {url, title, closedAt})` (assigns `id`, enforces cap, rejects non-buriable urls); `isBuriable(url)`; `search(store, query, maxItems)` → newest-first matches; `exhume(store, id)` → record | null; `serialize(store)` / `deserialize(text, cap)` (tolerant: bad JSON → empty, malformed records dropped, overflow truncated to newest, `nextId` recomputed so ids never collide); `formatRecord(record)`; the no-match/empty message constants.
- **`aether-palette.sys.mjs`**: `tabs_toggle` and `graveyard` REGISTRY entries only.
- **`aether-config.sys.mjs`**: `DEFAULTS.graveyard` + the `T` binding.
- **`aether.uc.js`** (chrome glue, not unit-tested): `TabClose` listener applying the skip rules and calling `bury` with `Date.now()`; shutdown-flag observer; graveyard file read/queued-write via IOUtils/PathUtils; `tabs_toggle` attribute flip; palette wiring (detect `graveyard` input → `search` → candidate row, selection cycling, Enter → resurrect via existing newTab/navigate plumbing).
- **`userChrome.css`**: sidebar collapse/summon rules + vertical-tab theming vars. **`prefs/user.js`**: the two sidebar prefs.

## 4. Unit tests (behavioral)

Graveyard — `overlay/test/unit/f4-graveyard.test.mjs`:
1. bury then search("") → the record, newest first across several buries
2. ring cap: bury cap+1 records → size == cap, oldest gone, newest kept (small cap, e.g. 3)
3. `isBuriable`: `about:blank`, `about:newtab`, empty/undefined url → false and bury leaves the store unchanged; normal https url → true
4. search is case-insensitive substring over title AND url ("GitHub" query hits a lowercase url, and vice versa)
5. search with no hits → empty array; maxItems caps results without reordering
6. exhume by id removes exactly that record and returns it; unknown id → null, store unchanged
7. serialize → deserialize round-trip preserves records, order, and cap behavior
8. deserialize of malformed JSON / wrong shape → empty store, no throw
9. deserialize drops individual malformed records (missing url, wrong types) and keeps valid ones
10. deserialize of an oversized file keeps only the newest `cap` records
11. id continuity: bury after a round-trip never collides with a deserialized id (nextId recomputed)
12. `formatRecord`: title + url; empty/missing title → url alone, no "undefined" text
13. copy guard: no-match and empty-graveyard message constants contain no punitive wording

Palette — `overlay/test/unit/f4-palette.test.mjs`:
14. `graveyard` and `tabs_toggle` are in REGISTRY; `complete("grav")` → `graveyard`; `complete("tabs")` includes `tabs_toggle`
15. `parse("graveyard old docs")` → name `graveyard`, args `["old", "docs"]`; `parse("graveyard")` with no args is valid (query optional), not unknown

Config — `overlay/test/unit/f4-config.test.mjs` (f0 sync-guard pattern):
16. `DEFAULTS.graveyard.cap` = 500 and the `T` binding exist; example `overlay/config/aether.toml` parses to exactly the defaults

## 5. Visual states — `overlay/test/visual/scenarios.d/f4-vertical-tabs-graveyard.sh`

1. vertical tabs hidden (zero-chrome preserved — full-viewport content, regression vs f1–f3 shots)
2. vertical tabs summoned via `T` and themed (strip visible, selected tab accented, statusbar intact)
3. graveyard palette listing archived tabs after closing several (`:open` a few pages, `x` them, `:graveyard`)
4. resurrected tab open (Enter on a match; statusbar url/tab count confirm)
5. graveyard survives `relaunch_browser` — `:graveyard` still lists the archive on the same profile

## 6. Non-goals (budget protection)

- **No tab UI of our own** — native sidebar only, restyled with CSS; no tree-style tabs, groups, pinned-tab logic, drag-and-drop work, or tab previews.
- No hover-expand/auto-hide animation modes and no persisted sidebar visibility — one toggle, hidden at rest.
- No stale-tab auto-archiving (the plan's "stale" half) — only real closes for now; revisit after daily-driving says idle tabs still pile up.
- No fuzzy matching, frecency, or multi-token AND search in the graveyard — one substring, newest first.
- No dedup or merge of graveyard records — the ring cap is the cleanup policy.
- No session state in records (scroll position, form data, favicon, container) — url+title+time; resurrection is a fresh load.
- No dedicated graveyard panel/page — the palette is the UI.
- No recording from private windows, ever — privacy rule, not a deferred feature.
- No configurable persistence path, debounce tuning, or export — one JSON file in the profile.
- No general palette argument completion — the graveyard provider is a one-off seam.
