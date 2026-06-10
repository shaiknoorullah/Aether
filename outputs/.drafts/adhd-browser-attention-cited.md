# ADHD, Neurodivergence, and the Web Browser (2026)
## Executive-Function Challenges, Digital Accommodations, Shame vs. Support, and the Attention-Protecting Browser

**Research Brief | Aether Browser Project | June 2026**

---

## Executive Summary

Approximately 15.5 million U.S. adults carry an ADHD diagnosis [1], with global working-age prevalence estimated at 4–5% [2]. This population interacts with the web browser through a neurobiological lens that mainstream browser design has never accounted for: impaired working memory, time blindness, deficits in task initiation, impulse-driven tab proliferation, and hyperfocus states that refuse a 25-minute timer. The result is not a failure of willpower — it is a structural mismatch between 35-year-old browser design and a nervous system that requires externalized scaffolding [3].

The research evidence across clinical neuroscience, HCI, and design practice converges on five actionable conclusions:

1. **ADHD executive-function deficits are not generic inattention.** Four distinct mechanisms — time blindness, task initiation failure, working memory compression, and impulse-control under novelty — each demand specific browser-side countermeasures [4][5][6].
2. **Tab overload is a working-memory externalization problem, not a discipline problem.** Evidence shows 37%+ of adults with ADHD have 21+ tabs open at once; 80%+ bookmark content they never return to [7].
3. **Existing focus tools cause measurable shame in neurodivergent users.** A 2026 CHI study found that timer-based blockers caused shame and inadequacy feelings in 27 neurodivergent students [8].
4. **Effective scaffolding is behaviorally-responsive, autonomy-preserving, and non-punitive.** SDT-based interventions, adaptive nudging, and body doubling outperform rigid timer/gamification approaches [9][10].
5. **An attention-protecting browser should externalize executive function, not restrict behavior.** The emerging design paradigm replaces restriction with visible structure, ambient presence, and scaffolded task entry [3][11][12].

---

## 1. Clinical Background: What ADHD Is and Is Not

### 1.1 Prevalence and Heterogeneity

ADHD is classified in the DSM-5-TR and ICD-11 as a neurodevelopmental condition. A 2023 MMWR CDC survey found 15.5 million U.S. adults currently diagnosed, with about half having accessed telehealth for ADHD services [1]. Global clinical-setting prevalence for adults is estimated at 21.4% (95% CI 20–23%) in a 2025 Molecular Psychiatry meta-analysis (N=43,311 adult participants) [13]. Working-age digital-environment estimates suggest 4–5% of the global adult population is affected [2].

The condition presents in three subtypes: inattentive, hyperactive-impulsive, and combined. Comorbidity is the rule, not the exception: anxiety, depression, autism spectrum, and learning disabilities co-occur at rates of 50–70% [14]. This heterogeneity is critical for browser design: a feature effective for pure inattention ADHD may be counterproductive for AuDHD (autism + ADHD) users or those with comorbid anxiety.

### 1.2 The Executive Function Deficit Model (and Its Limits)

The dominant theoretical framework — Barkley's EF deficit model — posits that ADHD involves reduced executive control associated with dopamine-signaling deficits in the PFC, basal ganglia, thalamus, and amygdala circuits [4]. Stimulant medication modulates dopamine and norepinephrine, enhancing task-related brain networks and suppressing the default-mode network [15].

However, as the 2025 JMIR randomized feasibility study documents, no single EF deficit has been identified as sufficient to cause ADHD; neuroimaging data remain correlational [9]. A growing body of research advocates for neuroaffirmative, SDT-based framing: ADHD behaviors as neurobiologically altered approaches to task engagement, not deficits to be corrected.

**Design implication:** Tools built on the deficit model face an inherent contradiction: they demand effortful coping from a nervous system structurally challenged at allocating cognitive effort [9].

---

## 2. Executive-Function Challenges in the Browser

### 2.1 Task Initiation: The Hardest Button

