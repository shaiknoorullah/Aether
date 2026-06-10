# Agent-Safe Browser Control and IPC for AI-Native Browsers (2026)

## Executive Summary

AI-native browsers need to let AI agents drive browser actions — navigate, read DOM, fill forms, intercept networks, execute scripts — without creating catastrophic security holes. This brief analyzes six IPC/control mechanisms (CDP, WebDriver BiDi, WebExtension messaging, Firefox Xray wrappers, Native Messaging Hosts, and MCP) through the lens of agent safety: sandboxing, permission scoping, spoofing resistance, and injection risk.

**Core finding:** No single mechanism is agent-safe on its own. The safest architecture is a layered defense:

1. **WebExtension messaging** as the primary agent IPC channel (sender-validated, permission-scoped, sandboxed) [4][7]
2. **Firefox Xray wrappers** (`exportFunction`/`cloneInto`) for content script ↔ page communication (prevents page-script prototype poisoning) [6][10]
3. **Native Messaging Host** as an optional OS bridge (sandboxed with AppArmor/seccomp, limited to specific operations) [8]
4. **MCP** as the agent-facing protocol layer (provides consent/authorization framework on top of the above) [11]
5. **CDP and WebDriver BiDi avoided for production agent control** (no auth, all-or-nothing access, designed for dev/test) [1][3]

---

## 1. Chrome DevTools Protocol (CDP)

### Overview

CDP is Chromium's internal instrumentation protocol, providing full access to DOM, Network, Debugger, Page, Runtime, and dozens of other domains via JSON messages over WebSocket [1]. Originally built for Chrome DevTools, it has become the de facto protocol for browser automation tools (Puppeteer, Playwright).

### Security Posture

**Risk Level: CRITICAL for agent use**

| Property | Assessment |
|----------|-----------|
| Authentication | **None.** Any process that can connect to the WebSocket endpoint has full access [1]. |
| Authorization / Capability Scoping | **None.** Connection grants access to all protocol domains. No way to restrict an agent to read-only DOM or deny network interception [1]. |
| Transport Security | **None by default.** Debug port listens on localhost, but any local process (including malware) can connect. Remote exposure (`--remote-debugging-port` on 0.0.0.0) is catastrophic [1]. |
| Spoofing Resistance | **Low.** The HTTP endpoints `/json/version`, `/json/list` expose WebSocket URLs to any local HTTP client [1]. |
| Injection Risk | **Critical.** `Runtime.evaluate` allows arbitrary JS execution in any page context. `Page.navigate` can redirect to any URL. `Network.setRequestInterception` can modify any request [1]. |

### Key Risks for Agent Use

1. **No capability scoping**: An AI agent connected via CDP can do anything the protocol allows — read cookies, capture screenshots, execute arbitrary JS, intercept network traffic. There is no mechanism to grant "read DOM only" or "navigate but don't execute scripts" [1].

2. **Debug port exposure**: The `--remote-debugging-port` flag opens an unauthenticated WebSocket. Any process on the same machine can connect. If bound to 0.0.0.0, any network-reachable host can take over the browser. Multiple simultaneous clients have been supported since Chrome 63 [1].

3. **No audit trail**: CDP has no built-in logging of which commands were issued by which client. An agent could perform actions with no accountability.

### Verdict

CDP should **not** be used as the control channel for production AI agent browser integration. It was designed for developer tools and testing, not for multi-tenant agent access with least-privilege constraints. Chrome's own blog states: "Chromium-based browsers will continue to use CDP for debugging purposes, while WebDriver BiDi is the new specification to address the testing needs" [3].

---

## 2. WebDriver BiDi

### Overview

WebDriver BiDi is a W3C standard under active development by the Browser Tools & Testing Working Group, which includes all major browser vendors [2][3]. It combines the cross-browser compatibility of WebDriver "Classic" with CDP-like bidirectional messaging.

### Security Posture

**Risk Level: HIGH for agent use (improving)**

| Property | Assessment |
|----------|-----------|
| Authentication | **Protocol-level auth not yet standardized.** Relies on transport security (e.g., the WebDriver session setup flow) [2]. |
| Authorization / Capability Scoping | **Emerging.** The spec is defining capability negotiation during session creation, but granular permission scoping (e.g., "no script execution") is not yet in the specification as of 2026 [2]. |
| Cross-Browser Support | **Strong.** Chrome, Firefox, Edge, Safari all participating in implementation [3]. |
| Transport | WebSocket-based bidirectional communication [3]. |
| Injection Risk | **High.** Like CDP, BiDi provides script evaluation and DOM manipulation capabilities [2]. |

