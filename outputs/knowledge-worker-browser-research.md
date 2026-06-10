# Knowledge Workers Living in the Browser (2026): Tab Overload, Context-Switching, Research Workflows, and the Features They Actually Want

*Cited Research Brief — June 2026*

---

## Executive Summary

The browser has become the primary workspace for knowledge workers and researchers: most tasks begin on screen, most information flows through the web, and most productivity tools surface as web applications. Yet browser architecture has barely evolved in over 20 years. Research from 2021–2026 surfaces a consistent cluster of problems: tab overload driven by broken information retrieval, measurable context-switching costs that compound across the workday, a fragmented research-and-capture loop with high abandonment at every stage, and a note-taking layer that sits outside the browser with costly friction at every handoff boundary.

Quantitative evidence is now strong enough to move from anecdote to design constraint. This brief separates verified measurements from inferences, with source quality noted throughout.

---

## 1. Tab Overload: The Quantitative Picture

### 1.1 How many tabs are actually open?

Two recent surveys with stated methodologies provide credible baseline numbers.

**Smallpdf Digital Clutter Survey (2024, n=1,005 US employees)** [1]  
The average American employee maintains **8.5 browser tabs open** during work. **28%** routinely keep 10 or more tabs open. Remote workers average **10.8 tabs**. A cognitive threshold effect appears: **51%** of workers mentally "check out" from excessive tabs, with the self-reported overload threshold averaging **13 tabs**. Workers spend a mean of **4.5 hours per week** searching for files, emails, or links already previously seen — equivalent to **29 full workdays per year**.

*Note: Self-reported survey; tab counts not validated by telemetry. Commissioned by Smallpdf. Nationally representative US employee sample.*

**Shift 2026 State of Browsing Report (n=1,000 US adults, September 2025)** [2]  
**1 in 5 users (20%)** regularly juggle **11 or more** simultaneous tabs. Gen Z and Millennials are most likely to maintain 6–10 tabs. **81%** of respondents are willing or considering switching browsers; **92%** want personalization; **47%** rate workflow fit as "very important."

*Note: Shift sells a multi-profile browser product; survey data supports their market positioning. Nationally representative weighting applied. n=1,000 is small for population inference.*

### 1.2 Why tabs accumulate: the "black hole" problem

The most rigorous academic study of tab behavior in recent years is **"When the Tab Comes Due: Challenges in the Cost Structure of Browser Tab Usage"** (Chang, Kittur et al., CHI 2021) [3]. Using interviews with **10 information workers** plus a **survey of 103 participants** (all with 12+ work browser tabs), the researchers identified the mechanism:

- Users fear the **"black hole effect"**: once a tab is closed, they believe it is gone forever, because they distrust search and bookmarks to resurface content on demand.
- Tabs serve multiple simultaneous functions — reminders, read-later queues, working memory, task anchors — but serve each function poorly due to the simple list structure.
- **~25%** of participants reported their browser or computer had crashed from too many open tabs.
- Multi-source decision tasks (comparing products, synthesizing research) are the primary driver: users open many sources and keep them all visible because the browser offers no in-place aggregation or annotation mechanism.

Researchers built the **Skeema** task-centric tab extension as a proof-of-concept. Early users significantly reduced open tabs, reported less stress, and remained more focused.

*Self-selected sample (recruited for heavy tab use). Results may not generalize to all knowledge workers. Skeema is no longer maintained.*

**"When Browsing Gets Cluttered"** (CHI 2023) [4] extends the picture: an **interview study (N=16) + online survey (N=400)** modeling browsing clutter — accumulated disorganized tabs, windows, bookmarks, and history — as a systemic phenomenon arising from mismatches between browser affordances and knowledge work task complexity. Coping strategies vary by user type.

---

## 2. Context-Switching Cost: What the Evidence Actually Shows

### 2.1 The "23-minute" figure — what it is and isn't

