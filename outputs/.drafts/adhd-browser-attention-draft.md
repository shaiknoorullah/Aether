# ADHD, Neurodivergence, and the Web Browser (2026)
## Executive-Function Challenges, Digital Accommodations, Shame vs. Support, and the Attention-Protecting Browser

**Research Brief | Aether Browser Project | June 2026**
**Draft — pre-citation sweep**

---

## Executive Summary

Approximately 15.5 million U.S. adults carry an ADHD diagnosis (CDC, 2023), with global working-age prevalence estimated at 4–5%. This population interacts with the web browser through a neurobiological lens that mainstream browser design has never accounted for: impaired working memory, time blindness, deficits in task initiation, impulse-driven tab proliferation, and hyperfocus states that refuse a 25-minute timer. The result is not a failure of willpower — it is a structural mismatch between 35-year-old browser design and a nervous system that requires externalized scaffolding.

The research evidence across clinical neuroscience, HCI, and design practice converges on five actionable conclusions:

1. **ADHD executive-function deficits are not generic inattention.** Four distinct mechanisms — time blindness, task initiation failure, working memory compression, and impulse-control under novelty — each demand specific browser-side countermeasures.
2. **Tab overload is a working-memory externalization problem, not a discipline problem.** Evidence shows 37%+ of adults with ADHD have 21+ tabs open at once; 80%+ bookmark content they never return to. Tabs serve as cognitive prosthetics for a compressed WM system.
3. **Existing focus tools cause measurable shame in neurodivergent users.** A 2026 CHI study found that timer-based blockers (Forest, Freedom, Apple Screen Time) produced shame and feelings of inadequacy in 27 neurodivergent students. Current tools are designed for neurotypical compliance architectures.
4. **Effective scaffolding is behaviorally-responsive, autonomy-preserving, and non-punitive.** SDT-based interventions, adaptive nudging, and body doubling outperform rigid timer/gamification approaches. Design must treat attention as a dynamic state, not a skill to be trained.
5. **An attention-protecting browser should externalize executive function, not restrict behavior.** The emerging design paradigm — seen in Horse Browser, FocusUp, and the arXiv 2025 neuro-inclusive framework — replaces restriction with visible structure, ambient presence, and scaffolded task entry.

---

## 1. Clinical Background: What ADHD Is and Is Not

### 1.1 Prevalence and Heterogeneity

ADHD is classified in the DSM-5-TR and ICD-11 as a neurodevelopmental condition. U.S. adult prevalence is approximately 6% diagnosed; a 2023 MMWR CDC survey found 15.5 million U.S. adults currently diagnosed, with about half having accessed telehealth for ADHD services. Global clinical-setting prevalence for adults is estimated at 21.4% (95% CI 20–23%) in a 2025 Molecular Psychiatry meta-analysis (N=43,311 adult participants).

The condition presents in three subtypes: inattentive, hyperactive-impulsive, and combined. Adults are disproportionately inattentive-predominant or combined type. Comorbidity is the rule, not the exception: anxiety, depression, autism spectrum, and learning disabilities co-occur at rates of 50–70%. This heterogeneity is critical for browser design: a feature effective for pure inattention ADHD may be counterproductive for AuDHD (autism + ADHD) users or those with comorbid anxiety.

### 1.2 The Executive Function Deficit Model (and Its Limits)

The dominant theoretical framework — Barkley's EF deficit model — posits that ADHD involves reduced executive control associated with dopamine-signaling deficits in the prefrontal cortex, basal ganglia, thalamus, and amygdala circuits. Stimulant medication modulates dopamine and norepinephrine, enhancing task-related brain networks and suppressing the default-mode network.

However, as the 2025 JMIR randomized feasibility study by Champ et al. documents, no single EF deficit has been identified as sufficient to cause ADHD. Neuroimaging data remain correlational; neurobiological variations are often categorized as "abnormal" rather than explored as alternative neural organization. A growing body of research advocates for neuroaffirmative, SDT-based framing: ADHD behaviors as neurobiologically altered approaches to task engagement, not deficits to be corrected.