### Key Risks for Agent Use

1. **Still maturing**: The spec is under active development. The capability negotiation model is not finalized [2]. Relying on it for production agent control in 2026 means building on a moving target.

2. **Designed for testing, not agent sandboxing**: BiDi's primary use case is test automation. The Chrome blog FAQ explicitly states BiDi is not replacing CDP and is aimed at "testing needs" [3].

3. **Improvement over CDP**: BiDi is cross-browser and W3C-standardized, with a proper session lifecycle. But it does not yet offer the granular capability restrictions needed for safe agent control [2].

### Verdict

WebDriver BiDi is the right long-term direction for cross-browser automation standards, but it is **not yet suitable as the primary agent control channel** for a privacy-first browser. It lacks fine-grained permission scoping and is explicitly positioned as a testing protocol [3]. Monitor the spec for capability restriction features.

---

## 3. WebExtension Messaging

### Overview

The WebExtension messaging API (`runtime.sendMessage`, `runtime.connect`, `tabs.sendMessage`, `tabs.connect`) provides structured IPC between extension components: background/service worker, content scripts, popup/sidebar pages, and optionally other extensions and web pages [4][7].

### Security Posture

**Risk Level: MEDIUM — the best available option for agent IPC**

| Property | Assessment |
|----------|-----------|
| Authentication | **Implicit via extension identity.** Messages between extension components are internal. Cross-extension messaging uses `runtime.onMessageExternal` with sender ID validation [7]. Web page messaging requires `externally_connectable` manifest declaration [9]. |
| Authorization / Capability Scoping | **Extension permissions model.** Content scripts can only access a limited WebExtension API subset [5]. Background scripts have full API access but can validate and restrict what content script messages trigger. Host permissions scope which sites the extension can interact with [9]. |
| Sender Validation | **MessageSender object** provides `tab.id`, `tab.url`, `frameId`, `id` (extension ID) [7]. Background scripts can validate the sender before acting on messages [9]. |
| Spoofing Resistance | **Medium-High.** Web pages cannot send messages to an extension unless `externally_connectable` explicitly allows it [9]. Content scripts use `runtime.sendMessage` which is internal to the extension, not accessible from page scripts [5]. However, a compromised renderer could potentially forge content script messages [9]. |
| Injection Risk | **Low-Medium.** Messages are JSON-serialized (Chrome) or structured-clone (Firefox) [7]. No direct code execution — the receiving end decides what to do with the message. |
| Restricted Domains | Extensions cannot inject content scripts into browser-internal pages (about:addons, about:debugging, etc.) [5]. |

### Key Advantages for Agent IPC

1. **Layered permission model**: The extension manifest declares host permissions, API permissions, and CSP [9]. Content scripts get minimal API access [5]. The background script acts as a privileged gateway that validates all messages before performing privileged operations.

2. **Sender verification**: Every message carries a `MessageSender` object. The background script should validate `sender.tab.id`, `sender.url`, and `sender.id` before processing. This is explicitly recommended by Chrome's security documentation [9].

3. **No direct code execution**: Unlike CDP's `Runtime.evaluate`, receiving a WebExtension message doesn't execute code. The handler decides what action to take, enabling allowlisting of permitted operations [7].

4. **Content script isolation**: Both Firefox (Xray vision) and Chromium (isolated worlds) prevent page scripts from interfering with content script execution, though through different mechanisms [5].

### Key Risks

1. **Content scripts are less trustworthy**: Chrome's official security guidance states: "Content scripts are the only part of an extension that interacts directly with the web page. Because of this, hostile web pages may manipulate parts of the DOM the content script depends on" [9]. Messages from content scripts should be treated as potentially attacker-crafted [7].

2. **Renderer compromise**: "To interact with DOM of web pages, content scripts need to execute in the same renderer process as the web page. This makes content scripts vulnerable to leaking data via side channel attacks (e.g., Spectre), and to being taken over by an attacker if a malicious web page compromises the renderer process" [9].

3. **Spectre-class side channels**: Content scripts execute in the same renderer process as page scripts, making them potentially vulnerable to speculative execution attacks [9].

