# Agent-Safe Browser Control and IPC for AI-Native Browsers (2026)

## Executive Summary

AI-native browsers need to let AI agents drive browser actions — navigate, read DOM, fill forms, intercept networks, execute scripts — without creating catastrophic security holes. This brief analyzes six IPC/control mechanisms (CDP, WebDriver BiDi, WebExtension messaging, Firefox Xray wrappers, Native Messaging Hosts, and MCP) through the lens of agent safety: sandboxing, permission scoping, spoofing resistance, and injection risk.

**Core finding:** No single mechanism is agent-safe on its own. The safest architecture is a layered defense:

1. **WebExtension messaging** as the primary agent IPC channel (sender-validated, permission-scoped, sandboxed)
2. **Firefox Xray wrappers** (`exportFunction`/`cloneInto`) for content script ↔ page communication (prevents page-script prototype poisoning)
3. **Native Messaging Host** as an optional OS bridge (sandboxed with AppArmor/seccomp, limited to specific operations)
4. **MCP** as the agent-facing protocol layer (provides consent/authorization framework on top of the above)
5. **CDP and WebDriver BiDi avoided for production agent control** (no auth, all-or-nothing access, designed for dev/test)

---

## 1. Chrome DevTools Protocol (CDP)

### Overview

CDP is Chromium's internal instrumentation protocol, providing full access to DOM, Network, Debugger, Page, Runtime, and dozens of other domains via JSON messages over WebSocket. Originally built for Chrome DevTools, it has become the de facto protocol for browser automation tools (Puppeteer, Playwright).

### Security Posture

**Risk Level: CRITICAL for agent use**

| Property | Assessment |
|----------|-----------|
| Authentication | **None.** Any process that can connect to the WebSocket endpoint has full access. |
| Authorization / Capability Scoping | **None.** Connection grants access to all protocol domains. No way to restrict an agent to read-only DOM or deny network interception. |
| Transport Security | **None by default.** Debug port listens on localhost, but any local process (including malware) can connect. Remote exposure (`--remote-debugging-port` on 0.0.0.0) is catastrophic. |
| Spoofing Resistance | **Low.** The HTTP endpoints `/json/version`, `/json/list` expose WebSocket URLs to any local HTTP client. |
| Injection Risk | **Critical.** `Runtime.evaluate` allows arbitrary JS execution in any page context. `Page.navigate` can redirect to any URL. `Network.setRequestInterception` can modify any request. |

### Key Risks for Agent Use

1. **No capability scoping**: An AI agent connected via CDP can do anything the protocol allows — read cookies, capture screenshots, execute arbitrary JS, intercept network traffic. There is no mechanism to grant "read DOM only" or "navigate but don't execute scripts."

2. **Debug port exposure**: The `--remote-debugging-port` flag opens an unauthenticated WebSocket. Any process on the same machine can connect. If bound to 0.0.0.0, any network-reachable host can take over the browser. Multiple simultaneous clients have been supported since Chrome 63.

3. **No audit trail**: CDP has no built-in logging of which commands were issued by which client. An agent could perform actions with no accountability.

### Verdict

CDP should **not** be used as the control channel for production AI agent browser integration. It was designed for developer tools and testing, not for multi-tenant agent access with least-privilege constraints. Chrome's own documentation positions WebDriver BiDi as the future for testing automation, with CDP continuing only for debugging.

---

## 2. WebDriver BiDi

### Overview

WebDriver BiDi is a W3C standard under active development by the Browser Tools & Testing Working Group, which includes all major browser vendors. It combines the cross-browser compatibility of WebDriver "Classic" with CDP-like bidirectional messaging.

### Security Posture

**Risk Level: HIGH for agent use (improving)**

| Property | Assessment |
|----------|-----------|
| Authentication | **Protocol-level auth not yet standardized.** Relies on transport security (e.g., the WebDriver session setup flow). |
| Authorization / Capability Scoping | **Emerging.** The spec is defining capability negotiation during session creation, but granular permission scoping (e.g., "no script execution") is not yet in the specification as of 2026. |
| Cross-Browser Support | **Strong.** Chrome, Firefox, Edge, Safari all participating in implementation. |
| Transport | WebSocket-based bidirectional communication. |
| Injection Risk | **High.** Like CDP, BiDi provides script evaluation and DOM manipulation capabilities. |

