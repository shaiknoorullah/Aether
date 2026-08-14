# x1 — The Command Facade (behavior as files, config still as data)

## 1. Today → Instead → Thinnest

**Today**: TOML can rebind `j`, and that's the ceiling. It cannot express "a command that only exists on GitHub," "wrap open-link with a rule," or "score hints differently." Nyxt can express all three because its config is a live Lisp image — and the price is embedding a language runtime and exposing internals as a permanent API. That price is what makes Nyxt a thick project.

**Instead**: split the two things that got conflated. **Options stay data** (TOML, hand-edited, git-committed). **Behavior becomes files** — a small directory of JS modules loaded into the chrome, exactly the shape `init.lua` has next to my nvim config. The runtime is already here: Gecko ships a JS engine and the overlay is already privileged JS. The half of Nyxt's bill I refuse to pay is *embedding a runtime*; that half is already paid.

**Thinnest**: the extension point is the registry I already have. `aether.defineCommand(name, fn)` puts a user command in the same `REGISTRY` as `zap` and `ws` — so it is palette-completable, `[keymap.normal]`-bindable, which-key-visible, and (v2.1) agent-callable, with **zero additional work per surface**. No parallel automation API, no plugin lifecycle, no manifest at this layer. One loader, one frozen facade object, one hook table.

## 2. Exact behavior

**Location and loading**: `~/.config/aether/commands/*.js`, loaded at init in filename order, each via dynamic `import()` with a cache-busting query so `:reload` (r1) re-imports them. A file is an ES module receiving the facade as a global (`aether`); no `require`, no npm, no bundler, no dependencies — same zero-build rule as the overlay itself.

**The facade** is a **frozen object built in one pure module**, and it is the entire contract. Internals stay private, so glue can be refactored freely — the deal is: if a script only touches `aether.*`, a refactor never breaks it.

```js
aether.defineCommand("pr_checks", {
  description: "open this PR's checks tab",   // r3/r5 read this
  risk: "navigate",                            // v2.1 consent class
  run: () => aether.tabs.open(aether.page.url + "/checks"),
});

aether.site("github.com", { keys: { gc: "pr_checks" } });
aether.hints.score = el => (el.tag === "BUTTON" ? 2 : 1);
aether.on("open-link", (url, next) => next(rewrite(url)));
```

Surface, deliberately small:

| Namespace | Contents |
|---|---|
| `aether.defineCommand` | register into the registry |
| `aether.tabs` | `open` `close` `next` `prev` `list` `current` |
| `aether.page` | `url` `title` `host` (read-only snapshot, never live DOM) |
| `aether.ws` | `switch` `list` `current` |
| `aether.ui` | `message` `panel` `prompt` |
| `aether.config` | read-only merged config |
| `aether.storage` | per-script JSON kv, one file per script |
| `aether.on` / `aether.site` / `aether.hints.score` | hooks |

**Hooks are a named, versioned list** — `open-link`, `page-load`, `tab-close`, `hints.score`, `command` (wraps any registry command). Not monkey-patching, not proxies over internals. The list is the contract; adding to it is a spec change, and that friction is intentional.

**Risk annotation**: every registry entry — builtin or user — carries a `risk` class (`read` / `navigate` / `mutate-local` / `mutate-remote` / `dangerous`). It is unused in v1.3 beyond display; it exists now so v2.1's consent policy annotates 60 commands *at authoring time* rather than retrofitting them. Builtins are annotated in this spec: `zap`/`boost` are `mutate-local`, `mod_enable` is `dangerous`, navigation is `navigate`.

**A throwing script never breaks the browser.** Load errors are caught per file — that file's commands simply don't exist, one calm line names it. Runtime errors in a command or hook are caught at the call boundary, reported to the statusbar, and the browser continues; a throwing `hints.score` falls back to the builtin scorer for the rest of the session. Same containment rule as f2's widgets.

**Trust, stated plainly**: these files run with full chrome privileges. There is no sandbox and this spec does not pretend to build one. That is the nvim deal — your machine, your files, no registry, no install command. The security boundary is *authorship*, and x2 is where authorship stops being obviously mine.

**TOML surface**:

```toml
[scripts]
enabled = true
dir     = "~/.config/aether/commands"
```

