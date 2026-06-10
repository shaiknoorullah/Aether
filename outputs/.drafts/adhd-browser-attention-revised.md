# ADHD, Neurodivergence, and the Web Browser (2026)
## Executive-Function Challenges, Digital Accommodations, Shame vs. Support, and the Attention-Protecting Browser

**Research Brief | Aether Browser Project | June 2026**

> **Methodology note:** Evidence was gathered via direct search (web + academic databases). Sources marked `[PDF]` were accessed via search-result metadata only — full text was not fetched. Sources marked `[preprint]` have not undergone peer review. The UBC CHI 2026 study (doi:10.1145/3772318.3790801) was accessed via a UBC news release authored by the study's researchers; the full CHI paper was not fetched.

---

## Executive Summary

Approximately 15.5 million U.S. adults carry an ADHD diagnosis [1], with global working-age prevalence estimated at 4–5% [2]. This population interacts with the web browser through a neurobiological lens that mainstream browser design has never accounted for: impaired working memory, time blindness, deficits in task initiation, impulse-driven tab proliferation, and hyperfocus states that refuse a 25-minute timer. The result is not a failure of willpower — it is a structural mismatch between 35-year-old browser design and a nervous system that requires externalized scaffolding [3].

The research evidence across clinical neuroscience, HCI, and design practice converges on five actionable conclusions:

1. **ADHD executive-function deficits are not generic inattention.** Four distinct mechanisms — time blindness, task initiation failure, working memory compression, and impulse-control under novelty — each demand specific browser-side countermeasures [4][5][6].
2. **Tab overload is a working-memory externalization problem, not a discipline problem.** Survey evidence shows 37%+ of adults with ADHD have 21+ tabs open at once; 80%+ bookmark content they never return to [7, preprint].
3. **Existing focus tools cause measurable shame in neurodivergent users.** A 2026 CHI study found that timer-based blockers caused shame and feelings of inadequacy in 27 neurodivergent students [8].
4. **Effective scaffolding is behaviorally-responsive, autonomy-preserving, and non-punitive.** SDT-based interventions, adaptive nudging, and body doubling outperform rigid timer/gamification approaches [9][10].
5. **An attention-protecting browser should externalize executive function, not restrict behavior.** The emerging design paradigm replaces restriction with visible structure, ambient presence, and scaffolded task entry [3][11][12].

---

## 1. Clinical Background: What ADHD Is and Is Not

### 1.1 Prevalence and Heterogeneity

ADHD is classified in the DSM-5-TR and ICD-11 as a neurodevelopmental condition. A 2023 MMWR CDC survey found 15.5 million U.S. adults currently diagnosed, with about half having accessed telehealth for ADHD services [1]. Global clinical-setting prevalence for adults is estimated at 21.4% (95% CI 20–23%) in a 2025 Molecular Psychiatry meta-analysis (N=43,311 adult participants) [13]. Working-age digital-environment estimates suggest 4–5% of the global adult population is affected [2].

The condition presents in three subtypes: inattentive, hyperactive-impulsive, and combined. Comorbidity is the rule: anxiety, depression, autism spectrum, and learning disabilities co-occur at rates of 50–70% [9]. This heterogeneity is critical for browser design: a feature effective for pure inattention ADHD may be counterproductive for AuDHD (autism + ADHD) users or those with comorbid anxiety.

### 1.2 The Executive Function Deficit Model (and Its Limits)

The dominant theoretical framework — Barkley's EF deficit model — posits that ADHD involves reduced executive control associated with dopamine-signaling deficits in the PFC, basal ganglia, thalamus, and amygdala circuits [4]. Stimulant medication modulates dopamine and norepinephrine, enhancing task-related brain networks and suppressing the default-mode network [15].

However, as a 2025 JMIR randomized feasibility study documents, no single EF deficit has been identified as sufficient to cause ADHD; neuroimaging data remain correlational [9]. A growing body of research advocates for neuroaffirmative, SDT-based framing: ADHD behaviors as neurobiologically altered approaches to task engagement, not deficits to be corrected [9][52].