### Key Risks for Agent Use

1. **Still maturing**: The spec is under active development. The capability negotiation model is not finalized. Relying on it for production agent control in 2026 means building on a moving target.

2. **Designed for testing, not agent sandboxing**: Like CDP, BiDi's primary use case is test automation. The permission model is oriented around "what can the test framework do" not "what should we restrict an AI agent from doing."

3. **Improvement over CDP**: BiDi is cross-browser and W3C-standardized, with a proper session lifecycle. But it does not yet offer the granular capability restrictions needed for safe agent control.

### Verdict

WebDriver BiDi is the right long-term direction for cross-browser automation standards, but it is **not yet suitable as the primary agent control channel** for a privacy-first browser. It lacks fine-grained permission scoping and is explicitly positioned as a testing protocol. Monitor the spec for capability restriction features.

---

## 3. WebExtension Messaging

### Overview

The WebExtension messaging API (`runtime.sendMessage`, `runtime.connect`, `tabs.sendMessage`, `tabs.connect`) provides structured IPC between extension components: background/service worker, content scripts, popup/sidebar pages, and optionally other extensions and web pages.

### Security Posture

**Risk Level: MEDIUM — the best available option for agent IPC**

| Property | Assessment |
|----------|-----------|
| Authentication | **Implicit via extension identity.** Messages between extension components are internal. Cross-extension messaging uses `runtime.onMessageExternal` with sender ID validation. Web page messaging requires `externally_connectable` manifest declaration. |
| Authorization / Capability Scoping | **Extension permissions model.** Content scripts can only access a limited WebExtension API subset. Background scripts have full API access but can validate and restrict what content script messages trigger. Host permissions scope which sites the extension can interact with. |
| Sender Validation | **MessageSender object** provides `tab.id`, `tab.url`, `frameId`, `id` (extension ID). Background scripts can validate the sender before acting on messages. |
| Spoofing Resistance | **Medium-High.** Web pages cannot send messages to an extension unless `externally_connectable` explicitly allows it. Content scripts use `runtime.sendMessage` which is internal to the extension, not accessible from page scripts. However, a compromised renderer could potentially forge content script messages. |
| Injection Risk | **Low-Medium.** Messages are JSON-serialized (Chrome) or structured-clone (Firefox). No direct code execution — the receiving end decides what to do with the message. |
| Restricted Domains | Extensions cannot inject content scripts into browser-internal pages (about:addons, about:debugging, etc.) |

### Key Advantages for Agent IPC

1. **Layered permission model**: The extension manifest declares host permissions, API permissions, and CSP. Content scripts get minimal API access. The background script acts as a privileged gateway that validates all messages before performing privileged operations.

2. **Sender verification**: Every message carries a `MessageSender` object. The background script should validate `sender.tab.id`, `sender.url`, and `sender.id` before processing. This is explicitly recommended by Chrome's security documentation.

3. **No direct code execution**: Unlike CDP's `Runtime.evaluate`, receiving a WebExtension message doesn't execute code. The handler decides what action to take, enabling allowlisting of permitted operations.

4. **Content script isolation**: Both Firefox (Xray vision) and Chromium (isolated worlds) prevent page scripts from interfering with content script execution, though through different mechanisms.

### Key Risks

1. **Content scripts are less trustworthy**: Chrome's official security guidance states that "a malicious web page might be able to compromise the rendering process that runs the content scripts." Messages from content scripts should be treated as potentially attacker-crafted.

2. **Renderer compromise**: If the renderer process is compromised (e.g., via a browser exploit), the attacker could forge content script messages. This is a fundamental limitation of any in-process isolation.

3. **Spectre-class side channels**: Content scripts execute in the same renderer process as page scripts, making them potentially vulnerable to speculative execution attacks.

4. **`window.postMessage` is dangerous**: The MDN docs explicitly warn against using `window.postMessage` for content script ↔ page communication. It is spoofable — any script on the page can send messages. If used, the `event.source` must be checked and the message format must be unpredictable.

### Verdict

