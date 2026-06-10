# Direct Research Notes: Local/On-Device AI for Desktop in 2026

**Date:** 2026-06-10  
**Method:** Direct source fetching (researcher subagents blocked — Feynman runtime module error)  
**Search terms tried:** web_search unavailable (Exa rate-limited, Perplexity/Gemini no API key configured)  
**Sources fetched:** Official GitHub repos, official docs, official blogs, official library pages

---

## Sources Consulted

1. https://ollama.com/blog — Ollama blog
2. https://github.com/ollama/ollama/releases — Ollama release notes
3. https://github.com/ollama/ollama/blob/main/README.md — Ollama README
4. https://docs.ollama.com/openai — Ollama OpenAI compat docs
5. https://docs.ollama.com/gpu — Ollama GPU support docs
6. https://docs.ollama.com/faq — Ollama FAQ
7. https://ollama.com/privacy — Ollama Privacy Policy
8. https://github.com/ggml-org/llama.cpp/blob/master/README.md — llama.cpp README
9. https://github.com/ggml-org/llama.cpp/releases — llama.cpp releases
10. https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md — quantization guide + benchmarks
11. https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md — performance tips
12. https://github.com/ml-explore/mlx-lm/blob/main/README.md — mlx-lm README
13. https://lmstudio.ai/docs — LM Studio docs overview
14. https://lmstudio.ai/docs/api/openai-api — LM Studio OpenAI compat
15. https://lmstudio.ai/docs/developer/core/headless — LM Studio headless
16. https://lmstudio.ai/blog/0.4.0 — LM Studio 0.4.0 release post
17. https://lmstudio.ai/privacy — LM Studio privacy policy
18. https://github.com/mudler/LocalAI/blob/master/README.md — LocalAI README
19. https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md — llamafile README
20. https://huggingface.co/microsoft/phi-4 — Phi-4 model card
21. https://ollama.com/library/gemma4 — Gemma 4 model page
22. https://ollama.com/library/qwen3 — Qwen3 model page
23. https://ollama.com/library/llama3.3 — Llama 3.3 model page
24. https://ollama.com/library/deepseek-r1 — DeepSeek-R1 model page

---

## T1: Tooling Landscape

