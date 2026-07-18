// f7 — Palette + widget surface: the three ai commands and the ai statusbar
// builtin (SDD RED). Spec: overlay/specs/f7-local-ai-sidebar.md §2
// "Statusbar"/"New registry commands", §3, §4 tests 17–18. Additive next to
// f5/f6 palette tests — earlier files stay untouched.
//
// Contract pinned here:
//   REGISTRY gains 'ai' (toggle sidebar), 'ai_on', 'ai_off' — all zero-arg,
//   completable.
//   BUILTINS.ai = {id: "ai", event-driven (no refresh schedule),
//     render(ctx) from ctx.ai = {enabled}} → text "ai on"/"ai off" with the
//     classes `aether-ai aether-ai-on|off`. A missing ctx.ai renders the OFF
//     state — absent state can only ever look off, never on.

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";
import {
  BUILTINS,
  createScheduler,
  renderWidget,
} from "../../chrome/JS/aether-widgets.sys.mjs";

function ctx(overrides = {}) {
  return {
    mode: "normal",
    buffer: "",
    url: "https://example.org/",
    message: "",
    tabCount: 1,
    nowMs: 0,
    locale: "en-GB",
    ...overrides,
  };
}

function classTokens(rendered) {
  return String(rendered.class ?? "").split(/\s+/).filter(Boolean);
}

// 17. registry membership, zero-arg parse, completion -------------------------

test("palette: 'ai', 'ai_on' and 'ai_off' are registry commands", () => {
  assert.ok("ai" in REGISTRY, "registry must contain 'ai'");
  assert.ok("ai_on" in REGISTRY, "registry must contain 'ai_on'");
  assert.ok("ai_off" in REGISTRY, "registry must contain 'ai_off'");
});

test("palette: each ai command parses with no args", () => {
  for (const name of ["ai", "ai_on", "ai_off"]) {
    const r = parse(name);
    assert.equal(r.name, name, `'${name}' is runnable bare`);
    assert.deepEqual(r.args, [], `'${name}' takes no args`);
  }
});

test("palette: complete('ai') → exactly the three ai commands, sorted", () => {
  assert.deepEqual(complete("ai", REGISTRY), ["ai", "ai_off", "ai_on"]);
});

// 18. the ai widget — the switch's state is always visible --------------------

test("widgets: 'ai' builtin renders 'ai on' with the on-class from ctx.ai", () => {
  const w = BUILTINS.ai;
  assert.ok(w, "BUILTINS must contain 'ai'");
  assert.equal(w.id, "ai");
  const r = renderWidget(w, ctx({ ai: { enabled: true } }));
  assert.equal(r.text, "ai on");
  const tokens = classTokens(r);
  assert.ok(tokens.includes("aether-ai"), `class carries aether-ai, got ${r.class}`);
  assert.ok(tokens.includes("aether-ai-on"), `class carries aether-ai-on, got ${r.class}`);
  assert.ok(!tokens.includes("aether-ai-off"), "never both states at once");
});

test("widgets: {enabled: false} renders 'ai off' with the off-class", () => {
  assert.ok(BUILTINS.ai, "BUILTINS must contain 'ai'");
  const r = renderWidget(BUILTINS.ai, ctx({ ai: { enabled: false } }));
  assert.equal(r.text, "ai off");
  const tokens = classTokens(r);
  assert.ok(tokens.includes("aether-ai"), `class carries aether-ai, got ${r.class}`);
  assert.ok(tokens.includes("aether-ai-off"), `class carries aether-ai-off, got ${r.class}`);
  assert.ok(!tokens.includes("aether-ai-on"), "off is off");
});

test("widgets: missing ctx.ai renders the OFF state — absent state can never look on", () => {
  assert.ok(BUILTINS.ai, "BUILTINS must contain 'ai'");
  const r = renderWidget(BUILTINS.ai, ctx()); // no ai key at all
  assert.equal(r.text, "ai off");
  assert.ok(classTokens(r).includes("aether-ai-off"), `off-class expected, got ${r.class}`);
  assert.ok(!classTokens(r).includes("aether-ai-on"), "never on by omission");
  assert.ok(!String(r.text).includes("undefined"), "no 'undefined' text ever");
});

test("widgets: 'ai' is event-driven — no refresh schedule", () => {
  assert.ok(BUILTINS.ai, "BUILTINS must contain 'ai'");
  assert.ok(!(BUILTINS.ai.refresh_s > 0), "refresh_s must be absent/0 (re-rendered on toggle)");
  const s = createScheduler([BUILTINS.ai], 0);
  assert.equal(s.periodMs, null, "an ai-only bar needs zero timers");
  assert.deepEqual(s.tick(3_600_000), []);
});
