// f7 — Config + strings surface: [ai] defaults, the a binding, the ai widget
// slot + example-TOML sync guard, and the f7 copy (SDD RED). Spec:
// overlay/specs/f7-local-ai-sidebar.md §2 "TOML surface", §3, §4 tests 19–20.
//
// The exact default widget order is pinned HERE now — 'ai' joins between msg
// and clock. (f6's literal pin is superseded the same way f6 superseded f5's:
// GREEN relaxes the older file's pin to a relative-order guard.)
//
// Strings contract pinned here for overlay/chrome/JS/aether-strings.sys.mjs
// (all f7 user-visible copy lives there, inside the f6 lexicon sweep by
// construction):
//   AI_OFF_PANEL_MESSAGE  — the calm off-state panel line: says what's off
//                           and that :ai_on enables it. Informational, zero
//                           shame, no exclamation.
//   AI_ON_MESSAGE         — "ai: on"   (transient, :ai_on)
//   AI_OFF_MESSAGE        — "ai: off"  (transient, :ai_off)
//   gatewayErrorMessage(baseUrl) — one calm transcript line naming the
//                           configured gateway ("gateway not reachable at
//                           <base_url>" class copy). Echoes its argument, so
//                           f6's export-wide echo check holds mechanically.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

// The f6 lexicon, re-asserted locally for the new exports (the sweep in
// f6-strings.test.mjs covers them mechanically once they exist).
const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

async function stringsModule() {
  return import("../../chrome/JS/aether-strings.sys.mjs");
}

// 19. [ai] defaults -----------------------------------------------------------

test("config: DEFAULTS.ai — kill switch OFF, loopback base_url, a model name", () => {
  const ai = AetherConfig.DEFAULTS.ai;
  assert.ok(ai, "DEFAULTS must carry an ai section");
  assert.equal(ai.enabled, false, "OFF until the user enables it — the default is the switch");
  assert.equal(ai.base_url, "http://127.0.0.1:11434/v1", "the converged local gateway default");
  assert.equal(typeof ai.model, "string");
  assert.ok(ai.model.length > 0, "a model name is always configured");
});

test("config: 'a' binds ai in the default normal keymap; existing bindings stay", () => {
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.a, "ai");
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.gw, "ws_next", "a joins, never replaces");
  assert.equal(AetherConfig.DEFAULTS.keymap.normal.j, "scroll_down", "a joins, never replaces");
});

test("config: default widget order is mode, workspace, focus, url, msg, ai, clock, date", () => {
  assert.deepEqual(AetherConfig.DEFAULTS.statusbar?.widgets, [
    "mode",
    "workspace",
    "focus",
    "url",
    "msg",
    "ai",
    "clock",
    "date",
  ]);
});

// 19 (cont.) — the f0 sync guard extends to the f7 surface --------------------

test("config: example aether.toml [ai] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.ai, "example aether.toml has no [ai] section");
  assert.deepEqual(
    parsed.ai,
    AetherConfig.DEFAULTS.ai,
    "overlay/config/aether.toml [ai] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [keymap.normal] (incl. the a binding) matches DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.equal(parsed.keymap?.normal?.a, "ai", "example TOML must carry the a binding");
  assert.deepEqual(
    parsed.keymap?.normal,
    AetherConfig.DEFAULTS.keymap.normal,
    "overlay/config/aether.toml [keymap.normal] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [statusbar] carries the ai slot, in sync", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(
    parsed.statusbar?.widgets?.includes("ai"),
    "example TOML must list the ai widget — the switch's state is always visible",
  );
  assert.deepEqual(
    parsed.statusbar,
    AetherConfig.DEFAULTS.statusbar,
    "overlay/config/aether.toml [statusbar] and DEFAULTS drifted apart",
  );
});

// 20. the f7 copy — calm, names the enable path, lexicon-clean ----------------

test("strings: off-panel copy names ai_on and stays calm", async () => {
  const mod = await stringsModule();
  const msg = mod.AI_OFF_PANEL_MESSAGE;
  assert.equal(typeof msg, "string", "AI_OFF_PANEL_MESSAGE must be exported copy");
  assert.ok(msg.length > 0, "never empty");
  assert.ok(msg.includes("ai_on"), "the off-state names the way back on (:ai_on)");
  assert.ok(!BANNED.test(msg), `banned stem in off-panel copy: ${JSON.stringify(msg)}`);
  assert.ok(!msg.includes("!"), "informational, not an alarm");
});

test("strings: toggle messages are the factual 'ai: on' / 'ai: off'", async () => {
  const mod = await stringsModule();
  assert.equal(mod.AI_ON_MESSAGE, "ai: on");
  assert.equal(mod.AI_OFF_MESSAGE, "ai: off");
});

test("strings: gatewayErrorMessage names the configured gateway, calmly", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.gatewayErrorMessage, "function");
  const base = "http://127.0.0.1:11434/v1";
  const msg = mod.gatewayErrorMessage(base);
  assert.equal(typeof msg, "string");
  assert.ok(msg.length > 0, "never empty");
  assert.ok(msg.includes(base), "the transcript line names the gateway it tried");
  assert.ok(/gateway/i.test(msg), "says what was not reachable, not just an address");
  assert.ok(!BANNED.test(msg), `banned stem in gateway copy: ${JSON.stringify(msg)}`);
  assert.ok(!msg.includes("!"), "one calm line — no alarm, no retry pressure");
});
