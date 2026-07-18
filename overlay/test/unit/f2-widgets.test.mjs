// f2 — Statusbar Widgets: registry, config resolution, renders, scheduler
// (SDD RED). Spec: overlay/specs/f2-statusbar-widgets.md §2 "Exact behavior",
// §4 "Unit tests" items 1–15.
//
// Pure module under test: overlay/chrome/JS/aether-widgets.sys.mjs — must be
// importable in plain Node (no Services/Ci/IOUtils/DOM, no Date.now; the clock
// is injected as ctx.nowMs / scheduler nowMs arguments).

// Pin the timezone BEFORE any Intl/Date use so clock/date expectations are
// deterministic regardless of the host machine.
process.env.TZ = "UTC";

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BUILTINS,
  resolveWidgets,
  createScheduler,
  renderWidget,
} from "../../chrome/JS/aether-widgets.sys.mjs";
import {
  parseToml,
  deepMerge,
  AetherConfig,
} from "../../chrome/JS/aether-config.sys.mjs";

// Helpers ---------------------------------------------------------------------

// Simulate the real flow: user TOML snippet deep-merged over built-in defaults.
function configWith(tomlSnippet) {
  return deepMerge(AetherConfig.DEFAULTS, parseToml(tomlSnippet));
}

function ids(widgets) {
  return widgets.map(w => w.id);
}

function builtin(id) {
  const w = BUILTINS[id] ?? BUILTINS.find?.(w => w.id === id);
  assert.ok(w, `builtin widget '${id}' missing from BUILTINS`);
  return w;
}

// Fixed instant: 2026-07-18T14:05:00Z (a Saturday). Tests inject locale
// "en-GB" (ctx.locale undefined ⇒ system locale, which tests never rely on).
const T0 = Date.UTC(2026, 6, 18, 14, 5, 0);

function ctx(overrides = {}) {
  return {
    mode: "normal",
    buffer: "",
    url: "https://example.org/",
    message: "",
    tabCount: 1,
    nowMs: T0,
    locale: "en-GB",
    ...overrides,
  };
}

// 1 ---------------------------------------------------------------- resolution

// Note (f5): the exact default id list is pinned in f5-config.test.mjs since
// the reserved 'workspace' slot went live; here the guard is that every
// default id resolves, order verbatim — no default may be silently skipped.
test("resolve: every default widget id resolves, order verbatim (pixel-equivalence guard)", () => {
  const widgets = resolveWidgets(AetherConfig.DEFAULTS);
  assert.deepEqual(ids(widgets), AetherConfig.DEFAULTS.statusbar.widgets);
  for (const w of widgets) {
    assert.equal(typeof w.render, "function", `widget '${w.id}' has no render`);
  }
});

// 2

test("resolve: custom [statusbar] widgets reorders and subsets, order verbatim from config", () => {
  const cfg = configWith(`
[statusbar]
widgets = ["clock", "mode", "tabs"]
`);
  assert.deepEqual(ids(resolveWidgets(cfg)), ["clock", "mode", "tabs"]);
});

// 3

// Note (f5): 'workspace' was the reserved example here until it became a real
// builtin; the unknown-id guard now uses a never-real id. The workspace slot's
// resolution is covered in f5-widgets.test.mjs.
test("resolve: unknown id ('zzz_bogus') is skipped silently; the rest survives", () => {
  const cfg = configWith(`
[statusbar]
widgets = ["mode", "zzz_bogus", "url", "clock"]
`);
  let widgets;
  assert.doesNotThrow(() => {
    widgets = resolveWidgets(cfg);
  });
  assert.deepEqual(ids(widgets), ["mode", "url", "clock"]);
});

// 4

test("resolve: duplicate id resolves once, first position wins", () => {
  const cfg = configWith(`
[statusbar]
widgets = ["clock", "mode", "clock", "url"]
`);
  assert.deepEqual(ids(resolveWidgets(cfg)), ["clock", "mode", "url"]);
});

// 5

test("resolve: statusbar_clock = false drops clock, rest unchanged (back-compat)", () => {
  const cfg = configWith(`
[options]
statusbar_clock = false
`);
  assert.deepEqual(
    ids(resolveWidgets(cfg)),
    AetherConfig.DEFAULTS.statusbar.widgets.filter(id => id !== "clock"),
  );
});

// 6 ------------------------------------------------------------------- renders

test("render mode: uppercase mode, class aether-mode", () => {
  const r = renderWidget(builtin("mode"), ctx({ mode: "normal", buffer: "" }));
  assert.equal(r.text, "NORMAL");
  assert.equal(r.class, "aether-mode");
});

test("render mode: pending buffer appended (NORMAL g)", () => {
  const r = renderWidget(builtin("mode"), ctx({ mode: "normal", buffer: "g" }));
  assert.equal(r.text, "NORMAL g");
  assert.equal(r.class, "aether-mode");
});

