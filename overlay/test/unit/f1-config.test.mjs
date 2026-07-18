// f1 — Config surface: new defaults + example-TOML sync guard (SDD RED).
// Spec: overlay/specs/f1-keys-and-palette.md §2 "TOML surface", §4 "Config".
// The spec says "extend f0-config.test.mjs"; lives in its own f1-* file so
// waves stay additive (f0 untouched) — same intent, same assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

// New option defaults ---------------------------------------------------------

test("config: default pending_timeout_ms is 800 (the spike's hardcoded window, now config)", () => {
  assert.equal(AetherConfig.DEFAULTS.options.pending_timeout_ms, 800);
});

test("config: default palette_max_items is 8", () => {
  assert.equal(AetherConfig.DEFAULTS.options.palette_max_items, 8);
});

// New binding -----------------------------------------------------------------

test("config: ':' is bound to the 'palette' command in the default normal keymap", () => {
  assert.equal(AetherConfig.DEFAULTS.keymap.normal[":"], "palette");
});

test("config: ':' binding joins the spike bindings rather than replacing them", () => {
  const { normal } = AetherConfig.DEFAULTS.keymap;
  assert.equal(normal.j, "scroll_down");
  assert.equal(normal.gg, "top");
  assert.equal(normal.f, "hints");
});

// Sync guard ------------------------------------------------------------------

test("config: example aether.toml parses to exactly the built-in defaults", () => {
  const text = readFileSync(EXAMPLE_TOML, "utf8");
  assert.deepEqual(
    parseToml(text),
    AetherConfig.DEFAULTS,
    "overlay/config/aether.toml and DEFAULTS in aether-config.sys.mjs drifted apart",
  );
});