4. **`window.postMessage` is dangerous**: The MDN docs explicitly warn: "Be very careful when interacting with untrusted web content in this manner! Extensions are privileged code which can have powerful capabilities and hostile web pages can easily trick them into accessing those capabilities" [5].

### Verdict

WebExtension messaging is **the strongest candidate for agent IPC** in an AI-native browser. It provides sender validation, permission scoping, and isolation between privilege levels [4][7][9]. The critical design rule: **never trust content script messages without validation in the background script, and never use `window.postMessage` for security-sensitive communication** [5][9].

---

## 4. Firefox Xray Wrappers (`exportFunction` / `cloneInto`)

### Overview

Firefox implements "Xray vision" — a security mechanism where privileged code (content scripts, chrome code) sees only the native C++ representation of DOM objects, not any JavaScript modifications made by page scripts [10].

### How It Works

- **Xray vision**: When a content script accesses `window`, it sees the original native DOM — any expandos added by page scripts are invisible, any redefined built-in methods return the original implementation. The implementation "directly accesses the C++ representation of the original object, and doesn't go to the content's JavaScript reflection at all" [10].

- **`exportFunction(func, targetScope, options)`**: Exports a function from the content script's scope into the page script's scope. The page can call the function, but the function executes with content script privileges and can use `runtime.sendMessage` to communicate back to the extension [6].

- **`cloneInto(obj, targetScope, options)`**: Creates a structured clone of an object in the target scope. By default, functions are excluded. The `cloneFunctions: true` option explicitly opts in to exporting callable functions [6].

### Security Posture

**Risk Level: LOW — excellent isolation for content ↔ page communication**

| Property | Assessment |
|----------|-----------|
| Prototype Poisoning Protection | **Strong.** Xray bypasses JS reflection entirely, accessing C++ DOM representation [10]. Redefined `window.confirm`, `document.getElementById`, etc. are invisible to content scripts. |
| Expando Isolation | **Strong.** Properties added by page scripts to DOM objects are invisible through Xray [10]. |
| Function Export Safety | **Medium-High.** `exportFunction` lets page scripts call a content-script function, but the function runs in the content script's scope [6]. The content script controls what happens. |
| Waiver Risk | **Medium.** `wrappedJSObject` and `Components.utils.waiveXrays` disable Xray protection. "Waivers are transitive: so if you waive Xray vision for an object, then you automatically waive it for all the object's properties" [10]. |
| Firefox-Only | **Yes.** This is a Firefox/Gecko-specific mechanism. Chromium uses "isolated worlds" which provide similar isolation but through a different mechanism and without `exportFunction`/`cloneInto` [5]. |

### Comparison: Firefox Xray vs Chromium Isolated Worlds

| Feature | Firefox Xray | Chromium Isolated World |
|---------|-------------|------------------------|
| Mechanism | C++ representation bypass [10] | Separate V8 world with own global [5] |
| Page variable visibility | Invisible (Xray) [10] | Invisible (separate world) [5] |
| DOM access | Shared DOM, native view [10] | Shared DOM, separate JS objects [5] |
| Object sharing with page | `exportFunction`/`cloneInto` [6] | Not directly supported (use `window.postMessage`) [5] |
| Prototype poisoning defense | Native C++ access [10] | Separate prototype chains [5] |
| `eval()` context | `window.eval()` runs in page context (Firefox) [5] | `eval()` always in content script context [5] |

### Key Risks

1. **Xray waiver is transitive**: "Unwrapping is transitive: when you use wrappedJSObject, any properties of the unwrapped object are themselves unwrapped (and therefore unreliable)" [6]. A single careless waiver can expose the entire DOM to page-script manipulation.

2. **`window.eval()` in Firefox runs in page context**: Unlike Chrome where `eval()` always runs in the content script's isolated world, Firefox's `window.eval()` executes in the page's context [5]. This is a footgun for developers who don't understand the distinction.

3. **Firefox-only**: Any architecture relying on Xray wrappers is Firefox-fork-only. If the browser engine decision hasn't been made, this is a significant commitment.

### Verdict

For a Firefox-based AI-native browser, Xray wrappers with `exportFunction`/`cloneInto` provide **the strongest available mechanism** for content script ↔ page communication [6][10]. The key rule: **never waive Xrays (`wrappedJSObject`) in agent-facing code**, and always use `exportFunction` to expose a minimal, validated API surface to page scripts.

---

## 5. Native Messaging Hosts

### Overview

