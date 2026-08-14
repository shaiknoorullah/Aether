# p1 — Bookmarks (flat, tagged, no hierarchy)

## 1. Today → Instead → Thinnest

**Today**: Firefox's bookmarks exist but the chrome that reaches them doesn't — no bar, no menu, no sidebar. And the model is wrong for me anyway: folders force a single-parent decision at capture time, which is exactly the decision an ADHD brain defers, so bookmarks become a write-only pile. I don't remember which folder a thing is in; I remember two words about it.

**Instead**: bookmarks as a **flat set with tags**, on r4's panel primitive. Capture is one key and zero decisions — `b` saves the current page with no prompt. Tagging is optional, later, from the panel. Finding is x3's fuzzy matcher over title, host, and tags. No folders, ever.

**Thinnest**: another source for a panel that already exists. Storage is a JSON file next to the graveyard and workspace files, using the same atomic write helper. The interesting design work is refusing hierarchy and getting capture to zero friction.

## 2. Exact behavior

**Capture**: `b` (normal mode) bookmarks the current tab immediately — no dialog, no folder picker, no tag prompt. Statusbar confirms `bookmarked: <title>`, and the confirmation is the only interruption. Bookmarking an already-bookmarked page updates its timestamp and says `already bookmarked` (neutral: re-bookmarking is a normal act, not an error). `B` bookmarks *and* opens the tag editor, for the times you do know the tag.

**Record**: `{url, title, tags[], addedAt, lastOpenedAt, openCount}`. Title defaults to the page title and is renamable — a bookmark's name is mine, not the site's. `url` is the identity; there are no duplicates.

**Panel**: `:bm` opens the bookmark source. Rows are `title — host [tags]`, ranked by x3 (match score plus frecency from `openCount`/`lastOpenedAt`). `:bm <query>` opens pre-filtered. Actions (`Tab` cycles): open, open-in-new-tab, tag, rename, copy-url, delete. Marks (`Space`) make tag-many and delete-many one act, which is the entire reason tags beat folders — a folder move is per-item by construction.

**Tags**: free-form, lowercase-normalized, space-free (`rust-async`, not `rust async`). The tag editor is r4's panel over the existing tag set with fuzzy completion, so tags converge instead of fragmenting into `rust-async` / `async-rust` / `asyncrust`. New tags are created by typing one that doesn't exist and confirming — one extra keystroke, deliberately, because an accidental typo becoming a permanent tag is how tag sets rot.

**Import**: `:bm_import` reads Firefox's own `places.sqlite` bookmarks for this profile once, flattening folders **into tags** — a bookmark in `dev/rust/async` arrives tagged `dev`, `rust`, `async`. That conversion is the whole migration story and it is one-directional; there is no ongoing sync with Firefox's bookmark store.

**Storage**: `<profile>/aether-bookmarks.json`, atomic writes (f4's `tmpPath` pattern), no cap — bookmarks are small and deleting them is my job, not a ring buffer's.

**TOML surface**:

```toml
[bookmarks]
enabled = true

[keymap.normal]
"b" = "bookmark"
"B" = "bookmark_tag"
```

New registry commands: `bookmark`, `bookmark_tag`, `bm`, `bm_import` — `bookmark`/`bookmark_tag` are `mutate-local`, `bm` is `read`.

## 3. Pure vs glue

- **`aether-bookmarks.sys.mjs`** (pure): `add(store, {url, title, now})` → new store (dedupe by normalized url); `setTags(store, url, tags)` with normalization + dedupe; `rename`, `remove`; `rows(store)` → x3-shaped candidates with frecency fields; `allTags(store)` → sorted tag set with counts; `serialize`/`deserialize` with hostile-input guards (b3 pattern); `normalizeUrl(url)` — strip fragment-only differences, keep query (a query string usually *is* the page).
- **`aether-panel.sys.mjs`** (r4): reused unchanged.
- **`aether-match.sys.mjs`** (x3): reused for both bookmark rows and tag completion.
- **`aether.uc.js`** (glue): the store file, debounced atomic write, `places.sqlite` read for import (read-only, via the existing Places API rather than raw SQLite).

## 4. Unit tests (behavioral) — `overlay/test/unit/p1-bookmarks.test.mjs`

1. `add` creates a record with defaults; adding the same url twice yields one record with an updated timestamp, never a duplicate
2. `normalizeUrl`: differing fragments collapse to one bookmark; differing query strings do **not** (asserted both ways — this is the judgement call, so it is pinned)
3. `setTags` normalizes case and rejects whitespace-containing tags; duplicate tags collapse; tag order is stable across writes
4. `rename` changes the title and leaves the url identity intact; the original page title is not retained (the rename *is* the title — no dual display here, unlike r4's tabs, because a bookmark has no live page to contradict it)
5. `remove` deletes exactly one record; removing a non-existent url is a no-op, not a throw
6. `rows` output validates against x3's row shape and carries `openCount`/`lastOpenedAt` for frecency
7. `allTags` counts correctly and sorts deterministically
8. serialize/deserialize round-trips byte-stably; hostile store (prototype keys, wrong types, non-array tags, 10k-char strings) drops entries individually without throwing or polluting
9. a store from a future schema version deserializes what it understands and drops what it doesn't, never throwing (forward-tolerance, b3's rule)
10. folder-to-tag conversion: `dev/rust/async` → exactly `["dev","rust","async"]`; a flat bookmark → no tags; a folder name with spaces → normalized, not dropped

`overlay/test/unit/p1-config.test.mjs`:
11. config sync guard for `DEFAULTS.bookmarks` and the `b`/`B` bindings
12. all four commands in REGISTRY with descriptions and correct `risk` classes

## 5. Visual states — `overlay/test/visual/scenarios.d/j1-bookmarks.sh`

1. **zero-friction capture** — `b` on the playground: statusbar confirmation, no dialog, no focus change (asserted: the page still has focus afterward)
2. **panel** — `:bm` with a seeded store: rows with tags, x3 ranking, search field focused
3. **tag many at once** — `Space` on three rows, tag action, one tag applied to all three; store file asserts three updated records
4. **rename** — renamed bookmark shows its new title after a relaunch (persistence proven by file)
5. **tag completion converges** — typing an existing tag prefix offers it; a genuinely new tag needs the confirm keystroke
6. **import flattens** — a fixture Places tree with nested folders imports to flat records carrying folder names as tags

## 6. Non-goals (budget protection)

- **No folders, no hierarchy, no nesting.** Ever. This is the feature.
- **No bookmark bar, no menu, no toolbar** — there is no chrome to put them in, by design.
- **No favicons or thumbnails** — text rows (r4's rule).
- **No sync with Firefox's bookmark store** beyond one-shot import, and no export in this pass — the JSON file *is* the export.
- **No dead-link detection, no archiving, no snapshotting.** A bookmark is a URL and my words about it.
- **No AI auto-tagging** here — the store exists so v2.1 can propose tags behind consent, and proposing is not applying.
- **No shared/public collections, no read-later queue as a distinct concept** — a `later` tag is a read-later queue.
