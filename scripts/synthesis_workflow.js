export const meta = {
  name: 'aether-wave2-synthesis',
  description: 'Synthesize 20 feynman research briefs into an updated, council-scored Aether feature matrix (v2)',
  phases: [
    { title: 'Synthesize', detail: 'one agent per team: brief -> structured department report + candidate features' },
    { title: 'Verify', detail: 'Chain-of-Verification: adversarially check each high-impact claim/feature' },
    { title: 'Council', detail: '5 personas score the consolidated candidates (RICE/MoSCoW/Kano)' },
    { title: 'Assemble', detail: 'compile docs/research-v2/feature-matrix-v2.md' },
  ],
}

// Team list baked in (args injection coerced to string in this harness; embedding is robust).
const REPO = '/home/devsupreme/work/aether-browser'
const TEAMS = [
  { emp: 'EMP_0001', name: 'seg-power-users', dept: 'discovery', brief: 'outputs/power-user-browser-jtbd.md', provenance: 'outputs/power-user-browser-jtbd.provenance.md', topic: 'Browser power users 2026 (vim/keyboard, tiling-WM, suckless, devs): unmet JTBD, workflows, pain points, switch-driving features; install/community-size evidence.' },
  { emp: 'EMP_0002', name: 'seg-knowledge-workers', dept: 'discovery', brief: 'outputs/knowledge-worker-browser-research.md', provenance: 'outputs/knowledge-worker-browser-research.provenance.md', topic: 'Knowledge workers/researchers 2026: tab overload, context-switching cost, research/capture workflows, note-taking integration, desired features.' },
  { emp: 'EMP_0003', name: 'seg-neurodivergent-adhd', dept: 'discovery', brief: 'outputs/adhd-browser-attention.md', provenance: 'outputs/adhd-browser-attention.provenance.md', topic: 'ADHD/neurodivergent users + browser 2026: executive-function challenges, accommodations that work, shame vs support, attention-protecting browser design.' },
  { emp: 'EMP_0004', name: 'seg-privacy-advocates', dept: 'discovery', brief: 'outputs/privacy-browser-users-2026.md', provenance: 'outputs/privacy-browser-users-2026.provenance.md', topic: 'Privacy browser users 2026: threat models, anti-fingerprinting, ad/tracker blocking, telemetry refusal, local-first/no-cloud, switch triggers, community sizes.' },
  { emp: 'EMP_0005', name: 'seg-ai-agent-builders', dept: 'discovery', brief: 'outputs/browser-ai-agent-dev-needs.md', provenance: 'outputs/browser-ai-agent-dev-needs.provenance.md', topic: 'Developers building browser AI agents 2026: agent-safe web access, CDP/IPC control, sandboxing, observability, reliability; what current tools get wrong.' },
  { emp: 'EMP_0006', name: 'comp-ai-browsers', dept: 'competitive', brief: 'outputs/ai-browsers-2026-comparison.md', provenance: null, topic: 'AI-native browsers 2026 (Dia, Comet, Brave Leo, Opera Aria/Neon, SigmaOS Airis, Arc successors): AI features, architecture, model strategy, pricing, privacy.' },
  { emp: 'EMP_0007', name: 'comp-power-user-browsers', dept: 'competitive', brief: 'outputs/power-user-browsers-comparison.md', provenance: null, topic: 'Power-user browsers 2026 (Vivaldi, qutebrowser, Nyxt, Luakit, Arc, Zen): keyboard control, customization, workspaces, scripting/config, extensibility.' },
  { emp: 'EMP_0008', name: 'comp-customization-forks', dept: 'competitive', brief: 'outputs/customization-browser-forks-comparison.md', provenance: null, topic: 'Customization browser forks 2026 (Zen, Floorp, Waterfox, LibreWolf, Mullvad, Min, Thorium): engine base, theming, privacy defaults, differentiators.' },
  { emp: 'EMP_0009', name: 'comp-privacy-browsers', dept: 'competitive', brief: 'outputs/privacy-browsers-2026-comparison.md', provenance: null, topic: 'Privacy browsers 2026 (Brave, LibreWolf, Mullvad, Tor, DuckDuckGo): blocking engines, anti-fingerprinting, telemetry, monetization, user base.' },
  { emp: 'EMP_0010', name: 'comp-ai-ext-agentinfra', dept: 'competitive', brief: 'outputs/browser-ai-agents-2026-comparison.md', provenance: null, topic: 'Browser AI extensions + agent infra 2026 (Monica, Sider, Merlin, HARPA, MaxAI; browser-use, Playwright MCP, Stagehand, Browserbase, MultiOn): capabilities, architecture, control, reliability.' },
  { emp: 'EMP_0011', name: 'comp-knowledge-focus-tools', dept: 'competitive', brief: 'outputs/knowledge-focus-tools-comparison.md', provenance: null, topic: 'Knowledge-capture + focus tools 2026 (Obsidian, Logseq, Heptabase, Anytype, are.na, ActivityWatch, Cold Turkey, RescueTime): capture/graph, focus mechanisms, integration surfaces.' },
  { emp: 'EMP_0012', name: 'mkt-browser-trends', dept: 'market', brief: 'outputs/browser-market-2026.md', provenance: 'outputs/browser-market-2026.provenance.md', topic: 'Browser market 2026: share, switching intent, AI-browser adoption, extension ecosystem (MV2/MV3), competitive dynamics; sourced stats.' },
  { emp: 'EMP_0013', name: 'mkt-adhd-econ-evidence', dept: 'market', brief: 'outputs/adhd-productivity-digital-interventions.md', provenance: 'outputs/adhd-productivity-digital-interventions.provenance.md', topic: 'Adult ADHD economic+clinical evidence 2020-2026: productivity loss, societal cost, employment/earnings, efficacy of external-scaffolding/digital interventions.' },
  { emp: 'EMP_0014', name: 'mkt-local-first-ai', dept: 'market', brief: 'outputs/local-ondevice-ai-2026.md', provenance: 'outputs/local-ondevice-ai-2026.provenance.md', topic: 'Local-first/on-device AI 2026: LM Studio, Ollama, llama.cpp, MLX; small-model capability, latency, footprint, privacy, OpenAI-compatible local gateways.' },
  { emp: 'EMP_0015', name: 'mkt-automation-sync', dept: 'market', brief: 'outputs/workflow-sync-self-hosted.md', provenance: 'outputs/workflow-sync-self-hosted.provenance.md', topic: 'Self-hostable workflow engines + local-first sync 2026: Windmill/Temporal/n8n; CRDT sync Yjs/Automerge over Iroh/libp2p/Syncthing; durability, ops, fit.' },
  { emp: 'EMP_0016', name: 'tech-engine-decision', dept: 'technical', brief: 'outputs/browser-delivery-vehicle-comparison.md', provenance: null, topic: 'Browser delivery vehicle 2026: Gecko fork vs Chromium/CEF vs custom shell over WebView vs privileged extension. Control, maintenance, compat, AI/IPC/CDP, zero-chrome+modal-keys, licensing. Recommend.' },
  { emp: 'EMP_0017', name: 'tech-ai-control-ipc', dept: 'technical', brief: 'outputs/agent-safe-browser-ipc.md', provenance: 'outputs/agent-safe-browser-ipc.provenance.md', topic: 'Agent-safe browser control+IPC 2026: CDP, WebDriver BiDi, WebExtension messaging, exportFunction/cloneInto, Native Messaging, MCP. Security, sandboxing, permissions, safest combo.' },
  { emp: 'EMP_0018', name: 'tech-selfhost-p2p-sync', dept: 'technical', brief: 'outputs/crdt-sync-browser-stack.md', provenance: 'outputs/crdt-sync-browser-stack.provenance.md', topic: 'No-cloud E2E CRDT sync 2026: Yjs vs Automerge; Iroh vs libp2p vs Syncthing; key mgmt, performance, offline. Most pragmatic stack.' },
  { emp: 'EMP_0019', name: 'syn-whitespace-gaps', dept: 'synthesis', brief: 'outputs/browser-feature-whitespace.md', provenance: 'outputs/browser-feature-whitespace.provenance.md', topic: 'Feature whitespace no browser fills 2026: synthesize AI-native+power-user+privacy+neurodivergent needs into unserved opportunities plus contrarian risks.' },
  { emp: 'EMP_0020', name: 'syn-redteam-risk', dept: 'synthesis', brief: 'outputs/browser-failure-redteam.md', provenance: 'outputs/browser-failure-redteam.provenance.md', topic: 'Red-team 2026: why AI-native power-user privacy browsers fail (Arc wind-down, adoption/distribution, trust/switching costs, sustainability, monetization). Blind spots to survive.' },
]
if (!TEAMS.length) throw new Error('no teams defined')