WebExtension messaging is **the strongest candidate for agent IPC** in an AI-native browser. It provides sender validation, permission scoping, and isolation between privilege levels. The critical design rule: **never trust content script messages without validation in the background script, and never use `window.postMessage` for security-sensitive communication.**

---

## 4. Firefox Xray Wrappers (`exportFunction` / `cloneInto`)

### Overview

Firefox implements "Xray vision" — a security mechanism where privileged code (content scripts, chrome code) sees only the native C++ representation of DOM objects, not any JavaScript modifications made by page scripts. `exportFunction` and `cloneInto` are companion APIs that allow content scripts to safely share functions and objects with page scripts.

### How It Works

- **Xray vision**: When a content script accesses `window`, it sees the original native DOM — any expandos added by page scripts are invisible, any redefined built-in methods return the original implementation. This is implemented by short-circuiting the JavaScript reflection and accessing the C++ representation directly.

- **`exportFunction(func, targetScope, options)`**: Exports a function from the content script's scope into the page script's scope. The page can call the function, but the function executes with content script privileges and can use `runtime.sendMessage` to communicate back to the extension.

- **`cloneInto(obj, targetScope, options)`**: Creates a structured clone of an object in the target scope. By default, functions are excluded. The `cloneFunctions: true` option explicitly opts in to exporting callable functions.

### Security Posture

**Risk Level: LOW — excellent isolation for content ↔ page communication**

| Property | Assessment |
|----------|-----------|
| Prototype Poisoning Protection | **Strong.** Xray bypasses JS reflection entirely, accessing C++ DOM representation. Redefined `window.confirm`, `document.getElementById`, etc. are invisible to content scripts. |
| Expando Isolation | **Strong.** Properties added by page scripts to DOM objects are invisible through Xray. |
| Function Export Safety | **Medium-High.** `exportFunction` lets page scripts call a content-script function, but the function runs in the content script's scope. The content script controls what happens. |
| Waiver Risk | **Medium.** `wrappedJSObject` and `Components.utils.waiveXrays` disable Xray protection. Waivers are transitive — waiving on `window` waives on all its properties. |
| Firefox-Only | **Yes.** This is a Firefox/Gecko-specific mechanism. Chromium uses "isolated worlds" which provide similar isolation but through a different mechanism and without `exportFunction`/`cloneInto`. |

### Comparison: Firefox Xray vs Chromium Isolated Worlds

| Feature | Firefox Xray | Chromium Isolated World |
|---------|-------------|------------------------|
| Mechanism | C++ representation bypass | Separate V8 world with own global |
| Page variable visibility | Invisible (Xray) | Invisible (separate world) |
| DOM access | Shared DOM, native view | Shared DOM, separate JS objects |
| Object sharing with page | `exportFunction`/`cloneInto` | Not directly supported (use `window.postMessage`) |
| Prototype poisoning defense | Native C++ access | Separate prototype chains |
| `eval()` context | `window.eval()` runs in page context (Firefox); `eval()` in content script context | `eval()` always in content script context |

### Key Risks

1. **Xray waiver is transitive**: Accessing `wrappedJSObject` on any object waives Xray for that object and all its properties. A single careless waiver can expose the entire DOM to page-script manipulation.

2. **`window.eval()` in Firefox runs in page context**: Unlike Chrome where `eval()` always runs in the content script's isolated world, Firefox's `window.eval()` executes in the page's context. This is a footgun for developers who don't understand the distinction.

3. **Firefox-only**: Any architecture relying on Xray wrappers is Firefox-fork-only. If the browser engine decision hasn't been made, this is a significant commitment.

### Verdict

For a Firefox-based AI-native browser, Xray wrappers with `exportFunction`/`cloneInto` provide **the strongest available mechanism** for content script ↔ page communication. The key rule: **never waive Xrays (`wrappedJSObject`) in agent-facing code**, and always use `exportFunction` to expose a minimal, validated API surface to page scripts.

---

## 5. Native Messaging Hosts

### Overview

Native Messaging allows a browser extension to communicate with a native application installed on the user's computer. The browser launches the native application as a subprocess and communicates via stdin/stdout using a length-prefixed JSON protocol.

### Security Posture

**Risk Level: HIGH — powerful but dangerous without OS-level sandboxing**

