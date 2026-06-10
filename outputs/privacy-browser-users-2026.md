# Privacy-Focused Browser Users in 2026: Intelligence Brief

**Date:** 2026-06-10
**Research mode:** Direct search (4 researcher subagents failed; lead executed all tracks)
**Sources:** 30+ web searches, 6 pages fetched directly

---

## Executive Summary

Privacy-focused browser users in 2026 operate with sharply articulated threat models centered on surveillance capitalism, fingerprinting, and — increasingly — browser vendor betrayal. The community has grown measurably: r/privacy has ~1.5M Reddit subscribers [[1]](#s1); Brave has 115.26M monthly active users [[2]](#s2); arkenfox's user.js repository has ~12,500 GitHub stars [[3]](#s3). Three events between 2024 and 2025 triggered community anger and browser migrations: Google's phased disabling of uBlock Origin via Manifest V3 [[4]](#s4), Mozilla's February 2025 Terms of Service controversy [[5]](#s5), and Mozilla's December 2025 "AI-first" CEO announcement [[6]](#s6). Anti-fingerprinting expectations are philosophically divided between the crowd-uniformity model (Tor, Mullvad Browser, LibreWolf/RFP) [[7]](#s7) and the randomization model (Brave) [[8]](#s8). Local-first and no-cloud demands are strong: Mullvad Browser ships with no sync by design [[9]](#s9); LibreWolf disables sync by default [[10]](#s10); the community actively self-hosts Firefox Sync servers [[11]](#s11). The clearest browser-switch trigger is any change perceived as trading user data for revenue.

---

## 1. Threat Models

### 1.1 Primary Threats Articulated by Privacy Users

Privacy-focused browser users in 2026 do not treat privacy as a monolith. The community consistently distinguishes four overlapping threat categories:

**Surveillance capitalism (ad-tech tracking)** is the baseline threat. Users expect to be tracked by ad networks, data brokers, and social media pixels across every unprotected site visit. Privacy Guides explicitly categorizes this as the primary threat browsers must address: "Protects against the following threat(s): Surveillance Capitalism." [[12]](#s12)

**Browser fingerprinting** — the collection of 22+ passive signals (canvas, WebGL, audio context, font enumeration, screen resolution, timezone, OS, GPU, language, plugin list) — is treated as a distinct and harder-to-block threat than cookies. A 2025 operator guide documented: "every site you visit collects 22 distinct signals from your browser, your hardware, and your behavior, without asking. None of them require cookies. Most are unaffected by VPN or private browsing." [[13]](#s13) Even with cookies blocked and a VPN active, a unique fingerprint can re-identify users.

**Network-layer surveillance (ISP, DNS)** occupies a second tier. LibreWolf explicitly states: "If you care about protecting your IP address, you should use a VPN or even better use the Tor Browser." [[10]](#s10) The community treats DNS-over-HTTPS (DoH) as a partial mitigation — LibreWolf disables DoH by default to avoid routing all DNS through a single cloud provider. [[10]](#s10)

**Browser vendor telemetry and betrayal** has become an elevated threat category after 2024–2025 events. The Mozilla PPA, ToS, and AI-pivot controversies formalized the community perception that browser vendors themselves are a privacy risk (see §4).

**Nation-state actors** appear in threat models for high-risk users (journalists, activists, whistleblowers), for whom Tor Browser remains the unambiguous recommendation. The arkenfox wiki states: "If your threat model calls for anonymity and advanced fingerprinting protection, USE TOR BROWSER." [[14]](#s14)

### 1.2 Threat Model Stratification

The privacy community has developed a clear user stratification:

| Tier | Profile | Recommended Tool |
|------|---------|-----------------|
| Baseline | Privacy from ad-tech; no unusual risk | Brave, Firefox + uBlock Origin |
| Intermediate | Ad-tech + fingerprinting; concerned about browser vendor | LibreWolf, Firefox + arkenfox |
| High | IP + fingerprint uniformity; advanced tracking resistance | Mullvad Browser + VPN |
| Anonymity | Whistleblower, journalist, activist | Tor Browser |

*Source: synthesized from Privacy Guides [[12]](#s12) and arkenfox wiki [[14]](#s14)*

---

## 2. Anti-Fingerprinting Expectations and Implementations

### 2.1 The Core Divide: Uniformity vs. Randomization

The privacy browser community is philosophically divided on anti-fingerprinting strategy.

**Crowd uniformity model** (Tor Browser, Mullvad Browser, LibreWolf with RFP): All users of a given browser present an identical fingerprint. A tracker cannot distinguish individual users within the crowd. Privacy Guides endorses this as the stronger model: "the only way to thwart advanced fingerprint tracking scripts." [[12]](#s12) Mullvad's team states: "there's only one way to reduce the absurd personal data collection of today, and it's a classic: hide in the crowd." [[9]](#s9)

**Randomization model** (Brave): Each session generates randomized, perturbed fingerprint values that differ from session to session. Brave: "randomizing fingerprintable values in ways that are imperceptible to humans, but which confuse fingerprints." [[8]](#s8) Community limitation noted on Privacy Guides forum: "you cannot blend in with Chrome users generally... there is no crowd, because they are all unique." [[15]](#s15) Randomization stops re-identification across sessions but cannot provide population-level anonymity.

### 2.2 Implementation by Browser

**Tor Browser**: Letterboxing (window size rounded to 200px increments), uniform User-Agent, canvas blocked by default, Tor network IP anonymity. Reviewed as "the only browser in our review set that solves both problems privacy users actually care about: hiding your network identity (IP) and hiding your browser identity (fingerprint)." [[16]](#s16)

**Mullvad Browser**: Tor Browser architecture without the Tor network. Permanent private browsing. Pre-installed uBlock Origin + NoScript — modifications break crowd uniformity and are explicitly warned against. No sync. No telemetry. [[9]](#s9) [[12]](#s12) Privacy Guides: "it is imperative that you do not modify the browser at all outside adjusting the default security levels." [[12]](#s12)

**LibreWolf**: Enables `privacy.resistFingerprinting` (RFP) by default. RFP effects: spoofed timezone (UTC), forced light theme, rounded window size, suppressed alt-key events. Canvas access is per-site prompted. Dynamic First-Party Isolation (dFPI) via ETP Strict. uBlock Origin bundled. LibreWolf FAQ: "we suggest against modifying any metric involved in RFP, as even a single change could make it useless." [[10]](#s10)

**arkenfox user.js**: Template for Firefox hardening. As of v128+, arkenfox moved from RFP-default to FPP (Firefox's newer Fingerprint Protection): "ATTN: arkenfox v128 is now RFP-inactive and FPP is default." [[17]](#s17) FPP has less site breakage. Privacy Guides: "Arkenfox only aims to thwart basic or naive tracking scripts... does not aim to make your browser blend in with a large crowd." [[12]](#s12)

**Brave**: Per-session fingerprint randomization. CNAME cloaking blocked. [[18]](#s18) Link decoration stripping (auto-redirect tracking URLs). [[12]](#s12) Aggressive Shields blocking. P3A analytics (privacy-preserving, STAR protocol, opt-out). Community concern: referral codes in installers; BAT/Rewards crypto integration. Brave Origin launched June 2026 at $59.99 to let users disable non-privacy features (Leo AI, Rewards, Wallet, VPN, P3A). [[19]](#s19) [[20]](#s20)

**Firefox (stock)**: ETP Strict blocks many fingerprinting scripts and cross-site trackers. FPP available but not maximum hardening. PPA (Privacy-Preserving Attribution) added FF128, enabled by default, removed after controversy. [[21]](#s21)

### 2.3 Independent Testing

PrivacyTests.org conducts open-source automated browser privacy tests. Issue 94 (2025-02-25) tested Brave 1.75, LibreWolf 135.0, Mullvad 14.0, Firefox 135.0, among others. Test categories include: state partitioning, fingerprinting, tracker blocking, HTTPS upgrading, private mode isolation. [[22]](#s22)

---

## 3. Ad and Tracker Blocking Norms

### 3.1 uBlock Origin as the Gold Standard

Privacy community consensus: uBlock Origin (MV2) is the required baseline. Features that distinguish it from alternatives:
- Dynamic filtering (per-domain, per-type blocking)
- Cosmetic blocking (hides ad containers post-load)
- Anti-adblock circumvention
- Top-context URL awareness
- Deep customization and custom filter lists

LibreWolf and Mullvad Browser both ship with uBlock Origin pre-installed. Privacy Guides does not recommend other ad blockers for desktop.

### 3.2 Manifest V3 Impact — Major Chrome-Exit Trigger

Chrome's Manifest V3 extension platform change is the single largest technical trigger for Chrome-to-Firefox migrations:

- Chrome began disabling MV2 extensions starting June 2024; broader automatic disabling rolled out October 2024 [[4]](#s4) [[23]](#s23)
- uBlock Origin (MV2) was automatically disabled for Chrome users
- uBlock Origin Lite (MV3 replacement) has significantly reduced capabilities: no dynamic filtering, no top-context URL rules, no adaptive anti-adblock capabilities [[24]](#s24)
- An academic study examined this directly: "Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness" (arXiv:2503.01000) [[25]](#s25)
- **Firefox retained full MV2 support** — explicitly a reason the privacy community endorses Firefox-family browsers

### 3.3 Advanced Tracker Blocking Expectations

**CNAME cloaking**: Brave specifically built a countermeasure: "Fighting CNAME trickery." [[18]](#s18) Apple's WebKit ITP caps cookies on CNAME-cloaked responses. [[26]](#s26) Firefox/LibreWolf have limited protection.

**Link decoration stripping**: UTM parameters, fbclid, gclid. Brave auto-redirects tracking URLs. A 2024 USENIX Security paper ("PURL: Safe and Effective Sanitization of Link Decoration") presents ML-based approaches. [[27]](#s27)

**Bounce tracking**: Firefox ETP Strict handles some cases; WebKit ITP handles some. [[26]](#s26)

**DNS-level blocking**: Pi-hole, NextDNS, AdGuard DNS are community standards as defense-in-depth. LibreWolf disables DoH by default to avoid centralizing DNS trust in one cloud provider. [[10]](#s10)

### 3.4 Mullvad's "Nothing More" Philosophy

Mullvad Browser: "uses uBlock Origin to block third-party trackers. Nothing more, as more attempts to block trackers ironically can reveal your identity." [[9]](#s9) This reflects the crowd-uniformity principle: adding uncommon block lists makes the user detectable through their blocking behavior.

---

## 4. Telemetry Refusal

### 4.1 Firefox: Default Telemetry and Major Controversies

**Default Firefox telemetry** collects: browser version, language, OS, hardware configuration, memory, crash information, update outcomes, and IP addresses (server logs). [[28]](#s28) Privacy Guides recommends disabling all five telemetry options in Firefox settings. [[12]](#s12)

**PPA controversy (July 2024)**: Firefox 128 shipped Privacy-Preserving Attribution enabled by default — an ad attribution API co-authored with Meta allowing advertisers to measure campaign effectiveness through the browser. NOYB filed an EU GDPR complaint in September 2024, calling it "Firefox tracks you with 'privacy preserving' feature." [[29]](#s29) [[30]](#s30) Privacy Guides published: "Mozilla Disappoints Us Yet Again." [[31]](#s31) PPA was subsequently removed: Mozilla's support page now notes it "was never activated and was later removed." [[21]](#s21)

**ToS controversy (February 2025)** — major switch trigger: Mozilla introduced Firefox's first-ever Terms of Use. The text contained broad licensing language over user data, simultaneously with the deletion of Mozilla's longstanding "we never sell your data" promise. Ars Technica: "Firefox deletes promise to never sell personal data, asks users not to panic." [[5]](#s5) The Verge: "Mozilla says its new Firefox terms don't give it ownership of your data." [[32]](#s32) A community poll received 700+ responses concluding "trust in Firefox and Mozilla is gone." [[33]](#s33) Mozilla revised the language within days, but reputational damage was significant. [[34]](#s34)

**AI-first pivot (December 2025)**: New CEO Anthony Enzor-DeMeo announced Firefox would evolve into an "AI browser." [[35]](#s35) Community backlash prompted Firefox to commit to an "AI kill switch" to fully disable AI features. [[36]](#s36)

### 4.2 LibreWolf: What Gets Stripped

LibreWolf removes all Mozilla telemetry, Normandy studies, crash reporter, sponsored shortcuts, Pocket, Safe Browsing (Google API), and health report pings. Remaining outgoing connections are limited to security-critical updates (CRLite certificate data, ETP tracker lists, uBO filter list updates) with no user-identifying content. [[10]](#s10)

### 4.3 Mullvad Browser: Zero Telemetry

"We don't believe in collecting data and have therefore removed telemetry." [[9]](#s9)

### 4.4 Brave: P3A (Privacy-Preserving Product Analytics)

Brave uses the STAR cryptographic protocol to report aggregate histograms only — no individual data is transmitted. P3A is opt-out. [[37]](#s37) Even so, the existence of any analytics is a source of friction with the strictest segment of the privacy community. Brave's launch of Brave Origin (paid, stripped of P3A and all monetization features) directly addresses this tension. [[19]](#s19)

---

## 5. Local-First and No-Cloud Demands

### 5.1 Sync Preferences

**No sync**: Mullvad Browser has no sync capability by design. [[12]](#s12) High-privacy users commonly use separate browser profiles per context and treat sync itself as a privacy surface.

**Encrypted cloud (E2EE)**: Firefox Sync encrypts data locally before transmission. LibreWolf FAQ: "There aren't significant downsides as Firefox Sync encrypts your data locally before transmitting it to the server." [[10]](#s10) Brave Sync uses E2EE and does not require an account. [[12]](#s12)

**Self-hosted**: Community demand for self-hosted Firefox sync server is active. A 2025 tutorial ("Yes you CAN host your own Mozilla Sync Server — Self-hosting syncstorage-rs in 2025") documents the process. [[11]](#s11) Mozilla Connect hosts a feature request for native self-hosted sync: "Better security and privacy as our data isn't leaving any of our device." [[38]](#s38)

### 5.2 Local AI Demand

The emergence of browser AI features created a new axis of local-first demand. Privacy users require local LLM execution with no browsing data sent to cloud APIs. Products in this space: NativeMind (local Ollama integration), Ocno AI, Apex Browser (Chromium + local AI). [[39]](#s39) Firefox's AI-first announcement drove anxiety because of cloud LLM implications; the "AI kill switch" commitment is the direct response to this. [[36]](#s36)

### 5.3 Password Management

LibreWolf disables the built-in password manager by default: "We believe you should use a password manager that is better for your security and comfort." [[10]](#s10) Community recommends Bitwarden, KeePassXC, or similar open-source managers.

---

## 6. Community Sizes

### 6.1 Project-Level Metrics (as of 2026-06-10)

| Project | Metric | Value | Source |
|---------|--------|-------|--------|
| arkenfox/user.js | GitHub stars | ~12,500 | [[3]](#s3) |
| arkenfox/user.js | GitHub forks | 556 | [[3]](#s3) |
| arkenfox/user.js | Last commit | 2026-05-12 (active) | [[3]](#s3) |
| Mullvad Browser | GitHub stars | ~2,330 | [[40]](#s40) |
| Mullvad Browser | GitHub forks | 54 | [[40]](#s40) |
| Mullvad Browser | Releases | 102 | [[40]](#s40) |
| Mullvad Browser | Core contributors | 4 | [[40]](#s40) |
| LibreWolf | Flathub downloads/month | 48,133 | [[41]](#s41) |
| LibreWolf | AUR (bin) votes | 529 | [[42]](#s42) |
| LibreWolf | AUR (source) votes | 214 | [[43]](#s43) |
| LibreWolf | OpenHub contributors (12mo) | 73 | [[44]](#s44) |
| LibreWolf | OpenHub commits (12mo) | 377 | [[44]](#s44) |
| Brave | MAU (April 2026) | 115.26M | [[2]](#s2) |

### 6.2 Forum / Community Metrics

| Community | Platform | Size | Notes |
|-----------|----------|------|-------|
| r/privacy | Reddit | ~1.5–1.6M members | [[1]](#s1) [[45]](#s45) |
| r/firefox | Reddit | 16.7M+ across 15 communities | Aggregate [[46]](#s46) |
| r/privacyguides | Reddit | Private since 2023 protest; migrated to Discourse + Lemmy | [[47]](#s47) |
| r/degoogle | Reddit | "Thousands" — no precise count found | [UNVERIFIED] |
| LibreWolf Lemmy | Lemmy | 3,781 readers | [[48]](#s48) |
| Privacy Guides Discourse | forum | Self-described "largest personal privacy forum" | [[49]](#s49) |

### 6.3 Market Context

- Firefox global market share: ~2.26–2.3% (declining, per StatCounter and Cloudflare Q1 2025 data) [[50]](#s50) [[51]](#s51)
- Brave at 115M+ MAU is the largest explicitly privacy-positioning browser [[2]](#s2)
- A January 2025 Statista survey showed Brave as most popular among privacy-conscious users, Firefox second, LibreWolf having measurable share (exact percentages paywalled) [[52]](#s52)

---

## 7. Switch Triggers

### 7.1 Chrome → Firefox-Family: MV3 and uBlock Origin (2024–ongoing)

The clearest Chrome-exit trigger is the automatic disabling of uBlock Origin (MV2) via Manifest V3. Starting June 2024 and accelerating through October 2024, Chrome disabled uBlock Origin for users. [[4]](#s4) [[23]](#s23) uBlock Origin Lite (MV3) is a weaker replacement lacking dynamic filtering, anti-adblock circumvention, and top-context URL rules. [[24]](#s24) Firefox's retention of MV2 support is the direct counter-argument for staying in the Firefox ecosystem.

### 7.2 Firefox → LibreWolf or Mullvad: 2024–2025 Trust Collapse

Four distinct events eroded Firefox trust:

1. **PPA controversy** (July 2024): Ad attribution API enabled by default, co-authored with Meta. NOYB GDPR complaint. [[29]](#s29) [[30]](#s30) [[31]](#s31)
2. **ToS controversy** (February 2025): First-ever ToS with broad data language; "never sell data" promise deleted. 700+ community poll responses: "trust... is gone." [[5]](#s5) [[33]](#s33)
3. **AI-first pivot** (December 2025): New CEO announced AI browser direction. Backlash; "AI kill switch" promised. [[35]](#s35) [[36]](#s36)
4. **Market share decline**: ~2.26% globally raises existential questions about Mozilla's independence and future funding. [[50]](#s50)

### 7.3 Brave: Friction Points

Brave is the largest privacy browser (115M MAU) but faces internal community friction:
- BAT/crypto integration; Rewards requiring KYC-verified custodial wallet [[12]](#s12)
- P3A analytics (opt-out but distrusted by strict users) [[37]](#s37)
- Referral codes embedded in installer files [[12]](#s12)
- Brave Origin ($59.99 one-time) needed to fully disable monetization features [[19]](#s19) [[20]](#s20) — signals that the free version bundles features by design

---

## 8. Open Questions

1. **Exact r/privacyguides and r/degoogle counts**: r/privacyguides went private in 2023; r/degoogle lacks a verifiable subscriber count in available sources. Both are marked [UNVERIFIED].
2. **LibreWolf total install base**: No official user count. Flathub, AUR, and Chocolatey are partial proxies only.
3. **Mullvad Browser adoption trajectory**: Small contributor team (4 people); no usage metrics beyond GitHub stars available.
4. **MV3 long-term migration data**: Whether MV3-driven Firefox adoption shows in market share data is not yet confirmed.
5. **Brave Origin take-up rate**: No public data on paid-tier adoption.
6. **arkenfox FPP vs. RFP community adoption**: v128+ default shift from RFP to FPP is technically significant; community split unknown.
7. **Firefox "AI kill switch" implementation**: Whether the feature ships in a form satisfying to privacy users remains open.

---

## Sources

<a name="s1"></a>**[1]** r/privacy subscriber count: https://redlib.manerakai.com/r/privacy ("1.5m" members)

<a name="s2"></a>**[2]** Brave MAU 115.26M (April 2026): https://cyberinsider.com/brave-sees-100-linux-growth-as-browser-reaches-115m-monthly-users/ ; https://cyberinsider.com/brave-launches-minimalist-origin-browser-with-only-core-privacy-features/

<a name="s3"></a>**[3]** arkenfox GitHub: https://github.com/arkenfox/user.js/ (stars ~12,500, last push 2026-05-12)

<a name="s4"></a>**[4]** uBlock Origin disabled on Chrome (Oct 2024): https://9to5google.com/2024/10/15/google-chrome-disables-ublock-origin/

<a name="s5"></a>**[5]** Firefox "never sell data" promise deleted: https://arstechnica.com/tech-policy/2025/02/firefox-deletes-promise-to-never-sell-personal-data-asks-users-not-to-panic/

<a name="s6"></a>**[6]** Firefox AI-first CEO announcement: https://techcrunch.com/2025/12/17/mozillas-new-ceo-says-ai-is-coming-to-firefox-but-will-remain-a-choice/

<a name="s7"></a>**[7]** Mullvad Browser crowd model: https://mullvad.net/en/browser

<a name="s8"></a>**[8]** Brave fingerprint randomization: https://brave.com/privacy-updates/3-fingerprint-randomization/

<a name="s9"></a>**[9]** Mullvad Browser product page (no telemetry, no sync, uBO only): https://mullvad.net/en/browser

<a name="s10"></a>**[10]** LibreWolf FAQ: https://librewolf.net/docs/faq/

<a name="s11"></a>**[11]** Self-hosting Firefox Sync 2025: https://www.kyzer.me.uk/syncserver/

<a name="s12"></a>**[12]** Privacy Guides desktop browsers: https://www.privacyguides.org/en/desktop-browsers/

<a name="s13"></a>**[13]** 22 tracking vectors: https://predaxia.com/operator-guide-website-tracking/

<a name="s14"></a>**[14]** arkenfox wiki "To Arkenfox or Not": https://github.com/arkenfox/user.js/wiki/1.1-To-Arkenfox-or-Not

<a name="s15"></a>**[15]** Brave fingerprinting vs. crowd uniformity (Privacy Guides community): https://discuss.privacyguides.net/t/is-it-possible-that-brave-has-stronger-fingerprinting-protection-than-firefox/17075

<a name="s16"></a>**[16]** Tor Browser 2026 review: https://securerank.info/reviews/browsers/tor-browser/

<a name="s17"></a>**[17]** arkenfox v128 RFP → FPP change: https://github.com/arkenfox/user.js/issues/1804

<a name="s18"></a>**[18]** Brave CNAME cloaking: https://brave.com/privacy-updates/6-cname-trickery/

<a name="s19"></a>**[19]** Brave Origin launch ($59.99): https://brave.com/origin/ ; https://brave.com/blog/brave-origin/

<a name="s20"></a>**[20]** Brave Origin Verge coverage: https://www.theverge.com/tech/943637/brave-is-selling-a-minimalist-version-of-its-browser-for-59-99

<a name="s21"></a>**[21]** Firefox PPA removed: https://support.mozilla.org/en-US/kb/privacy-preserving-attribution

<a name="s22"></a>**[22]** PrivacyTests.org: https://privacytests.org/index ; https://privacytests.org/news

<a name="s23"></a>**[23]** Chrome uBlock Origin broader disabling: https://www.bleepingcomputer.com/news/google/google-chrome-disables-ublock-origin-for-some-in-manifest-v3-rollout/ ; https://web.archive.org/web/20250822220411/https:/www.theverge.com/news/622953/google-chrome-extensions-ublock-origin-disabled-manifest-v3

<a name="s24"></a>**[24]** uBlock Origin Lite (MV3) limitations: https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ) ; https://adblock-tester.com/ad-blockers/ublock-origin-vs-ublock-origin-lite/

<a name="s25"></a>**[25]** Academic MV3 study: https://arxiv.org/html/2503.01000

<a name="s26"></a>**[26]** WebKit CNAME cloaking + bounce tracking: https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/

<a name="s27"></a>**[27]** PURL link decoration (USENIX 2024): https://arxiv.org/html/2308.03417

<a name="s28"></a>**[28]** Firefox telemetry documentation: https://support.mozilla.org/en-US/kb/technical-and-interaction-data ; https://docs.telemetry.mozilla.org/introduction/what_data

<a name="s29"></a>**[29]** NOYB Firefox PPA GDPR complaint: https://noyb.eu/en/firefox-tracks-you-privacy-preserving-feature

<a name="s30"></a>**[30]** TechCrunch NOYB Firefox: https://techcrunch.com/2024/09/25/mozilla-hit-with-privacy-complaint-in-eu-over-firefox-tracking-tech/

<a name="s31"></a>**[31]** Privacy Guides on PPA: https://www.privacyguides.org/articles/2024/07/14/mozilla-disappoints-us-yet-again-2/

<a name="s32"></a>**[32]** The Verge on Firefox ToS: https://www.theverge.com/news/621796/mozilla-firefox-terms-of-use-ownership-data

<a name="s33"></a>**[33]** Boiling Steam trust poll: https://boilingsteam.com/poll-trust-in-firefox-mozilla-is-gone/

<a name="s34"></a>**[34]** Mozilla ToS update response: https://blog.mozilla.org/en/firefox/update-on-terms-of-use/ ; https://techcrunch.com/2025/02/28/mozilla-responds-to-backlash-over-new-terms-saying-its-not-using-peoples-data-for-ai/

<a name="s35"></a>**[35]** Firefox AI browser direction: https://www.omgubuntu.co.uk/2025/12/mozilla-new-ceo-firefox-ai-browser-strategy

<a name="s36"></a>**[36]** Firefox "AI kill switch": https://www.howtogeek.com/firefox-will-make-an-ai-kill-switch-to-address-complaints/

<a name="s37"></a>**[37]** Brave P3A: https://support.brave.app/hc/en-us/articles/9140465918093-What-is-P3A-in-Brave ; https://github.com/brave/brave-browser/wiki/P3A

<a name="s38"></a>**[38]** Mozilla Connect self-hosted sync: https://connect.mozilla.org/t5/ideas/self-host-firefox-sync/idi-p/24415

<a name="s39"></a>**[39]** Local AI browser tools: https://www.xda-developers.com/browserai-is-the-agentic-browser-that-uses-your-local-llm/

<a name="s40"></a>**[40]** Mullvad Browser GitHub: https://github.com/mullvad/mullvad-browser

<a name="s41"></a>**[41]** LibreWolf Flathub (48,133 DL/mo): https://flathub.org/en/apps/io.gitlab.librewolf-community

<a name="s42"></a>**[42]** LibreWolf AUR bin (529 votes): https://aur.archlinux.org/packages/librewolf-bin

<a name="s43"></a>**[43]** LibreWolf AUR source (214 votes): https://aur.archlinux.org/pkgbase/librewolf

<a name="s44"></a>**[44]** LibreWolf OpenHub stats: https://openhub.net/p/LibreWolf

<a name="s45"></a>**[45]** r/privacy 1.6M (GummySearch): https://gummysearch.com/r/theprivacymachine/

<a name="s46"></a>**[46]** r/firefox 16.7M aggregate: https://painonsocial.com/products/firefox

<a name="s47"></a>**[47]** r/privacyguides went private: https://sh.itjust.works/post/46843

<a name="s48"></a>**[48]** LibreWolf Lemmy (3,781 readers): https://mlym.gregtech.eu/c/librewolf@lemmy.ml

<a name="s49"></a>**[49]** Privacy Guides Discourse: https://discuss.privacyguides.net/

<a name="s50"></a>**[50]** Firefox market share ~2.26–2.3%: https://winbuzzer.com/2025/12/17/mozilla-pivots-to-ai-first-firefox-sparking-privacy-backlash-xcxwbn/

<a name="s51"></a>**[51]** Cloudflare browser market share Q1 2025: https://radar.cloudflare.com/reports/browser-market-share-2025-q1

<a name="s52"></a>**[52]** Statista privacy browser survey (Jan 2025): https://www.statista.com/statistics/1607838/preferred-browsers-for-privacy/
