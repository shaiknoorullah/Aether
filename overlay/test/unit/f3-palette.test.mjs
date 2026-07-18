// f3 — Theming: theme_reload palette command (SDD RED).
// Spec: overlay/specs/f3-theming.md §2 "Reload", §4 test 13. Extends the f1
// palette contract additively — f1-palette.test.mjs stays untouched.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  REGISTRY,
  parse,
  complete,
} from "../../chrome/JS/aether-palette.sys.mjs";

test("palette: theme_reload is a registered command", () => {
  assert.ok("theme_reload" in REGISTRY, "REGISTRY must contain 'theme_reload'");
});

test("palette: parse('theme_reload') succeeds with no args", () => {
  const r = parse("theme_reload");
  assert.equal(r.name, "theme_reload");
  assert.deepEqual(r.args, []);
  assert.equal(r.unknown, undefined);
});

test("palette: complete('theme') finds theme_reload", () => {
  assert.ok(complete("theme", REGISTRY).includes("theme_reload"));
  // and it completes to itself like every other command
  assert.ok(complete("theme_reload", REGISTRY).includes("theme_reload"));
});