The widely-cited claim that "it takes 23 minutes and 15 seconds to recover from an interruption" traces back to **verbal statements by Gloria Mark (UC Irvine) in interviews** with Fast Company and the Wall Street Journal — not to any peer-reviewed measurement. A systematic review of 5 primary papers and 23 blog posts (Oberien, 2023) [5] found no paper containing this specific figure. The CHI 2008 Mark paper often cited as the source actually measured that workers worked **faster** under interruptions (but with significantly higher stress) — no "23 min" recovery figure appears anywhere in it.

This figure should be treated as an expert estimate, not a laboratory result.

### 2.2 What the primary literature actually measures

**Iqbal & Horvitz, CHI 2007 ("Disruption and Recovery of Computing Tasks")** [6]  
Field study: **11–16 minutes** to resolve an interruption and cognitively return to the original computing task.

**Gloria Mark, Gonzalez & Harris, CHI 2005 ("No Task Left Behind")** [7]  
Detailed observation of **24 information workers**. Work is highly fragmented: workers average approximately **3 minutes** on any task before switching. Work fragmentation arises from both external interruptions and self-generated switches.

**Gloria Mark et al., CHI 2008 ("The Cost of Interrupted Work")** [8]  
Workers under repeated interruptions worked **faster** (task time reduced from 22.77 to 20.31 min) but reported significantly higher **stress, frustration, workload, effort, and pressure** after only 20 minutes of interruptions.

*Inference: The speed-up may reflect reactive/shallow work; the longer-term cost is accumulated stress and error rather than simple per-event time loss.*

**Rubinstein, Evans & Meyer (2001), J. Experimental Psychology: Human Perception and Performance** [9]  
Laboratory task-switching experiments. "Executive control" involves two stages — goal shifting and rule activation — both carrying time costs. Switching repeatedly between complex tasks can account for **up to 40% of productive time** lost. (APA summary available at [9].)

### 2.3 Industry-scale evidence: Asana Anatomy of Work Index

Asana surveyed **10,000+ knowledge workers** across six countries [10]. Key context-switching findings:

- **56%** feel they must respond to notifications **immediately**
- Average **9 apps per day** switched between
- **60%** of workday time spent on "work about work" — task-switching overhead, chasing updates, tool-hopping — nearly **twice** the 35% workers believe they spend
- **52%** multitask during virtual meetings

### 2.4 Browser-specific distraction: ACDPs and attention capture

**"Purpose Mode"** (ACM TOCHI, 2025) [11]: A **2-week mixed-methods field study with 29 participants** measuring how "attention capture damaging patterns" (ACDPs — infinite scroll, notification badges, autoplay) affect distraction during web browsing. **Suppressing ACDPs measurably reduced perceived distraction.** This provides experimental support for browser-level controls over attention capture — design affordances like "reading mode" and notification blockers are measurably effective, not just cosmetic.

---

## 3. Research-and-Capture Workflows: The Broken Loop

### 3.1 The bookmark problem

Bookmarks are the browser's native capture mechanism — and they largely fail their purpose.

**Bergman, Whittaker & Schooler (2021, Journal of Information Science)** [12]  
Title: "Out of sight and out of mind: Bookmarks are created but not used." Empirically demonstrated that users build bookmark collections but **rarely retrieve from them** for re-finding. Earlier research: >80% of 6,619 web users cited bookmarks as a strategy (Pitkow & Kehoe 1996 [13]); average bookmark collection reaches 40+ items after 1 year, 200+ after 2 years (Abrams et al. 1998 [13]) — but the gap between creation and retrieval grows as collections scale.

The practical consequence: users route around bookmarks by keeping content visible as open tabs — the proximate cause of tab overload (§1.2). Tab hoarding is a rational response to broken retrieval, not simply a discipline failure.

### 3.2 Read-later tools: installed but partially abandoned

| Tool | Users/Installs | Notes |
|------|---------------|-------|
| Pocket [14] | ~30M users (2021); 2M+ Chrome installs | Mozilla-owned |
| Instapaper [14] | ~4M users (2021); ~200K Chrome installs | ~13% premium conversion |
| Readwise Reader [15] | No public user count | Highlights + spaced repetition + read-later |

