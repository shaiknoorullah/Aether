# Verification Report: local-ondevice-ai-2026-cited.md

**Date:** 2026-06-10  
**Reviewer:** Lead (Feynman, direct review — reviewer subagent blocked)

---

## Checks Performed

1. Every quantitative claim swept for source URL
2. Self-reported claims flagged as such
3. Inferred/extrapolated numbers checked against basis
4. Unsupported absolute tok/s numbers for specific laptops checked
5. Privacy claims verified against official policy pages
6. OpenAI API endpoint list verified against official docs

---

## FATAL Issues

**None found.** No fabricated data, no invented benchmarks, no missing source for core claims.

---

## MAJOR Issues (noted in Open Questions — already addressed in draft)

**MAJOR-1: Laptop tok/s speeds are inferences, not official benchmarks.**
- Sections 3.3 and 6.1 include estimated generation speeds (e.g., "~30–60 t/s on M2/M3 Apple Silicon") that are *not* from official documentation.
- These are clearly marked as inferred with `(*not directly benchmarked from official sources*)` in section 6.1.
- The only confirmed official tok/s data is: Qwen2-1.5B Q4_0 at Metal+BLAS: `pp512=5765 t/s, tg128=197 t/s` from the llama-bench example in the llama.cpp README.
- **Action taken:** All inferred tok/s estimates are parenthetically flagged. Section 7 Open Questions item 1 explicitly calls this out.
- **Residual risk:** A reader might miss the caveats. ✓ MITIGATED by explicit flags.

**MAJOR-2: Self-reported benchmark claims not independently verified.**
- DeepSeek-R1 "approaching O3/Gemini 2.5 Pro" — self-reported per model page.
- Qwen3-4B "rivals Qwen2.5-72B" — self-reported per model page.
- Gemma4 benchmark table (AIME 2026, LiveCodeBench) — from Google/Ollama's own model page.
- **Action taken:** Each is cited to the specific source and flagged as "self-reported" in Open Questions.
- **Residual risk:** Tables present these numbers at face value in the body. ✓ MITIGATED by Open Questions caveats.

**MAJOR-3: Web search blocked — no community benchmark verification.**
- Could not access r/LocalLLaMA, LM Studio benchmark blog posts, or any third-party benchmarks.
- This is the primary gap in this report.
- **Action taken:** Explicitly stated in research notes and Open Questions.
- **Status:** BLOCKED — cannot be remedied without web search access.

---

## MINOR Issues

**MINOR-1: 13B model size is an estimate.**
- "~8.1 GB Q4 est." for 13B is extrapolated from Llama-3.1-8B data. Official 13B Q4_K_M sizes can vary.
- Marked with "estimated" in table.
- ✓ ACCEPTABLE.

**MINOR-2: LM Studio free tier scope not fully verified.**
- "Free for local use" based on no paywall found. LM Link cross-device may be commercial.
- Noted in Open Questions.
- ✓ ACCEPTABLE.

**MINOR-3: Apple Silicon tok/s for the llama-bench example.**
- The llama-bench example (`qwen2 1.5B Q4_0, pp512=5765, tg128=197`) is from the llama.cpp README — the README shows "Metal,BLAS" but doesn't specify which Apple Silicon chip.
- Used only as indicative reference, not presented as a specific-hardware claim.
- ✓ ACCEPTABLE.

**MINOR-4: Gemma4-31B quantized size listed as "~20 GB".**
- From Ollama library page showing the quantized model but without giving exact Q4_K_M size. "~20 GB" is consistent with 30.7B parameters × ~4.89 bits/weight ÷ 8 ≈ 18.7 GB.
- Marked as approximate.
- ✓ ACCEPTABLE.

---

## Verified Claims (spot checks)

| Claim | Source | Status |
|-------|--------|--------|
| Ollama v0.30.7 release | github.com/ollama/ollama/releases | ✓ Verified |
| llama.cpp build b9585 | github.com/ggml-org/llama.cpp/releases | ✓ Verified |
| MLX blog post "March 30, 2026" | ollama.com/blog | ✓ Verified |
| Phi-4 GPQA 56.1 beats GPT-4o 50.6 | huggingface.co/microsoft/phi-4 | ✓ Verified |
| Phi-4 SimpleQA 3.0 | huggingface.co/microsoft/phi-4 | ✓ Verified |
| Gemma4-31B AIME 2026 89.2% | ollama.com/library/gemma4 | ✓ Verified |
| Gemma4-31B Codeforces ELO 2150 | ollama.com/library/gemma4 | ✓ Verified |
| Llama-3.1-70B Q4_K_M = 43.1 GB | llama.cpp quantize README | ✓ Verified |
| Llama-3.1-8B Q4_K_M = 4.9 GB | llama.cpp quantize README | ✓ Verified |
| Q4_K_M gen t/s = 71.93, F16 = 29.17 | llama.cpp quantize README | ✓ Verified |
| Ollama "prompts stay on device" | ollama.com/privacy | ✓ Verified (exact quote) |
| LM Studio "messages not transmitted" | lmstudio.ai/privacy | ✓ Verified (exact quote) |
| Ollama /v1/chat/completions tool support | docs.ollama.com/openai | ✓ Verified |
| LM Studio endpoints list | lmstudio.ai/docs/api/openai-api | ✓ Verified |
| OLLAMA_ORIGINS env var for extensions | docs.ollama.com/faq | ✓ Verified |
| Qwen3-8B = 5.2 GB | ollama.com/library/qwen3 | ✓ Verified |
| DeepSeek-R1 1.5B through 70B distills | ollama.com/library/deepseek-r1 | ✓ Verified |
| LocalAI v4.3.0 May 2026 | github.com/mudler/LocalAI README | ✓ Verified |
| llamafile Cosmopolitan Libc + llama.cpp | GitHub README | ✓ Verified |
| LM Studio llmster headless | lmstudio.ai/blog/0.4.0 | ✓ Verified |

---

## Overall Verdict

**Verification: PASS WITH NOTES**

The cited draft is factually grounded in primary sources. All benchmark numbers trace to official model cards or official documentation. Inferred values (laptop tok/s estimates, 13B model size) are clearly flagged. Self-reported capability claims are attributed to the source. The primary unresolved gap is absence of community benchmark data (blocked: web search unavailable in this session).

No FATAL issues. Three MAJOR issues — all mitigated in the document. Four MINOR issues — all acceptable.

The document is ready for delivery.
