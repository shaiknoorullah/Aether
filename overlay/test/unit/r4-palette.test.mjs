// r4 — Palette surface: the ten new registry commands and the panel action
// inventory (SDD RED). Spec: overlay/specs/r4-panel-primitive-and-tab-panel.md
// §2 (new registry commands), §4 tests 20–22.
//
// The premise being defended: "every panel action is also a registry command",
// so the palette, a keybinding and (later) the agent can all reach anything the
// panel can do. That is a1's founding claim, and it is only true if the action
// table and the registry are checked against each other — which is what test 21
// below does.
//
// Note (analyst finding F14): TAB_ACTIONS[0] is "switch", and the registry has
// no command that switches to a tab BY ID — `tab <n>` is a 1-based positional
// index over a differently-ordered list. Until a Foundation-owned edit adds
//   tab_select: {min: 1, usage: "tab_select <id>",
//                description: "switch to a tab by id", risk: "navigate"}
// the inventory test is RED, and the default action Enter performs is the one
// action the palette cannot reach.

// Note (verifier): §2's "TOML surface" — the eleven bindings — is asserted at
// the bottom of this file rather than in an r4-config.test.mjs, because r4 owns
// no config test file. Those assertions are KNOWN RED and blocked on
// Foundation; see the header of section 23.

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
  complete,
  parse,
} from "../../chrome/JS/aether-palette.sys.mjs";

import { TAB_ACTIONS, ACTION_COMMANDS } from "../../chrome/JS/aether-tabsource.sys.mjs";

import {
  PANEL_EMPTY_MESSAGE,
  droppedMarksMessage,
  markSetMessage,
  noMarkMessage,
  moreRow,
} from "../../chrome/JS/aether-strings.sys.mjs";

// The ten commands §2 introduces, with the arity each one needs to be usable
// from the palette. tab_close is min 0 deliberately: `x` closes the current
// tab, so the id is optional (analyst finding F9).
const R4_COMMANDS = {
  tabs: 0,
  tab_close: 0,
  tab_rename: 2,
  tab_tag: 2,
  tab_move_ws: 2,
  tab_pin: 1,
  tab_duplicate: 1,
  tab_pin_goto: 1,
  mark_set: 1,
  mark_jump: 1,
};

// 20. registry membership, descriptions, risks, arity ------------------------

test("palette: every r4 command is in the registry with a real description and a known risk", () => {
  for (const name of Object.keys(R4_COMMANDS)) {
    const entry = commandEntry(name);
    assert.notEqual(entry, null, `${name} must be a registry command`);
    assert.equal(typeof entry.description, "string");
    assert.notEqual(entry.description.trim(), "", `${name} needs a description`);
    assert.notEqual(
      entry.description,
      name,
      `${name}'s description must be written, not the fallback echo of its own name`,
    );
    assert.ok(RISKS.includes(entry.risk), `${name}'s risk '${entry.risk}' must be one of RISKS`);
  }
});

test("palette: each r4 command declares the arity that makes it usable", () => {
  for (const [name, min] of Object.entries(R4_COMMANDS)) {
    assert.equal(commandEntry(name).min, min, `${name} min arity`);
    if (min > 0) {
      const usage = commandEntry(name).usage;
      assert.equal(typeof usage, "string", `${name} needs a usage line`);
      assert.ok(usage.startsWith(name), `${name}'s usage must name the command`);
    }
  }
});

test("palette: arity is enforced, so a half-typed destructive command never runs", () => {
  const short = parse("tab_rename 5");
  assert.equal(short.name, undefined, "a missing argument must not produce a runnable command");
  assert.equal(short.unknown, "tab_rename");
  assert.equal(short.usage, "tab_rename <id> <name>", "and the palette can say what was expected");

  const full = parse("tab_rename 5 Deploy runbook");
  assert.equal(full.name, "tab_rename");
  assert.deepEqual(full.args, ["5", "Deploy", "runbook"]);

  assert.equal(parse("tab_close").name, "tab_close", "closing the current tab needs no id");
  assert.equal(parse("tabs").name, "tabs", "opening the panel takes no argument");
  assert.equal(parse("mark_set").unknown, "mark_set", "a mark with no letter is not runnable");
  assert.equal(parse("mark_set a").name, "mark_set");
});

test("palette: complete('tab') finds the whole tab family including the panel itself", () => {
  const found = complete("tab", REGISTRY, 20);
  for (const name of ["tabs", "tab_close", "tab_rename", "tab_tag", "tab_pin", "tab_pin_goto", "tab_duplicate", "tab_move_ws"]) {
    assert.ok(found.includes(name), `complete('tab') must offer ${name}`);
  }
  assert.deepEqual([...found].sort(), found, "completions stay sorted");
});

test("palette: complete('mark') finds both mark commands", () => {
  const found = complete("mark", REGISTRY, 20);
  assert.ok(found.includes("mark_set"));
  assert.ok(found.includes("mark_jump"));
});

// 21. the action inventory ---------------------------------------------------

test("palette: every tab-panel action maps to a registry command", () => {
  for (const action of TAB_ACTIONS) {
    const command = ACTION_COMMANDS[action];
    assert.equal(typeof command, "string", `action '${action}' must name a command`);
    assert.notEqual(
      commandEntry(command),
      null,
      `action '${action}' maps to '${command}', which the registry does not have — ` +
        "the palette, a keybinding and the agent could never reach it",
    );
  }
});

