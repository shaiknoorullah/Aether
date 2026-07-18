// f5 — Palette surface: the three new REGISTRY commands (SDD RED).
// Spec: overlay/specs/f5-workspaces-and-persistence.md §2/§3, §4 test 16.
// Same additive pattern as f4-palette.test.mjs — earlier files stay untouched.
// Only registry membership/parse/complete live here; the workspace candidate
// provider is chrome glue over the pure candidateNames() and is exercised
// visually.

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";

// 16. registry membership + completion ---------------------------------------

test("palette: 'ws', 'ws_rename' and 'ws_next' are registry commands", () => {
  assert.ok("ws" in REGISTRY, "registry must contain 'ws'");
  assert.ok("ws_rename" in REGISTRY, "registry must contain 'ws_rename'");
  assert.ok("ws_next" in REGISTRY, "registry must contain 'ws_next'");
});

test("palette: complete('ws') → exactly the three ws commands, sorted", () => {
  assert.deepEqual(complete("ws", REGISTRY), ["ws", "ws_next", "ws_rename"]);
});

// 16. parse: required-arg commands vs the no-arg cycle ------------------------

test("palette: parse('ws dev') → name ws, args ['dev']", () => {
  const r = parse("ws dev");
  assert.equal(r.name, "ws");
  assert.deepEqual(r.args, ["dev"]);
});

test("palette: parse('ws') without args → unknown-with-usage, not a crash", () => {
  let r;
  assert.doesNotThrow(() => {
    r = parse("ws");
  });
  assert.equal(r.name, undefined, "must not be runnable without the name arg");
  assert.equal(r.unknown, "ws");
  assert.ok(typeof r.usage === "string" && r.usage.includes("ws"), "usage hint present");
});

test("palette: parse('ws_rename') without args → unknown-with-usage, not a crash", () => {
  let r;
  assert.doesNotThrow(() => {
    r = parse("ws_rename");
  });
  assert.equal(r.name, undefined);
  assert.equal(r.unknown, "ws_rename");
  assert.ok(typeof r.usage === "string" && r.usage.includes("ws_rename"), "usage hint present");
});

test("palette: parse('ws_rename hack') → name ws_rename, args ['hack']", () => {
  const r = parse("ws_rename hack");
  assert.equal(r.name, "ws_rename");
  assert.deepEqual(r.args, ["hack"]);
});

test("palette: parse('ws_next') → runnable with no args", () => {
  const r = parse("ws_next");
  assert.equal(r.name, "ws_next");
  assert.deepEqual(r.args, []);
});
