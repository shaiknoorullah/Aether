# Discovery: Neurodivergent / ADHD Users (Executive Function, Attention-Protecting Browser Design)

**Team:** seg-neurodivergent-adhd | **Department:** Discovery | **Date:** 2026-06-10
**Source brief:** `outputs/adhd-browser-attention.md` (Feynman deep-research, 58 sources, 5 full-text fetched)
**Mandate:** ADHD/neurodivergent users + browser 2026 — executive-function challenges, accommodations that work, shame vs. support, attention-protecting browser design.

> **Evidence caveat:** No large-sample ADHD-specific RCT of any browser feature exists as of June 2026. The strongest evidence is the UBC CHI 2026 study (N=27 neurodivergent students) and the JMIR ADAPT SDT feasibility RCT (N=23). Several supporting datapoints come from a non-peer-reviewed arXiv preprint (n=25) and one commercial industry survey (FLOWN, n=117); these are flagged inline. Confidence ratings reflect this.

---

## Executive Summary

Roughly 15.5 million U.S. adults carry an ADHD diagnosis, with global working-age prevalence around 4-5%. This population uses the browser through a neurobiology mainstream browser design has never accounted for: impaired working memory (tabs as externalized memory), time blindness (the internet as a context-free "time void"), task-initiation failure, impulse-driven tab proliferation, and hard-won hyperfocus states that a 25-minute timer actively destroys. This is a structural mismatch between 35-year-old browser design and a nervous system that requires externalized scaffolding — not a willpower failure.

The defining 2026 finding is that **current focus/productivity tools cause measurable shame in neurodivergent users.** The UBC CHI 2026 study found timer-based blockers (Pomodoro, Forest) assume "one right way to focus," produce shame about how little focused time users can sustain, and block "digital stimming" — a documented self-regulation strategy where users briefly visit familiar content to settle before a hard task. The evidence converges on a clear design paradigm shift: **an attention-protecting browser should externalize executive function and make structure visible, not restrict behavior and enforce compliance.** Self-Determination-Theory-grounded scaffolding (autonomy, competence, relatedness) outperformed compliance/gamification approaches and improved ADHD symptom severity (p<=.01) without targeting symptoms directly.

For Aether, this segment is high-leverage and under-served: no shipping browser is built ADHD-first, the accommodations that help (reader mode, typography control, ambient time, body doubling, task-to-URL linking, non-shaming language) are mostly cheap and align with features other Aether segments already want (tab management, reader mode, on-device AI, privacy). The risks are real — heterogeneity (AuDHD/anxiety-comorbid users respond differently), the surveillance trap of behavioral sensing, and the ethics of designing for a clinical population without clinical validation — and demand opt-in defaults, on-device-only sensing, and an SDT-audited language layer.

---

## Key Findings

### Finding 1: Tab overload is a working-memory externalization problem, not a discipline problem
- **Description:** In ADHD, working memory impairment is one of the most consistent cognitive findings. Tabs function as externalized working memory — each open tab is a thought the user fears losing (the "black hole effect" amplified by neurology). This makes generic "close your tabs" advice actively harmful.
- **Evidence:** "37% report 21+ browser tabs open at any given time; 22% report 12-20; 20% do not track... 80%+ bookmark content intending to return but never do." — arXiv 2507.06864 (2025, preprint, n=25) https://arxiv.org/html/2507.06864 ; corroborated by CHI 2023 "When Browsing Gets Cluttered" https://dl.acm.org/doi/10.1145/3544548.3580690
- **Confidence:** MEDIUM-HIGH (preprint primary source; peer-reviewed corroboration of general tab-overload)

### Finding 2: Focus apps cause shame in neurodivergent users (the headline 2026 finding)
- **Description:** Timer-based blockers and gamified focus apps assume one right way to focus, produce shame about how little focused time users sustain, and make users fear "dependency." Forest specifically was named as causing shame.
- **Evidence:** "Timer-based designs assume one right way to focus... users felt shame about how little focused time they could sustain ('a shameful point of comparison' about Forest's focus duration metric)." — UBC CHI 2026, Chow/Hariadi/McGrenere, N=27, doi:10.1145/3772318.3790801 https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/
- **Confidence:** HIGH (peer-reviewed CHI 2026; accessed via researcher-authored UBC release)

