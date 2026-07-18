// f5 — Config surface: [workspaces] defaults, the gw binding, the live
// 'workspace' widget slot + example-TOML sync guard (SDD RED).
// Spec: overlay/specs/f5-workspaces-and-persistence.md §2 "TOML surface",
// §4 test 17. Same additive pattern as f4-config.test.mjs. The exact default
// widget order is pinned HERE now (f2's literal pin was superseded when the
// reserved slot went live).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

test("config: DEFAULTS.workspaces.default is 'main'", () => {
  assert.equal(AetherConfig.DEFAULTS.workspaces?.default, "main");
});

test("config: 'gw' binds ws_next in the default normal keymap; 'gg' stays top", () => {
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.gw, "ws_next");
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.gg, "top", "gw joins gg, never replaces it");
});

// Note (f6): the exact default id list is pinned in f6-focus.test.mjs since
// focus + date joined the default bar; here the guard is that the f5 slots
// keep their relative order — the workspace slot may never silently drop.
test("config: defaults keep mode, workspace, url, msg, clock in order", () => {
  const widgets = AetherConfig.DEFAULTS.statusbar?.widgets ?? [];
  let from = 0;
  for (const want of ["mode", "workspace", "url", "msg", "clock"]) {
    const at = widgets.indexOf(want, from);
    assert.ok(at !== -1, `default statusbar widgets lost '${want}' (or its relative order)`);
    from = at + 1;
  }
});

test("config: example aether.toml [workspaces] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.workspaces, "example aether.toml has no [workspaces] section");
  assert.deepEqual(
    parsed.workspaces,
    AetherConfig.DEFAULTS.workspaces,
    "overlay/config/aether.toml [workspaces] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [statusbar] carries the live workspace slot, in sync", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(
    parsed.statusbar?.widgets?.includes("workspace"),
    "example TOML must list the workspace widget",
  );
  assert.deepEqual(
    parsed.statusbar,
    AetherConfig.DEFAULTS.statusbar,
    "overlay/config/aether.toml [statusbar] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [keymap.normal] (incl. the gw binding) matches DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.equal(parsed.keymap?.normal?.gw, "ws_next", "example TOML must carry the gw binding");
  assert.deepEqual(
    parsed.keymap?.normal,
    AetherConfig.DEFAULTS.keymap.normal,
    "overlay/config/aether.toml [keymap.normal] and DEFAULTS drifted apart",
  );
});
