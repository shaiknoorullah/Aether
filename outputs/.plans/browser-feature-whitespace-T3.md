# T3: Privacy Architecture Features + Whitespace (2026)

## Objective
Map privacy/security architectures across browsers and identify models NO browser implements.

## Scope
Research: Brave, Tor Browser, Mullvad Browser, Firefox (strict mode), Librewolf, Orion, Safari (ITP), Chrome (Privacy Sandbox), Vanadium, Cromite. Also: privacy extensions (uBlock Origin, NoScript, CanvasBlocker, ClearURLs, Temporary Containers).

## Key Questions
1. What privacy models does each browser implement natively?
2. What can only be achieved via extensions, and what are the limits?
3. What privacy/security patterns does NO browser offer? Look for:
   - Per-tab network identity (different VPN/proxy/Tor circuit per tab, not just container)
   - Auditable data flow visualization (see exactly what data leaves the browser)
   - Sandboxed profiles with cryptographic isolation (not just cookie separation)
   - Anti-fingerprinting that adapts per-site (not one-size-fits-all)
   - Built-in traffic analysis resistance (padding, timing obfuscation)
   - Hardware-backed key isolation per browsing context
   - Automatic threat model selection (casual → journalist → activist presets)
   - Privacy-preserving sync (zero-knowledge sync without a vendor account)
   - Transparent telemetry with user-auditable logs
   - Supply chain verification for extensions
   - Network-level compartmentalization (DNS, TLS, routing per context)
   - Browser-native credential isolation (separate password stores per profile/context)
4. For each gap, note technical barriers, performance costs, or usability tradeoffs.

## Output
Write to `outputs/.drafts/browser-feature-whitespace-research-t3.md` with:
- Privacy feature matrix: browser × privacy feature
- Whitespace features with evidence
- Source URLs for every claim
- Contrarian analysis of why each gap persists

## Rules
- Use web search for current docs, security audits, blog posts
- Do NOT fetch PDF files
- Every claim needs a source URL
- Mark uncertain items as "unverified"