Native Messaging allows a browser extension to communicate with a native application installed on the user's computer. The browser launches the native application as a subprocess and communicates via stdin/stdout using a length-prefixed JSON protocol [8].

### Security Posture

**Risk Level: HIGH — powerful but dangerous without OS-level sandboxing**

| Property | Assessment |
|----------|-----------|
| Authentication | **Manifest-based.** The native messaging host manifest specifies `allowed_origins` (extension IDs that may connect) [8]. The native host receives the caller's extension origin as its first command-line argument [8]. |
| Binary Verification | **None.** The manifest specifies a path to the binary. There is no signature verification, hash checking, or integrity validation [8]. If the binary at the path is replaced, the browser will execute the replacement. |
| Privilege Level | **Full user privileges.** The native messaging host process inherits the privileges of the user running the browser [8]. It can read/write files, make network requests, launch other processes — anything the user can do. |
| Isolation | **None by default.** The host process runs with no sandboxing unless the deployer explicitly uses OS-level mechanisms (AppArmor, SELinux, seccomp, macOS sandbox-exec). |
| Message Size | "The maximum size of a single message from the native messaging host is 1 MB" [8]; 64 MiB max from extension → host [8]. |
| Availability | **Not available from content scripts.** Only extension pages and service workers can use `runtime.connectNative()` / `runtime.sendNativeMessage()` [8]. |

### Key Risks for Agent Use

1. **Binary substitution**: An attacker with write access to the native messaging host binary path can replace it with malicious code. The browser performs no integrity check [8]. On Linux, the user-level host manifest is at `~/.config/google-chrome/NativeMessagingHosts/` (Chrome) or equivalent Firefox paths — writable by the user [8].

2. **Privilege escalation**: A compromised native messaging host has full user privileges. If the AI agent can trigger arbitrary operations through the native host, a prompt injection attack could lead to file system access, credential theft, or arbitrary code execution.

3. **No audit logging**: There is no built-in mechanism to log what messages were sent to/from the native host or what operations it performed.

4. **stdin/stdout manipulation**: The protocol is simple length-prefixed JSON over stdio [8]. There is no encryption, no message signing, and no protection against a local attacker intercepting the pipe (though this requires process-level access).

### Mitigations

1. **OS-level sandboxing**: Deploy the native host with AppArmor (Linux), seccomp-bpf, or macOS sandbox profiles that restrict file system access, network access, and process launching to exactly what the host needs.

2. **Binary integrity**: Use a read-only filesystem mount, dm-verity, or a systemd-protected path for the host binary. On macOS, code signing can provide some verification.

3. **Allowlisted operations**: The native host should implement a strict command allowlist. Never pass agent-generated strings directly to shell commands, file paths, or SQL queries.

4. **Minimal privilege**: Run the native host as a restricted user or in a container with no network access if OS-level operations are limited to local computation.

### Verdict

Native Messaging is **useful but dangerous** for AI agent integration. It should be treated as an **optional escape hatch** for operations that genuinely require OS-level access (e.g., local model inference, file system operations) [8]. It must be aggressively sandboxed at the OS level, and the host binary must implement a strict operation allowlist. The extension should never forward raw agent requests to the native host.

---

## 6. Model Context Protocol (MCP)

### Overview

MCP is an open protocol (JSON-RPC 2.0 based) developed by Anthropic that standardizes how LLM applications connect to external data sources and tools [11]. It defines a host → client → server architecture where MCP servers expose tools, resources, and prompts that AI agents can use [13].

### MCP for Browser Control

MCP does not directly control browsers. It is a **meta-protocol** that layers over existing browser control mechanisms. MCP browser servers (e.g., Playwright MCP server, browser-use) typically use CDP or Playwright (which uses CDP/BiDi internally) to execute browser actions, then expose those actions as MCP tools.

The architecture is:

```
AI Agent (Host) → MCP Client → MCP Server (browser tools) → CDP/BiDi/Extension → Browser
```

### Security Model

**Risk Level: MEDIUM — provides framework but no enforcement**

