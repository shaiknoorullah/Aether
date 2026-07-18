// f6 — EF Supports: task-conditioned focus sessions, ambient elapsed time,
// notification-suppression predicate, focus widget, palette commands, config
// (SDD RED). Spec: overlay/specs/f6-ef-supports.md §2 "Exact behavior",
// §3 (pure surface), §4 tests 1–10. Written before the implementation; the
// module follows these.
//
// Contract pinned here for overlay/chrome/JS/aether-focus.sys.mjs (pure —
// no Services/prefs/DOM/Date.now; time arrives as nowMs arguments):
//   startSession(task, workspace, nowMs) -> {task (trimmed), workspace,
//     startedAt: nowMs}. At most one session exists; "replacing" is glue
//     overwriting its field with a fresh startSession result — never an
//     error shape, never a judgment.
//   endSession(session) -> {ended: session} for an active session;
//     {ended: null} for no session (glue's neutral-copy path). Never throws.
//   onWorkspaceSwitch(session, newWorkspace) ->
//     {session: survivor|null, ended: endedSession|null}: a switch to a
//     different workspace ends the session (ended carries it for the
//     done-message); a switch to the session's own workspace leaves it
//     untouched; no session -> both null, no throw.
//   onWorkspaceRename(session, oldName, newName) -> the session with its
//     binding rewritten when it pointed at oldName; otherwise the session
//     (or null) unchanged. A rename is not a context switch — without this
//     the binding goes stale and a same-workspace :ws / gw falsely ends it.
//   formatElapsed(startedAt, nowMs) -> "<1m" | "34m" | "2h 7m" — floored
//     minutes, no seconds, no zero-pad, no cap (spec §2 "Elapsed formatting").
//   notificationsSuppressed(session, config) -> true only for
//     (active session ∧ config.focus.quiet_notifications).
// Widget contract: BUILTINS.focus = {id: "focus", refresh_s: 30,
//   render(ctx) -> {text: "<task> · <elapsed>" from ctx.focus + ctx.nowMs,
//   class: "aether-focus"}}; no ctx.focus -> empty text, never a placeholder.
// The focus module is imported dynamically inside tests so the widget/
// palette/config tests below fail on their own assertions while the module
// does not exist yet (module-missing is this file's RED state for 1–6).

// Pin the timezone BEFORE any Intl/Date use (f2 pattern) — the scheduler
// test shares the bar with clock/date.
process.env.TZ = "UTC";

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import {
  BUILTINS,
  createScheduler,
  renderWidget,
} from "../../chrome/JS/aether-widgets.sys.mjs";
import { REGISTRY, parse } from "../../chrome/JS/aether-palette.sys.mjs";
import {
  parseToml,
  deepMerge,
  AetherConfig,
} from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

async function focusModule() {
  return import("../../chrome/JS/aether-focus.sys.mjs");
}

const MIN = 60_000;
const HOUR = 60 * MIN;

// Fixed instant: 2026-07-18T14:05:00Z (f2's T0).
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

// 1. startSession --------------------------------------------------------------

test("focus: startSession binds trimmed task, workspace, and injected nowMs", async () => {
  const { startSession } = await focusModule();
  const s = startSession("  write f6 spec  ", "main", 5000);
  assert.equal(s.task, "write f6 spec", "task is trimmed, inner words preserved");
  assert.equal(s.workspace, "main", "bound to the active workspace");
  assert.equal(s.startedAt, 5000, "startedAt is the injected clock, not Date.now");
});

// 2. starting over an active session replaces it — a switch, not a failure ----

test("focus: a new startSession replaces — fresh task and startedAt, no error shape", async () => {
  const { startSession } = await focusModule();
  const first = startSession("read mail", "main", 1000);
  const second = startSession("deep work", "main", 9000);
  assert.notEqual(second, first, "a fresh session object");
  assert.equal(second.task, "deep work");
  assert.equal(second.startedAt, 9000, "the clock restarts from the new start");
  assert.equal(first.task, "read mail", "the old session is simply gone, not mutated into anything");
  for (const key of ["error", "unknown", "ended"]) {
    assert.ok(!(key in second), `replacing must not produce an error shape ('${key}')`);
  }
});

// 3. endSession ---------------------------------------------------------------

test("focus: endSession ends an active session; no session yields the neutral no-session shape", async () => {
  const { startSession, endSession } = await focusModule();
  const s = startSession("write f6 spec", "main", 1000);
  const r = endSession(s);
  assert.ok(r && typeof r === "object", "always a shape, never a throw");
  assert.deepEqual(r.ended, s, "the ended session rides along for glue's done-message");

  for (const none of [null, undefined]) {
    let rn;
    assert.doesNotThrow(() => {
      rn = endSession(none);
    }, "ending with no session must never throw");
    assert.ok(rn && typeof rn === "object", "still a shape");
    assert.equal(rn.ended ?? null, null, "no-session shape: nothing ended");
  }
});

