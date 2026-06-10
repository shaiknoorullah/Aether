# Deep Research Plan: Local-First and On-Device AI for Desktop Apps in 2026

**Slug:** `local-ondevice-ai-2026`  
**Date:** 2026-06-10  
**Scale Decision:** Multi-faceted survey covering tooling landscape, hardware realities, model capabilities, and developer integration → **4 researcher subagents** (parallel)

---

## Key Questions

1. **Tooling landscape** — What are LM Studio, Ollama, llama.cpp, Apple MLX, and comparable tools? What's their current feature set, architecture, and maturity in 2026?
2. **Small-model capability vs frontier** — What can models like Llama 3.x, Mistral, Phi-4, Gemma 3, Qwen 2.5 realistically do compared to GPT-4o/Claude 3.5 class? Where do they fall short?
3. **Hardware realities** — What are the RAM/VRAM requirements, latency numbers, and throughput for realistic laptop hardware (Apple Silicon M-series, mid-range x86+iGPU, consumer discrete GPUs)?
4. **Privacy tradeoffs** — What data leaves the device? What doesn't? What attestation or audit mechanisms exist?
5. **OpenAI-compatible local gateways** — What servers expose OpenAI-compatible APIs locally? How mature is the ecosystem? What clients/SDKs work out-of-the-box?
6. **Practical ceiling for laptops** — Given all the above, what's realistically usable for a developer building a desktop AI product in mid-2026?

---

## Evidence Needed

- Official docs / changelogs for Ollama, LM Studio, llama.cpp, Apple MLX (2025–2026)
- Benchmarks: tokens/sec, TTFT, memory footprint — on M-series, laptop GPUs, CPU-only
- Model capability evaluations: coding, reasoning, instruction-following for 7B–70B quantized
- Hardware compatibility tables (minimum VRAM, unified memory thresholds)
- Privacy/telemetry policies for each tool
- OpenAI API compatibility matrices
- Community benchmarks (e.g., LocalLLaMA, HuggingFace, LM Studio blog, Ollama GitHub)

---

## Scale Decision

**Decision: 4 researcher subagents (parallel)**  
Rationale: Topic spans 4 distinct axes (tooling, model capability, hardware, integration/privacy) with enough breadth that parallel evidence gathering is clearly faster and reduces context pressure.

---

## Task Ledger

| # | Owner | Task | Output | Status |
|---|-------|------|--------|--------|
| T1 | lead (degraded) | Tooling landscape: Ollama, LM Studio, llama.cpp, Apple MLX — architecture, features, 2025-2026 state | `local-ondevice-ai-2026-research-T1.md` | 🔄 direct |
| T2 | lead (degraded) | Model capability vs frontier: small models (7B–70B quantized) capability benchmarks, coding/reasoning quality, known gaps | `local-ondevice-ai-2026-research-T2.md` | 🔄 direct |
| T3 | lead (degraded) | Hardware realities: RAM/VRAM requirements, latency & throughput benchmarks on Apple Silicon / x86 laptops, quantization tradeoffs | `local-ondevice-ai-2026-research-T3.md` | 🔄 direct |
| T4 | lead (degraded) | Privacy tradeoffs + OpenAI-compatible local gateways: telemetry policies, API compatibility, client ecosystem, developer integration patterns | `local-ondevice-ai-2026-research-T4.md` | 🔄 direct |
| BLOCKED | researcher subagent | All 4 parallel researcher agents failed: Cannot find module '/home/devsupreme/work/aether-browser/--mode' (Feynman runtime error) | — | ❌ blocked |
| S1 | lead (Feynman) | Synthesize T1–T4 → draft | `local-ondevice-ai-2026-draft.md` | ⬜ pending |
| S2 | verifier | Add citations, verify URLs | `local-ondevice-ai-2026-cited.md` | ⬜ pending |
| S3 | reviewer | Verification pass, flag unsupported claims | `local-ondevice-ai-2026-verification.md` | ⬜ pending |
| S4 | lead (Feynman) | Deliver final + provenance | `outputs/local-ondevice-ai-2026.md` | ⬜ pending |

---

## Verification Log

| Check | Status | Notes |
|-------|--------|-------|
| Tooling docs fetched | ⬜ | |
| Hardware benchmarks sourced | ⬜ | |
| Model capability numbers sourced | ⬜ | |
| Privacy policies confirmed | ⬜ | |
| OpenAI API compat confirmed | ⬜ | |
| All URLs verified reachable | ⬜ | |
| Reviewer FATAL issues resolved | ⬜ | |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| 4 researcher subagents | Topic has 4 clearly separable axes; parallel reduces latency |
| No PDF parsing | Avoid crash-prone PDF fetching; prefer HTML docs/changelogs |
| Focus on mid-2026 state | User explicitly asked for 2026; stale 2023-2024 benchmarks will be flagged |
