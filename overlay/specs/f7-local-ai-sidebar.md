# f7 — Local AI Sidebar (OpenAI-compatible gateway, hard kill switch)

## 1. Today → Instead → Thinnest

**Today**: asking a local model means alt-tabbing to a terminal (`ollama run`) or a separate web UI, losing the browsing context entirely. The model runs on my machine, but the browser — where the questions come up — has no path to it. And every existing "AI browser" feature is a cloud call I can't audit and can't switch off.

**Instead**: a chrome-owned sidebar chat wired to the one OpenAI-compatible gateway everything converged on (`/v1/chat/completions` — Ollama/LM Studio/llama-server all speak it). Streaming replies, keyboard-first (`a` toggles, type, Enter). A **hard kill switch** with its state visible in the statusbar: when off, the network path throws — not "hides the button", *unreachable* — and off is the default until I enable it. Floor item 7, and the local-AI principle made concrete: local gateway only, kill switch, cloud never implied.

**Thinnest**: two pure modules (request builder + SSE parser; kill-switch/conversation state), a static chrome page for the panel (markup + CSS, no script of its own), an `ai` statusbar builtin, three registry entries, one keybinding, and glue in `aether.uc.js` that owns the fetch. No agent runtime, no page context, no tool calls — this is a chat box next to my tabs, nothing more.

## 2. Exact behavior

**Sidebar**: `a` (normal mode) or `:ai` toggles a right-side panel — a chrome `<browser>` loading `chrome://userchrome/content/ai-sidebar.html` (**chrome-owned page only; never remote content**), styled with the f3 `--aether-*` vars. Layout: transcript (top, scrolls) + one prompt input (bottom). Opening focuses the prompt; while the prompt has focus keys pass through to it (same rule as the urlbar/insert). Esc returns focus to content (NORMAL) without closing; `a`/`:ai` closes. One in-memory conversation per window — reopening keeps it, restarting clears it (nothing persisted, nothing "lost").

**Send**: Enter in the prompt appends my turn to the transcript and POSTs `{base_url}/chat/completions` with `{model, messages: <full conversation>, stream: true}`. SSE deltas render into the assistant turn as they arrive (`textContent` only — **model output is text, never markup, never executed, never parsed as commands**). Gateway unreachable / non-2xx / mid-stream drop → one calm transcript line (`gateway not reachable at <base_url>` class copy, from `aether-strings`), conversation intact, no retry.

**Kill switch**: tri-surface, one state.
- **State**: default **OFF**. Resolution order: persisted user toggle (pref `aether.ai.enabled`, the f6 marker-pref precedent — our TOML is read-only, we never rewrite the dotfile) wins over TOML `[ai] enabled`, which wins over the builtin `false`. Setting `enabled = true` in the dotfile *is* the user enabling (config as data).
- **`:ai_on` / `:ai_off`**: flip and persist the pref, re-render the widget, transient message `ai: on` / `ai: off`. `:ai_off` **aborts any in-flight request** (AbortController) — the switch is hard, not advisory.
- **When OFF**: glue's single network path calls `assertOn(state)` first, which **throws** — there is no code path from prompt to socket while off. The panel still opens but shows the calm off-state (prompt disabled, one neutral line: what's off and that `:ai_on` enables it — informational, zero shame; f6's lexicon sweep covers the copy automatically).
- **Statusbar**: `ai` builtin, event-driven (`refresh_s: 0`), re-rendered on toggle — `ai on` / `ai off` (`aether-ai aether-ai-on|off` classes). In the default widget order: the switch's state is always visible, that's the point of a hard switch.

