# Discovery Report: Privacy Browser Users 2026 (seg-privacy-advocates)

**Department:** Discovery
**Team:** seg-privacy-advocates
**Mandate:** Privacy browser users 2026 — threat models, anti-fingerprinting, ad/tracker blocking, telemetry refusal, local-first/no-cloud, switch triggers, community sizes.
**Date:** 2026-06-10
**Primary source:** Feynman brief `outputs/privacy-browser-users-2026.md` (52 sources, verification PASS WITH NOTES) plus v1 JTBD report and whitespace draft.

---

## 1. Executive Summary

Privacy browser users in 2026 operate with a sharply stratified, well-articulated threat model: surveillance capitalism (ad-tech) is the baseline, browser fingerprinting (22+ passive signals, cookie-independent, VPN-resistant) is the harder distinct threat, network-layer surveillance is a second tier, and — newly elevated — **browser vendor betrayal** has become a first-class threat category. Three 2024–2025 events crystallized that last category and drove measurable migration: Google's Manifest V3 disabling of uBlock Origin (the single largest Chrome-exit trigger), Mozilla's February 2025 Terms-of-Use controversy (the "never sell your data" promise was deleted), and Mozilla's December 2025 "AI-first Firefox" CEO announcement.

The community is large and active: r/privacy ~1.5–1.6M, Brave 115.26M MAU (largest privacy-positioning browser), arkenfox ~12,500 GitHub stars, LibreWolf ~48K Flathub downloads/month. It is also philosophically split on anti-fingerprinting between the **crowd-uniformity model** (Tor, Mullvad, LibreWolf/RFP — "hide in the crowd") and the **randomization model** (Brave — perturb values per session). Local-first/no-cloud demand is strong and rising, sharpened by AI: high-privacy users want zero-telemetry, no-sync-by-default, optionally self-hosted sync, and crucially **local-only AI** with a hard kill switch — Firefox's AI pivot triggered enough anxiety that Mozilla committed to an "AI kill switch."

The defining whitespace for Aether: nobody has shipped a browser that delivers strong privacy *and* usability *and* AI assistance simultaneously. The clearest, most durable switch trigger is **any change perceived as trading user data for revenue** — which is also the trust bar Aether must clear to win this segment. An AI-native browser is, by default, *suspect* to this segment; it can only win by making privacy auditable (open source, reproducible builds, real-time outbound-connection monitor, local-first AI) rather than promised.

---

## 2. Key Findings

### F1 — Vendor betrayal is now a first-class threat category, and it is the dominant 2025 switch driver
Privacy users in 2026 explicitly model the *browser vendor itself* as a privacy adversary, not just trackers. Mozilla's Feb 2025 ToU deleted the longstanding "we never sell your data" promise alongside broad data-licensing language; a community poll drew 700+ responses concluding "trust in Firefox and Mozilla is gone." The clearest universal switch trigger is *any* change perceived as trading user data for revenue.
- Source: https://arstechnica.com/tech-policy/2025/02/firefox-deletes-promise-to-never-sell-personal-data-asks-users-not-to-panic/
- Source: https://boilingsteam.com/poll-trust-in-firefox-mozilla-is-gone/

### F2 — Manifest V3 is the single largest Chrome-exit trigger; full MV2/uBO support is the retention anchor for Firefox-family browsers
Chrome began auto-disabling uBlock Origin (MV2) in June 2024, accelerating through October 2024. uBO Lite (MV3) lacks dynamic filtering, top-context URL rules, and adaptive anti-adblock. Firefox's retention of full MV2 is repeatedly cited as the reason to stay in the Firefox ecosystem. An academic study quantified the effectiveness loss (arXiv:2503.01000).
- Source: https://9to5google.com/2024/10/15/google-chrome-disables-ublock-origin/
- Source: https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)
- Source: https://arxiv.org/html/2503.01000

