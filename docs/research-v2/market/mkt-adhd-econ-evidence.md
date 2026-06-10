# Adult ADHD Economic & Clinical Evidence — Department Report

> **Team**: mkt-adhd-econ-evidence (department: market)
> **Mandate**: Adult ADHD economic + clinical evidence 2020–2026 — productivity loss, societal cost, employment/earnings, efficacy of external-scaffolding / digital interventions
> **Date**: 2026-06-10
> **Primary source brief**: `outputs/adhd-productivity-digital-interventions.md` (21 PubMed papers, all URLs verified)
> **Sibling brief leveraged**: `outputs/.drafts/adhd-browser-attention-cited.md` (browser-specific ADHD scaffolding)
> **Confidence convention**: HIGH = multiple corroborating peer-reviewed sources / causal design; MEDIUM = single study or quasi-experimental; LOW = pilot, uncontrolled, or industry-funded only

---

## 1. Executive Summary

Adult ADHD is a large, economically material, and chronically under-served market that maps directly onto Aether's "externalize executive function" thesis. Persistent adult ADHD affects ~2.58% of adults globally (≈140M people); symptomatic adult ADHD reaches 6.76% (≈366M).[^20] The condition imposes documented per-person societal costs of **€15,652/year (Spain model)**[^2] and **€20,134/year (Danish sibling-comparison, causal design)**,[^3] with national aggregate marginal costs ranging up to **$141 billion**.[^1] Work absenteeism alone is ~26.5% of annual per-person cost in the Spanish model[^2] — productivity loss is the single largest controllable cost lever, which is exactly the surface a browser touches.

The clinical evidence base validates the *mechanism* Aether targets but warns against over-promising outcomes. CBT delivers small-to-moderate effects on executive function (SMD −0.43) and core symptoms (SMD −0.45), but **no effect on quality of life**.[^10] The 2025 BMJ umbrella review found **no high-certainty long-term evidence for any ADHD intervention**.[^13] Pharmacotherapy is associated with a 10% reduction in long-term unemployment risk (stronger in women), the best quasi-experimental occupational evidence available.[^7]

Digital interventions are the clearest whitespace. Smartphone-delivered psychoeducation **outperformed paper delivery** on inattention and impulsivity in the only active-controlled trial (n=60).[^16] A CBT-informed app reduced inattentive symptoms (η²=.15) but had **no effect on functional impairment**, with improvement mediated by organizational/time-management/planning behaviors and dose-dependent on exercises completed.[^15] Critically: **no FDA-cleared digital therapeutic exists for adult ADHD**, **no completed ADHD coaching RCT exists for 2020–2026**, and **no RCT evidence exists for any LLM/AI-based ADHD coaching or EF scaffolding**.[^13][^17] Aether can occupy the externalized-scaffolding / ambient-support niche as a *productivity tool* (not a regulated medical claim) while the clinical-grade DTx space is still empty.

---

## 2. Key Findings (each with source URL)

### Finding 1 — Adult ADHD is a 140M–366M person market
Persistent adult ADHD: **2.58%** (≈139.84M adults); symptomatic adult ADHD: **6.76%** (≈366.33M adults), 2020 demographic-adjusted. Prevalence declines with age; comorbidity (mood, anxiety, substance, sleep) is the rule.[^20][^21]
- Source: https://pubmed.ncbi.nlm.nih.gov/33692893/ (Song 2021, *J Glob Health*)
- Corroboration: https://pubmed.ncbi.nlm.nih.gov/33549739/ (Faraone 2021 World Federation Consensus, 208 statements / 80 authors / 27 countries)
- **Confidence: HIGH**

### Finding 2 — Per-person societal cost is €15.6K–€20.1K/year; absenteeism is the dominant controllable lever
Spain bottom-up model: **€15,652/diagnosed adult/year**; economic domain = 50% of annual cost, of which work absenteeism = 53% → absenteeism ≈ **26.5% of all annual per-person cost**.[^2] Danish sibling comparison (controls for genetic + shared-environment confounders): **€20,134/year excess** vs unaffected sibling.[^3]
- Sources: https://pubmed.ncbi.nlm.nih.gov/38601072/ (Merino 2024) ; https://pubmed.ncbi.nlm.nih.gov/31288209/ (Daley 2019, causal sibling design)
- **Confidence: HIGH** (Daley causal design; Merino is expert-elicited model)

