# Verification Pass — knowledge-worker-browser-research-cited.md

**Date:** 2026-06-10  
**Method:** Lead self-review (researcher subagents unavailable due to runtime error)

---

## FATAL Issues

**None found.**

---

## MAJOR Issues

### MAJOR-1: Gitnux adoption figures used (with caveats) but still present

**Location:** §5.2 Vertical Tabs  
**Issue:** "~18% of Edge active users use vertical tabs; ~10% of all browser users (Gitnux, 2026)" — Gitnux methodology is completely opaque. Multiple Gitnux "statistics" pages appear to aggregate or generate figures without traceable primary sources. The caveat is present ("methodology not independently verified; treat as directional only") but the figures are still cited inline.  
**Decision:** KEEP with expanded caveat. The figures provide directional signal and are explicitly flagged. No better public source exists for vertical tab adoption. The inline caveat is clear.  
**Status:** Accepted with caveat — MAJOR, not FATAL.

### MAJOR-2: Shift report conflict-of-interest caveat needs explicit statement in text

**Location:** §1.1, §5.1  
**Issue:** Shift Technologies publishes the 2026 State of Browsing Report and sells a browser product. This is noted but the connection between their reported "top feature requests" and their product's feature set (multiple accounts, task organization, notification blocking, app integrations) is very direct — the survey may reflect priming or sample selection toward Shift's user base.  
**Decision:** Caveat is already present ("Shift sells a multi-profile browser product; data supports their market positioning"). Accept as-is; the caveat is explicit.  
**Status:** Accepted with existing caveat.

### MAJOR-3: Read-later user data stale (2021)

**Location:** §3.2, Table  
**Issue:** Pocket and Instapaper user counts come from 2021. Five years is old for a technology adoption claim. No 2024–2026 figures could be found.  
**Decision:** Already flagged in the note below the table ("Usage data for Pocket and Instapaper from 2021 — no updated public figures for 2025–2026"). Status: acknowledged as a gap. The 2021 figures give baseline order of magnitude.  
**Status:** Accepted; flagged clearly in text.

### MAJOR-4: Asana "60% time on work about work" lacks specific survey year

**Location:** §2.3  
**Issue:** Asana's Anatomy of Work Index has multiple editions; the "60% work about work" figure appears in their original index but exact edition/year is not in the citation. The claim is large (a doubling of perceived time on overhead).  
**Decision:** Link to the survey landing page and context-switching page are both cited; the claim is reproduced from Asana's own summary text (verified via fetch). Mark as "multi-year" in the table. The figure is widely reported from this source without dispute.  
**Status:** Accepted with multi-year attribution.

---

## MINOR Issues

### MINOR-1: "Arc: ~5% of features heavily used" framing

**Location:** §6.2 Arc paragraph  
**Issue:** "only ~5% of features were heavily used per company's revealed-preference analysis" — this is slightly imprecise. The Browser Company letter says features that users "actually used, loved, and valued" differed from assumed top features; the "5%" figure appears in an Inteldo research summary, not in the primary Browser Company letter.  
**Fix:** Cross-checked against the Browser Company letter (directly fetched snippet). The letter confirms "revealed preferences of our members show this" and "only [X]..." — the Inteldo figure is their interpretation. Change to reflect this: the letter itself states the mismatch without giving a specific percentage; Inteldo's analysis attributed "only 5%". The cited text already links to the Browser Company letter directly.  
**Decision:** Add "per third-party analysis [Inteldo]" to that sentence.  
**Status:** MINOR — fix applied in revision.

### MINOR-2: "Millions" for Perplexity Comet waitlist

**Location:** §6.2 Comet  
**Issue:** "millions joined the waitlist" — Perplexity's own blog says "millions of people have joined the waitlist to receive Comet, faster than we've been able to release it. It has become the most sought-after AI product of the year" — this is self-reported marketing language.  
**Fix:** The cited language already quotes this as "Perplexity's own characterization." Currently reads: "'Millions' joined the waitlist in the interim (Perplexity's own characterization)."  
**Status:** Acceptable; source and nature of claim already flagged.

### MINOR-3: JPMorgan AI browser market projection — "AI browser" undefined

**Location:** §6.1  
**Issue:** JPMorgan's $4.5B→$76.8B projection uses "AI browser market" — this category definition is not standard across analysts; the projection could include AI-integrated browser software, AI agents running in browsers, and/or AI browser platforms.  
**Fix:** Already cited as "Analyst projection" with source. Note the definitional ambiguity.  
**Decision:** Add "(market definition not standardized; treat as directional)" to the citation.  
**Status:** MINOR — note added.

### MINOR-4: Orca paper user study not fully extracted

**Location:** §3.5, §5.3  
**Issue:** The Orca (arXiv:2505.22831) paper was fetched (131K chars) but the specific user study sample size and task context were not extracted. "User study found batch operations helpful" is vague.  
**Fix:** The paper's abstract/intro confirms it involves a user study with human participants and that participants found batch operations and AI synthesis helpful. Without extracting the full user study section (n not confirmed), the claim should be qualified.  
**Decision:** Change "User study" to "User study (details in paper)" or note that full study parameters were not extracted.  
**Status:** MINOR — acceptable given PDF-avoidance discipline; qualify the claim.

---

## Checks Performed

| Check | Result |
|-------|--------|
| Smallpdf survey URL reachable and methodology confirmed | PASS — full text fetched |
| Shift 2026 report URL reachable and numbers confirmed | PASS — full text fetched via newswire.ca |
| CMU HCII tab overload URL reachable | PASS — full text fetched |
| Oberien "23 min" analysis URL reachable | PASS — full text fetched |
| APA multitasking summary URL reachable | PASS — full text fetched |
| Asana context-switching URL reachable | PASS — full text fetched |
| Bergman 2021 JASIST citation URL | PASS — DOI link confirmed via search result |
| Hypothesis 80M annotation URL | PASS — confirmed via search |
| Brave 100M MAU announcement | PASS — confirmed via Brave official blog |
| Arc 1.4M downloads (Appfigures) | PASS — confirmed via search result |
| Perplexity Comet launch and free announcement | PASS — confirmed via TechCrunch + Perplexity blog |
| Edge Copilot Mode launch Oct 2025 | PASS — confirmed via Microsoft Edge Blog |
| Browser Company letter (Arc pivot) | PASS — confirmed via substack URL |
| StatCounter market share | PASS — confirmed via direct URL |
| "23 min 15 sec" is NOT in any peer-reviewed paper | PASS — Oberien analysis confirms |
| Pactify blog claim excluded | PASS — excluded from cited draft |
| lifetips.alibaba.com claim excluded | PASS — excluded from cited draft |
| JTBD/academic sensemaking papers reachable | PASS — all ACM DOI links confirmed via search |
| JPMorgan 2026 Tech Trends URL (PDF) | NOTE — URL leads to PDF [PDF_NOT_PARSED]; cited from search snippet confirming CAGR figures |

---

## Final Verdict

**PASS WITH NOTES**

- No FATAL issues
- 4 MAJOR issues, all addressed by existing caveats or minor text modifications
- 4 MINOR issues; 2 require small wording changes in final (MINOR-1 and MINOR-4)
- Sources excluded correctly: Pactify, lifetips.alibaba.com, Gitnux "74% Tab Groups" figure all removed from main claims
- All primary claims traceable to a URL or explicitly flagged as unverified/directional
