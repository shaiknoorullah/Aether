# Technical Research: Agent-Safe Browser Control & IPC (2026)

*Department: Technical · Team: tech-ai-control-ipc · Date: 2026-06-10*

*Mandate: Agent-safe browser control + IPC — CDP, WebDriver BiDi, WebExtension messaging, exportFunction/cloneInto, Native Messaging, MCP. Security, sandboxing, permissions, and the safest combination for Aether.*

*Primary source brief: `outputs/agent-safe-browser-ipc.md` (13 primary-doc sources). Cross-referenced with red-team pre-mortem (`browser-failure-redteam`) and whitespace analysis (`browser-feature-whitespace`).*

---

## 1. Executive Summary

AI-native browsers must let agents drive real browser actions — navigate, read DOM, fill forms, intercept network, execute scripts — without reopening the security holes that 20 years of web isolation closed. The core conclusion of this research is that **no single IPC/control mechanism is agent-safe on its own**. Each of the six mechanisms evaluated (CDP, WebDriver BiDi, WebExtension messaging, Firefox Xray wrappers, Native Messaging Hosts, MCP) trades capability against safety differently, and the only defensible architecture is a **layered defense** that uses each at the layer where its security properties are strongest.

The recommended stack for Aether is: **MCP as the agent-facing consent/authorization protocol → WebExtension messaging (ports) as the privileged, sender-validated gateway → content scripts isolated by Firefox Xray vision (`exportFunction`/`cloneInto`) → host-permission-scoped WebExtension APIs → an optional, OS-sandboxed Native Messaging Host as an escape hatch.** CDP and WebDriver BiDi are explicitly rejected as production agent-control channels — both lack authentication and fine-grained capability scoping, and Chrome itself positions BiDi as a *testing* protocol, not an agent-sandboxing one.

Critically, this IPC-layer hardening is necessary but **not sufficient**: the dominant unsolved threat (per sibling red-team and competitive research) is *indirect prompt injection* operating at the semantic layer, which no process-level sandbox addresses. Aether's whitespace opportunity is therefore not "another CDP wrapper" but a **browser-native, permission-gated agent runtime with built-in audit/observability** — a category no shipping browser fills. This positions Aether's control plane as both a safety differentiator and an architectural moat that retrofit tools (browser-use, Playwright MCP, Stagehand) structurally cannot match.

---

## 2. Key Findings

### Finding 1: CDP is critically unsafe for production agent control — no auth, no scoping
- **Description**: Chrome DevTools Protocol grants any process that can reach its WebSocket full access to DOM, Network, Debugger, Page, and Runtime domains. There is no authentication, no capability scoping (cannot restrict to "read-only DOM"), and `Runtime.evaluate` executes arbitrary JS in any page. The debug port is unauthenticated; bound to `0.0.0.0` it is a full remote takeover. It was designed for dev tooling, not least-privilege agent access.
- **Evidence**: Chrome DevTools Protocol docs — https://chromedevtools.github.io/devtools-protocol/ ; "Chromium-based browsers will continue to use CDP for debugging purposes, while WebDriver BiDi is the new specification to address the testing needs" — https://developer.chrome.com/blog/webdriver-bidi
- **Confidence**: HIGH (official protocol docs + Chrome blog)
- **Implication for Aether**: Never expose CDP directly to agents. If used at all, only behind the privileged gateway with an operation allowlist.

### Finding 2: WebDriver BiDi is the right cross-browser standard long-term, but not yet agent-safe
- **Description**: W3C BiDi (Browser Tools & Testing WG, all major vendors participating) combines cross-browser compatibility with bidirectional messaging and a real session lifecycle — a genuine improvement over CDP. But protocol-level auth is not standardized, granular capability scoping (e.g., "no script execution") is not in the spec as of 2026, and it provides script-eval/DOM-manipulation like CDP. Chrome explicitly frames it as a *testing* protocol.
- **Evidence**: WebDriver BiDi W3C Specification — https://w3c.github.io/webdriver-bidi/ ; WebDriver BiDi blog — https://developer.chrome.com/blog/webdriver-bidi
- **Confidence**: HIGH (W3C spec + official blog)
- **Implication for Aether**: Reject as the primary agent-control channel; monitor the spec for capability-restriction features (it is the strongest candidate to *become* agent-safe).