### Finding 3 — National aggregate burden reaches up to $141B
Global synthesis of 44 cost-of-illness studies: per-person totals $831–$20,538; national marginal estimates $12.18M–**$141.33B**. Highest figures came from studies capturing multiple domains (direct + indirect + education + justice). **Zero LMIC data** — all estimates extrapolate from high-income contexts.[^1]
- Source: https://pubmed.ncbi.nlm.nih.gov/33554324/ (Chhibber 2021, *Pharmacoeconomics*)
- **Confidence: HIGH** (breadth) / **caveat: heterogeneous methods, no LMIC**

### Finding 4 — Symptom load directly predicts work/activity impairment and reduced employment
US survey of medicated adults (n=585): 95.2% reported ≥1 symptom in past month (mean 5.8); symptom count significantly correlated with reduced QoL, reduced employment probability, and increased work/activity impairment.[^4] Undiagnosed ASRS-positive adults in Japan (n=9,816) showed significantly greater WPAI impairment and healthcare utilization than controls.[^5]
- Sources: https://pubmed.ncbi.nlm.nih.gov/36082503/ (Schein 2023) ; https://pubmed.ncbi.nlm.nih.gov/34956750/ (Naya 2021)
- **Confidence: MEDIUM** (cross-sectional, self-report, industry-funded)

### Finding 5 — Remote work reduces depressive load but does NOT fix core EF-driven productivity loss
COVID-era cohort (n=904 ASRS+ / 900 controls): hybrid/full WFH associated with lower PHQ-9 depression vs on-site, but **not** with WPAI productivity or EQ-5D QoL improvement. Interpretation: environment change reduces affective load but does not compensate for core EF deficits.[^6]
- Source: https://pubmed.ncbi.nlm.nih.gov/37484117/ (Ishimoto 2023)
- **Confidence: MEDIUM** — *direct design implication: tools must scaffold EF itself, not merely reduce ambient stressors*

### Finding 6 — Pharmacotherapy lowers long-term unemployment ~10% (best causal occupational evidence)
Swedish register cohort (n=12,875): ADHD medication use associated with 10% lower long-term unemployment risk (adj RR 0.90, CI 0.87–0.95); significant in women (RR 0.82) not men; within-individual design shows lower unemployment *during* treatment periods (RR 0.89). Yet meta-review of 231 reviews found only "limited evidence" pharmacotherapy mitigates adverse life trajectories (employment, education, crime).[^7][^8]
- Sources: https://pubmed.ncbi.nlm.nih.gov/35476068/ (Li 2022, *JAMA Netw Open*) ; https://pubmed.ncbi.nlm.nih.gov/37974470/ (Chaulagain 2023 meta-review)
- **Confidence: HIGH** (within-individual quasi-experimental design)

### Finding 7 — CBT improves EF and symptoms modestly but NOT quality of life
2026 meta-analysis (14 RCTs): EF **SMD −0.43** (p=.001), core symptoms **SMD −0.45**, depression −0.23, anxiety −0.24, **QoL +0.12 (NS)**, self-evaluation −0.30 (NS). Pure CBT superior on EF (SMD −0.56); CBT+meds better for QoL.[^10] The 2025 BMJ umbrella review (221 intervention combos): CBT moderate-certainty in adults, mindfulness large-effect/low-certainty, and **no high-certainty long-term evidence for any intervention**.[^13]
- Sources: https://pubmed.ncbi.nlm.nih.gov/41483880/ (Liu 2026) ; https://pubmed.ncbi.nlm.nih.gov/41297970/ (Gosling 2025 BMJ)
- **Confidence: HIGH** (meta-analytic) — *QoL is an unmet target; do not promise life-satisfaction outcomes*

### Finding 8 — Digital psychoeducation BEATS paper; the delivery medium itself adds value
Only active-controlled digital RCT (n=60 German adults): smartphone-assisted psychoeducation **significantly better than paper** on inattention and impulsivity, with **higher homework compliance**, no adverse events, no pharma COI. Digital delivery outperformed paper even inside structured group treatment.[^16]
- Source: https://pubmed.ncbi.nlm.nih.gov/36041353/ (Selaskowski 2022)
- **Confidence: HIGH (relative)** — *strongest signal that in-context digital scaffolding has independent value*

### Finding 9 — Behavioral scaffolding (organization/time-management/planning) mediates symptom gains, and effect is dose-dependent
CBT-informed app RCT (n=154): inattention η²=.15, hyperactive-impulsive η²=.05, ADHD-QoL η²=.04; **no effect on functional impairment**. Organizational, time-management, and planning behaviors **partially mediated** inattentive improvement; improvement **correlated with exercises completed** (dose-response).[^15]
- Source: https://pubmed.ncbi.nlm.nih.gov/41220055/ (Antshel 2026)
- **Confidence: MEDIUM** (waitlist control; co-author equity COI) — *validates that the active ingredient is scaffolded org/time/planning behavior, not generic content*

