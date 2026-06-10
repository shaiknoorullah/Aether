# T1: Chrome DevTools Protocol Security + WebDriver BiDi

## Objective
Research the security posture of CDP and WebDriver BiDi for AI agent browser control in 2026.

## Questions to Answer
1. What is the CDP attack surface when used by AI agents? (debug port exposure, no auth, full browser control)
2. What known CVEs or security advisories exist for CDP misuse?
3. What sandboxing or permission restrictions does CDP offer (or lack)?
4. What is WebDriver BiDi's current W3C spec status (2025-2026)?
5. Which browsers support WebDriver BiDi and to what extent?
6. How does BiDi's permission/capability model compare to CDP's all-or-nothing access?
7. Can BiDi restrict agent capabilities (e.g., read-only DOM, no network interception)?
8. What are the spoofing/injection risks for each protocol?

## Search Strategy
- Search for "Chrome DevTools Protocol security risks", "CDP remote debugging attack surface"
- Search for "WebDriver BiDi specification 2025 2026 status", "WebDriver BiDi permission model"
- Search for "CDP vs WebDriver BiDi security comparison"
- Check W3C WebDriver BiDi spec pages
- Look for Chromium/Mozilla security team advisories about automation protocols

## Output
Write findings to `outputs/.drafts/agent-safe-browser-ipc-research-T1.md` with:
- Section per question
- Source URLs for every claim
- Security risk ratings (Critical/High/Medium/Low) with justification
- Direct quotes from specs or docs where possible
