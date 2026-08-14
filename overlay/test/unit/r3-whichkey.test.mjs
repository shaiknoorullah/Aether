// r3 — Which-Key: behavioral tests for the pure candidate/truncate/threshold
// module (SDD RED). Spec: overlay/specs/r3-which-key.md §2, §3, §4 tests 1–10,
// plus the four the spec omits (T14 hostile input, T15 prototype pollution,
// T16 purity/determinism, T17 no clock). Written before the implementation;
// aether-whichkey.sys.mjs follows these.
//
// Contract pinned by these tests:
//   candidatesFor(keymap, prefix = "", registry = REGISTRY) -> Row[]
//     `keymap` is the keymap.normal TABLE only ({sequence: bindingValue}).
//     Row = a fresh plain object with exactly four own keys, in this order:
//       {sequence, remaining, command, description}
//     Selection: s.startsWith(prefix) && s.length > prefix.length — an EXACT
//       match is excluded (a zero-remaining row is an action, not a
//       continuation). Sort: remaining.length asc, then remaining by
//       CODEPOINT (never localeCompare — locale order is not deterministic).
//     A binding whose parsed command is empty is dropped individually; a
//       binding naming an UNKNOWN command is kept, showing the raw name.
//     Total: hostile keymap/prefix/registry never throw, never pollute.
//   truncate(rows, max) -> {rows, moreCount}
//     Shape-agnostic slice. A finite max >= 0 caps at Math.floor(max);
//     anything else means NO cap. Element references are preserved (that is
//     what "never a partial final row" means mechanically). Input untouched.
//     Returns a moreCount NUMBER — the "+N more" copy is moreRow() in
//     aether-strings.sys.mjs and is deliberately not this module's.
//   shouldShow({pendingKeys, elapsedMs, whichKeyMs, forced}) -> boolean
//     Rules in order: non-object arg → false; disabled/garbage whichKeyMs →
//     false (disabled OUTRANKS forced); forced === true (strict) → true;
//     empty/non-string pendingKeys → false; garbage elapsedMs → false;
//     else elapsedMs >= whichKeyMs. Always a primitive boolean.
//
// NOT covered here, and that is a known gap, not an oversight:
//   - root-list dismissal ("any key closes it, and that key is then handled
//     normally", spec §2) is glue state in aether.uc.js with no pure surface;
//   - the normal-mode-only gate (spec §2 "Modes") has no `mode` parameter in
//     the spec-pinned shouldShow signature and stays in glue.
//   Both ship unverified by `node --test` until h3-which-key.sh runs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import {
  candidatesFor,
  truncate,
  shouldShow,
} from "../../chrome/JS/aether-whichkey.sys.mjs";

