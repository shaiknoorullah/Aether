# Privacy-Focused Browser Users in 2026: Intelligence Brief

**Date:** 2026-06-10
**Status:** Draft (pre-citation sweep)

---

## Executive Summary

Privacy-focused browser users in 2026 operate with sharply articulated threat models centered on surveillance capitalism, fingerprinting, and — increasingly — browser vendor betrayal. The community has grown markedly: r/privacy has ~1.5M Reddit subscribers; Brave has 115M+ monthly active users; arkenfox's user.js repository has ~12,500 GitHub stars. Three events between 2024 and 2025 triggered measurable community anger and browser migrations: Google's phased disabling of uBlock Origin (MV2) via Manifest V3 rollout, Mozilla's February 2025 Terms of Service controversy, and Mozilla's December 2025 "AI-first" CEO announcement. Anti-fingerprinting expectations are philosophically divided between the crowd-uniformity model (Tor, Mullvad Browser, LibreWolf/RFP) and the randomization model (Brave). Local-first and no-cloud demands are strong: Mullvad Browser ships with no sync by design; LibreWolf disables sync by default; the community actively self-hosts Firefox Sync servers. The clearest browser-switch trigger is any change perceived as trading user data for revenue.

---

## 1. Threat Models

### 1.1 Primary Threats Articulated by Privacy Users

Privacy-focused browser users in 2026 do not treat privacy as a monolith. The community consistently distinguishes four overlapping threat categories:

**Surveillance capitalism (ad-tech tracking)** is the baseline threat. Users expect to be tracked by ad networks, data brokers, and social media pixels across every unprotected site visit. This is the threat that Privacy Guides explicitly calls out first: "Protects against the following threat(s): Surveillance Capitalism." The practical manifestation is fingerprinting, third-party cookies, cross-site link decoration (UTM parameters, fbclid), CNAME cloaking, and bounce tracking.

**Browser fingerprinting** — the collection of 22+ passive signals (canvas, WebGL, audio context, font enumeration, screen resolution, timezone, OS, GPU, language, plugin list) — is treated as a distinct and harder-to-block threat than cookies. An operator guide from 2025 documented that "every site you visit collects 22 distinct signals from your browser, your hardware, and your behavior, without asking. None of them require cookies. Most are unaffected by VPN or private browsing." The community understands this well: even with cookies blocked and a VPN active, a unique fingerprint can re-identify them.

**Network-layer surveillance (ISP, DNS, traffic shape)** occupies a second tier. Users combine browsers with VPNs or Tor for ISP-level protection, since browsers alone cannot mask the IP address or DNS queries. LibreWolf explicitly states: "If you care about protecting your IP address, you should use a VPN or even better use the Tor Browser." The privacy community treats DNS-over-HTTPS (DoH) as a partial mitigation, though LibreWolf disables DoH by default to avoid routing all DNS through a single cloud entity.

**Browser vendor telemetry and betrayal** has become an elevated threat category after 2024–2025 events. Users increasingly treat Firefox and Chrome telemetry as a surveillance vector on par with ad-tech. The Mozilla ToS and PPA controversies (detailed in §4) formalized this concern.

**Nation-state actors** appear in threat models for high-risk users (journalists, activists, whistleblowers), for whom Tor Browser remains the unambiguous recommendation. For this segment, the advice is unequivocal: "If your threat model calls for anonymity and advanced fingerprinting protection, USE TOR BROWSER."

### 1.2 Threat Model Stratification

The privacy community has developed a clear user stratification:

| Tier | Profile | Tool |
|------|---------|------|
| Baseline | Privacy from ad-tech; no unusual risk | Brave, Firefox + uBlock Origin |
| Intermediate | Ad-tech + fingerprinting; concerned about browser vendor | LibreWolf, Firefox + arkenfox |
| High | IP + fingerprint uniformity; advanced tracking resistance | Mullvad Browser + VPN |
| Anonymity | Whistleblower, journalist, activist | Tor Browser |

---

## 2. Anti-Fingerprinting Expectations and Implementations

### 2.1 The Core Divide: Uniformity vs. Randomization

The privacy browser community is philosophically divided on anti-fingerprinting strategy, and this shapes which browser users choose.

**Crowd uniformity model** (Tor Browser, Mullvad Browser, LibreWolf with RFP): All users of a given browser are designed to present an identical fingerprint. The theory is that a tracker cannot distinguish individual users within the crowd — they are all "one." Privacy Guides endorses this as the stronger model: "Mullvad Browser provides these protections out of the box... the only way to thwart advanced fingerprint tracking scripts." The Mullvad team states explicitly: "there's only one way to reduce the absurd personal data collection of today, and it's a classic: hide in the crowd."

