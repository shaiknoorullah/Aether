# Direct Research Notes: Privacy Browser Users 2026

**Date:** 2026-06-10
**Mode:** Lead-direct (researcher subagents failed due to pi-cli-wrapper module error)

## Search Queries Executed

1. "privacy browser threat models 2025 2026 fingerprinting cross-site tracking ISP surveillance"
2. "LibreWolf Mullvad Browser anti-fingerprinting features comparison 2025"
3. "arkenfox user.js resistFingerprinting what does it do browser privacy"
4. "arkenfox user.js GitHub stars 2025 2026"
5. "LibreWolf download statistics installs users 2025"
6. "Mullvad Browser GitHub stars community size"
7. "r/privacyguides r/privacy subreddit subscribers members 2025 2026"
8. "Firefox telemetry 2025 terms of service controversy Mozilla privacy"
9. "Chrome Manifest V3 uBlock Origin impact ad blocking 2024 2025"
10. "Mozilla Privacy Preserving Attribution PPA Firefox controversy opt-out 2024"
11. "LibreWolf Flathub installs AUR stats 2025 2026"
12. "privacy browser users local-first sync no cloud demand 2025"
13. "Brave browser switch away concerns 2025 BAT crypto telemetry P3A"
14. "self-hosted Firefox Sync server privacy community demand 2025"
15. "r/degoogle r/privacy r/firefox subscriber count members 2025"
16. "PrivacyTests.org browser fingerprinting 2025 results comparison"
17. "Brave fingerprint randomization vs uniformity debate privacy community"
18. "CNAME cloaking bounce tracking link decoration browser privacy 2025"
19. "Firefox switch browser 2025 migration privacy users survey"
20. "uBlock Origin Lite MV3 difference capabilities reduced effectiveness"
21. "Brave 115 million users 2025 market share privacy browser"
22. "Firefox telemetry data collected 2025 what information Mozilla collects default"
23. "privacy browser users no AI cloud features local AI demand 2025"
24. "LibreWolf GitLab community size matrix r/LibreWolf subscribers"
25. "r/privacy subreddit 1.2 million members 2025 OR 2026"
26. "r/privacyguides subreddit 100000 members 2025"
27. "Firefox market share decline 2025 privacy users switching"
28. "r/degoogle subscriber count 2025 2026"
29. "r/firefox members subscribers 2025"
30. "Firefox AI-first CEO privacy backlash 2025"
31. "Brave Origin browser premium price 2026"

## Pages Fetched

- https://privacytests.org/index (PrivacyTests.org desktop results)
- https://www.privacyguides.org/en/desktop-browsers/ (Privacy Guides recommendations)
- https://librewolf.net/docs/faq/ (LibreWolf FAQ)
- https://mullvad.net/en/browser (Mullvad Browser page)
- https://flathub.org/en/apps/io.gitlab.librewolf-community (Flathub page)
- https://github.com/arkenfox/user.js/wiki/1.1-To-Arkenfox-or-Not

---

## T1 Evidence: Threat Models & Anti-Fingerprinting

### Threat Model Components

1. **Browser fingerprinting** — 22 signals collected by default per operator guide (Predaxia, 2025):
   canvas, WebGL, audio, font enumeration, screen layout, hardware, timezone, UA string, language, plugins
   Source: https://predaxia.com/operator-guide-website-tracking/

2. **Cross-site tracking** — third-party cookies, CNAME cloaking, link decoration (UTM params, fbclid), bounce tracking
   Source: https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/

3. **ISP surveillance** — DNS queries reveal visited domains; ISP can see traffic shape
   Source: https://routeharden.com/blog/threat-models-for-network-anonymity

4. **Browser vendor telemetry** — increasingly treated as threat by privacy community
   Source: Privacy Guides page; LibreWolf FAQ

5. **Surveillance capitalism (ad networks)** — primary threat model per Privacy Guides
   Source: https://www.privacyguides.org/en/desktop-browsers/
   "Protects against the following threat(s): Surveillance Capitalism"

### Anti-Fingerprinting Techniques by Browser

#### Tor Browser
- Letterboxing (rounds window size to 200px increments)
- Uniform User-Agent (all users look identical)
- Canvas API blocked by default
- Tor network hides IP
- Gold standard; "only browser that solves both problems" (network + fingerprint identity)
  Source: https://securerank.info/reviews/browsers/tor-browser/

