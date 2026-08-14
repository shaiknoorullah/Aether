# r5 — Settings Panel (a GUI that can't eat my dotfile)

## 1. Today → Instead → Thinnest

**Today**: every setting lives in TOML I edit in vim, which is correct for the settings I know exist and useless for the ones I don't. There is no surface that answers "what can this browser do," "what is this bound to," or "what is the AI switch currently set to" without reading a file and a spec. That's the same developer-designed failure r3 rejects, one layer up.

**Instead**: a settings panel on r4's primitive — searchable, keyboard-first, showing every option with its current value, its default, *where the value came from*, and the live keymap. It writes changes, and it does so **without ever touching my hand-written dotfile**.

**Thinnest**: layering, not round-tripping. `aether.toml` stays read-only, exactly as f7 established when it chose a pref over rewriting the dotfile. The panel owns a second file, `aether.local.toml`, deep-merged over the first. No comment-preserving TOML writer, no serializer that has to reproduce my formatting, no risk of a GUI reformatting a file I keep in git. The panel emits the smallest possible override and r1 reloads it.

## 2. Exact behavior

**Sources and precedence** (extends the existing merge):

```
DEFAULTS  <  aether.toml  <  aether.local.toml  <  runtime prefs (f7's ai.enabled)
```

`aether.local.toml` carries a generated header saying it is machine-local, panel-owned, and safe to delete. Deleting it reverts everything to the dotfile — that is the undo, and it is the same "the file is the interface" rule b1 established for boosts.

**`:settings`** opens the panel. Rows are one per option, grouped by section, each showing: key, current value, and a **provenance tag** — `default` / `dotfile` / `local` / `pref`. Provenance is the feature that makes a layered config comprehensible; without it, "why is this value that" becomes unanswerable and the layering is a liability.

**Editing**: `Enter` on a row edits in place — booleans toggle, enums cycle, numbers and strings open an inline input validated by the *same validators the config layer uses* (r2's `VALIDATORS`, f3's hex rule), so the panel cannot write a value the loader would reject. Accepting writes the key to `aether.local.toml`, triggers r1's reload, and shows the change applied immediately.

**A row whose provenance is `pref` writes the pref, not the local file.** Precedence puts runtime prefs above `aether.local.toml`, so writing `ai.enabled` into the local file while `aether.ai.enabled` is set does nothing at all: the file gains a key, the reload runs, the pref still wins, and the row's value does not move. The user cannot tell whether the panel is broken or the setting is. So the write target follows the provenance — pref-owned rows write the pref (the same rule the DoH rows need), and a `setOverride` call against a pref-owned path returns the error shape rather than writing.

**Values are rejected, not escaped.** An exact `emitLocalToml` → `parseToml` round-trip and hostile-value escaping cannot both hold against the shipped parser: a quoted value is `v.slice(1, -1)` verbatim with no escape handling, `isInsideString` counts raw quotes, and the parser is line-based so a newline cannot be represented at all. Rather than teach the parser escapes — which would then have to survive every future round-trip — `setOverride` **refuses** any string containing `"`, a newline, or leading/trailing whitespace, returning the same error shape a failed validator does. Round-trip becomes exact by construction and injection becomes impossible rather than mitigated, which is the same all-or-nothing habit f3 already uses.