### Finding 3: "Digital stimming" is a working self-regulation strategy that current tools block
- **Description:** Neurodivergent users briefly visit familiar, predictable content to settle their cognitive state before entering a hard task. Current blockers prevent this, forcing users to skip a strategy that works. UBC proposes "curated digital stimming" — a bounded, time-limited soothing window — as a design pattern. No tool implements it.
- **Evidence:** "'Digital stimming' — briefly visiting familiar content to manage cognitive load before entering a hard task — was blocked by current tools, forcing users to skip a working self-regulation strategy." — UBC CHI 2026 [8] https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/
- **Confidence:** MEDIUM-HIGH (peer-reviewed identification of the gap; no implementation/validation exists)

### Finding 4: Time blindness makes the browser a "time void"
- **Description:** ADHD impairs time estimation, reproduction, production, and duration discrimination across all measured domains. The browser has no natural session boundaries or ambient clock; a user intending 5 minutes can surface 90 minutes later with no subjective sense of elapsed time.
- **Evidence:** "Time estimation, reproduction, production, and duration discrimination are all impaired domains." — IJERPH 2023, decade review of adult ADHD time perception https://www.mdpi.com/1660-4601/20/4/3098 ; scalar-expectancy "abnormally fast internal counting process" https://pmc.ncbi.nlm.nih.gov/articles/PMC6556068/
- **Confidence:** HIGH (peer-reviewed review + replicated SET work)

### Finding 5: Task initiation fails at the blank search bar / empty document
- **Description:** ADHD involves a specific deficit in value-estimation for initiatory (first-stage) actions — the brain under-weights the reward of *beginning*. In the browser, the high-friction moment is navigating to the right page and starting; that is where users task-hop to lower-demand, higher-novelty content.
- **Evidence:** "More than 70% were 'constantly or frequently pulled away from high-priority tasks owing to distractions or lower-priority work.'" — arXiv 2507.06864 (preprint, n=25) https://arxiv.org/html/2507.06864 ; task-initiation value-estimation deficit, Translational Psychiatry 2023 https://www.nature.com/articles/s41398-023-02717-7 (PDF metadata only)
- **Confidence:** MEDIUM (preprint + PDF-only primary; mechanism well-supported clinically)

### Finding 6: Hyperfocus is hard-won and takes longer than a 25-minute block to reach
- **Description:** Hyperfocus is a real, valuable ADHD state but is fragile and emotionally complex. It often takes longer than the assumed 25-minute focus block to enter. Timer-based tools that interrupt it actively harm users.
- **Evidence:** "Described entering rare and hard-won states of hyperfocus that can take longer than the commonly assumed 25-minute focus block to reach." — UBC CHI 2026 [8] https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/ ; hyperfocus linked to affective dysregulation, Current Psychology 2023 https://link.springer.com/article/10.1007/s12144-023-05235-3
- **Confidence:** HIGH (peer-reviewed)

### Finding 7: SDT-based, non-punitive scaffolding improves outcomes without targeting symptoms
- **Description:** A neuroaffirmative, Self-Determination-Theory intervention (autonomy, competence, relatedness) improved psychological distress and ADHD symptom severity — particularly inattention — purely via psychological-need satisfaction. Participants reframed ADHD from personal failure to neurobiological difference.
- **Evidence:** "Significant improvement in ADHD symptom severity, particularly inattention (p<=.01)... 90% found intervention useful... improvements occurred without targeting symptoms directly." — JMIR Formative 2025 ADAPT, Champ et al., n=23 RCT feasibility, doi:10.2196/69943 https://formative.jmir.org/2025/1/e69943
- **Confidence:** MEDIUM-HIGH (peer-reviewed RCT, small sample)