| Property | Assessment |
|----------|-----------|
| Authentication | **Manifest-based.** The native messaging host manifest specifies `allowed_origins` (extension IDs that may connect). The native host receives the caller's extension origin as its first command-line argument. |
| Binary Verification | **None.** The manifest specifies a path to the binary. There is no signature verification, hash checking, or integrity validation. If the binary at the path is replaced, the browser will execute the replacement. |
| Privilege Level | **Full user privileges.** The native messaging host process inherits the privileges of the user running the browser. It can read/write files, make network requests, launch other processes — anything the user can do. |
| Isolation | **None by default.** The host process runs with no sandboxing unless the deployer explicitly uses OS-level mechanisms (AppArmor, SELinux, seccomp, macOS sandbox-exec). |
| Message Size | 1 MB max from host → extension; 64 MiB max from extension → host. |
| Availability | **Not available from content scripts.** Only extension pages and service workers can use `runtime.connectNative()` / `runtime.sendNativeMessage()`. |

### Key Risks for Agent Use

1. **Binary substitution**: An attacker with write access to the native messaging host binary path can replace it with malicious code. The browser performs no integrity check. On Linux, the user-level host manifest is at `~/.config/google-chrome/NativeMessagingHosts/` (Chrome) or `~/.mozilla/native-messaging-hosts/` (Firefox) — writable by the user.

2. **Privilege escalation**: A compromised native messaging host has full user privileges. If the AI agent can trigger arbitrary operations through the native host, a prompt injection attack could lead to file system access, credential theft, or arbitrary code execution.

3. **No audit logging**: There is no built-in mechanism to log what messages were sent to/from the native host or what operations it performed.

4. **stdin/stdout manipulation**: The protocol is simple length-prefixed JSON over stdio. There is no encryption, no message signing, and no protection against a local attacker intercepting the pipe (though this requires process-level access).

### Mitigations

1. **OS-level sandboxing**: Deploy the native host with AppArmor (Linux), seccomp-bpf, or macOS sandbox profiles that restrict file system access, network access, and process launching to exactly what the host needs.

2. **Binary integrity**: Use a read-only filesystem mount, dm-verity, or a systemd-protected path for the host binary. On macOS, code signing can provide some verification.

3. **Allowlisted operations**: The native host should implement a strict command allowlist. Never pass agent-generated strings directly to shell commands, file paths, or SQL queries.

4. **Minimal privilege**: Run the native host as a restricted user or in a container with no network access if OS-level operations are limited to local computation.

### Verdict

Native Messaging is **useful but dangerous** for AI agent integration. It should be treated as an **optional escape hatch** for operations that genuinely require OS-level access (e.g., local model inference, file system operations). It must be aggressively sandboxed at the OS level, and the host binary must implement a strict operation allowlist. The extension should never forward raw agent requests to the native host.

---

## 6. Model Context Protocol (MCP)

### Overview

MCP is an open protocol (JSON-RPC 2.0 based) developed by Anthropic that standardizes how LLM applications connect to external data sources and tools. It defines a host → client → server architecture where MCP servers expose tools, resources, and prompts that AI agents can use.

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
| User Consent | **Required by spec.** "Users must explicitly consent to and understand all data access and operations." But enforcement is left to implementors. |
| Tool Safety | **Spec acknowledges risk.** "Tools represent arbitrary code execution and must be treated with appropriate caution." Tool descriptions/annotations "should be considered untrusted, unless obtained from a trusted server." |
| Authentication | **Transport-dependent.** stdio transport has no auth (local subprocess). Streamable HTTP supports standard HTTP auth (bearer tokens, OAuth). |
| Authorization / Capability Scoping | **Not protocol-enforced.** The spec says hosts SHOULD build authorization flows, but MCP itself has no capability restriction mechanism. |
| Prompt Injection | **Acknowledged risk.** MCP tools are invoked by LLMs based on descriptions. Malicious or misleading tool descriptions can manipulate agent behavior. The spec says tool annotations "should be considered untrusted." |
| Transport Security | **Streamable HTTP:** Must validate Origin header for DNS rebinding prevention. Should bind to localhost for local servers. **stdio:** No encryption (local process pipe). |
| Session Management | Optional Mcp-Session-Id header for stateful sessions. Should be cryptographically secure. |