| Property | Assessment |
|----------|-----------|
| User Consent | **Required by spec.** "Users must explicitly consent to and understand all data access and operations" [11]. But enforcement is left to implementors. |
| Tool Safety | **Spec acknowledges risk.** "Tools represent arbitrary code execution and must be treated with appropriate caution" [11]. Tool descriptions/annotations "should be considered untrusted, unless obtained from a trusted server" [11]. |
| Authentication | **Transport-dependent.** stdio transport has no auth (local subprocess). Streamable HTTP supports standard HTTP auth (bearer tokens, OAuth) [12]. |
| Authorization / Capability Scoping | **Not protocol-enforced.** The spec states: "While MCP itself cannot enforce these security principles at the protocol level, implementors SHOULD" build appropriate flows [11]. |
| Prompt Injection | **Acknowledged risk.** MCP tools are invoked by LLMs based on descriptions. Malicious or misleading tool descriptions can manipulate agent behavior. The spec says tool annotations "should be considered untrusted" [11]. |
| Transport Security | **Streamable HTTP:** "Servers MUST validate the Origin header on all incoming connections to prevent DNS rebinding attacks" [12]. Should bind to localhost for local servers [12]. **stdio:** No encryption (local process pipe). |
| Session Management | Optional Mcp-Session-Id header for stateful sessions. Should be cryptographically secure [12]. |

### Key Risks for Agent-Driven Browser Control via MCP

1. **MCP inherits the risks of its underlying protocol**: If an MCP browser server uses CDP internally, all of CDP's security problems (no auth, all-or-nothing access, arbitrary JS execution) are present. MCP doesn't add sandboxing — it adds a JSON-RPC wrapper.

2. **Tool description manipulation (indirect prompt injection)**: An MCP server exposes tools with descriptions that the LLM uses to decide when/how to call them. A malicious or compromised MCP server can craft descriptions that trick the agent into performing unintended actions [11].

3. **No protocol-level enforcement**: MCP's security section explicitly states: "While MCP itself cannot enforce these security principles at the protocol level, implementors SHOULD..." [11]. This means security depends entirely on implementation quality.

4. **Consent UX is undefined**: The spec requires user consent but doesn't define what consent looks like [11]. An implementor could satisfy the spec with a "click OK to allow all tools" dialog, providing no meaningful security.

### What MCP Adds

Despite limitations, MCP provides a valuable **structural framework**:

1. **Tool enumeration**: Agents can discover available tools via `tools/list` rather than having unconstrained protocol access [13].
2. **Structured invocation**: Tool calls are explicit JSON-RPC requests with typed parameters, not raw protocol commands [11]. This enables logging, validation, and allowlisting at the MCP layer.
3. **Consent integration point**: The spec defines where consent should be checked (before tool invocation, before LLM sampling), giving implementors clear hooks [11].
4. **Human-in-the-loop**: The spec's "elicitation" primitive allows servers to request user input/confirmation for destructive actions [13].

### Verdict

MCP is **the right abstraction layer** for agent-facing browser control, but it must sit on top of a secure foundation [11][13]. Using MCP → CDP directly is insecure. The recommended architecture is MCP → WebExtension messaging → controlled browser APIs, with MCP providing the consent/authorization framework and the extension providing the sandboxing.

---

## 7. Recommended Architecture for Agent-Safe Browser Control

Based on the analysis above, the safest layered architecture for an AI-native browser is:

### Layer Model

```
┌─────────────────────────────────────────────────┐
│  Layer 4: AI Agent (LLM)                        │
│  Protocol: MCP (JSON-RPC 2.0) [11][12]          │
│  Role: Tool discovery, consent, structured       │
│        invocation, human-in-the-loop             │
├─────────────────────────────────────────────────┤
│  Layer 3: MCP Server / Extension Background      │
│  Protocol: WebExtension messaging (ports) [4][7] │
│  Role: Operation allowlist, sender validation,   │
│        rate limiting, audit logging               │
├─────────────────────────────────────────────────┤
│  Layer 2: Content Scripts                         │
│  Protocol: runtime.sendMessage / exportFunction  │
│  Isolation: Xray vision (Firefox) [10] /         │
│            Isolated worlds (Chromium) [5]         │
├─────────────────────────────────────────────────┤
│  Layer 1: Browser Engine                          │
│  APIs: WebExtension APIs (tabs, scripting,       │
│        webRequest, etc.)                          │
│  Restrictions: Host permissions, CSP [9]          │
├─────────────────────────────────────────────────┤
│  Layer 0 (Optional): Native Messaging Host [8]   │
│  Protocol: stdio (length-prefixed JSON)          │
│  Sandboxing: AppArmor / seccomp / macOS sandbox  │
└─────────────────────────────────────────────────┘
```

### Security Properties by Layer