*Usage data for Pocket and Instapaper from 2021 — no updated public figures for 2025–2026. Readwise has no published user count.*

The high-premium conversion for Instapaper (13%) vs. Pocket (2%) indicates the power-user/researcher segment willingly pays for the workflow. Readwise Reader explicitly targets this segment: unified highlights, spaced repetition, browser extension, and as of January 2025, in-app chat with highlights [15].

### 3.3 Web annotation: growing but educational-first

**Hypothesis** is the most-measured annotation tool with public data [16, 17]:
- Passed **80 million annotations** milestone, June 2025
- 2024: **22% increase** in annotations; **12% increase** in student users; **27% increase** in courses using the platform
- Primarily educational/academic use; general web annotation is secondary

*Self-reported by Hypothesis in their annual impact report. Trend direction is plausible; absolute figures unverified independently.*

### 3.4 Reference management: Zotero

Zotero has approximately **7.5 million accounts created** (per Zotero forum self-reports and community data) [18]; exact active users are unknown since the tool functions without account creation. The Zotero Connector browser extension provides single-click metadata capture from journal pages, library catalogs, and web sources — a critical link in academic researcher workflows [19].

### 3.5 Academic research on the sensemaking gap

HCI research consistently identifies the browser-to-notes boundary as the highest-friction point in knowledge worker research workflows:

- **ForSense (IUI 2021)** [20]: Browser extension integrating multiple online research stages (search → filter → organize → synthesize) with machine assistance. Identified fragmentation across separate tools as the primary friction source.
- **Fuse (CHI 2022)** [21]: Browser extension that externalizes working memory in-situ, enabling sensemaking without leaving the browser. Reduces context switches to external note apps.
- **Orca (arXiv:2505.22831, 2025)** [22]: AI-facilitated browsing at scale — orchestrates AI actions across multiple "malleable" webpages simultaneously. User study found batch operations and AI-generated synthesis at scale were rated helpful for multi-source research tasks, with less manual effort than tab-by-tab work.

The pattern across all three: every capture event that requires leaving the browser context imposes a measurable overhead (app switch + format + return). The tools that reduce or eliminate that switch show consistent preference signals.

---

## 4. Note-Taking Integration: The App-Browser Boundary

### 4.1 Where notes tools live today

The dominant personal knowledge management (PKM) tools — Notion, Obsidian, Roam Research, Logseq, Evernote — all operate **outside** the browser and depend on browser extensions for capture:

- Notion Web Clipper: captures pages/articles to a Notion database
- Obsidian Web Clipper: captures to a local Markdown vault (official release 2024)
- Readwise Reader: unified read-it-later + highlights, syncs to Obsidian/Roam/Notion

Each introduces at least **two context switches** per capture event: one to trigger the clipper and one to return to the source. None natively annotates the live browser viewport inline.

### 4.2 The native annotation gap

Hypothesis occupies the "true in-browser annotation" niche — annotate the live web page without leaving — but it is primarily educational/academic. No major browser (Chrome, Edge, Firefox, Safari, Brave) ships **native, persistent, structured note-taking against web content**.

This is simultaneously a documented gap in academic HCI literature (Fuse 2022; Orca 2025) and reflected in user survey data: **task organization** is the #2 requested browser capability (34%) in the Shift 2026 report [2], and the CMU tab study specifically found users keep tabs open because "there's no good place to put the notes" [3].

---

## 5. Browser Features Knowledge Workers Most Want

### 5.1 Survey rankings (2025–2026)

**Shift 2026 State of Browsing (n=1,000, September 2025)** [2] — most comprehensive recent demand data:

| Feature Requested | % of Respondents |
|-------------------|-----------------|
| Multiple accounts/logins | 39% |
| Task organization | 34% |
| Notification blocking | 31% |
| App integrations | 18% |

**81%** willing/considering browser switch; **47%** say workflow fit is "very important."