Task initiation is not the same as laziness. A 2023 Nature paper found that ADHD involves a specific deficit in value-estimation for initiatory (first-stage) actions — the brain fails to adequately weight the expected reward of beginning a task, not just completing it [16]. In browser contexts: navigating to the right page and beginning to work is where initiation failure strikes. The blank search bar, the empty document, the first moment of a research session — these are high-friction points where ADHD users are most likely to "task-hop" to lower-demand, higher-novelty content [7].

The arXiv 2025 neurodivergent-aware productivity framework (n=25 ADHD professionals) found that more than 70% of respondents were "constantly or frequently pulled away from high-priority tasks owing to distractions or lower-priority work" [7].

**What helps:** Externalized task lists tied to current context; reading progress indicators; gentle presence cues. FocusUp (KIT, W4A 2025) implemented task-to-URL linking and reading progress bars for precisely this reason [11].

### 2.2 Working Memory Compression and Tab Hoarding

Working memory impairment is one of the most consistent cognitive findings in ADHD [4]. Tabs function as externalized WM: each open tab is a thought the user is afraid to lose. A 2025 survey of ADHD professionals (n=25) found [7]:
- 37% report 21+ browser tabs open at any given time
- 22% report 12–20 tabs open
- 20% "do not track" their tab usage
- 80%+ bookmark content with intention to return but never do

A 2023 CHI study ("When Browsing Gets Cluttered") confirmed that half of general users perceive tab overload as a problem — for ADHD users this pressure is neurologically amplified [17]. ABCT 2024 documented ADHD symptoms associated with digital hoarding in college students as a clinically significant pattern [18].

A 2024 neurodiversity study found that neurodivergent students (including ADHD) experience significantly higher perceived extraneous cognitive load in online learning environments compared to neurotypical peers (N=231) [19].

**What helps:** Tree-structured or visual browsing history; session-aware task-centric tab grouping; "where was I?" recall aids that surface recent context without requiring WM. Tabs.do research (UIST 2021) demonstrated that task-centric tab organization reduces overload [20]. A 2025 Focus Bear/RMIT proof-of-concept (Nagel et al., n=6) found that ML on tab-switching frequency, idle time, and task-relevance achieved R²=0.77 predicting attention states — establishing that passive behavioral sensing is technically feasible [21].

### 2.3 Time Blindness: Digital Environments as Time Voids

Time blindness — a documented deficit in temporal processing — means ADHD users lose track of how long they have been on a webpage or that a deadline is approaching. A 2023 IJERPH review of a decade of adult ADHD time perception research confirmed that time estimation, reproduction, production, and duration discrimination are all impaired domains [22]. Scalar expectancy theory research (Barkley et al., 1997, replicated multiple times) suggests an "abnormally fast internal counting process" in ADHD brains [23].

In browser contexts, this manifests as the "rabbit hole" pattern: a user intending to spend 5 minutes on a task is still there 90 minutes later. The internet is, by design, a context-free time void.

**What helps:** Ambient time elapsed display; task duration indicators; task-conditioned rather than timer-conditioned session management; end-of-session neutral summary.

### 2.4 Impulse Control: The Notification Trap and the Tab Spiral

Inhibitory control deficits interact with digital design in compounding ways. A 2023 J Psychiatric Research meta-analysis (N=18,859) confirmed significant correlations between problematic internet use and both inattention and hyperactivity-impulsivity [24]. A 2024 inhibitory control study found that as EF impairment increases, inattention more strongly predicts internet addiction — inhibitory control moderates the relationship [25]. A Scientific Reports (2023) longitudinal study found social media use predicts ADHD symptoms via impulsivity at between-person and within-person levels over 3 years [26].

The British Journal of Psychiatry review ("Genes and Screens") noted that heavy media multitasking harms working memory and task-switching for ADHD brains, citing the landmark Ophir, Nass & Wagner study on media multitaskers [27].

**What helps:** Notification suppression/batching; removal of attention-capturing design patterns (ACDPs) — the "Purpose Mode" browser extension study found this reduced daily social media time by 21 minutes on average [28]; reader mode stripping visual noise.

