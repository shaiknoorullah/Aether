// f3 — Config surface: [theme] defaults + example-TOML sync guard (SDD RED).
// Spec: overlay/specs/f3-theming.md §2 "TOML surface", §4 test 14. Same
// additive pattern as f2-config.test.mjs — earlier files stay untouched.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import { GRUVBOX, validatePalette } from "../../chrome/JS/aether-theme.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

test("config: DEFAULTS.theme carries source 'auto' and the wal_json path", () => {
  assert.equal(AetherConfig.DEFAULTS.theme?.source, "auto");
  assert.equal(AetherConfig.DEFAULTS.theme?.wal_json, "~/.cache/wal/colors.json");
});

test("config: DEFAULTS.theme.colors is the builtin GRUVBOX palette (one source of truth)", () => {
  assert.deepEqual(AetherConfig.DEFAULTS.theme?.colors, GRUVBOX);
  assert.ok(validatePalette(AetherConfig.DEFAULTS.theme?.colors));
});

test("config: example aether.toml [theme] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.theme, "example aether.toml has no [theme] section");
  assert.ok(parsed.theme.colors, "example aether.toml has no [theme.colors] table");
  assert.deepEqual(
    parsed.theme,
    AetherConfig.DEFAULTS.theme,
    "overlay/config/aether.toml [theme] and DEFAULTS drifted apart",
  );
});
