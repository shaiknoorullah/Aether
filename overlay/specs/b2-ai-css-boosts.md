# b2 — AI CSS Boosts (`:boost` — local-model reskin into the b1 dotfile)

## 1. Today → Instead → Thinnest

**Today**: making a site match my rice means hand-writing a boost dotfile rule by rule — devtools, copy a selector, guess at the palette mapping, repeat. b1 made the fixes durable; authoring them is still all manual. The local model sits one sidebar away (f7) and never helps.

**Instead**: `:boost` — the content child samples the page's *structure* (selectors + computed colors/fonts, never text), pure code renders that skeleton plus my active `--aether-*` base16 palette into a prompt, the f7 gateway streams back a CSS-only reskin, and I review it in a preview panel — including exactly what the sanitizer stripped — before anything is written. Accept appends it to the b1 dotfile for the domain and applies; Dismiss discards. Tier 1 of the personalized-web ladder (`docs/execution-plan.md` Phase 4 note), riding entirely on b1's file format/sanitizer and f7's plumbing.

**Thinnest**: one new pure module (`aether-boost-gen.sys.mjs`), one skeleton-collection message in the content child, one registry command, and glue that reuses the f7 sidebar surface, the f7 fetch path (`assertOn` → `buildRequest` → `sseFeed`), and the b1 store (append + mtime-invalidate + re-apply). **Zero new TOML keys**: `[ai]` (kill switch, loopback `base_url`, `model`) and `[boosts]` (`enabled`, `dir`) already say everything. No new network path, no new trust decision — one sanitizer (b1's), one gateway rule (f7's).

## 2. Exact behavior

**`:boost`** (palette; normal mode; no default keybinding — bindable in `[keymap.normal]` like any registry command). Preconditions, checked in order, each a calm neutral line: non-http(s) page → `no boost here: <scheme> pages`; `[boosts] enabled = false` → boosts-off message; AI off → **the exact f7 off-state** (`assertOn` throws; same copy, names `ai_on`; zero requests while off — the switch is hard here too).

**Generate** (one-shot per invocation — never per-pageload, never auto): glue asks the child for a **structural sample**: the top ~40 distinct selectors by element count — per selector `{tag, id, classes}` and computed `color`, `background-color`, `font-family`, `font-size` — plus a page palette histogram (`[{color, count}]`). **Never text content, never attribute values beyond id/class** — the whitelist is enforced twice: the child only collects these fields, and the pure serializer only emits whitelisted fields even if handed more. `buildBoostPrompt(skeleton, palette)` renders the sample + the active `--aether-*` palette (from the f3 theme state) + strict output instructions (CSS only, exactly one fenced code block, no `@import`/`url()`/JS — stated to the model, *enforced* by the gate). The request is f7's `buildRequest` verbatim — same `[ai] model`, loopback-only, streamed.

**Preview**: the reply streams into the f7 sidebar surface with a distinct header (`boost preview — <domain>`) — `textContent` only, model output never markup. While a boost is streaming/pending the prompt input is replaced by the review bar. On stream end: `extractCss` pulls the **single** fenced CSS block (zero or ≥2 blocks, or no fence → one calm line, nothing else happens); `acceptanceGate` runs the shared b1 sanitizer + a hard size cap (32 KiB constant, not config) and the panel shows the surviving CSS plus a **strip summary** — each removed rule listed (`stripped: @import …`), or `nothing stripped`. Nothing is applied at any point during preview.

**Accept / Dismiss**: with the preview focused, **Enter accepts, Esc dismisses** (window close = dismiss). Accept appends to the b1 file that resolves for this host (creating `<exact-host>.css` if none) under a dated header `/* boost generated 2026-08-11 — review in vim, delete freely */`, invalidates the mtime cache, re-applies through the b1 apply path (the sanitizer runs again there — one trust path, belt and suspenders), statusbar: `boost written: <domain>`. Dismiss discards everything, statusbar: `boost dismissed` (neutral — dismissing is a normal outcome, not a failure). **Nothing is ever auto-applied or auto-written.** Append, not overwrite: hand-written zap rules are never touched; undo = delete the dated block in vim — the file is the interface (b1 rule).

**Errors**: gateway unreachable / mid-stream drop → f7's one calm line, preview closes to the normal sidebar, nothing written. No retry, no auto-regenerate — `:boost` again is the retry.

