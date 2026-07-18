// f2 — Config surface: [statusbar] defaults + example-TOML sync guard
// (SDD RED). Spec: overlay/specs/f2-statusbar-widgets.md §2 "TOML surface",
// §4 item 16. Same additive pattern as f1-config.test.mjs — f0/f1 files stay
// untouched.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

test("config: default [statusbar] widgets is exactly today's bar (mode, url, msg, clock)", () => {
  assert.deepEqual(AetherConfig.DEFAULTS.statusbar?.widgets, [
    "mode",
    "url",
    "msg",
    "clock",
  ]);
});

test("config: statusbar_clock stays available and defaults to true (legacy option kept)", () => {
  assert.equal(AetherConfig.DEFAULTS.options.statusbar_clock, true);
});

test("config: example aether.toml [statusbar] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.deepEqual(
    parsed.statusbar,
    AetherConfig.DEFAULTS.statusbar,
    "overlay/config/aether.toml [statusbar] and DEFAULTS drifted apart",
  );
  // and the section must actually exist in the example dotfile
  assert.ok(parsed.statusbar, "example aether.toml has no [statusbar] section");
});