#### Mullvad Browser
- Based on Tor Browser with Tor network removed
- "Hide in the crowd" model — all users designed to look identical
- Permanent private browsing mode (no persistent cookies)
- uBlock Origin + NoScript pre-installed; modifications break the crowd model
- No sync whatsoever
- No telemetry
- Pairs with VPN (Mullvad or other) for IP masking
  Source: https://mullvad.net/en/browser
  Source: https://www.privacyguides.org/en/desktop-browsers/
  "designed to prevent fingerprinting by making your browser fingerprint identical to all other Mullvad Browser users"

#### LibreWolf
- Enables Firefox's RFP (`privacy.resistFingerprinting`) by default
- RFP spoofs: timezone (UTC), forces light theme, rounds window size, suppresses alt-key events
- Canvas access prompts user per-site
- Letterboxing optional (recommended for window size protection)
- dFPI (Dynamic First Party Isolation) via ETP Strict
- uBlock Origin pre-installed
- Firefox Sync disabled by default
  Source: https://librewolf.net/docs/faq/

#### arkenfox user.js
- v128+ changed: RFP is "RFP-inactive" in newer versions by default; uses FPP (Fingerprint Protection) instead
  Source: https://github.com/arkenfox/user.js/issues/1804
- Purpose: template for Firefox hardening; "thwart basic or naive tracking scripts"
- Does NOT aim for crowd blending like Mullvad/Tor
  Source: https://www.privacyguides.org/en/desktop-browsers/
  "Arkenfox only aims to thwart basic or naive tracking scripts... does not aim to make your browser blend in with a large crowd"

#### Firefox (with recommended settings)
- ETP Strict mode blocks: social media trackers, fingerprinting scripts, cryptominers, cross-site tracking cookies
- FPP (Fingerprint Protection) = newer, less-breakage approach vs RFP
- PPA (Privacy-Preserving Attribution): added FF128, enabled by default, removed after controversy
  Source: https://support.mozilla.org/en-US/kb/privacy-preserving-attribution
  "Privacy-preserving attribution (PPA) was an experimental feature in Firefox version 128 which was never activated and was later removed."

#### Brave
- Fingerprint randomization model: each session generates different randomized values
- Does NOT use crowd model
- "Brave's approach... randomizing fingerprintable values in ways that are imperceptible to humans, but which confuse fingerprints"
  Source: https://brave.com/privacy-updates/3-fingerprint-randomization/
- Community debate: randomization vs. uniformity
  Source: https://discuss.privacyguides.net/t/is-it-possible-that-brave-has-stronger-fingerprinting-protection-than-firefox/17075
- Brave removed "strict fingerprinting protection" mode (see privacy guides community post)
  Source: https://discuss.privacyguides.net/t/brave-removes-strict-fingerprinting-protection/16302

### Uniformity vs. Randomization Debate
- **Uniformity** (Tor/Mullvad/LibreWolf-RFP): All users look identical → requires large crowd; strongest against advanced tracking but breaks sites
- **Randomization** (Brave): Each session looks different → stops cross-session tracking but no crowd to blend with
- Community view: Mullvad Browser preferred for "strongest anti-fingerprinting" per Privacy Guides

### Independent Testing
- PrivacyTests.org Issue 94 (2025-02-25) tested: Brave 1.75, LibreWolf 135.0, Mullvad 14.0, Firefox 135.0
  Source: https://privacytests.org/news
- PrivacyTests.org tests: state partitioning, fingerprinting, tracker blocking, cookie isolation, HTTPS upgrading
- Full results page: https://privacytests.org/index

---

## T2 Evidence: Community Sizes

### arkenfox/user.js
- **GitHub stars: ~12,400–12,545** (as of 2026-05-12)
- Forks: 556
- License: MIT
- Created: 2017-02-16
- Last push: 2026-05-12 (actively maintained)
- Latest release: v144 (2026-04-20), v140-1 also current
  Source: https://github.com/arkenfox/user.js/
  Source: https://github.com/arkenfox

### LibreWolf
- **Flathub downloads/month: 48,133** (observed on Flathub page, ~2026-06)
  Source: https://flathub.org/en/apps/io.gitlab.librewolf-community
- AUR librewolf-bin: **529 votes**, popularity 30.4
- AUR librewolf (source): **214 votes**, popularity 10.x
  Source: https://aur.archlinux.org/packages/librewolf-bin
  Source: https://aur.archlinux.org/pkgbase/librewolf
