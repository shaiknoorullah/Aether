# Direct Research Notes — Knowledge Worker Browser Research
## Search terms used and raw findings by track

---

## Track 1: Tab Overload & Context-Switching

### Searches run
1. "average number of browser tabs open knowledge workers survey statistics"
2. "Gloria Mark interruption recovery time context switching study 23 minutes"
3. "context switching cost productivity loss quantitative study browser"
4. Fetched: oberien.de (23-minute claim analysis), smallpdf.com, newswire.ca (Shift report), apa.org/multitasking, asana.com/context-switching, hcii.cmu.edu/tab-overload

### Tab Count Data

**Smallpdf Survey (n=1,005 US employees, 2024)**
- Average 8.5 tabs open while working
- 28% usually have 10+ tabs open
- Remote workers: average 10.8 tabs
- 51% mentally "check out" from excessive tabs; threshold = ~13 tabs average
- 4.5 hours/week searching for files/links = 29 work days/year lost
- Source: https://smallpdf.com/blog/digital-declutter-report

**Shift 2026 State of Browsing Report (n=1,000 US adults, conducted September 2025)**
- 1 in 5 users (20%) manage 11+ tabs at once
- Gen Z and Millennials most likely to keep 6–10 tabs open
- 81% willing/considering switching browsers; 92% want personalization
- 47% say "workflow fit is very important"
- Top feature requests: multiple accounts/logins (39%), task organization (34%), notification blocking (31%), app integrations (18%)
- Source: https://www.newswire.ca/news-releases/the-legacy-browser-is-at-a-breaking-point-according-to-the-state-of-browsing-report-831126731.html
- CAVEAT: Published by Shift (sells a browser product) — self-interested survey. Nationally representative weighting applied.

**CMU HCII "When the Tab Comes Due" (CHI 2021)**
- Authors: Joseph Chee Chang, Aniket Kittur et al.
- Method: Interviews with 10 information workers + survey of 103 participants (with 12+ tabs on work computer)
- ~25% reported browser/computer crashed from too many tabs
- People keep tabs open because: fear "black hole effect" of losing information, using tabs as reminders, avoid re-searching
- Tabs fail at: task-switching, preserving complex thought structure, managing multi-source decision tasks
- Skeema extension (task-centric) significantly reduced tabs, stress, and improved focus in early beta
- Source: https://www.hcii.cmu.edu/news/overcoming-tab-overload (HTML). Full paper PDF only: joe.cat/images/papers/tabs.pdf [PDF_NOT_PARSED]

### Context-Switching Cost Data

**"23 minutes 15 seconds" claim — IMPORTANT CAVEAT**
- This figure is NOT documented in any peer-reviewed paper. It originates from interviews given by Gloria Mark (UC Irvine) to Fast Company and the Wall Street Journal.
- The actual CHI 2008 Mark paper ("The Cost of Interrupted Work") measured workers worked FASTER under interruptions (20.31 min vs. 22.77 min without) but with significantly higher stress. The paper contains no "23 min" figure.
- Analysis source: https://blog.oberien.de/2023/11/05/23-minutes-15-seconds.html

**What the papers actually say:**
- Iqbal & Horvitz, CHI 2007 ("Disruption and Recovery of Computing Tasks"): 11–16 minutes to resolve an interruption until getting back to the original task.
  Source: https://erichorvitz.com/CHI_2007_Iqbal_Horvitz.pdf [PDF_NOT_PARSED — found via oberien analysis]
- Gloria Mark et al., CHI 2005 ("No Task Left Behind"): Work is highly fragmented; information workers average ~3 minutes on any task before switching. Examined 24 information workers.
  Source: https://ics.uci.edu/%7Egmark/CHI2005.pdf [PDF_NOT_PARSED — found via search]
- Rubinstein, Evans & Meyer (2001), Journal of Experimental Psychology: Task switching costs can reach 40% of productive time for complex tasks.
  Source (APA summary): https://www.apa.org/topics/research/multitasking
- Gloria Mark et al., CHI 2008: After 20 minutes of repeated interruptions, workers reported significantly higher stress, frustration, workload, effort, and pressure.
  Source: https://ics.uci.edu/~gmark/chi08-mark.pdf [PDF_NOT_PARSED]

