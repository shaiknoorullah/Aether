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

**`Tab` actions per row**: `reset` (delete the local override, revert to dotfile/default), `copy as TOML` (the exact line, for pasting into the real dotfile once a value has proven itself), and `reveal` (open the owning file with `:boost_edit`'s file:// approach).

That copy-as-TOML action is deliberate: the panel is for *finding and trying*, the dotfile is for *keeping*. Anything I want permanently, I paste into the commented file I actually own.

**Read-only sections**: the keymap (browsable, searchable, showing which commands are unbound — editing keys stays a TOML act, per r3's non-goal) and the command list with descriptions, which is `:describe` finding its home.

**DoH lives here**: `[privacy] doh` maps to Firefox's `network.trr.mode` / `network.trr.uri` prefs — `off | fallback | strict` and a provider URL, written as prefs rather than into the TOML, because they're Firefox prefs and `user.js` already owns that class. It is the first setting whose write target isn't the local file, which is exactly why provenance is displayed on every row.

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
6. emitted TOML escapes strings such that a hostile value (`"` , newline, `]`, `#`) cannot inject a second key or a section header
7. a value failing its schema validator is rejected before write — `setOverride` returns an error, the table is untouched (the panel cannot author a config the loader would reject)
8. `SCHEMA` covers every leaf in `DEFAULTS` — guard: a new TOML key added without a schema entry is a test failure, so options can never become invisible
9. every schema entry has a non-empty description that passes the f6 lexicon sweep
10. DoH enum maps to exactly `0`/`2`/`3` for off/fallback/strict, and an unknown value maps to fallback rather than throwing

`overlay/test/unit/r5-config.test.mjs`:
11. config sync guard: `DEFAULTS.privacy` parses identically from `overlay/config/aether.toml`
12. `settings` and `describe` in REGISTRY with descriptions; `complete("set")` finds `settings`

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
