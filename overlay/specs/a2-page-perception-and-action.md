# a2 — Page Perception and Action (reading and acting on pages, on purpose)

## 1. Today → Instead → Thinnest

**Today**: a1 lets the agent drive the browser, but the browser's contents are opaque to it. "Summarize this" and "click the accept button" are both impossible, and f7's non-goal list says so explicitly — no page content to the model, none. That was the right default for a chat box. It is the wrong permanent ceiling for an agent I asked to do things for me.

**Instead**: two capabilities, kept separate because their risks differ by an order of magnitude. **Perception** — the agent may read the current page when I turn it on. **Action** — the agent may interact with page elements, through the same descriptor pipeline `:zap` and hints already use. Both off by default, both toggleable mid-session, and perception taints the conversation (a1) the moment it is used.

**Thinnest**: the content actor already extracts structure (b2 samples selectors and computed styles), already builds element descriptors (b1's `:zap`), and already activates elements (f1's hints). This spec adds a text-extraction message and an act-on-descriptor message, plus the consent surfaces. No new process boundary, no CDP, no injected automation script.

## 2. Exact behavior

### Perception

`[agent] perception = false` by default. When enabled, the agent can call `page_read` (`risk: read`) which returns the **current tab only**:

- **Text mode** (default): the Readability-extracted article text, or a bounded text projection if extraction fails. Capped at 100 KB.
- **Structure mode**: b2's existing whitelisted skeleton — selectors plus computed colors and fonts, no text.
- **Never**: form field values, password fields, `contenteditable` contents, `localStorage`, cookies, or any cross-origin iframe. Enforced in the child, where the DOM is, and re-enforced in the pure serializer — b2's double-enforcement pattern, because the child is the only place that can see the difference and the serializer is the only place that's Node-testable.

A page read **taints the conversation permanently** (a1), shows a transient `read: <host>` line, and appends a log entry. There is no silent read. The statusbar `agent` widget shows `agent on · reading` while perception is enabled, because a browser that can read what I'm looking at should say so continuously, not once at setup.

Private windows refuse perception entirely — f4's rule, applied to the highest-risk surface.

### Action

`[agent] action = false` by default and **cannot be enabled without perception** (acting blind is worse, not safer). Two commands:

- `page_click(descriptor)` and `page_type(descriptor, text)` — descriptors are b1's `{id, classes, tag, nthChain}` shape, resolved in the child to exactly one element or refused. Ambiguous descriptors are an error, never a best guess.
- `page_elements()` returns actionable elements with descriptors — the hint machinery's element set, serialized. The agent picks from what the hint system would have shown me, which means it can only reach things I could have clicked.

Every action is **`mutate-remote` class** — clicking a button on a page is an outward-facing act with unknown consequences, and it is treated as such. With the default policy that means `confirm` on every one, and tainted conversations (which every perception-using conversation is) keep it that way.

**Cross-origin actions always confirm, regardless of policy.** If a plan reads page A and acts on page B, that is the exact shape of a successful injection, and it is the one case where config cannot lower the gate. This is decision #2's "human-in-the-loop for cross-origin actions, always," implemented rather than restated.

**Refused by construction, not by policy**: typing into a password field, submitting a form containing one, interacting with a file input, or clicking through the browser's own permission and download dialogs. Those are chrome-level and the actor never receives them.

### The visible affordance