**Design implication:** Tools built on the deficit model — "you're failing at focus, let this app punish you until you comply" — face an inherent contradiction: they demand effortful coping from a nervous system structurally challenged at allocating cognitive effort.

---

## 2. Executive-Function Challenges in the Browser

### 2.1 Task Initiation: The Hardest Button

Task initiation is not the same as laziness or procrastination in the neurotypical sense. A 2023 Nature paper found that ADHD involves a specific deficit in value-estimation for initiatory (first-stage) actions — the brain fails to adequately weight the expected reward of beginning a task, not just completing it. This is distinct from sustained-attention deficits.

In browser contexts: opening a new tab is easy; navigating to the right page and beginning to work is where initiation failure strikes. The blank search bar, the empty document, the first moment of a research session — these are high-friction points where ADHD users are most likely to "task-hop" to lower-demand, higher-novelty content.

**What helps:** Externalized task lists tied to current context (which website is open); reading progress indicators; gentle presence cues ("you declared you'd work on X — still with you"). FocusUp (KIT 2025) implemented task-to-URL linking and reading progress bars for precisely this reason.

### 2.2 Working Memory Compression and Tab Hoarding

Working memory impairment is one of the most consistent cognitive findings in ADHD. In digital environments, tabs function as externalized WM: each open tab is a thought the user is afraid to lose. A 2025 survey of ADHD professionals (n=25) found:
- 37% report 21+ browser tabs open at any given time
- 22% report 12–20 tabs open
- 20% "do not track" their tab usage
- 80%+ bookmark content with intention to return but never do

A 2023 CHI study ("When Browsing Gets Cluttered") confirmed that half of general users perceive tab overload as a problem — for ADHD users, this pressure is neurologically amplified.

The "tab hoarding" behavior pattern documented at ABCT 2024 (ADHD symptoms associated with digital hoarding in college students) suggests the behavior has clinical significance beyond mere preference.

