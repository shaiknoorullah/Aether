# T2: WebExtension Messaging Safety + Firefox Xray Wrappers

## Objective
Research the security of WebExtension messaging APIs and Firefox's Xray/exportFunction/cloneInto mechanisms for AI agent IPC.

## Questions to Answer
1. How does `runtime.sendMessage` / `runtime.connect` validate message senders? What origin checks exist?
2. Can a malicious web page spoof messages to a WebExtension? Under what conditions?
3. What CSP interactions affect WebExtension messaging security?
4. How do Firefox Xray wrappers protect content scripts from page-script manipulation?
5. How do `exportFunction` and `cloneInto` work, and what security guarantees do they provide?
6. What residual risks remain with Xray wrappers (known bypasses, edge cases)?
7. How does Chromium's content script isolation compare to Firefox's Xray approach?
8. What best practices exist for securing WebExtension messaging when an AI agent is the consumer?

## Search Strategy
- Search MDN docs for "runtime.sendMessage security", "content script isolation"
- Search for "WebExtension message spoofing", "content script injection attacks"
- Search for "Firefox Xray wrappers security", "exportFunction cloneInto MDN"
- Search for "Chromium vs Firefox content script isolation"
- Look for Mozilla security blog posts about extension messaging

## Output
Write findings to `outputs/.drafts/agent-safe-browser-ipc-research-T2.md` with:
- Section per question
- Source URLs for every claim
- Comparison table: Chromium vs Firefox content script isolation
- Known attack vectors with severity ratings