### Finding 3: WebExtension messaging is the strongest available agent-IPC primitive
- **Description**: `runtime.sendMessage`/`runtime.connect` ports provide sender-validated, permission-scoped, sandboxed IPC between extension components. Every message carries a `MessageSender` (`tab.id`, `tab.url`, `frameId`, extension `id`) the background script must validate. Receiving a message executes no code — the handler decides, enabling operation allowlisting. Web pages cannot message the extension unless `externally_connectable` explicitly permits it. Host permissions scope which sites are reachable.
- **Evidence**: MDN runtime.sendMessage — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage ; Chrome Message Passing — https://developer.chrome.com/docs/extensions/develop/concepts/messaging ; Chrome Stay Secure — https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure
- **Confidence**: HIGH (official MDN + Chrome docs)
- **Implication for Aether**: Make the extension background/service worker the single privileged gateway. Treat all content-script messages as untrusted and validate sender + message schema before any privileged action.

### Finding 4: Firefox Xray wrappers give the strongest content↔page isolation; Chromium has no equivalent for object sharing
- **Description**: Firefox "Xray vision" lets privileged code see the native C++ DOM representation, bypassing JS reflection entirely — page-script prototype poisoning, redefined built-ins, and expandos are invisible. `exportFunction`/`cloneInto` allow a *minimal, validated* API surface to be shared with page scripts safely. Chromium's isolated worlds give separate prototype chains but **do not support direct object sharing**, forcing reliance on the spoofable `window.postMessage`. Key footguns: Xray waivers (`wrappedJSObject`) are transitive, and Firefox `window.eval()` runs in *page* context.
- **Evidence**: Firefox Source Docs: Xray Vision — https://firefox-source-docs.mozilla.org/dom/scriptSecurity/xray_vision.html ; MDN Sharing Objects with Page Scripts — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts ; MDN Content Scripts — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
- **Confidence**: HIGH (Firefox source docs + MDN)
- **Implication for Aether**: This is a concrete argument *for* a Firefox-based engine — agent-facing content↔page safety is materially better than Chromium's. Never waive Xrays in agent code.

### Finding 5: Native Messaging is powerful but dangerous — no binary verification, full user privileges
- **Description**: Native Messaging launches a native binary and communicates via length-prefixed JSON over stdio. The browser performs **no signature/hash verification** of the binary at the manifest path (user-writable on Linux), the host runs with **full user privileges** and **no sandboxing by default**, and there is no audit logging. A compromised host is a path to credential theft / arbitrary code execution. It is unavailable from content scripts (extension pages / service workers only).
- **Evidence**: Chrome Native Messaging — https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging
- **Confidence**: HIGH (official docs)
- **Implication for Aether**: Treat as an optional escape hatch only. Mandate OS-level sandboxing (AppArmor/seccomp/macOS sandbox), read-only/dm-verity binary mounts, and a strict command allowlist (no shell, no arbitrary paths). Never forward raw agent input.

### Finding 6: MCP is the right agent-facing abstraction but enforces no security itself
- **Description**: MCP (JSON-RPC 2.0) standardizes tool discovery (`tools/list`), structured invocation, consent hooks, and human-in-the-loop "elicitation." But the spec states it "cannot enforce these security principles at the protocol level" — security depends entirely on the implementor. It inherits the risks of whatever it wraps (MCP→CDP is as unsafe as CDP), tool descriptions are an indirect-prompt-injection vector ("should be considered untrusted"), and consent UX is undefined (a "click OK for all tools" dialog satisfies the spec).
- **Evidence**: MCP Specification (2025-03-26) — https://modelcontextprotocol.io/specification/2025-03-26 ; MCP Transports — https://modelcontextprotocol.io/specification/2025-03-26/basic/transports ; MCP Architecture — https://modelcontextprotocol.io/docs/concepts/architecture
- **Confidence**: HIGH (protocol spec)
- **Implication for Aether**: Use MCP as the agent-facing layer *on top of* the WebExtension gateway, never directly over CDP. Implement consent **per tool invocation**, not per session; gate destructive actions (form submit, payment, auth) behind explicit elicitation.

### Finding 7: The safest combination is a 5-layer stack, not any single mechanism
- **Description**: The brief's recommended architecture: MCP (consent/discovery/HITL) → Extension background (operation allowlist, sender validation, rate limiting, audit log) → content scripts (Xray-isolated DOM access) → host-permission-scoped WebExtension APIs → optional OS-sandboxed Native Messaging Host. Each layer constrains what the agent can do and provides an independent spoofing defense; CDP/BiDi/`window.postMessage`/`wrappedJSObject` are explicitly rejected.
- **Evidence**: Synthesis of all 13 brief sources — see `outputs/agent-safe-browser-ipc.md` §7 (layer model + "Critical Design Rules" + "What This Architecture Rejects").
- **Confidence**: HIGH (architecture derived from primary docs; not yet empirically validated end-to-end)
- **Implication for Aether**: This stack is the reference control-plane design. The differentiator is implementing it natively (gateway + audit at the engine level) rather than as a bolted-on adapter.

