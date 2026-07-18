// f4 — Palette surface: the two new REGISTRY commands (SDD RED).
// Spec: overlay/specs/f4-vertical-tabs-and-graveyard.md §2/§3, §4 tests 14–15.
// Same additive pattern as f3-palette.test.mjs — earlier files stay untouched.
// Only registry membership/parse/complete live here; the graveyard candidate
// provider is chrome glue over the pure search() and is exercised visually.

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";

// 14. registry membership + completion ---------------------------------------

test("palette: 'graveyard' and 'tabs_toggle' are registry commands", () => {
  assert.ok("graveyard" in REGISTRY, "registry must contain 'graveyard'");
  assert.ok("tabs_toggle" in REGISTRY, "registry must contain 'tabs_toggle'");
});

test("palette: complete('grav') → exactly ['graveyard']", () => {
  assert.deepEqual(complete("grav", REGISTRY), ["graveyard"]);
});

test("palette: complete('tabs') includes 'tabs_toggle'", () => {
  assert.ok(complete("tabs", REGISTRY).includes("tabs_toggle"));
});

// 15. parse: optional query args ---------------------------------------------

test("palette: parse('graveyard old docs') → name graveyard, args ['old', 'docs']", () => {
  const r = parse("graveyard old docs");
  assert.equal(r.name, "graveyard");
  assert.deepEqual(r.args, ["old", "docs"]);
});

test("palette: parse('graveyard') with no query is valid (query optional), not unknown", () => {
  const r = parse("graveyard");
  assert.equal(r.unknown, undefined, "bare 'graveyard' must not be unknown/invalid");
  assert.equal(r.name, "graveyard");
  assert.deepEqual(r.args, []);
});

test("palette: parse('tabs_toggle') → runnable with no args", () => {
  const r = parse("tabs_toggle");
  assert.equal(r.name, "tabs_toggle");
  assert.deepEqual(r.args, []);
});