### Finding 8: Punitive UI language is a rejection-sensitivity (RSD) hazard
- **Description:** Rejection Sensitivity Dysphoria — intense emotional pain from perceived criticism/failure — is a well-documented manifestation of ADHD emotional dysregulation. "You failed your goal," "streak broken," and public-accountability features are high-risk surfaces that can trigger responses disproportionate to the event.
- **Evidence:** Lived-experience qualitative study of rejection sensitivity in ADHD, PLOS ONE 2024 https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0314669 ; clinical RSD documentation, Cleveland Clinic https://my.clevelandclinic.org/health/diseases/24099-rejection-sensitive-dysphoria-rsd
- **Confidence:** MEDIUM (qualitative/clinical; no browser-specific controlled study)

### Finding 9: Reader mode and typography control are evidence-grounded accommodations
- **Description:** Reader mode reduces visual complexity and improves reading speed; it benefits ADHD and dyslexia users by stripping ads/sidebars/noise. Font and font size have a "large effect size" on reading performance for ADHD readers, making typography a first-class control rather than a buried preference.
- **Evidence:** Reader View improves reading speed, CHI 2019 / Microsoft Research https://www.microsoft.com/en-us/research/publication/the-impact-of-web-browser-reader-views-on-reading-speed-and-user-experience/ ; "ADHD status has a large effect size on reading speed; font and font size significantly affect reading performance," CHI 2026 pupillometry https://dl.acm.org/doi/10.1145/3772363.3799383
- **Confidence:** HIGH (multiple peer-reviewed)

### Finding 10: Removing attention-capturing design patterns measurably reduces compulsive use
- **Description:** Stripping attention-capturing design patterns (autoplay, recommendation carousels, infinite scroll, push-permission dialogs) reduces compulsive usage. Inhibitory-control deficits make ADHD users especially vulnerable to these patterns.
- **Evidence:** A browser-extension study removing attention-capturing design patterns "reduced daily social media time by 21 minutes on average." — Purpose Mode (Lee) https://hankhplee.com/papers/purpose_mode.pdf (PDF, not full-text verified) ; PIU/ADHD correlation meta-analysis N=18,859, J Psychiatric Research 2023 https://www.sciencedirect.com/article/abs/pii/S0022395623004703
- **Confidence:** MEDIUM (PDF-only primary; strong meta-analytic context)

### Finding 11: Body doubling / ambient co-presence is widely used; promising but under-validated
- **Description:** Body doubling — working alongside another's presence (live, remote, or recorded) — is a widely adopted neurodivergent strategy. Industry data reports large self-reported focus gains, but no RCT of browser-native digital body doubling exists.
- **Evidence:** Body doubling used by N=220 neurodivergent people, ACM TACCESS 2024 https://dl.acm.org/doi/full/10.1145/3689648 ; "over 2x increase in sustained focus" (FLOWN industry survey, n=117, confidence medium) https://neurodiversity.org/virtual-body-doubling-for-adhd-new-research-findings-from-117-adults/
- **Confidence:** MEDIUM (one peer-reviewed survey of adoption; efficacy data is self-report/industry)

### Finding 12: Behavioral sensing is foundational to adaptive support but ADHD users demand strict privacy
- **Description:** Adaptive support (intent-drift nudges, attention estimation) depends on behavioral sensing — but ADHD users are heightened-vulnerability to surveillance. ML on tab-switching/idle-time/task-relevance reached R^2=0.77 predicting attention states, but authors flag clinical validation as required, and privacy is rated mandatory.
- **Evidence:** "77% of ADHD professionals rate privacy as 'very important' or 'mandatory.'" — arXiv 2507.06864 (preprint) https://arxiv.org/html/2507.06864 ; R^2=0.77 attention prediction (n=6 simulated, validation required), Focus Bear/RMIT 2025 https://nafath.mada.org.qa/nafath-article/mcn2903/
- **Confidence:** MEDIUM (preprint + proof-of-concept; direction is clear)

---

## Jobs-to-Be-Done