### Key Risks for Agent-Driven Browser Control via MCP

1. **MCP inherits the risks of its underlying protocol**: If an MCP browser server uses CDP internally, all of CDP's security problems (no auth, all-or-nothing access, arbitrary JS execution) are present. MCP doesn't add sandboxing — it adds a JSON-RPC wrapper.

2. **Tool description manipulation (indirect prompt injection)**: An MCP server exposes tools with descriptions that the LLM uses to decide when/how to call them. A malicious or compromised MCP server can craft descriptions that trick the agent into performing unintended actions.

3. **No protocol-level enforcement**: MCP's security section explicitly states: "While MCP itself cannot enforce these security principles at the protocol level, implementors SHOULD..." This means security depends entirely on implementation quality.

4. **Consent UX is undefined**: The spec requires user consent but doesn't define what consent looks like. An implementor could satisfy the spec with a "click OK to allow all tools" dialog, providing no meaningful security.

### What MCP Adds

Despite limitations, MCP provides a valuable **structural framework**:

1. **Tool enumeration**: Agents can discover available tools via `tools/list` rather than having unconstrained protocol access.
2. **Structured invocation**: Tool calls are explicit JSON-RPC requests with typed parameters, not raw protocol commands. This enables logging, validation, and allowlisting at the MCP layer.
3. **Consent integration point**: The spec defines where consent should be checked (before tool invocation, before LLM sampling), giving implementors clear hooks.
4. **Human-in-the-loop**: The spec's "elicitation" primitive allows servers to request user input/confirmation for destructive actions.

### Verdict

MCP is **the right abstraction layer** for agent-facing browser control, but it must sit on top of a secure foundation. Using MCP → CDP directly is insecure. The recommended architecture is MCP → WebExtension messaging → controlled browser APIs, with MCP providing the consent/authorization framework and the extension providing the sandboxing.

---

## 7. Recommended Architecture for Agent-Safe Browser Control

Based on the analysis above, the safest layered architecture for an AI-native browser is:

### Layer Model

```
┌─────────────────────────────────────────────────┐
│  Layer 4: AI Agent (LLM)                        │
│  Protocol: MCP (JSON-RPC 2.0)                   │
│  Role: Tool discovery, consent, structured       │
│        invocation, human-in-the-loop             │
├─────────────────────────────────────────────────┤
│  Layer 3: MCP Server / Extension Background      │
│  Protocol: WebExtension messaging (ports)        │
│  Role: Operation allowlist, sender validation,   │
│        rate limiting, audit logging               │
├─────────────────────────────────────────────────┤
│  Layer 2: Content Scripts                         │
│  Protocol: runtime.sendMessage / exportFunction  │
│  Role: DOM reading, controlled page interaction  │
│  Isolation: Xray vision (Firefox) / Isolated     │
│            worlds (Chromium)                      │
├─────────────────────────────────────────────────┤
│  Layer 1: Browser Engine                          │
│  APIs: WebExtension APIs (tabs, scripting,       │
│        webRequest, etc.)                          │
│  Restrictions: Host permissions, CSP,             │
│               restricted domains                  │
├─────────────────────────────────────────────────┤
│  Layer 0 (Optional): Native Messaging Host       │
│  Protocol: stdio (length-prefixed JSON)          │
│  Role: OS-level operations only                  │
│  Sandboxing: AppArmor / seccomp / macOS sandbox  │
└─────────────────────────────────────────────────┘
```

### Security Properties by Layer

| Layer | What Agent Can Do | What Agent Cannot Do | Spoofing Defense |
|-------|------------------|---------------------|------------------|
| 4 (MCP) | Discover tools, request operations | Execute raw browser commands | Tool descriptions validated by host |
| 3 (Extension BG) | Validated operations from allowlist | Anything not in allowlist | MessageSender validation, rate limiting |
| 2 (Content Script) | Read DOM, limited page interaction | Access cookies, intercept network, execute arbitrary JS | Xray vision / isolated worlds |
| 1 (Browser APIs) | Operations matching host permissions | Access to restricted domains, privileged pages | Browser-enforced permission model |
| 0 (Native Host) | Sandboxed OS operations | Anything outside sandbox profile | Extension-only access, binary integrity |

