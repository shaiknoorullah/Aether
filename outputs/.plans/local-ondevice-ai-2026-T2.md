# Researcher Brief T2: Small-Model Capability vs Frontier

## Topic
What can locally-runnable small models (7B–70B, quantized) actually do in 2026 compared to frontier models (GPT-4o, Claude 3.5/3.7 Sonnet, Gemini 2.x)?

## Your deliverable
Write `outputs/.drafts/local-ondevice-ai-2026-research-T2.md` with structured notes covering all the questions below. Every claim must have a source URL inline. If a source is unavailable, note it as blocked.

## Questions to answer

1. **Top local models in 2026** — What are the leading small models that can run locally? Focus on: Llama 3.x (Meta), Mistral/Mixtral, Phi-4 (Microsoft), Gemma 3 (Google), Qwen 2.5 (Alibaba), DeepSeek-R1/V3 distillations. What sizes are available? What's the quantized footprint?

2. **Benchmark comparison vs frontier** — What do benchmarks say about local vs frontier capability? Look for: MMLU, HumanEval / LiveCodeBench, MATH/AIME, MT-Bench, IFEval, GPQA, or equivalent 2025–2026 benchmarks. What's the gap?

3. **Coding capability** — How good are local models at code generation, completion, debugging in 2025–2026? Which models are best for coding locally? What are the known failure modes?

4. **Instruction following & tool calling** — Which local models support reliable tool/function calling? Which are best at following complex instructions?

5. **Reasoning capability** — Do any local models approach frontier reasoning quality? DeepSeek-R1 distillations, Phi-4 reasoning variants, Qwen QwQ — what's known?

6. **Multimodal locally** — Which local models support vision/image input? What's realistic on a laptop (e.g., LLaVA, Llama 3.2 Vision, Qwen-VL, Phi-3 Vision)?

7. **The gap that remains** — What tasks/domains still clearly require frontier models? What are the known failure modes of even the best local models?

## Search strategy
Use web searches like:
- "best local LLM 2025 2026 benchmark comparison"
- "Llama 3.3 vs GPT-4o benchmark 2025"
- "Phi-4 benchmark results coding reasoning"
- "Qwen 2.5 local model performance 2025"
- "DeepSeek R1 distill local laptop 2025"
- "local LLM coding benchmark HumanEval 2025 2026"
- "small model vs frontier gap 2025"

Look for leaderboard pages (HuggingFace Open LLM Leaderboard, LMSYS Chatbot Arena, LiveCodeBench) and official model cards. Do NOT fetch PDFs.

## Output format
Structured markdown with:
- One section per theme (top models, benchmarks, coding, reasoning, multimodal, gaps)
- Source URLs inline for every claim, benchmark number, or model spec
- A "gaps / could not verify" section at the end