**`Tab` actions per row**: `reset` (delete the local override, revert to dotfile/default), `copy as TOML` (the exact line, for pasting into the real dotfile once a value has proven itself), and `reveal` (open the owning file with `:boost_edit`'s file:// approach).

That copy-as-TOML action is deliberate: the panel is for *finding and trying*, the dotfile is for *keeping*. Anything I want permanently, I paste into the commented file I actually own.

**Read-only sections**: the keymap (browsable, searchable, showing which commands are unbound — editing keys stays a TOML act, per r3's non-goal) and the command list with descriptions, which is `:describe` finding its home.

**`SCHEMA` covers every leaf in `DEFAULTS` except two declared open tables**: `keymap.*` and `theme.colors`. Without that exclusion the coverage guard forces ~44 schema entries for 21 keybindings, 4 reserved chords and 19 colour slots — each one `Enter`-editable, which directly contradicts "editing keys stays a TOML act" and "no colour picker". `keymap.*` is also user-extensible (adding `"z" = "hints"` creates a leaf), so per-leaf coverage is the wrong shape for it. The exclusion belongs in the spec, not as a skip-list bolted into the test on the first afternoon — and the test asserts the exclusion list is exactly those two paths, so a third can't be added quietly.

**DoH is TOML-authoritative.** `[privacy] doh` maps to `network.trr.mode` / `network.trr.uri`, and the TOML value is pushed into the prefs on every load and reload. Provenance therefore reads `dotfile` truthfully, and the pref is an implementation detail. The alternative — pref-authoritative, with `[privacy]` as decoration — would make the panel display a `dotfile` tag that lies, and provenance is stated to be *the* thing that makes layering comprehensible. One setting, one authority, chosen explicitly.

**TOML surface**:

```toml
[privacy]
doh      = "fallback"                      # off | fallback | strict → network.trr.mode 0/2/3
doh_url  = "https://dns.quad9.net/dns-query"
```

New registry commands: `settings`, `describe` (jumps the panel to a command row) — completable, agent-callable.

## 3. Pure vs glue

- **`aether-settings.sys.mjs`** (pure): `SCHEMA` — one entry per option (`{path, type, enum?, default, section, description, validator}`), the single table three surfaces read; `buildRows(schema, layers)` → rows with resolved value + provenance; `setOverride(localTable, path, value)` → new local table (never mutates); `emitLocalToml(table)` → file text with the generated header; `resetOverride(localTable, path)`.
- **`aether-config.sys.mjs`**: load and merge the second source; expose the per-layer values so provenance is computable rather than guessed.
- **`aether-panel.sys.mjs`** (r4, pure): reused unchanged — settings is a source, not a new surface.
- **`aether.uc.js`** (glue): atomic write of `aether.local.toml` (`tmpPath` + rename, as f4's graveyard writes do); pref writes for the DoH rows; r1 reload trigger after each write.
- **`aether-strings.sys.mjs`**: panel copy — lexicon-swept.

## 4. Unit tests (behavioral) — `overlay/test/unit/r5-settings.test.mjs`

1. `buildRows` resolves precedence correctly for every combination: default only; dotfile over default; local over dotfile; pref over local — with the provenance tag matching in each case
2. a key present in `DEFAULTS` but absent from every file → row exists, tagged `default` (the panel enumerates the schema, not the files — undiscoverable settings are the problem being solved)
3. `setOverride` returns a new table and never mutates the input; two sequential overrides both survive
4. `resetOverride` removes exactly one key, leaves siblings, and empties cleanly to a valid empty table
5. `emitLocalToml` output **parses back through `parseToml` to the identical object** (round-trip, the only serializer guarantee that matters)
6. a hostile value (`"`, newline, `]`, `#`, leading/trailing space) is **rejected** by `setOverride` with the error shape from test 7 — not escaped, so tests 5 and 6 are satisfiable together against the shipped parser rather than mutually exclusive
7. a value failing its schema validator is rejected before write — `setOverride` returns an error, the table is untouched (the panel cannot author a config the loader would reject)
8. `SCHEMA` covers every leaf in `DEFAULTS` **except the declared open tables**, and the exclusion list is asserted to be exactly `["keymap", "theme.colors"]` — so a new TOML key can never become invisible, and a third exclusion can never be added silently
9. `setOverride` on a pref-owned path (provenance `pref`) returns an error rather than writing a value the pref would override
10. every schema entry has a non-empty description that passes the f6 lexicon sweep
11. DoH enum maps to exactly `0`/`2`/`3` for off/fallback/strict, and an unknown value maps to fallback rather than throwing; the TOML value is the authority, so a load with `doh = "strict"` sets the pref even when the pref already held another value

`overlay/test/unit/r5-config.test.mjs`:
12. config sync guard: `DEFAULTS.privacy` parses identically from `overlay/config/aether.toml`
13. `settings` and `describe` in REGISTRY with descriptions; `complete("set")` finds `settings`
14. the settings source drives r4's primitive unmodified — grouped rows with inline editors through the same state machine as the flat tab source (the contract test that keeps "one primitive forever" honest; paired with r4 test 8)

## 5. Visual states — `overlay/test/visual/scenarios.d/h5-settings-panel.sh`

1. **panel open** — `:settings`, shot of sections, values, and provenance tags
2. **search** — type `theme`, shot of the filtered rows
3. **edit applies live** — toggle a boolean, shot shows the change reflected in the chrome without a restart (r1 integration proven end to end)
4. **dotfile untouched** — scenario asserts `aether.toml` is byte-identical before and after the edit, and that `aether.local.toml` now exists containing exactly one key
5. **reset** — `Tab` to reset, `Enter`; the local file loses the key and the row reverts to `dotfile` provenance
6. **keymap browser** — shot of the read-only keymap section with a command's description visible

## 6. Non-goals (budget protection)

- **Never writes `aether.toml`.** Not with a round-trip writer, not with a managed block, not ever. The hand-written file is mine.
- **No keymap editing in the panel** — browse and search only (r3's non-goal, restated because a settings GUI is exactly where it would leak back in).
- **No theme picker, colour wheel, or font browser.** Values are text; the preview is the browser itself, live.
- **No profile/account/sync UI**, no import/export wizard — config moves the way dotfiles move.
- **No settings search across Firefox's own prefs** — `about:config` exists and is one `o` away. The panel covers Aether's schema plus the deliberate handful of Firefox prefs Aether owns (DoH today).
- **No wizard, no onboarding flow, no first-run tour.** The panel is a reference surface, not a guide.
- **No mod configuration UI in this spec** — x2 defines whether mods declare schema entries; if they do, they appear here for free, which is the reason the schema is a data table.
