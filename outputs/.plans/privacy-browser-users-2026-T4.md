# Researcher Brief T4: Switch Triggers + Ad/Tracker Blocking Norms + MV3 Impact

**Output file:** `outputs/.drafts/privacy-browser-users-2026-research-T4.md`

## Your mission
Research the specific events, features, and friction points that cause privacy-focused users to switch browsers, and what ad/tracker blocking capabilities they demand.

## Questions to answer

### Switch Triggers

1. What caused mass migrations away from Chrome?
   - Google's Manifest V3 rollout timeline and impact on uBlock Origin
   - Privacy Sandbox / Topics API controversy
   - Google account integration creep

2. What caused migrations away from Firefox?
   - 2025 Terms of Service controversy (what exactly changed?)
   - Mozilla's introduction of Privacy-Preserving Attribution (PPA) — what is it, community response
   - Pocket/Sponsored shortcuts by default
   - Mozilla layoffs and Firefox future concerns
   - AI features (Firefox AI, local inference vs. cloud)

3. What causes migrations AWAY from Brave?
   - BAT/crypto integration concerns
   - Brave affiliate link controversy (2020 but still referenced)
   - Brave Search default
   - Acceptable Ads program

4. What drove adoption of LibreWolf, Mullvad Browser, or hardened Firefox?

5. Are there 2025-2026 specific incidents that moved significant numbers of users?

### Ad and Tracker Blocking Norms

6. What is the baseline expectation for ad blocking among privacy users?
   - uBlock Origin as the gold standard — why?
   - Default-on blocking vs. user-installed extension preference
   - DNS-level blocking (Pi-hole, NextDNS, AdGuard DNS) as complement

7. What is the **Manifest V3 impact** on ad blocking?
   - What is MV3, what did it change for uBlock Origin?
   - How did Chrome phase out MV2? Timeline in 2024-2025.
   - How did Firefox respond? (Firefox keeping MV2 support)
   - Did this drive users to Firefox-based browsers?

8. What is the community stance on **Brave's built-in shields** vs. uBlock Origin?

9. What tracker blocking beyond ads do privacy users expect?
   - CNAME cloaking
   - Link decoration stripping (utm_ parameters, fbclid, etc.)
   - Bounce tracking
   - Email pixel tracking

10. What is the community view of "acceptable ads" programs?

## Sources to check
- https://github.com/uBlockOrigin/uBlock-issues for MV3 discussion
- Chrome deprecation notices for MV2
- Firefox blog on MV3 support
- r/uBlockOrigin community reactions
- r/privacyguides switch browser discussions
- Privacy Guides browser recommendations and reasoning
- News coverage of Firefox ToS 2025, Mozilla PPA
- Brave affiliate link post-mortems
- EFF on Privacy Sandbox

## Output format
Write detailed research notes to `outputs/.drafts/privacy-browser-users-2026-research-T4.md`. Include:
- Every claim backed by a source URL
- Direct quotes from community discussions where possible
- Timeline of key events where relevant
- Mark any claim without a URL as [UNVERIFIED]
- Note dates of sources