New registry commands: `scripts_reload` (re-import without a full config reload), `scripts_list` (loaded files, their commands, and any load errors).

## 3. Pure vs glue

- **`aether-facade.sys.mjs`** (pure): `buildFacade(impls)` → the frozen object; `HOOKS` — the named hook table; `RISK_CLASSES`; `validateCommandDef(def)` → normalized entry or an error (name grammar incl. `ns:name`, description required, `run` callable); `wrapHook(fns)` → the `next`-chaining composer with per-link error containment.
- **`aether-palette.sys.mjs`** (pure): registry accepts dynamic entries; user commands never shadow a builtin (collision → the user command is rejected with a named message, because silently overriding `tab_close` is how a config eats a browser).
- **`aether.uc.js`** (glue): directory enumeration, `import()` with cache-bust, per-file try/catch, facade impls bound to real browser objects, hook dispatch at the four call sites, per-script storage files.
- **`aether-strings.sys.mjs`**: load-error and collision copy — lexicon-swept.

## 4. Unit tests (behavioral) — `overlay/test/unit/x1-facade.test.mjs`

1. `buildFacade` returns a frozen object; assigning to `aether.tabs` throws in strict mode and mutating a namespace does not leak into the next build
2. the facade exposes exactly the documented surface — an inventory test, so an accidental internals leak fails CI (this is the whole stability contract)
3. `validateCommandDef`: valid def normalizes; missing `run`, non-callable `run`, empty description, and invalid names (`spaces`, `:`-only, unicode tricks, `__proto__`) are each rejected with a reason, never thrown
4. namespaced names (`git:open`) validate; the namespace is exposed separately for completion grouping
5. a user command whose name collides with a builtin is rejected and the builtin survives untouched
6. two scripts defining the same name → first wins, second reported (deterministic, not last-write-wins)
7. `wrapHook` composes in registration order and passes `next` correctly; a hook that never calls `next` halts the chain deliberately
8. a hook that throws is skipped, the chain continues, and the error is reported once — not per invocation
9. `hints.score` throwing falls back to the builtin scorer, and the fallback latches for the session rather than re-throwing on every element
10. `RISK_CLASSES` — every builtin registry entry has one, and it is a member of the enum (guard, so v2.1 has complete annotation)
11. per-script storage keys are namespaced by script filename; one script cannot read or clobber another's keys
12. facade `page` is a snapshot: mutating the returned object does not affect the browser, and it exposes no DOM node

`overlay/test/unit/x1-config.test.mjs`:
13. config sync guard for `DEFAULTS.scripts`; `scripts_reload`/`scripts_list` in REGISTRY with descriptions

## 5. Visual states — `overlay/test/visual/scenarios.d/i1-command-facade.sh`

1. **user command in the palette** — a scenario script defines `hello`; `:` shows it in completion with its description
2. **bound and executed** — bound via scenario TOML, key pressed, its effect visible
3. **which-key shows it** — r3 panel lists the user command with no which-key changes (integration proven, not asserted)
4. **broken script is contained** — one syntax-error file plus one good file: the good commands work, `:scripts_list` names the broken file, browser fully functional
5. **hot re-import** — edit the script on disk, `:scripts_reload`, new behavior live in the same session

## 6. Non-goals (budget protection)

- **No sandbox, and no pretence of one.** Scripts are privileged. The mitigation is authorship and x2's trust tiers, not a fake boundary.
- **No npm, no bundler, no TypeScript, no build step** — the zero-dependency rule applies to my config too.
- **No plugin lifecycle** (`activate`/`deactivate`/`unload`), no dependency resolution between scripts, no version negotiation. Load, register, done.
- **No DOM access from the facade.** Page interaction goes through the content actor and the hint descriptor pipeline, never a live node handed across processes.
- **No network in the facade.** A script that needs the network asks the AI gateway (f7 rules) or, later, `aetherd` — one network policy, not one per script.
- **No arbitrary monkey-patching** of internals, no `aether._internal` escape hatch. The hook list is the surface; if something needs a hook, that's a spec change.
- **No user-defined widgets or panels in this pass** — `aether.ui.panel` renders on r4's primitive with r4's contract, nothing custom.