**TOML surface**: none added, deliberately. The config sync guard has nothing new to guard. New registry command: `boost` — zero-arg, completable (b1's "exactly three boost commands" completion assertion becomes four; that test updates with this feature).

## 3. Pure vs glue

- **`aether-boost-gen.sys.mjs`** (pure, Node-testable — no Services/DOM/fetch/IOUtils): `serializeSkeleton(sample)` — whitelist-enforcing, deterministic, caps at 40 selectors; `buildBoostPrompt(skeleton, palette)` — prompt text incl. `--aether-*` mapping + output rules; `extractCss(replyText)` — the single-fenced-block extractor, strict; `acceptanceGate(rawCss)` → `{ok, css, removedRules[], reason?}` — imports `sanitizeCss` from `aether-boosts.sys.mjs` (extended with a reporting form; string-in/string-out contract unchanged for b1 callers) + size cap; `generatedHeader(domain, dateStr)` — the appended block header.
- **`aether-content-child.sys.mjs`**: `Aether:BoostSample` → walk the top document, build the whitelisted sample, reply `Aether:BoostSampleDone {sample}` — the only new child surface.
- **`aether-palette.sys.mjs`** / **`aether-strings.sys.mjs`** (pure): `boost` REGISTRY entry; preview header, strip-summary, written/dismissed, no-boost-here copy — inside the f6 lexicon sweep by construction.
- **`aether.uc.js`** (glue, not unit-tested): precondition checks (`assertOn` first); sample request; palette handoff from theme state; the f7 fetch/stream path into the preview; review-bar Enter/Esc wiring; IOUtils append + cache invalidate + b1 re-apply; transient messages.
- **`ai-sidebar.html`** (+ CSS): preview header + review bar markup, `--aether-*` themed, still no script of its own.

## 4. Unit tests (behavioral)

`overlay/test/unit/b2-boost-gen.test.mjs`:
1. `serializeSkeleton` is deterministic — same sample twice → byte-identical output; every whitelisted field (tag/id/classes, the four computed props, histogram entries) appears in it
2. **whitelist under hostile input**: sample entries smuggling extra fields (`textContent`, `href`, `title`, `value`, arbitrary keys) → none of those *values* appear anywhere in the serialized output — fields are copied by name, objects never passed through
3. >40 selectors in → at most 40 out (top by count); empty/missing sample → still a valid skeleton string, never a throw
4. `buildBoostPrompt` contains the serialized skeleton, every supplied `--aether-*` name/value pair, and the CSS-only/single-block instruction; page-derived strings in the prompt are limited to selector parts and CSS color/font values — asserted with a sentinel sample
5. `extractCss`: exactly one fenced block → its content, with ` ```css ` and bare ` ``` ` fences both accepted; surrounding prose discarded
6. zero fenced blocks — prose-only *and* bare unfenced CSS — → rejection, never a guess
7. two fenced blocks → rejection: never concatenation, never first-wins
8. `acceptanceGate` on a reply with `@import` + remote `url()` beacons among benign rules → survivors intact, each stripped rule named in `removedRules[]`, and the output re-sanitizes to itself (idempotent against b1's `sanitizeCss`)
9. `url(data:...)` survives the gate (b1 contract holds through b2)
10. `expression(...)` / `-moz-binding` are stripped and reported (the shared-sanitizer contract asserted from b2's side)
11. oversize CSS (> cap) → `{ok: false, reason}` — rejected whole, never silently truncated
12. clean CSS → `ok: true`, `removedRules` empty, css byte-identical
13. `generatedHeader` contains the domain and supplied date; two accepts produce two independent dated blocks (append semantics, no merging — mirrors b1 zap test 12)

`overlay/test/unit/b2-palette.test.mjs`:
14. `boost` in REGISTRY, zero-arg, parses; `complete("boost")` finds the b1 three **plus** `boost` (b1 test 17's "exactly three" updates here, intentionally)
15. preview/written/dismissed/strip-summary/no-boost-here copy from `aether-strings` are non-empty, name the enable path where an off-state is described, and pass the f6 lexicon sweep (dismissal copy asserted neutral — no failure framing)

`overlay/test/unit/b1-boosts.test.mjs` (extended):
16. the reporting form of `sanitizeCss` returns the same surviving CSS as the plain form on b1's exfil fixture — one sanitizer, verified equivalent from the b1 side

## 5. Visual states — `overlay/test/visual/scenarios.d/b2-ai-css-boosts.sh`

Extends the f7 mock gateway with a canned `:boost` reply: one fenced CSS block that **loudly recolors the playground** (unmissable background/accent swap) and deliberately includes one `@import` + one remote `url()` rule so the strip summary is non-empty. The playground page carries a sentinel text string. Boosts `dir` at a scenario temp dir; mock logs every request body.

1. **preview panel streaming the generated CSS** — `:boost` on the playground, shot mid/post-stream: distinct `boost preview` header, CSS text in the transcript, page itself *unchanged*
2. **diff/strip summary visible before accept** — stream done: stripped rules listed, review bar showing Enter/Esc, still nothing applied
3. **accepted boost applied** — Enter: playground visibly recolored, `boost written: <domain>` in the statusbar; scenario asserts the dotfile exists in the temp dir and greps the request log for the **sentinel's absence** (skeleton carried no page text — proven, not implied) and a selector's presence (the skeleton did go out)
4. **kill switch off** — `:ai_off`, then `:boost`: the calm f7 off-state, `ai off` in the statusbar, mock log gained **zero** entries

00-spike, f1–f7, and b1 scenarios keep passing; the f7 mock keeps its existing canned chat reply untouched.

## 6. Non-goals (budget protection)

- **No JS output. Ever.** The gate admits CSS only; generated JS near page context is a different trust class (execution-plan ladder) and is not a future config value away.
- **No page text, no attribute values beyond id/class, no screenshots** in the prompt — structure and computed style only, enforced in code twice and proven in the visual scenario's request log.
- **No remote gateways** — f7's loopback validation is the only network rule; b2 adds no second path.
- **No auto-regeneration, no per-pageload calls, no drift-detection** — one shot per explicit `:boost`; the dotfile is static until I invoke again or edit it in vim.
- **No iteration chat** ("make it darker") — regenerate whole or edit the file; per-element conversational restyling is Tier 2+ machinery.
- **No overwrite/merge semantics** — dated append blocks only; dedup and cleanup are vim's job (b1: the file is the UI).
- **No model/prompt tuning surface** — no temperature, no style presets, no prompt templates in TOML. `[ai] model` is the whole knob.
- **No cross-domain/global generated boosts** and no batch mode — one page, one domain, one review.
