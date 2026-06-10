# Researcher Brief T3: Hardware Realities

## Topic
RAM/VRAM requirements, latency, and throughput for running local LLMs on real laptop hardware in 2026.

## Your deliverable
Write `outputs/.drafts/local-ondevice-ai-2026-research-T3.md` with structured notes covering all the questions below. Every claim must have a source URL inline. If a source is unavailable, note it as blocked.

## Questions to answer

1. **Apple Silicon (M-series)** — What's the realistic tokens/sec for 7B, 13B, 34B, 70B models (Q4 quantized) on M1/M2/M3/M4 MacBook Pro and MacBook Air? What's the effective VRAM ceiling (unified memory)? How does 16GB vs 36GB vs 64GB unified memory change what's runnable? What tools perform best on Apple Silicon?

2. **x86 laptops — CPU-only** — What's the tokens/sec on modern Intel Core Ultra / AMD Ryzen AI chips with no discrete GPU? Which quantization levels are needed for acceptable speed (>5 tok/s)? What's the minimum RAM?

3. **x86 laptops — consumer discrete GPU** — What does an RTX 4060 (8GB VRAM), RTX 4070 Ti (12GB), or RTX 3090 (24GB) get you? What models fit in 8GB? 12GB? 24GB VRAM? Tokens/sec targets?

4. **Quantization tradeoffs** — Q4_K_M vs Q5_K_M vs Q8_0 vs FP16: what's the quality-vs-speed-vs-size tradeoff? When does quantization hurt quality noticeably? Sources for this?

5. **Context window and memory scaling** — How does memory use scale with context length? What's the KV cache overhead for 8K vs 32K vs 128K context on a laptop?

6. **First-token latency (TTFT)** — What are realistic time-to-first-token numbers for local models on laptop hardware?

7. **CPU inference improvements** — What's new in 2025–2026 for CPU inference? (llama.cpp AVX-512, AMX, NPU offload for Intel/AMD AI chips, etc.)

8. **Practical minimum hardware** — What's the minimum spec to run a useful AI assistant locally (e.g., 7B Q4 at >10 tok/s)?

## Search strategy
Use web searches like:
- "llama.cpp tokens per second M3 MacBook benchmark 2025"
- "Ollama performance benchmark Apple Silicon 2025 2026"
- "RTX 4060 local LLM tokens per second 7B 13B"
- "LM Studio benchmark M2 M3 MacBook Pro"
- "quantization Q4 vs Q8 quality tradeoff llama"
- "local LLM 8GB VRAM what models fit 2025"
- "Apple M4 MacBook Pro LLM performance 2025"
- "Intel Core Ultra NPU LLM inference 2025"

Look for Reddit r/LocalLLaMA posts, HuggingFace benchmarks, official benchmark blogs. Do NOT fetch PDFs.

## Output format
Structured markdown with:
- Sections: Apple Silicon, x86 CPU-only, Discrete GPU, Quantization, Context scaling, TTFT, Minimum spec
- Source URLs inline for every number or claim
- Tables where helpful (model size × hardware → tokens/sec)
- A "gaps / could not verify" section at the end
