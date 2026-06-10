# Researcher Brief T4: Privacy Tradeoffs + OpenAI-Compatible Gateways

## Topic
What data leaves the device when using local AI tools? What OpenAI-compatible APIs exist locally, and how mature is the client ecosystem for app developers?

## Your deliverable
Write `outputs/.drafts/local-ondevice-ai-2026-research-T4.md` with structured notes covering all the questions below. Every claim must have a source URL inline. If a source is unavailable, note it as blocked.

## Questions to answer

### Privacy Tradeoffs

1. **Ollama telemetry/privacy** — Does Ollama phone home? What data does it send? Is it configurable? Source: Ollama docs, GitHub issues, privacy policy.

2. **LM Studio telemetry/privacy** — Same questions. Does the GUI send analytics? Is there a telemetry-off setting? What about their model hub — does browsing/downloading models log anything?

3. **llama.cpp privacy** — It's a library/CLI — what, if anything, calls home? Any telemetry?

4. **Apple MLX / on-device Apple** — What's Apple's position on on-device inference privacy? Does mlx-lm or the MLX framework send data anywhere? What about Apple's own on-device model features?

5. **The privacy guarantee** — When all processing is local: what's the threat model? What attack surfaces remain (model poisoning, prompt injection, supply chain in model weights)?

6. **HIPAA/GDPR relevance** — Are any of these tools positioning for regulated-data use cases? Any compliance certifications?

### OpenAI-Compatible Local Gateways

7. **Ollama OpenAI API compatibility** — How complete is Ollama's OpenAI-compatible REST API? What endpoints are supported (chat/completions, embeddings, models, streaming)? What's missing?

8. **LM Studio local server** — Same for LM Studio's local API server. OpenAI API completeness?

9. **llama.cpp server mode** — `llama-server` — what's its API surface? OpenAI compat completeness?

10. **Other gateways** — LocalAI, LiteLLM (local routing), Lemonade (AMD), Jan.ai server — brief status and OpenAI compat level.

11. **Client SDK compatibility** — Do OpenAI Python SDK, LangChain, LlamaIndex, Vercel AI SDK work out-of-the-box against these local servers? What's the typical base_url override pattern?

12. **Tool/function calling over local API** — Which local servers support OpenAI-format function calling in the API? Which models + servers work end-to-end?

13. **Developer integration patterns** — What are the common patterns for building a desktop app that uses a local LLM? Electron + Ollama? Native + MLX? WebExtension + local server?

## Search strategy
Use web searches like:
- "Ollama telemetry privacy data collection 2025"
- "LM Studio privacy telemetry settings 2025"
- "Ollama OpenAI compatible API endpoints 2025"
- "LM Studio local server OpenAI API 2025"
- "llama-server OpenAI API compatibility 2026"
- "LocalAI vs Ollama OpenAI compatible 2025"
- "LiteLLM local proxy OpenAI compatible 2025"
- "build desktop app Ollama Electron integration 2025"
- "LangChain local LLM Ollama 2025"

Fetch official docs pages, GitHub READMEs, and relevant blog posts. Do NOT fetch PDFs.

## Output format
Structured markdown with:
- Part 1: Privacy (one section per tool, then threat model)
- Part 2: OpenAI API gateways (one section per tool + ecosystem)
- Source URLs inline for every factual claim
- A "gaps / could not verify" section at the end
