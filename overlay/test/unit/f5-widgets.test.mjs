// f5 — Widgets surface: the reserved 'workspace' statusbar builtin goes live
// (SDD RED). Spec: overlay/specs/f5-workspaces-and-persistence.md §2
// "Statusbar", §3, §4 test 15. Additive next to f2-widgets.test.mjs — the f2
// unknown-id guard now uses a never-real id since 'workspace' resolves.
//
// Contract pinned here: BUILTINS.workspace = {id: "workspace", refresh_s: 0
// (event-driven, no schedule), render(ctx) -> {text: ctx.workspace,
// class: "aether-workspace"}}; a missing ctx.workspace renders empty text,
// never the string "undefined".

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

function configWith(tomlSnippet) {
  return deepMerge(AetherConfig.DEFAULTS, parseToml(tomlSnippet));
}

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

// 15. the workspace builtin ---------------------------------------------------

test("widgets: 'workspace' is a builtin and renders the active name from ctx", () => {
  const w = BUILTINS.workspace;
  assert.ok(w, "BUILTINS must contain 'workspace'");
  assert.equal(w.id, "workspace");
  const r = renderWidget(w, ctx({ workspace: "dev" }));
  assert.equal(r.text, "dev");
  assert.equal(r.class, "aether-workspace");
});

test("widgets: missing ctx.workspace renders empty text, never 'undefined'", () => {
  assert.ok(BUILTINS.workspace, "BUILTINS must contain 'workspace'");
  const r = renderWidget(BUILTINS.workspace, ctx()); // no workspace key at all
  assert.equal(r.text, "");
  assert.ok(!String(r.text).includes("undefined"), "no 'undefined' text ever");
});

test("widgets: 'workspace' is event-driven — no refresh schedule", () => {
  assert.ok(!(BUILTINS.workspace.refresh_s > 0), "refresh_s must be absent/0");
  const s = createScheduler([BUILTINS.workspace], 0);
  assert.equal(s.periodMs, null, "a workspace-only bar needs zero timers");
  assert.deepEqual(s.tick(3_600_000), []);
});

test("widgets: the 'workspace' id now resolves instead of being skipped", () => {
  const cfg = configWith(`
[statusbar]
widgets = ["mode", "workspace", "url"]
`);
  const ids = resolveWidgets(cfg).map(w => w.id);
  assert.deepEqual(ids, ["mode", "workspace", "url"], "reserved slot is live");
});