- Chocolatey recent downloads: v149.0.0.1 = 1,333; v148.0.x = 2,422; v146.0.1.1 = 5,049
  Source: https://community.chocolatey.org/packages/librewolf
- OpenHub: 73 contributors (up +48/192% from previous 12 months), 377 commits in prior 12 months
  Source: https://openhub.net/p/LibreWolf
- Development moved from GitLab to Codeberg (https://codeberg.org/librewolf)
  Source: https://gitlab.com/librewolf-community
- r/LibreWolf: Lemmy community has 3,781 readers (Lemmy instance mlym.gregtech.eu)
  Source: https://mlym.gregtech.eu/c/librewolf@lemmy.ml
- Statista survey (Jan 2025): LibreWolf used by some percentage of privacy-focused users (exact number paywalled)
  Source: https://www.statista.com/statistics/1607838/preferred-browsers-for-privacy/
  [UNVERIFIED exact %, paywalled]

### Mullvad Browser
- **GitHub stars: ~2,316–2,330** (as of 2026-06-03)
- Forks: 54
- Contributors: 4
- 102 releases; latest: 16.0a7 (2026)
- Created: 2022-09-21 (relatively new)
  Source: https://github.com/mullvad/mullvad-browser
- Collaboration between Mullvad VPN (3,531 GitHub followers) and Tor Project
  Source: https://github.com/mullvad

### Reddit / Forum Sizes
- **r/privacy: ~1.5–1.6M members** (Redlib shows "1.5m"; GummySearch shows "1.6M")
  Source: https://redlib.manerakai.com/r/privacy
- **r/firefox**: 15 Firefox-related communities with "16.7M+ total members"
  Source: https://painonsocial.com/products/firefox (2026)
  [Note: this is aggregate across all Firefox communities, not just the main subreddit]
- **r/degoogle**: described as having "thousands of members"; no precise count found
  Source: https://www.webpronews.com/the-degoogle-movement-fighting-surveillance-with-privacy-alternatives/
  [UNVERIFIED exact count]
- **r/privacyguides**: Went private during 2023 Reddit API protest; community moved to discuss.privacyguides.net and Lemmy; exact current subscriber count not retrieved
  Source: https://sh.itjust.works/post/46843

### Brave (for comparison)
- **115.26 million MAU** as of April 2026 (up from 80M January 2025, 101M September 2024)
  Source: https://cyberinsider.com/brave-sees-100-linux-growth-as-browser-reaches-115m-monthly-users/
  Source: https://brave.com/blog/100m-mau/

### Firefox market share
- ~2.26–2.3% globally (StatCounter, Cloudflare data)
  Source: https://gs.statcounter.com/browser-market-share/all/worldwide/2025
  Source: https://winbuzzer.com/2025/12/17/mozilla-pivots-to-ai-first-firefox-sparking-privacy-backlash-xcxwbn/

---

## T3 Evidence: Telemetry & Local-First

### Firefox Telemetry (Default)
- Collects: version, language, OS, hardware config, memory, crash info, update outcomes, IP address (server logs)
- Normandy studies: periodic opt-out A/B testing
- Crash Reporter: automatic
- Sends to Mozilla; can opt out in Privacy & Security settings
  Source: https://support.mozilla.org/en-US/kb/technical-and-interaction-data
  Source: https://docs.telemetry.mozilla.org/introduction/what_data
- Privacy Guides recommended settings include unchecking ALL 5 telemetry boxes:
  - "Send technical and interaction data"
  - "Allow personalized extension recommendations"
  - "Install and run studies"
  - "Send daily usage ping to Mozilla"
  - "Automatically send crash reports"
  Source: https://www.privacyguides.org/en/desktop-browsers/

### Firefox ToS Controversy (February 2025) — MAJOR SWITCH TRIGGER
- February 26, 2025: Mozilla introduced **first-ever Terms of Use** for Firefox
- ToS contained broad language interpreted as granting Mozilla a license over user data
- Mozilla simultaneously **deleted the longstanding "we never sell your data" promise**
  Source: https://arstechnica.com/tech-policy/2025/02/firefox-deletes-promise-to-never-sell-personal-data-asks-users-not-to-panic/
- Community backlash: poll on Boiling Steam received 700+ responses; "trust in Firefox and Mozilla is gone"
  Source: https://boilingsteam.com/poll-trust-in-firefox-mozilla-is-gone/
- Mozilla responded Feb 28: said it wasn't changing how it uses data, just clarifying; revised language
  Source: https://blog.mozilla.org/en/firefox/update-on-terms-of-use/
  Source: https://techcrunch.com/2025/02/28/mozilla-responds-to-backlash-over-new-terms-saying-its-not-using-peoples-data-for-ai/
  Source: https://www.theverge.com/news/621796/mozilla-firefox-terms-of-use-ownership-data

### Privacy-Preserving Attribution (PPA) Controversy (2024)
- Firefox 128 (July 2024): Mozilla added PPA API, enabled by default, co-authored with Meta
- PPA allows advertisers to measure ad effectiveness via browser
- NOYB filed EU GDPR complaint September 2024
  Source: https://techcrunch.com/2024/09/25/mozilla-hit-with-privacy-complaint-in-eu-over-firefox-tracking-tech/
  Source: https://noyb.eu/en/firefox-tracks-you-privacy-preserving-feature
- Privacy Guides called it "Mozilla Disappoints Us Yet Again"
  Source: https://www.privacyguides.org/articles/2024/07/14/mozilla-disappoints-us-yet-again-2/
- PPA subsequently removed from Firefox (Mozilla support page confirms it "was never activated and was later removed")
  Source: https://support.mozilla.org/en-US/kb/privacy-preserving-attribution

### Firefox AI-First Pivot (December 2025) — SWITCH TRIGGER
- December 16, 2025: New CEO Anthony Enzor-DeMeo announced Firefox will become "AI browser"
  Source: https://techcrunch.com/2025/12/17/mozillas-new-ceo-says-ai-is-coming-to-firefox-but-will-remain-a-choice/
  Source: https://www.omgubuntu.co.uk/2025/12/mozilla-new-ceo-firefox-ai-browser-strategy
- Community backlash; privacy users warned it "risks losing its soul"
  Source: https://www.ibtimes.com/mozilla-pushes-firefox-towards-ai-loyal-users-warn-it-risks-losing-its-soul-3792909
- Firefox responded with plan for "AI kill switch" to fully disable AI features
  Source: https://www.howtogeek.com/firefox-will-make-an-ai-kill-switch-to-address-complaints/

### LibreWolf Telemetry Removals
- Removes all Mozilla telemetry
- Removes sponsored shortcuts, Pocket, Studies, Normandy
- DuckDuckGo as default search (privacy-respecting)
- DoH disabled by default (avoids single cloud DNS entity)
- Safe Browsing disabled (Google dependency concern)
  Source: https://librewolf.net/docs/faq/

### Mullvad Browser Telemetry
- "We don't believe in collecting data and have therefore removed telemetry."
  Source: https://mullvad.net/en/browser

### Brave P3A
- Privacy-Preserving Product Analytics — uses STAR cryptographic protocol for aggregation
- Reports aggregate metrics only; no individual tracking
- Can be disabled: "Uncheck Allow privacy-preserving product analytics (P3A)"
  Source: https://support.brave.app/hc/en-us/articles/9140465918093-What-is-P3A-in-Brave
  Source: https://www.privacyguides.org/en/desktop-browsers/

### Local-First / No-Cloud Demands
- LibreWolf: Firefox Sync disabled by default; can enable (E2EE); self-hosted sync server possible
  Source: https://librewolf.net/docs/faq/
- Mullvad Browser: **No sync at all** — by design
  Source: https://www.privacyguides.org/en/desktop-browsers/
- Self-hosted Firefox Sync: active community demand; blog post "Yes you CAN host your own Mozilla Sync Server - Self-hosting syncstorage-rs in 2025"
  Source: https://www.kyzer.me.uk/syncserver/
- Mozilla Connect idea "Self-host Firefox Sync" requested by community
  Source: https://connect.mozilla.org/t5/ideas/self-host-firefox-sync/idi-p/24415
- Local AI preference: growing market for on-device LLM browser tools (NativeMind, Ocno AI, Apex Browser)
  Source: https://www.xda-developers.com/browserai-is-the-agentic-browser-that-uses-your-local-llm/
- Firefox AI-first pivot opposed as "cloud AI" threat to privacy; "AI kill switch" demanded
  Source: https://www.howtogeek.com/firefox-will-make-an-ai-kill-switch-to-address-complaints/

---

## T4 Evidence: Switch Triggers & Ad/Tracker Blocking

### Chrome → Firefox/LibreWolf/Mullvad: MV3 Switch Trigger
- Manifest V3 (MV3): Chrome's new extension platform replacing MV2
- **June 2024**: Chrome began disabling MV2 extensions; October 2024 broader rollout
  Source: https://9to5google.com/2024/10/15/google-chrome-disables-ublock-origin/
  Source: https://www.bleepingcomputer.com/news/google/google-chrome-disables-ublock-origin-for-some-in-manifest-v3-rollout/
  Source: https://web.archive.org/web/20250822220411/https:/www.theverge.com/news/622953/google-chrome-extensions-ublock-origin-disabled-manifest-v3
- uBlock Origin (MV2) disabled automatically on Chrome for many users
- uBlock Origin Lite (MV3) = significantly reduced capabilities:
  - No dynamic filtering
  - No top-context URL rules (can't distinguish per-page context)
  - No anti-adblock circumvention
  - Fully declarative; less effective at soft paywalls and anti-adblock scripts
  Source: https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)
  Source: https://adblock-tester.com/ad-blockers/ublock-origin-vs-ublock-origin-lite/
- Academic study: "Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness" (arXiv:2503.01000)
  Source: https://arxiv.org/html/2503.01000
- **Firefox kept MV2 support** → major reason privacy users prefer Firefox ecosystem

### uBlock Origin Status
- uBlock Origin remains gold standard (~62K GitHub stars — visible in fetched content)
- Full dynamic filtering, cosmetic blocking, deep customization
- Still works fully on Firefox; disabled on Chrome
- LibreWolf and Mullvad Browser both bundle uBlock Origin

### Brave Switch Triggers (Trust Issues)
- Crypto/BAT integration: Brave Rewards, Brave Wallet (custodial) — Privacy Guides discourages
  Source: https://www.privacyguides.org/en/desktop-browsers/
- P3A analytics (though opt-out and privacy-preserving by design)
- Referral code in installer (BRV002-style tracking)
  Source: Privacy Guides Brave warning: "Brave adds a referral code to the file name in downloads"
- **Brave Origin** (June 2026): $59.99 one-time purchase for stripped version without Leo AI, Rewards, Wallet, VPN, P3A
  Source: https://brave.com/origin/
  Source: https://www.theverge.com/tech/943637/brave-is-selling-a-minimalist-version-of-its-browser-for-59-99
  — This launch signals community pressure against feature bloat

### Firefox → LibreWolf/Mullvad: Multiple 2024–2025 Triggers
1. **PPA controversy** (July 2024, NOYB complaint Sept 2024)
2. **ToS controversy** (February 2025)
3. **AI-first CEO announcement** (December 2025)
4. **Market share decline** (2.26% globally)
   Source: webpronews.com/firefox-fights-for-survival-amid-market-share-decline/

### Tracker Blocking Beyond Ads
- **CNAME cloaking**: Brave blocks it
  Source: https://brave.com/privacy-updates/6-cname-trickery/
  Apple's WebKit addressed it (7-day cookie cap on CNAME cloaked responses)
  Source: https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/
- **Link decoration stripping** (UTM params, fbclid): Brave auto-redirect tracking URLs
  Source: Privacy Guides Brave config
  Research: PURL system (USENIX Security 2024) for ML-based sanitization
  Source: https://arxiv.org/html/2308.03417
- **Bounce tracking**: Firefox ETP Strict handles some; WebKit ITP handles some
- **Email pixel tracking**: Out of scope for browsers (handled by email clients)

### Acceptable Ads / Default Blocking Philosophy
- Privacy community: strongly opposes "acceptable ads" programs
- Mullvad Browser philosophy: "nothing more [than uBlock Origin], as more attempts to block trackers ironically can reveal your identity"
  Source: https://mullvad.net/en/browser
- LibreWolf: bundles uBlock Origin; user can add more filters but community warns against overly unique filter combinations
- Brave Shields: default aggressive blocking; Privacy Guides recommends "Aggressive" for trackers & ads
  Source: https://www.privacyguides.org/en/desktop-browsers/

### DNS-Level Blocking as Complement
- Pi-hole, NextDNS, AdGuard DNS widely used as complement to browser-level blocking
- Community treats these as complementary, not replacements
  [UNVERIFIED specific stats on DNS blocking adoption]
