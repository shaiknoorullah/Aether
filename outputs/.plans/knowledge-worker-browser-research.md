# Deep Research Plan: Knowledge Workers & Researchers in the Browser (2026)

**Slug:** `knowledge-worker-browser-research`  
**Date:** 2026-06-10  
**Status:** AWAITING APPROVAL

---

## Key Questions

1. **Tab overload** — How many tabs do knowledge workers actually keep open? What are quantitative costs (memory, cognitive load, time-to-find)?
2. **Context-switching cost** — What does the literature say about cost of browser/tab context switches? Seconds per switch? Productivity multipliers?
3. **Research-and-capture workflows** — What tools and browser behaviors do researchers use to clip, annotate, bookmark, and resurface content? Adoption rates?
4. **Note-taking integration** — Which note-taking tools are most coupled to browser use? What friction points exist at the browser-to-notes boundary?
5. **Desired browser features** — Survey-backed or user-research-backed rankings of features knowledge workers most want (AI summarization, tab management, sidebar panels, search, etc.)?
6. **2026-specific context** — What has changed with AI-native browser features (Copilot in Edge, Arc, Brave Leo, Opera Aria, etc.) — adoption data?

---

## Evidence Needed

| Type | Target |
|------|--------|
| Quantitative studies | Tab count surveys, context-switch latency studies, productivity loss estimates |
| User surveys | Browser preference/frustration surveys (Stack Overflow, UX research firms, browser vendors) |
| Academic papers | Cognitive load / interruption cost papers (Gloria Mark et al., Iqbal & Bailey) |
| Industry reports | Browser market share, knowledge worker productivity, remote work tooling |
| Product/blog research | Arc, Notion, Obsidian, Roam, browser extension usage data |
| News/product releases | 2025–2026 AI browser feature launches, adoption metrics |

---

## Scale Decision

**BROAD MULTI-FACETED TOPIC → 4 researcher subagents**

Rationale: The topic spans cognitive science literature, UX surveys, product landscape (2026-current), and quantitative studies across multiple domains. Direct search alone would miss depth across all dimensions. 4 subagents allow parallel domain coverage without over-inflating.

---

## Task Ledger

| ID | Owner | Task | Output File | Status |
|----|-------|------|-------------|--------|
| T1 | lead (self) | Quantitative tab overload + context-switching cost literature (academic + industry) | `kb-research-tabs-context.md` | DEGRADED — researcher subagent broken, lead runs directly |
| T2 | lead (self) | Research-and-capture workflows + note-taking browser integration (surveys, tools, friction data) | `kb-research-capture-notes.md` | DEGRADED |
| T3 | lead (self) | Desired browser features surveys + user research rankings (2024–2026) | `kb-research-features-wanted.md` | DEGRADED |
| T4 | lead (self) | 2026 AI-native browser landscape: adoption data, product releases, usage metrics | `kb-research-ai-browsers.md` | DEGRADED |
| S5 | lead (self) | Synthesis → draft | `knowledge-worker-browser-research-draft.md` | PENDING |
| S6 | verifier | Citation verification | `knowledge-worker-browser-research-cited.md` | PENDING |
| S7 | reviewer | Verification pass | `knowledge-worker-browser-research-verification.md` | PENDING |
| S8 | lead (self) | Deliver final + provenance | `outputs/knowledge-worker-browser-research.md` | PENDING |

---

## Per-Researcher Briefs (to write on approval)

- `outputs/.plans/knowledge-worker-browser-research-T1.md`
- `outputs/.plans/knowledge-worker-browser-research-T2.md`
- `outputs/.plans/knowledge-worker-browser-research-T3.md`
- `outputs/.plans/knowledge-worker-browser-research-T4.md`

---

## Verification Log

| Check | Result | Date |
|-------|--------|------|
| Plan written to disk | PASS | 2026-06-10 |
| Researcher briefs written | PENDING | — |
| All research files exist | PENDING | — |
| Draft written | PENDING | — |
| Cited draft exists | PENDING | — |
| Reviewer pass complete | PENDING | — |
| FATAL issues resolved | PENDING | — |
| Final file on disk | PENDING | — |
| Provenance on disk | PENDING | — |

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Slug: `knowledge-worker-browser-research` | Captures topic: knowledge workers + browser + research | 2026-06-10 |
| Scale: 4 researcher subagents | Multi-domain: cognition lit + UX surveys + product landscape + AI browsers | 2026-06-10 |
| Avoid PDF parsing | Per workflow discipline; prefer abstracts + HTML snippets | 2026-06-10 |
| Cite quantitative studies explicitly | User requirement stated in prompt | 2026-06-10 |