**Design implication:** Tools built on the deficit model face an inherent contradiction — they demand effortful coping from a nervous system structurally challenged at allocating cognitive effort [9].

### 1.3 Rejection Sensitivity Dysphoria (RSD)

A clinically relevant but under-researched aspect of ADHD in digital contexts is rejection sensitivity dysphoria (RSD): intense emotional pain triggered by perceived rejection or criticism. RSD is not a formal DSM diagnosis, but a well-documented manifestation of emotional dysregulation in adult ADHD [57][58]. A 2024 PLOS ONE qualitative study documented the lived experience of rejection sensitivity in ADHD, finding it shapes self-regulation and social behavior significantly [56].

In browser/productivity software contexts: punitive UI language ("you failed your goal," "streak broken," "you've been unproductive") can trigger RSD responses disproportionate to the event. Error messaging, failure states, and public accountability features are high-risk surfaces. Supporting evidence is currently qualitative and clinical — no controlled browser-specific study has been conducted — but the clinical finding warrants conservative, affirming defaults in all user-facing language.

---

## 2. Executive-Function Challenges in the Browser

### 2.1 Task Initiation: The Hardest Button

Task initiation is not laziness. A 2023 Translational Psychiatry paper found that ADHD involves a specific deficit in value-estimation for initiatory (first-stage) actions — the brain fails to adequately weight the expected reward of beginning a task, not just completing it [6 — PDF metadata only]. In browser contexts: navigating to the right page and beginning work is where initiation failure strikes most. The blank search bar, the empty document, the first moment of a research session — these are high-friction points where ADHD users are most likely to task-hop to lower-demand, higher-novelty content [7 — preprint, n=25].

A 2025 arXiv preprint (n=25 ADHD professionals) reported that more than 70% were "constantly or frequently pulled away from high-priority tasks owing to distractions or lower-priority work" [7 — preprint].

**What helps:** Externalized task lists tied to current website context; reading progress indicators; gentle presence cues. FocusUp (KIT, W4A 2025) implemented task-to-URL linking and reading progress bars specifically to address task initiation gaps [11].

### 2.2 Working Memory Compression and Tab Hoarding

Working memory impairment is one of the most consistent cognitive findings in ADHD [4]. In digital environments, tabs function as externalized WM: each open tab is a thought the user fears losing. A 2025 arXiv preprint (n=25 ADHD professionals; note: not peer-reviewed, small sample) found [7 — preprint]:
- 37% report 21+ browser tabs open at any given time
- 22% report 12–20 tabs open; 20% "do not track" their tab usage
- 80%+ bookmark content intending to return but never do

A 2023 CHI study ("When Browsing Gets Cluttered") found that half of general users perceive tab overload as a problem — for ADHD users, this pressure is neurologically amplified [17]. An ABCT 2024 conference abstract documented ADHD symptoms associated with digital hoarding in college students as a distinct clinical pattern [18]. A 2024 survey of N=231 neurodivergent students found they experience significantly higher perceived extraneous cognitive load in online learning than neurotypical peers [19].

A 2025 Focus Bear/RMIT proof-of-concept (Nagel et al., n=6 research-team participants in simulated sessions — not yet validated with clinical ADHD population) found that ML on tab-switching frequency, idle time, and task-relevance (GPT URL analysis) achieved R²=0.77 predicting attention states. Authors explicitly note clinical validation is required [21].

**What helps:** Tree-structured or visual browsing history (Horse Browser "Trails" [3]); task-centric tab grouping (Tabs.do UIST 2021 [20]); "where was I?" context recall aids.

### 2.3 Time Blindness: Digital Environments as Time Voids