### F3 — Anti-fingerprinting is philosophically split: crowd-uniformity vs. randomization
Tor/Mullvad/LibreWolf-RFP make all users identical ("the only way to thwart advanced fingerprint tracking scripts"); Brave perturbs values per session. Each camp distrusts the other: randomization cannot deliver population-level anonymity ("there is no crowd, because they are all unique"); uniformity is fragile (any user modification breaks it). This split means Aether cannot pick a single default without alienating half the segment — it must support a mode toggle.
- Source: https://www.privacyguides.org/en/desktop-browsers/
- Source: https://brave.com/privacy-updates/3-fingerprint-randomization/
- Source: https://discuss.privacyguides.net/t/is-it-possible-that-brave-has-stronger-fingerprinting-protection-than-firefox/17075

### F4 — Fingerprinting protection breaks websites; "balanced/per-site" control is the unmet need
RFP forces UTC timezone, light theme, rounded windows, and per-site canvas prompts; Mullvad triggers CAPTCHAs/Cloudflare everywhere. Privacy is global all-or-nothing today. The v1 JTBD work found the unmet need is per-site graduated control (allow canvas for a drawing app, block elsewhere) and fingerprints that defeat tracking without tripping anti-bot systems.
- Source: https://librewolf.net/docs/faq/
- Source: https://discuss.privacyguides.net/t/mullvad-browser-worth-it/25955
- Source: https://www.todetect.net/article/industry-trends/anonymous-mode/

### F5 — uBlock Origin (MV2) is the non-negotiable gold standard; "nothing more" is a real constraint
uBO MV2 (dynamic filtering, cosmetic blocking, anti-adblock, custom lists) is the required baseline; LibreWolf and Mullvad ship it pre-installed. Mullvad's "nothing more" philosophy is notable: *adding* uncommon block lists makes a user *more* identifiable under the crowd-uniformity model. So blocker strength and fingerprint strategy are coupled, not independent.
- Source: https://mullvad.net/en/browser
- Source: https://www.privacyguides.org/en/desktop-browsers/

### F6 — Telemetry refusal is absolute, and even "privacy-preserving" telemetry causes friction
Mullvad ships zero telemetry; LibreWolf strips Mozilla telemetry/Normandy/Pocket/Safe-Browsing/crash reporting. Firefox's PPA (FF128, Meta co-authored ad-attribution, on by default) drew a NOYB GDPR complaint and was later removed. Even Brave's cryptographically aggregate-only P3A (STAR protocol, opt-out) irritates the strictest users — friction that Brave Origin ($59.99, strips P3A + all monetization) directly addresses.
- Source: https://noyb.eu/en/firefox-tracks-you-privacy-preserving-feature
- Source: https://librewolf.net/docs/faq/
- Source: https://brave.com/blog/brave-origin/

### F7 — Local-first AI with a hard kill switch is now a defining demand
Firefox's Dec 2025 "AI browser" pivot drove backlash specifically over cloud-LLM implications; Mozilla's response was committing to an "AI kill switch." Privacy users want local LLM execution (Ollama-class) with no browsing data leaving the device. Emerging tools (NativeMind, Apex) target exactly this. v1 work confirmed: only Brave keeps AI chat fully local/private among AI browsers, and prompt injection (exfiltrating OTP/credentials) is a top objection.
- Source: https://www.howtogeek.com/firefox-will-make-an-ai-kill-switch-to-address-complaints/
- Source: https://www.xda-developers.com/browserai-is-the-agentic-browser-that-uses-your-local-llm/
- Source: https://www.washingtonpost.com/opinions/interactive/2026/artificial-intelligence-browser-test-chatgpt/

### F8 — No-sync-by-default is a design value; self-hosted sync is an active community ask
Mullvad has no sync by design; LibreWolf disables sync by default; high-privacy users treat sync as a privacy surface and use per-context profiles. Where sync is accepted it must be E2EE (Firefox Sync encrypts locally; Brave Sync is E2EE, no account). There is active demand for self-hosted sync (2025 syncstorage-rs tutorial; Mozilla Connect feature request).
- Source: https://www.kyzer.me.uk/syncserver/
- Source: https://connect.mozilla.org/t5/ideas/self-host-firefox-sync/idi-p/24415

