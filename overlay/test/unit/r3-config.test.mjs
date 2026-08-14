// r3 — Config + registry surface for which-key (SDD RED). Spec:
// overlay/specs/r3-which-key.md §2 "TOML surface", §4 tests 11–13.
//
// Three guards, in the additive f0/f1 pattern (aether-config.sys.mjs and
// overlay/config/aether.toml are read, never edited here):
//
//   11. the defaults and the shipped example TOML agree on which_key_ms and
//       on the `?` root-list binding — a DEFAULTS-only or TOML-only landing
//       is a drift bug that reds f1's whole-file sync guard, which no feature
//       team owns, so it is caught here first;
//   12. `which_key` is a real, completable, zero-arg registry command, and
//       EVERY registry entry carries a non-empty description and a known
//       risk — a command without one is invisible in three surfaces at once
//       (which-key rows, :describe, and r5's settings panel);
//   13. every description, and which-key's one user-visible string, pass the
//       f6 lexicon sweep. This is not a duplicate of f6 test 12: that one
//       sweeps file text, this one sweeps the VALUES the three surfaces
//       render.
//
// KNOWN RED, blocked on Foundation: `"?" = "which_key"` exists in neither
// AetherConfig.DEFAULTS.keymap.normal nor overlay/config/aether.toml, and
// both files belong to Foundation. The two `?` assertions below are meant to
// stay red until Foundation lands the binding in BOTH files as one edit —
// TOML-only or DEFAULTS-only also reds f1-config's whole-file
// deepEqual(parseToml(text), DEFAULTS) sync guard, which no feature team owns.
// Every test in r3-whichkey.test.mjs is written so it stays green either way:
// where the root list is exercised, `?` is spread into a local copy of the
// keymap rather than assumed present.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import {
  REGISTRY,
  RISKS,
  commandEntry,
  parse,
  complete,
} from "../../chrome/JS/aether-palette.sys.mjs";
import { moreRow } from "../../chrome/JS/aether-strings.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

const DEFAULTS = AetherConfig.DEFAULTS;
const EXAMPLE = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));

// The f6 lexicon, re-declared rather than imported: this file must stay
// runnable on its own, and the sweep it performs is a different sweep.
const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

// 11. config sync guard ---------------------------------------------------------

test("config: which_key_ms defaults to 400 — the pause before the panel, not a keystroke delay", () => {
  assert.equal(DEFAULTS.options.which_key_ms, 400);
});

test("config: the example aether.toml carries the same which_key_ms as DEFAULTS", () => {
  assert.equal(EXAMPLE.options?.which_key_ms, 400, "the shipped dotfile must document the default");
  assert.equal(
    EXAMPLE.options.which_key_ms,
    DEFAULTS.options.which_key_ms,
    "overlay/config/aether.toml and DEFAULTS drifted apart on which_key_ms",
  );
});

test("config: '?' is bound to which_key in the default normal keymap (the root list)", () => {
  assert.equal(
    DEFAULTS.keymap.normal["?"],
    "which_key",
    "spec §2: `?` in normal mode shows the panel for the empty prefix",
  );
});

test("config: the example aether.toml binds '?' identically, and still parses cleanly", () => {
  assert.equal(EXAMPLE.ok, true, "a quoted '?' key must not break the strict parser");
  assert.equal(EXAMPLE.errorLine, null, "no line of the shipped dotfile may be unparseable");
  assert.equal(EXAMPLE.keymap?.normal?.["?"], "which_key");
  assert.equal(
    EXAMPLE.keymap.normal["?"],
    DEFAULTS.keymap.normal["?"],
    "the binding must land in aether.toml and DEFAULTS together, never one without the other",
  );
});

test("config: the '?' binding joins the existing normal keymap rather than replacing it", () => {
  assert.equal(DEFAULTS.keymap.normal.gg, "top");
  assert.equal(DEFAULTS.keymap.normal[":"], "palette");
  assert.equal(DEFAULTS.keymap.normal.f, "hints");
});