**Smallpdf (n=1,005, 2024)** [1]: 51% overwhelmed by tab count; 28% overwhelmed by digital workspace weekly. Implies demand for tab management — though this survey did not directly ask about feature preferences.

### 5.2 Feature shipping and adoption (2025–2026)

**Tab groups / AI tab organization**
- Chrome AI Tab Organizer: launched January 23, 2024 (experimental, Mac/Windows) [23]. No public adoption rate data released by Google.
- Tab Groups cross-device sync: September 2024 [24].

**Vertical tabs**
- Edge: had vertical tabs before Chrome; re-promoted when Chrome added them April 2026 [25]
- Firefox: sidebar + vertical tabs shipped in Firefox 136 (early 2026) [26]
- Chrome: vertical tabs announced April 2026 [25]
- Adoption estimate: ~18% of Edge active users use vertical tabs; ~10% of all browser users (Gitnux, 2026) [27] — *methodology not independently verified; treat as directional only*

**In-browser AI features**
- Edge Copilot Mode (October 2025) [28]: reasons across multiple open tabs; dynamic context pane
- Edge Workspaces (profile management): **1.5M+ users** [29] — most concrete published adoption figure for a knowledge-worker-oriented browser feature
- Chrome Generative AI (January 2024): Tab Organizer, theme creator, Help Me Write — experimental rollout [23]

### 5.3 What researchers specifically want (academic evidence)

**LLM Usage Survey (arXiv:2503.16774, n=216 knowledge workers, 2025)** [30]:  
Knowledge workers most want AI to reduce "tedious tasks" — research synthesis, information organization, reformatting. Browser-integrated AI access is implicitly preferred over context-switching to a separate AI tool.

**Orca (arXiv:2505.22831, 2025)** [22]:  
Validated that AI-orchestrated synthesis across multiple open tabs addresses a real research workflow need. User study (full study parameters not extracted; see paper for n and task details) found in-browser batch operations and AI synthesis preferable to manual tab-by-tab work.

---

## 6. The 2026 AI-Native Browser Landscape

### 6.1 Market context

JPMorgan Chase 2026 Technology Trends [31] projects the AI browser market at **$4.5B (2024)** growing to **$76.8B by 2034** (CAGR 32.8%; *market definition not standardized across analysts — treat as directional*). The report frames "intent as the new interface" — AI-native browsers aim to eliminate app-switching overhead by inferring user goals.

Microsoft AI Economy Institute (2025) [32]: approximately **1 in 6 people worldwide** actively use generative AI tools as of H2 2025.

### 6.2 Browser-by-browser status (2025–2026)

**Google Chrome** (~3.4B users; ~67% global share) [33]  
AI Tab Organizer and writing assistant: January 2024 (experimental). Vertical tabs: April 2026. No public AI feature adoption data released.

**Microsoft Edge** (13.7% desktop share; 18.6% on Windows 11) [29, 34]  
Copilot Mode: October 2025 [28]. Cross-tab reasoning and dynamic context pane. Edge Workspaces: 1.5M+ users. Enterprise shadow AI protections: RSAC 2026 [35]. #2 enterprise browser in IT testing.

**Brave** (109M MAU, February 2026) [36]  
101M MAU September 30, 2025 (official announcement). 42M daily active users; DAU/MAU = 0.42. Leo AI built-in LLM. 1.6B monthly Brave Search queries. Privacy-first positioning attractive to researchers.

**Perplexity Comet** [37, 38]  
Launched July 9, 2025 (Max subscribers, $200/month). Went free worldwide October 2, 2025. "Millions" joined waitlist in the interim. First browser with AI agent as primary interface — enterprise app integrations (Slack), voice+text, background assistant.

**Arc (The Browser Company)** [39, 40]  
Placed Arc into maintenance mode late 2024. Total App Store downloads: 1.4M. Estimated 1–5M peak users; <0.2% global market share despite $550M valuation and outsized tech-media presence. Company retrospective: "too many new things to learn, for too little reward" — only ~5% of features heavily used by the average user (per third-party analysis by Inteldo; the Browser Company letter confirms the revealed-preference mismatch without specifying a percentage [39, 40]). Key lesson for product strategy: novelty without clear utility payoff does not sustain adoption.

