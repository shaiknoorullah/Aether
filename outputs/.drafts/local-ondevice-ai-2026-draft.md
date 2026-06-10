# Local-First and On-Device AI for Desktop Apps in 2026

**Research date:** 2026-06-10  
**Scope:** Tooling landscape, model capability vs frontier, hardware realities, privacy tradeoffs, OpenAI-compatible local gateways, and practical laptop ceiling.

---

## Executive Summary

Local AI inference on consumer hardware has crossed a meaningful threshold in 2026. The tooling stack — anchored by llama.cpp (build b9585), Ollama (v0.30.7), LM Studio (v0.4.0), and Apple MLX — is stable, well-integrated, and increasingly developer-ergonomic. Model capability for coding, reasoning, and structured tasks is approaching frontier quality in the 14B–31B parameter range. **A modern laptop can realistically run useful AI locally; the practical ceiling depends on hardware class more than software.**

Key findings:

- **All four major tools expose OpenAI-compatible REST APIs.** Any app built against `openai.baseURL = "http://localhost:11434/v1"` works with Ollama, LM Studio, llama-server, and LocalAI.
- **Privacy is genuinely strong.** Local inference means zero prompt/response exposure to vendors. Ollama, LM Studio, and llama.cpp send no prompt content over the network by design.
- **Model gaps narrow but persist.** Phi-4-14B beats GPT-4o on GPQA; Gemma4-31B scores 89.2% on AIME 2026. However, factual recall, complex multi-hop agentic tasks, and low-resource languages remain inferior to frontier.
- **Apple Silicon has a structural advantage.** Unified memory eliminates the VRAM ceiling. M4 MacBook Pro 64 GB runs 70B models. M3 36 GB runs up to ~34B.
- **The practical floor** for useful local AI: a laptop with 16 GB RAM (Apple Silicon) or 8 GB VRAM (discrete GPU) can run 7B–8B models at interactive speed (>10 t/s generation).

---

## 1. Tooling Landscape

### 1.1 llama.cpp

llama.cpp ([github.com/ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)) is the foundational C/C++ inference engine that powers most of the local AI ecosystem. As of June 2026, it is at build b9585 and actively maintained with near-daily releases.

**Architecture and capability:**
- Pure C/C++ with no mandatory dependencies. Builds on macOS, Linux, Windows, Android.
- Apple Silicon is a "first-class citizen" — ARM NEON, Accelerate, and Metal backends.
- GPU backends: Metal (Apple), CUDA 12/13 (NVIDIA), HIP/ROCm 7 (AMD), Vulkan (cross-platform), SYCL (Intel), OpenVINO (Intel CPUs/GPUs/NPUs, in progress), MUSA (Moore Threads), CANN (Ascend NPU), OpenCL (Adreno), WebGPU.
- CPU inference via AVX/AVX2/AVX512/AMX (x86), ARM NEON/SVE (ARM), RVV/ZVFH (RISC-V).
- CPU+GPU hybrid: layers exceeding VRAM are offloaded to CPU RAM with partial speedup.
- Multi-GPU: model spread across all available VRAM when needed.
- Quantization: 1.5-bit through 8-bit integer, k-quant (Q4_K_M, Q5_K_M, Q6_K, Q8_0) and i-quant (IQ1–IQ4) families. GGUF is the universal model format.

**`llama-server`:** Lightweight HTTP server with OpenAI-compatible API (`/v1/chat/completions`, port 8080). Supports parallel decoding, speculative decoding, grammar-constrained output, multimodal inference (via separate mmproj GGUF), embeddings, and reranking. Includes a built-in Web UI. Added: gpt-oss/MXFP4 native support (NVIDIA collaboration), HuggingFace cache migration for `-hf` models.

**Ecosystem:** Nearly every other local AI tool wraps or depends on llama.cpp. Python bindings (`llama-cpp-python`), Node.js, Rust, Go, C#, Swift, and others are available. UIs include Ollama, LM Studio, LocalAI, GPT4All, Jan, and llamafile.

**License:** MIT.

### 1.2 Ollama

