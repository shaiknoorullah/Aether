// b3 — Config surface: [workspaces] resurrect default + example-TOML sync
// guard (SDD RED). Spec: overlay/specs/b3-context-resurrection.md §2 "TOML
// surface", §4 test 12. Same additive f0 pattern as f5-config.test.mjs: the
// defaults live in aether-config.sys.mjs and overlay/config/aether.toml must
// parse to exactly the same values — one boolean, no per-site machinery.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, deepMerge, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

test("config: DEFAULTS.workspaces.resurrect is true (ambient, on by default)", () => {
  assert.equal(AetherConfig.DEFAULTS.workspaces?.resurrect, true);
});

test("config: [workspaces] keeps its f5 default alongside resurrect", () => {
  assert.equal(
    AetherConfig.DEFAULTS.workspaces?.default,
    "main",
    "resurrect joins the section, never replaces it",
  );
});

test("config: example aether.toml [workspaces] (incl. resurrect) parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.equal(parsed.workspaces?.resurrect, true, "example TOML must carry the resurrect flag");
  assert.deepEqual(
    parsed.workspaces,
    AetherConfig.DEFAULTS.workspaces,
    "overlay/config/aether.toml [workspaces] and DEFAULTS drifted apart",
  );
});

test("config: a dotfile can turn resurrection off without disturbing the rest", () => {
  const merged = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml("[workspaces]\nresurrect = false\n"),
  );
  assert.equal(merged.workspaces.resurrect, false, "off = never capture, never restore");
  assert.equal(merged.workspaces.default, "main", "the sibling key is untouched");
});