**Firefox** (~2.74% global share)  
Sidebar + vertical tabs: Firefox 136 (early 2026) [26].

### 6.3 The enterprise dimension

Edge's enterprise position exceeds its overall market share. Enterprise IT teams have standardized Edge in Windows 11 environments (61% corporate adoption reported [34]). A distinct "enterprise browser" category (Talon, Island, Palo Alto Prisma Access Browser) has emerged targeting corporate security, but is not captured in general market share data. Enterprise AI feature adoption lags consumer adoption due to data governance requirements — hence Edge's RSAC 2026 shadow AI focus [35].

---

## 7. Open Questions and Documented Gaps

1. **Tab count by worker type**: No study segments tab-count behavior specifically for academic researchers vs. general knowledge workers. The CMU study recruited for heavy-tab users (n=103); Smallpdf and Shift surveyed general employees. A researcher-specific measurement is missing.

2. **AI feature retention, not just launch**: Chrome AI Tab Organizer and Copilot Mode lack published retention data. The iPullRank AI Mode analysis (July 2025) found >50% of Google AI Mode users tried it once and did not return — whether this pattern holds for browser-embedded AI is untested.

3. **Read-later app usage: stale data**: Pocket/Instapaper user counts date from 2021. Readwise has no public figures. The "save-for-later" market size is currently unmeasured.

4. **Note-taking friction, quantified**: No published study has measured the specific time cost of the browser-to-notes capture workflow vs. hypothetical in-browser annotation. The friction is documented qualitatively; a stopwatch study has not been published.

5. **Browser behavior telemetry**: No browser vendor has published large-scale telemetry data on knowledge worker tab patterns, switch rates, or session structures. This is the most obvious evidence gap for product design.

6. **Vertical tab and AI tab adoption rates**: Chrome's AI Tab Organizer, Firefox 136 vertical tabs, and Edge Copilot Mode have no verified adoption rate data. Gitnux's figures (18% Edge vertical tab use) are directional at best.

---

## Summary Table: Strongest Quantitative Claims

| Claim | Source | n | Year | Quality |
|-------|--------|---|------|---------|
| Average 8.5 tabs open at work | Smallpdf [1] | 1,005 | 2024 | Vendor survey |
| 28% have 10+ tabs open | Smallpdf [1] | 1,005 | 2024 | Vendor survey |
| 51% check out from tab overload | Smallpdf [1] | 1,005 | 2024 | Vendor survey |
| 4.5 hrs/week lost to re-finding content | Smallpdf [1] | 1,005 | 2024 | Vendor survey |
| 1 in 5 users manage 11+ tabs | Shift [2] | 1,000 | 2025 | Vendor survey |
| Task org (34%), notif blocking (31%) top requests | Shift [2] | 1,000 | 2025 | Vendor survey |
| ~25% had browser crash from tab overload | CMU CHI [3] | 103 | 2021 | Peer-reviewed |
| Bookmarks created but rarely retrieved | Bergman et al. [12] | — | 2021 | Peer-reviewed |
| ~3 min/task before switching | Mark et al. [7] | 24 | 2005 | Peer-reviewed |
| 11–16 min to recover from interruption | Iqbal & Horvitz [6] | — | 2007 | Peer-reviewed |
| Up to 40% productivity loss (complex switching) | APA/Rubinstein [9] | — | 2001 | Peer-reviewed |
| 56% must respond immediately to notifications | Asana [10] | 10,000+ | multi-yr | Vendor, large-n |
| 9 apps/day switched between | Asana [10] | 10,000+ | multi-yr | Vendor, large-n |
| 60% of time on "work about work" | Asana [10] | 10,000+ | multi-yr | Vendor, large-n |
| 80M Hypothesis annotations | Hypothesis [16] | — | 2025 | Self-reported |
| Hypothesis 27% course growth in 2024 | Hypothesis [17] | — | 2024 | Self-reported |
| Brave: 101M MAU (Sept 2025), 109M (Feb 2026) | Brave [36] | — | 2025–26 | Official vendor |
| Arc: 1.4M App Store downloads | Appfigures [40] | — | Oct 2024 | Analytics firm |
| Comet free worldwide Oct 2, 2025; millions waitlist | Perplexity [37] | — | 2025 | Official + press |
| Edge: 13.7% desktop, 18.6% Win 11 | StatCounter/SQ Mag [34] | — | 2026 | Analytics |
| Edge Workspaces: 1.5M+ users | Microsoft [29] | — | 2025 | Vendor-reported |
| AI browser market $4.5B → $76.8B (2034) | JPMorgan [31] | — | 2026 | Analyst projection |

