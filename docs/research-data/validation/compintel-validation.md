# Competitive Intelligence Claims Validation Report

**Date**: 2026-04-08
**Methodology**: Chain of Verification (CoVe) with independent web searches
**Claims Evaluated**: 25

---

## Verification Results

### Claim 1: Brave Leo offers 20+ AI models including local/self-hosted
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many models does Brave Leo offer? Does it support local models?
- **Independent Evidence**: Brave Leo offers multiple models across free and premium tiers (Qwen, Llama, Claude Haiku, Claude Sonnet, GLM 4.7 Flash, Kimi K2.5, Deepseek v3.2, Mixtral). Models are rotated — some removed to add new ones. BYOM (Bring Your Own Model) feature allows connecting to Ollama for local models and custom API endpoints (GPT-4, Grok, etc.). The exact count of simultaneously available models is not clearly "20+" — it appears to be closer to 8-12 built-in models at any time, but BYOM theoretically allows unlimited external models. ([Brave Help Center](https://support.brave.app/hc/en-us/articles/26727364100493), [Brave BYOM Blog](https://brave.com/blog/byom-nightly/))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 60%
- **Notes**: The "20+" figure is inflated if counting only simultaneously available built-in models (~8-12). If counting all models ever offered plus BYOM possibilities, the number could exceed 20, but that's a stretch. Local/self-hosted via Ollama BYOM is confirmed.

---

### Claim 2: Brave Leo pricing: $14.99/month for Premium
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: What is Brave Leo Premium's monthly price?
- **Independent Evidence**: Brave Leo Premium costs $14.99/month, covering up to 5 devices. Annual option at $149.99/year. ([Brave Help Center](https://support.brave.app/hc/en-us/articles/20958609786637), [Brave Premium](https://brave.com/premium/))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: Confirmed from multiple sources including Brave's own help center, consistent through 2026.

---

### Claim 3: Opera shipped MCP Connector (Neon) on March 31, 2026
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: When did Opera ship MCP Connector? What product is it part of?
- **Independent Evidence**: Opera announced MCP Connector for Opera Neon on March 31, 2026, in Oslo. Press release and blog post confirm the date. Feature enables external AI clients (Claude, ChatGPT, Lovable, n8n) to connect to the browser via MCP endpoint. Pricing starts at $19.90/month for Opera Neon. ([Opera Newsroom](https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/), [Opera Blog](https://blogs.opera.com/news/2026/03/opera-neon-adds-mcp-connector-to-the-browser/))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: The product is "Opera Neon" not just "Opera." The original claim correctly identifies both the feature and the date.

---

### Claim 4: Dia acquired by Atlassian, stripped Arc's innovative features
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Was The Browser Company (Dia/Arc) acquired by Atlassian? Were Arc's features stripped?
- **Independent Evidence**: Atlassian acquired The Browser Company for $610M cash (announced Sept 4, 2025; closed Oct 21, 2025). However, the claim that Atlassian "stripped Arc's innovative features" is misleading. The Browser Company itself had already decided to stop developing Arc before the acquisition, pivoting to Dia. Atlassian is continuing to develop Dia, not stripping Arc. Arc was already being sunset by its own creators. ([TechCrunch](https://techcrunch.com/2025/09/04/atlassian-to-buy-arc-developer-the-browser-company-for-610m/), [Atlassian Blog](https://www.atlassian.com/blog/announcements/atlassian-acquires-the-browser-company))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 70%
- **Notes**: Acquisition by Atlassian is confirmed. "Stripped Arc's innovative features" is misleading — The Browser Company abandoned Arc's direction in favor of the simpler Dia before Atlassian was involved. Atlassian is building Dia as an enterprise browser with security/compliance focus, not stripping features.

---

### Claim 5: SigmaOS is macOS-only with WebKit engine
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: What platforms does SigmaOS support? What rendering engine?
- **Independent Evidence**: SigmaOS is currently macOS-only. Uses WebKit rendering engine (like Safari). Built with SwiftUI. Is the first WebKit browser to also support Chromium extensions. iOS and Windows listed as "coming soon." ([SigmaOS.com](https://sigmaos.com/), [EveryDev.ai](https://www.everydev.ai/tools/sigmaos))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Fully confirmed. macOS-only with WebKit, exactly as claimed.

---

### Claim 6: Zen Browser has 41.2K GitHub stars
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many GitHub stars does Zen Browser have?
- **Independent Evidence**: Zen Browser's desktop repository shows 41.2k stars as of April 3, 2026. Reached 40k in early February 2026. ([GitHub zen-browser/desktop](https://github.com/zen-browser/desktop/releases), [OpenAlternative/X](https://x.com/ossalternative/status/2020951567264850271))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Star counts fluctuate daily. 41.2K was accurate as of early April 2026.

---

### Claim 7: Zen Browser bus factor is 1 (single primary maintainer)
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many core maintainers does Zen Browser have? What is the bus factor?
- **Independent Evidence**: Mauro V. is creator and main developer. Supporting team exists: Jan Heres (macOS builds), Bryan Galdamez (themes), Oscar Gonzalez (SRE), Daniel Garcia (macOS certs), BrhmDev, Kristijan Ribaric (split views). Community commentary confirms "maintained by essentially one person" and "one single point of failure." The team FAQ acknowledges being "very small." ([Zen About page](https://zen-browser.app/about/), [abit.ee review](https://abit.ee/en/soft/browsers/zen-browser-browser-firefox-privacy-chrome-alternative-reddit-vertical-tabs-browser-customisation-op-en), [GitHub Discussion #11476](https://github.com/zen-browser/desktop/discussions/11476))
- **Verdict**: VERIFIED
- **Confidence**: 85%
- **Notes**: Technically there are ~7 named contributors, but core development direction and primary coding relies on one person (Mauro V.). Bus factor of 1 for core architecture decisions is accurate. The supporting contributors handle ancillary concerns (macOS builds, themes, SRE).

---

### Claim 8: Stagehand v3 runs 44% faster than v2
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: What is the performance improvement of Stagehand v3 over v2?
- **Independent Evidence**: Browserbase's own blog states "v3 completes actions 44%+ faster overall" and "44.11% faster on average across iframes and shadow-root interactions." The improvement comes from removing Playwright dependency and using CDP directly. ([Browserbase Blog](https://www.browserbase.com/blog/stagehand-v3), [Scrapfly](https://scrapfly.io/blog/posts/stagehand-vs-browser-use))
- **Verdict**: VERIFIED
- **Confidence**: 90%
- **Notes**: The 44% figure is from Browserbase's own benchmarks (first-party claim). Independently corroborated by third-party comparison sites. The benchmark is specifically on iframes/shadow-root interactions, not all operations universally, though the "overall" claim is also made.

---

### Claim 9: browser-use has 78-86K GitHub stars
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many GitHub stars does browser-use have?
- **Independent Evidence**: browser-use has 86K stars as of April 2026. ([Fungies.io Top 20 GitHub Repositories for AI Agents 2026](https://fungies.io/top-github-repositories-ai-agent-frameworks-2026/))
- **Verdict**: VERIFIED
- **Confidence**: 90%
- **Notes**: The range 78-86K likely reflected a point-in-time snapshot during the research period. Current count of 86K falls within the upper end of the stated range.

---

### Claim 10: Playwright MCP reached 29.6K stars within 2 months
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many stars does Playwright MCP have? When was it launched?
- **Independent Evidence**: Playwright MCP has 29,600+ stars as of March 26, 2026. Launched in March 2025. That's approximately 12 months to reach 29.6K stars, not 2 months. ([PopularAITools](https://popularaitools.ai/blog/playwright-mcp-server-review), [Medium](https://medium.com/@bluudit/playwright-mcp-comprehensive-guide-to-ai-powered-browser-automation-in-2025-712c9fd6cffa))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 70%
- **Notes**: The star count of ~29.6K is confirmed. However, the "within 2 months" timeline appears incorrect — the repository launched in March 2025, making it ~12 months to reach that count. The 2-month claim may have confused the launch date or measured a period of rapid star growth rather than total time since creation.

---

### Claim 11: Gartner recommended CISOs block autonomous AI browsers (Dec 2025)
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Did Gartner recommend blocking AI browsers? When?
- **Independent Evidence**: Gartner published "Cybersecurity Must Block AI Browsers for Now" on December 1, 2025. Analysts Dennis Xu, Evgeny Mirolyubov, and John Watts "strongly recommend that organizations block all AI browsers for the foreseeable future." Coverage in Computerworld (Dec 16), Thurrott (Dec 8), TechNewsWorld (Dec 9), CyberMaxx (Jan 21, 2026), Forcepoint (Dec 10). ([Gartner](https://www.gartner.com/en/documents/7211030), [Computerworld](https://www.computerworld.com/article/4102569/keep-ai-browsers-out-of-your-enterprise-warns-gartner.html))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: Fully confirmed. Published December 1, 2025 (the claim said "Dec 2025"). Widespread coverage across enterprise IT media.

---

### Claim 12: Browserbase has SOC-2 Type 1 and HIPAA compliance
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: What compliance certifications does Browserbase hold?
- **Independent Evidence**: Browserbase announced SOC 2 Type I certification and HIPAA compliance in October 2024. Achieved in 2 months. Currently working toward SOC 2 Type 2. ([Browserbase Blog](https://simple-trust-044314.framer.app/blog/how-we-achieved-soc2-and-hipaa-compliance-in-just-two-months))
- **Verdict**: VERIFIED
- **Confidence**: 95%
- **Notes**: Confirmed. Note it is SOC 2 Type I (not Type II). The claim correctly states "Type 1." HIPAA compliance also confirmed.

---

### Claim 13: HARPA AI is the only extension with deep web automation
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Is HARPA AI unique in offering deep web automation among browser extensions?
- **Independent Evidence**: HARPA AI offers substantial web automation (form filling, clicking, navigation, data extraction, web monitoring, API orchestration via GRID). However, the claim of being "the only" extension with deep web automation is false. Other extensions like Bardeen, Axiom.ai, and browser-based automation tools offer similar capabilities. HARPA's distinguishing factor is combining AI chat (ChatGPT/Claude/Gemini) with automation in a single extension, but it's not unique in the automation space. ([HARPA.ai](https://harpa.ai), [Chrome Web Store](https://chromewebstore.google.com/detail/harpa-ai-web-automation-w/eanggfilgoajaocelnaflolkadkeghjp))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 55%
- **Notes**: HARPA AI does offer deep web automation capabilities — that part is verified. The claim that it's "the only" extension doing this is not substantiated. It may be the most prominent extension combining AI + automation, but "only" is too strong.

---

### Claim 14: 52% of AI Chrome extensions collect user data (Incogni)
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: What percentage of AI Chrome extensions collect user data per Incogni?
- **Independent Evidence**: Incogni's 2026 study (published January 27, 2026) found 52% of AI-branded Chrome extensions collect user data. 29% collect PII. Study examined 442 extensions. Grammarly and QuillBot flagged as worst offenders among popular extensions. ([Incogni Blog](https://blog.incogni.com/chrome-extensions-privacy-2026/), [StartupNews](https://startupnews.fyi/2026/02/04/ai-chrome-extensions-privacy-risk-incogni-2026/), [Pure AI](https://pureai.com/articles/2026/01/27/ai-chrome-extensions-can-read-what-you-type-and-see-what-you-browse.aspx))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Exact figure confirmed from multiple independent sources citing Incogni's 2026 study.

---

### Claim 15: LibreWolf maintainers stated they cannot sustain independent fork
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Have LibreWolf maintainers said they can't sustain an independent fork?
- **Independent Evidence**: In Codeberg issue #2252 ("Prepared to fork Firefox?"), maintainers explicitly stated: "We would not even remotely be able to fork and maintain a browser fully, let alone continually develop and improve it" and "if we tried to do that, we would most certainly release an insecure product, getting worse over time." Also: no donations accepted, deprecated on Homebrew (disabled 2026-09-01), no Apple Developer license for macOS notarization. ([Codeberg #2252](https://codeberg.org/librewolf/issues/issues/2252), [LibreWolf FAQ](https://librewolf.net/docs/faq/))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Direct quotes from maintainers confirm they explicitly stated this.

---

### Claim 16: Waterfox revenue threatened after Bing terminated search contracts
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Did Bing terminate contracts with Waterfox? What was the revenue impact?
- **Independent Evidence**: Microsoft terminated all Bing search syndication and API partnerships (to stop AI companies scraping). Waterfox creator Alex Kontos confirmed: "When Bing terminated all third party search contracts it hit hard" and "revenue has been poor since. There have been a few months in the red recently." Switched default to Startpage. Launched Waterfox Private Search subscription. Now allowing search ads by default for revenue. ([Waterfox Blog "15 Years of Forking"](https://www.waterfox.com/blog/15-years-of-forking/), [Quippd Interview](https://www.quippd.com/writing/2026/02/02/fifteen-years-of-waterfox-alex-kontos-on-independence-ai-and-the-future-of-browsers.html))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Confirmed directly from Waterfox's creator. Revenue impact explicitly described as "poor" with "months in the red."

---

### Claim 17: Tridactyl/Surfingkeys/Vimium: Surfingkeys most capable, Vimium largest
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Which vim-like browser extension has the most features? Which has the most users?
- **Independent Evidence**: Vimium has ~500K Chrome users — confirmed as the largest user base. For capability, sources indicate Tridactyl is "the most feature complete" (HN), while Tridactyl and Surfingkeys both have "significantly more features and customization than Vimium." Surfingkeys' unique strength is custom JavaScript functions mapped to shortcuts, cross-browser support (Chrome, Firefox, Safari), and DOI/PDF integration. Tridactyl is Firefox-only but has native Vim integration (Ctrl-i), tab groups, and .tridactylrc config. ([DevCtrl comparison](https://devctrl.blog/posts/tridactyl-surfingkeys-vimium-on-steroids/), [Pakstech comparison](https://pakstech.com/blog/browse-web-with-keyboard/), [Chrome-Stats](https://chrome-stats.com/d/dbepggeogbaibhgnhhndojpepiihcmeb))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 65%
- **Notes**: Vimium as the largest by user count is confirmed (~500K Chrome + ~44K Firefox). "Surfingkeys most capable" is debatable — Tridactyl is cited as "most feature complete" by multiple sources. Surfingkeys has unique JavaScript extensibility and cross-browser advantage, but calling it definitively "most capable" oversimplifies. The comparison depends on what "capable" means.

---

### Claim 18: Vimium has ~500K Chrome users
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How many Chrome users does Vimium have?
- **Independent Evidence**: Chrome-Stats shows 500,000 users for Vimium on Chrome. Rating: 4.82/5 from 4,561 reviews. Latest version 2.4.2 updated March 10, 2026. ([Chrome-Stats](https://chrome-stats.com/d/dbepggeogbaibhgnhhndojpepiihcmeb))
- **Verdict**: VERIFIED
- **Confidence**: 98%
- **Notes**: Exact number confirmed from Chrome Web Store statistics.

---

### Claim 19: Chrome added vertical tabs April 7, 2026
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: When did Chrome add vertical tabs?
- **Independent Evidence**: Google announced vertical tabs for Chrome on April 7, 2026. Feature displays tabs in a sidebar. Also includes refreshed Reading Mode. Coverage from TechCrunch, MacRumors, Engadget, Google Blog, 9to5Google, and others all confirm the date. ([TechCrunch](https://techcrunch.com/2026/04/07/chrome-is-finally-getting-vertical-tabs/), [Google Blog](https://blog.google/products-and-platforms/products/chrome/new-chrome-productivity-features/))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: Confirmed by Google's own blog post and extensive media coverage. Note: the report was written on or after this date, so this was current news.

---

### Claim 20: Tor Browser routes through multiple relays causing speed penalty
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Does Tor route through multiple relays? Does this cause speed penalties?
- **Independent Evidence**: Tor routes traffic through 3 relays (Guard, Middle, Exit). Connections are typically 3-10x slower than regular internet. Each relay adds latency. Path selection doesn't optimize for geographic proximity. Onion routing involves layered encryption decrypted at each hop. This is a well-established architectural property of Tor. ([Wikipedia Tor](https://en.wikipedia.org/wiki/Tor_(network)), [Fraudlogix](https://www.fraudlogix.com/glossary/what-is-tor-the-onion-router/), [ExpressVPN](https://www.expressvpn.com/blog/why-is-tor-browser-so-slow/))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: This is fundamental Tor architecture, well-documented across academic papers and official documentation.

---

### Claim 21: CometJacking prompt injection vulnerability disclosed
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Was CometJacking a real disclosed vulnerability? What was it?
- **Independent Evidence**: CometJacking was discovered by LayerX security researchers targeting Perplexity's Comet AI browser. Published October 4, 2025. Enables hijacking Comet's AI via crafted URLs containing hidden prompts. Additional variants discovered by Zenity Labs: zero-click calendar attacks, screenshot-based injection, MCP API escalation. Fix issued February 2026 but some vulnerabilities remain. Covered by The Hacker News, Schneier on Security, CyberScoop, Brave's security blog, OECD AI incident database. ([LayerX](https://layerxsecurity.com/blog/cometjacking-how-one-click-can-turn-perplexitys-comet-ai-browser-against-you/), [The Hacker News](https://thehackernews.com/2025/10/cometjacking-one-click-can-turn.html), [CyberScoop](https://cyberscoop.com/agentic-ai-browsers-allow-hijacking-zenity-labs-comet/))
- **Verdict**: VERIFIED
- **Confidence**: 99%
- **Notes**: Extensively documented real vulnerability with multiple independent confirmations and follow-on research.

---

### Claim 22: No browser has native agent API surface (not repurposed DevTools)
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Does any browser offer a native API designed specifically for AI agents (not DevTools)?
- **Independent Evidence**: This claim appears to have been **overtaken by events**. WebMCP (Web Model Context Protocol) was released as an early preview in Chrome 146 in February 2026 — a proposed W3C standard by Google and Microsoft providing `navigator.modelContext` as a browser-native JavaScript API for AI agents. Opera Neon ships MCP Connector. Chrome DevTools MCP server also launched. However, WebMCP is only in Chrome Canary behind a flag; stable release expected H2 2026. Firefox/Safari have not announced plans. ([Vydera](https://vydera.com/en/lab/webmcp-site-agent-ready-visibility), [InsForge](https://insforge.dev/blog/webmcp-browser-native-execution-model-for-ai-agents), [Kassebaum Engineering](https://kassebaumengineering.com/insights/webmcp-ai-agents-browser-interaction/))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 55%
- **Notes**: The claim was likely accurate when originally written but is now outdated. WebMCP in Chrome 146 Canary is a purpose-built agent API surface (not repurposed DevTools), though it's behind a flag and not yet stable. Opera Neon's MCP Connector is also a purpose-built agent interface. The claim's core insight — that browsers historically only offered repurposed DevTools — remains directionally correct for production/stable releases as of April 2026.

---

### Claim 23: Accessibility tree approach uses 20-70x fewer tokens than screenshots
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: How much more token-efficient is the accessibility tree approach vs screenshots?
- **Independent Evidence**: Multiple sources confirm the accessibility tree is dramatically more efficient. One source cites "10-100x more efficient in both bandwidth and token consumption." Data: a11y tree snapshot is 2-5KB vs screenshot at 500-2000KB. Cost comparison: 1000 tasks cost $60 with screenshots vs $15 with a11y trees (4x cheaper). Vercel's agent-browser reports 82-93% reduction in context usage vs Playwright MCP (which itself uses a11y trees). ([PopularAITools](https://popularaitools.ai/blog/playwright-mcp-server-review), [Bitdoze](https://www.bitdoze.com/pinchtab-browser-ai-agents/), [Pulumi Blog](https://www.pulumi.com/blog/self-verifying-ai-agents-vercels-agent-browser-in-the-ralph-wiggum-loop/))
- **Verdict**: PARTIALLY_VERIFIED
- **Confidence**: 70%
- **Notes**: The direction is correct — a11y trees are vastly more token-efficient. The specific "20-70x" range is somewhat conservative compared to some sources (which cite 10-100x). Raw data sizes support roughly 100-1000x difference in bytes (2-5KB vs 500-2000KB), but token counts depend on encoding. The 4x cost difference in one benchmark ($60 vs $15) suggests a lower multiplier in practice. The claim is directionally right but the exact range may vary significantly by page complexity.

---

### Claim 24: Floorp claims 120M downloads but actual user base much smaller
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Does Floorp claim 120M downloads? What is the actual user base?
- **Independent Evidence**: No independent source found confirming a "120M downloads" claim from Floorp. SourceForge mirrors the GitHub releases. Neither platform publicly displays aggregate download totals in the sources found. Floorp's own website makes no visible 120M claim. Wikipedia article on Floorp does not mention this figure. Cannot verify or refute the specific number. ([Floorp.app](https://floorp.app/), [SourceForge](https://sourceforge.net/projects/floorp-browser.mirror/), [Wikipedia](https://en.wikipedia.org/wiki/Floorp))
- **Verdict**: UNVERIFIED
- **Confidence**: 25%
- **Notes**: Could not find any source — either from Floorp or third-party — claiming or confirming 120M downloads. The claim may reference SourceForge download counts which can be inflated by mirror traffic, or may be fabricated/misremembered. Without a source for the original 120M figure, this cannot be verified.

---

### Claim 25: Zen Browser won Reddit r/browsers tournament over Firefox
- **Original Source**: Competitive Intelligence report (Wave 1/2)
- **Verification Questions**: Did Zen Browser win a Reddit browser tournament? Did it beat Firefox?
- **Independent Evidence**: r/browsers held a 24-day bracket playoff tournament in early 2026. Zen Browser won the final against Firefox with 2,486 upvotes vs Firefox's 2,064. Chrome lost to Cromite in round 2. Zen beat Waterfox in round 1 "in a whitewash." Covered by MakeUseOf and other tech outlets. ([MakeUseOf](https://www.makeuseof.com/reddit-favorite-browser-isnt-chrome-youve-never-heard-of-it/), [abit.ee](https://abit.ee/en/soft/browsers/zen-browser-browser-firefox-privacy-chrome-alternative-reddit-vertical-tabs-browser-customisation-op-en))
- **Verdict**: VERIFIED
- **Confidence**: 97%
- **Notes**: Confirmed with specific vote counts. Zen beat Firefox in the final round.

---

## Summary Statistics

| Verdict | Count | Percentage |
|---------|-------|-----------|
| VERIFIED | 17 | 68% |
| PARTIALLY_VERIFIED | 6 | 24% |
| UNVERIFIED | 1 | 4% |
| CONTRADICTED | 0 | 0% |
| **Total** | **25** | **100%** |

---

## Contradictions Found

No claims were outright contradicted, though several required significant qualification:

1. **Claim 4** (Dia/Atlassian): The framing that Atlassian "stripped Arc's features" misattributes the decision. The Browser Company abandoned Arc voluntarily before the acquisition. Atlassian is building on Dia, not dismantling Arc.

2. **Claim 10** (Playwright MCP "within 2 months"): The star count is correct but the timeline appears wrong. Playwright MCP launched March 2025; reaching 29.6K took ~12 months, not 2.

3. **Claim 22** (No native agent API): Overtaken by events. WebMCP in Chrome 146 Canary (Feb 2026) is a purpose-built agent API, though not yet in stable release.

---

## Low-Confidence Flags

| Claim | Confidence | Issue |
|-------|-----------|-------|
| Claim 24: Floorp 120M downloads | 25% | Cannot find any source for the 120M figure |
| Claim 13: HARPA AI "only" extension | 55% | "Only" is too strong; other automation extensions exist |
| Claim 22: No native agent API | 55% | WebMCP now exists in Canary; claim is time-sensitive |
| Claim 1: Brave Leo 20+ models | 60% | Built-in count is ~8-12 at any time; BYOM inflates |
| Claim 17: Surfingkeys "most capable" | 65% | Tridactyl cited as most feature-complete by multiple sources |

---

## Sources

### Primary (Official/First-Party)
- Brave Help Center: https://support.brave.app/hc/en-us/articles/26727364100493
- Brave Premium: https://brave.com/premium/
- Opera Newsroom: https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/
- Atlassian Blog: https://www.atlassian.com/blog/announcements/atlassian-acquires-the-browser-company
- SigmaOS: https://sigmaos.com/
- Zen Browser About: https://zen-browser.app/about/
- Browserbase Blog: https://www.browserbase.com/blog/stagehand-v3
- Gartner: https://www.gartner.com/en/documents/7211030
- Browserbase Compliance: https://simple-trust-044314.framer.app/blog/how-we-achieved-soc2-and-hipaa-compliance-in-just-two-months
- Incogni Study: https://blog.incogni.com/chrome-extensions-privacy-2026/
- LibreWolf Codeberg #2252: https://codeberg.org/librewolf/issues/issues/2252
- Waterfox Blog: https://www.waterfox.com/blog/15-years-of-forking/
- Google Blog (Chrome): https://blog.google/products-and-platforms/products/chrome/new-chrome-productivity-features/
- LayerX (CometJacking): https://layerxsecurity.com/blog/cometjacking-how-one-click-can-turn-perplexitys-comet-ai-browser-against-you/

### Secondary (Journalism/Analysis)
- TechCrunch: https://techcrunch.com/2025/09/04/atlassian-to-buy-arc-developer-the-browser-company-for-610m/
- TechCrunch: https://techcrunch.com/2026/04/07/chrome-is-finally-getting-vertical-tabs/
- Computerworld: https://www.computerworld.com/article/4102569/keep-ai-browsers-out-of-your-enterprise-warns-gartner.html
- The Hacker News: https://thehackernews.com/2025/10/cometjacking-one-click-can-turn.html
- MakeUseOf: https://www.makeuseof.com/reddit-favorite-browser-isnt-chrome-youve-never-heard-of-it/
- Quippd (Waterfox interview): https://www.quippd.com/writing/2026/02/02/fifteen-years-of-waterfox-alex-kontos-on-independence-ai-and-the-future-of-browsers.html
- Fungies.io: https://fungies.io/top-github-repositories-ai-agent-frameworks-2026/
- CyberScoop: https://cyberscoop.com/agentic-ai-browsers-allow-hijacking-zenity-labs-comet/

### Technical References
- Chrome-Stats (Vimium): https://chrome-stats.com/d/dbepggeogbaibhgnhhndojpepiihcmeb
- GitHub zen-browser/desktop: https://github.com/zen-browser/desktop
- HARPA AI: https://harpa.ai
- DevCtrl (Vim extensions): https://devctrl.blog/posts/tridactyl-surfingkeys-vimium-on-steroids/
- Vydera (WebMCP): https://vydera.com/en/lab/webmcp-site-agent-ready-visibility
- PopularAITools (Playwright MCP): https://popularaitools.ai/blog/playwright-mcp-server-review