Time blindness — a documented deficit in temporal processing — means ADHD users lose track of how long they have been on a webpage or that a deadline is approaching. A 2023 IJERPH review of a decade of adult ADHD time perception research confirmed that time estimation, reproduction, production, and duration discrimination are all impaired domains [22]. Scalar expectancy theory work (Barkley et al., 1997, replicated in multiple subsequent studies) suggests an "abnormally fast internal counting process" in ADHD brains [23].

In browser contexts: the internet is a context-free time void — no natural session boundaries, no ambient clock. A user intending to spend 5 minutes on a task may surface 90 minutes later with no subjective sense of elapsed time.

**What helps:** Ambient, non-alarming elapsed time display; task-conditioned session end ("until I complete X") as primary mode; neutral end-of-session time map.

### 2.4 Impulse Control: The Notification Trap

Inhibitory control deficits interact with digital design in compounding ways. A 2023 J Psychiatric Research meta-analysis (N=18,859) confirmed significant correlations between problematic internet use and both inattention and hyperactivity-impulsivity [24]. A 2024 inhibitory control study found that as EF impairment increases, inattention more strongly predicts internet addiction — IC moderates the relationship [25]. A Scientific Reports (2023) longitudinal study found social media use predicts ADHD symptoms via impulsivity at between-person and within-person levels over 3 years [26].

The British Journal of Psychiatry review ("Genes and Screens") noted that heavy media multitasking harms working memory and task-switching for ADHD brains [27].

**What helps:** Notification batching/suppression during declared task sessions; removal of attention-capturing design patterns (ACDPs) — a browser extension study found this reduced daily social media time by 21 minutes on average [28, PDF]; reader mode stripping visual noise.

### 2.5 Hyperfocus: The Productive Trap

Hyperfocus is real but complex. A Springer Current Psychology (2023) study found hyperfocus linked to affective dysregulation — it is not simply "good ADHD attention" but often occurs in emotionally engaging or anxiety-driven contexts [29]. A PLOS ONE (2023) study of N=1,220 adults found that ADHD distractibility includes external distraction, intrusive thoughts, and mind-wandering as three distinct factors, with hyperfocus as a separate dimension [30].

Critically for browser design, the UBC CHI 2026 study found that neurodivergent users "described entering rare and hard-won states of hyperfocus that can take longer than the commonly assumed 25-minute focus block to reach" [8]. Timer-based focus tools that interrupt these states actively harm users. Frontiers Psychiatry (2023) also found hyperfocus mediates the internet addiction pathway — the same mechanism enabling productive deep work can enable deep distraction [31].

**What helps:** User-controlled session duration; hyperfocus detection via passive behavioral sensing; gentle, deferrable check-ins with zero penalty for declining.

---

## 3. Digital Accommodations That Have Evidence

### 3.1 What Works: Evidence-Grounded

**Reader / Focus Mode**
CHI 2019 Microsoft Research study established that reader mode significantly reduces visual complexity and improves reading speed [32]. BOIA accessibility documentation confirms reader mode benefits ADHD and dyslexia users by removing ads, sidebars, and formatting noise [33]. Firefox Reader View allows customization of font, weight, size, spacing, line height, and background color [34].

**Distraction Blocking (with important caveats)**
UbiComp 2017 field study (Mark et al., N=32 information workers, 5+5 day design) found website blockers significantly increased focus and productivity vs. baseline [35, PDF]. A 1-month mobile internet blocking RCT improved sustained attention, mental health, and subjective well-being [36, PDF].

*Critical caveat:* The UBC CHI 2026 study (N=27 neurodivergent students) found that for neurodivergent users specifically, inflexible timer-based blockers caused shame and counterproductive responses [8]. Task-conditioned blocking ("until I complete X") is strongly preferred over timer-conditioned blocking. Curated digital stimming windows — not available in any current tool — were identified as a design need [8].

**Task-to-Context Linking**
FocusUp (W4A 2025, KIT): task list tied to website context + reading progress tracking. Early user study findings described as "promising and effective" at enhancing focus, task execution, and web-based productivity [11].