---

## Sources

[1] Smallpdf, "The Cost of Digital Clutter" (2024 survey, n=1,005 US employees)  
https://smallpdf.com/blog/digital-declutter-report

[2] Shift Technologies Inc., "2026 State of Browsing Report: Browser Usage Spotlight" (n=1,000 US adults, Sept 2025), via Newswire  
https://www.newswire.ca/news-releases/the-legacy-browser-is-at-a-breaking-point-according-to-the-state-of-browsing-report-831126731.html  
Full report: https://shift.com/state-of-browsing/

[3] Chang, J.C., Kittur, A. et al., "When the Tab Comes Due: Challenges in the Cost Structure of Browser Tab Usage," CHI 2021  
CMU HCII overview: https://www.hcii.cmu.edu/news/overcoming-tab-overload  
Paper PDF (not parsed): https://joe.cat/images/papers/tabs.pdf

[4] "When Browsing Gets Cluttered: Exploring and Modeling Interactions of Browsing Clutter, Browsing Habits, and Coping," CHI 2023 (N=16 interviews + N=400 survey)  
https://dl.acm.org/doi/10.1145/3544548.3580690

[5] Oberien, "Interruptions cost 23 minutes 15 seconds, right?" (analysis of 5 papers + 23 blog posts), November 2023  
https://blog.oberien.de/2023/11/05/23-minutes-15-seconds.html

[6] Iqbal, S.T. & Horvitz, E., "Disruption and Recovery of Computing Tasks: Field Study, Analysis, and Directions," CHI 2007  
https://erichorvitz.com/CHI_2007_Iqbal_Horvitz.pdf [PDF_NOT_PARSED]

[7] Mark, G., Gonzalez, V.M. & Harris, J., "No Task Left Behind? Examining the Nature of Fragmented Work," CHI 2005  
https://ics.uci.edu/%7Egmark/CHI2005.pdf [PDF_NOT_PARSED]

[8] Mark, G. et al., "The Cost of Interrupted Work: More Speed and Stress," CHI 2008  
https://ics.uci.edu/~gmark/chi08-mark.pdf [PDF_NOT_PARSED]

[9] American Psychological Association, "Multitasking: Switching Costs" (summary of Rubinstein, Evans & Meyer 2001)  
https://www.apa.org/topics/research/multitasking  
Primary: Rubinstein, J.S., Meyer, D.E. & Evans, J.E., "Executive Control of Cognitive Processes in Task Switching," J. Exp. Psych. Human Perception and Performance, 27, 763–797 (2001)

[10] Asana, Anatomy of Work Index (various years; n=10,000+ knowledge workers, multi-country)  
https://asana.com/resources/anatomy-of-work  
Context-switching summary: https://asana.com/resources/context-switching

[11] "Purpose Mode: Reducing Distraction through Toggling Attention Capture Damaging Patterns on Social Media Web Sites," ACM Transactions on Computer-Human Interaction (2025) (field study, n=29, 2 weeks)  
https://dl.acm.org/doi/10.1145/3711841

[12] Bergman, O., Whittaker, S. & Schooler, J., "Out of sight and out of mind: Bookmarks are created but not used," Journal of Information Science (2021)  
https://journals.sagepub.com/doi/10.1177/0961000620949652