### 2.5 Hyperfocus: The Productive Trap

Hyperfocus is real but poorly defined. A Springer Current Psychology (2023) study found hyperfocus linked to affective dysregulation — it is not simply "good ADHD attention" but often occurs in emotionally engaging or anxiety-driven contexts [29]. A PLOS ONE (2023) study of N=1,220 adults found that distractibility in ADHD includes external distraction, intrusive thoughts, and mind-wandering — three distinct factors explaining ~80% of total variance, distinct from hyperfocus [30].

Critically for browser design, the UBC CHI 2026 study found that some neurodivergent users "described entering rare and hard-won states of hyperfocus that can take longer than the commonly assumed 25-minute focus block to reach" [8]. Timer-based focus tools that interrupt these states actively harm users.

Frontiers Psychiatry (2023) also found hyperfocus mediates the internet addiction pathway: hyperfocus on web content increases IA risk [31].

**What helps:** User-controlled session duration; hyperfocus detection via passive sensing; gentle, deferrable check-ins ("you've been in deep work for 2 hours — want to continue?") with zero penalty for declining.

---

## 3. Digital Accommodations That Have Evidence

### 3.1 What Works: Evidence-Grounded

**Reader / Focus Mode**
CHI 2019 Microsoft Research study (Firefox Reader View) established that reader mode significantly reduces visual complexity and improves reading speed [32]. BOIA accessibility documentation confirms reader mode benefits ADHD and dyslexia users specifically by removing ads, sidebars, and noise [33]. Firefox Reader View allows customization of font, weight, size, spacing, line height, and background color [34].

**Distraction Blocking (with important caveats)**
UbiComp 2017 field study (Mark et al., N=32 information workers, 5+5 day design): website blockers significantly increased focus and productivity vs. baseline [35]. A 1-month mobile internet blocking RCT improved sustained attention, mental health, and subjective well-being [36].

*Caveat (high confidence):* The UBC CHI 2026 study (N=27 neurodivergent students) found that for neurodivergent users specifically, inflexible timer-based blockers caused shame and counterproductive responses [8]. Task-conditioned blocking ("until I complete X") is preferred over timer-conditioned blocking. Curated digital stimming windows — not available in any current tool — were identified as a design need.

**Task-to-Context Linking**
FocusUp (W4A 2025, KIT): task list tied to website context + reading progress tracking. Early user study findings described as "promising and effective" at enhancing focus, task execution, and web-based productivity [11].

**Attention Estimation from Passive Data**
Focus Bear / RMIT proof-of-concept (Nagel et al., 2025, n=6): ML on tab-switching frequency, idle time, task-relevance achieved R²=0.77 predicting attention states in simulated sessions. Authors note clinical validation required; next phase: N=100 university students with ADHD screening [21].

**Cognitive Accessibility Features (COGA / WCAG)**
W3C COGA Design Guide provides actionable patterns: predictable hierarchy, consistent visual design, minimal extraneous information, error recovery without penalty [37]. WCAG 2.2 includes cognitive accessibility provisions but is acknowledged as insufficient for ADHD alone; COGA provides supplemental guidance [38]. A 2025 PLOS ONE psychophysiology study (eye-tracking) showed cognitive accessibility features improve cognitive engagement even in users without disabilities, suggesting universal design benefits [39].

**Body Doubling (Digital)**
ACM TACCESS 2024 survey (N=220 neurodivergent people): body doubling (using social presence to start/stay on tasks) is widely used and can be remote, recorded, or live [40]. A FLOWN industry survey (N=117 adults with ADHD) reported over 2x increase in sustained focus with virtual body doubling and faster task re-engagement [41]. *Note: industry survey, confidence medium; consistent with community reports and NPR coverage [42].* An AI-simulated body doubling chatbot prototype (Malmö University, 2024) supported task initiation for users with limited access to real partners [7].