**Attention Estimation from Passive Data**
Focus Bear / RMIT proof-of-concept (Nagel et al., 2025, n=6, simulated sessions): ML on tab-switching, idle time, task-relevance achieved R²=0.77 predicting attention states. Clinical validation with ADHD population is explicitly noted as required by the authors [21].

**Cognitive Accessibility Features (COGA / WCAG)**
W3C COGA Design Guide provides actionable patterns: predictable hierarchy, consistent visual design, minimal extraneous information, error recovery without penalty [37]. WCAG 2.2 includes cognitive accessibility provisions but is acknowledged as insufficient for ADHD alone [38]. A 2025 PLOS ONE psychophysiology study showed cognitive accessibility features improve cognitive engagement even for users without disabilities [39].

**Body Doubling (Digital)**
ACM TACCESS 2024 survey (N=220 neurodivergent people): body doubling is widely used, can be remote, recorded, or live [40]. A FLOWN industry survey (N=117 adults with ADHD) reported over 2x increase in sustained focus — *note: this is a self-report industry survey from a commercial body doubling service, not a peer-reviewed RCT; confidence medium* [41]. The trend is consistent with community reports [42] and an AI body doubling chatbot study at Malmö University (2024) [7]. No RCT on digital body doubling as a browser-native feature has been conducted.

**Typography and Visual Design**
CHI 2026 eye-tracking/pupillometry study found ADHD status has a "large effect size" on reading speed, and font and font size significantly affect reading performance for ADHD readers [43]. Typography settings are first-class accessibility controls, not buried preferences.

### 3.2 What Is Untested or Overstated

- **AI browser assistants:** No published RCT measuring ADHD outcomes for any AI browser feature as of June 2026. Benefits and risks unquantified.
- **Gamified productivity apps:** A 2025 systematic review documents an "Engagement–Efficacy–Ethics Trilemma" — gamification increases engagement metrics but can harm clinical outcomes [44]. Forest app specifically found to cause shame in neurodivergent users [8].
- **Pomodoro timers:** No ADHD-specific RCT. UBC 2026 study found timers stress users with anxiety and interrupt hyperfocus states [8]. Not recommended as a default browser feature.

---

## 4. Shame vs. Support in Productivity Tooling

### 4.1 The Shame Architecture of Current Tools

The dominant design paradigm in focus/productivity software relies on a compliance architecture: streaks that reset to zero, red badges, "accountability" surveillance, timer-based failure signals.