**Network rule** (decision-2 discipline): requests go **only** to the URL derived from the configured `base_url`, and `validateBaseUrl` accepts **http(s) on loopback hosts only** (`127.0.0.1`, `localhost`, `[::1]`, any port). A non-loopback or non-http(s) `base_url` is rejected at load — AI behaves as unavailable with a calm message, **never** a silent remote fetch. No page content is ever read or sent; the prompt box is the only input source (page-context injection is a v1 non-goal, see §6).

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[ai]
enabled = false                          # kill switch — OFF until I enable it; :ai_on/:ai_off persist over this
base_url = "http://127.0.0.1:11434/v1"   # OpenAI-compatible gateway; loopback hosts only
model = "llama3.2"                       # sent verbatim as the request "model"

[keymap.normal]
a = "ai"                                 # toggle the sidebar

[statusbar]
widgets = ["mode", "workspace", "focus", "url", "msg", "ai", "clock", "date"]  # ai joins
```

New registry commands: `ai` (toggle sidebar), `ai_on`, `ai_off` — all zero-arg, completable.

## 3. Pure vs glue

- **`aether-ai-client.sys.mjs`** (pure, Node-testable — no Services/DOM/fetch): `validateBaseUrl(url)`; `chatUrl(baseUrl)` (trailing-slash normalization); `buildRequest(aiConfig, messages)` → `{url, init}` plain data — glue does the fetch; `sseFeed(buffer, chunkText)` → `{buffer, deltas: [string], done: boolean}` — stateless-in/out SSE parser (`data:` lines, `[DONE]`, partial-chunk reassembly, CRLF, multiple events per chunk, malformed lines skipped).
- **`aether-ai-state.sys.mjs`** (pure): `resolveEnabled(configAi, persistedPref)`; `setEnabled(state, want)` → `{enabled, persist, abortInFlight}`; `assertOn(state)` — throws when off (the unreachable network path); conversation model: `newConversation()`, `addUser`, `beginAssistant`, `addDelta`, `finishAssistant`, `messagesFor(conv)` (history for the next request).
- **`aether-widgets.sys.mjs`** (pure): `ai` builtin rendering from `ctx.ai = {enabled}`.
- **`aether-palette.sys.mjs`** (pure): `ai`/`ai_on`/`ai_off` REGISTRY entries.
- **`aether-strings.sys.mjs`** (pure): off-panel copy, toggle messages, gateway-error copy — inside the f6 lexicon sweep by construction.
- **`aether-config.sys.mjs`**: `DEFAULTS.ai`, keymap `a`, widget order.
- **`overlay/chrome/ai-sidebar.html`** (+ its CSS): static chrome page — transcript container, prompt input, `--aether-*` theming. No script, no external resources.
- **`aether.uc.js`** (glue, not unit-tested): panel create/toggle/focus; prompt wiring into the sidebar page's DOM (same-process chrome document); the one fetch path (`assertOn` → `buildRequest` → `fetch` → ReadableStream/TextDecoder → `sseFeed` → `textContent` appends); AbortController held per request, aborted by `:ai_off` and window unload; pref read/write `aether.ai.enabled`; `ctx.ai` into widget ctx; transient messages.

## 4. Unit tests (behavioral)

`overlay/test/unit/f7-ai-client.test.mjs`:
1. `buildRequest` with defaults → url `http://127.0.0.1:11434/v1/chat/completions`, method POST, JSON body round-trips to `{model, messages, stream: true}` with messages passed through in order, untouched
2. trailing-slash `base_url` normalizes — never a `//chat/completions` url
3. `validateBaseUrl`: loopback http/https on any port accepted (`127.0.0.1`, `localhost`, `[::1]`); non-loopback hosts, `file:`/`chrome:`/garbage rejected — rejection is unavailability, never a fallback to some other host
4. one complete `data: {...}` chunk → its delta text, `done: false`
5. a fixture reply split at arbitrary byte boundaries (mid-line, mid-JSON, mid-`data:` keyword) fed chunk-by-chunk reassembles to exactly the same text as one whole-buffer feed
6. multiple `data:` events in one chunk → all deltas, in order
7. `data: [DONE]` → `done: true`; any text after it contributes nothing
8. a malformed-JSON data line is skipped without throwing and later deltas still arrive
9. role-only / empty-delta chunks contribute no text (no `undefined` in the transcript)
10. CRLF line endings and `data:`-without-space both parse

