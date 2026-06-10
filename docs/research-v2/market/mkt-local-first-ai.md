# Local-First / On-Device AI for Aether (2026)

**Department:** Market
**Team:** mkt-local-first-ai
**Mandate:** Local-first/on-device AI 2026 — LM Studio, Ollama, llama.cpp, MLX; small-model capability, latency, footprint, privacy, OpenAI-compatible local gateways.
**Date:** 2026-06-10
**Primary source brief:** `outputs/local-ondevice-ai-2026.md` (Feynman deep-research, 24 primary sources, verification PASS WITH NOTES)

---

## 1. Executive Summary

Local AI inference crossed a usable threshold for desktop apps in 2026. The tooling stack — llama.cpp (build b9585), Ollama (v0.30.7), LM Studio (v0.4.0), and Apple MLX — is stable, developer-ergonomic, and converged on **OpenAI-compatible REST APIs**, so a single client (`base_url = http://localhost:PORT/v1`) targets all four with a one-line change. Small models in the 8B–31B range now reach frontier-class quality on coding, math, and graduate-science reasoning (Gemma4-31B: AIME 2026 89.2%, GPQA Diamond 84.3%; Phi-4-14B beats GPT-4o on GPQA), while persistently lagging on factual recall (SimpleQA), strict instruction formatting, long-context fidelity, and low-resource languages.

The strategic implication for Aether is strong: a privacy-first, power-user, AI-native browser can ship genuinely useful AI that runs **entirely on the user's machine with zero prompt/response exfiltration**, differentiating against Brave Leo (cloud-default), Chrome's Gemini Nano (locked to fixed APIs), and Dia/SigmaOS (cloud-only). The whitespace is concrete: no shipping browser does (a) capability-based multi-model local routing, (b) a local AI with rich, permission-gated browser context and a zero-exfiltration guarantee, or (c) a hardware-aware model picker that degrades gracefully across laptop tiers. The practical floor is a 16 GB unified-memory Mac or 8 GB-VRAM GPU running a 7B–8B Q4 model; the ceiling (70B Q4) needs a 64 GB Mac. Aether must therefore treat local AI as a tiered, optional, graceful-degradation feature — not a hard requirement — and pair it with an OpenAI-compatible bring-your-own-endpoint contract so users can point at Ollama, LM Studio, llama-server, or LocalAI interchangeably.

---

## 2. Key Findings

### Finding 1: All major local runtimes expose OpenAI-compatible REST APIs — one integration covers all
Ollama (port 11434), LM Studio (port 1234), llama-server (port 8080), and LocalAI (port 8080) all serve `/v1/chat/completions`, `/v1/completions`, and `/v1/embeddings`. A client built against the OpenAI SDK with a swapped `base_url` works across all four; Ollama even supports model-name aliasing (`ollama cp llama3.2 gpt-3.5-turbo`).
- **Source:** https://docs.ollama.com/openai , https://lmstudio.ai/docs/api/openai-api
- **Confidence:** HIGH (verified against official API docs)
- **Aether implication:** Build a single OpenAI-compatible client abstraction; let the user supply any local endpoint.

### Finding 2: Local inference is genuinely zero-exfiltration by design
Ollama: "We do not collect, store, transmit, or have access to your prompts, responses, model interactions... Your data stays on your machine." LM Studio: "None of your messages, chat histories, and documents are ever transmitted from your system." llama.cpp has no networking in the inference path (only optional `-hf` model download). Fully-local mode in Ollama via `"disable_ollama_cloud": true`.
- **Source:** https://ollama.com/privacy , https://lmstudio.ai/privacy
- **Confidence:** HIGH (verified against official privacy policies)
- **Aether implication:** This is the marketable, defensible differentiator vs. Brave Leo / Dia / Opera Aria, all of which default to cloud.

