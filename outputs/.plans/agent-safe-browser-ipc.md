# Plan: Agent-Safe Browser IPC for AI-Native Browsers (2026)

**Slug:** agent-safe-browser-ipc
**Created:** 2026-06-10
**Status:** DRAFT

## Key Questions

1. **CDP security posture**: What are the known spoofing, injection, and privilege-escalation risks of Chrome DevTools Protocol when exposed to AI agents? What sandboxing exists?
2. **WebDriver BiDi maturity**: How far has WebDriver BiDi come as a cross-browser standard by 2026? What permission model does it offer vs CDP?
3. **WebExtension messaging safety**: How robust is `runtime.sendMessage` / `runtime.connect` against content-script spoofing and message injection? What origin checks exist?
4. **Firefox Xray wrappers**: How do `exportFunction` / `cloneInto` prevent page-script attacks? What residual risks remain?
5. **Native Messaging Host risks**: What is the attack surface of Native Messaging — binary verification, argument injection, privilege scope?
6. **MCP for browser control**: What is the Model Context Protocol's current role in browser automation? How does it layer over CDP/BiDi/extensions? What security model does it add?
7. **Combination recommendation**: Which layered combination of these mechanisms is safest for AI agents driving a browser, given the Aether project's privacy-first, security-first design goals?

## Evidence Needed

- Chrome DevTools Protocol security documentation, known CVEs, debug port exposure risks
- WebDriver BiDi W3C spec status, browser support matrix, permission/capability model
- WebExtension API security: message validation, sender verification, CSP interaction
- Firefox-specific Xray/exportFunction/cloneInto MDN docs and security analysis
- Native Messaging Host specification, OS-level sandboxing, binary verification gaps
- MCP specification (Anthropic), MCP browser server implementations, security model
- Academic or industry analysis of browser automation attack surfaces
- Comparative analysis from browser security teams (Chromium, Mozilla)

## Scale Decision

**DIRECT MODE (lead-owned)** — subagent runtime failed; executing all research directly.

Original plan was 4 parallel researchers. Falling back to sequential direct search across all 4 domains.

## Task Ledger

| ID | Owner | Topic | Status |
|----|-------|-------|--------|
| T1 | lead | CDP security + WebDriver BiDi maturity & permissions | IN PROGRESS |
| T2 | lead | WebExtension messaging safety + Firefox Xray wrappers | PENDING |
| T3 | lead | Native Messaging Host attack surface + OS sandboxing | PENDING |
| T4 | lead | MCP browser control + AI agent integration security | PENDING |
| T5 | lead | Synthesize into draft | PENDING |
| T6 | lead | Citation verification | PENDING |
| T7 | lead | Self-review verification pass | PENDING |

## Verification Log

_(updated as tasks complete)_

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| 4 researchers → direct | Subagent runtime failed; lead executes all tasks directly | 2026-06-10 |
| Skip PDF parsing | Use HTML docs, MDN, web sources; mark PDF-only as blocked | 2026-06-10 |