[13] Jones, W., "Once found, what then? A study of 'keeping' behaviors in the personal use of Web information," ASIST 2003 (citing Pitkow & Kehoe 1996, n=6,619; Abrams et al. 1998, n=322)  
https://asistdl.onlinelibrary.wiley.com/doi/10.1002/meet.1450390143

[14] Greasy Guide, "Instapaper vs Pocket" (2021 user data: Pocket 30M, Instapaper 4M)  
https://www.greasyguide.com/marketing/instapaper-vs-pocket-how-to-choose-the-best-read-later-app-for-you/  
Extension comparison: https://tooltivity.com/extensions/compare/instapaper-vs-save-to-pocket

[15] Readwise Reader (official product + Jan 2025 update newsletter)  
https://readwise.io/read  
https://readwise.io/reader/update-jan2025

[16] Hypothesis, "What We Learned from 80 Million Annotations (and Why It Matters)" (June 2025)  
https://web.hypothes.is/blog/what-we-learned-from-80-million-annotations-and-why-it-matters/

[17] Sociable.co, "Hypothesis reports 27% growth in courses utilizing its annotation tool in 2024" (citing Hypothesis 2024 End of Year Impact Report)  
https://sociable.co/business/hypothesis-reports-27-growth-in-courses-utilizing-its-annotation-tool-in-2024/

[18] Zotero Forums, "Statistics of Zotero (number of users)"  
https://forums.zotero.org/discussion/89132/statistics-of-zotero-number-of-users

[19] Princeton Center for Digital Humanities, "Making Research Easier to Save: A Guide to Zotero Integration for Academic Websites" (November 2025)  
https://cdh.princeton.edu/blog/2025/11/11/making-research-easier-to-save-a-guide-to-zotero-integration-for-academic-websites/

[20] Palani, S. et al., "ForSense: Accelerating Online Research Through Sensemaking Integration and Machine Research Support," IUI 2021  
https://dl.acm.org/doi/10.1145/3397481.3450649

[21] Hsieh, G. et al., "Fuse: In-Situ Sensemaking Support in the Browser," CHI 2022  
https://dl.acm.org/doi/10.1145/3526113.3545693

[22] "Orca: Browsing at Scale Through User-Driven and AI-Facilitated Orchestration Across Malleable Webpages," arXiv:2505.22831 (2025)  
https://arxiv.org/html/2505.22831v1

[23] Google Chrome Blog, "3 new generative AI features coming to Google Chrome" (January 23, 2024)  
https://blog.google/products-and-platforms/products/chrome/google-chrome-generative-ai-features-january-2024/  
Also: TechCrunch coverage https://techcrunch.com/2024/01/23/google-chrome-gains-ai-features-including-a-writing-helper-theme-creator-and-tab-organizer/

[24] Google Chrome Blog, "3 Chrome updates to help you stay on top of your tabs" (September 2024 — Tab Groups sync)  
https://blog.google/products-and-platforms/products/chrome/google-chrome-update-september-2024/

[25] Windows Latest, "Microsoft Edge is promoting Vertical Tabs again, now that Google Chrome also has the feature" (April 2026)  
https://www.windowslatest.com/2026/04/16/microsoft-edge-is-promoting-vertical-tabs-again-now-that-google-chrome-also-has-the-feature/

[26] Mozilla Connect, "Sidebar and Vertical Tabs Launch in Release 136" (early 2026)  
https://connect.mozilla.org/t5/discussions/sidebar-and-vertical-tabs-launch-in-release-136/m-p/93524

[27] Gitnux, "Browser User Statistics | 2026 Edition"  
https://gitnux.org/browser-user-statistics/  
*CAVEAT: Methodology not independently verified. Adoption percentages (18% Edge vertical tabs, 10% all-browser vertical tab use) should be treated as directional estimates only.*

