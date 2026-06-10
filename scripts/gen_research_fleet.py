#!/usr/bin/env python3
"""Generate the 20-team Aether Wave-2 research fleet.

Writes:
  - agents/EMP_NNNN.md     (one agent-manager config per team, launcher=feynman)
  - docs/research-v2/<dept>/   (output dirs, preserved alongside v1)
  - docs/research-v2/fleet-manifest.json  (consumed by the Claude workflow)
"""
import json
import os
import pathlib

REPO = pathlib.Path(__file__).resolve().parent.parent
FEYNMAN = "/home/devsupreme/.local/bin/feynman"

# (emp, name, dept, workflow, slug, topic)
TEAMS = [
    # ── DEPT 1: User Segments (deepresearch) ──────────────────────────────
    ("EMP_0001", "seg-power-users", "discovery", "deepresearch", "v2-seg-power-users",
     "Browser power users in 2026 (vim/keyboard-driven, tiling-WM, suckless, developers): their unmet jobs-to-be-done, real workflows, concrete pain points, and the specific features that would make them switch browsers. Include install-count and community-size evidence."),
    ("EMP_0002", "seg-knowledge-workers", "discovery", "deepresearch", "v2-seg-knowledge-workers",
     "Knowledge workers and researchers living in the browser in 2026: tab overload, context-switching cost, research-and-capture workflows, note-taking integration, and the browser features they most want. Cite quantitative studies."),
    ("EMP_0003", "seg-neurodivergent-adhd", "discovery", "deepresearch", "v2-seg-neurodivergent-adhd",
     "Adults with ADHD and neurodivergent users and the web browser (2026): executive-function challenges (task initiation, working memory, time blindness, impulse control), digital accommodations that actually work, shame vs support in productivity tooling, and what an attention-protecting browser should do. Cite clinical and HCI sources."),
    ("EMP_0004", "seg-privacy-advocates", "discovery", "deepresearch", "v2-seg-privacy-advocates",
     "Privacy-focused browser users in 2026: threat models, anti-fingerprinting expectations, ad/tracker blocking, telemetry refusal, local-first and no-cloud demands, and the triggers that make them switch browsers. Include community sizes (arkenfox, LibreWolf, Mullvad)."),
    ("EMP_0005", "seg-ai-agent-builders", "discovery", "deepresearch", "v2-seg-ai-agent-builders",
     "Developers building browser AI agents and automation in 2026: their needs for agent-safe web access, CDP/IPC control surfaces, sandboxing, observability, reliability, and graceful degradation. What do current tools (browser-use, Playwright MCP, Stagehand) get wrong?"),

    # ── DEPT 2: Competitive Intelligence (compare) ────────────────────────
    ("EMP_0006", "comp-ai-browsers", "competitive", "compare", "v2-comp-ai-browsers",
     "AI-native browsers in 2026 — Dia (Browser Company), Perplexity Comet, Brave Leo, Opera Aria and Neon, SigmaOS Airis, and Arc's successors: compare their AI features, architecture, model strategy, pricing, and privacy posture in a sourced matrix."),
    ("EMP_0007", "comp-power-user-browsers", "competitive", "compare", "v2-comp-power-user-browsers",
     "Power-user browsers in 2026 — Vivaldi, qutebrowser, Nyxt, Luakit, Arc, and Zen: compare keyboard control, customization depth, workspace/spatial organization, scripting and configuration models, and extensibility."),
    ("EMP_0008", "comp-customization-forks", "competitive", "compare", "v2-comp-customization-forks",
     "Customization-focused browser forks in 2026 — Zen, Floorp, Waterfox, LibreWolf, Mullvad, Min, Thorium: compare engine base, theming/ricing capability, privacy defaults, update cadence, and core differentiators."),
    ("EMP_0009", "comp-privacy-browsers", "competitive", "compare", "v2-comp-privacy-browsers",
     "Privacy browsers in 2026 — Brave, LibreWolf, Mullvad Browser, Tor Browser, DuckDuckGo browser: compare blocking engines, anti-fingerprinting, telemetry stance, default search/monetization, and user base."),
    ("EMP_0010", "comp-ai-ext-agentinfra", "competitive", "compare", "v2-comp-ai-ext-agentinfra",
     "Browser AI extensions and agent infrastructure in 2026 — Monica, Sider, Merlin, HARPA, MaxAI, Perplexity extension; and browser-use, Playwright MCP, Stagehand, Browserbase, MultiOn: compare capabilities, architecture, control surfaces, and reliability."),
    ("EMP_0011", "comp-knowledge-focus-tools", "competitive", "compare", "v2-comp-knowledge-focus-tools",
     "Knowledge-capture and focus tools in 2026 — Obsidian, Logseq, Heptabase, Anytype, are.na, ActivityWatch, Cold Turkey, Freedom, RescueTime: compare capture/graph models, focus-enforcement mechanisms, local-first posture, and integration surfaces a browser could borrow."),

    # ── DEPT 3: Market & Domain (deepresearch) ────────────────────────────
    ("EMP_0012", "mkt-browser-trends", "market", "deepresearch", "v2-mkt-browser-trends",
     "Web browser market in 2026: market share by browser, switching intent, AI-browser adoption rates, extension ecosystem trends (Manifest V2 deprecation vs V3 limits), and competitive dynamics. Provide sourced statistics with dates."),
    ("EMP_0013", "mkt-adhd-econ-evidence", "market", "deepresearch", "v2-mkt-adhd-econ-evidence",
     "Economic and clinical evidence on adult ADHD and executive function (2020-2026): productivity loss and presenteeism, societal cost, employment and earnings outcomes, and the measured efficacy of external-scaffolding and digital interventions for self-regulation. Peer-reviewed where possible."),
    ("EMP_0014", "mkt-local-first-ai", "market", "deepresearch", "v2-mkt-local-first-ai",
     "Local-first and on-device AI for desktop apps in 2026: LM Studio, Ollama, llama.cpp, Apple MLX; small-model capability vs frontier, latency, RAM/VRAM footprint, privacy tradeoffs, and the state of OpenAI-compatible local gateways. What can realistically run on a laptop?"),
    ("EMP_0015", "mkt-automation-sync", "market", "deepresearch", "v2-mkt-automation-sync",
     "Self-hostable workflow/automation engines and local-first sync stacks in 2026: Windmill, Temporal, n8n for durable replayable workflows; and CRDT sync via Yjs/Automerge over Iroh/libp2p/Syncthing. Compare durability guarantees, operational burden, and fit for a browser automation + sync layer."),

    # ── DEPT 4: Technical / Architecture ──────────────────────────────────
    ("EMP_0016", "tech-engine-decision", "technical", "compare", "v2-tech-engine-decision",
     "Browser delivery vehicle for a custom AI-native, keyboard-first, privacy-respecting browser in 2026 — Firefox/Gecko fork vs Chromium/CEF fork vs a custom shell over a system WebView (WebView2/WKWebView/WebKitGTK) vs a deeply privileged extension: compare control, fork-maintenance burden, extension compatibility, AI/IPC/CDP capability, zero-chrome and native-modal-keybinding feasibility, and licensing. Recommend with reasoning."),
    ("EMP_0017", "tech-ai-control-ipc", "technical", "deepresearch", "v2-tech-ai-control-ipc",
     "Agent-safe browser control and IPC for AI-native browsers in 2026: Chrome DevTools Protocol, WebDriver BiDi, WebExtension messaging, Firefox exportFunction/cloneInto, Native Messaging hosts, and MCP. Analyze security, sandboxing, permission models, spoofing/injection risks, and which combination is safest for letting AI agents drive a browser."),
    ("EMP_0018", "tech-selfhost-p2p-sync", "technical", "deepresearch", "v2-tech-selfhost-p2p-sync",
     "Building a no-cloud, end-to-end-encrypted, CRDT-based sync layer for a desktop browser in 2026: Yjs vs Automerge for conflict resolution; Iroh vs libp2p vs Syncthing for transport; key management and E2E encryption; performance and offline behavior. What is the most pragmatic stack?"),

    # ── DEPT 5: Synthesis & Red-Team (deepresearch / review) ──────────────
    ("EMP_0019", "syn-whitespace-gaps", "synthesis", "deepresearch", "v2-syn-whitespace-gaps",
     "Feature whitespace no current browser fills in 2026: synthesize across AI-native, power-user, privacy, and neurodivergent needs to identify unserved opportunities — features no competitor has — plus the contrarian risks and reasons each gap might exist for good reason. Be specific and sourced."),
    ("EMP_0020", "syn-redteam-risk", "synthesis", "deepresearch", "v2-syn-redteam-risk",
     "Red-team analysis (2026): why do ambitious AI-native, power-user, privacy-first browsers fail? Examine Arc's wind-down, adoption and distribution barriers, trust and switching costs, maintenance sustainability, and monetization without surveillance. What are the blind spots and assumptions a new browser like this must survive?"),
]