### Finding 10 — Monitoring/reminder apps alone do NOT change behavior without incentive structure
FOCUS ADHD app RCT (n=73): **no significant medication-adherence difference** app vs TAU; only the app + **financial incentive** arm reached 100% adoption and higher registration.[^18] Mirrors landscape review: most ADHD apps are reminders/tracking/psychoeducation, child-focused, and lack RCT validation.[^19]
- Sources: https://pubmed.ncbi.nlm.nih.gov/37341028/ (Carvalho 2023, null) ; https://pubmed.ncbi.nlm.nih.gov/32283479/ (Pasarelu 2020 systematic review)
- **Confidence: MEDIUM (null finding)** — *passive monitoring is insufficient; pair with motivation/reward design*

### Finding 11 — Conversational-agent CBT shows early promise; LLM coaching has ZERO RCT evidence
Chatbot CBT pilot (n=46 Korean adults): significant symptom reduction (F=6.74, p=.01), avg 20.32 sessions/4wk; improvement correlated with psychoeducation-module use; "empathic quality valued, unnatural dialogue criticized."[^17] **No RCT or feasibility study of any LLM-based ADHD coaching / EF scaffolding exists in PubMed through 2026.**[^13]
- Source: https://pubmed.ncbi.nlm.nih.gov/33799055/ (Jang 2021)
- **Confidence: LOW-MEDIUM** (pilot) — *largest open research + product whitespace; modern LLMs solve the "unnatural dialogue" complaint*

### Finding 12 — No FDA-cleared adult-ADHD digital therapeutic; no completed adult coaching RCT
EndeavorRx (Akili) is FDA-cleared for children 8–12 only; **no FDA-cleared DTx for adult ADHD**. ORIKO (German DiGA) RCT is protocol-only (PMID 41884663). The only workplace occupational intervention RCT (Voyer, NCT06774378, 8-week virtual, QoL-of-work-life primary) is **results-pending**.[^9][^13]
- Sources: https://pubmed.ncbi.nlm.nih.gov/40602661/ (Voyer 2025 protocol) ; brief §5.6
- **Confidence: HIGH (regulatory gap)** — *clear runway to ship a non-medical productivity tool before regulated DTx arrives*

---

## 3. Implied Aether Feature Candidates

Mapping the evidence to product surfaces. Each is scoped as a **non-medical productivity feature** (avoids regulatory/efficacy-claim risk). RICE inputs are summarized in §6 and returned in the structured object.

1. **EF-Scaffold Side Panel ("externalized executive function")** — Persistent, context-aware panel that externalizes working memory: current task tied to active tab/URL, next-action prompt, reading-progress, and a "where was I?" recall surface. Directly operationalizes the mediator identified in Finding 9 (organization/time-management/planning behaviors drive symptom improvement) and the sibling browser brief's task-to-URL linking (FocusUp). Category: **Productivity**.

2. **Frictionless Task-Initiation Launcher** — One-keystroke "start" entry that pre-loads the right page + a tiny first action to defeat task-initiation failure (the value-of-initiation deficit). Reduces the blank-search-bar / empty-doc friction where ADHD users task-hop. Category: **Productivity**.

3. **Ambient Time-Awareness & Gentle Session Check-ins** — Always-visible elapsed-time/duration indicator plus *task-conditioned* (not rigid-timer) deferrable check-ins with zero penalty for declining — counters time blindness without the shame timers cause. Category: **Accessibility**.

4. **In-Context Psychoeducation & Behavioral Nudges** — Short, dismissible, digital-native scaffolds (planning prompts, breakdown-the-task cues) delivered in the browser. Backed by Finding 8 (digital > paper) and Finding 9 (dose-response on completed exercises). Category: **Productivity**.

5. **Non-Punitive Focus / Distraction-Scaffold Mode** — Task-conditioned ("until I finish X") rather than timer-conditioned blocking, reader/declutter mode, notification batching, and curated re-entry — autonomy-preserving, avoids the shame harm documented for neurodivergent users. Category: **Accessibility**.