const FEATURE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['team', 'summary', 'candidates'],
  properties: {
    team: { type: 'string' },
    summary: { type: 'string', description: '3-6 sentence synthesis of the brief' },
    candidates: {
      type: 'array',
      description: 'feature candidates this research implies',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['feature', 'category', 'jtbd', 'reach', 'impact', 'confidence', 'effort', 'evidence'],
        properties: {
          feature: { type: 'string' },
          category: { type: 'string', description: 'one of the 12 Aether categories' },
          jtbd: { type: 'string', description: 'job-to-be-done this serves' },
          reach: { type: 'number', description: '0-10 estimated reach' },
          impact: { type: 'number', description: '0-3 impact multiplier' },
          confidence: { type: 'number', description: '0-1 confidence' },
          effort: { type: 'number', description: 'person-months, >=0.5' },
          evidence: { type: 'string', description: 'a source URL or concrete datapoint from the brief' },
        },
      },
    },
  },
}

// ── Phase 1: per-team synthesis (pipeline: each verifies as soon as it's synthesized) ──
phase('Synthesize')
const synthPrompts = TEAMS.map((t) => ({
  t,
  prompt:
    `You are the synthesis lead for Aether research team "${t.name}" (department: ${t.dept}).\n` +
    `Team mandate: ${t.topic}\n\n` +
    (t.brief
      ? `Read the feynman research brief at: ${REPO}/${t.brief}\n` +
        (t.provenance ? `Provenance/sources: ${REPO}/${t.provenance}\n` : '') +
        `Also skim sibling drafts in ${REPO}/outputs/.drafts/ if the brief references them.\n`
      : `No dedicated brief file was produced; reconstruct findings from any relevant files under ${REPO}/outputs/ matching this topic.\n`) +
    `\nWrite a structured department report to ${REPO}/docs/research-v2/${t.dept}/${t.name}.md with: ` +
    `(1) an executive summary, (2) key findings each with a source URL, (3) implied Aether feature candidates, ` +
    `(4) competitive/whitespace notes, (5) risks. Use the existing v1 reports in ${REPO}/docs/research-data/ as the format reference but DO NOT modify them.\n` +
    `Then return the structured object: a short summary and the feature candidates with RICE inputs (reach 0-10, impact 0-3, confidence 0-1, effort person-months) and evidence. ` +
    `Categories must be from: Core Browsing, AI & Agents, Privacy & Security, Keyboard & Input, Workspace & Organization, Extensibility, Productivity, Developer Tools, Performance, Sync & Portability, Accessibility, Social & Collaboration.`,
}))

