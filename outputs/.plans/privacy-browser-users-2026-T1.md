# Researcher Brief T1: Threat Models + Anti-Fingerprinting Technical Landscape

**Output file:** `outputs/.drafts/privacy-browser-users-2026-research-T1.md`

## Your mission
Research the specific threat models that privacy-focused browser users hold in 2026, and the technical anti-fingerprinting capabilities of leading privacy browsers.

## Questions to answer

1. What threats do privacy-focused users articulate most frequently?
   - Browser fingerprinting (canvas, WebGL, audio, font, screen, timezone)
   - Cross-site tracking (cookies, link decoration, CNAME cloaking)
   - ISP/network-level surveillance
   - Nation-state actors
   - Data brokers and ad networks
   - Browser vendor telemetry as a threat

2. What anti-fingerprinting techniques do these browsers provide?
   - **LibreWolf**: what fingerprinting protections are on by default?
   - **Mullvad Browser**: what is its fingerprint-resistance model (identical fingerprint pool)?
   - **Tor Browser**: letterboxing, uniform UA, canvas blocking
   - **Brave**: fingerprint randomization vs. uniformity
   - **arkenfox user.js**: what settings does it configure for fingerprinting?
   - **Firefox with RFP (Resist Fingerprinting)**: what does `privacy.resistFingerprinting` actually do?

3. What do independent audits (PrivacyTests.org, Cover Your Tracks / EFF) say about these browsers in 2025-2026?

4. What is "fingerprint uniformity vs. randomization" debate in the privacy community?

## Sources to check
- https://privacytests.org (independent test results)
- https://coveryourtracks.eff.org
- https://librewolf.net/docs/faq/
- https://mullvad.net/en/browser/docs/
- https://github.com/arkenfox/user.js
- https://tb-manual.torproject.org
- https://brave.com/privacy-features/
- r/privacyguides, r/firefox for community threat model discussions
- Privacy Guides (https://www.privacyguides.org)

## Output format
Write detailed research notes to `outputs/.drafts/privacy-browser-users-2026-research-T1.md`. Include:
- Every claim backed by a source URL
- Direct quotes or data points where possible
- Mark any claim without a URL as [UNVERIFIED]
- Note dates of sources