`overlay/test/unit/f7-ai-state.test.mjs`:
11. default OFF: no pref, defaults config → disabled; `assertOn` throws
12. resolution order: pref `true` beats TOML `false` and vice versa; no pref → TOML value; nothing → `false`
13. `setEnabled` off→on and on→off return the persist value; on→off returns `abortInFlight: true` (the hard-switch contract), off→on does not
14. `assertOn` when enabled returns without throwing — the only gate on the network path is state, verified both ways
15. conversation: user turn → assistant deltas accumulate into one message → `messagesFor` yields alternating history so the *next* request carries the full conversation
16. `messagesFor` on a conversation with a streaming (unfinished) assistant turn still yields well-formed messages — an abort mid-stream never corrupts the next request

`overlay/test/unit/f7-palette.test.mjs`:
17. `ai`, `ai_on`, `ai_off` in REGISTRY; each parses with no args; `complete("ai")` finds all three
18. `ai` widget render: `{enabled: true}` → `ai on` + on-class; `{enabled: false}` and missing `ctx.ai` both → `ai off` + off-class (absent state can only ever look off, never on)

`overlay/test/unit/f7-config.test.mjs`:
19. config sync guard: `DEFAULTS.ai` (`enabled: false`, loopback `base_url`, model), keymap `a = "ai"`, and the widget order incl. `ai` all parse identically from `overlay/config/aether.toml` (f0 pattern)
20. off-state panel copy and gateway-error copy from `aether-strings` are non-empty, name the enable path (`ai_on`), and pass the lexicon sweep (rides `f6-strings` mechanically; asserted here for the new exports)

## 5. Visual states — `overlay/test/visual/scenarios.d/f7-local-ai-sidebar.sh`

Scenario starts a one-file node mock gateway on a `127.0.0.1` port (SSE replay of a canned multi-chunk reply; logs every request to a file), writes a test `~/.config/aether/aether.toml` with `enabled = true` + `base_url` at the mock, `relaunch_browser` to pick it up:

1. **sidebar open with prompt box** — `a` opens the panel, prompt focused, themed, `ai on` in the statusbar
2. **streamed mock reply rendered** — type a prompt, Enter, wait, shot of the canned reply text in the transcript
3. **kill switch off** — `:ai_off`, type + Enter anyway: panel shows the calm disabled state, `ai off` in the statusbar, and the scenario asserts the mock's request log gained **zero** entries after the toggle (no network, proven, not implied)

Mock teardown on scenario exit; 00-spike and f1–f6 scenarios keep passing (f2/f5 pin their own widget TOML, so the default-order change is only validated where defaults are under test).

## 6. Non-goals (budget protection)

- **No page content to the model — none.** No "summarize this page", no selection sending, no context injection. That's the personalized-web ladder and the agent runtime, both post-gate, both behind per-invocation consent when they come. v1 sends the prompt box and the conversation, period.
- **No executing, rendering, or interpreting model output.** `textContent` only: no markdown/HTML rendering, no code-block affordances, no links, no "run this" anything. Prompt injection stays unsolved; I build like it stays unsolved.
- **No remote/cloud gateways.** Loopback-only is enforced in code, not in docs. Per-case cloud use is a future explicit decision, not a config value away.
- No API keys/auth headers (local gateways need none), no retry/backoff — one attempt, one calm line.
- No conversation persistence, history store, export, or multi-conversation UI — one in-memory thread per window.
- No model picker, temperature/params UI, or system-prompt editor — `[ai]` TOML is the whole configuration surface.
- No streaming tool/function calls, no MCP, no agent bridge — that's Phase 4's control plane, not a sidebar feature.
- No token counts, latency stats, or usage meters — a stats surface is a judgment surface.
- No sidebar resize/dock options this pass; one width, one side, CSS constants.