const verified = await pipeline(
  synthPrompts,
  (s) => agent(s.prompt, { label: `synth:${s.t.name}`, phase: 'Synthesize', schema: FEATURE_SCHEMA, agentType: 'general-purpose' }),
  // Phase 2: verify this team's candidates as soon as its synthesis lands
  (res, s) => {
    if (!res || !res.candidates || !res.candidates.length) return res
    return agent(
      `Adversarially verify the feature candidates synthesized for Aether team "${s.t.name}".\n` +
        `Candidates:\n${JSON.stringify(res.candidates, null, 2)}\n\n` +
        `For each: is the evidence real and sufficient? Is the category right? Are the RICE inputs defensible (not inflated)? ` +
        `Default to skepticism. Read ${REPO}/${s.t.brief || 'outputs/'} to check claims against sources. ` +
        `Return the SAME object shape, keeping only candidates that survive scrutiny, with corrected RICE inputs and a verified evidence URL each.`,
      { label: `verify:${s.t.name}`, phase: 'Verify', schema: FEATURE_SCHEMA, agentType: 'general-purpose' }
    ).then((v) => v || res)
  }
)

const allCandidates = verified
  .filter(Boolean)
  .flatMap((r) => (r.candidates || []).map((c) => ({ ...c, team: r.team })))
