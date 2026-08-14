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
aether.hints.setScorer(el => (el.tag === "BUTTON" ? 2 : 1));
aether.on("open-link", (url, next) => next(rewrite(url)));
```

Surface, deliberately small:

| Namespace | Contents |
|---|---|
| `aether.version` | facade contract version (semver) for feature detection |
| `aether.defineCommand` | register into the registry |
| `aether.tabs` | `open` `close` `next` `prev` `list` `current` |
| `aether.page` | `url` `title` `host` (read-only snapshot, never live DOM) |
| `aether.ws` | `switch` `list` `current` |
| `aether.ui` | `message` `panel` `prompt` |
| `aether.config` | read-only merged config |
| `aether.storage` | per-script JSON kv, one file per script, 1 MiB cap |
| `aether.on` / `aether.site` / `aether.hints.setScorer` | hooks |

Everything is a **registration call**, never an assignment — the facade is frozen, so `aether.hints.score = fn` would silently fail in sloppy mode and throw in strict. Registration also gives every hook an owner, which is what makes teardown possible.

**Hooks are a named, versioned list** — `open-link`, `page-load`, `tab-close`, `hints.score`, `command` (wraps any registry command). Not monkey-patching, not proxies over internals. The list is the contract; adding to it is a spec change, and that friction is intentional.

**Hook semantics**, pinned because "it's a middleware chain" is not a specification:

- **Synchronous decision, always.** A hook returning a promise is an error: navigation cannot wait on user code without either racing the load or hanging the browser. Async work belongs in a command the hook *triggers*, not in the decision path. `open-link` may rewrite or cancel; it may not defer.
- **`next` is call-once.** A second call is ignored and reported (a double-`next` on `open-link` would otherwise navigate twice). Never calling `next` halts the chain deliberately — that is how a hook cancels.
- **Order is explicit and inspectable**: user scripts (filename order) before mods (`[mods] enabled` order), and `:hooks` prints the effective chain per hook name. A hook system whose order you can't see is a debugging trap.
- **A slow hook is a broken hook.** Each hook call has a budget (16 ms for `hints.score`, 50 ms otherwise). Exceeding it *once* logs; twice latches that hook off for the session with the builtin behavior restored. Throwing does the same immediately. Containment covers slow, not just wrong — f2's widget rule extended, because a scorer that takes 200 ms per element makes hints unusable without ever erroring.

**Registration ledger and teardown.** Every registration — command, hook, site rule, scorer — is recorded against its owning file. `:reload` / `:scripts_reload` **deregisters everything owned by a file before re-importing it**. Without this, hot reload accumulates duplicate hooks every cycle: after three reloads `open-link` fires three times and the failure looks like a browser bug, not a config one. Reload is also **transactional** — the new registry is built off to the side and swapped in only if every enabled file loaded; a file that fails leaves the previous working version registered, and the error is named.

**Risk annotation**: every registry entry — builtin or user — carries a `risk` class (`read` / `navigate` / `mutate-local` / `mutate-remote` / `dangerous`). Unused in v1.3 beyond display; it exists now so v2.1's consent policy annotates commands *at authoring time* rather than retrofitting 60 of them. Builtins are annotated in this spec: `zap`/`boost` are `mutate-local`, `mod_enable` is `dangerous`, navigation is `navigate`.

**A declared risk is a ceiling, not a grant.** A user or mod command's self-declared class can only make it *more* restricted than the floor its origin implies — v2.1's policy treats every non-builtin command as at least `mutate-local` regardless of what it declares. Otherwise a careless mod labels a destructive command `read` and the agent runs it unprompted, which converts a self-description into a privilege escalation.

**A throwing script never breaks the browser.** Load errors are caught per file — that file's commands simply don't exist, one calm line names it. Runtime errors in a command or hook are caught at the call boundary, reported **once per hook per session** (a latch, reset on reload — not once per invocation, which would flood the statusbar), and the browser continues.

**Trust, stated plainly**: these files run with full chrome privileges. There is no sandbox and this spec does not pretend to build one. That is the nvim deal — your machine, your files, no registry, no install command. The security boundary is *authorship*, and x2 is where authorship stops being obviously mine.

**TOML surface**:

```toml
[scripts]
enabled = true
dir     = "~/.config/aether/commands"
```

New registry commands: `scripts_reload` (re-import without a full config reload), `scripts_list` (loaded files, their commands, and any load errors), `hooks` (the effective chain per hook name, in order, with owners).

## 3. Pure vs glue

- **`aether-facade.sys.mjs`** (pure): `buildFacade(impls, owner)` → the frozen object, bound to an owning file; `HOOKS` — the named hook table; `RISK_CLASSES` and `riskFloor(origin, declared)`; `validateCommandDef(def)` → normalized entry or an error (name grammar incl. `ns:name`, description required, `run` callable, no promise-returning hooks); `wrapHook(fns)` → the `next`-chaining composer with call-once `next`, per-link error containment, and budget latching.
- **`aether-ledger.sys.mjs`** (pure): `record(ledger, owner, kind, id)`; `ownedBy(ledger, owner)`; `revoke(ledger, owner)` → the removals to apply; `swap(oldRegistry, newRegistry, results)` → transactional commit-or-keep. This module is what makes hot reload correct rather than merely fast.
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
11. per-script storage keys are namespaced by script filename; one script cannot read or clobber another's keys; a write past the 1 MiB cap is refused with a named error rather than growing the file
12. facade `page` is a snapshot: mutating the returned object does not affect the browser, and it exposes no DOM node

**Reload correctness** (the defect class hot reload actually dies of):

13. `revoke` removes every command, hook, site rule and scorer owned by a file — asserted by reloading a file three times and confirming its `open-link` hook is registered **once**, not three times
14. a hook registered by a file that no longer exists after reload is gone entirely (deregistration is by owner, not by re-registration)
15. `swap` is transactional: with one of three files failing to import, the previously working registry survives intact and the failure is named — no partial swap, no half-loaded state
16. the error latch resets on reload: a hook disabled for throwing is live again after its file is re-imported

**Hook semantics**:

17. `next` called twice → the second call is a no-op and is reported; the downstream chain runs exactly once (guard against double navigation)
18. a hook returning a promise is rejected at registration, not tolerated at call time (sync-decision rule, enforced early where the error is cheap)
19. a hook exceeding its time budget once logs and still applies; twice in a session latches it off with builtin behavior restored — asserted with an injected clock, never wall-clock
20. `riskFloor`: a non-builtin command declaring `read` resolves to at least `mutate-local`; declaring `dangerous` stays `dangerous` (a declaration may restrict, never widen)
21. effective hook order is user scripts (filename order) then mods (enabled order), and `hooks` output reflects it exactly

`overlay/test/unit/x1-config.test.mjs`:
13. config sync guard for `DEFAULTS.scripts`; `scripts_reload`/`scripts_list` in REGISTRY with descriptions

## 5. Visual states — `overlay/test/visual/scenarios.d/i1-command-facade.sh`

1. **user command in the palette** — a scenario script defines `hello`; `:` shows it in completion with its description
2. **bound and executed** — bound via scenario TOML, key pressed, its effect visible
3. **which-key shows it** — r3 panel lists the user command with no which-key changes (integration proven, not asserted)
4. **broken script is contained** — one syntax-error file plus one good file: the good commands work, `:scripts_list` names the broken file, browser fully functional
5. **hot re-import** — edit the script on disk, `:scripts_reload`, new behavior live in the same session
6. **reload does not duplicate hooks** — a script whose `open-link` hook appends a statusbar marker, reloaded three times: the marker appears **once** per navigation, and `:hooks` lists one entry
7. **failed reload keeps the working version** — break the script on disk, `:scripts_reload`: the previous behavior still works and the error is named

## 6. Non-goals (budget protection)

- **No sandbox, and no pretence of one.** Scripts are privileged. The mitigation is authorship and x2's trust tiers, not a fake boundary.
- **No npm, no bundler, no TypeScript, no build step** — the zero-dependency rule applies to my config too.
- **No plugin lifecycle** (`activate`/`deactivate`/`unload`), no dependency resolution between scripts, no version negotiation. Load, register, done.
- **No DOM access from the facade.** Page interaction goes through the content actor and the hint descriptor pipeline, never a live node handed across processes.
- **No network in the facade.** A script that needs the network asks the AI gateway (f7 rules) or, later, `aetherd` — one network policy, not one per script.
- **No arbitrary monkey-patching** of internals, no `aether._internal` escape hatch. The hook list is the surface; if something needs a hook, that's a spec change.
- **No user-defined widgets or panels in this pass** — `aether.ui.panel` renders on r4's primitive with r4's contract, nothing custom.
