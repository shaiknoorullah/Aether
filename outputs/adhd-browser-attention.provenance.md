# Provenance: ADHD, Neurodivergence, and the Web Browser (2026)

- **Date:** 2026-06-10
- **Slug:** `adhd-browser-attention`
- **Rounds:** 1 research round (direct lead-executed, 4-thread parallel web search); 1 draft round; 1 citation pass (self); 1 review pass (self); 1 revision pass applying all reviewer findings
- **Subagent status:** Parallel researcher subagents (4) attempted — failed with module error (`Cannot find module '--mode'`). All evidence gathered directly by lead using `web_search` and `fetch_content`. Verifier and reviewer subagents also unavailable (same module error). All citation and review passes executed by lead per direct-search workflow protocol.
- **Sources consulted:** 58 distinct source URLs gathered; 5 pages fetched full-text (UBC news/CHI 2026, arXiv 2507.06864, Focus Bear/RMIT Nafath, Horse Browser ADHD, JMIR Formative ADAPT 2025); remaining sources cited from search result metadata and abstracts
- **Sources accepted:** 55 sources cited in final output; 4 cited as PDF-only (not full-text verified): [6] Nature task initiation, [28] Purpose Mode, [35] Mark UbiComp 2017, [36] mobile internet RCT
- **Sources rejected / caveat-flagged:**
  - arXiv 2507.06864 — preprint, not peer-reviewed; flagged in body text
  - FLOWN body doubling survey — industry survey by commercial vendor; flagged as confidence: medium
  - Mad In America (2026) — commentary, not research; flagged as non-peer-reviewed
  - UBC CHI 2026 — accessed via UBC news release, not full CHI paper; flagged in provenance note
- **Verification:** PASS WITH NOTES
  - All MAJOR reviewer issues applied: preprint caveats added, PDF-only sources flagged, body doubling caveat added, canonical nature.com URL restored, RSD section added, UBC source access noted
  - FATAL issues: none found
  - PDF sources ([6], [28], [35], [36]) not full-text verified — cited from search metadata/abstract snippets
  - Post-fix grep checks: all 6 targeted fixes confirmed present in revised file

## Artifact Map

| Artifact | Path |
|----------|------|
| Plan | `outputs/.plans/adhd-browser-attention.md` |
| Researcher briefs | `outputs/.plans/adhd-browser-attention-T{1-4}.md` |
| Research notes | `outputs/.drafts/adhd-browser-attention-research-direct.md` |
| Draft | `outputs/.drafts/adhd-browser-attention-draft.md` |
| Cited draft | `outputs/.drafts/adhd-browser-attention-cited.md` |
| Verification report | `outputs/.drafts/adhd-browser-attention-verification.md` |
| Revised final | `outputs/.drafts/adhd-browser-attention-revised.md` |
| **Final output** | **`outputs/adhd-browser-attention.md`** |
| **Provenance** | **`outputs/adhd-browser-attention.provenance.md`** |

## Key Source Traceability

| Claim | Source |
|-------|--------|
| 15.5M U.S. adults with ADHD diagnosis | CDC MMWR 2024 [1] |
| Time perception impairment across all domains | IJERPH 2023 [5] |
| 37%+ ADHD professionals have 21+ tabs open | arXiv 2507.06864 [7, preprint] |
| Focus apps cause shame in ND users | UBC CHI 2026 [8] |
| SDT intervention improved ADHD symptoms p≤.01 | JMIR Formative 2025 [9] |
| Body doubling used by 220 neurodivergent people | ACM TACCESS 2024 [10] |
| Reader mode improves reading speed | CHI 2019 / Microsoft Research [32] |
| COGA design patterns for cognitive accessibility | W3C COGA [37] |
| PIU meta-analysis N=18,859 | J Psychiatric Research 2023 [24] |
| Digital stimming as design gap | UBC CHI 2026 [8] |
| Gamification engagement-efficacy-ethics trilemma | MDPI Information 2025 [44] |