// 7

test("render url: echoes ctx.url, class aether-url", () => {
  const r = renderWidget(builtin("url"), ctx({ url: "https://example.org/a" }));
  assert.equal(r.text, "https://example.org/a");
  assert.equal(r.class, "aether-url");
});

test("render msg: echoes ctx.message; empty message renders empty text (no placeholder copy)", () => {
  const shown = renderWidget(builtin("msg"), ctx({ message: "no tab: 9" }));
  assert.equal(shown.text, "no tab: 9");
  assert.equal(shown.class, "aether-message");

  const empty = renderWidget(builtin("msg"), ctx({ message: "" }));
  assert.equal(empty.text, "");
});

// 8

test("render tabs: decimal string of tabCount, class aether-tabs, tracks ctx changes", () => {
  const three = renderWidget(builtin("tabs"), ctx({ tabCount: 3 }));
  assert.equal(three.text, "3");
  assert.equal(three.class, "aether-tabs");

  const seven = renderWidget(builtin("tabs"), ctx({ tabCount: 7 }));
  assert.equal(seven.text, "7");
});

// 9

test("render clock: fixed epoch + injected locale give HH:MM, class aether-clock", () => {
  const r = renderWidget(builtin("clock"), ctx({ nowMs: T0, locale: "en-GB" }));
  assert.equal(r.text, "14:05");
  assert.equal(r.class, "aether-clock");
});

test("render clock: epochs a minute apart render differently", () => {
  const a = renderWidget(builtin("clock"), ctx({ nowMs: T0 }));
  const b = renderWidget(builtin("clock"), ctx({ nowMs: T0 + 60_000 }));
  assert.equal(b.text, "14:06");
  assert.notEqual(a.text, b.text);
});

// 10

test("render date: fixed epoch + injected locale give weekday/day/month, class aether-date", () => {
  const r = renderWidget(builtin("date"), ctx({ nowMs: T0, locale: "en-GB" }));
  assert.equal(r.text, "Sat 18 Jul");
  assert.equal(r.class, "aether-date");
});

// 11 --------------------------------------------------------------- scheduler

test("scheduler: clock due at t0+30s, not at t0+29s; due again 30s after firing", () => {
  const s = createScheduler([builtin("clock")], T0);
  assert.deepEqual(s.tick(T0 + 29_000), []);
  assert.deepEqual(s.tick(T0 + 30_000), ["clock"]);
  assert.deepEqual(s.tick(T0 + 59_000), []);
  assert.deepEqual(s.tick(T0 + 60_000), ["clock"]);
});

// 12

test("scheduler: no refresh_s widgets → periodMs null, tick returns []", () => {
  const s = createScheduler(
    [builtin("mode"), builtin("url"), builtin("msg"), builtin("tabs")],
    T0,
  );
  assert.equal(s.periodMs, null);
  assert.deepEqual(s.tick(T0 + 3_600_000), []);
});

// 13

test("scheduler: mixed intervals — periodMs is min (30s); date waits for its own deadline", () => {
  const s = createScheduler([builtin("clock"), builtin("date")], T0);
  assert.equal(s.periodMs, 30_000);
  // every 30s boundary up to 270s: clock only
  for (let t = 30_000; t < 300_000; t += 30_000) {
    assert.deepEqual(s.tick(T0 + t), ["clock"], `at t0+${t / 1000}s`);
  }
  // 300s: both due
  assert.deepEqual(s.tick(T0 + 300_000).sort(), ["clock", "date"]);
});

// 14

test("scheduler: late tick fires once and rebases — no double-fire, no catch-up burst", () => {
  const s = createScheduler([builtin("clock")], T0);
  // stall: 95s elapsed (3 periods' worth) → one fire, not three
  assert.deepEqual(s.tick(T0 + 95_000), ["clock"]);
  // immediately after the late fire: nothing due (no double-fire)
  assert.deepEqual(s.tick(T0 + 96_000), []);
  // rebased from the late tick: due again 30s after t0+95s, not at t0+120s
  assert.deepEqual(s.tick(T0 + 124_000), []);
  assert.deepEqual(s.tick(T0 + 125_000), ["clock"]);
});

// 15 ------------------------------------------------------------- containment

test("throwing render is contained: empty text, siblings render normally", () => {
  const broken = {
    id: "boom",
    refresh_s: 0,
    render: () => {
      throw new Error("widget exploded");
    },
  };
  let r;
  assert.doesNotThrow(() => {
    r = renderWidget(broken, ctx());
  });
  assert.equal(r.text, "");

  // a sibling rendered right after is unaffected
  const sibling = renderWidget(builtin("mode"), ctx());
  assert.equal(sibling.text, "NORMAL");
});
