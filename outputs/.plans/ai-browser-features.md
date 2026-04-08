# Comparison Plan: AI Browser Features

**Slug**: `ai-browser-features`  
**Date**: 2026-04-08  
**Status**: Draft — awaiting confirmation

## Subjects

| Browser | AI Feature Brand | Key Differentiator |
|---------|------------------|--------------------|
| Brave | Leo | Privacy-first, on-device + cloud models |
| Opera | Aria / Opera AI | Built-in sidebar AI, integrated in browser chrome |
| Dia (The Browser Company) | Dia AI | Agent-first, "browser that browses for you" |
| SigmaOS | Airis | Productivity-focused AI copilot |

## Dimensions (10)

1. **AI model access and selection** — which LLMs, user choice, on-device vs cloud
2. **Agent automation capabilities** — can the AI act autonomously (fill forms, navigate, extract)?
3. **Privacy model** — data retention, on-device processing, third-party sharing
4. **Pricing and tiers** — free tier, premium, enterprise
5. **Platform support** — OS coverage, mobile, sync
6. **User experience quality** — UI integration, friction, discoverability
7. **MCP/extension integration** — Model Context Protocol support, extension ecosystem hooks
8. **Context handling** — page context, history, multi-tab, conversation memory
9. **Reliability and error handling** — uptime, fallback behavior, error UX
10. **Developer API access** — APIs for extensions/plugins to use AI capabilities

## Source Strategy

### Primary sources (per browser)
- Official product pages, docs, blog posts, changelogs
- Pricing pages
- Developer documentation / API references

### Secondary sources
- Tech press reviews (The Verge, Ars Technica, TechCrunch)
- Comparison articles and benchmark posts
- Community reports (Reddit, HN threads)

### Verification
- Cross-reference claims across ≥2 independent sources
- Flag single-source claims with lower confidence
- Distinguish announced vs shipped features

## Execution Plan

1. **Parallel research** — 4 researcher subagents, one per browser, gathering primary + secondary sources on all 10 dimensions
2. **Synthesis** — merge raw findings into comparison matrix
3. **Verification pass** — verifier subagent checks claims, adds inline citations, flags gaps
4. **Charts** — quantitative dimensions get Vega-Lite charts; architecture differences get Mermaid diagrams
5. **Final artifact** — single `outputs/ai-browser-features-comparison.md`

## Expected Output Structure

```
# AI Browser Features Comparison
## Executive Summary
## Comparison Matrix (10 dimensions × 4 browsers)
## Detailed Analysis per Dimension
## Agreement / Disagreement / Uncertainty
## Charts & Diagrams
## Sources
```

## Confidence Framework

| Level | Meaning |
|-------|---------|
| ★★★ | Verified across 2+ independent sources |
| ★★ | Single authoritative source (official docs/blog) |
| ★ | Community reports or inference only |
| ⚠️ | Announced but not confirmed shipped |