DEPT_LABELS = {
    "discovery": "Discovery / User Segments",
    "competitive": "Competitive Intelligence",
    "market": "Market & Domain",
    "technical": "Technical / Architecture",
    "synthesis": "Synthesis & Red-Team",
}


def write_agent(emp, name, dept, workflow, slug, topic):
    agents_dir = REPO / "agents"
    agents_dir.mkdir(exist_ok=True)
    # YAML-safe: topic has no double quotes; wrap in double quotes.
    assert '"' not in topic, f"topic for {name} contains a double quote"
    content = f"""---
name: {name}
description: "{DEPT_LABELS[dept]} — {name} (feynman {workflow})"
working_directory: ${{REPO_ROOT}}
launcher: {FEYNMAN}
launcher_args:
  - {workflow}
  - "{topic}"
---

# {name.upper().replace('-', ' ')}

**Department:** {DEPT_LABELS[dept]}
**Feynman workflow:** `{workflow}`
**Output slug:** `{slug}` (lands in `outputs/{slug}.md` + `.provenance.md`)

## Mandate

{topic}

## Operating rules
- Every claim needs a source URL. Prefer primary sources, recent (2024-2026) data, and named communities/repos with sizes.
- Do not delete or overwrite any existing v1 research in `docs/research-data/` or `docs/`.
- This agent is one feynman research subagent in Aether's 20-team Wave-2 swarm, launched via agent-manager and orchestrated by a Claude workflow.
"""
    path = agents_dir / f"{emp}.md"
    path.write_text(content)
    return path


def main():
    manifest = []
    for emp, name, dept, workflow, slug, topic in TEAMS:
        write_agent(emp, name, dept, workflow, slug, topic)
        (REPO / "docs" / "research-v2" / dept).mkdir(parents=True, exist_ok=True)
        manifest.append({
            "emp": emp, "name": name, "dept": dept,
            "workflow": workflow, "slug": slug, "topic": topic,
            "raw_output": f"outputs/{slug}.md",
            "synthesis_output": f"docs/research-v2/{dept}/{name}.md",
        })
    man_path = REPO / "docs" / "research-v2" / "fleet-manifest.json"
    man_path.write_text(json.dumps({"teams": manifest}, indent=2))
    print(f"Wrote {len(manifest)} agent configs to {REPO/'agents'}")
    print(f"Manifest: {man_path}")
    for t in manifest:
        print(f"  {t['emp']}  {t['name']:<26} {t['workflow']:<13} -> {t['raw_output']}")


if __name__ == "__main__":
    main()