// Read-only imports: r3 owns neither file.
import { AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const DEFAULT_KEYMAP = AetherConfig.DEFAULTS.keymap.normal;

// ---------------------------------------------------------------- helpers

// A fixture registry, so description behaviour is asserted against values this
// file controls rather than against whatever the shipped REGISTRY says today.
const FIXTURE_REGISTRY = {
  known: { description: "does a thing", risk: "read" },
  bare: { risk: "read" }, // no description at all
  blank: { description: "", risk: "read" }, // present but empty
};

function protoKeyCount() {
  return Object.getOwnPropertyNames(Object.prototype).length;
}

// 1. prefix `g` over the default keymap ---------------------------------------

test("whichkey: prefix 'g' over the default keymap yields exactly gg and gw, in order, with registry descriptions", () => {
  // The ordered whole is the assertion: a .length check plus spot probes would
  // pass against an implementation that invented a row or lost one.
  assert.deepEqual(candidatesFor(DEFAULT_KEYMAP, "g"), [
    {
      sequence: "gg",
      remaining: "g",
      command: "top",
      description: "scroll to the top of the page",
    },
    {
      sequence: "gw",
      remaining: "w",
      command: "ws_next",
      description: "cycle to the next workspace",
    },
  ]);
});

test("whichkey: a row carries exactly four own keys — sequence, remaining, command, description", () => {
  // No args, no awaitsArg, no risk: spec §6 pins one line per row.
  const [row] = candidatesFor(DEFAULT_KEYMAP, "g");
  assert.deepEqual(Object.keys(row), ["sequence", "remaining", "command", "description"]);
});

// 2. empty prefix → every top-level binding, none duplicated -------------------

test("whichkey: the empty prefix lists every top-level binding once, sequence === remaining", () => {
  const rows = candidatesFor(DEFAULT_KEYMAP, "");
  const keys = Object.keys(DEFAULT_KEYMAP);

  // Computed, never hardcoded: the binding count moves when `?` lands.
  assert.equal(rows.length, keys.length, "one row per binding — no drops, no inventions");
  assert.equal(
    new Set(rows.map(r => r.sequence)).size,
    rows.length,
    "no sequence appears twice",
  );
  assert.ok(
    rows.every(r => r.remaining === r.sequence),
    "with an empty prefix the remaining keys ARE the whole sequence",
  );
  assert.deepEqual(
    new Set(rows.map(r => r.sequence)),
    new Set(keys),
    "the row set is exactly the keymap's key set",
  );
});

// 3. no match → empty list, no throw, exact match is not a continuation --------

test("whichkey: a prefix matching nothing returns an empty list rather than throwing or inventing", () => {
  let rows;
  assert.doesNotThrow(() => {
    rows = candidatesFor(DEFAULT_KEYMAP, "q");
  });
  assert.deepEqual(rows, [], "the caller hides; the function does not invent");
  assert.deepEqual(candidatesFor(DEFAULT_KEYMAP, "gg"), [], "an exact match is not a continuation");
  assert.deepEqual(candidatesFor(DEFAULT_KEYMAP, "gg!"), [], "a prefix past every binding");
});

test("whichkey: a binding equal to the prefix is excluded while its extensions are kept", () => {
  // startsWith() alone would emit a zero-remaining row for `g` — a blank line
  // in the panel for a key that fires an action instead of continuing.
  const rows = candidatesFor({ g: "top", gg: "bottom" }, "g", undefined);
  assert.equal(rows.length, 1, "the exact match is not a row");
  assert.equal(rows[0].sequence, "gg");
  assert.equal(rows[0].remaining, "g");
  assert.ok(
    rows.every(r => r.remaining.length > 0),
    "no row may have empty remaining keys",
  );
});

// 4. sort order: length first, then codepoint ----------------------------------

test("whichkey: rows sort by remaining length, then by codepoint — not by locale, not by UTF-16 unit", () => {
  // Three rules are load-bearing here, and each one has a plausible-but-wrong
  // implementation that only this fixture separates from the right one:
  //   - "ab" is alphabetically before "z" yet sorts LAST (length dominates);
  //   - an ICU localeCompare implementation yields ["0","a","W","z","ab",…],
  //     so `gW` is what rules out case-insensitive collation;
  //   - `g😀` is ONE keystroke whose code point (U+1F600) is above "z", so it
  //     belongs at the end of the single-key block. An implementation using
  //     UTF-16 `.length` counts it as two units and files it with "ab"; one
  //     comparing code UNITS sees a lead surrogate (0xD83D) and files it after
  //     "z" for the wrong reason. Only code-point length AND code-point value
  //     put it exactly here. Every other fixture in this file is pure ASCII,
  //     where the two readings are indistinguishable.
  const fx = { ga: "top", gz: "bottom", gab: "back", g0: "reload", gW: "forward", "g\u{1F600}": "hints" };
  assert.deepEqual(
    candidatesFor(fx, "g").map(r => r.remaining),
    ["0", "W", "a", "z", "\u{1F600}", "ab"],
  );
});

test("whichkey: an astral binding is one key, so a one-codepoint prefix consumes the whole of it", () => {
  // The other half of the code-point rule: slicing by UTF-16 index would leave
  // an orphaned trail surrogate in `remaining` and render a replacement glyph.
  const rows = candidatesFor({ "\u{1F600}g": "top", "\u{1F600}\u{1F680}": "bottom" }, "\u{1F600}");
  assert.deepEqual(rows.map(r => r.remaining), ["g", "\u{1F680}"]);
  assert.ok(
    rows.every(r => [...r.remaining].length === 1),
    "each remaining is a single whole code point, never half a surrogate pair",
  );
});

// 5. description present / absent / blank --------------------------------------

test("whichkey: rows carry the registry description, falling back to the command name when absent or blank", () => {
  const rows = candidatesFor(
    { zk: "known", zb: "bare", zl: "blank" },
    "z",
    FIXTURE_REGISTRY,
  );
  const byCommand = Object.fromEntries(rows.map(r => [r.command, r.description]));
  assert.deepEqual(byCommand, {
    known: "does a thing",
    bare: "bare", // no description key → raw name
    blank: "blank", // present but empty → raw name, never a blank line
  });
  assert.ok(
    rows.every(r => typeof r.description === "string" && r.description.length > 0),
    "a description is never undefined and never blank",
  );
});

// 6. unknown command stays visible; empty command is dropped -------------------

test("whichkey: a keymap entry naming an unknown command renders with the raw name instead of vanishing", () => {
  const rows = candidatesFor({ gx: "totally_made_up" }, "g");
  assert.equal(rows.length, 1, "a broken binding must be VISIBLE — that is the point of the feature");
  assert.equal(rows[0].command, "totally_made_up");
  assert.equal(rows[0].description, "totally_made_up", "the raw name is the fallback text");
});

test("whichkey: a binding whose value parses to no command is dropped individually, siblings survive", () => {
  // The other half of the ambiguity: an unknown NAME is kept (above), an empty
  // parsed COMMAND is dropped — matching the engine, which treats it as inert.
  const rows = candidatesFor({ gx: "", gy: "   ", gz: "<char>", gq: "top" }, "g");
  assert.equal(rows.length, 1, "three inert bindings dropped, one good sibling kept");
  assert.equal(rows[0].sequence, "gq");
  assert.equal(rows[0].command, "top");
});

test("whichkey: a non-string binding value is dropped without taking its siblings with it", () => {
  const rows = candidatesFor({ ga: 42, gb: null, gc: { command: "top" }, gd: ["top"], ge: "top" }, "g");
  assert.deepEqual(rows.map(r => r.sequence), ["ge"]);
});

test("whichkey: a binding's args and <char> suffix are stripped — the row shows the bare command", () => {
  const rows = candidatesFor({ g1: "tab_pin_goto 1", gm: "mark_set<char>" }, "g");
  assert.deepEqual(
    rows.map(r => r.command).sort(),
    ["mark_set", "tab_pin_goto"],
    "parseBinding's command, not the raw binding text",
  );
  assert.ok(
    rows.every(r => !("args" in r) && !("awaitsArg" in r)),
    "args and awaitsArg are not surfaced on a row",
  );
});

// 7. truncate -----------------------------------------------------------------

function syntheticRows(n) {
  return Array.from({ length: n }, (_, i) => ({
    sequence: `g${i}`,
    remaining: String(i),
    command: "top",
    description: "scroll to the top of the page",
  }));
}

test("whichkey: truncate caps the list and reports the remainder, preserving row identity", () => {
  const input = syntheticRows(12);
  const out = truncate(input, 8);

  assert.equal(out.rows.length, 8);
  assert.equal(out.moreCount, 4);
  for (let i = 0; i < 8; i++) {
    // Identity, not deep equality: this is what forbids a rebuilt/partial row.
    assert.equal(out.rows[i], input[i], `row ${i} must be the very object passed in`);
  }
  assert.equal(input.length, 12, "the input array is never mutated");
  assert.notEqual(out.rows, input, "the returned array is a fresh one");
});

test("whichkey: truncate reports moreCount 0 when the cap is at or above the row count", () => {
  const input = syntheticRows(12);
  assert.deepEqual(truncate(input, 12), { rows: input.slice(), moreCount: 0 });
  assert.deepEqual(truncate(input, 99), { rows: input.slice(), moreCount: 0 });
  assert.equal(truncate(input, 12).moreCount, 0, "moreCount is never negative");
  assert.equal(truncate(input, 99).moreCount, 0);
});

test("whichkey: truncate at 0 is a real cap of zero, distinct from 'no cap'", () => {
  const input = syntheticRows(12);
  assert.deepEqual(truncate(input, 0), { rows: [], moreCount: 12 });
});

test("whichkey: a non-finite or negative max means NO cap, never a silently empty panel", () => {
  const input = syntheticRows(12);
  for (const max of [Infinity, NaN, undefined, null, -1, "8", {}, []]) {
    const out = truncate(input, max);
    assert.equal(out.rows.length, 12, `max=${String(max)} must not cap`);
    assert.equal(out.moreCount, 0, `max=${String(max)} must report nothing dropped`);
    // The capped branch is asserted fresh (above); without the same assertion
    // here, `return {rows, moreCount: 0}` — handing the caller's own array
    // straight back — passes. The glue keeps the rendered list across a
    // re-render, so an aliased array makes truncate's output a live view of a
    // keymap-derived array the next call rebuilds.
    assert.notEqual(out.rows, input, `max=${String(max)} must still return a fresh array`);
    for (let i = 0; i < 12; i++) {
      assert.equal(out.rows[i], input[i], `max=${String(max)} row ${i} must be the very object passed in`);
    }
  }
  assert.equal(input.length, 12, "the input array is never mutated");
});

test("whichkey: truncate floors a fractional cap rather than slicing a fraction of a row", () => {
  const input = syntheticRows(12);
  const out = truncate(input, 3.7);
  assert.equal(out.rows.length, 3);
  assert.equal(out.moreCount, 9);
});

test("whichkey: truncate given a non-array returns the empty result instead of throwing", () => {
  for (const junk of [null, undefined, 42, "rows", {}, { length: 3 }]) {
    let out;
    assert.doesNotThrow(() => {
      out = truncate(junk, 8);
    }, `truncate(${String(junk)}, 8) must not throw`);
    assert.deepEqual(out, { rows: [], moreCount: 0 });
  }
});

// 8. shouldShow: the threshold, from both sides -------------------------------

test("whichkey: shouldShow honours which_key_ms exactly at the boundary and never when disabled", () => {
  const cases = [
    { whichKeyMs: -1, elapsedMs: 0, expect: false },
    { whichKeyMs: -1, elapsedMs: 400, expect: false },
    { whichKeyMs: -1, elapsedMs: 1e9, expect: false },
    { whichKeyMs: 0, elapsedMs: 0, expect: true }, // 0 = instant
    { whichKeyMs: 400, elapsedMs: 399, expect: false }, // a `>` impl passes
    { whichKeyMs: 400, elapsedMs: 400, expect: true }, //   every row but this pair
    { whichKeyMs: 400, elapsedMs: 401, expect: true },
  ];
  for (const { whichKeyMs, elapsedMs, expect } of cases) {
    const got = shouldShow({ pendingKeys: "g", elapsedMs, whichKeyMs, forced: false });
    assert.equal(
      got,
      expect,
      `which_key_ms=${whichKeyMs}, elapsed=${elapsedMs} must be exactly ${expect} (got ${String(got)})`,
    );
  }
});

test("whichkey: a garbage which_key_ms never paints a panel", () => {
  for (const whichKeyMs of [NaN, Infinity, -Infinity, "400", undefined, null, {}]) {
    assert.equal(
      shouldShow({ pendingKeys: "g", elapsedMs: 1e9, whichKeyMs, forced: false }),
      false,
      `which_key_ms=${String(whichKeyMs)} must not show`,
    );
  }
});

test("whichkey: a garbage elapsedMs never paints a panel, even past a met threshold", () => {
  // Each of these would satisfy a naive `elapsedMs >= whichKeyMs` by coercion
  // or by Infinity, so the guard is the only thing that can produce false.
  for (const elapsedMs of [Infinity, "500", NaN, null, undefined, -1, {}]) {
    assert.equal(
      shouldShow({ pendingKeys: "g", elapsedMs, whichKeyMs: 400, forced: false }),
      false,
      `elapsed=${String(elapsedMs)} must not show`,
    );
  }
});

// 9. the empty-prefix guard vs. forced, asserted separately -------------------

test("whichkey: an empty pending sequence never shows — which-key is not a permanent HUD", () => {
  // Maximal elapsed, minimal threshold: the empty prefix is the ONLY thing
  // that can make this false.
  assert.equal(
    shouldShow({ pendingKeys: "", elapsedMs: 9999, whichKeyMs: 0, forced: false }),
    false,
  );
});

test("whichkey: forced shows the root list on an empty prefix without waiting out which_key_ms", () => {
  // Zero elapsed against an unmet threshold: `forced` is the ONLY thing that
  // can make this true.
  assert.equal(
    shouldShow({ pendingKeys: "", elapsedMs: 0, whichKeyMs: 400, forced: true }),
    true,
  );
});

test("whichkey: which_key_ms = -1 disables the feature outright, outranking forced", () => {
  assert.equal(
    shouldShow({ pendingKeys: "", elapsedMs: 0, whichKeyMs: -1, forced: true }),
    false,
    "-1 disables the root list too, not just the pending-prefix panel",
  );
  assert.equal(
    shouldShow({ pendingKeys: "g", elapsedMs: 1e9, whichKeyMs: -1, forced: true }),
    false,
  );
});

test("whichkey: forced is strict — a truthy non-true value is not forced", () => {
  for (const forced of [1, "yes", {}, [], "true"]) {
    assert.equal(
      shouldShow({ pendingKeys: "", elapsedMs: 0, whichKeyMs: 400, forced }),
      false,
      `forced=${JSON.stringify(forced)} must not open the root list`,
    );
  }
});

test("whichkey: a non-string pendingKeys never shows — the engine's buffer is a string", () => {
  for (const pendingKeys of [["g"], 42, null, undefined, {}, { length: 1 }]) {
    assert.equal(
      shouldShow({ pendingKeys, elapsedMs: 9999, whichKeyMs: 0, forced: false }),
      false,
      `pendingKeys=${String(pendingKeys)} must not show`,
    );
  }
});

test("whichkey: shouldShow returns a primitive boolean and tolerates a missing or non-object argument", () => {
  for (const arg of [undefined, null, "g", 42, [], true]) {
    let got;
    assert.doesNotThrow(() => {
      got = shouldShow(arg);
    }, `shouldShow(${String(arg)}) must not throw`);
    assert.equal(got, false, `shouldShow(${String(arg)}) must be exactly false`);
  }
  assert.equal(
    typeof shouldShow({ pendingKeys: "g", elapsedMs: 400, whichKeyMs: 400, forced: false }),
    "boolean",
  );
});

// 10. 200 synthetic bindings under one prefix ---------------------------------

test("whichkey: 200 bindings under one prefix stay complete, deterministically ordered, and cappable", () => {
  const fx = {};
  for (let i = 0; i < 200; i++) fx[`git:${i}`] = "top";
  fx.j = "scroll_down"; // decoy outside the prefix

  const all = candidatesFor(fx, "git:");
  assert.equal(all.length, 200, "the decoy is excluded and nothing is lost");

  // The sort rule spelled out concretely rather than as "deterministic":
  // length ascending, then codepoint. For 0..199 that is exactly ascending
  // numeric order (1-digit block, then 2-digit, then 3-digit). A plain
  // lexicographic sort would start ["0","1","10","100",…] and fail here.
  const expected = Array.from({ length: 200 }, (_, i) => String(i));
  assert.deepEqual(all.map(r => r.remaining), expected);

  const again = candidatesFor(fx, "git:");
  assert.deepEqual(again, all, "equal inputs give deep-equal outputs");
  assert.notEqual(again, all, "and a fresh array every call");

  const capped = truncate(all, 8);
  assert.equal(capped.rows.length, 8, "capped at palette_max_items");
  assert.equal(capped.moreCount, 192);
  assert.deepEqual(capped.rows, all.slice(0, 8), "the cap takes the first rows, in order");

  assert.equal(Object.keys(fx).length, 201, "the keymap fixture is never mutated");
});

// 10b. the shipped composition: root list vs. the shipped cap ------------------

test("whichkey: the default root list is longer than palette_max_items, and the cap eats the everyday keys", () => {
  // The one composition that actually ships, which every other truncate test
  // avoids by using synthetic rows. It is asserted here because the glue has a
  // decision to make that no test can make for it: spec §2 justifies the cap
  // with a MOD case ("a mod that defines 40 `git:` commands must not paint a
  // full-screen wall"), and then spec §2 also calls the root list "the *what
  // can I even do* surface". Applying 8 to a ~21-row root list satisfies the
  // first sentence by destroying the second — code-point order puts every
  // punctuation and shift binding above every lowercase one, so the cap
  // removes exactly the half a beginner needs.
  //
  // Nothing here pins the glue's answer (pass rows.length as max when forced,
  // or amend the spec to make the cap prefix-path-only). It pins the facts
  // that make the answer necessary, so they cannot quietly stop being true.
  const cap = AetherConfig.DEFAULTS.options.palette_max_items;
  const rows = candidatesFor(DEFAULT_KEYMAP, "");
  const out = truncate(rows, cap);

  assert.ok(
    rows.length > cap,
    `the root list (${rows.length}) is longer than palette_max_items (${cap}) — capping it is a real choice, not a no-op`,
  );
  const hidden = new Set(rows.slice(cap).map(r => r.sequence));
  for (const everyday of ["j", "k", "gg"]) {
    assert.ok(
      Object.hasOwn(DEFAULT_KEYMAP, everyday),
      `'${everyday}' must still be a default binding for this guard to mean anything`,
    );
    assert.ok(
      hidden.has(everyday),
      `'${everyday}' survives the palette_max_items cap on the root list — re-read this test's comment before deleting it`,
    );
  }
  assert.equal(out.moreCount, rows.length - cap, "and the remainder is reported honestly");
});

// 14. hostile input: total functions ------------------------------------------

test("whichkey: a keymap that is not a plain table yields an empty list instead of nonsense rows", () => {
  // Object.keys("gg") is ["0","1"] and Object.keys([["gg","top"]]) is ["0"] —
  // an unguarded implementation happily emits rows for both.
  for (const [keymap, prefix] of [
    [null, "g"],
    [undefined, "g"],
    ["gg", "g"],
    ["gg", ""],
    [42, "g"],
    [true, ""],
    [[["gg", "top"]], ""],
    [["top", "back"], ""],
    [() => {}, ""],
  ]) {
    let rows;
    assert.doesNotThrow(() => {
      rows = candidatesFor(keymap, prefix);
    }, `candidatesFor(${String(keymap)}, ${JSON.stringify(prefix)}) must not throw`);
    assert.deepEqual(rows, [], `candidatesFor(${String(keymap)}, …) must be empty`);
  }
});

test("whichkey: a non-string prefix is treated as empty, never stringified", () => {
  // If `null` became "null", `nullable` would match and `gg` would not.
  const fx = { nullable: "top", gg: "back" };
  for (const prefix of [null, undefined, {}, [], true]) {
    const rows = candidatesFor(fx, prefix);
    assert.deepEqual(
      rows.map(r => r.sequence).sort(),
      ["gg", "nullable"],
      `prefix ${String(prefix)} must behave as the empty prefix`,
    );
  }
  // and the numeric case, where String(0) === "0" would match a real key
  const numeric = { "0k": "top", gg: "back" };
  assert.equal(candidatesFor(numeric, 0).length, 2, "prefix 0 must not become '0'");
});

test("whichkey: a non-object registry falls back to raw command names instead of throwing", () => {
  // Object.hasOwn(null, name) throws, so the guard must sit BEFORE the
  // delegation to describeCommand. Note `undefined` is deliberately absent
  // from this list — it is the default-parameter case, covered below.
  for (const registry of [null, {}, "nope", 42, [], true]) {
    let rows;
    assert.doesNotThrow(() => {
      rows = candidatesFor({ gg: "top" }, "g", registry);
    }, `registry=${String(registry)} must not throw`);
    assert.equal(rows.length, 1, `registry=${String(registry)} must not lose the row`);
    assert.equal(
      rows[0].description,
      "top",
      `registry=${String(registry)} must fall back to the raw name, not undefined`,
    );
  }
});

test("whichkey: an omitted registry means the shipped REGISTRY, not an empty one", () => {
  // The hostile-registry guard above must not swallow the default: guarding
  // with `isTable(registry) ? registry : {}` and defaulting the parameter to
  // undefined would make every row show its raw command name forever.
  for (const call of [
    () => candidatesFor({ gg: "top" }, "g"),
    () => candidatesFor({ gg: "top" }, "g", undefined),
  ]) {
    const rows = call();
    assert.equal(rows.length, 1);
    assert.equal(
      rows[0].description,
      "scroll to the top of the page",
      "an omitted registry resolves real descriptions, exactly as :describe does",
    );
  }
});

// 15. prototype pollution inert ------------------------------------------------

test("whichkey: hostile keymap keys are inert data and never reach Object.prototype", () => {
  const before = protoKeyCount();
  const fx = JSON.parse('{"g_":"top","__proto__":"back","constructor":"back","prototype":"back"}');

  let rows;
  assert.doesNotThrow(() => {
    rows = candidatesFor(fx, "");
  });

  const own = new Set(Object.keys(fx));
  for (const r of rows) {
    assert.ok(own.has(r.sequence), `row '${r.sequence}' must be an own key of the keymap`);
  }
  assert.equal(rows.length, own.size, "hostile keys are rows like any other, never silently lost");

  assert.equal({}.remaining, undefined, "no prototype pollution");
  assert.equal({}.sequence, undefined, "no prototype pollution");
  assert.equal({}.description, undefined, "no prototype pollution");
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(protoKeyCount(), before, "Object.prototype gained no keys");
});

test("whichkey: an inherited enumerable key contributes no row — enumeration is own-keys only", () => {
  // `for (const s in keymap)` walks the prototype chain and is otherwise
  // indistinguishable from Object.keys on a literal, so this is the only test
  // that separates the two. A polluted Object.prototype — from a mod, a
  // dependency, or a sync'd profile — must not inject phantom bindings into
  // the panel, and must not inject them into the *sorted, capped* list where
  // they would push real bindings under the "+N more" line.
  Object.defineProperty(Object.prototype, "gPhantom", {
    value: "tab_close",
    enumerable: true,
    configurable: true,
    writable: true,
  });
  try {
    const rows = candidatesFor({ gg: "top" }, "g");
    assert.deepEqual(rows.map(r => r.sequence), ["gg"], "no inherited key becomes a row");
    assert.deepEqual(
      candidatesFor({ gg: "top" }, "").map(r => r.sequence),
      ["gg"],
      "and the root list is own-keys only too",
    );
  } finally {
    delete Object.prototype.gPhantom;
  }
  assert.equal({}.gPhantom, undefined, "the fixture cleaned up after itself");
});

test("whichkey: a keymap or registry accessor is never invoked during a render pass", () => {
  // Plain `keymap[sequence]` and `registry[command]` indexing passes every
  // other test in this file, because no other fixture binds anything to a
  // getter. Which-key renders on a keydown pause, on a table that mods and a
  // sync'd profile can both reach: a getter here would run code inside the
  // render, could throw into the keydown handler, and could return different
  // rows for identical arguments.
  let keymapReads = 0;
  let registryReads = 0;
  let descriptionReads = 0;

  // Built by defineProperty, never by spread — an object spread would invoke
  // the getter itself and the counters below would start at 1.
  const fx = { gq: "top", gr: "reload" };
  Object.defineProperty(fx, "gg", {
    get() {
      keymapReads++;
      return "bottom";
    },
    enumerable: true,
    configurable: true,
  });

  const registry = {
    top: { description: "scroll to the top of the page", risk: "read" },
  };
  Object.defineProperty(registry, "bottom", {
    get() {
      registryReads++;
      return { description: "scroll to the bottom", risk: "read" };
    },
    enumerable: true,
    configurable: true,
  });
  const withGetterDescription = { risk: "read" };
  Object.defineProperty(withGetterDescription, "description", {
    get() {
      descriptionReads++;
      return "computed at render time";
    },
    enumerable: true,
    configurable: true,
  });
  registry.reload = withGetterDescription;

  let rows;
  assert.doesNotThrow(() => {
    rows = candidatesFor(fx, "g", registry);
  });
  assert.equal(keymapReads, 0, "a keymap accessor is read by descriptor, never invoked");
  assert.equal(registryReads, 0, "a registry accessor is read by descriptor, never invoked");
  assert.equal(descriptionReads, 0, "a description accessor is read by descriptor, never invoked");

  // …and what the descriptor read costs, stated rather than implied: a getter
  // binding has no `value`, so it is dropped, and a getter description falls
  // back to the raw command name. The dropped-binding half is a live
  // divergence from aether-keys' `normal[seq]` dispatch (which WOULD fire it);
  // aether-keys is not r3's file, so this pins which-key's conservative half.
  assert.deepEqual(
    rows.map(r => [r.sequence, r.description]),
    [["gq", "scroll to the top of the page"], ["gr", "reload"]],
    "gg (accessor binding) is dropped; gr keeps its row with the raw-name fallback",
  );
});

test("whichkey: a keymap accessor that throws does not take the render pass down with it", () => {
  const fx = { gq: "top" };
  Object.defineProperty(fx, "gg", {
    get() {
      throw new Error("boom");
    },
    enumerable: true,
    configurable: true,
  });
  let rows;
  assert.doesNotThrow(() => {
    rows = candidatesFor(fx, "g");
  }, "a hostile keymap must not throw out of the keydown path");
  assert.deepEqual(rows.map(r => r.sequence), ["gq"]);
});

test("whichkey: truncate and shouldShow fed hostile objects leave Object.prototype clean", () => {
  const before = protoKeyCount();
  const evilRows = JSON.parse('[{"__proto__":{"x":1}}]');
  const evilOpts = JSON.parse('{"__proto__":{"x":1},"pendingKeys":"g","elapsedMs":400,"whichKeyMs":400}');

  assert.doesNotThrow(() => truncate(evilRows, 8));
  assert.doesNotThrow(() => shouldShow(evilOpts));
  assert.equal({}.x, undefined, "no prototype pollution");
  assert.equal(protoKeyCount(), before, "Object.prototype gained no keys");
});

test("whichkey: a polluted Object.prototype cannot conjure a permanent HUD out of an empty state", () => {
  // The exact hazard candidatesFor is hardened against, pointed at shouldShow.
  // A destructure — `const {whichKeyMs, forced} = state` — walks the prototype
  // chain, so two polluted keys turn shouldShow({}) into `true` FOREVER: the
  // panel paints with no pending sequence and no `?` press, which is precisely
  // the "never a permanent HUD" guard (spec §2) inverted. Every other
  // shouldShow test passes all four fields explicitly and cannot see this.
  const before = protoKeyCount();
  for (const key of ["whichKeyMs", "forced", "pendingKeys", "elapsedMs"]) {
    Object.defineProperty(Object.prototype, key, {
      value: key === "forced" ? true : key === "pendingKeys" ? "g" : 0,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  try {
    assert.equal(shouldShow({}), false, "an empty state is empty, whatever the prototype says");
    assert.equal(
      shouldShow({ pendingKeys: "g", elapsedMs: 400 }),
      false,
      "an inherited which_key_ms must not enable a feature the config disabled",
    );
    assert.equal(
      shouldShow({ whichKeyMs: 400, elapsedMs: 0, pendingKeys: "" }),
      false,
      "an inherited `forced` must not open the root list",
    );
    // and the own-property path still works with pollution in place
    assert.equal(
      shouldShow({ pendingKeys: "g", elapsedMs: 400, whichKeyMs: 400, forced: false }),
      true,
      "own fields still decide — the guard reads own data, it does not refuse work",
    );
  } finally {
    for (const key of ["whichKeyMs", "forced", "pendingKeys", "elapsedMs"]) {
      delete Object.prototype[key];
    }
  }
  assert.equal(protoKeyCount(), before, "the fixture cleaned up after itself");
});

test("whichkey: an accessor on the state object is never invoked — shouldShow stays total", () => {
  // shouldShow is called from the keydown path; its own header promises "a
  // non-object state is false rather than a throw". A plain destructure calls
  // getters, so a state object carrying one turns that promise into a throw
  // inside the key handler — and lets an untrusted object decide the answer
  // twice within one call.
  let reads = 0;
  const state = { pendingKeys: "g", elapsedMs: 400, forced: false };
  Object.defineProperty(state, "whichKeyMs", {
    get() {
      reads++;
      throw new Error("boom");
    },
    enumerable: true,
    configurable: true,
  });
  let got;
  assert.doesNotThrow(() => {
    got = shouldShow(state);
  }, "an accessor in the state must not throw out of the keydown path");
  assert.equal(reads, 0, "the accessor is read by descriptor, never invoked");
  assert.equal(got, false, "no readable which_key_ms means the feature is off, not on");
});

test("whichkey: a keymap carrying control characters and a huge key is handled as data", () => {
  const huge = "g" + "z".repeat(5000);
  const fx = { [huge]: "top", "g\u0000\u001b[31m": "bottom", "g\u2028": "back" };
  let rows;
  assert.doesNotThrow(() => {
    rows = candidatesFor(fx, "g");
  });
  assert.equal(rows.length, 3, "no key is dropped for being long or non-printable");
  assert.ok(
    rows.every(r => r.remaining === r.sequence.slice(1)),
    "remaining is a plain slice, with no sanitising or truncation of its own",
  );
});

// 16. purity and determinism ---------------------------------------------------

test("whichkey: candidatesFor never mutates its keymap and allocates fresh rows every call", () => {
  const snapshot = structuredClone(DEFAULT_KEYMAP);
  const a = candidatesFor(DEFAULT_KEYMAP, "g");
  const b = candidatesFor(DEFAULT_KEYMAP, "g");

  assert.deepEqual(DEFAULT_KEYMAP, snapshot, "the caller's keymap is untouched");
  assert.deepEqual(a, b, "equal inputs, deep-equal outputs");
  assert.notEqual(a, b, "a fresh array each call");
  assert.notEqual(a[0], b[0], "fresh row objects — never a shared cache the glue could mutate");
});

test("whichkey: candidatesFor never mutates the registry it is handed", () => {
  const registry = structuredClone(FIXTURE_REGISTRY);
  const snapshot = structuredClone(FIXTURE_REGISTRY);
  candidatesFor({ zk: "known", zb: "bare", zx: "unknown_thing" }, "z", registry);
  assert.deepEqual(registry, snapshot, "the registry is read-only to which-key");
});

test("whichkey: truncate is deterministic and leaves its options untouched", () => {
  const input = syntheticRows(12);
  const snapshot = structuredClone(input);
  assert.deepEqual(truncate(input, 8), truncate(input, 8));
  assert.deepEqual(input, snapshot);
});

// 17. no wall-clock, no timers, no host globals -------------------------------

const MODULE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "chrome",
  "JS",
  "aether-whichkey.sys.mjs",
);

// Comments are prose and may legitimately name the things the code must not
// use; the ban is on code.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}

test("whichkey: the module reads no clock, starts no timer, and touches no host global", () => {
  // elapsedMs being a parameter is the spec's central claim ("the panel is
  // never the reason a keystroke is delayed"). This is what makes it true
  // rather than incidental: the module has no way to ask what time it is.
  const code = stripComments(readFileSync(MODULE_PATH, "utf8"));
  for (const banned of [
    /\bDate\b/,
    /\bperformance\b/,
    /\bsetTimeout\b/,
    /\bsetInterval\b/,
    /\brequestAnimationFrame\b/,
    /\brequestIdleCallback\b/,
    /\bqueueMicrotask\b/,
    /\bServices\b/,
    /\bIOUtils\b/,
    /\bPathUtils\b/,
    /\bCi\b/,
    /\bCc\b/,
    /\bdocument\b/,
    /\bwindow\b/,
    /\bglobalThis\b/,
    /\bprocess\b/,
    /Math\.random/,
    /\bfetch\b/,
    /\blocaleCompare\b/,
    /\bIntl\b/,
  ]) {
    assert.ok(!banned.test(code), `aether-whichkey.sys.mjs must not use ${banned}`);
  }
});

test("whichkey: the module imports only the two pure modules it is allowed to read", () => {
  const code = stripComments(readFileSync(MODULE_PATH, "utf8"));
  const specifiers = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]);
  for (const s of specifiers) {
    assert.ok(
      s === "./aether-keys.sys.mjs" || s === "./aether-palette.sys.mjs",
      `unexpected import '${s}' — which-key may read only aether-keys and aether-palette`,
    );
  }
  assert.ok(
    !/\bimport\s*\(/.test(code),
    "no dynamic import — the module must load in a bare node --test process",
  );
});
