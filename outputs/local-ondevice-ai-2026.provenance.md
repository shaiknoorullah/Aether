# Provenance: Local-First and On-Device AI for Desktop Apps in 2026

- **Date:** 2026-06-10
- **Rounds:** 1 (direct research — researcher subagents blocked; all work done by lead agent)
- **Sources consulted:** 25 URLs fetched directly from official documentation, GitHub repositories, official model pages, and official blog posts
- **Sources accepted:** 24 (all primary sources)
- **Sources rejected:** 0 dead links encountered; web search providers all blocked (Exa rate-limited, Perplexity/Gemini no API key configured)
- **Verification:** PASS WITH NOTES (see below)
- **Plan:** outputs/.plans/local-ondevice-ai-2026.md
- **Research files:**
  - outputs/.drafts/local-ondevice-ai-2026-research-direct.md (26 KB research notes)
  - outputs/.drafts/local-ondevice-ai-2026-draft.md (raw draft)
  - outputs/.drafts/local-ondevice-ai-2026-cited.md (cited draft = final)
  - outputs/.drafts/local-ondevice-ai-2026-verification.md (verification report)

## Blocked Capabilities

| Capability | Status | Impact |
|-----------|--------|--------|
| researcher subagents (parallel) | BLOCKED — Feynman runtime module error (`Cannot find module '/home/devsupreme/work/aether-browser/--mode'`) | Research done serially by lead agent |
| web_search (Exa) | BLOCKED — rate limit (429) | No community benchmarks, no third-party tok/s data |
| web_search (Perplexity) | BLOCKED — API key not configured | Same |
| web_search (Gemini) | BLOCKED — API key not configured | Same |
| reviewer subagent | BLOCKED — same runtime error as researcher | Self-review performed |
| verifier subagent | BLOCKED — same runtime error | Citation work done by lead agent |

## Verification Notes

- All quantitative claims in the final document trace to a specific source URL.
- **Benchmark numbers for specific laptop hardware** (e.g., M3 MacBook Pro tok/s, RTX 4060 tok/s) are inferences, not from official benchmarks. Clearly marked in the document.
- Self-reported model capability claims (DeepSeek-R1 "approaching O3", Qwen3-4B "rivals Qwen2.5-72B") are attributed to vendor model pages and flagged.
- Official tok/s data available: Qwen2-1.5B Q4_0 at 197 t/s tg128 on Metal+BLAS (from llama.cpp README benchmark output). Q4_K_M vs F16 relative t/s ratios from llama.cpp quantize README (71.93 vs 29.17 t/s on unspecified GPU workstation).
- Privacy claims verified against official policies (Ollama privacy policy, LM Studio privacy policy).
- OpenAI API endpoint lists verified against official docs (docs.ollama.com/openai, lmstudio.ai/docs/api/openai-api).
- No FATAL issues found. Three MAJOR issues mitigated (see verification report). Community benchmark gap is the primary unresolved limitation.

## Sources List

1. https://github.com/ggml-org/llama.cpp/releases
2. https://github.com/ollama/ollama/releases
3. https://lmstudio.ai/blog/0.4.0
4. https://github.com/ml-explore/mlx-lm/blob/main/README.md
5. https://docs.ollama.com/openai
6. https://lmstudio.ai/docs/api/openai-api
7. https://github.com/mudler/LocalAI/blob/master/README.md
8. https://ollama.com/privacy
9. https://lmstudio.ai/privacy
10. https://github.com/ggml-org/llama.cpp/blob/master/README.md
11. https://huggingface.co/microsoft/phi-4
12. https://ollama.com/library/gemma4
13. https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
14. https://github.com/ollama/ollama/blob/main/README.md
15. https://ollama.com/blog
16. https://docs.ollama.com/faq
17. https://docs.ollama.com/gpu
18. https://lmstudio.ai/docs
19. https://lmstudio.ai/docs/developer/core/headless
20. https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md
21. https://ollama.com/library/qwen3
22. https://ollama.com/library/llama3.3
23. https://ollama.com/library/deepseek-r1
24. https://github.com/ml-explore/mlx/releases
25. https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md