### F9 — Compartmentalization is critical but only isolates cookies, never fingerprint/IP
Firefox Multi-Account Containers is the only mainstream native solution and isolates cookies only — IP, user-agent, and fingerprint stay shared. The community's documented fallback hierarchy (containers → profiles → desktop users → VM → separate devices) is cumbersome. No browser offers per-context fingerprint + network isolation natively.
- Source: https://blog.mozilla.org/tanvi/2016/06/16/contextual-identities-on-the-web/
- Source: https://discuss.privacyguides.net/t/compartmentalization-when-to-use-which-browser-profiles-desktop-users-vm/34181

### F10 — Telemetry/data flows are unauditable; users cannot verify any privacy claim
Users have no way to see what leaves their browser; "browser makers claim they need this data... users have no way to verify what's actually collected." DNS leaks (DoH silently bypassing a VPN) happen invisibly. There is no real-time privacy health dashboard in any shipping browser.
- Source: https://stateofsurveillance.org/articles/surveillance/browser-telemetry-what-browsers-report/
- Source: https://nym.com/blog/dns-leaks

### F11 — The segment is large, active, and measurable
r/privacy ~1.5–1.6M; Brave 115.26M MAU (largest explicitly privacy browser); arkenfox ~12,500 stars (active, last push 2026-05-12); LibreWolf ~48,133 Flathub DL/month + 743 combined AUR votes; Mullvad Browser ~2,330 stars (small 4-person core team). Firefox global share is ~2.26–2.3% and declining, raising existential funding/independence questions that themselves feed switch anxiety.
- Source: https://github.com/arkenfox/user.js/
- Source: https://cyberinsider.com/brave-sees-100-linux-growth-as-browser-reaches-115m-monthly-users/
- Source: https://flathub.org/en/apps/io.gitlab.librewolf-community

### F12 — Independent verifiability is becoming table stakes (PrivacyTests.org)
PrivacyTests.org runs open-source automated browser privacy tests (state partitioning, fingerprinting, tracker blocking, HTTPS upgrade, private-mode isolation) across Brave/LibreWolf/Mullvad/Firefox. Privacy users increasingly evaluate browsers against third-party test results rather than vendor marketing — Aether will be scored here and should aim to top it.
- Source: https://privacytests.org/index

---

## 3. Implied Aether Feature Candidates

Each maps to a job-to-be-done and a category from the Aether taxonomy. RICE inputs are in the returned structured object.

| # | Candidate | Category | JTBD |
|---|-----------|----------|------|
| C1 | Local-first AI with hard kill switch (no cloud transmission, on-device LLM, prompt-injection isolation) | AI & Agents | Use AI assistance without exposing browsing data |
| C2 | Real-time privacy health dashboard / outbound-connection monitor (every connection, DNS path, trackers blocked, fingerprint uniqueness, leak alerts) | Privacy & Security | Verify my privacy tools actually work; audit what leaves my device |
| C3 | Full MV2-grade ad/tracker blocking (uBO-equivalent: dynamic filtering, cosmetic, anti-adblock, custom lists) built-in | Privacy & Security | Block ads/trackers without MV3 degradation |
| C4 | Switchable anti-fingerprinting: crowd-uniformity mode vs. randomization mode, with per-site graduated API control | Privacy & Security | Resist fingerprinting without breaking websites |
| C5 | Deep compartmentalization: per-context identity with isolated cookies + fingerprint + optional per-context network route | Privacy & Security | Maintain separate identities without cross-contamination |
| C6 | Zero-telemetry by default with auditable, reproducible builds and a data-independent business model | Privacy & Security | Trust the vendor; don't be the product |
| C7 | No-sync-by-default, E2EE-when-enabled, self-hostable sync backend | Sync & Portability | Sync without making it a surveillance surface |
| C8 | Integrated leak-safe network stack: coordinated VPN/proxy + encrypted DNS that respects the tunnel (no DoH bypass) | Privacy & Security | Run a coherent privacy stack without silent leaks |

---

## 4. Competitive / Whitespace Notes

