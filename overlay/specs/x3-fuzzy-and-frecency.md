# x3 — Fuzzy Matching + Frecency Ranking (reversing a v1.0.0 cut)

## 1. Today → Instead → Thinnest

**Today**: the palette does prefix completion, and v1.0.0 cut fuzzy matching and command history explicitly — "revisitable only with daily-driving evidence." That evidence arrived on day one of the gate and is logged: prefix completion is fine for 30 builtin commands and useless the moment a candidate list is *data* rather than a fixed vocabulary. r4's tab panel, p1's history and bookmarks, and x4's 200 repositories are all lists where I know three characters from the middle of a string and nothing about its start.

**Instead**: one matcher and one ranker, shared by every candidate surface. Fuzzy subsequence matching with position-aware scoring, combined with **frecency** — recency and frequency of *my* actual picks — so the right answer is usually row one before I finish typing.

**Thinnest**: two pure functions and one small store. No index, no trigram tables, no worker thread. Candidate lists here are hundreds of items, not millions; a linear scan with an early-exit scorer is measured in microseconds and needs no infrastructure. The store is a JSON file with a bounded entry count, written on the same atomic-write helper f4 already uses.

This spec reverses a documented decision. The reversal is recorded in `docs/friction-log.md` with its evidence, per the gate's rule that every cut is revisitable *with evidence* and never by preference.

## 2. Exact behavior

**Matching**: `match(query, candidate)` → `{score, positions} | null`. Subsequence, case-insensitive, with a **smart-case** rule (an uppercase character in the query makes that character case-sensitive). Scoring rewards, in order: consecutive runs, matches at word boundaries (`-`, `_`, `/`, `.`, `:`, camelCase transitions), a match at position 0, and shorter candidates. `positions` is returned so surfaces can highlight the matched characters — highlighting is what makes fuzzy legible rather than magic.

**Empty query** returns every candidate at score 0, preserving the source's own order — so an unfiltered tab panel stays MRU-ordered and an unfiltered palette stays alphabetical. Filtering must never reorder what I didn't ask to reorder.

**Frecency**: each surface has a namespace (`command`, `tab`, `history`, `bookmark`, `repo`, …). On every pick, `record(ns, key)` bumps that key. Score is the standard decayed form — a half-life of 30 days over the visit count, so a thing used ten times last week outranks a thing used forty times last spring. Final ordering is `matchScore + frecencyWeight * frecencyScore`, with `frecencyWeight` per-namespace (commands lean hard on frecency; history leans on the match).

**Store**: `<profile>/aether-frecency.json`, capped at 2,000 entries per namespace, pruned oldest-first by last-use, written debounced and atomically (`tmpPath` + rename, per f4's graveyard). If the file is missing or malformed, ranking degrades to pure match score — never an error, never a blocked palette.

**Where it applies**: the palette (commands), r4's tab panel, r5's settings search, r3's which-key filter, and every panel source added later. One matcher means one feel: what I learn in the palette transfers everywhere.

**TOML surface**:

```toml
[search]
fuzzy           = true    # false = the v1.0.0 prefix behavior, kept as an escape hatch
smart_case      = true
frecency        = true
frecency_days   = 30      # half-life
```

## 3. Pure vs glue

- **`aether-match.sys.mjs`** (pure): `match(query, candidate, {smartCase})` → `{score, positions} | null`; `rankAll(query, candidates, {frecency, weight})` → sorted rows; `highlight(text, positions)` → segment list for rendering (pure data, so the renderer never does string surgery).
- **`aether-frecency.sys.mjs`** (pure): `record(store, ns, key, now)`; `scoreFor(store, ns, key, now, halfLifeDays)`; `prune(store, cap, now)`; `serialize`/`deserialize` with hostile-input guards (b3's pattern).
- **`aether.uc.js`** (glue): the store file, debounced atomic write, `now` injection, wiring the ranker into the palette and each panel source.
- **`aether-palette.sys.mjs`** (pure): completion routes through `rankAll` when `fuzzy = true`, prefix otherwise.

## 4. Unit tests (behavioral) — `overlay/test/unit/x3-match.test.mjs`

1. subsequence matching: `gto` matches `git:open` and `graveyard_toggle`; a query with a character not present returns `null`
2. consecutive runs outscore scattered matches: `open` ranks `open` above `o_p_e_n`, asserted by score not by order alone
3. word-boundary bonus: `tc` ranks `tab_close` above `switch_context`, and camelCase (`newTabPage`) counts as a boundary
4. prefix bonus: an exact prefix beats an equal-length interior match
5. shorter-candidate tiebreak is deterministic — equal scores never produce unstable order across runs
6. smart case: lowercase query matches both cases; a query containing an uppercase letter requires that case; `smart_case = false` disables it
7. empty query returns all candidates with score 0 **in input order** (the MRU-preservation guarantee)
8. `positions` are the actual matched indices, ascending, one per query character; `highlight` reconstructs the original string exactly when segments are concatenated
9. unicode and combining characters do not desync `positions` from the string
10. 5,000 candidates rank without pathological cost (a coarse guard, not a benchmark)

`overlay/test/unit/x3-frecency.test.mjs`:
11. `record` increments and stamps; two picks of the same key produce a higher score than one
12. decay: with a 30-day half-life, one pick today outranks two picks 60 days ago — asserted with injected `now`, never wall-clock
13. `prune` respects the cap, drops least-recently-used first, and never drops a key used within the session
14. malformed/hostile store (wrong types, `__proto__`, huge keys) deserializes to a usable store, dropping bad entries individually
15. missing store → ranking equals pure match score (degradation is silent and total, never partial)
16. `frecency = false` yields ordering identical to pure match — the escape hatch is real, asserted rather than assumed

`overlay/test/unit/x3-config.test.mjs`:
17. config sync guard for `DEFAULTS.search`
18. `fuzzy = false` reproduces v1.0.0's prefix completion exactly on the f1 fixture set (regression guard for the reversal)

## 5. Visual states — `overlay/test/visual/scenarios.d/i3-fuzzy-frecency.sh`

1. **fuzzy palette** — type `gto` in `:`, shot shows `git:open`-class matches with highlighted characters
2. **highlighting** — the matched characters visibly distinct from the rest of the row
3. **frecency reorders** — pick one command five times, restart, type an ambiguous prefix: shot shows the frequently-picked one first (persistence proven across relaunch)
4. **decay** — scenario writes a store with old timestamps; a recent pick outranks an older, more-frequent one
5. **escape hatch** — `fuzzy = false`, `:reload`, same query: prefix behavior, no interior matches

## 6. Non-goals (budget protection)

- **No search index, no trigram/n-gram store, no background worker.** Linear scan over hundreds of items.
- **No full-text search of page content** — this ranks *candidate lists*, not documents. Content search is a different feature with a different data structure.
- **No command history buffer, no `!!`, no argument recall.** Frecency over picks replaces the reason history was wanted; a scrollback of past invocations is a separate cut that stays cut.
- **No per-candidate weights, boost rules, or tunable scoring in TOML** beyond the four switches. A scoring DSL is a knob nobody tunes twice.
- **No sync of the frecency store** — it is machine-local by nature and it is not interesting enough to encrypt, replicate, or resolve conflicts over.
- **No typo tolerance / edit distance.** Subsequence only; a fuzzy matcher that matches things I didn't type is worse than one that finds nothing.
