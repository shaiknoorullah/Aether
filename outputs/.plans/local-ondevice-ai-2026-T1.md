# Researcher Brief T1: Tooling Landscape

## Topic
Local-first AI tooling for desktop in 2026: Ollama, LM Studio, llama.cpp, Apple MLX — architecture, features, current state.

## Your deliverable
Write `outputs/.drafts/local-ondevice-ai-2026-research-T1.md` with structured notes covering all the questions below. Every claim must have a source URL inline. If a source is unavailable, note it as blocked.

## Questions to answer

1. **llama.cpp** — What is it? Current capabilities in 2026: supported backends (Metal, CUDA, Vulkan, CPU), quantization formats (GGUF, Q4_K_M, Q8, etc.), context window support, multi-GPU, server mode. GitHub star count / community size. Latest notable release or feature.

2. **Ollama** — What is it? Architecture (wraps llama.cpp?). Supported platforms. Model library. REST API shape. Docker support. Notable 2025–2026 features (vision models, tool calling, multimodal). Pricing/licensing.

3. **LM Studio** — What is it? GUI vs headless. Local server mode. Supported backends. Model hub integration. Notable 2025–2026 features. Pricing/licensing (free vs paid).

4. **Apple MLX** — What is it? How does it differ from llama.cpp on Apple Silicon? What frameworks build on it (mlx-lm, MLX Swift)? Performance claims vs llama.cpp Metal backend. Community tools (MLX Community on HuggingFace).

5. **Other notable tools** — Jan.ai, GPT4All, AnythingLLM, llamafile, whisper.cpp — brief status in 2026.

6. **Ecosystem convergence** — Do these tools interoperate? Can a model downloaded for Ollama be used in LM Studio? What formats act as the common denominator?

## Search strategy
Use web search with queries like:
- "Ollama 2025 2026 features changelog"
- "LM Studio 2025 update local server"
- "llama.cpp latest release 2025 2026 GGUF"
- "Apple MLX vs llama.cpp performance 2025"
- "llamafile 2025 status"
- site:github.com/ggerganov/llama.cpp
- site:ollama.com

Fetch official docs pages and recent changelog/release pages. Do NOT fetch PDF files.

## Output format
Structured markdown with:
- One section per tool
- Source URLs inline for every factual claim
- A "gaps / could not verify" section at the end