- **JTBD-1: "Help me start the task I'm avoiding."** Low-friction intent declaration at session start; task-to-URL context linking so the current task is visible in browser chrome (FocusUp pattern). Serves Finding 5.
- **JTBD-2: "Let me keep my tabs without drowning in them."** Externalize working memory via visual/spatial history, semantic auto-grouping, and a "where was I?" context-recall surface — instead of forcing tab closure. Serves Findings 1, 4.
- **JTBD-3: "Tell me where my time went without making me feel bad about it."** Ambient (non-alarming) elapsed-time and time-on-site indicators; neutral end-of-session time map, not a productivity score. Serves Finding 4.
- **JTBD-4: "Protect my hyperfocus instead of breaking it."** User-controlled session length, no forced breaks/expiration; gentle, deferrable, zero-penalty check-ins. Serves Finding 6.
- **JTBD-5: "Let me settle before I dive in."** Curated digital-stimming window — a bounded, time-limited soothing surface to transition into work without doomscrolling. Serves Finding 3.
- **JTBD-6: "Quiet the web down."** Aggressive opt-in reader mode, anti-attention-capture mode, notification batching to session boundaries, first-class typography controls. Serves Findings 9, 10.
- **JTBD-7: "Be with me while I work."** Ambient presence / body-doubling co-working signal. Serves Finding 11.
- **JTBD-8: "Never shame me, and never sell my attention data."** SDT-audited non-punitive language; on-device-only behavioral sensing with pause/delete sovereignty. Serves Findings 7, 8, 12.

---

## Implied Aether Feature Candidates

1. **Non-shaming focus mode (task-conditioned, not timer-conditioned)** — Accessibility. Focus/blocking that ends on "until I complete X," never on a countdown; no streaks, no failure states. Directly answers the UBC shame finding. The single highest-leverage, lowest-cost differentiator.
2. **Curated digital-stimming window** — Accessibility. Novel, no implementation exists anywhere. Bounded, time-limited soothing-content surface with hard exit back to task. High whitespace, design-risk noted.
3. **Ambient time anchoring (elapsed + time-on-site + neutral session map)** — Productivity. Counters time blindness without alarms or scores.
4. **Intent declaration + task-to-URL context linking** — Productivity. "What are you working on?" at session start; only context-relevant tasks shown per site (FocusUp pattern). Supports task initiation.
5. **Externalized-memory tab/history surface** — Workspace & Organization. Visual/spatial branching history, semantic auto-grouping, "where was I?" recall; bookmarks as an active to-process queue, not a dead archive. Overlaps with knowledge-worker segment demand.
6. **Anti-attention-capture / aggressive reader mode** — Core Browsing. Strip autoplay, infinite scroll, recommendation carousels, push-permission dialogs; opt-in reader default. Evidence-backed (Purpose Mode, CHI 2019).
7. **First-class typography & visual-load controls** — Accessibility. Font, size, weight, line-height, spacing, contrast as top-level UI (CHI 2026 large effect size). Cheap, broadly beneficial.
8. **Ambient body-doubling / co-working presence mode** — Social & Collaboration. Optional persistent presence signal (visual/motion, not intrusive audio). Promising but under-validated; ship as opt-in experiment.
9. **On-device intent-drift nudges (gentle, deferrable, zero-penalty)** — AI & Agents. Local ML on tab-switching/idle/URL-divergence surfaces a non-alarming reminder; all data on-device, pauseable, deletable. Higher effort; depends on local-AI stack.
10. **SDT-audited language & failure-tolerant UI layer** — Accessibility. Project-wide string audit against autonomy-supportive principles; deviations shown neutrally as information. Cross-cutting policy, low engineering cost, RSD-protective.

---

## Competitive / Whitespace Notes

- **No browser is built ADHD-first.** Closest references are niche/extension-level: Horse Browser (tree "Trails" history, ADHD marketing page), Misha Labs "Neurodivergent Browsing Assistant," and LumiRead (Chrome extension for neurodivergent reading). None is a mainstream browser; none implements non-shaming task-conditioned focus or digital stimming.
- **Mainstream focus tools are the anti-pattern.** Forest, Pomodoro timers, and streak/habit-tracking apps were specifically identified as shame-producing for this population (UBC CHI 2026; gamification "Engagement-Efficacy-Ethics Trilemma," MDPI Information 2025). A browser that does the opposite is a clear positioning wedge.
- **Curated digital stimming = true whitespace.** Named as a design need in peer-reviewed work with zero existing implementation. First-mover opportunity, but requires careful design to avoid becoming a doomscroll vector.
- **Strong overlap with existing Aether segments lowers marginal cost.** Reader mode, tab/history externalization, on-device AI, and privacy-by-design are already wanted by knowledge-workers, power-users, and privacy-advocates segments. ADHD accommodations are largely re-skins/extensions of those, not net-new platform work — except digital stimming and body doubling.
- **Arc's collapse** (acquired by Atlassian, effectively discontinued) left workspace/spatial-organization users — many of whom are neurodivergent tab-hoarders — without a home. Adjacent demand pool.