6. **AI EF Coach (LLM-based, in-browser)** — Conversational, empathic agent that does task breakdown, body-doubling presence, planning, and re-engagement nudges. Targets the #1 whitespace (Finding 11: zero LLM-coaching RCTs; modern LLMs fix the "unnatural dialogue" complaint). Ship as productivity assistant, not therapy. Category: **AI & Agents**.

7. **Motivation/Reward Layer for Follow-Through** — Lightweight streaks/commitment/visible-progress mechanics, because passive monitoring failed without incentive (Finding 10). Pair with the EF panel rather than ship reminders alone. Category: **Productivity**.

8. **Cross-Device EF-State Sync** — Carry task context, session state, and scaffold settings across devices so externalized memory survives device switches (WM externalization only works if it persists). Category: **Sync & Portability**.

9. **First-Class Typography & Cognitive-Load Controls** — Surface font/size/spacing/contrast/declutter as top-level controls (sibling brief: large effect of font on ADHD reading). Category: **Accessibility**.

---

## 4. Competitive / Whitespace Notes

- **No adult-ADHD FDA-cleared DTx exists** (EndeavorRx is pediatric only).[^9] The regulated clinical lane is empty for adults; the *unregulated productivity-tool lane* is open and lower-risk. Aether should ship explicit productivity/scaffolding features and avoid medical-efficacy claims.
- **No completed ADHD coaching RCT (2020–2026)** and **no LLM coaching RCT at all** — the highest-value, lowest-competition surface. Existing chatbot evidence (Jang 2021) is a 2021 pilot whose main criticism (unnatural dialogue) is precisely what current LLMs resolve. An in-browser AI EF coach has effectively no validated competitor.[^13][^17]
- **Most ADHD apps are child-focused, reminder/tracking/psychoeducation tools without RCT validation** and standalone (not in the work surface).[^19] Aether's advantage is that the browser *is* the work surface — scaffolding lives where the impairment occurs, unlike standalone apps users must context-switch into.
- **Digital delivery has independent, demonstrated value over analog** (Selaskowski active-controlled RCT) — a defensible reason in-browser scaffolding beats paper planners / generic to-do apps.[^16]
- **The mediator is behavioral, not content** — organization/time-management/planning behaviors mediate gains (Antshel). Competitors selling "ADHD content libraries" miss this; a behavior-scaffolding browser hits the active ingredient.[^15]
- Sibling browser brief (`adhd-browser-attention-cited.md`) corroborates with HCI/CHI evidence: tab-as-externalized-WM, shame from timer blockers, body-doubling, FocusUp task-to-URL linking, passive attention sensing (R²=0.77). The economic brief supplies the business case; the sibling brief supplies the UX patterns — they converge.

---

## 5. Risks