**Typography and Visual Design**
CHI 2026 eye-tracking/pupillometry study found ADHD status has a "large effect size" on reading speed, and font and font size significantly affect reading performance for ADHD readers [43]. This supports making typography settings (size, font, spacing, contrast) first-class browser controls, not buried preferences.

### 3.2 What Is Untested or Overstated

- **AI browser assistants:** No published RCT measuring ADHD outcomes for any AI browser feature (Chrome AI, Arc AI). Potential benefits and risks both unquantified as of 2026.
- **Gamified productivity:** Systematic review (MDPI Information, 2025) documents an "Engagement–Efficacy–Ethics Trilemma" — gamification increases engagement metrics but can harm clinical outcomes [44]. Forest app specifically found to cause shame in neurodivergent users [8].
- **Pomodoro timers:** No ADHD-specific RCT. UBC 2026 study found timers stress users with anxiety and interrupt hyperfocus states [8].

---

## 4. Shame vs. Support in Productivity Tooling

### 4.1 The Shame Architecture of Current Tools

The dominant design paradigm in focus/productivity software relies on a compliance architecture: streaks that reset to zero, red badges, "accountability" surveillance, timer-based failure signals, and avatar death mechanics.

The UBC CHI 2026 study (N=27, doi:10.1145/3772318.3790801) found [8]:
1. Timer-based designs assume "one right way to focus" incompatible with ADHD variability
2. Users felt shame about how little focused time they sustained — "a shameful point of comparison" with Forest's focus duration metric
3. Users worried about becoming "dependent" on blockers, reinforcing inadequacy
4. "Digital stimming" — briefly visiting familiar content to manage cognitive load before entering a hard task — was blocked by current tools, forcing users to skip a working self-regulation strategy

Mad In America (2026) commentary argues current habit-tracking apps "enforce the disease model" — assuming non-compliance is the problem and punishment is the solution [45]. This aligns with the peer-reviewed UBC findings.

### 4.2 Self-Determination Theory as Design Framework

Self-Determination Theory (Deci & Ryan) posits three universal psychological needs: autonomy, competence, and relatedness. ADHD research links need frustration to psychopathology; need satisfaction supports motivation and self-regulation [46].

The JMIR Formative 2025 ADAPT framework (Champ et al., n=23 adults with ADHD, RCT feasibility design) tested an SDT-based, neuroaffirmative intervention. Key results [9]:
- Significant improvement in psychological distress (problems p=.01, functions p=.02, well-being p=.03)
- Significant improvement in ADHD symptom severity, particularly inattention (p≤.01)
- 90% found intervention "useful" or "helpful"
- Improvements occurred without targeting symptoms directly — solely via psychological need satisfaction
- Qualitative theme: participants stopped framing ADHD as personal failure and began understanding it as neurobiological difference

**Design translation:** Software that supports autonomy (user controls all timing and rules), competence (celebrates incremental progress, avoids failure messaging), and relatedness (body doubling, ambient co-working) will produce better outcomes than compliance-enforcement designs.

### 4.3 "Digital Stimming" as a Design Gap

The UBC study introduced "digital stimming" — using familiar, predictable digital content (a YouTube clip, a low-stimulation social feed) to settle cognitive state before entering a hard task [8]. This is a documented self-regulation strategy. Current blocker tools have no affordance for it: you either block everything or block nothing.

The researchers proposed "curated digital stimming" as a design pattern: a bounded, time-limited window of familiar/soothing content that helps users transition into work without falling into doomscrolling. This is a novel browser design primitive with no current implementation.

### 4.4 The Language of Scaffolds vs. Crutches

Users ask "do I have to use these apps for the rest of my life?" — framing accommodation as weakness. The SDT literature is clear: reframing EF support as "scaffolding" (structure that supports growth and self-understanding) rather than "crutches" (permanent compensations for deficiency) changes psychological outcomes [9]. The UBC study recommended "affirming language that normalizes fluctuating focus" — building self-acceptance rather than shame [8].

Horse Browser's explicit design philosophy encapsulates this: "The problem isn't your brain. Your browser was designed wrong in 1991" — locating the problem in the tool, not the user [3].