**Asana Anatomy of Work Index (n=10,000 knowledge workers, multi-country)**
- 56% feel they must respond to notifications immediately
- Average 9 apps/day switched between
- 60% of time spent on "work about work" (vs. 35% perceived)
- 52% multitask during virtual meetings
- Source: https://asana.com/resources/context-switching + https://asana.com/resources/anatomy-of-work

**APA Summary (Rogers & Monsell 1995; Rubinstein et al. 2001)**
- Task switching costs "as much as 40 percent of someone's productive time" for complex tasks
- Both "goal shifting" and "rule activation" costs make every switch non-zero
- Source: https://www.apa.org/topics/research/multitasking

---

## Track 2: Research & Capture Workflows

### Searches run
1. "web research capture workflow Zotero Readwise Hypothesis users statistics adoption 2024 2025"
2. "browser bookmark usage abandonment rate tab hoarding psychology study"
3. "read-later app Pocket Instapaper usage statistics 2024"

### Bookmark Behavior

**Bergman, Whittaker & Schooler (2021, Journal of Information Science)**
- Study title: "Out of sight and out of mind: Bookmarks are created but not used"
- Empirically confirmed bookmarks are rarely retrieved once created
- Source: https://journals.sagepub.com/doi/10.1177/0961000620949652

**Historical context:**
- Pitkow & Kehoe (1996), n=6,619 survey: 80%+ cited bookmarks as strategy
- Abrams et al. (1998), n=322: Bookmark collection exceeds 40 items after 1 year, 200+ after 2 years
- Source: https://asistdl.onlinelibrary.wiley.com/doi/10.1002/meet.1450390143

### Tab Hoarding as Proxy for Lost Retrieval

**CMU CHI 2021 (Chang et al.)**
- A key driver of tab hoarding: users don't trust search or bookmarks to resurface important content → keep it "visible" as open tabs
- Many use tabs as a substitute for read-later apps, notes, and task managers — poorly

### Browsing Clutter — CHI 2023

**"When Browsing Gets Cluttered" (CHI 2023)**
- Method: N=16 interviews + N=400 online survey
- Browsing clutter = buildup of disorganized tabs, windows, bookmarks, and history
- Study explores coping behaviors and contributing habits
- Source: https://dl.acm.org/doi/10.1145/3544548.3580690

### Read-Later Tools

**Pocket**
- ~30 million users (2021 data); 2M+ Chrome extension downloads; 51,685 websites use Pocket widget
- Sources: https://tooltivity.com/extensions/compare/instapaper-vs-save-to-pocket, https://www.greasyguide.com/marketing/instapaper-vs-pocket-how-to-choose-the-best-read-later-app-for-you/

**Instapaper**
- ~4 million users (2021); ~200K Chrome extension downloads; ~13% premium conversion rate
- Source: https://www.greasyguide.com/marketing/instapaper-vs-pocket-how-to-choose-the-best-read-later-app-for-you/

**Readwise / Reader**
- No public user count. Described as "first read-it-later app built for power readers"
- Jan 2025 update: Chat with Highlights feature
- Source: https://readwise.io/read, https://readwise.io/reader/update-jan2025

### Web Annotation — Hypothesis

- 80 million annotations milestone as of June 2025
- 2024: 22% increase in annotations; 12% rise in student users; 27% growth in courses
- Source: https://web.hypothes.is/blog/what-we-learned-from-80-million-annotations-and-why-it-matters/
- Source: https://sociable.co/business/hypothesis-reports-27-growth-in-courses-utilizing-its-annotation-tool-in-2024/

### Reference Management — Zotero

- ~7.5 million accounts created (per Zotero forum discussion and CheckThat.ai)
- Actual active users substantially lower (can use without account)
- Free browser connector available; key tool for academic researchers
- Source: https://forums.zotero.org/discussion/89132/statistics-of-zotero-number-of-users
- Source: https://cdh.princeton.edu/blog/2025/11/11/making-research-easier-to-save-a-guide-to-zotero-integration-for-academic-websites/