**What helps:** Tree-structured or visual browsing history (Horse Browser's "Trails" approach); session-aware tab grouping tied to tasks; "where was I?" recall aids that surface recent context without requiring the user to remember; spatial rather than sequential tab organization. The 2021 Tabs.do research (UIST) demonstrated that task-centric tab organization reduces overload.

### 2.3 Time Blindness: Digital Environments as Time Voids

Time blindness — a deficit in temporal processing documented across multiple studies — means that ADHD users lose track of how long they have been on a webpage, how much of a session has passed, or that a deadline is approaching. Scalar expectancy theory suggests an "abnormally fast internal counting process" in ADHD brains; however they subjectively experience time as passing faster.

In browser contexts, this manifests as the "rabbit hole" pattern: a user intending to spend 5 minutes on one task is still there 90 minutes later. No external clock is visible; the browser provides no temporal anchoring. The internet is, by design, a context-free time void.

A 2023 review (IJERPH) of a decade of adult ADHD time perception research confirmed that time estimation, reproduction, production, and duration discrimination are all impaired domains in adult ADHD.

**What helps:** Ambient, non-alarming time display within the browsing surface (time elapsed on current site/task); task duration estimations with soft reminders; visual progress tied to declared tasks rather than arbitrary timer countdowns; "intent declaration" at session start.

### 2.4 Impulse Control: The Notification Trap and Tab Opening Spiral

Inhibitory control deficits interact with digital environment design in compounding ways. Every notification, autoplaying video, or "recommended content" widget is an impulse trigger engineered by the attention economy to exploit exactly the inhibitory deficit ADHD users carry.

A 2023 J Psychiatric Research meta-analysis (N=18,859) confirmed significant correlations between problematic internet use and both inattention and hyperactivity-impulsivity. A 2024 inhibitory control study found that the inattention→internet addiction relationship is moderated by IC ability: as EF impairment increases, inattention more strongly predicts internet addiction.

Screen time and social media further compound: Scientific Reports (2023) longitudinal study found social media use predicts ADHD symptoms via impulsivity at between-person and within-person levels over 3 years.

**What helps:** Aggressive notification batching or suppression by default; blocking of attention-capturing design patterns (autoplay, infinite scroll, overlay ads) — the "Purpose Mode" study (hanklee.com) found this reduced daily social media time by 21 minutes on average; reader mode stripping visual noise.

### 2.5 Hyperfocus: The Productive Trap

Hyperfocus — extended deep focus states in ADHD that are difficult to interrupt — is real but often misunderstood. A Springer Current Psychology (2023) study found hyperfocus linked to affective dysregulation: it is not simply "good ADHD attention" but often occurs in emotionally engaging (including anxiety-driven) contexts.

Critically for browser design, a UBC CHI 2026 study found that some neurodivergent users "described entering rare and hard-won states of hyperfocus that can take longer than the commonly assumed 25-minute focus block to reach." Timer-based focus tools that interrupt hyperfocus states actively harm these users.

Frontiers Psychiatry (2023) found hyperfocus mediates the internet addiction pathway: hyperfocus on web content increases time-on-site and IA risk. The same mechanism that enables productive deep work can enable deep distraction.

**What helps:** Focus sessions with user-controlled duration (not timer-mandated); tools that track when hyperfocus begins (via idle/activity sensing) and can gently surface it to the user without interrupting; ability to "lock in" to a task context with ambient reminder when drift occurs.

---

## 3. Digital Accommodations That Have Evidence

### 3.1 What Works: Evidence-Grounded

**Reader/Focus Mode:**
CHI 2019 Microsoft Research study (Firefox Reader View) established that reader mode significantly reduces visual complexity and improves reading speed. BOIA accessibility documentation confirms reader mode benefits ADHD and dyslexia users specifically by removing ads, sidebars, and formatting noise. The Firefox implementation allows customization of font, weight, size, spacing, line height, and background color.

**Distraction Blocking (with important caveats):**
UbiComp 2017 field study (Mark et al., N=32 information workers): website blockers significantly increased focus and productivity over a 5-day baseline period. A 1-month mobile internet RCT found blocking improved sustained attention and mental health.

*Caveat:* These studies used general populations. The UBC CHI 2026 study found that for neurodivergent users specifically, inflexible blockers caused shame and counterproductive responses. The design of blocking matters: task-conditioned blocking ("until I complete X") outperforms timer-conditioned blocking ("for 25 minutes").

**Task-to-Context Linking:**
FocusUp (W4A 2025): task list tied to website context + reading progress tracking. Early user study results described as "promising and effective." Addresses the task initiation gap by externalizing current task directly within browser context.

**Attention Estimation from Passive Data:**
Focus Bear / RMIT proof-of-concept (Nagel et al., 2025, N=6): ML on tab-switching frequency, idle time, and task-relevance (via GPT URL analysis) achieved R²=0.77 predicting attention in simulated sessions. Authors note validation with clinical ADHD population required; next phase: N=100 university students including ADHD screening. Early evidence that passive behavioral sensing can support real-time attention scaffolding without intrusive hardware.

**Cognitive Accessibility Features (WCAG/COGA):**
W3C COGA Design Guide provides actionable patterns for ADHD-relevant design: predictable hierarchy, consistent visual design, clear step-by-step flow, minimal extraneous information, error recovery without penalty. PLOS ONE 2025 psychophysiology study (eye-tracking) showed cognitive accessibility features improve cognitive engagement even in users without disabilities — making these universal design wins.

**Body Doubling (Digital):**
ACM TACCESS 2024 survey (N=220 neurodivergent): body doubling (using social presence to start/stay on tasks) is widely used, can be remote/recorded/live. A FLOWN/Neurodiversity in Business industry survey (N=117 adults with ADHD) reported over 2x increase in sustained focus with virtual body doubling and faster task re-engagement. Note: industry survey, not RCT — confidence medium; trend is consistent across multiple community reports and NPR coverage. AI-simulated body doubling (Malmö University, 2024) showed chatbot-based body doubling supports task initiation, particularly for users with limited access to real-time partners.

### 3.2 What Is Untested or Overstated

- **AI browser assistants** (Chrome's built-in AI, Arc's AI features): No published RCT or controlled study specifically measuring ADHD outcomes. Inference only — potential for help (externalized planning, summary) and harm (new notification surface, novelty-seeking triggers).
- **Gamified productivity apps**: Evidence is mixed. Small-scale studies show engagement improvements; systematic review (MDPI Information, 2025) documents an "Engagement–Efficacy–Ethics Trilemma" — gamification increases engagement metrics but can harm clinical outcomes and ethics.
- **Pomodoro-style timers**: No ADHD-specific RCT. UBC 2026 study found they stress users with anxiety and interrupt hyperfocus states. Not recommended as a browser-native feature without user control over timing and framing.

---

## 4. Shame vs. Support in Productivity Tooling

### 4.1 The Shame Architecture of Current Tools

The dominant design paradigm in focus/productivity software relies on what the UBC researchers call a "compliance machine" architecture: streaks that reset to zero, red badges, "accountability" features that alert others to failure, avatar death mechanics, and timer-based failure signals.

The UBC CHI 2026 study (N=27 neurodivergent students, doi:10.1145/3772318.3790801) found:
1. Timer-based designs assume "one right way to focus" incompatible with ADHD variability
2. Some users felt shame about how little focused time they could sustain in apps like Forest — "a shameful point of comparison"
3. Users worried about becoming dependent ("a crutch"), reinforcing inadequacy feelings
4. "Digital stimming" — briefly visiting familiar, predictable digital content to manage cognitive overload and ease task transitions — was blocked by current tools, forcing users to either violate their own rules or skip the self-regulation strategy that works for them

Mad In America (2026) commentary on habit-tracking apps articulates the structural problem: these tools "enforce the disease model" — they assume non-compliance is the problem and surveillance/punishment is the solution.

### 4.2 Self-Determination Theory as Design Framework

Self-Determination Theory (Deci & Ryan) posits three universal psychological needs: autonomy (self-direction), competence (efficacy), and relatedness (connection). ADHD research links need frustration to psychopathology; conversely, need satisfaction supports motivation and self-regulation.

The JMIR Formative 2025 ADAPT framework RCT feasibility (Champ et al., n=23 adults with ADHD) tested an SDT-based, neuroaffirmative therapeutic coaching intervention. Key results:
- Significant improvement in psychological distress subscales (problems p=.01, functions p=.02, well-being p=.03)
- Significant improvement in ADHD symptom severity, particularly inattention (p≤.01)
- 90% found intervention "useful" or "helpful"
- Importantly: these improvements occurred without targeting symptoms directly — by supporting psychological need satisfaction
- Qualitative theme: "Change in Perspective" — participants stopped framing ADHD as personal failure and began understanding it as neurobiological difference

**Design translation:** Software that supports autonomy (user controls all timing and rules), competence (celebrates incremental progress, avoids failure messaging), and relatedness (body doubling, community-facing focus features) will produce better outcomes than software built on compliance enforcement.

### 4.3 "Digital Stimming" as a Design Gap

The UBC study introduced the concept of "digital stimming" — borrowing from the stimming behavior familiar in autism/ADHD communities (repetitive, soothing behaviors for self-regulation). Users would briefly check a familiar YouTube clip or scroll a predictable social feed to settle their cognitive state before entering a hard task.

Current blocker tools have no affordance for this. You either block everything or block nothing. The researchers proposed "curated digital stimming" as a design pattern: a bounded, time-limited window of familiar/soothing content that helps users transition into work without falling into doomscrolling. This is a novel browser design primitive with no current implementation.

### 4.4 The Language of Scaffolds vs. Crutches

A recurring theme in both clinical and community ADHD literature is the shame attached to needing external tools. Users ask "do I have to use these apps for the rest of my life?" — framing accommodation as weakness.

The SDT literature is clear: reframing externalized EF support as "scaffolding" (temporary structure that builds toward independence and self-understanding) rather than "crutches" (permanent compensations for deficiency) changes the psychological outcome. The UBC study's third recommendation was to use "affirming language that normalizes fluctuating focus" — building self-acceptance rather than shame.

---

## 5. What an Attention-Protecting Browser Should Do

The following recommendations synthesize the clinical, HCI, and design evidence. They are organized by mechanism.

### 5.1 Externalize Working Memory (Never Require It)

- **Visual branching history** (Horse Browser Trails approach): every navigation decision is shown spatially, not buried in chronological history. Users should not need to hold browser state in their heads.
- **Tab groups with semantic labels** automatically suggested from page content, not manually assigned.
- **"Where was I?" recall** at session start: surface the last 3–5 context states with brief page summaries. Zero WM required to re-orient.
- **Bookmarks as active outbox** not archive: a "to process" bookmark queue that surfaces contextually, not as a dead drop.

### 5.2 Support Task Initiation

- **Intent declaration** at session start: a low-friction prompt ("What are you working on?") that primes the user and provides a context anchor for all subsequent session behavior.
- **Task-to-URL linking** (FocusUp pattern): current task visible persistently in browser chrome; only tasks relevant to current site shown.
- **Ambient presence** ("body doubling mode"): optional focus session companion signal — not intrusive audio, but a persistent visual/motion signal that "someone is here with you."
- **Soft, non-alarming nudges** when drift is detected from declared intent: tab-switching frequency, idle time, URL divergence from declared task. The arXiv 2025 framework demonstrated ML viability (R²=0.77 in proof-of-concept).

### 5.3 Provide Temporal Anchoring

- **Time elapsed since session start**, visible but ambient (not prominent — prominence triggers anxiety).
- **Time on current site** display: prevents the "rabbit hole without a clock" problem.
- **Task-conditioned session end** ("until I complete X") as primary mode; timer-based sessions as secondary option with user control over framing.
- **End-of-session summary**: where did time go, what was completed — not a "you failed" report, but a neutral map of the session.

### 5.4 Reduce Perceptual/Cognitive Load

- **Aggressive reader mode** as default-opt-in: strip ads, autoplay, overlay prompts, infinite scroll, sidebars. COGA guidelines + CHI reader view study both support this.
- **Notification batching/suppression**: zero interruptions during declared task sessions. All notifications delivered in a batched digest at session boundaries.
- **Anti-attention-capture mode** (Purpose Mode pattern): disable autoplay, hide recommendation carousels, block push notification permission dialogs.
- **Typography controls**: font size, weight, line height, color, contrast — all shown to meaningfully affect reading speed and cognitive load for ADHD readers (CHI 2026 pupillometry study).

### 5.5 Support Hyperfocus Without Punishing It

- **Session duration controlled entirely by the user.** No forced breaks, no expiration timers.
- **Hyperfocus detection** (extended single-tab high-engagement sessions): offer an optional, deferrable "check-in" ("You've been in deep work for 2 hours — do you want to stretch, or keep going?"). Zero penalty for declining.
- **"Curated digital stimming" window**: a user-configured, bounded micro-break surface — familiar content, time-limited, not a new infinite scroll risk. Novel browser design primitive.

### 5.6 Never Shame; Always Scaffold

- **No streaks, no failure states, no "you missed your goal" messaging.**
- **Framing**: "here's a map of your session" not "here's your productivity score." 
- **Failure-tolerant design**: if a user ends a session early or deviates from intent, this is information — show it neutrally, not punitively.
- **User sovereignty over all sensing**: all attention-tracking data stays on-device, user can delete at any time, sensing can be paused or disabled. Privacy as a functional requirement, not a feature. The arXiv 2025 framework found 77% of ADHD professionals rate privacy as "very important" or "mandatory."
- **Language audit**: every string visible to the user should be reviewed against SDT principles. Autonomy-supportive language ("you decide," "here's what happened," "want to continue?") vs. controlling language ("you should," "you failed," "try harder").

---

## 6. Open Questions and Gaps

1. **RCT evidence is thin for browser-specific interventions.** The most relevant studies (UbiComp 2017 blocking, Focus Bear proof-of-concept 2025) have small samples, general populations, or simulated data. No large-sample ADHD-specific RCT of any specific browser feature has been conducted.

2. **Heterogeneity challenge.** ADHD is not a unitary condition. AuDHD users, inattentive-only users, users with anxiety comorbidity, users on medication vs. not — all may respond differently to the same browser affordances. The research base is largely non-ADHD-specific or child/adolescent focused.

3. **"Digital stimming" as a design primitive.** The UBC study describes this as a gap but provides no implementation. What content categories constitute appropriate digital stimming? How is the time boundary enforced without creating a new shame trigger? How does the system distinguish productive hyperfocus from spiral?

4. **AI browser features and ADHD.** No ADHD-specific RCT or empirical study of any AI browser assistant's effect on EF challenges has been published. The arXiv 2025 HITL framework and the FocusUp work are early-stage; AI-powered contextual assistance could help or harm depending on implementation.

5. **Privacy architecture for behavioral sensing.** The arXiv 2025 framework advocates on-device ML; the proof-of-concept study used cloud-based GPT for task-relevance scoring. These are in tension. A production attention-protecting browser needs a clear answer on sensing architecture.

6. **Body doubling at scale.** The FLOWN survey and ACM TACCESS survey establish community adoption; no RCT has been conducted on digital body doubling as a standalone browser-integrated feature.

---

## Sources

*(Full citations added in citation pass)*

1. CDC MMWR (2024) — ADHD prevalence in U.S. adults
2. Molecular Psychiatry (2025) — global adult ADHD prevalence meta-analysis
3. Frontiers Psychiatry (2023) — arousal dysregulation and EF in ADHD
4. Nature (2023) — task initiation deficit in ADHD
5. Neurosci Biobehav Rev (2024) — stimulant pharmacodynamics
6. IJERPH (2023) — time perception in adult ADHD review
7. PMC (2019) — clinical implications of time perception in ADHD
8. arXiv 2507.06864 (2025) — neurodivergent-aware productivity framework
9. Focus Bear/RMIT proof-of-concept (Nagel et al., 2025)
10. MDPI Education Sciences (2024) — cognitive load in ND online learners
11. CHI 2023 — When Browsing Gets Cluttered
12. ABCT 2024 — ADHD and digital hoarding
13. UIST 2021 — Tabs.do task-centric tab management
14. Springer Current Psychology (2023) — hyperfocus and ADHD
15. PLOS ONE (2023) — distractibility d-factor and hyperfocus
16. Frontiers Psychiatry (2023) — hyperfocus and internet addiction
17. PLOS ONE (2024) — lived experience of RSD in ADHD
18. Cleveland Clinic — RSD clinical summary
19. J Psychiatric Research (2023) — PIU and ADHD meta-analysis
20. PMC (2024) — inhibitory control moderating IA and inattention
21. BJPsych — genes and screens: ADHD in the digital age
22. BMC Psychiatry (2025) — systematic review of reviews of digital interventions
23. J Affective Disorders (2024) — meta-analysis of digital interventions for ADHD
24. W3C COGA Design Guide — Making Content Usable for People with Cognitive and Learning Disabilities
25. WCAG 2.2
26. Section508.gov — designing for cognitive disabilities
27. CHI 2026 (ACM) — typography and ADHD reading
28. INTERACT 2025 — inclusive web design guidelines for ADHD
29. IUI 2024 — ADHD users and recommender systems
30. CHI 2019 (Microsoft Research) — reader view impact on reading speed
31. BOIA — reader mode and accessibility
32. Firefox Reader View documentation
33. Mark et al. UbiComp 2017 — blocking distractions affects focus
34. Mobile internet blocking RCT (Semantic Scholar)
35. Purpose Mode study (hanklee.com)
36. PLOS ONE (2025) — cognitive accessibility and psychophysiology
37. FocusUp (W4A 2025, KIT)
38. UBC CHI 2026 study — focus apps failing neurodivergent minds
39. Mad In America (2026) — compliance machine
40. MDPI Information (2025) — gamification ethics trilemma
41. JMIR Formative (2025) — ADAPT SDT framework RCT
42. SAGE (2021) — SDT and motivation in ADHD
43. ACM TACCESS (2024) — body doubling with neurodivergent participants
44. FLOWN/Neurodiversity in Business (2025) — virtual body doubling survey
45. NPR (2024) — body doubling coverage
46. Neurodivergent Browsing Assistant (Misha Labs)
47. Horse Browser ADHD pages
48. Nami AI, EveryMango, MindFrame iO (product sites)
49. Cambridge Core (2025) — work performance challenges for adults with ADHD