### 4.5 Privacy as a Psychological Safety Requirement

Behavioral sensing (tab-switching, idle time, attention estimation) is foundational to adaptive ADHD support — but ADHD users report heightened vulnerability to surveillance. The arXiv 2025 framework survey found 77% of ADHD professionals rate privacy as "very important" or "mandatory" [7]. All behavioral data must remain on-device; users must have full control to pause, modify, or delete sensing. This is not merely a legal requirement — it is a prerequisite for trust in a population that already carries stigma from masking in workplace contexts.

---

## 5. What an Attention-Protecting Browser Should Do

The following recommendations synthesize the clinical, HCI, and design evidence. They are organized by mechanism.

### 5.1 Externalize Working Memory (Never Require It)

- **Visual browsing history** (Horse Browser "Trails" [3]): navigation decisions shown spatially, not buried in chronological history. Users should not need to hold browser state in their heads.
- **Tab groups with semantic context** automatically suggested from page content.
- **"Where was I?" recall** at session start: surface the last 3–5 context states with brief summaries. Zero WM required to re-orient.
- **Bookmarks as active outbox**, not archive: contextually surfaced "to process" queue rather than dead-drop.

### 5.2 Support Task Initiation

- **Intent declaration** at session start: a low-friction prompt ("What are you working on?") that primes the user and anchors all subsequent session behavior.
- **Task-to-URL linking** (FocusUp pattern [11]): current task visible in browser chrome; only context-relevant tasks shown per site.
- **Ambient presence / body doubling mode** [40][7]: optional focus session companion signal — persistent visual/motion signal, not intrusive audio.
- **Soft nudges when intent-drift detected**: tab-switching frequency, idle time, URL divergence from declared task. ML viability established at R²=0.77 [21].

### 5.3 Provide Temporal Anchoring

- **Ambient elapsed time** display (visible but not prominent — prominence triggers anxiety in comorbid users).
- **Time on current site** visible to prevent the rabbit-hole clock problem.
- **Task-conditioned session end** as primary mode; timer-based sessions as secondary option.
- **Neutral end-of-session summary**: a map of where time went — not a performance score.

### 5.4 Reduce Perceptual and Cognitive Load

- **Aggressive reader mode** as default opt-in: strip ads, autoplay, overlay prompts, infinite scroll, sidebars [32][33].
- **Notification batching/suppression**: all interruptions deferred to session boundaries [7].
- **Anti-attention-capture mode** (Purpose Mode pattern [28]): disable autoplay, recommendation carousels, push notification permission dialogs.
- **Typography controls** as first-class UI: font, size, weight, line height, contrast — shown to meaningfully affect reading speed and cognitive load for ADHD readers [43].

### 5.5 Support Hyperfocus Without Punishing It

- **User-controlled session duration.** No forced breaks, no expiration timers [8].
- **Hyperfocus detection**: offer an optional, deferrable check-in after extended single-site engagement. Zero penalty for declining.
- **Curated digital stimming window** [8]: user-configured, bounded micro-break surface — familiar soothing content, time-limited, not an infinite-scroll risk. Novel design primitive, currently unimplemented.

### 5.6 Never Shame; Always Scaffold

- **No streaks, no failure states, no "you missed your goal" messaging** [8][44].
- **Framing as map, not scorecard**: "here's a map of your session" vs. "here's your productivity score."
- **Failure-tolerant design**: session deviation is information, shown neutrally [9].
- **User sovereignty over all sensing**: on-device ML, user-deletable data, pauseable sensing [7][9].
- **Language audit**: all UI strings reviewed against SDT autonomy-supportive principles [9][46].

---

## 6. Open Questions and Gaps

1. **RCT evidence is thin for browser-specific interventions.** No large-sample ADHD-specific RCT of any browser feature or browser-integrated tool has been published. The most relevant evidence uses general populations (UbiComp 2017) or small simulated samples (Focus Bear 2025).