- **The trilemma is unsolved.** No browser delivers privacy + usability + speed simultaneously (Tor too slow; Mullvad CAPTCHAs everywhere; LibreWolf breaks logins/needs config; Brave Shields break checkout). Aether's wedge is *balanced, per-site* protection that defeats tracking without tripping anti-bot systems — a structural gap no shipping browser fills (confirmed in `browser-feature-whitespace-cited.md`: "compositional privacy — per-tab network identity, auditable data flows, adaptive threat models don't exist").
- **AI is a liability, not an asset, to this segment by default.** Every AI browser except Brave sends data to the cloud; prompt injection (Comet exfiltrating a Gmail OTP) is a demonstrated attack. Local-first AI + kill switch is genuine whitespace — and the *only* posture that lets an AI-native browser win privacy users rather than repel them.
- **Compartmentalization whitespace.** Firefox Containers isolate cookies only; nobody ships per-context fingerprint + network isolation in a simple UI. This is a high-value, defensible differentiator for journalists/activists/multi-account users.
- **Verifiability whitespace.** No browser has a real-time privacy dashboard showing outbound connections, DNS path, and leak alerts. This directly answers the "I can't verify any privacy claim" pain and converts trust-by-promise into trust-by-audit.
- **Trust modeling.** Brave (115M MAU) is the incumbent to beat but carries baggage (BAT/crypto, P3A, installer referral codes) — and its Brave Origin paid SKU implicitly concedes the free tier bundles unwanted features. LibreWolf/Mullvad/Tor are trusted but tiny and deliberately feature-poor. The whitespace is a *trusted* browser that is also *full-featured* — privacy purity without the productivity tax (sync, password mgmt, extensions). Brave's coupling of blocking strength to fingerprint strategy ("nothing more") is a design lesson Aether must respect.
- **Engine choice matters to purists.** Chromium monoculture (MV3, Google-controlled APIs) is itself modeled as a structural privacy risk; a non-Google engine is a trust signal to the strictest segment. Relevant to the still-undecided Aether delivery vehicle.

---

## 5. Risks

- **R1 — AI-native positioning is a trust headwind.** This segment treats browser AI as an active threat. If Aether leads with AI rather than with auditable local-first privacy, it will be dismissed by the exact users this team studies. Mitigation: privacy/audit features ship first and are default; AI is opt-in, local-first, with a hard kill switch.
- **R2 — Crowd-uniformity is fundamentally at odds with personalization.** Aether's value props (AI memory, workspaces, customization) increase fingerprint surface and break the "hide in the crowd" model. Supporting uniformity mode means accepting a stripped, non-personalized profile for high-threat users — a real product-architecture tension, not a UI toggle.
- **R3 — MV2/uBO sustainability.** If Aether is Chromium-based it inherits MV3 limits and loses the segment's #1 retention anchor; if Firefox-based it inherits Mozilla ecosystem and funding risk. Either path carries a privacy-credibility cost.
- **R4 — Telemetry intolerance limits product analytics.** Zero-telemetry expectation means even STAR/P3A-class privacy-preserving analytics cause friction. Aether will have minimal usage data from its most valuable early adopters; plan for qualitative/opt-in-only measurement.
- **R5 — Small-vendor trust + patch-lag.** Hardened forks carry security-patch-delay risk from small teams (Mullvad: 4 core contributors). A new entrant must prove it can ship security updates fast or it inherits this skepticism.
- **R6 — Evidence dating/verification gaps.** The brief is dated 2026-06-10 with several [UNVERIFIED] items (r/degoogle and r/privacyguides counts, LibreWolf total install base, Brave Origin take-up). Forward-dated sources (Dec 2025 AI pivot, June 2026 Brave Origin) should be re-confirmed before they drive irreversible roadmap commitments. Researcher subagents failed during collection (lead did all tracks directly) — single-author collection is a mild bias/coverage risk.

---

## Source Index
All URLs inline per finding above; consolidated provenance: `outputs/privacy-browser-users-2026.provenance.md` (52 sources). Cross-referenced v1 reports (read-only): `docs/research-data/discovery/privacy-advocates.md`, `outputs/.drafts/browser-feature-whitespace-cited.md`.