### Academic Sensemaking Research

**Fuse (ACM CHI 2022)**
- Browser extension externalizing users' working memory for in-situ sensemaking
- Source: https://dl.acm.org/doi/10.1145/3526113.3545693

**ForSense (IUI 2021)**
- Browser extension integrating multiple stages of online research + machine assistance
- Source: https://dl.acm.org/doi/10.1145/3397481.3450649

**Orca (arXiv 2505.22831, 2025)**
- AI-facilitated browsing at scale; orchestrates across multiple malleable webpages
- User study: batch operations and synthesis at scale found helpful by participants; reduced manual effort
- Source: https://arxiv.org/html/2505.22831v1

---

## Track 3: Desired Browser Features

### Searches run
1. "browser features users want survey 2024 2025 knowledge workers"
2. "tab management browser frustration survey pain points" [partially hit rate limit]
3. "AI browser features adoption survey 2025 Microsoft Edge Copilot"
4. "vertical tabs browser feature adoption Edge Firefox statistics"
5. "Chrome tab groups feature adoption usage statistics 2024"
6. "browser session management research distraction notification overload study 2024 2025"

### Survey-Backed Feature Preferences

**Shift 2026 State of Browsing (n=1,000, Sept 2025):**
- Multiple accounts/logins: 39%
- Task organization: 34%
- Notification blocking: 31%
- App integrations: 18%
- 81% willing/considering switch; 47% cite workflow fit as very important
- Source: https://www.newswire.ca/news-releases/...

**Smallpdf (n=1,005, 2024):**
- 51% overwhelmed by too many tabs; 54% overwhelmed by unread emails
- 28% overwhelmed weekly by digital workspace; 7% daily
- Source: https://smallpdf.com/blog/digital-declutter-report

### Vertical Tabs & Tab Management

- Firefox: Sidebar + vertical tabs shipped in v136 (early 2026)
  Source: https://connect.mozilla.org/t5/discussions/sidebar-and-vertical-tabs-launch-in-release-136/m-p/93524
- Chrome: Vertical tabs announced April 2026 (Google following Edge)
  Source: https://www.windowslatest.com/2026/04/16/microsoft-edge-is-promoting-vertical-tabs-again-now-that-google-chrome-also-has-the-feature/
- Edge: Had vertical tabs before Chrome; "promoting again" after Chrome added
- Gitnux figures: "18% of Edge active users use vertical tabs"; "10% of all browser users"
  CAVEAT: Gitnux methodology not independently verified. Use with caution.
  Source: https://gitnux.org/browser-user-statistics/

### Chrome AI Tab Organizer (Jan 2024)

- Launched Jan 23, 2024 as experimental feature on Mac/Windows
- Suggests groupings for open tabs using AI
- No public adoption rate data from Google
- Sources: https://blog.google/products-and-platforms/products/chrome/google-chrome-generative-ai-features-january-2024/
  https://techcrunch.com/2024/01/23/google-chrome-gains-ai-features-including-a-writing-helper-theme-creator-and-tab-organizer/

### Distraction & Notification Studies

**Purpose Mode (ACM TOCHI, 2025)**
- 2-week mixed-methods field study, n=29
- Measured how attention capture damaging patterns (ACDPs, e.g., infinite scroll) affect distraction
- Suppressing ACDPs reduced perceived distraction
- Source: https://dl.acm.org/doi/10.1145/3711841

**LLM for Knowledge Work Survey (arXiv 2503.16774)**
- n=216 knowledge workers surveyed on current and desired LLM usage
- Workers want AI to reduce tedious tasks; productivity and reduction of work about work emphasized
- Source: https://arxiv.org/html/2503.16774

---

## Track 4: AI-Native Browser Landscape (2025–2026)

### Searches run
1. "AI browser features 2025 2026 launches" → AI browser market $4.5B→$76.8B by 2034
2. "Brave browser users 2025 market share Leo AI"
3. "Arc browser user count 2025 knowledge workers"
4. "Perplexity Comet browser launch 2025 users"
5. "Microsoft Edge market share 2025 2026 knowledge workers enterprise"
6. "Chrome AI tab organizer feature adoption"

