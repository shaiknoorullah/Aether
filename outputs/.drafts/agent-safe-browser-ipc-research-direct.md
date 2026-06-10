# Direct Research Notes: Agent-Safe Browser IPC

## Search Terms Used
1. "Chrome DevTools Protocol security risks remote debugging attack surface"
2. "WebDriver BiDi W3C specification 2025 permission model"
3. "WebExtension messaging security content script spoofing"
4. "Firefox Xray wrappers exportFunction cloneInto security"
5. "Native Messaging Host security attack surface"
6. "Model Context Protocol MCP browser automation security"
7. "AI agent browser control security sandboxing"
8. "Chromium vs Firefox content script isolation"

## Sources Fetched
1. https://chromedevtools.github.io/devtools-protocol/ — CDP official docs
2. https://w3c.github.io/webdriver-bidi/ — WebDriver BiDi W3C spec
3. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage — MDN messaging
4. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts — MDN Xray/exportFunction
5. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts — MDN content scripts
6. https://developer.chrome.com/docs/extensions/develop/concepts/messaging — Chrome messaging docs
7. https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging — Chrome native messaging
8. https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure — Chrome extension security
9. https://firefox-source-docs.mozilla.org/dom/scriptSecurity/xray_vision.html — Firefox Xray vision source docs
10. https://modelcontextprotocol.io/specification/2025-03-26 — MCP spec overview
11. https://modelcontextprotocol.io/specification/2025-03-26/basic/transports — MCP transports
12. https://modelcontextprotocol.io/docs/concepts/architecture — MCP architecture
13. https://developer.chrome.com/blog/webdriver-bidi — WebDriver BiDi blog post

## Key Findings

### CDP
- No authentication on remote debugging port (--remote-debugging-port=9222)
- Full browser control: DOM, Network, JS execution, cookies, screenshots
- All-or-nothing access model — no capability scoping
- HTTP endpoints expose /json/version, /json/list, /json/new, /json/close
- WebSocket connection gives full protocol access
- Multiple simultaneous clients supported since Chrome 63
- Originally designed for developer tools, not agent automation

### WebDriver BiDi
- W3C standard under active development by Browser Tools & Testing Working Group
- Bi-directional communication (improvement over WebDriver Classic's HTTP polling)
- Cross-browser: Chrome, Firefox, Edge, Safari participation
- NOT replacing CDP — CDP continues for debugging, BiDi for testing
- Still defining permission/capability model
- Designed with latency in mind (fewer roundtrips than CDP)
- Web Platform Tests for cross-browser verification

### WebExtension Messaging
- runtime.sendMessage / runtime.connect for internal extension messaging
- sender validation available via MessageSender object
- Chrome: "Content scripts are less trustworthy" — official security guidance
- Messages from content scripts should be treated as potentially attacker-crafted
- externally_connectable manifest key controls web page → extension messaging
- Content scripts can't access most WebExtension APIs directly
- JSON serialization (Chrome) vs structured clone (Firefox)
- 64 MiB message size limit

### Firefox Xray Vision
- Privileged code sees "native version" of objects — expandos invisible
- Implementation: bypasses JS reflection, accesses C++ representation directly
- exportFunction: exports content script function to page scope safely
- cloneInto: structured-clones objects into page scope
- wrappedJSObject: opt-in waiver of Xray protection (transitive!)
- Xray support for JS built-ins (Object, Array) since Gecko 31-32
- Object/Array Xrays: functions and accessor properties hidden
- Key risk: waiving Xrays (wrappedJSObject) is transitive

### Chromium Content Script Isolation
- "Isolated world" approach — fundamentally different from Firefox Xray
- Content scripts can't see page JS variables
- Page scripts can't see content script variables
- Vulnerable to side-channel attacks (Spectre) since same renderer process
- Compromised renderer → content script takeover possible

### Native Messaging
- stdio protocol: 32-bit length prefix + JSON
- Manifest specifies allowed_origins (extension IDs)
- No binary verification beyond manifest path
- Host inherits full user privileges
- 1 MB max message from host, 64 MiB to host
- Separate process per connection (connectNative) or per message (sendNativeMessage)
- Not available from content scripts — only from extension pages/service worker
- Windows: registry-based host discovery; Linux/macOS: filesystem paths

### MCP
- JSON-RPC 2.0 based protocol
- stdio and Streamable HTTP transports
- Security principles: user consent, data privacy, tool safety, LLM sampling controls
- Tools = arbitrary code execution — "must be treated with appropriate caution"
- Tool descriptions/annotations "should be considered untrusted"
- Host must get explicit user consent before invoking any tool
- No protocol-level enforcement of security — relies on implementor
- Streamable HTTP: must validate Origin header (DNS rebinding), bind to localhost
- Session management via Mcp-Session-Id header
- MCP is a meta-protocol — layers over CDP/BiDi/extensions for browser control

## Blocked
- web_search: all providers (Exa rate-limited, Perplexity/Gemini no API keys)
- MCP security spec page: returned only 487 chars (likely redirect/paywall)
- PDF parsing: intentionally skipped per workflow rules
