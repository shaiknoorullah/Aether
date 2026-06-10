# Comparison Plan: Knowledge-Capture & Focus Tools (2026)

**Slug:** `knowledge-focus-tools`
**Output:** `outputs/knowledge-focus-tools-comparison.md`

## Tools Under Comparison

### Knowledge-Capture / Graph / PKM
| Tool | Type |
|------|------|
| Obsidian | Local-first PKM, Markdown, plugin ecosystem |
| Logseq | Local-first, outliner + graph, open source |
| Heptabase | Spatial canvas PKM, card-based |
| Anytype | Local-first, type-system object graph |
| are.na | Web-based, block-collection, social graph |

### Focus & Time-Enforcement
| Tool | Type |
|------|------|
| ActivityWatch | Local-first time tracker, open source |
| Cold Turkey | Hard blocking, kernel/OS-level enforcement |
| Freedom | Cross-device blocking, cloud sync |
| RescueTime | Cloud-based activity telemetry + focus sessions |

---

## Evaluation Dimensions

1. **Capture/Graph Model** — How data is structured: nodes/blocks/objects/cards/blocks, graph vs. outliner vs. canvas vs. feed
2. **Focus-Enforcement Mechanisms** — Blocking fidelity (soft/hard/kernel), scheduling, allowlists, session types
3. **Local-First Posture** — On-device storage, offline capability, sync model (CRDT, own server, cloud-only), data ownership
4. **Integration Surfaces** — APIs, webhooks, browser extensions, plugin SDKs, embed protocols, Dataview/queries
5. **Metadata & Taxonomy** — Tag systems, properties, block references, types, namespaces
6. **Privacy & Telemetry** — What data leaves the device, to whom, opt-out posture
7. **Competitive Gaps / Browser Borrowability** — Features a browser could natively implement or borrow

---

## Evidence Sources Plan

- Official docs / feature pages for each tool
- GitHub repos (Logseq, ActivityWatch, Obsidian publish APIs)
- Recent web coverage (2025–2026 reviews, changelogs, blog posts)
- Community discussion (Reddit r/ObsidianMD, r/PKM, Hacker News threads)
- Academic / HCI papers where relevant (personal information management, focus tools)

---

## Output Structure

1. Executive Summary
2. Tool Overview Table
3. Dimension-by-Dimension Analysis
   - Capture & Graph Models (Mermaid diagram)
   - Focus Enforcement Mechanisms
   - Local-First Posture
   - Integration Surfaces
4. Full Comparison Matrix (source · claim · evidence · caveats · confidence)
5. Agreement / Disagreement / Uncertainty flags
6. Browser-Borrowable Patterns (key derivation for Aether)
7. Sources

---

## Execution Plan

1. [x] Write plan to `outputs/.plans/knowledge-focus-tools.md`
2. [ ] Researcher subagent: parallel web search on all 9 tools across 4 dimensions
3. [ ] Synthesize into matrix + dimension analysis
4. [ ] Verifier subagent: spot-check claims, add inline citations
5. [ ] Write final artifact to `outputs/knowledge-focus-tools-comparison.md`
