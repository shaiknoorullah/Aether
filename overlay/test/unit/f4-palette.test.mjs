// f4 — Palette surface: the two new REGISTRY commands (SDD RED).
// Spec: overlay/specs/f4-vertical-tabs-and-graveyard.md §2/§3, §4 tests 14–15.
// Same additive pattern as f3-palette.test.mjs — earlier files stay untouched.
// Only registry membership/parse/complete live here; the graveyard candidate
// provider is chrome glue over the pure search() and is exercised visually.

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";

// 14. registry membership + completion ---------------------------------------

test("palette: 'graveyard' is a registry command; 'tabs_toggle' was deleted with the strip (r4)", () => {
  assert.ok("graveyard" in REGISTRY, "registry must contain 'graveyard'");
  assert.ok("tabs" in REGISTRY, "registry must contain 'tabs_toggle'");
});

test("palette: complete('grav') → exactly ['graveyard']", () => {
  assert.deepEqual(complete("grav", REGISTRY), ["graveyard"]);
});

test("palette: complete('tabs') finds the tab panel, not the deleted strip toggle", () => {
  assert.ok(complete("tabs", REGISTRY).includes("tabs"));
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

test("palette: parse('tabs') → runnable with no args (the panel replaces the toggle)", () => {
  const r = parse("tabs");
  assert.equal(r.name, "tabs");
  assert.deepEqual(r.args, []);
});