The UBC CHI 2026 study (N=27, doi:10.1145/3772318.3790801; accessed via UBC news release authored by study researchers) found [8]:
1. Timer-based designs assume "one right way to focus" incompatible with ADHD variability
2. Users felt shame about how little focused time they could sustain ("a shameful point of comparison" about Forest's focus duration metric)
3. Users worried about becoming "dependent" on blockers, reinforcing inadequacy
4. "Digital stimming" — briefly visiting familiar content to manage cognitive load before entering a hard task — was blocked by current tools, forcing users to skip a working self-regulation strategy

Mad In America (2026) commentary argues habit-tracking apps "enforce the disease model" [45]. This is consistent with, but not itself evidence for, the UBC peer-reviewed findings.

### 4.2 Self-Determination Theory as Design Framework

Self-Determination Theory posits three universal psychological needs: autonomy, competence, and relatedness. ADHD research links need frustration to psychopathology [46].

The JMIR Formative 2025 ADAPT framework (Champ et al., n=23 adults with ADHD, RCT feasibility design — small sample, first published RCT of this framework) tested an SDT-based neuroaffirmative coaching intervention. Key results [9]:
- Significant improvement in psychological distress: problems (p=.01), functions (p=.02), well-being (p=.03)
- Significant improvement in ADHD symptom severity, particularly inattention (p≤.01)
- 90% found intervention "useful" or "helpful"
- Improvements occurred without targeting symptoms directly — via psychological need satisfaction alone
- Qualitative theme: participants shifted from framing ADHD as personal failure to neurobiological difference

**Design translation:** Software supporting autonomy (user controls all rules), competence (celebrates progress, avoids failure states), and relatedness (body doubling, ambient co-working) will likely produce better outcomes than compliance-enforcement designs. *Inference from SDT literature + UBC findings; no direct RCT of this principle applied to browsers exists yet.*

### 4.3 "Digital Stimming" as a Novel Design Gap

The UBC study introduced "digital stimming" — using familiar, predictable digital content to settle cognitive state before entering a hard task [8]. This is a documented self-regulation strategy that current blocker tools actively prevent. The researchers proposed "curated digital stimming" as a design pattern: a bounded, time-limited window of soothing content that helps users transition into work without falling into doomscrolling.

This is a novel browser design primitive with no current implementation. It represents an immediate design opportunity.

### 4.4 Privacy as Psychological Safety

Behavioral sensing (tab-switching, idle time, attention estimation) is foundational to adaptive ADHD support — but ADHD users face heightened vulnerability to surveillance. The arXiv 2025 preprint survey (n=25, not peer-reviewed) found 77% of ADHD professionals rate privacy as "very important" or "mandatory" [7 — preprint]. All behavioral data must remain on-device; users must have full control to pause, modify, or delete sensing at any time.

---

## 5. What an Attention-Protecting Browser Should Do

*These recommendations are grounded in the evidence above. Where evidence is pre-clinical or inference-based, this is noted.*

**Heterogeneity caveat:** Features should be opt-in or user-configurable wherever possible. ADHD is not a unitary condition — inattentive users, hyperfocusing users, AuDHD users, and anxiety-comorbid users may respond differently to the same affordance. A browser should expose tools, not impose a workflow.

### 5.1 Externalize Working Memory

- **Visual/spatial browsing history** — navigation shown as branching map, not flat tab bar. (Inspired by Horse Browser Trails [3]; HCI motivation from tab overload research [17][20])
- **Semantic tab groups** automatically suggested from page content.
- **"Where was I?" context recall** at session start: last 3–5 context states with brief summaries.
- **Bookmarks as active "to-process" queue**, not archive: contextually surfaced, not dead-drop.

### 5.2 Support Task Initiation

- **Intent declaration at session start**: low-friction "What are you working on?" prompt anchoring all subsequent session behavior.
- **Task-to-URL context linking** (FocusUp pattern [11]): current task visible in browser chrome; only context-relevant tasks shown per site.
- **Ambient presence / body doubling mode**: optional focus-session companion signal — persistent visual/motion indicator, not intrusive audio. (Community-supported, pre-clinical evidence [40][41])
- **Soft intent-drift nudges**: when tab-switching frequency, idle time, or URL divergence from declared task exceeds threshold, surface a gentle (deferrable, non-alarming) reminder. ML viability established at proof-of-concept level [21].

### 5.3 Temporal Anchoring

- **Ambient elapsed time** display: visible but not prominent (prominence triggers anxiety in comorbid users).
- **Time-on-current-site** indicator: prevents the rabbit-hole-without-a-clock problem.
- **Task-conditioned session end** as primary mode; timer-based as secondary opt-in.
- **Neutral end-of-session map**: where time went, not a performance score.

### 5.4 Reduce Perceptual and Cognitive Load

- **Aggressive reader mode** as opt-in default: strip ads, autoplay, overlays, infinite scroll, sidebars. (Evidence: CHI 2019 [32]; BOIA [33]; PLOS ONE psychophysiology 2025 [39])
- **Notification batching**: all interruptions deferred to session boundaries. (Consistent with COGA guidance [37])
- **Anti-attention-capture mode**: disable autoplay, recommendation carousels, push-notification permission dialogs. (Purpose Mode study [28, PDF])
- **Typography controls as first-class UI**: font, size, weight, line height, contrast. (CHI 2026 evidence [43])

### 5.5 Support Hyperfocus Without Punishing It

- **User-controlled session duration.** No forced breaks, no expiration timers [8].
- **Hyperfocus detection**: gentle, deferrable check-in after extended high-engagement sessions. Zero penalty for declining.
- **Curated digital stimming window** (novel primitive, UBC 2026 [8]): user-configured bounded micro-break surface of soothing, familiar content. Time-limited. Not an infinite-scroll risk. Requires careful design; no implementation exists yet.

### 5.6 Never Shame; Always Scaffold

- **No streaks, no failure states, no "you missed your goal" messaging.** (UBC 2026 [8]; gamification trilemma [44])
- **Framing**: neutral map of session, not productivity score.
- **Failure-tolerant design**: session deviation is information, shown neutrally.
- **User sovereignty over all sensing**: on-device ML, user-deletable data, pauseable sensing. (arXiv 2025 [7 — preprint]; JMIR ADAPT [9])
- **Language audit**: all UI strings reviewed against SDT autonomy-supportive principles. Avoid controlling language ("you should," "you failed," "try harder") [9][46].

---

## 6. Open Questions and Gaps

1. **RCT evidence is thin for browser-specific interventions.** No large-sample ADHD-specific RCT of any browser feature has been published. The best available evidence (UbiComp 2017, Focus Bear 2025) uses general populations or simulated samples.

2. **Heterogeneity.** AuDHD users, anxiety-comorbid users, and medication status may respond differently to the same affordances. Most published research is pediatric or general-population; adult ADHD browser-specific studies are sparse.

3. **"Digital stimming" implementation.** UBC 2026 identifies the gap but provides no implementation. What content categories qualify? How is the time boundary enforced without shame? How does the system distinguish productive hyperfocus from spiral?

4. **AI browser features and ADHD.** No ADHD-specific empirical study of any AI browser assistant's EF impact has been published. arXiv 2025 and FocusUp are early-stage; benefits and harms unquantified.

5. **Privacy architecture for behavioral sensing.** arXiv 2025 advocates on-device ML; Focus Bear proof-of-concept used cloud-based GPT for task-relevance scoring. A production attention-protecting browser needs a resolved, auditable architecture.

6. **Body doubling RCT.** Community adoption established [40]; no controlled study of browser-native digital body doubling exists.

---

## Sources

[1] CDC MMWR (2024): ADHD Diagnosis, Treatment, and Telehealth Use in Adults.
https://www.cdc.gov/mmwr/volumes/73/wr/mm7340a1.htm

[2] NIMH global estimate, cited in [7].
https://www.nimh.nih.gov/health/statistics/attention-deficit-hyperactivity-disorder-adhd

[3] Horse Browser ADHD page (2026).
https://browser.horse/adhd

[4] Frontiers Psychiatry (2023): Arousal dysregulation and executive dysfunction in ADHD.
https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2023.1336040/full

[5] IJERPH (2023): Time Perception in Adult ADHD: Findings from a Decade.
https://www.mdpi.com/1660-4601/20/4/3098

[6] Translational Psychiatry (2023): Task initiation deficit in ADHD.
https://www.nature.com/articles/s41398-023-02717-7 [PDF — not full-text verified]

[7] arXiv 2507.06864 (2025, preprint): Toward Neurodivergent-Aware Productivity: A Systems and AI-Based Human-in-the-Loop Framework for ADHD-Affected Professionals.
https://arxiv.org/html/2507.06864

[8] Chow, Hariadi, McGrenere (UBC, CHI 2026): Focus apps are failing neurodivergent minds. CHI doi:10.1145/3772318.3790801. Accessed via UBC news release co-authored by researchers.
https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/

[9] Champ et al. (JMIR Formative Research, Oct 2025): A Neuroaffirmative, Self-Determination Theory–Based Psychosocial Intervention for Adults With ADHD: Randomized Feasibility Study. doi:10.2196/69943.
https://formative.jmir.org/2025/1/e69943

[10] ACM TACCESS (2024): Body doubling with neurodivergent participants.
https://dl.acm.org/doi/full/10.1145/3689648

[11] FocusUp (W4A 2025, KIT): Aljedaani, Leonard, Ruiz, Wegener. ACM doi:10.1145/3744257.3744278.
https://publikationen.bibliothek.kit.edu/1000185883/168296537

[12] Neurodivergent Browsing Assistant (Misha Labs).
https://browse.mishalabs.com/

[13] Molecular Psychiatry (2025): ADHD/HD prevalence meta-analysis. N=43,311 adults.
https://www.nature.com/articles/s41380-025-03178-8

[14] JMIR Formative [9] — 58.4% comorbidity in NHS Adult ADHD Clinic sample.

[15] Neuroscience & Biobehavioral Reviews (2024): From neurons to brain networks, pharmacodynamics of stimulant medication for ADHD.
https://www.sciencedirect.com/science/article/pii/S0149763424003105

[16] Same as [6].

[17] CHI 2023: When Browsing Gets Cluttered.
https://dl.acm.org/doi/10.1145/3544548.3580690

[18] ABCT 2024: ADHD Symptoms Associated with Digital Hoarding in College Students.
https://abct2024.eventscribe.net/ajaxcalls/PosterInfo.asp?PosterID=688996

[19] MDPI Education Sciences (2024): Neurodiversity Positively Predicts Perceived Extraneous Load in Online Learning. N=231.
https://www.mdpi.com/2227-7102/14/5/516

[20] UIST 2021: Tabs.do: Task-Centric Browser Tab Management.
https://dl.acm.org/doi/10.1145/3472749.3474777

[21] Nagel et al. (Focus Bear/RMIT, Sep 2025): Too Many Tabs Open? Using Everyday Computer Data to Support Focus for Adults with ADHD.
https://nafath.mada.org.qa/nafath-article/mcn2903/

[22] IJERPH (2023): same as [5].

[23] PMC (2019): Clinical Implications of the Perception of Time in ADHD.
https://pmc.ncbi.nlm.nih.gov/articles/PMC6556068/

[24] J Psychiatric Research (2023): PIU and ADHD meta-analysis. N=18,859.
https://www.sciencedirect.com/article/abs/pii/S0022395623004703

[25] PMC (2024): Inhibitory control moderating internet addiction and inattention.
https://pmc.ncbi.nlm.nih.gov/articles/PMC12135584/

[26] Scientific Reports (2023): Screen time, impulsivity, and growth in ADHD symptoms.
https://www.nature.com/articles/s41598-023-44105-7

[27] Cambridge Core / British Journal of Psychiatry: Genes and screens — ADHD in the digital age.
https://www.cambridge.org/core/journals/the-british-journal-of-psychiatry/article/genes-and-screens-attentiondeficit-hyperactivity-disorder-in-the-digital-age/D692E6A269DD6FCB2CF965814270EEB9

[28] Purpose Mode browser extension study (Lee, hanklee.com).
https://hankhplee.com/papers/purpose_mode.pdf [PDF — not full-text verified]

[29] Springer Current Psychology (2023): Hyperfocus and adult ADHD symptoms.
https://link.springer.com/article/10.1007/s12144-023-05235-3

[30] PLOS ONE (2023): A d factor? Distractibility and hyperfocus. N=1,220.
https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0292215

[31] Frontiers Psychiatry (2023): Hyperfocus and internet addiction in ADHD trait.
https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2023.1127777/full

[32] CHI 2019 / Microsoft Research: Reader View and reading speed.
https://www.microsoft.com/en-us/research/publication/the-impact-of-web-browser-reader-views-on-reading-speed-and-user-experience/

[33] BOIA: Reader modes and disability accessibility.
https://www.boia.org/blog/how-browser-reader-modes-improve-the-experiences-of-people-with-disabilities

[34] Firefox Reader View documentation.
https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages

[35] Mark et al. UbiComp 2017: Blocking distractions affects workplace focus. N=32.
https://www.interruptions.net/literature/Mark-UbiComp17.pdf [PDF — not full-text verified]

[36] Mobile internet blocking RCT.
https://pdfs.semanticscholar.org/322a/0fc8c72f6dc5672ab587904a7efa888be3b7.pdf [PDF — not full-text verified]

[37] W3C COGA Design Guide.
https://www.w3.org/TR/coga-usable/design_guide.html

[38] WCAG 2.2.
https://www.w3.org/TR/WCAG22/Overview.html

[39] PLOS ONE (2025): Web accessibility and cognitive engagement — psychophysiological study.
https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0328552

[40] ACM TACCESS (2024): Body Doubling with Neurodivergent Participants. N=220.
https://dl.acm.org/doi/full/10.1145/3689648

[41] FLOWN / Neurodiversity in Business industry survey (2025). N=117. [Industry survey; confidence: medium]
https://neurodiversity.org/virtual-body-doubling-for-adhd-new-research-findings-from-117-adults/

[42] NPR (2024): Come study with me — virtual body doubling.
https://www.npr.org/2024/07/25/nx-s1-4860330/come-study-with-me-how-virtual-buddy-might-help-you-get-things-done

[43] CHI 2026 (Extended Abstracts): Reading with Diversity in Mind — Pupillometry and Typography for ADHD Readers.
https://dl.acm.org/doi/10.1145/3772363.3799383

[44] MDPI Information (2025): Gamification in Digital Mental Health — Engagement–Efficacy–Ethics Trilemma.
https://www.mdpi.com/2078-2489/17/2/168

[45] Mad In America (2026): The Compliance Machine. [Commentary, not peer-reviewed]
https://www.madinamerica.com/2026/03/the-compliance-machine-how-adhd-habit-tracking-apps-enforce-the-disease-model/

[46] SAGE (2021): Studying Motivation in ADHD — SDT.
https://journals.sagepub.com/doi/10.1177/10870547211050948

[47] INTERACT 2025: Towards Inclusive Guidelines for Web Design for Adults with ADHD.
https://link.springer.com/chapter/10.1007/978-3-032-05008-3_59

[48] BMC Psychiatry (2025): Systematic review of reviews of digital interventions for ADHD. N=34,442.
https://link.springer.com/article/10.1186/s12888-025-06825-0

[49] J Affective Disorders (2024): Meta-analysis of digital interventions for ADHD. N=1,780.
https://www.sciencedirect.com/article/abs/pii/S0165032724013910

[50] Section508.gov: Designing for Cognitive Disabilities.
https://www.section508.gov/design/digital-content-users-with-cognitive-disabilities/

[51] Cambridge Core / European Psychiatry (2025): Work Performance Challenges in Adults with ADHD.
https://www.cambridge.org/core/journals/european-psychiatry/article/work-performance-challenges-and-needs-of-adults-with-adhd-exploring-lived-experiences/F89D938734C530D9ED3EA51C9E104DA0

[52] Frontiers Psychiatry (2024): Dopamine hypothesis for ADHD.
https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1492126/full

[53] Horse Browser overstimulation page.
https://browser.horse/adhd/overstimulation

[54] TechXplore (2025): LumiRead — Chrome extension for neurodivergent users.
https://techxplore.com/news/2025-07-chrome-extension-web-accessible-neurodivergent.html

[55] IUI 2024: Evaluating ADHD Users' Experience with Recommender Systems.
https://dl.acm.org/doi/10.1145/3640544.3645222

[56] PLOS ONE (2024): The lived experience of rejection sensitivity in ADHD.
https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0314669

[57] Cleveland Clinic: Rejection Sensitive Dysphoria (RSD).
https://my.clevelandclinic.org/health/diseases/24099-rejection-sensitive-dysphoria-rsd

[58] ADDitude Magazine: RSD and Emotional Dysregulation in ADHD.
https://www.additudemag.com/rejection-sensitive-dysphoria-adhd-emotional-dysregulation/