**Randomization model** (Brave): Each session generates randomized, perturbed fingerprint values that are imperceptible to humans but differ from session to session. Brave argues this prevents cross-session linking without requiring a large user crowd. The limitation acknowledged by the community: "you cannot blend in with Chrome users generally... there is no crowd, because they are all unique." Randomization stops re-identification across sessions but cannot provide population-level anonymity set protection.

The community debate is not settled. Privacy Guides currently recommends Mullvad Browser for maximum anti-fingerprinting but acknowledges Brave's fingerprinting resistance as sufficient for most threat models.

### 2.2 Implementation by Browser

**Tor Browser**: The benchmark. Letterboxing rounds window dimensions to multiples of 200px. Uniform User-Agent. Canvas API blocked by default. Exit node provides IP anonymity. Trade-off: slow, occasional site breakage, not a daily driver for most.

**Mullvad Browser**: Tor Browser without the Tor network. Permanent private browsing mode (no persistent cookies). Pre-installed uBlock Origin + NoScript — users must NOT modify these or they break crowd uniformity. No sync. No telemetry. Mullvad's key philosophy: modifications to make the browser "unique" defeat its entire purpose.

**LibreWolf**: Enables `privacy.resistFingerprinting` (RFP) by default — Firefox's most comprehensive fingerprinting countermeasure. RFP effects: spoofed timezone (UTC), forced light theme, rounded window size, suppressed alt-key events. Canvas access is per-site prompted. Dynamic First-Party Isolation (dFPI) via ETP Strict. uBlock Origin bundled. Important: the LibreWolf FAQ advises against modifying any RFP-covered metric, as even one change creates a distinctive sub-fingerprint.