While action is enabled, a persistent border tint (r2's palette, `color1`) frames the content area. Not a notification, not a toast — an ambient state you cannot forget you left on. Agent-driven clicks flash the target element briefly before acting, so I see what it touched even when I wasn't watching closely.

**TOML surface**:

```toml
[agent]
perception = false      # page_read
action     = false      # page_click / page_type; requires perception
read_cap   = "100kb"
```

New registry commands: `page_read` (`read`, `agent`-callable), `page_elements` (`read`), `page_click`, `page_type` (`mutate-remote`), `perception_on`/`perception_off`, `action_on`/`action_off`.

## 3. Pure vs glue

- **`aether-perception.sys.mjs`** (pure): `serializeText(extract, cap)` — bounding, whitespace normalization, control-character stripping; `assertNoSecrets(extract)` → throws if a password/file/contenteditable field leaked in (the second enforcement layer); `descriptorFromElement(info)` and `resolveAmbiguity(matches)` (b1's selector logic, reused); `isCrossOrigin(readHost, actHost)`.
- **`aether-content-child.sys.mjs`**: two new messages — `Aether:PageRead` (Readability + whitelist) and `Aether:PageAct` (descriptor → element, one match or refuse, flash-then-act). The refusal list lives here because only the child sees the DOM.
- **`aether.uc.js`** (glue): consent integration, taint marking, the border tint, log entries.

## 4. Unit tests (behavioral) — `overlay/test/unit/a2-perception.test.mjs`

1. `serializeText` caps at the configured size on a character boundary and reports truncation rather than silently cutting
2. control characters, ANSI escapes, and zero-width/RTL-override characters are stripped (a page cannot smuggle terminal or prompt-shaping tricks through extraction)
3. `assertNoSecrets` throws when handed an extract containing a password-field value, a file input path, or `contenteditable` content — asserted per field type, using a sentinel per case
4. an extract carrying cross-origin iframe text is rejected whole (never partially served)
5. `descriptorFromElement` round-trips with b1's `zapSelector` on the same fixtures — one descriptor language, verified from both sides
6. `resolveAmbiguity`: exactly one match resolves; zero and two-plus both refuse with distinct reasons, and neither guesses
7. `isCrossOrigin` compares registrable hosts correctly, including subdomain cases and `about:`/`file:` schemes (which always count as cross-origin)
8. a `page_click` plan step where the read host and act host differ resolves to `confirm` even under an all-`auto` policy (the un-lowerable gate, asserted against a policy that tries to lower it)
9. perception disabled → `page_read` is unreachable, gate verified both ways (f7's `assertOn` pattern)
10. action enabled with perception disabled is rejected at config load, naming the dependency
11. every consent, refusal, and truncation string passes the f6 lexicon sweep

## 5. Visual states — `overlay/test/visual/scenarios.d/l2-perception.sh`

Fixture pages carrying sentinels (a password field, a hidden marker, a cross-origin iframe) plus the mock gateway logging request bodies:

1. **perception off** — `page_read` unreachable; mock log gains zero entries
2. **read taints** — perception on, read a page: transient line, log entry, widget shows `reading`, and a subsequent auto-class mutating step now prompts
3. **no secrets leave** — request log grepped for the password sentinel, the iframe sentinel, and a `localStorage` sentinel: **absent**, all three
4. **action border** — action enabled: the content-area tint is visible in the shot
5. **click flashes then acts** — two shots: highlighted target, then the resulting page state
6. **ambiguous descriptor refuses** — a fixture with two identical buttons: refusal, no click, and the scenario asserts the page state is unchanged
7. **cross-origin confirms** — read page A, act on page B: prompt appears even with an all-`auto` policy; declining leaves B untouched

## 6. Non-goals (budget protection)

- **No CDP, no WebDriver BiDi, no Marionette.** Rejected in decision #2 and still rejected: CDP has no auth, and adding an automation protocol would create a second control path that a1's log doesn't see.
- **No injected automation script in page context**, no `eval` in content, no generated JS near the page (b2's permanent rule).
- **No screenshots to the model** — a screenshot is page content with the whitelist removed.
- **No background/other-tab reading.** Current tab only, foreground, while I'm there.
- **No form filling from stored credentials.** Password managers exist and are extensions; an agent with credential access is a different threat model entirely.
- **No injection detection or sanitization of page text before the model sees it.** It doesn't work; taint tracking assumes the read is hostile and gates effects instead.
- **No multi-step page automation without a plan** — every action is a step in an a1 plan, reviewed before it runs.