2. **Heterogeneity challenge.** ADHD is not a unitary condition. AuDHD users, inattentive-only users, anxiety comorbidity, and medication status may respond differently to the same affordances. The research base is largely non-ADHD-specific or child/adolescent focused.

3. **"Digital stimming" as a design primitive.** UBC 2026 identifies this gap but provides no implementation. What content categories constitute appropriate stimming? How is the time boundary enforced without shame? How does the system distinguish productive hyperfocus from spiraling?

4. **AI browser features and ADHD.** No ADHD-specific RCT for any AI browser assistant has been published. The arXiv 2025 HITL framework and FocusUp are early-stage; benefits and harms of AI-powered contextual assistance remain unquantified.

5. **Privacy architecture for behavioral sensing.** The arXiv 2025 framework advocates on-device ML; the Focus Bear proof-of-concept used cloud-based GPT for task-relevance scoring. A production attention-protecting browser needs a resolved architecture.

6. **Body doubling at scale.** ACM TACCESS and FLOWN surveys establish community adoption; no RCT on digital body doubling as a browser-native feature has been conducted.

---

## Sources

[1] CDC MMWR (2024): "Attention-Deficit/Hyperactivity Disorder Diagnosis, Treatment, and Telehealth Use in Adults." https://www.cdc.gov/mmwr/volumes/73/wr/mm7340a1.htm

[2] Nagel et al., arXiv / NIMH estimate cited in arXiv 2507.06864 (2025). https://arxiv.org/html/2507.06864

[3] Horse Browser ADHD page. https://browser.horse/adhd

[4] Frontiers Psychiatry (2023): "Arousal dysregulation and executive dysfunction in ADHD." https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2023.1336040/full

[5] IJERPH (2023): "Time Perception in Adult ADHD: Findings from a Decade." https://www.mdpi.com/1660-4601/20/4/3098

[6] Nature (2023): ADHD task initiation deficit paper. https://www.nature.com/articles/s41398-023-02717-7 [PDF metadata only — full text not fetched]

[7] arXiv 2507.06864 (2025): "Toward Neurodivergent-Aware Productivity: A Systems and AI-Based Human-in-the-Loop Framework for ADHD-Affected Professionals." https://arxiv.org/html/2507.06864

[8] Chow, Hariadi, McGrenere (UBC, CHI 2026): "Focus apps are failing neurodivergent minds." CHI paper doi:10.1145/3772318.3790801. News summary: https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/

[9] Champ et al. (JMIR Formative Research, 2025): "A Neuroaffirmative, Self-Determination Theory–Based Psychosocial Intervention for Adults With ADHD: Randomized Feasibility Study." https://formative.jmir.org/2025/1/e69943

[10] ACM TACCESS (2024): Body doubling survey. https://dl.acm.org/doi/full/10.1145/3689648

[11] FocusUp (W4A 2025, KIT): Aljedaani, Leonard, Ruiz, Wegener. https://publikationen.bibliothek.kit.edu/1000185883/168296537

[12] Neurodivergent Browsing Assistant (Misha Labs). https://browse.mishalabs.com/

[13] Molecular Psychiatry (2025): Prevalence meta-analysis. https://preview-www.nature.com/articles/s41380-025-03178-8

[14] arXiv 2507.06864 — co-design survey notes on ADHD comorbidity prevalence in NHS setting (58.4% comorbidity noted in JMIR Formative [9]).

[15] Neuroscience & Biobehavioral Reviews (2024): "From neurons to brain networks, pharmacodynamics of stimulant medication for ADHD." https://www.sciencedirect.com/science/article/pii/S0149763424003105

[16] Nature / Translational Psychiatry (2023): ADHD task initiation deficit. https://www.nature.com/articles/s41398-023-02717-7 [PDF metadata only]

[17] CHI 2023: "When Browsing Gets Cluttered: Exploring and Modeling Interactions of Browsing Clutter, Browsing Habits, and Coping." https://dl.acm.org/doi/10.1145/3544548.3580690