test("palette: the action table and the command map cover exactly the same actions", () => {
  assert.equal(TAB_ACTIONS.length, Object.keys(ACTION_COMMANDS).length);
  assert.deepEqual([...TAB_ACTIONS].sort(), Object.keys(ACTION_COMMANDS).sort());
  assert.equal(TAB_ACTIONS[0], "switch", "the default action is index 0, which is what Enter performs on open");
  assert.equal(new Set(TAB_ACTIONS).size, TAB_ACTIONS.length, "no duplicate actions in the ring");
});

// 22. panel copy -------------------------------------------------------------

test("palette: panel copy is present, non-empty, and echoes what it was given", () => {
  assert.equal(typeof PANEL_EMPTY_MESSAGE, "string");
  assert.notEqual(PANEL_EMPTY_MESSAGE.trim(), "");

  const dropped = droppedMarksMessage(3);
  assert.ok(dropped.includes("3"), "the count of dropped marks is stated, not implied");
  const set = markSetMessage("a");
  assert.ok(set.includes("a"), "the letter that was set is named");
  const missing = noMarkMessage("a");
  assert.ok(missing.includes("a"), "and so is the letter that resolved to nothing");
  assert.ok(moreRow(7).includes("7"));
  for (const s of [dropped, set, missing, moreRow(7)]) {
    assert.equal(typeof s, "string");
    assert.notEqual(s.trim(), "");
  }
});

// 23. the keymap surface — LANDED in the glue pass -------------------------
//
// Spec §2 "TOML surface" lists eleven bindings, and §3 says `tabs_toggle` is
// deleted from REGISTRY, DEFAULTS, the example TOML and the README table.
// None of it has landed: `T` still opens the vertical strip this spec deletes,
// and `m`, `'` and `1`–`9` exist nowhere, so the panel, marks and pins are
// unreachable from the keyboard — mark_set/mark_jump/tab_pin_goto are palette
// strings and nothing else.
//
// This produced NO red anywhere, which is why it is asserted here: f1's
// whole-file sync guard compares DEFAULTS against the example TOML, so a
// binding missing from BOTH sides is perfectly in sync and perfectly absent.
// r4 owns neither aether-config.sys.mjs nor overlay/config/aether.toml nor
// aether-palette.sys.mjs, so these stay red until Foundation lands each
// binding in BOTH files as one edit (either side alone reds f1's guard).
//
// Every test in r4-panel/r4-tabsource is written to stay green either way:
// none of them reads the keymap.

const DEFAULTS = AetherConfig.DEFAULTS;
const EXAMPLE = parseToml(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "config", "aether.toml"), "utf8"),
);

const R4_NORMAL_KEYS = {
  T: "tabs",
  m: "mark_set<char>",
  "'": "mark_jump<char>",
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [String(i + 1), `tab_pin_goto ${i + 1}`])),
};

test("config: the eleven r4 bindings are in DEFAULTS", () => {
  for (const [key, command] of Object.entries(R4_NORMAL_KEYS)) {
    assert.equal(DEFAULTS.keymap.normal[key], command, `normal-mode '${key}' must be bound to ${command}`);
  }
});

test("config: the eleven r4 bindings are in the shipped example TOML too", () => {
  // A DEFAULTS-only landing reds f1's whole-file sync guard, which no feature
  // team owns — so both sides are asserted here, separately, to say which half
  // is missing.
  for (const [key, command] of Object.entries(R4_NORMAL_KEYS)) {
    assert.equal(EXAMPLE.keymap.normal[key], command, `aether.toml must bind '${key}' to ${command}`);
  }
});

test("config: T opens the tab panel, not the vertical strip this spec deletes", () => {
  assert.equal(DEFAULTS.keymap.normal.T, "tabs");
  assert.equal(EXAMPLE.keymap.normal.T, "tabs");
  assert.equal(
    commandEntry("tabs_toggle"),
    null,
    "tabs_toggle is deleted with the strip: leaving it registered leaves a completable command " +
      "that silently flips an attribute nothing reads",
  );
  assert.equal(Object.values(DEFAULTS.keymap.normal).includes("tabs_toggle"), false);
  assert.equal(Object.values(EXAMPLE.keymap.normal).includes("tabs_toggle"), false);
});

test("config: every normal-mode binding names a command the registry actually has", () => {
  // The standing guard the missing surface would otherwise slip past: a key
  // bound to a name nobody registered is a key that does nothing, silently.
  for (const [key, value] of Object.entries(DEFAULTS.keymap.normal)) {
    const name = String(value).replace(/<char>$/, "").split(" ")[0];
    assert.notEqual(commandEntry(name), null, `'${key}' is bound to '${value}', which is not a registry command`);
  }
});

test("config: the tab panel's default scope is the current workspace, in both files", () => {
  assert.equal(DEFAULTS.panels.scope, "workspace");
  assert.equal(EXAMPLE.panels.scope, "workspace");
});

test("palette: the r4 modules export no user-visible copy of their own", async () => {
  // All panel copy lives in aether-strings.sys.mjs, where the f6 lexicon sweep
  // can see it. A string exported from a source module would escape that sweep.
  for (const mod of ["aether-panel.sys.mjs", "aether-tabsource.sys.mjs"]) {
    const ns = await import(`../../chrome/JS/${mod}`);
    for (const [name, value] of Object.entries(ns)) {
      assert.notEqual(typeof value, "string", `${mod} exports the string '${name}' — copy belongs in aether-strings`);
    }
  }
});
