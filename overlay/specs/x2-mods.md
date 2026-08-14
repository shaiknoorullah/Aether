# x2 — Mods (packaging, and a trust boundary that means something)

## 1. Today → Instead → Thinnest

**Today**: a per-site experience is scattered across three places that don't know about each other — a boost dotfile in `boosts/`, some commands in `commands/`, and keybindings in `aether.toml`. Sharing any of it means telling someone which three files to edit. Zen has Mods and they're popular for exactly this reason: a site-shaped improvement should be one installable thing.

**Instead**: a **mod** is a directory bundling capabilities that already exist — style (b1's pipeline), commands (x1's facade), keybindings, and a settings schema (r5) — behind one manifest. And a distribution model with a real security boundary rather than a warning label.

**Thinnest**: the loader is a manifest reader plus a namespace convention. Nothing in a mod is a new capability; every part routes into machinery that already ships and is already tested. The genuinely new work is the **trust tiering**, and that is a policy decision plus one enable list, not a subsystem.

## 2. Exact behavior

### Layout

```
~/.config/aether/mods/github/
  mod.toml           manifest
  style.css          → b1 apply path, b1 sanitizer
  commands.js        → x1 facade, namespaced
  keys.toml          → suggested bindings (never auto-applied)
  settings.toml      → schema entries surfaced in r5
```

```toml
# mod.toml
name        = "github"
version     = "1.0.0"
description = "minimal GitHub + git: commands"
match       = ["github.com"]        # domains style.css applies to
namespace   = "git"                 # every command must be git:*
tier        = "code"                # style | code
requires    = { daemon = ["github"] }   # v2.0; ignored until then
```

### Trust tiers — the load-bearing part

**Tier `style` — CSS only, safe by construction.** No `commands.js` permitted; the loader refuses to read one from a style-tier mod. The CSS goes through b1's sanitizer on every apply: no `@import`, no non-`data:` `url()`, no `image-set()` sources, escape-decoded spellings included. A hostile style mod can make a page ugly and nothing else — no fetch channel, no exfiltration, no code. **Because that boundary is already built and already tested, style mods can be installed in one command from a URL.**

**Tier `code` — git only, no registry, no one-click.** Commands are privileged JS (x1: no sandbox, and none is claimed). Installation is `git clone` into `mods/`, plus an explicit entry in `[mods] enabled`. There is deliberately **no install command, no mod browser, and no update mechanism** for code mods. The friction is the security model: it forces a moment where you either read the code or knowingly trust the author, exactly like an AUR build or an nvim plugin.

`:mod_install <url>` exists and **only accepts style mods** — it fetches, verifies the manifest declares `tier = "style"`, verifies no `commands.js` is present, sanitizes, and writes. A code mod at that URL is refused with a line explaining the git path. This is the one place a URL becomes files, so it is the one place that is narrow by design.

### Enabling and namespacing

```toml
[mods]
enabled = ["github", "gmail-minimal"]
```

Presence on disk does nothing; the enable list is the act of trust, it lives in the dotfile I own, and it is greppable. Every command a mod defines **must** be `<namespace>:<name>` — enforced at load, so a mod can never define bare `zap` or shadow a builtin (x1 already rejects collisions; namespacing makes them structurally impossible). Suggested bindings from `keys.toml` are **displayed, never applied** — `:mod_keys <name>` prints them for pasting into my keymap. A mod that could bind keys silently is a mod that could capture keystrokes.

### Lifecycle

Load order is `[mods] enabled` order, after user scripts. A mod that fails to load is skipped with one named line and never partially registers — if `commands.js` throws at import, its style is not applied either, because a half-loaded mod is an unpredictable one. `:mods` lists installed mods, tier, enabled state, command count, and load errors. r1's reload re-imports mods with the same rules.

