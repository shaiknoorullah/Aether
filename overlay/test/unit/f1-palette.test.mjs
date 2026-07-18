// f1 — Palette: behavioral tests for the pure ex-mode module (SDD RED).
// Spec: overlay/specs/f1-keys-and-palette.md §2, §4 (tests 13–21).
//
// Contract pinned by these tests (the implementation follows the tests):
//   REGISTRY — object whose keys are every runnable command name: the full
//     spike command set plus "tab" (:tab <n>) and "palette". Values hold
//     metadata (arg spec etc.) that these tests do not inspect; command
//     *implementations* stay in glue.
//   parse(input) -> {name, args}   args is an array of raw string tokens
//               |  a non-success object with `unknown` set (unknown name or
//                  invalid/missing required arg) and no `name` property
//   unknownMessage(name) -> the exact statusbar copy "no command: <name>"
//   complete(input, registry, maxItems?) -> ordered candidate command names
//     (prefix match on the command-name token only; sorted ascending;
//      maxItems caps the list — glue passes options.palette_max_items)
//   cycle({input, candidates, index}) -> {input, candidates, index}
//     Tab stepping: index -1 means "nothing selected yet"; each cycle
//     advances and rewrites ONLY the command-name token of input, wrapping
//     past the last candidate back to the first. Args survive untouched.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  REGISTRY,
  parse,
  complete,
  cycle,
  unknownMessage,
} from "../../chrome/JS/aether-palette.sys.mjs";
import { AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const NAMES = () => Object.keys(REGISTRY);

// 13. parse with args --------------------------------------------------------

test("palette: parse('open example.com') → name open, args ['example.com']", () => {
  const r = parse("open example.com");
  assert.equal(r.name, "open");
  assert.deepEqual(r.args, ["example.com"]);
});

test("palette: parse tolerates extra whitespace", () => {
  const r = parse("   open    example.com   ");
  assert.equal(r.name, "open");
  assert.deepEqual(r.args, ["example.com"]);
});

// 14. numeric arg + missing arg ---------------------------------------------

test("palette: parse('tab 3') → tab with its arg token", () => {
  const r = parse("tab 3");
  assert.equal(r.name, "tab");
  assert.deepEqual(r.args, ["3"]);
});

test("palette: parse('tab') without its required arg is not a successful parse (and not a crash)", () => {
  let r;
  assert.doesNotThrow(() => {
    r = parse("tab");
  });
  assert.equal(typeof r, "object");
  assert.equal(r.name, undefined, "missing required arg must not parse as runnable");
});

// 15. unknown command + non-shaming copy ------------------------------------

test("palette: parse('zzz') → unknown, carrying the name", () => {
  const r = parse("zzz");
  assert.equal(r.name, undefined);
  assert.equal(r.unknown, "zzz");
});

test("palette: unknown-command copy is neutral — 'no command: <name>', no punitive wording", () => {
  const msg = unknownMessage("zzz");
  assert.equal(msg, "no command: zzz");
  const lower = msg.toLowerCase();
  for (const word of ["error", "invalid", "fail", "wrong", "bad", "oops", "sorry", "!"]) {
    assert.ok(!lower.includes(word), `copy must not contain punitive wording: '${word}'`);
  }
});

// 16. prefix completion, deterministic order --------------------------------

test("palette: complete('ta') → all tab* commands in stable sorted order", () => {
  const got = complete("ta", REGISTRY);
  const expected = NAMES()
    .filter(n => n.startsWith("ta"))
    .sort();
  assert.deepEqual(got, expected);
  // the registry actually contains the tab family (spike set + :tab)
  for (const name of ["tab", "tab_close", "tab_new", "tab_next", "tab_prev"]) {
    assert.ok(expected.includes(name), `registry must contain '${name}'`);
  }
  // deterministic: same call, same order
  assert.deepEqual(complete("ta", REGISTRY), got);
});

// 17. Tab cycling wraps ------------------------------------------------------

test("palette: cycling past the last candidate wraps to the first", () => {
  const candidates = complete("ta", REGISTRY);
  assert.ok(candidates.length >= 2, "need at least two candidates to prove wrapping");

  let state = { input: "ta", candidates, index: -1 };
  for (let i = 0; i < candidates.length; i++) {
    state = cycle(state);
    assert.equal(state.index, i);
    assert.equal(state.input, candidates[i]);
  }
  // one more Tab: wrap
  state = cycle(state);
  assert.equal(state.index, 0);
  assert.equal(state.input, candidates[0]);
});

// 18. unique prefix completes in one Tab ------------------------------------

test("palette: unique prefix completes fully on the first cycle", () => {
  const candidates = complete("scroll_d", REGISTRY);
  assert.deepEqual(candidates, ["scroll_down"]);
  const state = cycle({ input: "scroll_d", candidates, index: -1 });
  assert.equal(state.input, "scroll_down");
});

// 19. empty input lists the whole registry, capped by palette_max_items -----

test("palette: empty input completes to the whole registry in sorted order", () => {
  assert.deepEqual(complete("", REGISTRY), NAMES().sort());
});

test("palette: completion list is capped by palette_max_items", () => {
  const max = AetherConfig.DEFAULTS.options.palette_max_items;
  assert.ok(Number.isInteger(max) && max > 0, "palette_max_items must be a positive default");
  assert.ok(NAMES().length > max, "registry should exceed the cap for this test to bite");
  const got = complete("", REGISTRY, max);
  assert.equal(got.length, max);
  assert.deepEqual(got, NAMES().sort().slice(0, max));
});

// 20. every keymap/registry command is completable (property test) ----------

test("palette: every command in the default keymap exists in the registry and completes to itself", () => {
  const { normal, reserved } = AetherConfig.DEFAULTS.keymap;
  const bound = new Set([...Object.values(normal), ...Object.values(reserved)]);
  for (const name of bound) {
    assert.ok(name in REGISTRY, `keymap command '${name}' missing from registry`);
  }
  for (const name of NAMES()) {
    const got = complete(name, REGISTRY);
    assert.ok(got.includes(name), `'${name}' must be a candidate of its own full name`);
  }
});

// 21. completion rewrites only the command-name token -----------------------

test("palette: typed args survive Tab cycling — only the name token is rewritten", () => {
  const candidates = complete("op example.com", REGISTRY);
  assert.deepEqual(candidates, ["open", "open_tab"]);

  let state = { input: "op example.com", candidates, index: -1 };
  state = cycle(state);
  assert.equal(state.input, "open example.com");
  state = cycle(state);
  assert.equal(state.input, "open_tab example.com");
  state = cycle(state); // wraps, args still intact
  assert.equal(state.input, "open example.com");
});