// 4. onWorkspaceSwitch --------------------------------------------------------

test("focus: switching to a different workspace ends the session; its own workspace is a no-op", async () => {
  const { startSession, onWorkspaceSwitch } = await focusModule();
  const s = startSession("write f6 spec", "main", 1000);
  const snapshot = JSON.stringify(s);

  const same = onWorkspaceSwitch(s, "main");
  assert.equal(same.session, s, "same workspace: the session survives");
  assert.equal(same.ended ?? null, null, "nothing ended");
  assert.equal(JSON.stringify(s), snapshot, "survivor untouched — same task, same startedAt");

  const away = onWorkspaceSwitch(s, "dev");
  assert.equal(away.session ?? null, null, "different workspace: no survivor");
  assert.deepEqual(away.ended, s, "the ended session rides along for the quiet done-message");

  let none;
  assert.doesNotThrow(() => {
    none = onWorkspaceSwitch(null, "dev");
  }, "switching with no session must never throw");
  assert.equal(none.session ?? null, null);
  assert.equal(none.ended ?? null, null);
});

// 4b. onWorkspaceRename — a rename follows the session, never ends it ---------

test("focus: renaming the bound workspace rewrites the binding — same task, same startedAt", async () => {
  const { startSession, onWorkspaceRename, onWorkspaceSwitch } = await focusModule();
  const s = startSession("deep work", "main", 1000);
  const renamed = onWorkspaceRename(s, "main", "writing");
  assert.equal(renamed.workspace, "writing", "the binding follows the new name");
  assert.equal(renamed.task, "deep work", "task untouched");
  assert.equal(renamed.startedAt, 1000, "startedAt untouched — a rename is not a restart");

  // The bug this pins: after ':ws_rename writing', landing on 'writing' (gw
  // on a single workspace, or ':ws writing') is the workspace the user never
  // left — the session must survive.
  const stay = onWorkspaceSwitch(renamed, "writing");
  assert.equal(stay.session, renamed, "same-workspace switch after rename stays a no-op");
  assert.equal(stay.ended ?? null, null);

  // Inverse failure from the same root: a NEW workspace reusing the old name
  // is a genuine context switch — the session must end.
  const away = onWorkspaceSwitch(renamed, "main");
  assert.equal(away.session ?? null, null, "a fresh workspace named 'main' is elsewhere now");
  assert.deepEqual(away.ended, renamed);
});

test("focus: onWorkspaceRename leaves other bindings and no-session untouched", async () => {
  const { startSession, onWorkspaceRename } = await focusModule();
  const s = startSession("deep work", "dev", 1000);
  assert.equal(
    onWorkspaceRename(s, "main", "writing"),
    s,
    "a session bound elsewhere is returned as-is",
  );
  for (const none of [null, undefined]) {
    assert.equal(onWorkspaceRename(none, "main", "writing") ?? null, null, "no session, no throw");
  }
});

// 5. formatElapsed — calm, factual, floored; no seconds, no cap ---------------

test("focus: formatElapsed — <1m, floored minutes, then h m; no zero-pad, no seconds, no cap", async () => {
  const { formatElapsed } = await focusModule();
  const cases = [
    [0, "<1m"], // the first minute is just "<1m" — a seconds tick is a timer
    [59_000, "<1m"],
    [60_000, "1m"],
    [34 * MIN, "34m"],
    [34 * MIN + 59_999, "34m"], // floored, never rounded up
    [35 * MIN, "35m"],
    [59 * MIN + 59_000, "59m"],
    [HOUR, "1h 0m"], // hours from one hour on, no zero-pad beyond the plain digit
    [127 * MIN, "2h 7m"],
    [9 * HOUR, "9h 0m"], // long is just long: no cap, no special casing
    [26 * HOUR + 5 * MIN, "26h 5m"], // no day rollover either
  ];
  for (const [elapsed, want] of cases) {
    assert.equal(formatElapsed(0, elapsed), want, `elapsed ${elapsed}ms`);
  }
  assert.equal(formatElapsed(1000, 61_000), "1m", "startedAt is an offset, not an absolute");
});

// 6. notificationsSuppressed --------------------------------------------------

test("focus: notificationsSuppressed only for active session AND quiet_notifications on", async () => {
  const { startSession, notificationsSuppressed } = await focusModule();
  const s = startSession("write f6 spec", "main", 1000);
  const on = AetherConfig.DEFAULTS; // quiet_notifications defaults to true (test 10)
  const off = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml(`
[focus]
quiet_notifications = false
`),
  );
  assert.equal(notificationsSuppressed(s, on), true, "active session + config on");
  assert.equal(notificationsSuppressed(null, on), false, "no session: never suppressed");
  assert.equal(notificationsSuppressed(undefined, on), false);
  assert.equal(notificationsSuppressed(s, off), false, "config off wins even mid-session");
});

// 7. the focus widget ---------------------------------------------------------

