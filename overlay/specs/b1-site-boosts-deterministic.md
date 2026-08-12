# b1 — Site Boosts Deterministic (per-domain CSS dotfiles + :zap)

## 1. Today → Instead → Thinnest

**Today**: a site with an annoying element (cookie nag remnant, sticky video, "sign up" banner) means either tolerating it, a uBO cosmetic rule buried in an extension's own storage, or devtools surgery that dies on reload. My per-site fixes live nowhere git-committable, and re-doing them is friction I pay daily.

**Instead**: per-domain CSS as dotfiles — `~/.config/aether/boosts/<domain>.css`, applied automatically to matching sites on load (Zen-Boosts-class, zero AI). `:zap` enters a hint-style element picker; picking an element appends a `display: none !important` rule with a dated comment to the domain's dotfile and re-applies. The dotfile IS the UI: editable in vim, committed next to my nvim config.

**Thinnest**: one pure module `aether-boosts.sys.mjs` (domain matching, registry, zap-selector generation, CSS sanitizer — all Node-testable), four registry commands, ~30 lines in the content child reusing the existing hint machinery with a `pick` flag and a distinct badge color, and glue on the existing tabs-progress listener. No new UI surface, no editor, no AI. This is Tier 0 of the personalized-web ladder (`docs/execution-plan.md` Phase 4 note); Tier 1 (AI-generated boosts) builds on this file format later and is out of scope here.

## 2. Exact behavior

**Apply on load**: on every top-level location change to an http(s) page, glue resolves the host to a boost file — **exact normalized host first** (lowercased, port stripped), then parent-domain fallback by stripping leading labels down to two (`a.b.example.com` → `b.example.com` → `example.com`). No PSL: the naive suffix walk can over-reach on `co.uk`-class domains — documented limitation, non-goal (§6). IP hosts and single-label hosts match exactly, never a suffix; IPv6 hosts canonicalize to the bracketed form (`nsIURI.host` reports `::1` bracketless — both spellings resolve the one `[::1].css` dotfile). The first existing file wins; it's read via IOUtils (cached, invalidated by mtime), **sanitized** (below), and sent to the content child, which applies it as a single `<style data-aether-boost>` element in the **top document** (document CSS only for v1; Shadow DOM is a non-goal). No file / boosts disabled → any previous boost style is removed. Non-http(s) pages (about:, chrome:, file:) never get boosts.

**`:zap`** (palette; normal mode): enters element-pick mode — the existing hint machinery with the same `hint_chars`, a **distinct badge color** (theme red, vs. hint yellow) so pick-to-hide never looks like pick-to-click. Choosing a hint does **not** click: the child sends up an element descriptor `{id, classes, tag, nthChain}`; pure code turns it into a selector preferring `#id` > `tag.class-chain` > `:nth-of-type` ancestor path; glue appends `/* zapped 2026-08-11 */ <selector> { display: none !important; }` to the boost file that resolves for this host (creating `<exact-host>.css` if none exists), then re-applies. Statusbar confirms: `zapped: <selector>` (transient, neutral). Escape cancels pick mode, writes nothing. Undo = delete the line in the dotfile — the file is the interface.

**`:boost_off` / `:boost_on`** (palette): toggle the resolved domain's enable state in the in-memory registry — off removes the style from matching tabs immediately, on re-applies. **Session-scoped by design**: a relaunch starts enabled again; permanence = edit or remove the dotfile (config as data, no hidden state store). Statusbar: `boost off: <domain>` / `boost on: <domain>`; no boost file for this host → `no boost for: <host>` (neutral).

**`:boost_edit`** (palette): opens the resolved boost file as `file://<path>` in a new tab (the cheap editor/viewer — real editing happens in vim; a reload after saving picks up the new mtime). No file yet → creates it with a one-line dated header first, so the path always exists to open.

**Keybindings**: none shipped — all four commands are palette entries; any can be bound in `[keymap.normal]` like every registry command.

**SECURITY — the sanitizer**: boost CSS is user-authored trust class, but dotfiles get synced between machines, so it is sanitized on every apply anyway: strip the known CSS fetch vectors — `@import` (whole at-rule), every `url(...)` **except `data:`**, and `image-set()`/`-webkit-image-set()` with any non-`data:` source (string sources fetch without `url()` in modern Firefox; `var()` inside counts as unsafe). Because the CSS tokenizer decodes escapes before recognizing these tokens, the checks re-run on the fully escape-decoded text — `\75 rl(` and `@\69mport` spellings cannot hide. A boost file can restyle anything but gets no known network-fetch channel (no exfil via background-image beacons); it's a lexical sanitizer, not a CSS parser, so the guarantee is scoped to these known vectors. The sanitizer is a pure export of `aether-boosts.sys.mjs`; **b2 imports it from there** — one sanitizer, one trust decision.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[boosts]
enabled = true                    # master switch: off = no reads, no applies, :zap unavailable
dir = "~/.config/aether/boosts"   # <domain>.css dotfiles
```

Pick mode reuses `options.hint_chars`. New registry commands: `zap`, `boost_on`, `boost_off`, `boost_edit` — all zero-arg, completable.

## 3. Pure vs glue

- **`aether-boosts.sys.mjs`** (pure, Node-testable — no Services/DOM/IOUtils): `candidateDomains(host)` → ordered match list (normalization + naive suffix walk); `boostFileName(domain)` → safe filename (no separators, no `..`, hostile input can never escape the boosts dir); `createRegistry()` / `resolveBoost(registry, host)` / `setDomainEnabled(registry, domain, on)` — per-domain enable state and exact-beats-parent resolution; `needsRead(cacheEntry, mtime)` — mtime cache decision; `zapSelector(descriptor)` — `#id` > `tag.class-chain` > `:nth-of-type` path, CSS-identifier escaping; `zapRule(selector, dateStr)` — the appended rule text incl. dated comment; `sanitizeCss(css)` — the b2-shared sanitizer.
- **`aether-content-child.sys.mjs`**: `Aether:BoostApply {css}` / `Aether:BoostClear` → maintain the single `style[data-aether-boost]` in the top document; hint machinery grows a `pick` option (badge color override; activation sends `Aether:HintsDone {reason: "picked", descriptor}` instead of focusing/clicking — descriptor built here because only the child has the DOM).
- **`aether-palette.sys.mjs`** / **`aether-strings.sys.mjs`** (pure): four REGISTRY entries; zap/toggle/no-boost copy inside the f6 lexicon sweep by construction.
- **`aether.uc.js`** (glue, not unit-tested): hook the existing tabs-progress listener (`isTopLevel` navigations); IOUtils read/stat/append with the pure cache decision; sanitize-then-send; pick-mode entry (distinct mode badge in statusbar), `picked` handling → selector → append → re-apply; `file://` tab for `:boost_edit`; transient messages.