### Finding 8: IPC hardening does not stop semantic-layer prompt injection — the dominant unsolved threat
- **Description**: Sibling red-team and competitive research establish that traditional sandboxing isolates *processes*, while prompt injection manipulates the agent's *reasoning* within the sandbox — a category mismatch. Gartner recommended CISOs block autonomous AI browsers (Dec 2025); OpenAI's CISO called prompt injection "a frontier, unsolved security problem." No process-level IPC control closes this gap.
- **Evidence**: `docs/research-data/competitive/agent-infrastructure.md` (Finding 8) — https://www.wiz.io/blog/agentic-browser-security-2025-year-end-review ; https://mammothcyber.com/when-ai-agents-break-the-browser-sandbox-indirect-prompt-injection-tainted-memory-and-the-omnibus-lesson/ ; Brave agentic-browsing series — https://brave.com/series/security-privacy-in-agentic-browsing/
- **Confidence**: HIGH (multiple independent security sources)
- **Implication for Aether**: IPC scoping must be paired with semantic-layer defenses: per-agent capability grants, an alignment/second-model check (as Brave does), strict origin partitioning of agent context, and human-in-the-loop on sensitive actions.

---

## 3. Implied Aether Feature Candidates

| # | Feature | Category | JTBD | Why it follows from the research |
|---|---------|----------|------|----------------------------------|
| 1 | **Layered agent control plane (MCP→WebExtension gateway)** | AI & Agents | "Let an agent act in my browser without giving it the keys to everything" | Findings 1–7: only the layered stack is defensible; build the gateway natively. |
| 2 | **Per-agent capability permission system** (read tab / fill form / click / network — grant & revoke per agent) | Privacy & Security | "Grant an agent exactly the powers I choose, and take them back" | Findings 1,3,6 + whitespace §1.1 (no browser ships this). |
| 3 | **Sender-validated extension gateway with operation allowlist** | Developer Tools | "Ensure only vetted operations ever reach privileged browser APIs" | Finding 3: MessageSender validation + allowlisting is the core safety mechanism. |
| 4 | **Native agent action audit log / observability** (every MCP call → message → API call → result, timestamped) | Developer Tools | "Prove what the agent did and replay it for security review" | Findings 1,5 (no audit trail in CDP/Native Messaging) + competitive "EDR black box" gap. |
| 5 | **Xray-isolated content↔page bridge** (`exportFunction`/`cloneInto`, no `wrappedJSObject`) | Privacy & Security | "Read and act on a page without page scripts hijacking the agent" | Finding 4: strongest available isolation; Firefox-native. |
| 6 | **OS-sandboxed Native Messaging escape hatch** (AppArmor/seccomp + command allowlist + binary integrity) | Extensibility | "Reach OS-level capabilities (local model, files) without granting full user privilege" | Finding 5: powerful but must be aggressively sandboxed. |
| 7 | **Per-tool consent + human-in-the-loop for destructive actions** (elicitation on submit/payment/auth) | AI & Agents | "Stop the agent before it does something irreversible without me" | Finding 6: consent must be per-invocation; Finding 8: HITL mitigates injection. |
| 8 | **Semantic prompt-injection guard** (second alignment model + origin-partitioned agent context) | Privacy & Security | "Don't let a malicious page hijack my agent's reasoning" | Finding 8: IPC scoping alone insufficient; mirrors Brave's two-model approach. |

---

## 4. Competitive / Whitespace Notes