New registry commands: `mods`, `mod_install`, `mod_enable`, `mod_disable`, `mod_keys` — `mod_install`/`mod_enable` carry `risk = "dangerous"` (x1's annotation), which is what will make v2.1's agent policy refuse them by default.

## 3. Pure vs glue

- **`aether-mods.sys.mjs`** (pure): `parseManifest(text)` → validated manifest or a reason; `validateNamespace(ns, commandNames)`; `resolveLoadOrder(enabled, installed)` → ordered list plus named misses; `tierPolicy(manifest, files)` → what this tier is allowed to load, the single place the boundary is expressed; `modDir(name)` → path-safe directory name (b1's `boostFileName` guard: hostile names can never escape the mods dir).
- **`aether-boosts.sys.mjs`** (b1, pure): reused for mod style — same sanitizer, one trust decision, no second CSS path.
- **`aether-facade.sys.mjs`** (x1, pure): reused for mod commands, with the namespace constraint applied.
- **`aether.uc.js`** (glue): directory scan, manifest read, per-mod try/catch, style registration into b1's registry keyed by the mod's `match`, `mod_install` fetch → verify → sanitize → write.
- **`aether-strings.sys.mjs`**: refusal/skip/enable copy — lexicon-swept, and the refusal copy is *explanatory, not scolding* (declining to install a code mod from a URL is a normal outcome).

## 4. Unit tests (behavioral) — `overlay/test/unit/x2-mods.test.mjs`

1. `parseManifest` accepts a complete manifest; missing `name`/`tier`/`namespace` each rejected with a reason; unknown tier rejected (never defaulted to `code` — fail closed)
2. `tierPolicy` for `style` forbids `commands.js` even when the file exists on disk; for `code` permits both
3. **a style-tier manifest with a `commands.js` present loads neither** — the mod is refused whole, not silently downgraded
4. `validateNamespace`: every command must be `ns:name` for the declared ns; a bare name, a foreign ns, and a `ns:` with an empty tail are each rejected
5. a mod cannot define a command colliding with a builtin *even with a namespace matching a builtin prefix* (`boost:on` must not resolve as `boost_on`)
6. `modDir` with hostile names (`../../etc`, absolute paths, null bytes, unicode separators) yields a name containing no path separators or `..`
7. `resolveLoadOrder` follows `[mods] enabled` order; an enabled-but-missing mod is reported, not fatal; an installed-but-not-enabled mod contributes nothing (guard: presence ≠ trust)
8. mod style CSS passes through b1's sanitizer identically to a boost dotfile — asserted with b1's exfil fixture, proving one sanitizer
9. keys from `keys.toml` are returned for display and are **absent** from any applied keymap structure (guard: a mod cannot bind a key)
10. a mod whose `commands.js` throws at import registers no commands **and no style**
11. `mod_install` acceptance logic: a fetched bundle declaring `tier = "code"` is refused; declaring `style` with no JS is accepted; declaring `style` with JS present is refused
12. manifest parsing is prototype-pollution safe (`__proto__`/`constructor` keys inert — the TOML parser's existing guard, re-asserted at this entry point)

`overlay/test/unit/x2-config.test.mjs`:
13. config sync guard for `DEFAULTS.mods`; all five commands in REGISTRY with descriptions and correct `risk` classes

## 5. Visual states — `overlay/test/visual/scenarios.d/i2-mods.sh`

1. **style mod applied** — a scenario style mod matching the playground: page visibly restyled, `:mods` lists it as `style / enabled`
2. **code mod commands live** — a code mod defining `demo:hello`: appears in the palette namespaced, runs, shows in which-key
3. **not enabled = not loaded** — same mod on disk, removed from `[mods] enabled`, `:reload`: style gone, commands gone, `:mods` shows it installed and disabled
4. **style tier refuses JS** — a style-tier mod with a `commands.js`: scenario asserts neither style nor command took effect and the refusal line appears
5. **broken mod is contained** — syntax error in one mod: other mods work, browser functional, `:mods` names the failure
6. **suggested keys are not applied** — mod ships `keys.toml` binding `q`; after load, `q` does nothing; `:mod_keys` prints the suggestion

## 6. Non-goals (budget protection)

- **No registry, no mod browser, no marketplace, no ratings, no auto-update.** For code mods this is the security model, not a missing feature. Discovery is a README link, like dotfiles.
- **No sandbox for code mods** — x1's position, restated: authorship is the boundary.
- **No signing/verification infrastructure.** A signature proves origin, not intent, and it would imply a safety this design doesn't offer.
- **No dependencies between mods**, no shared library layer, no inter-mod messaging.
- **No mod-owned panels, widgets, or statusbar entries in this pass** — mods use r4's primitive through x1's facade or they don't render.
- **No per-mod permission prompts at runtime.** Enabling is the consent event; per-action prompting is v2.1's agent policy, which is a different threat model (untrusted *instructions*, not untrusted *code*).
- **No hot-install** — a newly cloned mod needs `[mods] enabled` plus a reload. Deliberate.
