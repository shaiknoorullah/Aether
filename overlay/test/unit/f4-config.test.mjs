// f4 — Config surface: [graveyard] defaults + the T binding + example-TOML
// sync guard (SDD RED). Spec: overlay/specs/f4-vertical-tabs-and-graveyard.md
// §2 "TOML surface", §4 test 16. Same additive pattern as f3-config.test.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

test("config: DEFAULTS.graveyard.cap is 500", () => {
  assert.equal(AetherConfig.DEFAULTS.graveyard?.cap, 500);
});

test("config: 'T' binds tabs_toggle in the default normal keymap, 't' stays tab_new", () => {
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.T, "tabs_toggle");
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.t, "tab_new", "lowercase t must stay tab_new");
});

test("config: example aether.toml [graveyard] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.graveyard, "example aether.toml has no [graveyard] section");
  assert.deepEqual(
    parsed.graveyard,
    AetherConfig.DEFAULTS.graveyard,
    "overlay/config/aether.toml [graveyard] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [keymap.normal] (incl. the T binding) matches DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.equal(parsed.keymap?.normal?.T, "tabs_toggle", "example TOML must carry the T binding");
  assert.deepEqual(
    parsed.keymap?.normal,
    AetherConfig.DEFAULTS.keymap.normal,
    "overlay/config/aether.toml [keymap.normal] and DEFAULTS drifted apart",
  );
});
