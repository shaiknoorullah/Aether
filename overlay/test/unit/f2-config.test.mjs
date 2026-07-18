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

// Note (f5): the literal default list moved to f5-config.test.mjs when the
// reserved 'workspace' slot went live; the f2 guarantee that survives is that
// the original bar ids stay present, in their relative order.
test("config: default [statusbar] widgets keeps mode, url, msg, clock in order", () => {
  const widgets = AetherConfig.DEFAULTS.statusbar?.widgets ?? [];
  let from = 0;
  for (const want of ["mode", "url", "msg", "clock"]) {
    const at = widgets.indexOf(want, from);
    assert.ok(at !== -1, `default statusbar widgets lost '${want}' (or its relative order)`);
    from = at + 1;
  }
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