### Finding 3: Small models reach frontier-class quality on reasoning/coding/math — but not factual recall
Phi-4-14B scores GPQA 56.1 (beats GPT-4o 50.6). Gemma4-31B: AIME 2026 89.2%, LiveCodeBench v6 80.0%, GPQA Diamond 84.3%, Codeforces ELO 2150. But SimpleQA (factual recall) shows a 13× gap: Phi-4 3.0 vs GPT-4o 39.4. Strict instruction-formatting compliance and long-context fidelity (Gemma4-31B MRCR 8-needle 128K: 66.4%) also lag.
- **Source:** https://huggingface.co/microsoft/phi-4 , https://ollama.com/library/gemma4
- **Confidence:** HIGH for benchmark numbers (official model cards); MEDIUM on real-world transfer (some vendor self-report)
- **Aether implication:** Route reasoning/coding/summarization to local; route factual-lookup and high-stakes tasks to a (user-chosen) cloud model or RAG over verified sources.

### Finding 4: Hardware tier dictates capability; graceful degradation is mandatory
Practical floor: 16 GB unified memory (Apple Silicon) or 8 GB VRAM runs 7B–8B Q4 at interactive speed. Q4_K_M is the recommended sweet spot (3× less memory than F16, ~2.5× faster, minimal quality loss). 70B Q4 (43.1 GB) needs a 64 GB Mac. MoE models (Gemma4-26B-A4B, Qwen3-30B-A3B) deliver large-model quality at small-model speed (only ~3.8B active params) but still require full-model memory.
- **Source:** https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md , https://ollama.com/library/qwen3
- **Confidence:** HIGH for memory math; MEDIUM for absolute tok/s (laptop-specific numbers inferred, not officially benchmarked — see brief §7)
- **Aether implication:** Detect hardware, recommend a model per tier, and disable/down-shift features that won't run.

### Finding 5: Browser extensions can reach a local model, but the permission surface is the risk
Ollama supports `OLLAMA_ORIGINS=chrome-extension://*,moz-extension://*,safari-web-extension://*` to allow extension access; it binds to 127.0.0.1 by default. The extension's permissions then determine what page content reaches the model.
- **Source:** https://docs.ollama.com/faq
- **Confidence:** HIGH
- **Aether implication:** The browser context (history, tabs, page content) fed to a local model must be permission-gated, not all-or-nothing.

### Finding 6: Apple Silicon has a structural advantage via unified memory; MLX is now the fastest Apple backend
Unified memory removes the VRAM ceiling — practical limit is system RAM minus OS overhead. Ollama v0.30.0+ uses MLX as its primary Apple Silicon backend ("the fastest way to run Ollama on Apple silicon"); LM Studio ships an MLX runtime alongside llama.cpp.
- **Source:** https://github.com/ml-explore/mlx-lm/blob/main/README.md , https://ollama.com/blog
- **Confidence:** HIGH for architecture; MEDIUM for "fastest" (vendor self-claim, not third-party benchmarked)
- **Aether implication:** Prefer MLX-backed runtimes on Apple Silicon; the Mac user base is the strongest local-AI fit.

### Finding 7: Native tool calling + structured output are broadly supported locally
Qwen3 (all sizes), Gemma4, Llama 3.3, and DeepSeek-R1 distills support native OpenAI-format tool calling. llama.cpp supports grammar-constrained (GBNF) output for guaranteed-valid structured responses; Ollama exposes `response_format`, `tools`, `tool_choice`, `reasoning_effort`, `logprobs`.
- **Source:** https://ollama.com/library/qwen3 , https://github.com/ggml-org/llama.cpp/blob/master/README.md
- **Confidence:** HIGH
- **Aether implication:** Local models can drive agentic browser actions and reliably emit structured commands — feasible to build a local agent runtime.