### llama.cpp
- **Source:** https://github.com/ggml-org/llama.cpp/blob/master/README.md; https://github.com/ggml-org/llama.cpp/releases
- C/C++ LLM inference library by Georgi Gerganov (ggml-org/llama.cpp)
- Latest build: b9585 (rolling releases, very active — ~b9000+ implies thousands of builds since start)
- **Backends (2026):** Metal (Apple Silicon, first-class), CUDA 12+13, HIP (AMD ROCm 7.x), Vulkan, SYCL, OpenVINO (in progress), MUSA (Moore Threads), CANN (Ascend NPU), OpenCL (Adreno), IBM zDNN, WebGPU, RPC (remote/distributed). OpenEuler/SYCL temporarily disabled in recent builds.
- **Quantization formats (GGUF):** IQ1_S through Q8_0, including k-quant families (Q4_K_M, Q5_K_M, Q6_K, etc.) and i-quant families. 1.5-bit through 8-bit integer quantization.
- **llama-server:** Built-in HTTP server, OpenAI-compatible API at /v1/chat/completions, port 8080 default. Supports parallel requests (`-np N`), speculative decoding, embeddings, reranking, multimodal via separate mmproj GGUF.
- **Multimodal:** llama-server multimodal support merged (#12898), supports LLaVA, BakLLaVA, Qwen2-VL, MiniCPM, etc. via separate mmproj file.
- **Context window:** Unlimited by design, constrained by KV cache memory.
- **Multi-GPU:** Yes, CPU+GPU hybrid inference (offload `-ngl N` layers). Multi-GPU splits across all available VRAM.
- **Models supported:** Very broad — Llama (all versions), Mistral, Mixtral, Gemma, Qwen, Phi, DeepSeek, GLM, Falcon, Command-R, many others. MXFP4 (gpt-oss) support added via NVIDIA collaboration.
- **Hot topics (2026):** gpt-oss/MXFP4 native support; Hugging Face cache migration (`-hf` models now in standard HF cache); built-in WebUI; llama.vscode / llama.vim for FIM completions.
- **Ecosystem:** Bindings for Python, Go, Node.js, Rust, C#, Java, Swift, Dart, Flutter, Ruby, Zig, etc. UIs include Ollama, LM Studio, LocalAI, GPT4All, Jan, llamafile.
- **License:** MIT

### Ollama
- **Source:** https://github.com/ollama/ollama/releases; https://github.com/ollama/ollama/blob/main/README.md
- **Version:** v0.30.7 (latest as of June 2026)
- **Architecture:** Go application wrapping llama.cpp + MLX (Apple Silicon). Has a REST API server. tray app on macOS/Windows.
- **Backend:** Primary = llama.cpp. v0.30.0 "improved compatibility and performance using llama.cpp". MLX engine for Apple Silicon in preview (March 2026 blog post).
- **Key 2025-2026 features:**
  - March 2026: MLX-powered backend preview for Apple Silicon — "fastest way to run Ollama on Apple silicon"
  - May 2026: `ollama launch omp` (Oh My Pi AI agent), Gemma 4 QAT weights support, MLX embedding layers with NVFP4 global scale
  - May 2026: Gemma 4 12B/26B MoE/31B support
  - January 2026: OpenAI Codex CLI support via `ollama launch codex`
  - v0.24.0: Codex App integration, MLX sampler rework
  - `ollama launch` integrations: Claude Code, Codex, Copilot CLI, Droid, OpenCode, OpenClaw (WhatsApp/Telegram/Slack/Discord)
  - Hermes Desktop agent UI via `ollama launch hermes-desktop`
- **Model library:** Gemma 4, Qwen3, Llama 3.3, DeepSeek-R1, Nemotron-3-Ultra, Phi-4, etc.
- **Platforms:** macOS (arm64 + x64), Windows (native), Linux (x64 + arm64), Docker, Arch Linux (pacman), Homebrew, Nix
- **API port:** 11434
- **GPU support:** NVIDIA (CUDA, compute capability 5.0+), AMD (ROCm v7, Vulkan), Apple Silicon (Metal), Intel Vulkan
- **Concurrent requests:** `OLLAMA_NUM_PARALLEL`, KV cache quantization (f16/q8_0/q4_0), Flash Attention optional
- **License:** MIT
- **Privacy:** Fully local. No prompts/responses seen by Ollama. Collects only: model download metadata, app version for update checks, IP. `disable_ollama_cloud` flag available. Source: https://ollama.com/privacy

### LM Studio
- **Source:** https://lmstudio.ai/docs; https://lmstudio.ai/blog/0.4.0; https://lmstudio.ai/docs/api/openai-api
- GUI application + `llmster` headless daemon (since v0.4.0)
- **Backends:** llama.cpp (all platforms) + MLX (Apple Silicon). Runtime managed via `lms runtime update llama.cpp` / `lms runtime update mlx`
- **Platforms:** macOS (Apple Silicon + x64), Windows (x64 + arm64), Linux (x64)
- **Key 2025-2026 features (v0.4.0):**
  - `llmster` headless daemon: runs without GUI, can be deployed on servers/CI
  - Parallel inference with continuous batching (up to N concurrent requests per model)
  - New stateful REST API `/v1/chat` with `previous_response_id` for multi-turn
  - MCP server support (local MCPs, gated by permission keys)
  - Python SDK (lmstudio-python), TypeScript SDK (lmstudio-js), CLI (lms)
  - LM Link: cross-device AI workload routing
  - JIT model loading (models load on first API call, auto-unload after inactivity)
  - Permission keys for API access control
- **OpenAI-compatible endpoints:** /v1/models, /v1/responses, /v1/chat/completions (text+images), /v1/completions, /v1/embeddings, /v1/images/generations (experimental). Port 1234 default.
- **Pricing:** Free app; no subscription for local use
- **Privacy:** Chats/messages/documents never transmitted. Only: device info on update check, anonymized search queries on model download. No personal IDs. Source: https://lmstudio.ai/privacy

### Apple MLX
- **Source:** https://github.com/ml-explore/mlx-lm/blob/main/README.md; https://github.com/ml-explore/mlx/releases
- Apple's array framework for Apple Silicon, exploits unified memory directly
- **mlx-lm:** Python package for text gen and fine-tuning on Apple Silicon
- **MLX Community on HuggingFace:** Thousands of models pre-converted in 4-bit, 8-bit, bf16 formats. Default: `mlx-community/Llama-3.2-3B-Instruct-4bit`
- **Key features:** HuggingFace Hub integration, quantization + upload, LoRA/full fine-tuning, distributed inference (`mx.distributed`), rotating KV cache, prompt caching
- **Large model support:** macOS 15+ required for memory wiring of large models. `sudo sysctl iogpu.wired_limit_mb=N` to increase limit.
- **Ollama integration:** Ollama uses MLX as primary backend on Apple Silicon since v0.30.0 preview
- **LM Studio integration:** MLX runtime available alongside llama.cpp runtime
- **LocalAI integration:** MLX backend in LocalAI since August 2025
- **Key difference vs llama.cpp Metal:** MLX uses Metal/MPS natively and exploits unified memory architecture more directly; llama.cpp Metal backend also works well but MLX may outperform for some model/operation combos (Ollama blog claims "fastest way" on Apple Silicon)
- **Requires:** macOS, Apple Silicon chip (M-series); not available on x86

### llamafile (Mozilla)
- **Source:** https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md
- Single-file executable combining llama.cpp + Cosmopolitan Libc
- Current: v0.10.x (new build system since 0.10.0, better llama.cpp alignment)
- Also ships **whisperfile** (whisper.cpp-based speech-to-text)
- Runs on macOS, Linux, BSD, Windows (under 4GB only on Windows)
- Quick start: download .llamafile, chmod +x, run
- No installation required — maximum portability
- Note: Windows files >4GB can't run as executables; use llamafile binary + external GGUF instead

### LocalAI
- **Source:** https://github.com/mudler/LocalAI/blob/master/README.md
- **Version:** 4.3.0 (May 2026)
- Open-source, 36+ backends (llama.cpp, vLLM, transformers, whisper.cpp, diffusers, MLX, MLX-VLM, etc.)
- **APIs:** Drop-in OpenAI + Anthropic + ElevenLabs APIs
- **Key 2025-2026 features:**
  - 4.3.0 (May 2026): llama.cpp prompt cache on by default, per-API-key usage attribution, distributed v3 per-request replica routing
  - 4.2.0 (May 2026): voice recognition, face recognition + antispoofing, speaker diarization, Ollama API drop-in, video generation, vLLM at feature parity, 11 new backends
  - 4.1.0 (April 2026): distributed cluster with VRAM-aware smart routing, OIDC multi-user, in-UI fine-tuning with TRL, on-the-fly quantization
  - 4.0.0 (March 2026): Agenthub, React UI rewrite, MCP Apps, WebRTC realtime audio, MLX-distributed
  - August 2025: MLX, MLX-VLM, Diffusers, llama.cpp for Apple Silicon
- **Architecture:** Small core, backends as OCI images pulled on-demand. Install only what you use.
- Port 8080 default
- **License:** MIT

### GPT4All
- Listed in llama.cpp UIs (`nomic-ai/gpt4all`, MIT). Not directly researched in this session.

### Jan.ai
- Listed as a UI in llama.cpp ecosystem (`janhq/jan`, AGPL). Not directly researched.

### Ecosystem Interoperability
- **GGUF is the universal format.** Models downloaded for Ollama (stored as GGUF blobs) can in principle be used directly with llama-server or llama-cli.
- Ollama models are stored at `~/.ollama/models` as GGUF blobs; can be extracted for direct llama.cpp use via `akx/ollama-dl` tool.
- LM Studio downloads GGUF from HuggingFace; those same files work with llama.cpp directly.
- MLX uses SafeTensors format (different from GGUF). MLX Community provides pre-quantized MLX models on HuggingFace.
- llamafile ships GGUF weights embedded in the executable but supports external GGUF weights.

---

## T2: Model Capabilities vs Frontier

### Top Local Models in 2026

**Phi-4 (Microsoft, 14B)**
- Source: https://huggingface.co/microsoft/phi-4
- Architecture: Dense decoder-only transformer, 14B params, 16K context
- License: MIT
- Benchmarks vs larger models (OpenAI SimpleEval framework):
  - MMLU: 84.8 (vs GPT-4o 88.1, GPT-4o-mini 81.8)
  - GPQA: 56.1 (beats GPT-4o 50.6 — notable for a 14B model)
  - MATH: 80.4 (vs GPT-4o 74.6, Qwen2.5-72B 80.0)
  - HumanEval: 82.6 (vs GPT-4o 90.6, GPT-4o-mini 86.2)
  - MGSM: 80.6
  - SimpleQA: 3.0 (very weak — factual knowledge limitation)
  - DROP: 75.5
- Training: 9.8T tokens, heavily synthetic data focused on reasoning
- Optimized for memory/compute-constrained environments
- Training data cutoff: June 2024

**Gemma 4 (Google, E2B/E4B/12B/26B MoE/31B)**
- Source: https://ollama.com/library/gemma4
- All variants: multimodal (text + image; small models also audio), 128K-256K context
- E2B (2.3B effective / 5.1B with embeddings), E4B (4.5B effective / 8B with embeddings)
- Benchmarks (AIME 2026 — frontier-class for larger variants):
  - Gemma4-31B: MMLU Pro 85.2, AIME 2026 89.2%, LiveCodeBench v6 80.0%, Codeforces ELO 2150, GPQA Diamond 84.3%
  - Gemma4-26B MoE: AIME 2026 88.3%, LiveCodeBench 77.1%, Codeforces ELO 1718, GPQA 82.3%
  - Gemma4-E4B: AIME 2026 42.5%, LiveCodeBench 52.0%, GPQA 58.6%
  - Gemma4-E2B: AIME 2026 37.5%, LiveCodeBench 44.0%, GPQA 43.4%
- QAT (Quantization-Aware Training) variants available — dramatically reduce memory while preserving performance
- Designed: "Optimized for On-Device" for smaller variants

**Qwen3 (Alibaba, 0.6B–235B)**
- Source: https://ollama.com/library/qwen3
- Dense + MoE family. Key sizes: 0.6B (523 MB), 1.7B, 4B (2.5 GB, 256K ctx), 8B (5.2 GB), 14B (9.3 GB), 30B MoE (19 GB), 32B (20 GB), 235B MoE (142 GB)
- Supports tools + thinking (chain-of-thought reasoning) natively
- Qwen3-235B-A22B competes with DeepSeek-R1, o1, o3-mini, Grok-3, Gemini-2.5-Pro per Alibaba blog
- Qwen3-30B-A3B: outcompetes QwQ-32B with 10x fewer activated parameters
- Qwen3-4B can rival Qwen2.5-72B-Instruct performance
- 100+ language support

**DeepSeek-R1 (DeepSeek, distilled variants)**
- Source: https://ollama.com/library/deepseek-r1
- R1-0528 update: "significantly improved reasoning and inference capabilities...approaching O3 and Gemini 2.5 Pro"
- Distilled variants: 1.5B, 7B, 8B (R1-0528-Qwen3-8B), 14B, 32B, 70B (Llama base), 671B (full)
- MIT license
- Special strength: chain-of-thought reasoning, math, programming, logical inference

**Llama 3.3 (Meta, 70B)**
- Source: https://ollama.com/library/llama3.3
- "Similar performance compared to Llama 3.1 405B model" — 70B at 405B-class capability
- Text-only (no vision)
- 8 language support
- Tool use, long context

### Capability vs Frontier Gap Assessment

**Where local models are strong (2026):**
- Reasoning/math: Phi-4-14B beats GPT-4o on GPQA (56.1 vs 50.6). DeepSeek-R1 distills approaching O3. Gemma4-31B 89.2% on AIME 2026.
- Coding: Gemma4-31B LiveCodeBench v6 80.0%, Codeforces ELO 2150. Competitive with frontier for code generation.
- Instruction following: Qwen3 and Gemma4 strong on IFEval-type tasks
- Tool calling: Qwen3 (all sizes), Gemma4 (native function calling), Llama 3.3 — all support OpenAI-format tool calls
- Reasoning with thinking mode: DeepSeek-R1, Qwen3 (thinking toggle), Gemma4 (thinking mode)

**Where local models lag frontier:**
- Factual knowledge: Phi-4 SimpleQA 3.0 vs GPT-4o 39.4 — very large gap
- Edge cases in complex reasoning: frontier still consistently higher on hardest benchmarks
- Multimodal quality: frontier vision models still ahead for complex visual tasks
- Long-context reasoning: KV cache limits on laptop hardware constrain practical context length
- Non-English: frontier models generally stronger on low-resource languages
- Agents on complex multi-step tasks: local models make more errors in extended agentic pipelines

**The key insight for 2026:** The capability gap for coding, reasoning, and instruction-following has narrowed dramatically. A 14B model (Phi-4) or 31B model (Gemma4-31B) can perform specific tasks at or near frontier level. The persistent gaps are factual knowledge breadth and complex multi-hop reasoning under novel conditions.

---

## T3: Hardware Realities

### Quantization Size Requirements (Llama-3.1-8B)
- Source: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- Original 8B FP16: ~15 GB disk/RAM
- Q4_K_M: 4.58 GiB (most common practical choice)
- Q5_K_M: 5.33 GiB
- Q8_0: 7.95 GiB
- F16: 14.96 GiB

### Quantization for Larger Models (Llama-3.1)
- Source: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- 8B Q4_K_M: 4.9 GB
- 70B Q4_K_M: 43.1 GB
- 405B Q4_K_M: 249.1 GB

### Benchmark: Llama-3.1-8B text generation t/s (on unspecified GPU, likely high-end workstation)
- Source: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- Note: benchmark machine context not fully specified in this source; appears to be a server GPU
- Q4_K_M: 71.93 t/s generation
- Q5_K_M: 67.23 t/s generation
- Q8_0: 50.93 t/s generation
- F16: 29.17 t/s generation
- (Inference speed inversely correlates with quantization size due to memory bandwidth)

### A6000 (48GB VRAM workstation) benchmark example
- Source: https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md
- 30B model Q4, 7 CPU cores, A6000 48GB:
  - CPU only: 1.7 t/s
  - GPU full offload: 8.7 t/s (7 threads), 9.1 t/s (4 threads)
  - This is a large model on a professional GPU; laptop GPUs are slower

### Apple Silicon Inference (Ollama/MLX)
- Source: Ollama README llama-bench output example — qwen2 1.5B Q4_0 on Metal+BLAS:
  - `pp512` (prompt processing 512 tokens): 5765.41 ± 20.55 t/s
  - `tg128` (text generation 128 tokens): 197.71 ± 0.81 t/s
  - This is a 1.5B model; larger models scale down by parameter count
- Ollama blog (March 2026): MLX-powered backend is "the fastest way to run Ollama on Apple silicon"
- MLX memory wiring (macOS 15+) allows large models to run faster via `iogpu.wired_limit_mb`
- MLX uses unified memory — no VRAM limit separate from RAM

### Key Hardware Rules of Thumb (inference from sources)
- **Apple Silicon M-series:** Unified memory means RAM = effective VRAM. M1 MacBook Air 16 GB can run 7B-13B Q4. M3 MacBook Pro 36GB can run 70B Q4 (43 GB is too large; needs 64GB+ for Llama 70B Q4). M4 MacBook Pro with 64 GB can run 70B models comfortably.
- **VRAM limits for discrete GPUs (from model size math):**
  - 8 GB VRAM: fits 7B-8B Q4_K_M (4.9 GB), not 13B (7.9 GB Q4 would be ~8.1 GB — marginal)
  - 12 GB VRAM: fits up to 13B Q4, can do 8B Q8
  - 24 GB VRAM: fits 34B Q4 (~21 GB), not 70B
- **GPU hybrid offload:** llama.cpp supports partial offload when model > VRAM. Tokens/sec degrades. Ollama shows `48%/52% CPU/GPU` for partial offload.
- **CPU-only:** Very slow for 7B+. A6000 benchmark shows CPU-only gets 1.7 t/s on 30B; for 7B CPU-only, expect ~5-15 t/s depending on quantization and CPU speed.

### Context Length and Memory
- Source: https://docs.ollama.com/faq
- Ollama default context: 4096 tokens
- Flash Attention (`OLLAMA_FLASH_ATTENTION=1`) significantly reduces memory as context grows
- KV cache quantization: `OLLAMA_KV_CACHE_TYPE` — f16 (default), q8_0 (half memory), q4_0 (quarter memory)
- KV cache scales linearly with context length: 2K context × 4 parallel = 8K context memory usage
- For 128K context windows: KV cache alone can use several GB; Flash Attention essential

### NVIDIA GPU Support (Ollama)
- Source: https://docs.ollama.com/gpu
- Compute capability 5.0+ supported
- RTX 40xx (compute 8.9): RTX 4060-4090 — all supported
- RTX 30xx (compute 8.6): RTX 3050-3090 — all supported
- RTX 50xx (compute 12.0): RTX 5060-5090 — supported

### AMD GPU Support
- AMD Ryzen AI (integrated): Ryzen AI Max+ 395, Ryzen AI Max 390, etc. — supported on Linux via ROCm v7
- AMD Radeon RX 9070 XT/9070 GRE/9070 — supported (gfx1201/1200 in ROCm 7.x)

---

## T4: Privacy + OpenAI-Compatible Gateways

### Privacy: Tool-by-Tool

**Ollama**
- Source: https://ollama.com/privacy; https://docs.ollama.com/faq
- "Ollama runs locally. We don't see your prompts or data when you run locally."
- Local inference: zero data transmission. Prompts stay on device.
- Cloud-hosted models: prompts processed transiently, not stored, not used for training
- Data collected: device/browser info on update checks, model download metadata, IP address (CDN), cookies on website
- NOT collected: prompt content, response content, chat history
- `disable_ollama_cloud: true` in `~/.ollama/server.json` for fully local-only mode
- No data selling

**LM Studio**
- Source: https://lmstudio.ai/privacy
- "None of your messages, chat histories, and documents are ever transmitted from your system"
- Only transmits: device/app info on update check; anonymized search queries when downloading models
- No personal identifiers, no behavioral tracking
- Cannot fulfill data subject access requests (no way to identify individual users)
- GDPR compliant, CCPA compliant
- Company: Element Labs, Inc. (Delaware)

**llama.cpp**
- Source: https://github.com/ggml-org/llama.cpp/blob/master/README.md
- Pure C/C++ library with no networking code in inference path
- No telemetry, no analytics, no call-home
- GGUF files are static model weights — no dynamic updates
- The only network operations: optional `-hf` flag to download from HuggingFace

**Apple MLX / mlx-lm**
- Source: https://github.com/ml-explore/mlx-lm/blob/main/README.md
- Pure framework library; no telemetry
- mlx-lm downloads models from HuggingFace at load time (network only for model download)
- All inference in unified memory, no data leaves device

**Remaining threat model for local AI:**
- Model supply chain: poisoned/backdoored model weights (no checksums enforced by Ollama/LM Studio on all models)
- Prompt injection via documents/web content fed to model
- Jailbreaks still work on all local models (no RLHF safety guarantees as strong as frontier)
- If tool-calling bridges to external services, those services see your data

### HIPAA/GDPR Relevance
- None of the tools (Ollama, LM Studio, llama.cpp) carry HIPAA BAAs or SOC2 certifications
- LocalAI positions for enterprise deployment (OIDC, multi-user, API keys) but no explicit compliance certs found in docs
- "Privacy-first" local AI is not inherently HIPAA-compliant — audit logging, access controls, model governance are still needed

### OpenAI-Compatible Local Gateways

**Ollama API (port 11434)**
- Source: https://docs.ollama.com/openai
- **Endpoints supported:**
  - `POST /v1/chat/completions` — chat, streaming, JSON mode, vision, tools, thinking/reasoning control, logprobs
  - `POST /v1/completions` — completions, streaming
  - `GET /v1/models` / `GET /v1/models/{model}` — model listing
  - `POST /v1/embeddings` — embeddings (string, array of strings, tokens)
  - `POST /v1/images/generations` — experimental image generation
  - `POST /v1/responses` — OpenAI Responses API (added v0.13.3), streaming, function calling, reasoning summaries. NON-stateful (no `previous_response_id`)
- **Supported fields (chat/completions):** model, messages (text + images), stream, temperature, top_p, max_tokens, tools, tool_choice, frequency_penalty, presence_penalty, response_format, seed, stop, logit_bias, n, reasoning_effort
- **What's missing:** Assistants API, Threads API, Files API, Audio API, fine-tuning API, real-time API (stateful)
- **Model name aliasing:** `ollama cp llama3.2 gpt-3.5-turbo` to alias

**LM Studio API (port 1234)**
- Source: https://lmstudio.ai/docs/api/openai-api
- **Endpoints:** /v1/models, /v1/responses, /v1/chat/completions (text+images), /v1/completions, /v1/embeddings, /v1/images/generations (experimental)
- Also has native `/v1/chat` (stateful, `previous_response_id`, with local MCP access)
- `lms server start` to start; JIT loading optional
- **Client example:**
  ```python
  from openai import OpenAI
  client = OpenAI(base_url="http://localhost:1234/v1")
  ```

**llama-server (llama.cpp)**
- Source: https://github.com/ggml-org/llama.cpp/blob/master/README.md
- OpenAI API compatible HTTP server, port 8080 default
- `llama-server -m model.gguf --port 8080`
- Supports chat completions, completions, embeddings, reranking, multimodal (with mmproj)
- Constrained output (grammars/JSON), speculative decoding, parallel decoding (`-np N`)
- Also includes WebUI at localhost:8080

**LocalAI (port 8080)**
- Source: https://github.com/mudler/LocalAI/blob/master/README.md
- Drop-in OpenAI + Anthropic + ElevenLabs APIs
- Also now includes Ollama API drop-in (v4.2.0)
- 36+ backends
- Full enterprise features (multi-user, quotas, OIDC)

### Client SDK Compatibility
- **OpenAI Python SDK:** Change `base_url`. Works with Ollama, LM Studio, llama-server, LocalAI.
- **OpenAI JS/TS SDK:** Change `baseUrl`. Same compatibility.
- **LangChain:** Official Ollama integration at `python.langchain.com/docs/integrations/chat/ollama/`
- **LlamaIndex:** Official Ollama integration at `docs.llamaindex.ai/en/stable/examples/llm/ollama/`
- **Spring AI:** Official Ollama support
- **Firebase Genkit:** Announced Ollama support at Google IO 2024
- **LiteLLM:** Supports Ollama as a provider (unified API for 100+ LLM providers)
- **Semantic Kernel (Microsoft):** Official Ollama connector
- **Vercel AI SDK:** Unofficial but widely used patterns

### Function/Tool Calling Over Local API
- Ollama: `/v1/chat/completions` supports `tools` and `tool_choice` fields — standard OpenAI format
- Models that support it well: Qwen3 (all sizes), Gemma4, Llama 3.3, DeepSeek-R1 distills
- LM Studio: same via OpenAI compat endpoint, also native MCP through `/v1/chat`
- llama-server: supports tools via grammar constraints and/or native tool call formats

### Developer Integration Patterns (Desktop)
- **Electron + Ollama:** Browser extension uses `OLLAMA_ORIGINS=chrome-extension://*`; Electron app connects to localhost:11434; WebSocket not needed
- **Browser Extension + Local API:** `OLLAMA_ORIGINS` env var controls CORS. Set to include `moz-extension://*` for Firefox.
- **Native macOS app + MLX:** Direct Python/Swift binding to mlx-lm; no server required; model in unified memory
- **Headless CI/Server:** LM Studio llmster (`lms daemon up`) or Ollama Docker container
- **Multi-device:** LM Studio LM Link routes workloads across devices (laptop → GPU rig)

---

## Summary / Open Questions

1. **Hardware benchmarks on specific laptop GPUs** (RTX 4060 8GB, M3 MacBook Pro, etc.) were NOT found in official docs. The quantize README benchmarks appear to be on a high-end workstation GPU. Actual laptop tok/s numbers are community-reported and vary widely.

2. **Web search was blocked** — could not verify community benchmarks (LocalLLaMA posts, LM Studio blog benchmarks, etc.)

3. **LM Studio pricing:** The app appears free for local use; no subscription. Cloud routing via LM Link may have commercial terms not reviewed.

4. **GPT4All and Jan.ai** status not directly verified in this session.

5. **Intel Core Ultra NPU integration** with Ollama/llama.cpp not confirmed. OpenVINO backend in llama.cpp is listed as "in progress".
