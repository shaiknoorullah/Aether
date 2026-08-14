# p1 — Bookmarks (flat, tagged, no hierarchy)

## 1. Today → Instead → Thinnest

**Today**: Firefox's bookmarks exist but the chrome that reaches them doesn't — no bar, no menu, no sidebar. And the model is wrong for me anyway: folders force a single-parent decision at capture time, which is exactly the decision an ADHD brain defers, so bookmarks become a write-only pile. I don't remember which folder a thing is in; I remember two words about it.

**Instead**: bookmarks as a **flat set with tags**, on r4's panel primitive. Capture is one key and zero decisions — `b` saves the current page with no prompt. Tagging is optional, later, from the panel. Finding is x3's fuzzy matcher over title, host, and tags. No folders, ever.

**Thinnest**: another source for a panel that already exists. Storage is a JSON file next to the graveyard and workspace files, using the same atomic write helper. The interesting design work is refusing hierarchy and getting capture to zero friction.

## 2. Exact behavior

**Capture**: `b` (normal mode) bookmarks the current tab immediately — no dialog, no folder picker, no tag prompt. Statusbar confirms `bookmarked: <title>`, and the confirmation is the only interruption. Bookmarking an already-bookmarked page updates its timestamp and says `already bookmarked` (neutral: re-bookmarking is a normal act, not an error). `B` bookmarks *and* opens the tag editor, for the times you do know the tag.

**Record**: `{url, title, tags[], addedAt, lastOpenedAt, openCount}`. Title defaults to the page title and is renamable — a bookmark's name is mine, not the site's. `url` is the identity; there are no duplicates.

**URL normalization, in full** — because the normalized URL *is* the identity, every unspecified axis is a silent duplicate-or-collision:

| Rule | Reason |
|---|---|
| lowercase scheme and host | case is not identity |
| strip a default port (`:80`/`:443`) | same resource |
| **keep the fragment** | see below |
| keep the query verbatim | a query string usually *is* the page |
| keep the path verbatim, including trailing slash | `/docs` and `/docs/` can genuinely differ |
| `http` and `https` are **different** bookmarks | they are different origins |
| `www.` is **not** stripped | it can be a different host |

The fragment stays, reversing the obvious rule. For a hash-routed app (`app.example.com/#/settings`) the fragment *is* the page, and for a deep anchor (`spec.html#section-4.2`) it is the reason for the bookmark — and since the stored identity is what gets opened, stripping it means `b` reports `already bookmarked` and then opens the top of the document instead of the section you meant. A duplicate bookmark is a mild annoyance; a bookmark that silently opens the wrong thing is a broken feature.

**Panel**: `:bm` opens the bookmark source. Rows are `title — host [tags]`, ranked by x3 (match score plus frecency from `openCount`/`lastOpenedAt`). `:bm <query>` opens pre-filtered. Actions (`Tab` cycles): open, open-in-new-tab, tag, rename, copy-url, delete. Marks (`Ctrl+Space`) make tag-many and delete-many one act, which is the entire reason tags beat folders — a folder move is per-item by construction.

