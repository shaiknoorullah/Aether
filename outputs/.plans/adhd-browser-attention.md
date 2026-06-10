# Deep Research Plan: ADHD & Neurodivergent Users — Web Browser (2026)

**Slug:** `adhd-browser-attention`
**Date:** 2026-06-10
**Scale decision:** Multi-domain, broad survey — 4 researcher subagents (clinical/cognitive science, HCI/UX research, existing tooling landscape, shame/motivation/support design)

---

## Key Questions

1. What executive-function deficits (task initiation, working memory, time blindness, impulse control) specifically manifest during web browsing sessions?
2. What does the clinical/cognitive-science literature say about ADHD and digital attention environments?
3. What digital accommodations and browser-adjacent tools have evidence of effectiveness for neurodivergent users?
4. What does HCI research say about attention-protecting interfaces, and what design patterns reduce cognitive load for ADHD users?
5. How does shame vs. support framing in productivity software affect neurodivergent users — what design philosophy do advocates and researchers recommend?
6. What should an "attention-protecting browser" feature set look like, grounded in evidence?

---

## Evidence Needed

- Clinical literature: ADHD executive function deficits, DSM-5/ICD-11 framings, cognitive load models (working memory limits)
- Neuropsychology: time perception in ADHD, impulsivity and digital environments, hyperfocus patterns
- HCI / UX research: studies of browser/digital tool design for ADHD, cognitive accessibility guidelines (WCAG 2.x, COGA), attention restoration theory
- Existing tooling: browser extensions (Freedom, Cold Turkey, One Tab, etc.), OS-level tools, app-specific features — with any effectiveness evidence
- Disability/neurodiversity advocacy: shame-versus-support framing, neurodiversity-affirming design principles
- Survey / user research: self-reported experience data from neurodivergent users
- 2024–2026 publications preferred for recency

---

## Scale Decision

**Multi-agent (4 subagents)** — topic spans clinical neuroscience, HCI research, tooling landscape, and design philosophy. Decomposition reduces context pressure and enables parallel literature + web research.

| Thread | Owner | Focus |
|--------|-------|-------|
| T1 | researcher | Clinical/cognitive-science literature: ADHD EF deficits, DSM, neuropsychology of digital environments |
| T2 | researcher | HCI/UX research: accessible browser design, attention-protecting interfaces, COGA guidelines, empirical studies |
| T3 | researcher | Tooling landscape: existing browser extensions, OS tools, apps — features and any effectiveness evidence |
| T4 | researcher | Shame vs. support design philosophy: motivation research, neurodiversity-affirming UX, advocacy frameworks |

---

## Task Ledger

| # | Task | Status | Owner | Output |
|---|------|--------|-------|--------|
| 1 | Write per-researcher briefs T1–T4 | ✅ DONE | lead | `outputs/.plans/adhd-browser-attention-T{1-4}.md` |
| 2 | Gather evidence (parallel, 4 agents) | ⏳ PENDING | researchers | `outputs/.drafts/adhd-T{1-4}-research.md` |
| 3 | Draft synthesis | ⏳ PENDING | lead | `outputs/.drafts/adhd-browser-attention-draft.md` |
| 4 | Citation pass (verifier) | ⏳ PENDING | verifier | `outputs/.drafts/adhd-browser-attention-cited.md` |
| 5 | Review pass (reviewer) | ⏳ PENDING | reviewer | `outputs/.drafts/adhd-browser-attention-verification.md` |
| 6 | Fix FATAL issues | ⏳ PENDING | lead | `outputs/.drafts/adhd-browser-attention-revised.md` |
| 7 | Deliver final + provenance | ⏳ PENDING | lead | `outputs/adhd-browser-attention.md` + `.provenance.md` |

---

## Verification Log

| Check | Status | Notes |
|-------|--------|-------|
| T1 research file exists | ⏳ | |
| T2 research file exists | ⏳ | |
| T3 research file exists | ⏳ | |
| T4 research file exists | ⏳ | |
| Draft written | ⏳ | |
| Cited draft exists | ⏳ | |
| Reviewer pass complete | ⏳ | |
| FATALs resolved | ⏳ | |
| Final file on disk | ⏳ | |
| Provenance file on disk | ⏳ | |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | Scale: 4 subagent researchers | Topic spans 4 distinct domains; parallelization reduces context pressure and improves coverage |
| 2026-06-10 | Output location: `outputs/adhd-browser-attention.md` | Not a paper-style draft; this is a research brief for product design decisions |