[28] Microsoft Edge Blog, "Meet Copilot Mode in Edge: Your AI browser" (October 23, 2025)  
https://blogs.windows.com/msedgedev/2025/10/23/meet-copilot-mode-in-edge-your-ai-browser/

[29] SQ Magazine, "Web Browser Usage Statistics 2026"  
https://sqmagazine.co.uk/web-browser-usage-statistics/  
(Edge Workspaces 1.5M+ users; 61% corporate edge adoption)

[30] Nepal et al., "Current and Future Use of Large Language Models for Knowledge Work," arXiv:2503.16774 (2025, n=216)  
https://arxiv.org/html/2503.16774

[31] JPMorgan Chase, "2026 Tech Trends: The End of App Switching; Intent is the New Interface"  
https://www.jpmorganchase.com/content/dam/jpmorganchase/documents/technology/2026-tech-trends-the-end-of-app-switching.pdf  
(AI browser market: $4.5B 2024 → $76.8B 2034, CAGR 32.8%)

[32] Microsoft AI Economy Institute, "Global AI Adoption in 2025" (~1 in 6 people worldwide using generative AI, H2 2025)  
https://www.microsoft.com/en-us/corporate-responsibility/topics/ai-economy-institute/reports/global-ai-adoption-2025/

[33] StatCounter Global Stats, Browser Market Share Worldwide  
https://gs.statcounter.com/browser-market-share  
Also: https://gs.statcounter.com/browser-market-share/desktop

[34] Digital Applied, "Browser Market Share 2026: Complete Statistics Report" (Edge: 13.7% desktop, 18.6% Win 11)  
https://www.digitalapplied.com/blog/browser-market-share-2026-complete-statistics

[35] Microsoft Edge Blog, "Protect your enterprise from shadow AI and more: Announcements at RSAC 2026" (March 2026)  
https://blogs.windows.com/msedgedev/2026/03/23/protect-your-enterprise-from-shadow-ai-and-more-announcements-at-rsac-2026/

[36] Brave Software, "Brave browser passes 100 million monthly active users" (official announcement, October 1, 2025)  
https://brave.com/blog/100m-mau/  
Feb 2026 update (109M MAU): https://ppc.land/brave-origin-strips-ai-rewards-and-vpn-for-privacy-purists-at-a-price/

[37] Perplexity AI, "Introducing Comet: Browse at the speed of thought" (July 9, 2025)  
https://www.perplexity.ai/hub/blog/introducing-comet  
TechCrunch: https://techcrunch.com/2025/07/09/perplexity-launches-comet-an-ai-powered-web-browser/

[38] Perplexity AI, "The Internet is Better on Comet" (free worldwide, October 2, 2025)  
https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide  
TechCrunch: https://techcrunch.com/2025/10/02/perplexitys-comet-ai-browser-now-free-max-users-get-new-background-assistant/

[39] The Browser Company, "Letter to Arc members 2025" (Arc maintenance mode, pivot rationale)  
https://browsercompany.substack.com/p/letter-to-arc-members-2025

[40] Appfigures, "Does Anyone Need an AI Browser? Arc Goes into the Ice Box..." (1.4M App Store downloads, October 2024)  
https://appfigures.com/resources/insights/20241025?f=2

---

## Claims Excluded or Downgraded

| Source | Claim | Reason Excluded |
|--------|-------|----------------|
| Pactify blog | "68% of knowledge workers keep 30+ tabs" from "Digital Wellness Survey, 2025" | Unverifiable — "Digital Wellness Survey" not independently traceable; appears AI-generated |
| lifetips.alibaba.com | "68% of KWs maintain 15-37 active tabs" attributed to NN/g study n=1,247 | Unverifiable — NN/g has no such publicly listed study; appears AI-generated |
| Gitnux, "74% of users utilize Tab Groups" | Adoption figure | Methodology completely opaque; not independently verified |
| Wifitalents.com figures | Various adoption claims | Appears to repackage Gitnux without additional sourcing |
| Gloria Mark's "23 min 15 sec" | Interruption recovery time | Not in any peer-reviewed paper; interview statement only |