## 4. Unit tests (behavioral)

`overlay/test/unit/b1-boosts.test.mjs`:
1. `candidateDomains("a.b.example.com")` → `["a.b.example.com", "b.example.com", "example.com"]`, in that order
2. normalization: uppercase host and `:8080` port collapse to the same candidates as the bare lowercase host
3. bare two-label host → itself only; single-label (`localhost`) and IPv4/IPv6 hosts → exact only, never a suffix walk (an IP must not "fall back" to its trailing octets)
4. hostile "host" input (`../../etc`, slashes, null-ish, empty) → `boostFileName` output contains no path separators or `..`; empty/invalid yields no candidates rather than a throw
5. registry resolution: both `sub.example.com.css` and `example.com.css` present → exact host wins; only the parent present → parent matches the sub
6. `setDomainEnabled` off → `resolveBoost` yields nothing for that domain while an unrelated domain still resolves; re-enable restores — and a fresh registry starts everything enabled (session-scoped off, no persistence)
7. `needsRead`: same mtime → no re-read; changed mtime → re-read; no cache entry → read (all three ways)
8. `zapSelector` with an id → `#id` exactly, ignoring classes/nth
9. no id, classes present → `tag.class1.class2` chain
10. no id, no classes → deterministic `:nth-of-type` ancestor path that regenerates identically for the same descriptor
11. CSS-unsafe id/class characters (spaces, quotes, leading digit) → escaped valid selector or clean fall-through to the nth path — never a throw, never an unescaped selector
12. `zapRule` output contains the selector, `display: none !important`, and the supplied date in a comment; two zaps append two independent rules (no merging, no dedup)
13. `sanitizeCss` strips `@import` at-rules in any casing/whitespace form, including `@import url(...)`
14. `sanitizeCss` strips `url(...)` with http/https/protocol-relative/quoted/whitespace-padded arguments — **`url(data:...)` survives**
15. clean CSS passes through byte-identical, and the sanitizer is idempotent (`sanitize(sanitize(x)) === sanitize(x)`)
16. an exfil fixture (background-image beacon + `@import` smuggled after valid rules) comes out with zero fetchable URLs while its benign rules survive

`overlay/test/unit/b1-palette.test.mjs`:
17. `zap`, `boost_on`, `boost_off`, `boost_edit` in REGISTRY, zero-arg, each parses; `complete("boost")` finds exactly the three boost commands
18. zap confirmation, boost on/off, and no-boost copy from `aether-strings` are non-empty and pass the f6 lexicon sweep (no punitive wording — asserted for the new exports)

`overlay/test/unit/b1-config.test.mjs`:
19. config sync guard: `DEFAULTS.boosts` (`enabled: true`, `dir`) parses identically from `overlay/config/aether.toml` (f0 pattern)

## 5. Visual states — `overlay/test/visual/scenarios.d/g1-site-boosts-deterministic.sh`

Against the harness playground page (served or extended so the target element is stable), boosts `dir` pointed at a scenario temp dir:

1. **playground page unboosted** — baseline shot, target button visible
2. **after `:zap` of the button** — pick badges shown (distinct color), pick the button: element gone, statusbar confirmation visible
3. **boost dotfile re-applied after relaunch** — `relaunch_browser`, same page: element still gone (persistence via the dotfile, nothing else)
4. **`:boost_off` restores the pristine page** — element back, statusbar shows `boost off: <domain>`

Existing scenarios (spike, f1–f7) keep passing.

## 6. Non-goals (budget protection)

- **No PSL.** The naive suffix walk is documented as such; a `co.uk` false parent-match is a known edge I fix by using the exact-host file. A PSL dependency is exactly the kind of weight that eats the rebase budget.
- **No Shadow DOM or iframe styling** — top document only. Boost CSS can't reach into shadow roots; that's a v1 statement, not a bug.
- **No per-domain fonts/colors UI, no boost manager panel** — the dotfile is the UI. No un-zap command either: undo is deleting a line.
- **No cross-domain wildcards** (`*.css`, global boosts) and **no sync** — files sync however dotfiles sync (git).
- **No file watching** — mtime is checked on navigation; edit, save, reload.
- **No persisted disable state** — `:boost_off` is session-scoped; permanence lives in the dotfile.
- **No AI.** Deterministic only; Tier 1 (local-model-generated boost CSS into this same file format) is a separate post-floor feature that inherits this sanitizer.
- **No specificity machinery** beyond `!important` on zap rules — if a site out-specifies a hand-written boost rule, I escalate in the dotfile myself.
