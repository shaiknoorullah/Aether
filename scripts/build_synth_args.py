#!/usr/bin/env python3
"""Merge fleet-manifest.json topics with the actual feynman brief files into
synthesis workflow args. Verifies every team maps to an existing brief."""
import json, os, sys, pathlib

REPO = pathlib.Path('/home/devsupreme/work/aether-browser')
MAP = {
    'seg-power-users': 'outputs/power-user-browser-jtbd.md',
    'seg-knowledge-workers': 'outputs/knowledge-worker-browser-research.md',
    'seg-neurodivergent-adhd': 'outputs/adhd-browser-attention.md',
    'seg-privacy-advocates': 'outputs/privacy-browser-users-2026.md',
    'seg-ai-agent-builders': 'outputs/browser-ai-agent-dev-needs.md',
    'comp-ai-browsers': 'outputs/ai-browsers-2026-comparison.md',
    'comp-power-user-browsers': 'outputs/power-user-browsers-comparison.md',
    'comp-customization-forks': 'outputs/customization-browser-forks-comparison.md',
    'comp-privacy-browsers': 'outputs/privacy-browsers-2026-comparison.md',
    'comp-ai-ext-agentinfra': 'outputs/browser-ai-agents-2026-comparison.md',
    'comp-knowledge-focus-tools': 'outputs/knowledge-focus-tools-comparison.md',
    'mkt-browser-trends': 'outputs/browser-market-2026.md',
    'mkt-adhd-econ-evidence': 'outputs/adhd-productivity-digital-interventions.md',
    'mkt-local-first-ai': 'outputs/local-ondevice-ai-2026.md',
    'mkt-automation-sync': 'outputs/workflow-sync-self-hosted.md',
    'tech-engine-decision': 'outputs/browser-delivery-vehicle-comparison.md',
    'tech-ai-control-ipc': 'outputs/agent-safe-browser-ipc.md',
    'tech-selfhost-p2p-sync': 'outputs/crdt-sync-browser-stack.md',
    'syn-whitespace-gaps': 'outputs/browser-feature-whitespace.md',
    'syn-redteam-risk': 'outputs/browser-failure-redteam.md',
}
manifest = json.loads((REPO / 'docs/research-v2/fleet-manifest.json').read_text())
by_name = {t['name']: t for t in manifest['teams']}
teams, missing = [], []
for name, brief in MAP.items():
    if name not in by_name:
        missing.append(f'team {name} not in manifest'); continue
    if not (REPO / brief).exists():
        missing.append(f'brief missing: {brief}'); continue
    t = by_name[name]
    prov = brief.replace('.md', '.provenance.md')
    teams.append({
        'emp': t['emp'], 'name': name, 'dept': t['dept'], 'topic': t['topic'],
        'brief': brief,
        'provenance': prov if (REPO / prov).exists() else None,
    })
if missing:
    print('PROBLEMS:', *missing, sep='\n  '); sys.exit(1)
args = {'repo': str(REPO), 'teams': teams}
out = REPO / 'docs/research-v2/synthesis-args.json'
out.write_text(json.dumps(args, indent=2))
print(f'OK: {len(teams)}/20 teams mapped, all briefs exist. Wrote {out}')
for t in teams:
    print(f"  {t['emp']} {t['name']:<26} -> {t['brief']}")