### Finding 8: Single-binary / no-install distribution exists (llamafile, LM Studio headless daemon)
llamafile (Mozilla) ships a single cross-platform executable (llama.cpp + Cosmopolitan Libc) — "run your first llamafile in minutes," no install; also ships `whisperfile` for STT. LM Studio's `llmster` / `lms daemon up` runs fully headless. LocalAI v4.3.0 enables llama.cpp prompt cache by default and supports VRAM-aware distributed routing.
- **Source:** https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md , https://lmstudio.ai/blog/0.4.0
- **Confidence:** HIGH
- **Aether implication:** Aether could bundle or one-click-provision a runtime so non-technical users get local AI without managing Ollama themselves.

---

## 3. Implied Aether Feature Candidates

| # | Feature | Category | Why it follows from the research |
|---|---------|----------|----------------------------------|
| F1 | **OpenAI-compatible local AI gateway (BYO-endpoint)** | AI & Agents | All four runtimes share the `/v1` contract (F1); one abstraction supports all and lets power users point anywhere. Table-stakes foundation. |
| F2 | **Zero-exfiltration local AI mode with verifiable network guarantee** | Privacy & Security | Local inference is provably no-network (F2); surface this as an enforced, auditable mode (e.g., per-AI network kill-switch + data-flow indicator). The core differentiator. |
| F3 | **Capability-based multi-model local router** | AI & Agents | Small models excel at coding/reasoning but fail factual recall (F3); route per-task across local models (and optional cloud fallback). No browser does this (Brave BYOM = single endpoint). |
| F4 | **Hardware-aware model recommender + graceful degradation** | Performance | Tiered hardware dictates feasible models (F4); detect RAM/VRAM/Apple-Silicon and recommend/auto-pick, disabling features that won't run. |
| F5 | **Permission-gated local-AI browser context** | Privacy & Security | Extensions can feed page/tab/history to a local model (F5); make context access per-capability and per-site, not all-or-nothing. |
| F6 | **One-click local runtime provisioning (bundled llamafile / managed Ollama)** | Extensibility | Single-binary runtimes exist (F8); lower the install barrier so non-technical users get local AI without CLI setup. |
| F7 | **Local agentic actions via native tool calling + grammar-constrained output** | AI & Agents | Local models support native tool calling and GBNF (F7); drive sandboxed browser actions with guaranteed-valid command structure. |
| F8 | **On-device summarization / RAG over open tabs & page content** | Productivity | 8B–14B models handle document Q&A and summarization well (F3) with zero exfiltration (F2); the most universally useful local feature across hardware tiers. |
| F9 | **Local embeddings index for private semantic history/bookmark search** | Workspace & Organization | `/v1/embeddings` is supported by all runtimes (F1); enable private on-device semantic search without sending history to a vendor. |

---

## 4. Competitive / Whitespace Notes

**Current landscape (from sibling whitespace research, `outputs/.drafts/browser-feature-whitespace-cited.md`):**

- **Brave BYOM** connects to one local Ollama endpoint at a time (`localhost:11434`), models 1B–40GB, manual switching only — no routing, no multi-model. Brave Leo defaults to cloud and only persists user-preference "memories," not session context.
  - Source: https://brave.com/leo/ , https://ollama.com (BYOM via Ollama)
- **Chrome built-in AI** is Gemini Nano, locked to fixed APIs (Translator, Summarizer, Writer/Rewriter, Prompt API) — not a general local model, not user-swappable, session-scoped context only.
  - Source: https://developer.chrome.com/docs/ai/built-in-apis
- **Dia, SigmaOS Airis, Opera Aria** are cloud-only — no local-inference privacy story.