test("widgets: 'focus' builtin renders task · elapsed from ctx.focus + ctx.nowMs", () => {
  const w = BUILTINS.focus;
  assert.ok(w, "BUILTINS must contain 'focus'");
  assert.equal(w.id, "focus");
  const r = renderWidget(
    w,
    ctx({ focus: { task: "write f6 spec", startedAt: T0 - 127 * MIN }, nowMs: T0 }),
  );
  assert.equal(r.text, "write f6 spec · 2h 7m", "spec copy: '<task> · <elapsed>'");
  assert.equal(r.class, "aether-focus");
});

test("widgets: no ctx.focus renders an empty slot — never 'undefined', never placeholder copy", () => {
  assert.ok(BUILTINS.focus, "BUILTINS must contain 'focus'");
  const r = renderWidget(BUILTINS.focus, ctx()); // no focus key at all
  assert.equal(r.text, "", "an empty slot, not a placeholder");
  assert.ok(!String(r.text).includes("undefined"), "no 'undefined' text ever");
});

// 8. the focus widget rides the existing scheduler ----------------------------

test("widgets: 'focus' schedules at 30s beside clock (30) and date (300); periodMs stays 30s", () => {
  assert.ok(BUILTINS.focus, "BUILTINS must contain 'focus'");
  assert.equal(BUILTINS.focus.refresh_s, 30, "rides the clock cadence — no new timer class");
  const s = createScheduler([BUILTINS.clock, BUILTINS.date, BUILTINS.focus], T0);
  assert.equal(s.periodMs, 30_000, "the bar's timer period is unchanged by focus");
  assert.deepEqual(
    s.tick(T0 + 30_000).sort(),
    ["clock", "focus"],
    "focus comes due on its own 30s deadline; date waits",
  );
  assert.deepEqual(s.tick(T0 + 300_000).sort(), ["clock", "date", "focus"]);
});

// 9. palette: :focus <task> and :done -----------------------------------------

test("palette: 'focus' and 'done' are registry commands", () => {
  assert.ok("focus" in REGISTRY, "registry must contain 'focus'");
  assert.ok("done" in REGISTRY, "registry must contain 'done'");
});

test("palette: parse('focus deep work on spec') keeps every task token (glue joins them)", () => {
  const r = parse("focus deep work on spec");
  assert.equal(r.name, "focus");
  assert.deepEqual(r.args, ["deep", "work", "on", "spec"], "all tokens preserved");
  assert.equal(r.args.join(" "), "deep work on spec", "the joined args are the task (:ws rule)");
});

test("palette: parse('focus') without a task → unknown-with-usage, not a crash", () => {
  let r;
  assert.doesNotThrow(() => {
    r = parse("focus");
  });
  assert.equal(r.name, undefined, "must not be runnable without the task arg");
  assert.equal(r.unknown, "focus");
  assert.ok(typeof r.usage === "string" && r.usage.includes("focus"), "usage hint present");
});

test("palette: parse('done') → runnable with no args", () => {
  const r = parse("done");
  assert.equal(r.name, "done");
  assert.deepEqual(r.args, []);
});

// 10. config sync guard -------------------------------------------------------
// The exact default widget order is pinned HERE now (f5's literal pin was
// superseded when focus + date joined the default bar).

test("config: DEFAULTS.focus.quiet_notifications is true", () => {
  assert.equal(AetherConfig.DEFAULTS.focus?.quiet_notifications, true);
});

// Note (f7): the exact default id list moved to f7-config.test.mjs when the
// ai slot joined the default bar; the f6 guarantee that survives is that
// focus (and its neighbours) keep their relative order.
test("config: defaults keep mode, workspace, focus, url, msg, clock, date in order", () => {
  const widgets = AetherConfig.DEFAULTS.statusbar?.widgets ?? [];
  let from = 0;
  for (const want of ["mode", "workspace", "focus", "url", "msg", "clock", "date"]) {
    const at = widgets.indexOf(want, from);
    assert.ok(at !== -1, `default statusbar widgets lost '${want}' (or its relative order)`);
    from = at + 1;
  }
});

test("config: example aether.toml [focus] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.focus, "example aether.toml has no [focus] section");
  assert.deepEqual(
    parsed.focus,
    AetherConfig.DEFAULTS.focus,
    "overlay/config/aether.toml [focus] and DEFAULTS drifted apart",
  );
});

test("config: example aether.toml [statusbar] carries focus and date, in sync", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(
    parsed.statusbar?.widgets?.includes("focus"),
    "example TOML must list the focus widget",
  );
  assert.ok(
    parsed.statusbar?.widgets?.includes("date"),
    "example TOML must list the date widget (ambient anchoring is clock AND date)",
  );
  assert.deepEqual(
    parsed.statusbar,
    AetherConfig.DEFAULTS.statusbar,
    "overlay/config/aether.toml [statusbar] and DEFAULTS drifted apart",
  );
});
