// r4 — Keys: the `panel` mode and the `await_arg` decision kind (SDD RED).
// Spec: overlay/specs/r4-panel-primitive-and-tab-panel.md §2 "The primitive",
// "Marks and pins", §3 (aether-keys.sys.mjs), §4 tests 17–19.
//
// Contract pinned here for overlay/chrome/JS/aether-keys.sys.mjs, on top of
// the f1 contract (which stays exactly as it was):
//
//   mode "panel" — printables pass through to the panel's search input
//     (mirrors "palette"), while the panel's keyboard contract is ours:
//       ArrowDown -> {kind:"action", command:"panel_next"}
//       ArrowUp   -> {kind:"action", command:"panel_prev"}
//       Tab       -> {kind:"action", command:"panel_cycle"}   (cycle actions)
//       Enter     -> {kind:"action", command:"panel_run"}     (primary action)
//       C-Space   -> {kind:"action", command:"panel_mark"}    (toggle a mark)
//       Escape    -> {kind:"action", command:"esc"}, mode normal
//     Reserved chords stay OURS in panel mode too — f1's core proof, which
//     must not regress in a new mode.
//
//   {kind:"await_arg", command} — the decision for a binding whose value ends
//     in "<char>" ("m" = "mark_set<char>"). The engine holds the command, the
//     next key supplies the argument, and exactly one action is dispatched:
//       {kind:"action", command:"mark_set", args:["a"]}
//     Escape cancels (nothing dispatched); handleTimeout() cancels; a chord
//     or a non-printable cancels and is handled as it would have been.
//
//   parseBinding(value) -> {command, args, awaitsArg} — the keymap value
//     grammar, exported so which-key (r3) and the panel (r4) read a binding
//     the same way the engine does.
//
//   Every {kind:"action"} decision carries `args` (a string array, empty for a
//   plain binding) so the glue dispatches registry commands uniformly.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine, parseBinding } from "../../chrome/JS/aether-keys.sys.mjs";
import {
  parseToml,
  deepMerge,
  AetherConfig,
} from "../../chrome/JS/aether-config.sys.mjs";

const DEFAULTS = AetherConfig.DEFAULTS;

function k(key, mods = {}) {
  return { key, ctrl: false, alt: false, meta: false, ...mods };
}

function engine(config = DEFAULTS) {
  return createEngine(config);
}

// A keymap that exercises the r4 shapes without touching the shipped defaults
// (the bindings themselves land with r4's own feature work).
function markConfig(extra = "") {
  return deepMerge(
    DEFAULTS,
    parseToml(`
[keymap.normal]
"m" = "mark_set<char>"
"'" = "mark_jump<char>"
"gm" = "mark_set<char>"
"1" = "tab_pin_goto 1"
${extra}
`),
  );
}

// 17. panel mode: printables through, the contract keys ours -----------------

test("keys: panel mode passes printables through to the search input", () => {
  const e = engine();
  e.setMode("panel");
  for (const key of ["t", "a", "b", "Z", "3", " "]) {
    assert.equal(
      e.handleKey(k(key)).kind,
      "passthrough",
      `printable ${JSON.stringify(key)} belongs to the panel's input`,
    );
  }
  assert.equal(e.mode, "panel", "typing never leaves panel mode");
});

test("keys: panel mode owns arrows, Tab, Enter and Ctrl+Space", () => {
  const cases = [
    [k("ArrowDown"), "panel_next"],
    [k("ArrowUp"), "panel_prev"],
    [k("Tab"), "panel_cycle"],
    [k("Enter"), "panel_run"],
    [k(" ", { ctrl: true }), "panel_mark"],
  ];
  for (const [descriptor, command] of cases) {
    const e = engine();
    e.setMode("panel");
    const d = e.handleKey(descriptor);
    assert.equal(d.kind, "action", `${command}: must be an action`);
    assert.equal(d.command, command);
    assert.equal(e.mode, "panel", `${command}: the panel stays open`);
  }
});

test("keys: panel mode leaves the rest of the keyboard alone", () => {
  const e = engine();
  e.setMode("panel");
  for (const key of ["F5", "Home", "ArrowLeft", "ArrowRight", "Backspace"]) {
    assert.equal(e.handleKey(k(key)).kind, "passthrough", `${key} is not ours`);
  }
  assert.equal(e.handleKey(k("c", { ctrl: true })).kind, "passthrough");
});

test("keys: Escape closes the panel and lands in normal", () => {
  const e = engine();
  e.setMode("panel");
  const d = e.handleKey(k("Escape"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "esc");
  assert.equal(e.mode, "normal");
  assert.equal(e.buffer, "");
});

// 18. reserved chords still fire in panel mode (f1's core proof) -------------

test("keys: reserved chord (remapped C-t) is OURS in panel mode too", () => {
  const config = deepMerge(
    DEFAULTS,
    parseToml(`
[keymap.reserved]
"C-t" = "reserved_proof"
`),
  );
  const e = engine(config);
  e.setMode("panel");
  const d = e.handleKey(k("t", { ctrl: true }));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "reserved_proof");
});

test("keys: every shipped reserved chord fires in panel mode", () => {
  for (const [combo, descriptor] of [
    ["C-w", k("w", { ctrl: true })],
    ["C-t", k("t", { ctrl: true })],
    ["C-n", k("n", { ctrl: true })],
    ["C-Tab", k("Tab", { ctrl: true })],
  ]) {
    const e = engine();
    e.setMode("panel");
    const d = e.handleKey(descriptor);
    assert.equal(d.kind, "action", `${combo} must stay ours in panel mode`);
    assert.equal(d.command, DEFAULTS.keymap.reserved[combo]);
  }
});