1. **Efficacy / regulatory-claim risk (HIGH).** No high-certainty long-term evidence exists for *any* ADHD intervention,[^13] and CBT shows **no QoL effect**.[^10] Marketing Aether as treatment or promising life-outcome improvement invites FDA/MDR scrutiny and is unsupported. Mitigation: position as a productivity/accessibility tool; make no clinical claims.
2. **Functional-impairment gap (MEDIUM-HIGH).** Even effective digital tools moved symptoms but **not functional impairment** (Antshel).[^15] Symptom-level wins may not translate to the user's felt productivity, risking churn. Mitigation: measure and optimize for task-completion / re-engagement, not symptom scores.
3. **Passive monitoring is insufficient (MEDIUM).** Reminder/monitoring features alone produced null behavior change without incentive structure (Carvalho).[^18] Mitigation: always pair scaffolding with motivation/reward + active prompts.
4. **Shame / harm from punitive design (MEDIUM-HIGH).** Rigid timer-based blockers caused shame and counterproductive responses in neurodivergent users (sibling brief, CHI 2026).[^8 in sibling] Mitigation: autonomy-preserving, task-conditioned, zero-penalty interactions only.
5. **Evidence base is COI-laden and short-horizon (MEDIUM).** Many cited studies are industry-funded, self-report (WPAI), waitlist-controlled, and ≤26 weeks. Effect magnitudes may be inflated. Mitigation: treat effect sizes as directional, not as product performance guarantees.
6. **Heterogeneity / comorbidity (MEDIUM).** Trials exclude heavy comorbidity (50–70% co-occurrence in reality); AuDHD and anxious-ADHD users may respond adversely to features that help pure-inattentive users. Mitigation: configurable, opt-in scaffolds; no one-size-fits-all enforcement.
7. **No LMIC / generalizability data (LOW-MEDIUM).** All economic and most clinical data are high-income.[^1] Market-sizing outside high-income contexts is speculative.
8. **Privacy of attention/behavioral sensing (MEDIUM).** EF scaffolding implies sensing tab-switching, idle time, task-relevance. For an ADHD population this is sensitive health-adjacent data. Mitigation: on-device processing, explicit consent, no surveillance monetization (aligns with Aether's privacy-first thesis).

---

## 6. RICE Summary (feature candidates)

Reach 0–10 (share of ADHD + adjacent EF-challenged user base reached), Impact 0–3, Confidence 0–1, Effort in person-months.

| # | Feature | Category | Reach | Impact | Conf | Effort (pm) |
|---|---------|----------|-------|--------|------|-------------|
| 1 | EF-Scaffold Side Panel | Productivity | 6 | 2.5 | 0.7 | 5 |
| 2 | Frictionless Task-Initiation Launcher | Productivity | 5 | 2 | 0.6 | 3 |
| 3 | Ambient Time-Awareness & Gentle Check-ins | Accessibility | 6 | 2 | 0.65 | 3 |
| 4 | In-Context Psychoeducation & Nudges | Productivity | 5 | 2 | 0.75 | 3 |
| 5 | Non-Punitive Focus / Distraction-Scaffold Mode | Accessibility | 6 | 2 | 0.65 | 4 |
| 6 | AI EF Coach (LLM, in-browser) | AI & Agents | 6 | 3 | 0.5 | 8 |
| 7 | Motivation/Reward Follow-Through Layer | Productivity | 5 | 1.5 | 0.6 | 3 |
| 8 | Cross-Device EF-State Sync | Sync & Portability | 5 | 2 | 0.6 | 4 |
| 9 | First-Class Typography / Cognitive-Load Controls | Accessibility | 7 | 1.5 | 0.8 | 2 |

---

## Sources

(Per-finding URLs inline above; all verified against PubMed per the source brief's provenance.)

[^1]: Chhibber 2021, *Pharmacoeconomics*. https://pubmed.ncbi.nlm.nih.gov/33554324/
[^2]: Merino 2024, *Glob Reg Health Technol Assess*. https://pubmed.ncbi.nlm.nih.gov/38601072/
[^3]: Daley 2019, *Eur Psychiatry*. https://pubmed.ncbi.nlm.nih.gov/31288209/
[^4]: Schein 2023, *Curr Med Res Opin*. https://pubmed.ncbi.nlm.nih.gov/36082503/
[^5]: Naya 2021, *Cureus*. https://pubmed.ncbi.nlm.nih.gov/34956750/
[^6]: Ishimoto 2023, *Neuropsychiatr Dis Treat*. https://pubmed.ncbi.nlm.nih.gov/37484117/
[^7]: Li 2022, *JAMA Netw Open*. https://pubmed.ncbi.nlm.nih.gov/35476068/
[^8]: Chaulagain 2023, *Eur Psychiatry*. https://pubmed.ncbi.nlm.nih.gov/37974470/
[^9]: Voyer 2025, *Contemp Clin Trials* (protocol, NCT06774378). https://pubmed.ncbi.nlm.nih.gov/40602661/
[^10]: Liu 2026, *J Affect Disord*. https://pubmed.ncbi.nlm.nih.gov/41483880/
[^13]: Gosling 2025, *BMJ* umbrella review. https://pubmed.ncbi.nlm.nih.gov/41297970/
[^15]: Antshel 2026, *J Atten Disord*. https://pubmed.ncbi.nlm.nih.gov/41220055/
[^16]: Selaskowski 2022, *Psychiatry Res*. https://pubmed.ncbi.nlm.nih.gov/36041353/
[^17]: Jang 2021, *Int J Med Inform*. https://pubmed.ncbi.nlm.nih.gov/33799055/
[^18]: Carvalho 2023, *Eur Psychiatry*. https://pubmed.ncbi.nlm.nih.gov/37341028/
[^19]: Pasarelu 2020, *Int J Med Inform*. https://pubmed.ncbi.nlm.nih.gov/32283479/
[^20]: Song 2021, *J Glob Health*. https://pubmed.ncbi.nlm.nih.gov/33692893/
[^21]: Faraone 2021, *Neurosci Biobehav Rev*. https://pubmed.ncbi.nlm.nih.gov/33549739/

> Sibling brief cross-reference: `outputs/.drafts/adhd-browser-attention-cited.md` ([^8 in sibling] = UBC CHI 2026 neurodivergent shame study; FocusUp W4A 2025; Focus Bear/RMIT attention-sensing R²=0.77).
