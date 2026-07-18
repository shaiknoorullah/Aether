// f1 — Keys: behavioral tests for the pure modal key engine (SDD RED).
// Spec: overlay/specs/f1-keys-and-palette.md §2, §4 (tests 1–12).
//
// Contract pinned by these tests (the implementation follows the tests):
//   createEngine(config)  — config is the merged AetherConfig shape
//     engine.mode    : "normal" | "insert" | "hint" | "palette"  (readable)
//     engine.buffer  : current pending sequence, "" when none    (readable)
//     engine.setMode(mode)
//     engine.handleKey(descriptor) -> decision
//     engine.handleTimeout()       -> decision (glue injects pending expiry)
//   Descriptors are plain objects {key, ctrl, alt, meta} — never KeyboardEvent.
//   Decisions:
//     {kind: "action", command}          (glue consumes the event + dispatches;
//                                         hint keys: command "hint_key", plus
//                                         the pressed char as decision.key)
//     {kind: "pending", buffer}
//     {kind: "passthrough"}
//     {kind: "swallow"}
//   No timers, no DOM, no Services anywhere in the module.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../../chrome/JS/aether-keys.sys.mjs";
import {
  parseToml,
  deepMerge,
  AetherConfig,
} from "../../chrome/JS/aether-config.sys.mjs";

const DEFAULTS = AetherConfig.DEFAULTS;

// Descriptor helper: unmodified unless overridden.
function k(key, mods = {}) {
  return { key, ctrl: false, alt: false, meta: false, ...mods };
}

function engine(config = DEFAULTS) {
  return createEngine(config);
}

// 1. single bound key in normal → action ------------------------------------

test("keys: bound printable in normal returns its action", () => {
  const e = engine();
  const d = e.handleKey(k("j"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "scroll_down");
});

// 2. multi-key sequence: g → pending, gg → top ------------------------------

test("keys: 'g' goes pending with buffer 'g'; second 'g' fires 'top' and clears", () => {
  const e = engine();
  const first = e.handleKey(k("g"));
  assert.equal(first.kind, "pending");
  assert.equal(first.buffer, "g");
  assert.equal(e.buffer, "g");

  const second = e.handleKey(k("g"));
  assert.equal(second.kind, "action");
  assert.equal(second.command, "top");
  assert.equal(e.buffer, "");
});

// 3. injected timeout clears pending ----------------------------------------

test("keys: handleTimeout clears pending; next key matches fresh", () => {
  const e = engine();
  e.handleKey(k("g"));
  assert.equal(e.buffer, "g");

  assert.doesNotThrow(() => e.handleTimeout());
  assert.equal(e.buffer, "");

  // 'g' after expiry starts a fresh sequence — pending again, NOT 'top'.
  const d = e.handleKey(k("g"));
  assert.equal(d.kind, "pending");
  assert.equal(d.buffer, "g");
});

// 4. unmatched printable in normal → swallow, pending cleared ---------------

test("keys: unmatched printable in normal is swallowed, never passthrough", () => {
  const e = engine();
  const d = e.handleKey(k("q"));
  assert.equal(d.kind, "swallow");
  assert.equal(e.buffer, "");
});

test("keys: dead-end sequence ('g' then 'z') is swallowed and clears the buffer", () => {
  const e = engine();
  e.handleKey(k("g"));
  const d = e.handleKey(k("z"));
  assert.equal(d.kind, "swallow");
  assert.equal(e.buffer, "");
});

// 5. unmodified non-printables in normal → passthrough ----------------------

test("keys: ArrowDown / F5 / Tab in normal pass through to Firefox", () => {
  const e = engine();
  for (const key of ["ArrowDown", "F5", "Tab"]) {
    const d = e.handleKey(k(key));
    assert.equal(d.kind, "passthrough", `expected passthrough for ${key}`);
  }
});

// 6. unreserved modified chord in normal → passthrough ----------------------

test("keys: unreserved chord C-c in normal passes through", () => {
  const e = engine();
  const d = e.handleKey(k("c", { ctrl: true }));
  assert.equal(d.kind, "passthrough");
});

// 7. reserved-chord proof: remapped C-t is OURS in every mode ---------------

test("keys: reserved chord (remapped C-t) returns OUR action in normal, insert, hint, and palette", () => {
  const config = deepMerge(
    DEFAULTS,
    parseToml(`
[keymap.reserved]
"C-t" = "reserved_proof"
`),
  );
  for (const mode of ["normal", "insert", "hint", "palette"]) {
    const e = engine(config);
    e.setMode(mode);
    const d = e.handleKey(k("t", { ctrl: true }));
    assert.equal(d.kind, "action", `mode ${mode}: reserved chord must be an action`);
    assert.equal(
      d.command,
      "reserved_proof",
      `mode ${mode}: reserved chord must run the remapped command`,
    );
  }
});

// 8. insert mode -------------------------------------------------------------

test("keys: insert mode passes printables through; Escape returns to normal", () => {
  const e = engine();
  e.setMode("insert");

  assert.equal(e.handleKey(k("j")).kind, "passthrough");
  assert.equal(e.handleKey(k("x")).kind, "passthrough");

  const esc = e.handleKey(k("Escape"));
  assert.equal(esc.kind, "action");
  assert.equal(esc.command, "esc");
  assert.equal(e.mode, "normal");
});

// 9. hint mode ---------------------------------------------------------------

test("keys: hint mode — single letters are hint-key actions, chords pass through, Escape exits", () => {
  const e = engine();
  e.setMode("hint");

  const d = e.handleKey(k("a"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "hint_key");
  assert.equal(d.key, "a");

  assert.equal(e.handleKey(k("c", { ctrl: true })).kind, "passthrough");

  e.handleKey(k("Escape"));
  assert.equal(e.mode, "normal");
});

// 10. ':' opens the palette --------------------------------------------------

test("keys: ':' in normal fires the palette action and enters palette mode; printables then pass to the input", () => {
  const e = engine();
  const d = e.handleKey(k(":"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "palette");
  assert.equal(e.mode, "palette");

  // Printables now belong to the chrome input strip.
  assert.equal(e.handleKey(k("t")).kind, "passthrough");
  assert.equal(e.handleKey(k("a")).kind, "passthrough");
});

// 11. Escape from every non-normal mode lands in normal, buffer cleared -----

test("keys: Escape from palette/hint/insert always lands in normal with cleared buffer", () => {
  for (const mode of ["palette", "hint", "insert"]) {
    const e = engine();
    e.setMode(mode);
    const d = e.handleKey(k("Escape"));
    assert.equal(d.kind, "action", `mode ${mode}`);
    assert.equal(d.command, "esc", `mode ${mode}`);
    assert.equal(e.mode, "normal", `mode ${mode}: Escape must land in normal`);
    assert.equal(e.buffer, "", `mode ${mode}: buffer must be cleared`);
  }
});

// 12. config keymap overrides defaults --------------------------------------

test("keys: user keymap override wins — remapped 'j' fires the new command, not the default", () => {
  const config = deepMerge(
    DEFAULTS,
    parseToml(`
[keymap.normal]
"j" = "tab_next"
`),
  );
  const e = engine(config);
  const d = e.handleKey(k("j"));
  assert.equal(d.kind, "action");
  assert.equal(d.command, "tab_next");
  assert.notEqual(d.command, "scroll_down");
});