### Critical Design Rules

1. **Never expose CDP/BiDi directly to agents.** All browser operations must flow through the WebExtension messaging channel with an operation allowlist.

2. **Treat all content script messages as untrusted.** The background script must validate `sender.tab.id`, `sender.url`, and message format before performing any privileged operation.

3. **Never use `window.postMessage` for agent IPC.** It is spoofable by any page script. Use `runtime.sendMessage` (content script → background) and `exportFunction` (content script → page, Firefox only).

4. **Never waive Xray protection in agent code.** No `wrappedJSObject` access in agent-facing content scripts. Use `exportFunction`/`cloneInto` for all cross-boundary object sharing.

5. **Sandbox native messaging hosts aggressively.** AppArmor profiles, seccomp-bpf, read-only binary mounts. The host implements a strict command allowlist — no shell execution, no arbitrary file paths.

6. **Implement MCP consent at the tool level, not the session level.** Each tool invocation should be independently authorizable. Destructive operations (form submission, payment, account actions) require explicit user confirmation via MCP's elicitation primitive.

7. **Log everything.** Every agent action (MCP tool call → extension message → browser API call → result) must be logged with timestamps, creating an auditable chain of actions.

### What This Architecture Rejects

| Mechanism | Status | Reason |
|-----------|--------|--------|
| CDP direct agent access | **REJECTED** | No auth, no scoping, arbitrary execution |
| WebDriver BiDi direct agent access | **REJECTED** | Still maturing, designed for testing not agent sandboxing |
| `window.postMessage` for agent IPC | **REJECTED** | Spoofable by any page script |
| Marionette / WebDriver BiDi internal | **REJECTED** | Extreme risk; full browser control with no permission model |
| `wrappedJSObject` in agent code | **REJECTED** | Transitive Xray waiver defeats content script isolation |

---

## 8. Open Questions

1. **WebDriver BiDi capability restrictions**: Will the W3C spec eventually define fine-grained capability scoping (e.g., "read DOM only", "no script execution")? If so, BiDi could become suitable for agent control. Monitor the spec.

2. **MCP authorization extensions**: Will MCP gain protocol-level capability restrictions beyond the current "implementors SHOULD" guidance? The current spec leaves too much to implementor discretion.

3. **Chromium equivalent of exportFunction/cloneInto**: If Aether targets Chromium, how do we achieve equivalent content ↔ page communication safety without Firefox's Xray wrappers? The isolated world model prevents direct object sharing, forcing reliance on the unsafe `window.postMessage`.

4. **Renderer process compromise**: All content script isolation (Xray, isolated worlds) is defeated if the renderer process is compromised. What additional mitigations exist? (Site isolation, process-per-tab, memory-safe languages in the renderer.)

5. **AI agent behavioral sandboxing**: Beyond IPC-level controls, how do we constrain what an AI agent *chooses* to do? Tool-level consent helps but doesn't prevent subtle manipulation (e.g., an agent reading sensitive data and encoding it in seemingly benign actions).

---

## Sources

1. Chrome DevTools Protocol — https://chromedevtools.github.io/devtools-protocol/
2. WebDriver BiDi W3C Specification — https://w3c.github.io/webdriver-bidi/
3. WebDriver BiDi Blog (Chrome) — https://developer.chrome.com/blog/webdriver-bidi
4. MDN: runtime.sendMessage() — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
5. MDN: Content Scripts — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
6. MDN: Sharing Objects with Page Scripts — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
7. Chrome: Message Passing — https://developer.chrome.com/docs/extensions/develop/concepts/messaging
8. Chrome: Native Messaging — https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging
9. Chrome: Stay Secure (Extension Security) — https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure
10. Firefox Source Docs: Xray Vision — https://firefox-source-docs.mozilla.org/dom/scriptSecurity/xray_vision.html
11. MCP Specification (2025-03-26) — https://modelcontextprotocol.io/specification/2025-03-26
12. MCP Transports — https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
13. MCP Architecture Overview — https://modelcontextprotocol.io/docs/concepts/architecture