---

## Risks

1. **Heterogeneity / one-size-fits-none.** Inattentive, hyperfocusing, AuDHD, and anxiety-comorbid users respond differently to the same affordance (e.g., prominent time display calms some, triggers anxiety in others). Mitigation: opt-in, user-configurable defaults; "expose tools, don't impose a workflow."
2. **Surveillance trap.** Adaptive support needs behavioral sensing, but ADHD users are surveillance-vulnerable and rate privacy mandatory. Cloud-based sensing (as in the Focus Bear PoC's GPT URL scoring) is disqualifying. Mitigation: on-device-only ML, pauseable/deletable sensing, auditable architecture.
3. **Clinical-population ethics without clinical validation.** No browser-feature RCT exists; shipping "ADHD support" risks overclaiming therapeutic benefit. Mitigation: frame as accommodation/affordance, not treatment; avoid medical claims; partner for validation.
4. **RSD / shame backfire.** Any failure state, streak, or accountability surface can trigger rejection-sensitivity responses. Mitigation: SDT language audit, no failure states, neutral framing of all deviation.
5. **Digital-stimming becomes doomscroll.** The hardest design problem in the brief — distinguishing a productive transition window from a spiral, and enforcing the time boundary without shame. Mitigation: hard content/time bounds, gentle re-entry, user-defined categories; treat as an experiment, measure carefully.
6. **Thin evidence base.** Best sources are small (N=27, N=23), preprint (n=25), or industry self-report (n=117). Confidence on specific effect sizes is limited. Mitigation: build instrumentation (privacy-preserving, opt-in) to validate in-product; weight high-confidence/low-cost features first.

---

## Sources

Primary brief: `outputs/adhd-browser-attention.md` (full 58-source list and provenance in `outputs/adhd-browser-attention.provenance.md`). Key sources cited above:

- UBC CHI 2026 (Chow et al., N=27) — https://news.ubc.ca/2026/06/focus-apps-are-failing-neurodivergent-minds-new-research-finds/
- JMIR Formative 2025 ADAPT (Champ et al., n=23) — https://formative.jmir.org/2025/1/e69943
- arXiv 2507.06864 (2025, preprint, n=25) — https://arxiv.org/html/2507.06864
- IJERPH 2023 time perception review — https://www.mdpi.com/1660-4601/20/4/3098
- Translational Psychiatry 2023 task initiation — https://www.nature.com/articles/s41398-023-02717-7
- CHI 2019 / Microsoft Research reader view — https://www.microsoft.com/en-us/research/publication/the-impact-of-web-browser-reader-views-on-reading-speed-and-user-experience/
- CHI 2026 typography/pupillometry — https://dl.acm.org/doi/10.1145/3772363.3799383
- Purpose Mode — https://hankhplee.com/papers/purpose_mode.pdf
- ACM TACCESS 2024 body doubling (N=220) — https://dl.acm.org/doi/full/10.1145/3689648
- FLOWN body-doubling survey (n=117, industry) — https://neurodiversity.org/virtual-body-doubling-for-adhd-new-research-findings-from-117-adults/
- Focus Bear/RMIT attention PoC — https://nafath.mada.org.qa/nafath-article/mcn2903/
- PLOS ONE 2024 RSD lived experience — https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0314669
- MDPI Information 2025 gamification trilemma — https://www.mdpi.com/2078-2489/17/2/168
- W3C COGA design guide — https://www.w3.org/TR/coga-usable/design_guide.html
- CDC MMWR 2024 prevalence — https://www.cdc.gov/mmwr/volumes/73/wr/mm7340a1.htm