**Deletion is confirmed, and it is a registry command.** Marking six rows and pressing `Enter` on the delete action destroys six bookmarks with no archive and no undo — in a project whose entire tab model rests on the argument that closing became safe *because* there is a graveyard, and where p3 gates delete-file behind a confirm for exactly this reason. So `bm_delete(url)` exists as a registry command with a `mutate-local` class (r4's registry-is-the-API rule), and the multi-delete action requires the confirm step. `bm_import` is `mutate-local` too.

**Tags**: free-form, lowercase-normalized, space-free (`rust-async`, not `rust async`). The tag editor is an **inline input on the bookmark panel**, not a second panel — r4's primitive has no stack, no push/pop, and no way for an inner panel to return a value to a caller, and the marks selected on the outer panel would have no defined lifetime across an inner panel's `Esc`. Inline keeps the marks alive and needs nothing new from the primitive. Completion over the existing tag set uses x3, so tags converge instead of fragmenting into `rust-async` / `async-rust` / `asyncrust`; a tag that doesn't exist yet needs a second `Enter` to create, deliberately, because a typo becoming a permanent tag is how tag sets rot.

**Import**: `:bm_import` reads Firefox's own bookmarks for this profile (via `PlacesUtils`, read-only), flattening folders **into tags** — a bookmark in `dev/rust/async` arrives tagged `dev`, `rust`, `async`.

Import is **merge, never overwrite**, and re-runnable. "Once" is a description, not a mechanism: `bm_import` is a palette command you can run again, and re-running is the only way to pick up anything captured with `Ctrl+D`. So a second import unions tags, never touches an existing title, and never resets `addedAt` — an edit you made survives every subsequent import.

**Two capture paths, acknowledged.** p2 argues that a second history store is never worth it, and this spec stands up a second *bookmark* store, so the asymmetry needs stating rather than implying: `Ctrl+D` and the summoned urlbar still write to Places, which `:bm` does not show. The reason to accept it is that Places bookmarks are folder-shaped and this feature's whole thesis is that folders are the problem; the cost is that `Ctrl+D` is a silent second inbox. Mitigation is one line — reserve `Ctrl+D` → `bookmark` in `[keymap.reserved]` so there is one capture path — and it is taken.

**Storage**: `<profile>/aether-bookmarks.json`, atomic writes (f4's `tmpPath` pattern), no cap — bookmarks are small and deleting them is my job, not a ring buffer's.

**TOML surface**:

```toml
[bookmarks]
enabled = true

[keymap.normal]
"b" = "bookmark"
"B" = "bookmark_tag"

[keymap.reserved]
"C-d" = "bookmark"     # one capture path, not two
```

New registry commands: `bookmark`, `bookmark_tag`, `bm`, `bm_import`, `bm_delete(url)`, `bm_rename(url, title)`, `bm_tag(url, tags)` — `bm` is `read`, the rest `mutate-local`. Every panel action has a command, per r4's rule.

## 3. Pure vs glue

- **`aether-bookmarks.sys.mjs`** (pure): `add(store, {url, title, now})` → new store (dedupe by normalized url); `setTags(store, url, tags)` with normalization + dedupe; `rename`, `remove`; `rows(store)` → x3-shaped candidates with frecency fields; `allTags(store)` → sorted tag set with counts; `serialize`/`deserialize` with hostile-input guards (b3 pattern); `normalizeUrl(url)` — strip fragment-only differences, keep query (a query string usually *is* the page).
- **`aether-panel.sys.mjs`** (r4): reused, including `replaceRows` after a delete or tag so the row set stays honest without closing the panel.
- **`aether-match.sys.mjs`** (x3): reused for both bookmark rows and tag completion.
- **`aether-strings.sys.mjs`**: capture confirmation, already-bookmarked, delete confirm, tag-editor copy — lexicon-swept, exports shaped for f6 test 11's harness.
- **`aether.uc.js`** (glue): the store file, debounced atomic write with `backupFile`, Places read for import (read-only, through `PlacesUtils`, never opening the file directly).

## 4. Unit tests (behavioral) — `overlay/test/unit/p1-bookmarks.test.mjs`

1. `add` creates a record with defaults; adding the same url twice yields one record with an updated timestamp, never a duplicate — and **re-`b` on a renamed bookmark does not clobber the rename**
2. `normalizeUrl`, one case per row of the table: scheme/host case collapse; default port stripped; **differing fragments are different bookmarks** (asserted with both a hash-route and a deep anchor); differing queries differ; `http` ≠ `https`; `www.` preserved; trailing slash preserved
3. `setTags` normalizes case and rejects whitespace-containing tags; duplicate tags collapse; tag order is stable across writes
4. `rename` changes the title and leaves the url identity intact; the original page title is not retained (the rename *is* the title — no dual display here, unlike r4's tabs, because a bookmark has no live page to contradict it)
5. `remove` deletes exactly one record; removing a non-existent url is a no-op, not a throw
6. `rows` output validates against x3's row shape and carries `openCount`/`lastOpenedAt` for frecency
7. `allTags` counts correctly and sorts deterministically
8. serialize/deserialize round-trips byte-stably; hostile store (prototype keys, wrong types, non-array tags, 10k-char strings) drops entries individually without throwing or polluting
9. a store from a future schema version deserializes what it understands and drops what it doesn't, never throwing (forward-tolerance, b3's rule)
10. folder-to-tag conversion: `dev/rust/async` → exactly `["dev","rust","async"]`; a flat bookmark → no tags; a folder name with spaces → normalized, not dropped
11. **import is merge, not overwrite**: import → rename + remove a tag → re-import → the rename survives, the removed tag is not resurrected, `addedAt` is unchanged, and a genuinely new bookmark arrives

`overlay/test/unit/p1-config.test.mjs`:
12. config sync guard for `DEFAULTS.bookmarks`, the `b`/`B` bindings, and the reserved `C-d`
13. all seven commands in REGISTRY with descriptions and correct `risk` classes; every panel action maps to one (r4's inventory rule)
14. all bookmark copy passes the f6 lexicon sweep

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