[18] ABCT 2024 Annual Convention abstract: ADHD Symptoms Associated with Digital Hoarding in College Students. https://abct2024.eventscribe.net/ajaxcalls/PosterInfo.asp?PosterID=688996

[19] MDPI Education Sciences (2024): "Neurodiversity Positively Predicts Perceived Extraneous Load in Online Learning." N=231. https://www.mdpi.com/2227-7102/14/5/516

[20] UIST 2021: "Tabs.do: Task-Centric Browser Tab Management." https://dl.acm.org/doi/10.1145/3472749.3474777

[21] Nagel et al. (Focus Bear/RMIT, 2025): "Too Many Tabs Open? Using Everyday Computer Data to Support Focus for Adults with ADHD." https://nafath.mada.org.qa/nafath-article/mcn2903/

[22] IJERPH (2023): "Time Perception in Adult ADHD: Findings from a Decade—A Review." https://www.mdpi.com/1660-4601/20/4/3098

[23] PMC (2019): "Clinical Implications of the Perception of Time in Attention Deficit Hyperactivity Disorder (ADHD): A Review." https://pmc.ncbi.nlm.nih.gov/articles/PMC6556068/

[24] J Psychiatric Research (2023): "The relationship between problematic internet use and attention deficit, hyperactivity and impulsivity: A meta-analysis." N=18,859. https://www.sciencedirect.com/article/abs/pii/S0022395623004703

[25] PMC (2024): "Inhibitory control ability moderates the relationship between internet addiction and inattention in ADHD." https://pmc.ncbi.nlm.nih.gov/articles/PMC12135584/

[26] Scientific Reports (2023): "Screen time, impulsivity, neuropsychological functions and their relationship to growth in adolescent ADHD symptoms." https://www.nature.com/articles/s41598-023-44105-7

[27] Cambridge Core / British Journal of Psychiatry: "Genes and screens: ADHD in the digital age." https://www.cambridge.org/core/journals/the-british-journal-of-psychiatry/article/genes-and-screens-attentiondeficit-hyperactivity-disorder-in-the-digital-age/D692E6A269DD6FCB2CF965814270EEB9

[28] Purpose Mode study (hanklee.com): "Purpose Mode" browser extension reducing social media time by 21 min/day. https://hankhplee.com/papers/purpose_mode.pdf [PDF metadata only — direct URL from search result]

[29] Springer Current Psychology (2023): "The relations between hyperfocus and similar attentional states, adult ADHD symptoms, and affective dysfunction." https://link.springer.com/article/10.1007/s12144-023-05235-3

[30] PLOS ONE (2023): "A d factor? Understanding trait distractibility and its relationships with ADHD symptomatology and hyperfocus." N=1,220. https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0292215

[31] Frontiers Psychiatry (2023): "Hyperfocus symptom and internet addiction in individuals with ADHD trait." https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2023.1127777/full

[32] CHI 2019 / Microsoft Research: "The Impact of Web Browser Reader Views on Reading Speed and User Experience." https://www.microsoft.com/en-us/research/publication/the-impact-of-web-browser-reader-views-on-reading-speed-and-user-experience/

[33] BOIA: "How Browser Reader Modes Improve the Experiences of People with Disabilities." https://www.boia.org/blog/how-browser-reader-modes-improve-the-experiences-of-people-with-disabilities

[34] Firefox Reader View documentation. https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages

[35] Mark et al. UbiComp 2017: "How Blocking Distractions Affects Workplace Focus and Productivity." N=32. https://www.interruptions.net/literature/Mark-UbiComp17.pdf [PDF metadata only]

[36] Mobile internet blocking RCT (Semantic Scholar): "Blocking mobile internet on smartphones improves sustained attention, mental health, and subjective well-being." https://pdfs.semanticscholar.org/322a/0fc8c72f6dc5672ab587904a7efa888be3b7.pdf [PDF metadata only]

[37] W3C COGA Design Guide: "Making Content Usable for People with Cognitive and Learning Disabilities." https://www.w3.org/TR/coga-usable/design_guide.html

[38] WCAG 2.2. https://www.w3.org/TR/WCAG22/Overview.html