test("config: which_key_ms sits inside pending_timeout_ms, or the panel can never appear", () => {
  // The engine clears the pending buffer at pending_timeout_ms. A
  // which_key_ms at or above it means the sequence is cancelled before the
  // panel would ever paint: the feature is off, with no disabled state and no
  // message — a second, invisible off switch next to the documented -1. The
  // pure module cannot see both numbers (shouldShow's signature is pinned to
  // four fields, none of them the engine's timeout), so the shipped defaults
  // are guarded here.
  assert.ok(
    DEFAULTS.options.which_key_ms < DEFAULTS.options.pending_timeout_ms,
    `which_key_ms=${DEFAULTS.options.which_key_ms} must be under pending_timeout_ms=${DEFAULTS.options.pending_timeout_ms}`,
  );
  assert.ok(
    EXAMPLE.options.which_key_ms < EXAMPLE.options.pending_timeout_ms,
    "the shipped dotfile documents a pause the pending buffer actually outlives",
  );
});

test("config: which-key's row cap is palette_max_items (8) — no separate which_key cap exists", () => {
  assert.equal(
    DEFAULTS.options.palette_max_items,
    8,
    "the cap arrives as truncate()'s max argument and is sourced from this key",
  );
  assert.equal(
    DEFAULTS.options.which_key_max_items,
    undefined,
    "spec §2 caps at palette_max_items; a second cap key would be two sources of truth",
  );
});

// 12. registry ------------------------------------------------------------------

test("palette: which_key is a zero-arg registry command with the description the panel renders", () => {
  assert.deepEqual(commandEntry("which_key"), {
    name: "which_key",
    description: "show the bindings that continue the keys you have pressed",
    risk: "read",
    agent: false,
    min: 0,
    usage: null,
  });
});

test("palette: ':which_key' parses as a runnable zero-arg command", () => {
  assert.deepEqual(parse("which_key"), { name: "which_key", args: [] });
});

test("palette: 'which' completes to which_key and nothing else", () => {
  assert.deepEqual(complete("which"), ["which_key"]);
});

test("palette: every registry entry carries a non-empty description — the three-surface guard", () => {
  const missing = [];
  for (const [name, entry] of Object.entries(REGISTRY)) {
    if (typeof entry?.description !== "string" || entry.description.trim().length === 0) {
      missing.push(name);
    }
  }
  assert.deepEqual(
    missing,
    [],
    `commands with no description are invisible in which-key, :describe, and the settings panel: ${missing.join(", ")}`,
  );
});

test("palette: every registry entry declares a known risk level", () => {
  const bad = [];
  for (const [name, entry] of Object.entries(REGISTRY)) {
    if (!RISKS.includes(entry?.risk ?? "read")) bad.push(`${name}=${String(entry?.risk)}`);
  }
  assert.deepEqual(bad, [], `unknown risk levels: ${bad.join(", ")}`);
});

test("palette: every command bound in the default keymap resolves to a described registry entry", () => {
  for (const [sequence, value] of Object.entries(DEFAULTS.keymap.normal)) {
    const entry = commandEntry(String(value).replace(/<char>$/, "").split(" ")[0]);
    assert.ok(entry, `'${sequence}' is bound to '${value}', which is not in the registry`);
    assert.ok(
      entry.description.length > 0,
      `'${sequence}' → '${value}' would render as a blank which-key row`,
    );
  }
});

// 13. lexicon -------------------------------------------------------------------

test("strings: no registry description carries a banned stem — the values three surfaces render", () => {
  const offenders = [];
  for (const [name, entry] of Object.entries(REGISTRY)) {
    if (BANNED.test(String(entry?.description ?? ""))) {
      offenders.push(`${name}: ${JSON.stringify(entry.description)}`);
    }
  }
  assert.deepEqual(offenders, [], `banned lexicon in a rendered description: ${offenders.join("; ")}`);
});

test("strings: the truncation row is a neutral count — '+N more', with no urging and no stem", () => {
  assert.equal(moreRow(4), "+4 more");
  assert.equal(moreRow(0), "+0 more", "the copy is a plain count, with no special-casing");
  assert.ok(!BANNED.test(moreRow(4)), "which-key's only user-visible string stays lexicon-clean");
});