log(`Consolidated ${allCandidates.length} verified feature candidates from ${verified.filter(Boolean).length} teams`)

// ── Phase 3: executive council scoring ──
phase('Council')
const PERSONAS = [
  { key: 'product-strategist', weight: 1.2, lens: 'product-market fit, adoption, differentiation, and whether this wins switchers' },
  { key: 'tech-architect', weight: 1.2, lens: 'technical feasibility across the undecided engine options, complexity, and dependency risk' },
  { key: 'user-advocate', weight: 1.0, lens: 'real user value for power users, knowledge workers, ADHD/neurodivergent users, and privacy advocates' },
  { key: 'security-auditor', weight: 1.0, lens: 'privacy-by-architecture, attack surface, agent-safety, and trust' },
  { key: 'devils-advocate', weight: 1.0, lens: 'why each feature is overrated, unproven, or a trap (Arc cautionary tale)' },
]
const SCORE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['scores'],
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['feature', 'rice', 'moscow', 'kano', 'rationale'],
        properties: {
          feature: { type: 'string' },
          rice: { type: 'number' },
          moscow: { type: 'string', enum: ['Must', 'Should', 'Could', 'Won\'t'] },
          kano: { type: 'string', enum: ['Basic', 'Performance', 'Excitement', 'Indifferent'] },
          rationale: { type: 'string' },
        },
      },
    },
  },
}
const candidateList = JSON.stringify(allCandidates.map((c, i) => ({ i, feature: c.feature, category: c.category, jtbd: c.jtbd, evidence: c.evidence })), null, 1)
const councilVotes = await parallel(
  PERSONAS.map((p) => () =>
    agent(
      `You are the ${p.key} on Aether's executive council. Score EVERY candidate feature below through your lens: ${p.lens}.\n` +
        `Use RICE = (Reach*Impact*Confidence)/Effort, MoSCoW, and Kano. Be honest and divergent — your job is a distinct perspective, not consensus.\n\n` +
        `Candidates:\n${candidateList}\n\n` +
        `Return scores for each feature.`,
      { label: `council:${p.key}`, phase: 'Council', schema: SCORE_SCHEMA, agentType: 'general-purpose' }
    ).then((r) => ({ persona: p.key, weight: p.weight, scores: (r && r.scores) || [] }))
  )
)

// ── Phase 4: assemble the v2 matrix ──
phase('Assemble')
const councilJson = JSON.stringify(councilVotes.filter(Boolean), null, 1)
const candidatesJson = JSON.stringify(allCandidates, null, 1)
await agent(
  `Assemble Aether's Wave-2 feature matrix. Inputs:\n` +
    `- Verified candidates (with RICE inputs + evidence):\n${candidatesJson}\n\n` +
    `- Weighted council votes (PS 1.2x, TA 1.2x, others 1.0x):\n${councilJson}\n\n` +
    `Compute each feature's weighted-average RICE, MoSCoW by majority (Must needs 3+ Must votes), and Kano by mode. ` +
    `De-duplicate features that appear across teams (merge, summing reach sensibly). ` +
    `Write ${REPO}/docs/research-v2/feature-matrix-v2.md with: an executive summary that reconciles this with the v1 matrix in ${REPO}/docs/feature-matrix.md ` +
    `(note what's NEW — especially ADHD/executive-function and engine-decision findings), a Top-25 ranked table (Rank|Feature|Category|RICE|MoSCoW|Kano|One-line), ` +
    `a section on the engine decision (Gecko vs Chromium vs custom-shell) drawing on the tech-engine-decision team, a gap/whitespace analysis, and a risk register. ` +
    `Do NOT overwrite or delete ${REPO}/docs/feature-matrix.md or anything in ${REPO}/docs/research-data/. ` +
    `Return a 10-line executive summary of the result.`,
  { label: 'assemble:matrix-v2', phase: 'Assemble', agentType: 'general-purpose' }
)

return {
  teams: verified.filter(Boolean).length,
  candidates: allCandidates.length,
  councilPersonas: councilVotes.filter(Boolean).length,
  output: 'docs/research-v2/feature-matrix-v2.md',
}