[39] PLOS ONE (2025): "Impact of web accessibility on cognitive engagement in individuals without disabilities: Evidence from a psychophysiological study." https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0328552

[40] ACM TACCESS (2024): "It Was Something I Naturally Found Worked and Heard About Later: An Investigation of Body Doubling with Neurodivergent Participants." N=220. https://dl.acm.org/doi/full/10.1145/3689648

[41] FLOWN / Neurodiversity in Business (industry survey, 2025): "Virtual Body Doubling for ADHD: New Research Findings from 117 Adults." N=117. https://neurodiversity.org/virtual-body-doubling-for-adhd-new-research-findings-from-117-adults/

[42] NPR (2024): "Come study with me: How a virtual buddy might help you get things done." https://www.npr.org/2024/07/25/nx-s1-4860330/come-study-with-me-how-virtual-buddy-might-help-you-get-things-done

[43] CHI 2026 (Extended Abstracts): "Reading with Diversity in Mind: Pupillometry and Typography Towards Inclusive Design for ADHD Readers." https://dl.acm.org/doi/10.1145/3772363.3799383

[44] MDPI Information (2025): "Gamification in Digital Mental Health Interventions: A Systematic Review of the Engagement–Efficacy–Ethics Trilemma." https://www.mdpi.com/2078-2489/17/2/168

[45] Mad In America (2026): "The Compliance Machine: How ADHD Habit-Tracking Apps Enforce the Disease Model." https://www.madinamerica.com/2026/03/the-compliance-machine-how-adhd-habit-tracking-apps-enforce-the-disease-model/

[46] SAGE (2021): "Studying Motivation in ADHD: The Role of Internal Motives and the Relevance of Self Determination Theory." https://journals.sagepub.com/doi/10.1177/10870547211050948

[47] Springer Nature / INTERACT 2025: "Towards Inclusive Guidelines for Web Design for Adults with ADHD." https://link.springer.com/chapter/10.1007/978-3-032-05008-3_59

[48] BMC Psychiatry (2025): Systematic review of reviews of digital interventions for ADHD. N=34,442. https://link.springer.com/article/10.1186/s12888-025-06825-0

[49] J Affective Disorders (2024): Meta-analysis of digital interventions for ADHD. N=1,780. https://www.sciencedirect.com/science/article/abs/pii/S0165032724013910

[50] Section508.gov: "Designing Digital Content For Users With Cognitive Disabilities." https://www.section508.gov/design/digital-content-users-with-cognitive-disabilities/

[51] Cambridge Core / European Psychiatry (2025): "Work Performance Challenges and Needs of Adults with ADHD: Exploring Lived Experiences." https://www.cambridge.org/core/journals/european-psychiatry/article/work-performance-challenges-and-needs-of-adults-with-adhd-exploring-lived-experiences/F89D938734C530D9ED3EA51C9E104DA0

[52] Frontiers Psychiatry (2024): "The dopamine hypothesis for ADHD: An evaluation of evidence." https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1492126/full

[53] Horse Browser overstimulation page. https://browser.horse/adhd/overstimulation

[54] LumiRead (Northeastern, TechXplore 2025): Neurodivergent-accessible Chrome extension. https://techxplore.com/news/2025-07-chrome-extension-web-accessible-neurodivergent.html

[55] IUI 2024: "Evaluating ADHD Users' Experience with Recommender Systems." https://dl.acm.org/doi/10.1145/3640544.3645222

[56] PLOS ONE (2024): "The lived experience of rejection sensitivity in ADHD." https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0314669

[57] Cleveland Clinic: "Rejection Sensitive Dysphoria (RSD): Symptoms & Treatment." https://my.clevelandclinic.org/health/diseases/24099-rejection-sensitive-dysphoria-rsd

[58] ADDitude Magazine: "Rejection Sensitive Dysphoria (RSD): ADHD and Emotional Dysregulation." https://www.additudemag.com/rejection-sensitive-dysphoria-adhd-emotional-dysregulation/