**arkenfox user.js**: Template for hardening Firefox. As of v128+, arkenfox moved from RFP-default to FPP (Firefox's newer Fingerprint Protection). FPP has less site breakage than full RFP and is the future direction. arkenfox explicitly acknowledges it aims at "basic or naive tracking scripts," not advanced fingerprint tracking. It does not provide crowd protection.

**Brave**: Per-session fingerprint randomization. CNAME cloaking blocked. Link decoration stripping (auto-redirect tracking URLs). Aggressive ad/tracker blocking in Shields. P3A analytics (privacy-preserving, uses STAR protocol) — can be disabled. Community concern: referral codes in installers, BAT/Rewards crypto integration, and the need to purchase Brave Origin ($59.99) to fully disable non-privacy features.

**Firefox (stock)**: ETP Strict blocks many fingerprinting scripts and cross-site trackers. FPP available. PPA (Privacy-Preserving Attribution) was added in FF128, enabled by default, caused major controversy, and was subsequently removed. Telemetry on by default but configurable.

### 2.3 What Privacy Users Expect

From community evidence, the minimum anti-fingerprinting bar for privacy-focused users is:
- Canvas API protection (block or randomize)
- Timezone spoofing
- WebGL restriction (per-site or blocked)
- User-Agent standardization
- State partitioning / cross-site cookie isolation

Advanced users add:
- Full RFP or Tor-level uniformity
- Letterboxing
- WebRTC IP leak prevention (Brave: "Disable non-proxied UDP")
- DRM disabled (LibreWolf disables by default — DRM "exposes unique client IDs, CPU/OS/Device/installed CDMs")

---

## 3. Ad and Tracker Blocking Norms

### 3.1 uBlock Origin as the Gold Standard

The privacy community has a near-unanimous standard: uBlock Origin (MV2) is the required baseline. Its advantages over alternatives:
- Dynamic filtering (per-domain, per-type blocking rules)
- Cosmetic blocking (hide ad containers after the fact)
- Anti-adblock circumvention
- Deep customization and custom filter lists
- Top-context URL awareness (can block based on the URL in the address bar)

Privacy Guides does not recommend any other ad blocker for desktop. LibreWolf and Mullvad Browser both ship with uBlock Origin pre-installed.

### 3.2 Manifest V3 Impact — Major Switch Trigger from Chrome

Manifest V3 is Chrome's new extension platform. Key consequences:
- **MV2 extensions (including uBlock Origin) began being disabled on Chrome** starting June 2024, with broader automatic disabling rolling out in October 2024
- uBlock Origin Lite (MV3) exists but is significantly less capable:
  - No dynamic filtering
  - No ability to enforce rules based on the top-context URL (address bar)
  - No anti-adblock circumvention
  - Fully declarative (no background script), meaning it cannot respond adaptively to sites that detect and block ad blockers
- An academic study (arXiv:2503.01000) directly examined "Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness"
- **Firefox explicitly kept full MV2 support** — a stated reason the privacy community endorses Firefox-family browsers (LibreWolf, Mullvad) over Chromium-based alternatives

The MV3 rollout is one of the two most significant cross-browser migration triggers of 2024–2025 (the other being the Firefox ToS controversy).

### 3.3 Beyond Ads: Advanced Tracker Blocking Expectations

**CNAME cloaking**: Trackers operate first-party CNAMEs to bypass domain-based blocklists. Brave specifically built a CNAME cloaking countermeasure. Apple's WebKit ITP caps cookies on CNAME-cloaked responses to 7 days. Firefox/LibreWolf have more limited protection here.

**Link decoration stripping**: UTM parameters (utm_source, utm_campaign), fbclid, gclid, and similar tracking parameters appended to URLs. Brave auto-redirects tracking URLs to clean versions. Firefox ETP Strict strips some parameters. Privacy users increasingly expect this as a default feature.

**Bounce tracking**: Redirect-based tracking that briefly routes users through tracker domains to deposit identifying cookies. Firefox ETP Strict handles some; WebKit ITP handles some.

**DNS-level blocking**: Pi-hole, NextDNS, AdGuard DNS used as complement to browser blocking. The privacy community treats DNS blocking as defense-in-depth, not a browser replacement. LibreWolf disables DoH by default specifically to avoid centralizing DNS trust.

### 3.4 Default-On vs. User-Configured Blocking

There is a community split between:
- **Default-on advocates**: Prefer browsers that block by default (Brave, LibreWolf with uBO, Mullvad). Reduces user configuration error and protects less-technical users.
- **User-configured advocates**: Prefer Firefox + arkenfox + uBO, where the user controls every setting, at the cost of needing expertise to configure correctly.

Privacy Guides currently recommends both philosophies for different use cases.

---

## 4. Telemetry Refusal

### 4.1 What Privacy Users Refuse

Privacy-focused users refuse any browser telemetry that cannot be:
1. Completely disabled without loss of functionality
2. Audited (open source)
3. Trusted to be genuinely aggregate/non-identifying

The escalation after 2024–2025 is that **browser vendor telemetry is now actively treated as a threat model element**, not merely an annoyance.

### 4.2 Firefox Telemetry Default and Controversy

Firefox collects by default: version, language, OS, hardware configuration, memory, crash information, update outcomes, and IP address (in server logs). Privacy Guides recommends disabling all five telemetry categories:
1. Send technical and interaction data
2. Allow personalized extension recommendations
3. Install and run studies
4. Send daily usage ping
5. Automatically send crash reports

**The February 2025 ToS Controversy** was a turning point. Mozilla introduced Firefox's first-ever Terms of Use and simultaneously removed its longstanding "we never sell your data" promise from its privacy FAQ. The ToS language was interpreted as broadly licensing user data to Mozilla. Ars Technica: "Firefox deletes promise to never sell personal data." The Verge covered Mozilla's clarification. A community poll on Boiling Steam received 700+ responses and found trust in Mozilla "mostly gone." Mozilla revised the language within days, but reputational damage was significant.

**The Privacy-Preserving Attribution (PPA)** incident preceded this: In July 2024, Firefox 128 shipped with PPA enabled by default — an experimental ad attribution API co-authored with Meta that allowed advertisers to measure campaign effectiveness through the browser. NOYB filed a GDPR complaint with EU regulators. Privacy Guides published "Mozilla Disappoints Us Yet Again." PPA was subsequently removed from Firefox entirely.

**The December 2025 AI-first pivot**: New CEO Anthony Enzor-DeMeo announced Firefox's pivot to becoming an "AI browser." Community backlash was immediate. Firefox responded with a commitment to build an "AI kill switch" to fully disable all AI features — indicating the community's veto power is recognized by Mozilla.

### 4.3 LibreWolf Telemetry Removals

LibreWolf strips: all Mozilla telemetry, Normandy studies, crash reporter, sponsored shortcuts, Pocket, Safe Browsing (Google API dependency). Outgoing connections are limited to security-critical updates (CRLite, ETP lists, uBO filter updates, add-on updates) with no user-identifying data.

### 4.4 Mullvad Browser Telemetry

Mullvad Browser removes all telemetry by design: "We don't believe in collecting data and have therefore removed telemetry."

### 4.5 Brave P3A

Brave's "Privacy Preserving Product Analytics" uses the STAR cryptographic protocol to report only aggregate histograms; no individual data is transmitted or linkable. It is opt-out. Privacy Guides recommends disabling it for strictest privacy. The existence of P3A is a source of community friction — even privacy-preserving analytics are perceived as a trust issue by a segment of users. Brave's launch of Brave Origin (paid, stripped browser) is a direct response to this tension.

---

## 5. Local-First and No-Cloud Demands

### 5.1 Sync

Privacy-focused users fall into three camps on sync:

1. **No sync**: Mullvad Browser has no sync by design. Many high-privacy users use separate browser profiles per context and consider sync itself a privacy surface.

2. **Encrypted cloud (E2EE)**: Firefox Sync encrypts data locally before transmission to Mozilla's servers. LibreWolf can enable Firefox Sync; users consider it acceptable because "Firefox Sync encrypts your data locally before transmitting it to the server." Brave Sync uses E2EE and does not require an account.

3. **Self-hosted**: A vocal community segment self-hosts Firefox's sync server (`syncstorage-rs`, rewritten in Rust). A 2025 guide ("Yes you CAN host your own Mozilla Sync Server") documents the process. The demand to self-host was also formally requested on Mozilla Connect, citing: "Better security and privacy as our data isn't leaving any of our device."

### 5.2 Local-First AI

The emergence of AI features in browsers has created a new axis of local-first demand. Privacy users require:
- Local LLM execution (no cloud API calls)
- No browsing history sent to external models
- No page content transmitted without explicit user action

Products emerging to serve this demand include NativeMind (local Ollama integration for browsers), Ocno AI (on-device browser assistant), and a dedicated Apex Browser with local AI. The Firefox AI-first announcement specifically triggered anxiety because Mozilla's phrasing implied cloud-backed AI features becoming defaults. The community's demand for an "AI kill switch" — and Firefox's commitment to provide one — is a direct expression of local-first values.

### 5.3 Password Management

Privacy-focused users prefer external password managers (Bitwarden, KeePassXC) over browser-built-in managers. LibreWolf disables the built-in password manager by default, stating: "We believe you should use a password manager that is better for your security and comfort."

---

## 6. Community Sizes

### 6.1 Project-Level Metrics (as of 2026-06-10)

| Project | Metric | Value | Source |
|---------|--------|-------|--------|
| arkenfox/user.js | GitHub stars | ~12,500 | github.com/arkenfox/user.js |
| arkenfox/user.js | GitHub forks | 556 | github.com/arkenfox/user.js |
| arkenfox/user.js | Last commit | 2026-05-12 | GitHub |
| Mullvad Browser | GitHub stars | ~2,330 | github.com/mullvad/mullvad-browser |
| Mullvad Browser | GitHub forks | 54 | GitHub |
| Mullvad Browser | Releases | 102 | GitHub |
| LibreWolf | Flathub DL/month | 48,133 | flathub.org |
| LibreWolf | AUR (bin) votes | 529 | aur.archlinux.org |
| LibreWolf | AUR (source) votes | 214 | aur.archlinux.org |
| LibreWolf | OpenHub contributors | 73 | openhub.net |
| LibreWolf | OpenHub commits (12mo) | 377 | openhub.net |
| Brave | MAU (April 2026) | 115.26M | cyberinsider.com |

### 6.2 Forum / Community Metrics

| Community | Platform | Size | Notes |
|-----------|----------|------|-------|
| r/privacy | Reddit | ~1.5–1.6M members | Redlib/GummySearch observations |
| r/firefox | Reddit | 16.7M+ across 15 related communities | Aggregate; main r/firefox alone smaller |
| r/privacyguides | Reddit | Went private (2023 protest); moved to discuss.privacyguides.net | — |
| r/degoogle | Reddit | "Thousands" (no precise count found) | [UNVERIFIED exact count] |
| LibreWolf Lemmy | Lemmy (mlym instance) | 3,781 readers | mlym.gregtech.eu |
| Privacy Guides forum | Discourse | Active; self-described "largest personal privacy forum" | discuss.privacyguides.net |

### 6.3 Market Context

- Firefox global market share: ~2.26–2.3% (and declining, per Statcounter and Cloudflare Q1 2025 data)
- Brave MAU: 115M+ — the largest explicitly privacy-positioning browser
- LibreWolf does not publish user counts; Flathub, AUR, and Chocolatey provide partial proxy metrics
- Statista (January 2025 survey): Brave was most popular among privacy-conscious users; Firefox second; LibreWolf had measurable share — exact percentages paywalled

---

## 7. Switch Triggers

### 7.1 Chrome → Firefox-Family: MV3 and uBlock Origin

The single clearest Chrome-exit trigger is the phased disabling of uBlock Origin (MV2) via Manifest V3. Starting June 2024 and accelerating through late 2024, Chrome automatically disabled uBlock Origin for users. The replacement (uBlock Origin Lite) is functionally inferior: no dynamic filtering, no anti-adblock bypass, no top-context URL rules. For users who consider ad blocking non-negotiable, Firefox's commitment to retain MV2 support is a compelling retention argument. Firefox-based browsers (LibreWolf, Mullvad) explicitly benefit from this.

### 7.2 Firefox → LibreWolf or Mullvad: 2024–2025 Trust Collapse

Four distinct events eroded Firefox trust among privacy users:

1. **PPA controversy** (July 2024): Ad attribution API enabled by default, co-authored with Meta. NOYB GDPR complaint filed. Community read this as Mozilla "working for advertisers."

2. **ToS controversy** (February 2025): First-ever Firefox Terms of Use with broad language; simultaneous deletion of "we never sell data" promise. Community reaction: "trust in Firefox and Mozilla is gone" (Boiling Steam poll, 700+ responses). Even after Mozilla's clarification and revision, reputational damage persisted.

3. **Firefox AI-first pivot** (December 2025): New CEO announced Firefox will evolve into "AI browser." Privacy community pushback: Mozilla "risks losing its soul." Firefox committed to an "AI kill switch" — but the announcement itself drove users who distrust cloud AI to explore alternatives.

4. **Market share anxiety**: Firefox at ~2.26% global market share feeds concerns about long-term viability of the browser and Mozilla's ability to maintain its independent, privacy-first mission.

The cumulative effect is that LibreWolf (hardened Firefox fork, no telemetry) and Mullvad Browser (Tor-grade fingerprinting without Tor overhead) have absorbed users who want Firefox's engine without Mozilla's decisions.

### 7.3 Brave: Friction Points

Brave is the largest privacy browser by MAU (115M) but faces community friction:
- **BAT/Crypto integration**: Brave Rewards, Brave Wallet — Privacy Guides explicitly discourages these. Custodial BAT wallet requires KYC.
- **P3A**: Even privacy-preserving analytics are distrusted by a portion of users.
- **Referral code in installer**: Privacy Guides flags: "Brave adds a referral code to the file name in downloads."
- **Brave Origin launch** (June 2026, $59.99): A paid browser SKU that strips Leo AI, Rewards, Wallet, VPN, and P3A. The fact that users must pay $59.99 to get a version without these features is itself a friction point — it signals the default browser bundles monetization features by design.

### 7.4 What Keeps Users

Despite the criticisms:
- **Brave**: Chromium compatibility, 115M MAU (network effects), best-in-class default ad/tracker blocking, CNAME cloaking protection, strong Shields
- **LibreWolf**: Firefox engine (MV2 support, add-on ecosystem), no Mozilla telemetry, RFP, uBO bundled, open source, community-maintained
- **Mullvad Browser**: Strongest fingerprint uniformity available outside Tor; Tor Project collaboration; free (no VPN required); clean design

---

## 8. Open Questions

1. **Exact r/privacyguides and r/degoogle subscriber counts**: r/privacyguides went private in 2023; current count unverified. r/degoogle lacks a precise public stat in available sources.

2. **LibreWolf install base**: No official user count exists. Flathub, AUR, and Chocolatey are proxies; true cross-platform total is unknown.

3. **Mullvad Browser adoption trajectory**: 2,330 GitHub stars and only 4 contributors suggests small developer team; adoption metrics beyond GitHub are unavailable.

4. **MV3's long-term impact**: Whether Firefox's MV2 retention drives sustained migration away from Chrome is still being measured.

5. **Firefox AI-first implementation**: Whether Firefox's "AI kill switch" satisfies privacy-focused users or drives further fragmentation toward LibreWolf/Mullvad.

6. **Brave Origin take-up rate**: No data on how many users are purchasing the $59.99 premium tier.

7. **arkenfox v128+ FPP vs. RFP adoption**: The shift from RFP to FPP as the arkenfox default (v128+) is technically significant; community adoption behavior unknown.

---

## Sources Used (Pre-Citation)

All claims traced to source URLs documented in `outputs/.drafts/privacy-browser-users-2026-research-direct.md`.