- **No browser ships a permission-gated agent runtime.** Brave AI Browsing (Nightly, June 2026) is closest — isolated profile + second-model alignment check, restricts internal/non-HTTPS pages — but runs as a single autonomous session, **not** a per-agent capability-grant runtime (whitespace §1.1). This is Aether's clearest control-plane wedge.
- **Retrofit tools are structurally stuck on CDP.** browser-use, Stagehand (v3 talks CDP directly), and most MCP browser servers wrap CDP/Playwright — inheriting CDP's no-auth/all-or-nothing model (Finding 1; competitive `agent-infrastructure.md`). A browser that exposes a **native, scoped agent API** sidesteps the entire class of problems retrofits cannot.
- **Playwright MCP and firefox-devtools-mcp validate the MCP + accessibility-tree direction** (token-efficient, deterministic) but neither adds capability scoping or per-tool consent. firefox-devtools-mcp uses Marionette/WebDriver BiDi and sets `navigator.webdriver=true` — a fingerprinting/detection liability Aether must avoid for normal browsing.
- **MCP-as-first-class-browser-protocol is open whitespace.** Chrome's WebMCP is *page-facing* (sites expose tools to agents), not *browser-facing* (browser connects to arbitrary tool servers natively) — whitespace §1.5. Aether can own the browser-facing side.
- **Observability is an unfilled enterprise gap.** AI browser actions are an "EDR black box" with no standard telemetry format (competitive Finding/pain point). A native, structured agent audit log is both a safety feature and an enterprise-distribution wedge (relevant given the red-team's "distribution is the existential bottleneck" finding).
- **Firefox engine choice gains a concrete technical justification here:** Xray `exportFunction`/`cloneInto` give safer agent content↔page isolation than Chromium's isolated worlds (which force the spoofable `window.postMessage`). This is a data point for the still-undecided engine question.

---

## 5. Risks

| # | Risk | Severity | Notes / Mitigation |
|---|------|----------|--------------------|
| 1 | **Indirect prompt injection is unsolved at the IPC layer** | Critical | Process-level scoping doesn't touch semantic-layer manipulation (Finding 8). Requires second-model alignment check, origin-partitioned context, HITL on sensitive actions. Even then, "frontier, unsolved" per OpenAI CISO. |
| 2 | **Renderer compromise defeats all content-script isolation** | High | Xray and isolated worlds both fall if the renderer is taken over (Spectre-class side channels; malicious page compromises renderer). Mitigate with site isolation, process-per-tab, memory-safe renderer components. |
| 3 | **Firefox-only dependency (Xray) ties control-plane design to engine choice** | High | If Aether targets Chromium, there is no `exportFunction`/`cloneInto` equivalent — content↔page sharing falls back to unsafe `window.postMessage`. Engine decision is a hard prerequisite for this design. |
| 4 | **Native Messaging binary substitution / privilege escalation** | High | No integrity verification; user-writable manifest path; full user privileges. A compromised host + prompt injection = arbitrary code execution. Mandate OS sandbox + read-only binary + strict allowlist. |
| 5 | **MCP enforces nothing — security is 100% implementor's burden** | High | "Cannot enforce at protocol level"; tool descriptions are an injection vector; consent UX undefined. All enforcement (allowlist, per-tool consent, validation) must be built by Aether, not assumed from MCP. |
| 6 | **WebDriver BiDi is a moving target** | Medium | Capability-scoping model unfinalized as of 2026. Betting on it for production agent control means building on shifting spec. Monitor, don't depend. |
| 7 | **Building a granular agent permission system is genuinely hard** | Medium | Whitespace analysis flags this gap may persist because the security model isn't solved, not from inertia. High engineering cost; risk of shipping a permission UI that gives false confidence. |
| 8 | **Composability multiplies attack surface** | Medium | Red-team assumption #10: every extension point / module is an attack vector. A scoped, audited gateway helps, but each new agent capability widens the surface — apply the same kill-features-early discipline. |
| 9 | **Research gap: no 2026-specific CVE / spec-progress scan** | Low-Medium | Provenance notes web search was blocked; brief rests on primary docs only. Re-run with live search to catch new BiDi/MCP security features and recent CVEs before committing the design. |

---

## Sources

| # | Source | URL |
|---|--------|-----|
| 1 | Chrome DevTools Protocol (docs) | https://chromedevtools.github.io/devtools-protocol/ |
| 2 | WebDriver BiDi W3C Specification | https://w3c.github.io/webdriver-bidi/ |
| 3 | WebDriver BiDi — Chrome for Developers | https://developer.chrome.com/blog/webdriver-bidi |
| 4 | MDN: runtime.sendMessage() | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage |
| 5 | MDN: Content Scripts | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts |
| 6 | MDN: Sharing Objects with Page Scripts | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts |
| 7 | Chrome: Message Passing | https://developer.chrome.com/docs/extensions/develop/concepts/messaging |
| 8 | Chrome: Native Messaging | https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging |
| 9 | Chrome: Stay Secure (Extension Security) | https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure |
| 10 | Firefox Source Docs: Xray Vision | https://firefox-source-docs.mozilla.org/dom/scriptSecurity/xray_vision.html |
| 11 | MCP Specification (2025-03-26) | https://modelcontextprotocol.io/specification/2025-03-26 |
| 12 | MCP Transports Specification | https://modelcontextprotocol.io/specification/2025-03-26/basic/transports |
| 13 | MCP Architecture Overview | https://modelcontextprotocol.io/docs/concepts/architecture |
| 14 | Competitive: Browser Agent Infrastructure (v1) | docs/research-data/competitive/agent-infrastructure.md |
| 15 | Wiz: Agentic Browser Security 2025 Year-End Review | https://www.wiz.io/blog/agentic-browser-security-2025-year-end-review |
| 16 | Brave: Security & Privacy in Agentic Browsing | https://brave.com/series/security-privacy-in-agentic-browsing/ |