Ollama ([ollama.com](https://ollama.com), v0.30.7 as of June 2026) is the most widely used local AI server. It wraps llama.cpp as its primary backend, with an MLX engine for Apple Silicon added in preview (v0.30.0, March 2026).

**Key features:**
- REST API at port 11434 with OpenAI-compatible `/v1/` endpoints.
- Model library at [ollama.com/library](https://ollama.com/library): Gemma 4, Qwen3, Llama 3.3, DeepSeek-R1, Phi-4, Nemotron-3-Ultra, and hundreds more.
- Cross-platform: macOS, Windows, Linux, Docker, Arch Linux (pacman), Homebrew, Nix.
- `ollama launch` integrations: Claude Code, OpenAI Codex, Copilot CLI, Hermes Desktop, OpenCode, OpenClaw (Telegram/WhatsApp/Slack/Discord), Cline, and more.
- Gemma 4 QAT (Quantization-Aware Training) weights available, reducing memory while preserving performance.
- Concurrent inference: `OLLAMA_NUM_PARALLEL`, Flash Attention, KV cache quantization.
- Community: Python library (`ollama-python`), JS library (`ollama-js`), and SDKs across 20+ languages.

**Architecture note:** As of v0.30.0, Ollama uses llama.cpp as a supplementary engine on Apple Silicon alongside MLX. This gives broader model format coverage (GGUF from HuggingFace, custom fine-tunes) while leveraging MLX for peak performance on supported models.

**License:** MIT.

### 1.3 LM Studio

LM Studio ([lmstudio.ai](https://lmstudio.ai)) is a GUI application + headless daemon for local model inference. As of v0.4.0 it provides both a polished desktop UI and server-grade deployment.

**Key features:**
- **Backends:** llama.cpp (all platforms) + MLX (Apple Silicon). Runtime managed separately.
- **llmster daemon:** Headless/GUI-free operation. `lms daemon up` starts the background process for CI, servers, or power-user local use.
- **OpenAI-compatible API** (port 1234): `/v1/models`, `/v1/responses`, `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/images/generations` (experimental).
- **Stateful `/v1/chat`** endpoint with `previous_response_id` for multi-turn and local MCP server access.
- **SDKs:** Python (`lmstudio-python`), TypeScript (`lmstudio-js`), CLI (`lms`).
- **LM Link:** Cross-device workload routing (laptop to GPU rig).
- **JIT model loading:** Models load on first API call, auto-unload after inactivity.
- **Parallel inference:** Continuous batching for multiple concurrent requests (llama.cpp engine; MLX pending).
- MCP server integration, permission keys for API access control.

**License:** Proprietary but free for local use.

### 1.4 Apple MLX

Apple MLX ([github.com/ml-explore/mlx](https://github.com/ml-explore/mlx)) is Apple's array framework for ML on Apple Silicon, exploiting unified memory to eliminate separate CPU/GPU data copies. `mlx-lm` is the high-level Python package for text generation and fine-tuning.

**Key features:**
- Integration with HuggingFace Hub: thousands of models pre-quantized for MLX in the [MLX Community organization](https://huggingface.co/mlx-community).
- Support for quantization, upload, LoRA/full fine-tuning, distributed inference.
- Rotating KV cache, prompt caching, streaming generation.
- Large model support via memory wiring on macOS 15+ (`sysctl iogpu.wired_limit_mb`).
- Default model: `mlx-community/Llama-3.2-3B-Instruct-4bit`.

**MLX vs llama.cpp Metal backend:** Both run on Apple Silicon via Metal/MPS. Ollama blog (March 2026) describes MLX-powered Ollama as "the fastest way to run Ollama on Apple silicon." The difference is architectural: MLX exploits unified memory more directly and is designed first for Apple Silicon. llama.cpp Metal is general-purpose and supports more hardware. For Apple Silicon laptops, MLX-backed tools (Ollama 0.30+, LM Studio with MLX runtime) are the recommended path.

**Requires:** macOS, Apple Silicon (M-series). Not available on x86 or non-Apple hardware.

### 1.5 Other Notable Tools

**llamafile** ([Mozilla-Ocho/llamafile](https://github.com/Mozilla-Ocho/llamafile), v0.10.x): Combines llama.cpp + Cosmopolitan Libc into a single cross-platform executable. Download, chmod +x, run — no installation. Also ships `whisperfile` for speech-to-text. Windows limitation: files >4GB can't run as executables; use llamafile binary + external GGUF.

**LocalAI** ([mudler/LocalAI](https://github.com/mudler/LocalAI), v4.3.0, May 2026): Open-source, 36+ backends, drop-in OpenAI + Anthropic + ElevenLabs API compatibility, plus Ollama API drop-in (v4.2.0). Multi-user platform (OIDC, API keys, quotas), distributed cluster mode with VRAM-aware routing, agentic capabilities (Agenthub community), WebRTC realtime audio. Designed for enterprise/server deployment but also works locally.

**Ecosystem interoperability:** GGUF is the universal format. Models from Ollama, LM Studio, and HuggingFace GGUF repos are directly interchangeable with llama.cpp. MLX uses SafeTensors (different format — not directly interchangeable without conversion). `akx/ollama-dl` extracts Ollama model blobs for direct llama.cpp use.

---

## 2. Small-Model Capability vs Frontier

### 2.1 Top Local Models in 2026

| Model | Size (Q4) | Context | Highlights |
|-------|-----------|---------|------------|
| Phi-4 | ~8.6 GB | 16K | GPQA 56.1 (beats GPT-4o), MATH 80.4, HumanEval 82.6 |
| Gemma4-31B (dense) | ~20 GB | 256K | AIME 2026 89.2%, LiveCodeBench 80%, Codeforces ELO 2150 |
| Gemma4-26B A4B (MoE) | ~16 GB | 256K | AIME 88.3%, LCB 77.1%, active params only 3.8B — fast |
| Qwen3-32B | ~20 GB | 40K | Thinking + tools, strong coding/reasoning |
| Qwen3-30B-A3B (MoE) | ~19 GB | 256K | Beats QwQ-32B with 10x fewer active params |
| Llama 3.3-70B | ~43 GB | 128K | ~405B-class capability per Meta; 8 languages |
| DeepSeek-R1 distill (32B) | ~20 GB | 128K | Reasoning specialist, approaching O3 on R1-0528 |
| Phi-4 (14B) | ~8.6 GB | 16K | Best-in-class per-size for reasoning |
| Qwen3-8B | 5.2 GB | 40K | Smallest capable tool-calling + thinking model |
| Gemma4-E4B | ~5 GB | 128K | Edge-optimized, multimodal (text+image+audio), 128K ctx |

*Sizes are approximate Q4_K_M equivalents. Exact disk sizes vary by quantization level.*

### 2.2 Benchmark Comparison vs Frontier

Source: Phi-4 model card (HuggingFace), Gemma 4 model card (Ollama library), DeepSeek-R1 model card.

**MMLU:**
- GPT-4o: 88.1 (frontier reference)
- Llama 3.3-70B: 86.3
- Qwen2.5-72B: 85.3
- Phi-4 (14B): 84.8
- GPT-4o-mini: 81.8
- *Gap: ~3 points for a 14B vs. GPT-4o.*

**GPQA (graduate-level science):**
- Phi-4 (14B): **56.1** — beats GPT-4o (50.6) and Llama 3.3-70B (49.1)
- Gemma4-31B: 84.3 (far exceeds any earlier result)
- *This is remarkable: local models now exceed frontier on graduate science questions.*

**MATH / AIME:**
- Gemma4-31B: AIME 2026 89.2%
- Gemma4-26B MoE: AIME 88.3%
- Phi-4: MATH 80.4
- *Frontier-class math performance is achievable locally on appropriate hardware.*

**Coding (LiveCodeBench / HumanEval / Codeforces):**
- Gemma4-31B: LiveCodeBench v6 80.0%, Codeforces ELO 2150
- Gemma4-26B MoE: LCB 77.1%, Codeforces ELO 1718
- GPT-4o HumanEval: 90.6 (still ahead)
- Phi-4 HumanEval: 82.6
- *Code generation quality is competitive with frontier on most practical tasks.*

**Factual knowledge (SimpleQA):**
- GPT-4o: 39.4
- Llama 3.3-70B: 20.9
- GPT-4o-mini: 9.9
- Phi-4 (14B): **3.0** — extremely poor
- *Factual recall remains a major gap for local models.*

### 2.3 Reasoning with Thinking Mode

DeepSeek-R1 (all sizes) and Qwen3 (all sizes) support extended chain-of-thought reasoning with a thinking/non-thinking toggle. Gemma4 has configurable thinking via `<|think|>` in the system prompt.

DeepSeek-R1-0528 (distilled to 8B): "overall performance is now approaching that of leading models, such as O3 and Gemini 2.5 Pro" — per DeepSeek's own description. This is self-reported; third-party verification is not confirmed in this research session.

### 2.4 Tool/Function Calling

Models with reliable tool calling (available locally):
- Qwen3 (all sizes, 0.6B–235B)
- Gemma4 (all variants, "native function-calling support")
- Llama 3.3 (70B)
- DeepSeek-R1 distills

All work via standard OpenAI function-calling format through Ollama's `/v1/chat/completions` with `tools` field.

### 2.5 Multimodal Locally

- **Gemma4 E2B/E4B:** Text + image + audio; optimized for edge/laptop. 128K context.
- **Gemma4 12B/26B/31B:** Text + image; 128K–256K context.
- **Qwen2-VL:** Supported in llama.cpp multimodal via mmproj.
- **Llama 3.2 Vision:** Supported (though Ollama note: llama3.2-vision "not yet supported" in v0.30.0).
- **LLaVA 1.5/1.6:** Long-supported, stable.

For laptop use, Gemma4-E4B (~5 GB) is the most practical multimodal choice.

### 2.6 Persistent Gaps vs Frontier

1. **Factual knowledge breadth:** SimpleQA scores reveal that even 70B local models are far behind frontier on factual recall. GPT-4o 39.4 vs Llama-70B 20.9 vs Phi-4 3.0.
2. **Complex multi-step agentic workflows:** Local models make more compounding errors in 10+ step agentic tasks.
3. **Low-resource languages:** Frontier significantly better.
4. **Context length at quality:** Local models degrade more at long contexts (>32K) due to KV cache pressure.
5. **Novel scientific / legal reasoning:** Frontier still has larger knowledge base.
6. **Consistency under adversarial prompting:** Jailbreaks are easier on local models with weaker safety post-training.

---

## 3. Hardware Realities

### 3.1 Model Memory Footprints (GGUF)

Source: llama.cpp quantize README (Llama-3.1 reference), model page sizes.

| Model | FP16 | Q4_K_M | Q5_K_M | Q8_0 |
|-------|------|--------|--------|------|
| Llama 3.1-8B | ~15 GB | 4.9 GB | 5.33 GB | 7.95 GB |
| 13B (est.) | ~26 GB | ~8.1 GB | ~9.5 GB | ~13 GB |
| 70B | ~141 GB | 43.1 GB | ~50 GB | ~70 GB |
| Qwen3-8B | — | 5.2 GB | — | — |
| Qwen3-14B | — | 9.3 GB | — | — |
| Gemma4-E4B | — | ~5 GB | — | — |
| Gemma4-31B | — | ~20 GB | — | — |

*FP16 and Q4_K_M data for Llama-3.1 from official llama.cpp quantize docs. Other values estimated from model page sizes.*

### 3.2 Quantization Speed vs Quality Tradeoff

Source: llama.cpp quantize README, Llama-3.1-8B benchmarks (test machine appears to be a GPU workstation; exact GPU not confirmed in source).

| Format | Size (GiB) | Gen. t/s | Notes |
|--------|-----------|----------|-------|
| IQ1_S | 1.87 | 79.73 | 2-bit extreme; quality severely reduced |
| Q2_K | 2.95 | 79.85 | Aggressive; noticeable quality loss |
| Q4_K_S | 4.36 | 76.71 | Sweet spot start |
| **Q4_K_M** | **4.58** | **71.93** | **Standard recommended: best quality/size** |
| Q5_K_M | 5.33 | 67.23 | Slightly better quality, ~6% slower |
| Q6_K | 6.14 | 58.67 | Near-lossless; memory-intensive |
| Q8_0 | 7.95 | 50.93 | Near-lossless; slowest for memory bandwidth |
| F16 | 14.96 | 29.17 | Full precision; not practical on laptop |

**Key insight:** Q4_K_M is the standard recommendation because it provides the best quality-per-gigabyte tradeoff. Going to Q8_0 adds ~73% more memory for minimal quality gain and is *slower* due to increased memory bandwidth demands. F16 is 3x larger and 2.5x slower than Q4_K_M at generation.

**Important caveat:** These benchmarks are from a specific test machine (appears GPU workstation). Actual tok/s on laptop GPUs will differ. The *relative* comparisons between formats are meaningful; absolute numbers require hardware-specific benchmarking.

### 3.3 Practical Hardware Tiers

**Tier 1: Apple Silicon (Unified Memory)**

Apple Silicon has a structural advantage because unified memory is accessible to both the CPU and GPU matrix engines. There is no separate VRAM limit.

| Hardware | Unified Memory | Practical Model Ceiling (Q4_K_M) |
|----------|---------------|----------------------------------|
| M1/M2 MacBook Air | 8 GB | 7B (marginal), better with smaller quantized 7B |
| M1/M2 MacBook Air | 16 GB | 7B–13B comfortably |
| M3/M4 MacBook Pro | 24 GB | 13B–20B (Gemma4-12B, Phi-4-14B) |
| M3/M4 MacBook Pro | 36 GB | Up to ~25B (Gemma4-26B MoE Q4) |
| M4 MacBook Pro / Mac Studio | 64 GB | 70B Q4 (43 GB fits); 34B + headroom |
| M4 Mac Studio / Mac Pro | 128 GB | 70B with context; 34B simultaneously |

*Source: Model size math (llama.cpp quantize docs) applied to Apple Silicon memory. Not directly benchmarked in this research session — inferred from official size data.*

Speed on Apple Silicon: MLX-powered Ollama reports "fastest" performance. llama.cpp benchmark example shows qwen2-1.5B-Q4_0 at 197 t/s on Metal+BLAS — but this is a tiny model. Larger models scale down roughly proportionally with parameter count. Expect ~50–100 t/s for 7B Q4 on M3/M4, declining to ~15–30 t/s for 70B on M4-64GB (inference from community data — **not directly verified from official benchmarks in this session**).

**Tier 2: Discrete NVIDIA GPU**

| VRAM | Largest Q4_K_M Model That Fits | Notes |
|------|-------------------------------|-------|
| 8 GB (RTX 4060, 3070) | 7B–8B Q4 (4.9 GB) | 13B too large at Q4; use partial offload for ~13 t/s |
| 12 GB (RTX 4070, 3080) | ~13B Q4 (~8.1 GB) | 14B models like Phi-4 marginal |
| 16 GB (RTX 4080, 3090 Ti) | ~13B Q4 comfortably; ~20B with partial offload |  |
| 24 GB (RTX 3090, 4090) | 34B Q4 (~21 GB); not 70B (43 GB) | For 70B: need 48GB+ VRAM |
| 48 GB (A6000, RTX 6000 Pro) | 70B Q4 (43 GB) fits | Server-class |

Source: Model size math from llama.cpp docs. RTX support confirmed in Ollama GPU docs.

**VRAM overflow (partial offload):** When model > VRAM, llama.cpp/Ollama offload excess layers to CPU RAM. You get slower generation (~2–5x penalty depending on offload ratio) but the model still runs. Ollama shows `48%/52% CPU/GPU` in `ollama ps`. This is the practical path for running 13B on an 8 GB GPU card — slower but functional.

**Tier 3: CPU-Only**

CPU-only inference is practical only for models ≤7B and with adequate quantization (Q4_K_M). For 7B Q4_K_M on a modern 8-core x86 laptop, expect 5–15 t/s generation — usable but slow. The A6000 benchmark example (30B CPU-only: 1.7 t/s) illustrates why CPU-only for larger models is generally impractical for interactive use.

Intel Core Ultra and AMD Ryzen AI chips have NPU units. OpenVINO backend in llama.cpp is listed as "in progress" — NPU acceleration for local LLMs is not yet mature as of this research.

### 3.4 Context Length and KV Cache

- Ollama default context: 4096 tokens. Override with `OLLAMA_CONTEXT_LENGTH`.
- KV cache memory scales linearly with context length.
- With Flash Attention (`OLLAMA_FLASH_ATTENTION=1`): significantly reduces memory as context grows.
- KV cache quantization (`OLLAMA_KV_CACHE_TYPE`): `f16` (default) → `q8_0` (half memory) → `q4_0` (quarter memory, some quality loss).
- 128K context with full f16 KV cache requires significant additional RAM beyond the model weights — on a 16 GB system, running 7B with 128K context may exhaust memory.
- Practical advice: For laptop use, 8K–32K context is feasible; 128K context requires at least 36 GB unified memory or aggressive KV quantization.

### 3.5 Practical Minimum Spec

| Use Case | Minimum Hardware | Model | Expected Speed |
|----------|-----------------|-------|---------------|
| AI code assistant (coding) | 16 GB Apple Silicon | Qwen3-8B or Phi-4 Q4 | 30–80 t/s (inference) |
| Chat assistant | 8 GB VRAM (RTX 4060) | Llama/Qwen 7B Q4 | 30–60 t/s |
| Reasoning / math | 24 GB Apple Silicon | Gemma4-E4B Q4 or DeepSeek-R1-7B | 50+ t/s |
| High-capability local agent | 36–64 GB Apple Silicon | Gemma4-31B or Qwen3-32B Q4 | 15–30 t/s |
| Frontier-approaching local | 64 GB Apple Silicon | Llama 3.3-70B or DeepSeek-R1-70B | 10–20 t/s (inference) |

*Speed estimates are inferences from model size data and community patterns — not from verified hardware-specific benchmarks obtained in this research session.*

---

## 4. Privacy Tradeoffs

### 4.1 Tool Privacy Comparison

| Tool | Prompt/Response Data Transmitted? | Analytics/Telemetry | Model Download Metadata | Pure-Offline Option |
|------|----------------------------------|--------------------|-----------------------|---------------------|
| llama.cpp | Never (no network code) | None | Only if `-hf` flag used | Yes (local GGUF) |
| Ollama (local inference) | Never | None | Minimal: app version, update check, download metadata | Yes (`disable_ollama_cloud`) |
| Ollama (cloud models) | Transient, not stored, not used for training | None | Yes | Yes (avoid cloud models) |
| LM Studio | Never | None | Anonymized search/download queries | Yes (offline after install) |
| Apple MLX | Never | None | HuggingFace download on model load | Yes (local SafeTensors) |
| LocalAI | Never (self-hosted) | None | Backend OCI image pulls | Yes (pre-installed) |

**Sources:** Ollama privacy policy (ollama.com/privacy); LM Studio privacy policy (lmstudio.ai/privacy); llama.cpp README (no networking); mlx-lm README (no telemetry).

### 4.2 The Privacy Guarantee — What It Actually Means

**What is genuinely protected when running locally:**
- Conversation content never leaves the device.
- No vendor can access, log, or train on your prompts.
- No account registration required for offline local inference (Ollama, LM Studio, llama.cpp).
- Air-gap operation possible: download model weights once, then fully offline.

**What is NOT protected — remaining threat surfaces:**
1. **Model supply chain.** GGUF weights downloaded from HuggingFace or Ollama's library are not cryptographically verified at content level (though Ollama does verify model blobs via hash). A poisoned model could behave differently from expected.
2. **Tool calling to external services.** If a local model is given tools that call external APIs (web search, database), data flows through those services.
3. **Prompt injection.** Malicious content in documents or web pages fed to a local model can cause it to exfiltrate data if the model has access to tools.
4. **Jailbreaks.** Local models have weaker or no safety guardrails compared to frontier — easier to elicit harmful output.
5. **Browser extension context.** When Ollama runs as a browser extension backend (via OLLAMA_ORIGINS), the extension's permissions determine what page content reaches the model.

### 4.3 HIPAA/GDPR Note

None of the tools (Ollama, LM Studio, llama.cpp) carry HIPAA BAAs or SOC 2 certifications. Local inference eliminates a major data transmission risk but does not by itself make a system HIPAA-compliant. Audit logging, access controls, model governance, and infrastructure controls are still required.

---

## 5. OpenAI-Compatible Local Gateways

### 5.1 API Surface Comparison

| Tool | Port | /v1/chat/completions | /v1/completions | /v1/embeddings | /v1/models | Tools/Functions | Vision | Streaming | /v1/responses |
|------|------|---------------------|-----------------|----------------|------------|-----------------|--------|-----------|---------------|
| Ollama | 11434 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| LM Studio | 1234 | ✓ | ✓ | ✓ | ✓ | ✓ (via OpenAI) | ✓ | ✓ | ✓ |
| llama-server | 8080 | ✓ | ✓ | ✓ | — | ✓ (grammar) | ✓ (mmproj) | ✓ | — |
| LocalAI | 8080 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |

Sources: Ollama OpenAI compat docs (docs.ollama.com/openai); LM Studio API docs (lmstudio.ai/docs/api/openai-api); llama.cpp README.

### 5.2 Switching to Local: The One-Line Change

For the OpenAI Python SDK:
```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
```

For the OpenAI JS/TS SDK:
```typescript
import OpenAI from 'openai';
const client = new OpenAI({ baseURL: "http://localhost:1234/v1", apiKey: "lmstudio" });
```

Any app targeting `openai.base_url` works against Ollama or LM Studio with no other code changes.

### 5.3 Supported Integrations (Official)

- **LangChain**: Official Ollama integration (`langchain.chat_models.ollama`)
- **LlamaIndex**: Official Ollama integration
- **LiteLLM**: Ollama as a provider (unified proxy for 100+ LLM providers)
- **Semantic Kernel (Microsoft)**: Official Ollama connector
- **Spring AI**: Official Ollama support
- **Firebase Genkit**: Announced Ollama support (Google IO 2024)
- **AutoGPT, crewAI, Haystack, Testcontainers**: All listed in Ollama ecosystem

### 5.4 Function/Tool Calling

Ollama's `/v1/chat/completions` supports the `tools` and `tool_choice` fields in standard OpenAI format. Models that work well:
- Qwen3 (all sizes): Native tool support, all quantization levels
- Gemma4: "Native function-calling support" per model card
- Llama 3.3-70B: Tool-use supported
- DeepSeek-R1 distills: Supported

### 5.5 Model Name Aliasing

Tools expecting specific OpenAI model names (e.g., `gpt-3.5-turbo`) work with aliasing:
```bash
ollama cp llama3.2 gpt-3.5-turbo
```

### 5.6 Browser Extension Integration

For browser extensions connecting to local Ollama:
```bash
OLLAMA_ORIGINS=chrome-extension://*,moz-extension://* ollama serve
```
Ollama binds to 127.0.0.1:11434 by default (local only). For network exposure: `OLLAMA_HOST=0.0.0.0:11434`.

---

## 6. What Realistically Runs on a Laptop

### 6.1 Decision Tree by Hardware

**MacBook Air M2/M3 16 GB:**
- Sweet spot: Qwen3-8B Q4 (5.2 GB), Gemma4-E4B Q4 (~5 GB), DeepSeek-R1-7B Q4
- Capable of: code completion, chat, document Q&A, structured output, tool calling
- Not suitable: 70B models, 128K+ context without KV quantization

**MacBook Pro M3 36 GB:**
- Sweet spot: Phi-4 14B Q4 (9.3 GB), Qwen3-14B (9.3 GB), Gemma4-12B Q4
- Upper limit: ~25B models (Gemma4-26B MoE Q4 ~16 GB fits with room)
- Capable of: research assistant quality, agentic tasks, competitive coding performance
- Not suitable: 70B models (43 GB > 36 GB)

**MacBook Pro M4 64 GB:**
- Sweet spot: Qwen3-32B (20 GB), Gemma4-31B (20 GB), DeepSeek-R1-32B (20 GB)
- Can run: Llama 3.3-70B Q4 (43 GB) — full frontier-comparable model locally
- Capable of: nearly all tasks; factual recall still lags frontier

**Laptop with RTX 4060 8 GB VRAM, 32 GB system RAM:**
- Sweet spot: 7B–8B Q4 (4.9 GB) in VRAM for full GPU speed
- Partial offload: 13B Q4 with some layers in CPU RAM (~15 t/s instead of ~30)
- Not suitable: 30B+ without major offload penalty

**x86 laptop, no discrete GPU, 32 GB RAM:**
- CPU-only: 7B Q4_K_M gives ~5–10 t/s (usable but slow for interactive chat)
- Intel Core Ultra with AVX-512/AMX: modestly faster than older CPUs
- NPU offload (OpenVINO): not yet mature in llama.cpp as of June 2026

### 6.2 What Works Well Locally in 2026

| Task | Quality vs Frontier | Best Local Model | Hardware Needed |
|------|--------------------|-----------------|-----------------| 
| Code completion (Python/TS) | ~Frontier | Qwen3-8B, Gemma4-E4B, Phi-4 | 16 GB unified or 8 GB VRAM |
| Chat / Q&A (known topics) | ~Frontier | Any 7B+ | 8 GB |
| Reasoning / math (with thinking) | Near-frontier | DeepSeek-R1-7B+, Qwen3-8B+ | 16 GB |
| Document Q&A (RAG) | ~Frontier | Any 7B+ | 8 GB |
| Structured output (JSON) | ~Frontier | Qwen3-8B, Phi-4 | 16 GB |
| Vision / multimodal | Good (not frontier) | Gemma4-E4B | 16 GB |
| Agentic tool use | Good for simple tasks | Qwen3-8B+, Gemma4 | 16 GB |
| Complex multi-step agents | Behind frontier | Gemma4-31B, Qwen3-32B | 36+ GB |
| Factual knowledge Q&A | Significantly behind | Llama 3.3-70B | 64 GB |

---

## 7. Open Questions and Caveats

1. **Benchmark hardware context:** The quantization speed benchmarks from llama.cpp docs were obtained on an unspecified machine (likely a GPU workstation, possibly the A6000 example). Specific laptop tok/s numbers for Apple M-series and RTX 40xx were inferred, not directly verified from official sources in this session. Web search was blocked, preventing access to community benchmarks (r/LocalLLaMA, official blog benchmark posts).

2. **Ollama MLX performance claims:** The March 2026 Ollama blog states MLX is "the fastest way to run Ollama on Apple silicon" — this is Ollama's own claim, not independently verified quantitative comparison in this session.

3. **DeepSeek-R1 O3 parity claim:** DeepSeek's R1-0528 "approaching O3 and Gemini 2.5 Pro" is from DeepSeek's own model page. This is self-reported.

4. **Intel NPU / AMD Ryzen AI NPU acceleration:** OpenVINO backend in llama.cpp is listed as "in progress." Confirmed supported in Ollama's AMD Ryzen AI GPU list (via ROCm/Vulkan, not NPU offload). NPU-specific inference acceleration for on-device AI is a developing area not fully assessed.

5. **LM Studio pricing:** Appears free for local use; commercial terms for LM Link or future features not fully examined.

6. **GPT4All and Jan.ai:** Status in 2026 not directly verified. Both appear in llama.cpp ecosystem lists.

7. **HIPAA / compliance:** No tool examined carries formal compliance certifications based on available docs.

---

## Sources

All sources are primary (official documentation, GitHub repositories, official model pages).

1. Ollama blog: https://ollama.com/blog
2. Ollama releases: https://github.com/ollama/ollama/releases
3. Ollama README: https://github.com/ollama/ollama/blob/main/README.md
4. Ollama OpenAI compat: https://docs.ollama.com/openai
5. Ollama GPU support: https://docs.ollama.com/gpu
6. Ollama FAQ: https://docs.ollama.com/faq
7. Ollama Privacy Policy: https://ollama.com/privacy
8. llama.cpp README: https://github.com/ggml-org/llama.cpp/blob/master/README.md
9. llama.cpp releases: https://github.com/ggml-org/llama.cpp/releases
10. llama.cpp quantize README: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
11. llama.cpp performance tips: https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md
12. mlx-lm README: https://github.com/ml-explore/mlx-lm/blob/main/README.md
13. LM Studio docs: https://lmstudio.ai/docs
14. LM Studio OpenAI API: https://lmstudio.ai/docs/api/openai-api
15. LM Studio headless: https://lmstudio.ai/docs/developer/core/headless
16. LM Studio 0.4.0 release: https://lmstudio.ai/blog/0.4.0
17. LM Studio Privacy Policy: https://lmstudio.ai/privacy
18. LocalAI README: https://github.com/mudler/LocalAI/blob/master/README.md
19. llamafile README: https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md
20. Phi-4 model card: https://huggingface.co/microsoft/phi-4
21. Gemma 4 model page (Ollama): https://ollama.com/library/gemma4
22. Qwen3 model page (Ollama): https://ollama.com/library/qwen3
23. Llama 3.3 model page (Ollama): https://ollama.com/library/llama3.3
24. DeepSeek-R1 model page (Ollama): https://ollama.com/library/deepseek-r1