**Whitespace Aether can own:**
1. **Capability-based local model orchestration** — no browser routes tasks across multiple local models (whitespace §1.2). Brave = single endpoint; Chrome = single fixed model.
2. **Fully local AI with rich, permission-gated browser context + zero-exfiltration guarantee** — explicitly identified as an unfilled gap (whitespace §5.3): "no browser gives a local-only AI model rich access to browsing context while guaranteeing zero data exfiltration."
3. **Hardware-tier-aware graceful degradation** — no browser detects hardware and adapts model choice/feature availability; a power-user, cross-platform browser is the natural home for this.
4. **OpenAI-compatible BYO-endpoint as a first-class contract** — lets power users (Aether's primary audience) plug in their existing Ollama/LM Studio/llama-server/LocalAI stack instead of being locked to one vendor.

---

## 5. Risks

| Risk | Severity | Detail & mitigation |
|------|----------|---------------------|
| **Small audience with sufficient hardware** | HIGH | Routing across a 3B summarizer + 7B coder + 13B reasoner needs 16+ GB RAM; the audience with both hardware and need is narrow (whitespace §1.2 contrarian note). Mitigation: graceful degradation (F4), default to a single good model, treat multi-model as a power-user opt-in. |
| **Model supply-chain / poisoning** | HIGH | GGUF weights carry no behavioral guarantee; a poisoned model could exfiltrate via tool calls. Source: brief §4.3. Mitigation: model allowlist/provenance, default-deny network tools, verified-publisher pins. |
| **Prompt injection via page content** | HIGH | Web content fed to a local agent with network/tool access enables exfiltration; Brave explicitly calls agentic browsing "inherently risky." Source: https://brave.com/series/security-privacy-in-agentic-browsing/ . Mitigation: ties directly to F2/F5 permission gating + alignment checks. |
| **Factual-recall gap erodes trust** | MEDIUM | SimpleQA 13× gap (brief §2.3) means local-only answers can be confidently wrong. Mitigation: route factual lookups to RAG/cloud (F3), label answer provenance. |
| **Laptop performance unverified** | MEDIUM | Absolute tok/s on specific laptops (M3 Pro, RTX 4060) were inferred, not officially benchmarked; web search was blocked in source research (provenance §16). Mitigation: ship an in-app benchmark, set expectations per tier before validating in v2 testing. |
| **Runtime fragmentation / version drift** | MEDIUM | Four runtimes, near-daily releases (llama.cpp rolling, Ollama v0.30.7); API surface differs at the edges (llama-server lacks `/v1/models` and `/v1/responses`). Mitigation: target the common `/v1` subset; capability-detect per endpoint. |
| **No compliance certifications** | LOW-MED | None of the tools carry HIPAA BAAs or SOC 2 (brief §4.4); local inference removes transmission risk but not audit/access-control requirements. Mitigation: don't market HIPAA-readiness; position as privacy, not compliance. |
| **Apple-Silicon-skewed advantage** | LOW | Best local experience is on unified-memory Macs; Windows/Linux discrete-GPU users hit the VRAM ceiling sooner. Mitigation: partial CPU offload + MoE models broaden reach; set tier expectations (F4). |

---

## Sources

All findings trace to the primary research brief `outputs/local-ondevice-ai-2026.md` and its 24 primary sources. Key URLs:

- Ollama OpenAI compat: https://docs.ollama.com/openai
- LM Studio OpenAI API: https://lmstudio.ai/docs/api/openai-api
- Ollama privacy: https://ollama.com/privacy
- LM Studio privacy: https://lmstudio.ai/privacy
- llama.cpp README: https://github.com/ggml-org/llama.cpp/blob/master/README.md
- llama.cpp quantize README (memory/quant tables): https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- Phi-4 model card: https://huggingface.co/microsoft/phi-4
- Gemma 4 (Ollama library): https://ollama.com/library/gemma4
- Qwen3 (Ollama library): https://ollama.com/library/qwen3
- mlx-lm README: https://github.com/ml-explore/mlx-lm/blob/main/README.md
- Ollama FAQ (OLLAMA_ORIGINS, KV cache): https://docs.ollama.com/faq
- llamafile README: https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md
- LocalAI README: https://github.com/mudler/LocalAI/blob/master/README.md
- Brave Leo: https://brave.com/leo/
- Chrome built-in AI: https://developer.chrome.com/docs/ai/built-in-apis
- Brave agentic security series: https://brave.com/series/security-privacy-in-agentic-browsing/
- Sibling whitespace research: `outputs/.drafts/browser-feature-whitespace-cited.md`