test("keys: a panel command enters panel mode the way ':' enters palette mode", () => {
  const config = deepMerge(DEFAULTS, parseToml(`
[keymap.normal]
"T" = "tabs"
`));
  const e = engine(config);
  const d = e.handleKey(k("T"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "tabs");
  assert.equal(e.mode, "panel");
});

// 19. await_arg ---------------------------------------------------------------

test("keys: 'm' awaits a character, then dispatches mark_set once with it", () => {
  const e = engine(markConfig());
  const first = e.handleKey(k("m"));
  assert.equal(first.kind, "await_arg");
  assert.equal(first.command, "mark_set");
  assert.equal(e.awaiting, "mark_set", "the engine holds the pending command");

  const second = e.handleKey(k("a"));
  assert.equal(second.kind, "action");
  assert.equal(second.command, "mark_set");
  assert.deepEqual(second.args, ["a"]);
  assert.equal(e.awaiting, null, "the wait is over after one character");
  assert.equal(e.buffer, "");
});

test("keys: any character is a valid mark, including caps, digits and punctuation", () => {
  for (const char of ["a", "Z", "7", "'", "/"]) {
    const e = engine(markConfig());
    e.handleKey(k("m"));
    const d = e.handleKey(k(char));
    assert.equal(d.kind, "action", `${char} must be captured`);
    assert.deepEqual(d.args, [char]);
  }
});

test("keys: 'm' then Escape cancels — nothing is dispatched", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  const d = e.handleKey(k("Escape"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "esc", "Escape is Escape, never a mark of Escape");
  assert.equal(e.awaiting, null);
  assert.equal(e.mode, "normal");

  // and the next key is an ordinary normal-mode key again
  const after = e.handleKey(k("j"));
  assert.equal(after.command, "scroll_down");
});

test("keys: the pending timeout cancels an outstanding await_arg", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  assert.equal(e.awaiting, "mark_set");
  assert.equal(e.handleTimeout().kind, "swallow");
  assert.equal(e.awaiting, null);

  const after = e.handleKey(k("a"));
  assert.equal(after.kind, "action");
  assert.equal(after.command, "ai", "'a' is an ordinary binding again");
});

test("keys: a multi-key sequence can await an argument too ('gm' then 'x')", () => {
  const e = engine(markConfig());
  assert.equal(e.handleKey(k("g")).kind, "pending");
  const await_ = e.handleKey(k("m"));
  assert.equal(await_.kind, "await_arg");
  assert.equal(await_.command, "mark_set");
  assert.equal(e.buffer, "", "the sequence buffer is spent");
  const d = e.handleKey(k("x"));
  assert.deepEqual(d.args, ["x"]);
});

test("keys: a non-printable during an await cancels it and passes through", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  const d = e.handleKey(k("F5"));
  assert.equal(d.kind, "passthrough");
  assert.equal(e.awaiting, null);
});

test("keys: a reserved chord during an await fires the chord and cancels the await", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  const d = e.handleKey(k("w", { ctrl: true }));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "tab_close");
  assert.equal(e.awaiting, null, "no mark_set is left waiting behind the chord");
});

test("keys: an unreserved chord during an await cancels it and passes through", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  const d = e.handleKey(k("c", { ctrl: true }));
  assert.equal(d.kind, "passthrough");
  assert.equal(e.awaiting, null);
});

test("keys: setMode clears an outstanding await", () => {
  const e = engine(markConfig());
  e.handleKey(k("m"));
  e.setMode("insert");
  assert.equal(e.awaiting, null);
});

// the keymap value grammar ----------------------------------------------------

test("keys: parseBinding reads plain, argument-carrying and awaiting values", () => {
  assert.deepEqual(parseBinding("reload"), {
    command: "reload",
    args: [],
    awaitsArg: false,
  });
  assert.deepEqual(parseBinding("tab_pin_goto 1"), {
    command: "tab_pin_goto",
    args: ["1"],
    awaitsArg: false,
  });
  assert.deepEqual(parseBinding("mark_set<char>"), {
    command: "mark_set",
    args: [],
    awaitsArg: true,
  });
  assert.deepEqual(parseBinding("ws main<char>"), {
    command: "ws",
    args: ["main"],
    awaitsArg: true,
  });
});

test("keys: parseBinding tolerates hostile values instead of throwing", () => {
  for (const value of [undefined, null, 42, {}, [], "", "   ", "<char>"]) {
    const out = parseBinding(value);
    assert.equal(typeof out.command, "string", `${JSON.stringify(value)}`);
    assert.ok(Array.isArray(out.args));
    assert.equal(typeof out.awaitsArg, "boolean");
  }
  assert.equal(parseBinding("").command, "");
  assert.equal(parseBinding("<char>").command, "");
});

test("keys: a binding with literal arguments dispatches command and args apart", () => {
  const e = engine(markConfig());
  const d = e.handleKey(k("1"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "tab_pin_goto", "the glue looks up a bare command name");
  assert.deepEqual(d.args, ["1"]);
});

test("keys: an ordinary action carries an empty args array", () => {
  const e = engine();
  const d = e.handleKey(k("j"));
  assert.equal(d.command, "scroll_down");
  assert.deepEqual(d.args, []);
});

test("keys: an empty binding value never dispatches a nameless command", () => {
  const e = engine(deepMerge(DEFAULTS, parseToml(`
[keymap.normal]
"z" = ""
`)));
  const d = e.handleKey(k("z"));
  assert.equal(d.kind, "swallow", "a broken binding is inert, not a crash");
});