| Layer | What Agent Can Do | What Agent Cannot Do | Spoofing Defense |
|-------|------------------|---------------------|------------------|
| 4 (MCP) | Discover tools, request operations [13] | Execute raw browser commands | Tool descriptions validated by host [11] |
| 3 (Extension BG) | Validated operations from allowlist [7] | Anything not in allowlist | MessageSender validation [9], rate limiting |
| 2 (Content Script) | Read DOM, limited page interaction [5] | Access cookies, intercept network, execute arbitrary JS | Xray vision [10] / isolated worlds [5] |
| 1 (Browser APIs) | Operations matching host permissions [9] | Access to restricted domains, privileged pages | Browser-enforced permission model [5] |
| 0 (Native Host) | Sandboxed OS operations [8] | Anything outside sandbox profile | Extension-only access [8], binary integrity |

### Critical Design Rules

1. **Never expose CDP/BiDi directly to agents.** All browser operations must flow through the WebExtension messaging channel with an operation allowlist [1][7].

2. **Treat all content script messages as untrusted.** The background script must validate `sender.tab.id`, `sender.url`, and message format before performing any privileged operation [9].

3. **Never use `window.postMessage` for agent IPC.** It is spoofable by any page script [5]. Use `runtime.sendMessage` (content script → background) [4] and `exportFunction` (content script → page, Firefox only) [6].

4. **Never waive Xray protection in agent code.** No `wrappedJSObject` access in agent-facing content scripts [6][10]. Use `exportFunction`/`cloneInto` for all cross-boundary object sharing.

5. **Sandbox native messaging hosts aggressively.** AppArmor profiles, seccomp-bpf, read-only binary mounts. The host implements a strict command allowlist — no shell execution, no arbitrary file paths [8].

6. **Implement MCP consent at the tool level, not the session level.** Each tool invocation should be independently authorizable [11]. Destructive operations (form submission, payment, account actions) require explicit user confirmation via MCP's elicitation primitive [13].

7. **Log everything.** Every agent action (MCP tool call → extension message → browser API call → result) must be logged with timestamps, creating an auditable chain of actions.

### What This Architecture Rejects

| Mechanism | Status | Reason |
|-----------|--------|--------|
| CDP direct agent access | **REJECTED** | No auth, no scoping, arbitrary execution [1] |
| WebDriver BiDi direct agent access | **REJECTED** | Still maturing, designed for testing not agent sandboxing [2][3] |
| `window.postMessage` for agent IPC | **REJECTED** | Spoofable by any page script [5] |
| Marionette / WebDriver BiDi internal | **REJECTED** | Extreme risk; full browser control with no permission model |
| `wrappedJSObject` in agent code | **REJECTED** | Transitive Xray waiver defeats content script isolation [6][10] |

---

## 8. Open Questions

1. **WebDriver BiDi capability restrictions**: Will the W3C spec eventually define fine-grained capability scoping (e.g., "read DOM only", "no script execution")? If so, BiDi could become suitable for agent control. Monitor the spec [2].

2. **MCP authorization extensions**: Will MCP gain protocol-level capability restrictions beyond the current "implementors SHOULD" guidance [11]? The current spec leaves too much to implementor discretion.

3. **Chromium equivalent of exportFunction/cloneInto**: If Aether targets Chromium, how do we achieve equivalent content ↔ page communication safety without Firefox's Xray wrappers? The isolated world model prevents direct object sharing, forcing reliance on the unsafe `window.postMessage` [5].

4. **Renderer process compromise**: All content script isolation (Xray, isolated worlds) is defeated if the renderer process is compromised [9]. What additional mitigations exist? (Site isolation, process-per-tab, memory-safe languages in the renderer.)

5. **AI agent behavioral sandboxing**: Beyond IPC-level controls, how do we constrain what an AI agent *chooses* to do? Tool-level consent helps [11] but doesn't prevent subtle manipulation (e.g., an agent reading sensitive data and encoding it in seemingly benign actions).

---

## Sources

| # | Source | URL |
|---|--------|-----|
| 1 | Chrome DevTools Protocol (official docs) | https://chromedevtools.github.io/devtools-protocol/ |
| 2 | WebDriver BiDi W3C Specification | https://w3c.github.io/webdriver-bidi/ |
| 3 | WebDriver BiDi Blog — Chrome for Developers | https://developer.chrome.com/blog/webdriver-bidi |
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