### Browser Market Share (2025–2026)

| Browser | Global All-Device (Apr 2026) | Desktop (Feb 2026) | Notes |
|---------|------|------|------|
| Chrome | ~67% | ~65-73% | StatCounter |
| Safari | ~14-19% | – | Mobile-heavy |
| Edge | ~4.65-5.4% | ~13.7% | Higher on Windows |
| Firefox | ~2.74% | – | Stable |
| Brave | ~1%+ | – | 109M MAU (Feb 2026) |

Sources: https://gs.statcounter.com/browser-market-share, https://www.digitalapplied.com/blog/browser-market-share-2026-complete-statistics

### Brave
- 101M MAU (September 30, 2025) — official Brave announcement
- 109M MAU (February 2026)
- 42M DAU (Sept 2025); DAU/MAU = 0.42
- Leo AI: built-in LLM assistant
- Source: https://brave.com/blog/100m-mau/

### Arc (The Browser Company)
- Pivoted away from Arc browser; maintenance mode from Oct 2024
- 1.4M total App Store downloads (as of Oct 2024)
- Peak: estimated 1–5M users; <0.2% global market share
- "Novelty tax" — only ~5% of features heavily used according to company's revealed preference data
- Direct quote from Browser Company letter: too many new things for too little reward
- Sources: https://browsercompany.substack.com/p/letter-to-arc-members-2025, https://appfigures.com/resources/insights/20241025?f=2

### Perplexity Comet
- Launched July 9, 2025 to Max subscribers ($200/month)
- Went free worldwide October 2, 2025
- "Millions" joined waitlist between July–October 2025
- Features: AI agent, enterprise app connections (Slack etc.), voice+text, background assistant
- Sources: https://www.perplexity.ai/hub/blog/introducing-comet, https://techcrunch.com/2025/07/09/perplexity-launches-comet-an-ai-powered-web-browser/, https://techcrunch.com/2025/10/02/perplexitys-comet-ai-browser-now-free-max-users-get-new-background-assistant/

### Microsoft Edge
- Copilot Mode launched October 2025
- 13.7% desktop share overall; 18.6% on Windows 11 desktop; 5.4% all-device
- Enterprise: 61% corporate adoption (per SQ Magazine); 1.5M+ Edge Workspaces users
- RSAC 2026: Shadow AI protections announced for enterprise Edge
- Sources: https://blogs.windows.com/msedgedev/2025/10/23/meet-copilot-mode-in-edge-your-ai-browser/, https://sqmagazine.co.uk/web-browser-usage-statistics/

### Chrome
- 3.4+ billion users (2025); ~67% global share
- AI Tab Organizer: Jan 2024 (experimental); Tab Groups: cross-device sync Sept 2024; Vertical tabs: April 2026
- Sources: multiple

### Firefox
- ~2.74% global share
- Sidebar + vertical tabs: Firefox 136 (early 2026)

### AI Browser Market
- JPMorgan Chase 2026 Tech Trends: AI browser market $4.5B (2024) → $76.8B (2034), CAGR 32.8%
- Source: https://www.jpmorganchase.com/content/dam/jpmorganchase/documents/technology/2026-tech-trends-the-end-of-app-switching.pdf

### Global AI Adoption
- Microsoft AI Economy Institute (2025): ~1 in 6 people worldwide use generative AI tools (as of H2 2025)
- Source: https://www.microsoft.com/en-us/corporate-responsibility/topics/ai-economy-institute/reports/global-ai-adoption-2025/

---

## EXCLUDED / NOT CITED (Reasons)

| Source | Reason |
|--------|--------|
| Pactify blog "68% of knowledge workers keep 30+ tabs" | Appears AI-generated; "Digital Wellness Survey, 2025" uncorroborated |
| lifetips.alibaba.com "68% of KWs maintain 15-37 active tabs" | Appears AI-generated; attributed NN/g study not verifiable |
| Gitnux "74% of users utilize Tab Groups" | Methodology opaque; treat with high caution |
| Wifitalents.com vertical tab figures | Appears to repackage Gitnux data without sourcing |
