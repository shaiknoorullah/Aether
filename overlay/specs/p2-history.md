# p2 — History (a search surface, not a timeline)

## 1. Today → Instead → Thinnest

**Today**: history is reachable only through the summoned urlbar's autocomplete, which mixes suggestions, search-engine noise, and history into one ranked soup I can't scope or filter. `Ctrl+H`'s sidebar is native chrome that doesn't exist here. So "that page I had open on Tuesday" is unfindable, and the workaround is keeping the tab open forever — which is the 80-tab problem, arriving through a different door.

**Instead**: history as a source on r4's primitive, with the same keys as tabs and bookmarks, x3-ranked, scopeable by time and by workspace. If closing a tab is safe (f4's graveyard) and finding it later is easy (this), then tabs stop being memory.

**Thinnest**: Firefox's Places database already stores every visit, indexed, with frecency of its own. Reading it through the existing Places API is a query, not a store — no second history database, no ingestion pipeline, nothing to keep consistent. The overlay contributes only what Places can't know: which workspace a visit happened in.

## 2. Exact behavior

**`:hist`** opens the history source. Rows are `title — host · <relative time>`, newest-first when unfiltered, x3-ranked once a query exists. `:hist <query>` opens pre-filtered.

**Scopes** (`Tab`-cycled, shown in the panel title): `today` (default) · `week` · `all` · `workspace`. The default is deliberately narrow — history search is nearly always about the recent past, and an unscoped list makes the first keystroke slower for no benefit.

**Workspace attribution**: the overlay records `{visitId, workspace}` for each top-level navigation into `<profile>/aether-history-ws.json` (bounded ring, 20,000 entries, atomic writes). Joined at query time against Places rows. A visit with no record shows as unattributed rather than being hidden — the join is additive and never filters out real history.

**Actions** (`Tab`): open, open-in-new-tab, bookmark it (p1's `add`, so found-then-kept is two keys), copy-url, and **forget**. Forget deletes the Places entry for that URL and its workspace records; multi-select forget is one act on marked rows. Forgetting is not "hide" — it removes.

**No infinite scroll.** The panel renders `palette_max_items` rows plus `+N more`; narrowing the query is the way to see more, not scrolling. A history list you scroll is a timeline, and a timeline is a place to get lost.

**Private windows are never recorded** by the workspace side, matching f4's graveyard rule, and Places already excludes them.

**TOML surface**:

```toml
[history]
enabled     = true
scope       = "today"    # today | week | all | workspace
ws_records  = 20000      # workspace-attribution ring size

[keymap.normal]
"H" = "back"             # unchanged
```

New registry commands: `hist` (`read`), `hist_forget` (`mutate-local`). No default binding for `hist` — it lives in the palette next to `bm` and `tabs`.

## 3. Pure vs glue

- **`aether-history.sys.mjs`** (pure): `scopeRange(scope, now)` → `{since, until}`; `joinWorkspace(placesRows, wsRecords)` → rows with attribution, unattributed preserved; `rows(joined)` → x3-shaped candidates; `relativeTime(then, now)` → the calm string (`4m ago`, `Tuesday`, `3 weeks ago` — never a bare timestamp, never a duration that reads as a score); ring `push`/`prune`/`serialize`/`deserialize` for the workspace store with b3-class guards.
- **`aether-panel.sys.mjs`** (r4) / **`aether-match.sys.mjs`** (x3): reused.
- **`aether.uc.js`** (glue): Places query via the existing async history API (`PlacesUtils.history`), never raw SQLite; the navigation listener writing workspace records (the same top-level-navigation hook b1 already uses for boosts — one listener, two consumers); `forget` via the Places removal API.

## 4. Unit tests (behavioral) — `overlay/test/unit/p2-history.test.mjs`

1. `scopeRange` boundaries with injected `now`: `today` starts at local midnight (not 24h ago), `week` at 7 days, `all` is unbounded — asserted across a DST transition so the local-midnight rule is real
2. `joinWorkspace` attaches workspace to matching visits; visits with no record appear **unattributed rather than dropped** (the additive-join guarantee)
3. `workspace` scope filters to the current workspace and includes only attributed rows — and says so in the panel title, so an empty result is explainable
4. duplicate visits to one url collapse to one row carrying the most recent visit time and the total visit count
5. `relativeTime` across seconds/minutes/hours/days/weeks with injected `now`; passes the f6 lexicon sweep (no "wasted", no durations framed as scores)
6. ring `push` respects the cap and drops oldest-first; `prune` removes records whose visits are older than the largest scope
7. hostile ring file (wrong types, prototype keys, huge strings) deserializes per-entry without throwing or polluting
8. `rows` validates against x3's row shape and carries visit count for frecency
9. an empty Places result yields an empty row list and a neutral panel state, never an error

`overlay/test/unit/p2-config.test.mjs`:
10. config sync guard for `DEFAULTS.history`
11. `hist`/`hist_forget` in REGISTRY with descriptions; `hist_forget` is `mutate-local`

## 5. Visual states — `overlay/test/visual/scenarios.d/j2-history.sh`

1. **panel, today scope** — after visiting several fixture pages: newest-first rows with relative times
2. **fuzzy filtered** — three interior characters narrow to the right row with highlights
3. **scope cycling** — `Tab` to `week`, panel title updates, row count grows
4. **workspace scope** — visit pages in two workspaces; scoped panel shows only the current one's
5. **forget** — mark two rows, forget; scenario asserts the urls are gone from Places *and* from a re-opened panel
6. **attribution survives relaunch** — `relaunch_browser`, workspace scope still attributes correctly (file-backed, proven)

## 6. Non-goals (budget protection)

- **No second history database.** Places is the store; this is a query surface. A duplicate history store is a consistency problem with no upside.
- **No history tree / visit graph.** Nyxt's tree is genuinely better than a stack and genuinely not small; it stays cut until the friction log asks for it by name.
- **No timeline view, no calendar, no infinite scroll** — narrowing beats scrolling.
- **No full-text search of visited page content.** That's an indexer, a disk budget, and a privacy surface — a different feature entirely.
- **No history import from other browsers** (p1 imports bookmarks; history import is noise you can't evaluate).
- **No per-site history disabling or auto-expiry rules** — `about:config` and Firefox's own retention already own that.
- **No sync of the workspace-attribution ring** — machine-local, like x3's frecency store.
