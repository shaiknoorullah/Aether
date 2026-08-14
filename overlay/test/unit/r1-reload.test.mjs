// r1 — Live config reload: behavioral tests for the pure reload module
// (SDD RED). Spec: overlay/specs/r1-live-config-reload.md §2, §3, §4 tests
// 1–12. Written before the implementation; the module follows these.
//
// Contract pinned here for overlay/chrome/JS/aether-reload.sys.mjs (pure —
// imports only aether-strings; no Services, no IOUtils, no DOM, no Date, no
// timers; nothing throws for any input):
//
//   DOMAIN_MAP — a DECLARED, PATH-LEVEL map from a config path to the reapply
//     domain that owns it, or null meaning restart-only. Path-level, because
//     workspaces.resurrect is live while its sibling workspaces.default is
//     not, and a section-level map cannot say that. Entries never overlap.
//     Paths no entry governs are invisible to reload by design.
//   DOMAIN_ORDER — the message ordering of the live domains.
//   domainForPath(path) -> domain | null | undefined
//     longest segment-aligned entry wins; null = restart-only; undefined =
//     ungoverned. Own properties only; hostile input yields undefined.
//   diffConfig(oldCfg, newCfg) -> {changed: Set<domain>, restartOnly: Set<path>}
//     deep structural comparison over DOMAIN_MAP, never a generic deep-diff.
//     Fresh Sets every call, neither argument mutated, arrays order-sensitive,
//     non-enumerable parse metadata invisible, degradation always toward
//     "no change" — a spurious reapply is the bug this module exists to kill.
//   describeReload(changed, restartOnly) -> the statusbar string, composed
//     from aether-strings only; stable for a given pair of SETS regardless of
//     iteration order or container type.
//   deferKeymap(mode) -> boolean. POLARITY: true means DEFER (apply on the
//     next return to normal). Only the exact string "normal" applies now;
//     everything else defers, because deferring is always safe and applying
//     mid-insert is the haunted-reload bug.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DOMAIN_MAP,
  DOMAIN_ORDER,
  domainForPath,
  diffConfig,
  describeReload,
  deferKeymap,
} from "../../chrome/JS/aether-reload.sys.mjs";

import { AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import * as S from "../../chrome/JS/aether-strings.sys.mjs";

// ---------------------------------------------------------------- fixtures

// A LOCAL fixture, deliberately not AetherConfig.DEFAULTS: DEFAULTS churns
// every time another spec lands a section, and a diff test that moves with it
// stops pinning anything. Only test 10 (coverage) looks at DEFAULTS.
const base = () => ({
  options: {
    scroll_step: 120,
    hint_chars: "asdfghjkl",
    pending_timeout_ms: 800,
    palette_max_items: 8,
    which_key_ms: 400,
    statusbar_clock: true,
    config_watch: true,
  },
  statusbar: { widgets: ["mode", "url", "clock"] },
  ai: { enabled: false, base_url: "http://127.0.0.1:11434/v1", model: "llama3.2" },
  focus: { quiet_notifications: true },
  graveyard: { cap: 500 },
  workspaces: { default: "main", resurrect: true },
  boosts: { enabled: true, dir: "~/.config/aether/boosts" },
  theme: { source: "auto", wal_json: "~/x.json", colors: { bg: "#1d2021", fg: "#ebdbb2" } },
  style: { radius: "2px", motion: true },
  panels: { scope: "workspace" },
  privacy: { doh: "fallback", doh_url: "https://dns.quad9.net/dns-query" },
  keymap: { normal: { j: "scroll_down", r: "reload" }, reserved: { "C-w": "tab_close" } },
});

// Sorted array view of a Set, so assertions name the whole membership rather
// than probing one key at a time (which passes against an over-eager diff).
const dom = d => [...d].sort();

const isPlainObject = v => v !== null && typeof v === "object" && !Array.isArray(v);

// Own-property walk, used by the coverage test to resolve DOMAIN_MAP keys
// against DEFAULTS.
function atPath(obj, path) {
  let cur = obj;
  for (const seg of path.split(".")) {
    if (!isPlainObject(cur) || !Object.hasOwn(cur, seg)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

// Segment-aligned prefix: "theme" governs "theme.colors.bg" but not "themeX.y".
const isPrefixPath = (a, b) => b === a || b.startsWith(`${a}.`);

function setAt(obj, path, value) {
  const segs = path.split(".");
  const last = segs.pop();
  let cur = obj;
  for (const seg of segs) cur = cur[seg];
  cur[last] = value;
}

// One minimally-different value. Sections and arrays are edited at their LAST
// member on purpose: a comparator that gives up after the first few keys or
// elements still sees a first-member edit, and every fixture section here is
// small enough to hide inside such a bound.
function bumped(value) {
  if (Array.isArray(value)) return [...value.slice(0, -1), `${String(value.at(-1))}-x`];
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return { probe: "x" };
    const last = keys[keys.length - 1];
    return { ...value, [last]: bumped(value[last]) };
  }
  if (typeof value === "boolean") return !value;
  if (typeof value === "number") return value + 1;
  if (typeof value === "string") return `${value}-x`;
  return "probe";
}

// 1. identical configs → nothing to do ----------------------------------------

test("reload: two independently built, structurally equal configs diff to no change at all", () => {
  const same = diffConfig(base(), base());
  assert.equal(same.changed.size, 0, "equal content must not report a single domain");
  assert.equal(same.restartOnly.size, 0);
  assert.equal(describeReload(same.changed, same.restartOnly), "reloaded: nothing changed");

  const A = base();
  const identity = diffConfig(A, A);
  assert.equal(identity.changed.size, 0);
  assert.equal(identity.restartOnly.size, 0);
});

test("reload: every diff returns fresh Sets, never a shared or cached one", () => {
  const A = base();
  const first = diffConfig(A, A);
  const second = diffConfig(A, A);
  assert.notEqual(first.changed, second.changed, "changed must be a new Set per call");
  assert.notEqual(first.restartOnly, second.restartOnly, "restartOnly must be a new Set per call");
  assert.ok(first.changed instanceof Set);
  assert.ok(first.restartOnly instanceof Set);
});

// 2. a changed [theme.colors] value → exactly theme -----------------------------

test("reload: a changed [theme.colors] value reports exactly the theme domain", () => {
  const o = base();
  const n = base();
  n.theme.colors.bg = "#000000";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["theme"], "one colour must not smear into other domains");
  assert.equal(changed.has("style"), false, "theme and style are separate reapply domains");
  assert.equal(restartOnly.size, 0);
});

test("reload: a changed [theme] scalar reports theme, and nothing but theme", () => {
  const o = base();
  const n = base();
  n.theme.source = "wal";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["theme"]);
  assert.equal(changed.has("style"), false);
  assert.equal(restartOnly.size, 0);
});

// 3. keybinding and widget-order changes ---------------------------------------

test("reload: a changed [keymap.normal] binding reports exactly the keymap domain", () => {
  const o = base();
  const n = base();
  n.keymap.normal.j = "half_down";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["keymap"]);
  assert.equal(restartOnly.size, 0, "a normal-mode binding is live-reloadable");
});

test("reload: reordering [statusbar] widgets is a change — arrays compare in order", () => {
  const o = base();
  const n = base();
  n.statusbar.widgets = ["url", "mode", "clock"]; // same members, new order
  const { changed } = diffConfig(o, n);
  assert.deepEqual(
    dom(changed),
    ["statusbar"],
    "widget order IS the widget config; a set-wise comparator misses this",
  );
});

// 3b. EVERY DOMAIN_MAP entry actually diffs -------------------------------------
//
// The named tests above cover theme, keymap, statusbar, options, graveyard and
// workspaces. Without this one, a diffConfig that iterates a hardcoded subset —
// never reloading style, panels, ai, boosts or focus — passes the whole file,
// because those five are only ever asserted through domainForPath (a string
// lookup) and DOMAIN_ORDER (a shape check), neither of which runs the diff.
// Table-driven over DOMAIN_MAP itself, so a later spec's entry is covered the
// moment it lands.

test("reload: the fixture carries every DOMAIN_MAP path, so the table below can exercise them", () => {
  for (const path of Object.keys(DOMAIN_MAP)) {
    assert.notEqual(
      atPath(base(), path),
      undefined,
      `the fixture has no ${path} — extend base() with the new entry, do not skip it`,
    );
  }
});

test("reload: an edit under every single DOMAIN_MAP entry reports that entry's domain, alone", () => {
  for (const [path, domain] of Object.entries(DOMAIN_MAP)) {
    const o = base();
    const n = base();
    setAt(n, path, bumped(atPath(n, path)));
    const { changed, restartOnly } = diffConfig(o, n);
    if (domain === null) {
      assert.deepEqual(dom(restartOnly), [path], `${path} must be named as restart-only`);
      assert.equal(changed.size, 0, `${path} is restart-only and must reapply nothing`);
    } else {
      assert.deepEqual(dom(changed), [domain], `an edit at ${path} must reload exactly ${domain}`);
      assert.equal(restartOnly.size, 0, `${path} is live and must not nag for a restart`);
    }
  }
});

test("reload: an edit under every DOMAIN_MAP entry also survives the round trip to the message", () => {
  for (const [path, domain] of Object.entries(DOMAIN_MAP)) {
    const n = base();
    setAt(n, path, bumped(atPath(n, path)));
    const { changed, restartOnly } = diffConfig(base(), n);
    const msg = describeReload(changed, restartOnly);
    assert.ok(
      msg.includes(domain === null ? path : domain),
      `editing ${path} produced a line that never names it: ${msg}`,
    );
    assert.notEqual(msg, "reloaded: nothing changed", `editing ${path} reported nothing changed`);
  }
});

// 3c. the comparison reaches the far side of a REAL section ---------------------
//
// Every fixture section here is 2–3 members wide; the shipped DEFAULTS sections
// are 8–21. A comparator that truncates (first N keys, first N elements) is
// green against the fixture and blind in production, so this test edits the
// LAST member of the widest real sections there are.

const cloneDefaults = () => structuredClone(AetherConfig.DEFAULTS);
const lastKey = obj => Object.keys(obj)[Object.keys(obj).length - 1];

test("reload: an edit to the LAST key of a wide real section is seen, not truncated away", () => {
  const cases = [
    ["theme.colors", "theme"],
    ["keymap.normal", "keymap"],
    ["style", "style"],
    ["options", "options"],
  ];
  for (const [path, domain] of cases) {
    const o = cloneDefaults();
    const n = cloneDefaults();
    const section = atPath(n, path);
    assert.ok(
      Object.keys(section).length >= 6,
      `${path} has ${Object.keys(section).length} keys — too narrow to pin truncation`,
    );
    const key = lastKey(section);
    setAt(n, `${path}.${key}`, bumped(section[key]));
    assert.deepEqual(
      dom(diffConfig(o, n).changed),
      [domain],
      `${path}.${key} is the last key of the section and must still register`,
    );
  }
});

test("reload: reordering the LAST two statusbar widgets is a change", () => {
  const o = cloneDefaults();
  const n = cloneDefaults();
  const widgets = n.statusbar.widgets;
  assert.ok(widgets.length >= 8, `only ${widgets.length} widgets — too short to pin truncation`);
  const tail = widgets.length - 1;
  [widgets[tail - 1], widgets[tail]] = [widgets[tail], widgets[tail - 1]];
  assert.deepEqual(
    dom(diffConfig(o, n).changed),
    ["statusbar"],
    "a swap at the far end of the widget list is still a reorder",
  );
});

test("reload: two clones of the shipped DEFAULTS diff to nothing at all", () => {
  const { changed, restartOnly } = diffConfig(cloneDefaults(), cloneDefaults());
  assert.equal(changed.size, 0, "startup must not reapply every domain on the first reload");
  assert.equal(restartOnly.size, 0);
});

// 4. two domains at once, with stable text -------------------------------------

test("reload: two changed domains are both reported and rendered in DOMAIN_ORDER", () => {
  const o = base();
  const n = base();
  n.theme.colors.bg = "#000000";
  n.keymap.normal.j = "half_down";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["keymap", "theme"]);
  assert.equal(
    describeReload(changed, restartOnly),
    "reloaded: theme, keymap",
    "message order is DOMAIN_ORDER, not alphabetical and not insertion order",
  );
});

test("reload: the same two domains render identically however the diff was reached", () => {
  const forward = base();
  forward.theme.colors.bg = "#000000";
  forward.keymap.normal.j = "half_down";

  const reversed = base();
  reversed.keymap.normal.j = "half_down"; // mutations applied in the other order
  reversed.theme.colors.bg = "#000000";

  const a = diffConfig(base(), forward);
  const b = diffConfig(base(), reversed);
  assert.equal(
    describeReload(a.changed, a.restartOnly),
    describeReload(b.changed, b.restartOnly),
  );
});

test("reload: describeReload depends on the set of domains, not its order or container", () => {
  const expected = "reloaded: theme, keymap";
  assert.equal(describeReload(new Set(["keymap", "theme"]), []), expected);
  assert.equal(describeReload(new Set(["theme", "keymap"]), []), expected);
  assert.equal(describeReload(["theme", "keymap"], null), expected);
  assert.equal(describeReload(["keymap", "theme"], undefined), expected);
  assert.equal(describeReload(["theme", "keymap", "theme"], []), expected, "duplicates collapse");
});

test("reload: describeReload collapses duplicates it cannot dedupe by ordering alone", () => {
  // The assertion above is NOT binding on the dedupe rule: known domains are
  // rendered by filtering DOMAIN_ORDER, which collapses repeats for free. The
  // rule only shows itself on a domain DOMAIN_ORDER does not list, and on the
  // restart paths, which are rendered straight from the caller's collection.
  assert.equal(describeReload(["zzmod", "zzmod", "theme"], []), "reloaded: theme, zzmod");
  assert.equal(
    describeReload([], ["graveyard.cap", "graveyard.cap"]),
    "reloaded: nothing changed — restart for: graveyard.cap",
    "a path named twice is one restart, not two",
  );
  assert.equal(
    describeReload(["theme", "amod", "amod"], ["workspaces.default", "workspaces.default"]),
    "reloaded: theme, amod — restart for: workspaces.default",
  );
});

test("reload: a domain outside DOMAIN_ORDER still renders, sorted after the known ones", () => {
  assert.equal(describeReload(["zzmod", "theme", "keymap"], []), "reloaded: theme, keymap, zzmod");
  assert.equal(describeReload(["bmod", "amod", "theme"], []), "reloaded: theme, amod, bmod");
});

// 5. restart-only paths are named, never applied --------------------------------

test("reload: a changed graveyard.cap is restart-only — named, never in changed", () => {
  const o = base();
  const n = base();
  n.graveyard.cap = 200;
  const { changed, restartOnly } = diffConfig(o, n);
  assert.equal(changed.size, 0, "a restart-only path must never be reported as reapplied");
  assert.deepEqual(dom(restartOnly), ["graveyard.cap"]);
  assert.equal(
    describeReload(changed, restartOnly),
    "reloaded: nothing changed — restart for: graveyard.cap",
  );
});

test("reload: an unchanged config names no restart path at all", () => {
  const { changed, restartOnly } = diffConfig(base(), base());
  assert.equal(restartOnly.size, 0, "restart paths are reported on change only");
  const msg = describeReload(changed, restartOnly);
  assert.ok(!msg.includes("restart for"), `nothing changed must not mention a restart: ${msg}`);
});

test("reload: a changed workspaces.default is restart-only while its sibling stays live", () => {
  const o = base();
  const n = base();
  n.workspaces.default = "work";
  const restartSide = diffConfig(o, n);
  assert.deepEqual(dom(restartSide.restartOnly), ["workspaces.default"]);
  assert.equal(restartSide.changed.size, 0);

  const n2 = base();
  n2.workspaces.resurrect = false;
  const liveSide = diffConfig(o, n2);
  assert.deepEqual(dom(liveSide.changed), ["workspaces"], "resurrect is live-reloadable");
  assert.equal(liveSide.restartOnly.size, 0);
});

// 6. reserved chords bind at window creation -----------------------------------

test("reload: a changed reserved chord is restart-only and never reaches the keymap domain", () => {
  const o = base();
  const n = base();
  n.keymap.reserved["C-w"] = "tab_new";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(restartOnly), ["keymap.reserved"]);
  assert.equal(
    changed.has("keymap"),
    false,
    "a map that lumps all of [keymap] together would rebind C-w live, which cannot work",
  );
  assert.equal(changed.size, 0);
});

test("reload: an added reserved chord is restart-only, reported once by entry path", () => {
  const o = base();
  const n = base();
  n.keymap.reserved["C-q"] = "tab_close";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(restartOnly), ["keymap.reserved"], "the entry path, never the leaf");
  assert.equal(changed.has("keymap"), false);
});

test("reload: a removed reserved chord is restart-only too", () => {
  const o = base();
  const n = base();
  delete n.keymap.reserved["C-w"];
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(restartOnly), ["keymap.reserved"]);
  assert.equal(changed.has("keymap"), false);
});

test("reload: a reserved chord and a normal binding changed together split cleanly", () => {
  const o = base();
  const n = base();
  n.keymap.reserved["C-w"] = "tab_new";
  n.keymap.normal.j = "half_down";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["keymap"]);
  assert.deepEqual(dom(restartOnly), ["keymap.reserved"]);
  assert.equal(
    describeReload(changed, restartOnly),
    "reloaded: keymap — restart for: keymap.reserved",
  );
});

test("reload: several reserved chords changed at once are named once, not once each", () => {
  const o = base();
  const n = base();
  n.keymap.reserved["C-w"] = "tab_new";
  n.keymap.reserved["C-t"] = "tab_next";
  delete n.keymap.reserved["C-w"];
  const { restartOnly } = diffConfig(o, n);
  assert.equal(restartOnly.size, 1, "the entry path is reported once regardless of chord count");
  assert.deepEqual(dom(restartOnly), ["keymap.reserved"]);
});

// 7. adds and removes register, not just value changes -------------------------

test("reload: an ADDED keybinding registers as a keymap change", () => {
  const o = base();
  const n = base();
  n.keymap.normal.z = "hints";
  assert.deepEqual(dom(diffConfig(o, n).changed), ["keymap"]);
});

test("reload: a REMOVED keybinding registers as a keymap change", () => {
  const o = base();
  const n = base();
  delete n.keymap.normal.j;
  assert.deepEqual(dom(diffConfig(o, n).changed), ["keymap"]);
});

test("reload: an unknown key under a SECTION-level entry still reports its domain", () => {
  // Forward tolerance where a section-level entry exists: [theme] and [boosts]
  // are governed whole, so a key r1 never heard of still belongs to them.
  for (const [path, domain] of [["theme", "theme"], ["boosts", "boosts"], ["ai", "ai"]]) {
    const o = base();
    const n = base();
    n[path].some_new_key = 1;
    assert.deepEqual(dom(diffConfig(o, n).changed), [domain], `${path}.some_new_key → ${domain}`);
  }

  // [options] is per-leaf on purpose (see 10b), so an invented options key is
  // ungoverned — same answer as graveyard.ttl or [keymap.insert]. Nothing reads
  // it, so neither a reapply nor a restart would honour it, and the DEFAULTS
  // coverage test is what forces a real new option to be classified.
  const o = base();
  const n = base();
  n.options.some_new_key = 1;
  const r = diffConfig(o, n);
  assert.equal(r.changed.size, 0, "an option nothing consumes may not force a reapply");
  assert.equal(r.restartOnly.size, 0, "and a restart would not honour it either");
});

test("reload: a whole section removed on one side is a change in that domain", () => {
  const o = base();
  const n = base();
  delete n.privacy;
  assert.deepEqual(dom(diffConfig(o, n).changed), ["privacy"]);
});

test("reload: a section absent on BOTH sides is no change (both undefined is equal)", () => {
  const o = base();
  const n = base();
  delete o.style;
  delete n.style;
  const { changed, restartOnly } = diffConfig(o, n);
  assert.equal(changed.has("style"), false, "absent everywhere is not a change");
  assert.equal(changed.size, 0);
  assert.equal(restartOnly.size, 0);
});

// 8. deep-equal reparse must not reapply ---------------------------------------

test("reload: a re-parsed but deep-equal object reports no change (no spurious reapply)", () => {
  const o = base();
  const n = base();
  n.theme.colors = { bg: "#1d2021", fg: "#ebdbb2" }; // new object, same content
  n.statusbar.widgets = ["mode", "url", "clock"]; // new array, same order
  n.keymap.normal = { ...o.keymap.normal }; // new object, same bindings
  const { changed, restartOnly } = diffConfig(o, n);
  assert.equal(
    changed.size,
    0,
    "every reload re-parses the file; reference inequality is not a config change",
  );
  assert.equal(restartOnly.size, 0);
});

test("reload: non-enumerable parse metadata is not config and never diffs", () => {
  const hide = (obj, meta) => {
    for (const [key, value] of Object.entries(meta)) {
      Object.defineProperty(obj, key, { value, enumerable: false, configurable: true });
    }
    return obj;
  };
  const o = base();
  const n = base();
  // The shape the loader actually produces: sources/ok/errorLine at the root.
  hide(o, { sources: [{ path: "/a" }], ok: true, errorLine: null });
  hide(n, { sources: [{ path: "/b" }], ok: false, errorLine: 41 });
  // And the same rule INSIDE a governed subtree, which is what makes this
  // binding: a comparator reaching for getOwnPropertyNames instead of
  // Object.keys reports theme and statusbar as changed on every single reload.
  hide(o.theme, { sections: { a: 1 }, errorLine: null });
  hide(n.theme, { sections: { b: 2 }, errorLine: 41 });
  hide(o.statusbar, { ok: true });
  hide(n.statusbar, { ok: false });

  const { changed, restartOnly } = diffConfig(o, n);
  assert.equal(changed.size, 0, "sources/ok/sections/errorLine describe the load, not the config");
  assert.equal(restartOnly.size, 0);

  // …and hiding metadata must not blind the diff to a real edit beside it.
  const n2 = base();
  hide(n2, { sources: [{ path: "/b" }], ok: true, errorLine: null });
  n2.theme.colors.bg = "#000000";
  assert.deepEqual(dom(diffConfig(o, n2).changed), ["theme"]);
});

// 9. hostile input: never throws, degrades to no change -------------------------

test("reload: non-object roots of every shape diff to empty sets without throwing", () => {
  const pairs = [
    ["null / config", null, base()],
    ["config / undefined", base(), undefined],
    ["string / number", "nope", 42],
    ["array / array", [], []],
    ["config / array", base(), []],
    ["function / config", () => {}, base()],
    ["null-prototype / null-prototype", Object.create(null), Object.create(null)],
  ];
  for (const [label, a, b] of pairs) {
    let r;
    assert.doesNotThrow(() => {
      r = diffConfig(a, b);
    }, `diffConfig must tolerate ${label}`);
    assert.ok(r.changed instanceof Set && r.restartOnly instanceof Set);
    assert.equal(r.changed.size, 0, "a config that is not an object degrades to no change");
    assert.equal(r.restartOnly.size, 0);
  }
  assert.equal(Object.prototype.polluted, undefined);
});

test("reload: a throwing accessor is UNREADABLE, not absent — it reapplies nothing", () => {
  const thrower = (obj, key) =>
    Object.defineProperty(obj, key, {
      get() {
        throw new Error("hostile getter");
      },
      enumerable: true,
      configurable: true,
    });

  // A section-level getter. "Absent" would mean the user deleted [theme], which
  // reapplies the whole theme; "unreadable" means we could not tell, so the
  // safe answer is no change. Degrading toward a reapply is the bug.
  const o = base();
  const n = base();
  thrower(n, "theme");
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  }, "a naive obj[seg] walk propagates this and takes the whole reload down");
  assert.ok(r.changed instanceof Set && r.restartOnly instanceof Set);
  assert.equal(r.changed.size, 0, "an unreadable section must not recolour the chrome");
  assert.equal(r.restartOnly.size, 0, "nor invent a restart nag");

  // A getter above two governed paths, one of them restart-only: neither may
  // be claimed. keymap.normal would rebuild the engine, keymap.reserved would
  // tell the user to restart — both on the strength of a read that failed.
  const n2 = base();
  thrower(n2, "keymap");
  const r2 = diffConfig(o, n2);
  assert.equal(r2.changed.size, 0, "an unreadable [keymap] must not rebuild the key matcher");
  assert.equal(r2.restartOnly.size, 0, "an unreadable [keymap.reserved] is not a restart nag");

  // …and a getter DEEP inside a section is the same answer.
  const n3 = base();
  thrower(n3.theme, "colors");
  assert.equal(diffConfig(o, n3).changed.size, 0, "an unreadable leaf is not an edit");

  // Unreadable on one path must not blind the diff to a real edit on another.
  const n4 = base();
  thrower(n4, "theme");
  n4.keymap.normal.j = "half_down";
  assert.deepEqual(
    dom(diffConfig(o, n4).changed),
    ["keymap"],
    "one hostile section must not swallow the edit beside it",
  );
});

test("reload: a revoked proxy anywhere in the config is unreadable, never an exception", () => {
  const revoked = () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    return proxy;
  };

  for (const [label, a, b] of [
    ["revoked / config", revoked(), base()],
    ["config / revoked", base(), revoked()],
    ["revoked / revoked", revoked(), revoked()],
  ]) {
    let r;
    assert.doesNotThrow(() => {
      r = diffConfig(a, b);
    }, `Array.isArray and Object.hasOwn both throw on ${label}`);
    assert.equal(r.changed.size, 0, `${label} must degrade to no change`);
    assert.equal(r.restartOnly.size, 0);
  }

  // and one nested under a governed path, which is the shape a hostile section
  // would actually take
  const o = base();
  const n = base();
  n.theme.colors = revoked();
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.equal(r.changed.size, 0, "an unenumerable subtree is unreadable, not a recolour");
});

test("reload: an array whose length throws is unreadable, not a widget reorder", () => {
  const o = base();
  const n = base();
  n.statusbar.widgets = new Proxy(["mode", "url", "clock"], {
    get(target, key) {
      if (key === "length") throw new Error("boom");
      return Reflect.get(target, key);
    },
  });
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  }, "a bare a.length read propagates this out of the reload path");
  assert.equal(r.changed.size, 0, "an unreadable widget list must not cancel the schedulers");
});

// 9b. hostile WIDTH, not just hostile depth -------------------------------------
//
// The array branch trusted a self-reported `length` verbatim. Two consequences,
// both reachable from a config object handed to diffConfig by glue:
//   - a proxy reporting 2**31 on BOTH sides passes the aLen !== bLen check and
//     the element loop runs 2**31 times. This is the main thread, inside the
//     reload path: the chrome freezes on save.
//   - a proxy reporting NaN on both sides makes aLen !== bLen TRUE (NaN never
//     equals itself), so an untouched widget list reports `statusbar` changed
//     and cancels the schedulers — a degradation toward a reapply, which the
//     module's header calls absolute in the other direction.
// A read that throws was already covered; a read that LIES was not.

// Counts the trap hits, so "it terminated" is proven by bounded work rather
// than by a wall-clock the test would then have to pick a threshold for.
function lyingArray(reportedLength, counter) {
  return new Proxy(["mode", "url", "clock"], {
    get(target, key, recv) {
      counter.reads += 1;
      if (key === "length") return reportedLength;
      return Reflect.get(target, key, recv);
    },
  });
}

// Case ORDER is load-bearing. A synchronous runaway loop cannot be interrupted
// by node:test's own timeout, so an unguarded module would hang the whole
// `node --test` run with no output rather than failing — exactly what it does
// to the chrome. The first two cases are large enough to blow the read counter
// but small enough to finish, so an unguarded module fails FAST and legibly
// here and never reaches the 2**31 case that would hang.
test("reload: an array claiming a huge length is bounded, not walked — the chrome cannot freeze", () => {
  for (const claimed of [4096, 5_000_000, 2 ** 31, 2 ** 31 + 1, Number.MAX_SAFE_INTEGER]) {
    const counter = { reads: 0 };
    const o = base();
    const n = base();
    o.statusbar.widgets = lyingArray(claimed, counter);
    n.statusbar.widgets = lyingArray(claimed, counter);
    let r;
    assert.doesNotThrow(() => {
      r = diffConfig(o, n);
    });
    assert.equal(r.changed.size, 0, `length ${claimed} must degrade to no change`);
    assert.ok(
      counter.reads < 100,
      `length ${claimed} drove ${counter.reads} element reads — the width bound is not holding`,
    );
  }
});

test("reload: a length that is not a plain integer is unreadable, never a reorder", () => {
  for (const claimed of [NaN, Infinity, -Infinity, 1.5, "3", null, undefined, 2 ** 53]) {
    const o = base();
    const n = base();
    o.statusbar.widgets = lyingArray(claimed, { reads: 0 });
    n.statusbar.widgets = lyingArray(claimed, { reads: 0 });
    let r;
    assert.doesNotThrow(() => {
      r = diffConfig(o, n);
    });
    assert.equal(
      r.changed.size,
      0,
      `length ${String(claimed)} on both sides reported a reorder that never happened`,
    );
  }
});

test("reload: the width bound does not swallow any array a config can really hold", () => {
  // The real widget list is eight entries. Pin both halves of the bound so
  // neither shrinking it (blinding real edits) nor growing it (re-opening the
  // freeze) is silent.
  const MAX_ITEMS = 1024; // mirrors the module constant on purpose — this is the pin
  const list = n => Array.from({ length: n }, (_, i) => `w${i}`);
  for (const size of [1, 8, 64, MAX_ITEMS]) {
    const o = base();
    const n = base();
    o.statusbar.widgets = list(size);
    n.statusbar.widgets = list(size).map((w, i) => (i === size - 1 ? `${w}-x` : w));
    assert.deepEqual(
      dom(diffConfig(o, n).changed),
      ["statusbar"],
      `a real ${size}-entry list must still diff at its LAST element`,
    );
  }
  const o = base();
  const n = base();
  o.statusbar.widgets = list(MAX_ITEMS + 1);
  n.statusbar.widgets = list(MAX_ITEMS + 1).map((w, i) => (i === 0 ? "changed" : w));
  assert.equal(
    diffConfig(o, n).changed.size,
    0,
    "past the width bound the answer is 'equal', never a guessed reapply",
  );
});

test("reload: a section wider than the bound degrades to no change instead of churning", () => {
  const MAX_ITEMS = 1024; // the pin, as above
  const wide = n => Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, `v${i}`]));
  const o = base();
  const n = base();
  o.keymap.normal = wide(MAX_ITEMS);
  n.keymap.normal = { ...wide(MAX_ITEMS), [`k${MAX_ITEMS - 1}`]: "different" };
  assert.deepEqual(
    dom(diffConfig(o, n).changed),
    ["keymap"],
    `${MAX_ITEMS} keys is inside the bound and must still diff at the last one`,
  );

  const o2 = base();
  const n2 = base();
  o2.keymap.normal = wide(MAX_ITEMS + 1);
  n2.keymap.normal = { ...wide(MAX_ITEMS + 1), k0: "different" };
  assert.equal(diffConfig(o2, n2).changed.size, 0, "past the bound, equal");

  // A key COUNT mismatch past the bound is the same answer — the bound is
  // checked before the length comparison, so no half-read width can decide.
  const o3 = base();
  const n3 = base();
  o3.keymap.normal = wide(MAX_ITEMS + 1);
  n3.keymap.normal = wide(MAX_ITEMS + 40);
  assert.equal(diffConfig(o3, n3).changed.size, 0);
});

test("reload: a config carrying cycles on both sides terminates and reports no change", () => {
  const o = base();
  const n = base();
  o.theme.colors.self = o.theme.colors;
  n.theme.colors.self = n.theme.colors;
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  }, "unbounded recursion would blow the stack inside the reload path");
  assert.equal(r.changed.size, 0, "bounded comparison degrades to equal, never to reapply");
});

test("reload: a real difference alongside a cycle is still detected", () => {
  const o = base();
  const n = base();
  o.theme.colors.self = o.theme.colors;
  n.theme.colors.self = n.theme.colors;
  n.theme.colors.bg = "#000000";
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.deepEqual(dom(r.changed), ["theme"]);
});

test("reload: a difference nested past the depth bound degrades to no change, not to a reapply", () => {
  const o = base();
  const n = base();
  const chain = tail => {
    let node = { leaf: tail };
    for (let i = 0; i < 20; i++) node = { down: node };
    return node;
  };
  o.theme.deep = chain("a");
  n.theme.deep = chain("b");
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.equal(r.changed.size, 0, "past the bound the answer is 'equal', never a guessed reapply");

  // and the bound does not swallow real config depth (theme.colors.bg is 3 deep)
  const shallowOld = base();
  const shallowNew = base();
  shallowNew.theme.colors.bg = "#000000";
  assert.deepEqual(dom(diffConfig(shallowOld, shallowNew).changed), ["theme"]);
});

test("reload: the depth bound sits exactly where the module says, not somewhere in a range", () => {
  // "depth 2 is seen, depth 21 is not" leaves everything between free: the
  // whole 3..21 range passes either assertion. MAX_DEPTH is 8 levels below the
  // governed path, so a difference at 7 IS seen and one at 8 is not, and both
  // halves are asserted so neither shrinking nor growing the bound is silent.
  const MAX_DEPTH = 8; // mirrors the module constant on purpose — this is the pin

  // value sits `levels` below theme: levels 1 means theme.probe is the value.
  const nest = (levels, value) => (levels <= 1 ? value : { down: nest(levels - 1, value) });
  const seenAt = levels => {
    const o = base();
    const n = base();
    o.theme.probe = nest(levels, "a");
    n.theme.probe = nest(levels, "b");
    return diffConfig(o, n).changed.has("theme");
  };

  assert.equal(seenAt(1), true, "a leaf directly under a governed section is always compared");
  assert.equal(
    seenAt(MAX_DEPTH - 1),
    true,
    "the last level inside the bound must still be compared — a smaller bound is silent data loss",
  );
  assert.equal(
    seenAt(MAX_DEPTH),
    false,
    "the first level past the bound answers 'equal' — a larger bound changes the contract",
  );
  assert.equal(seenAt(MAX_DEPTH + 5), false);
});

test("reload: values of the wrong type are compared, not crashed on", () => {
  const o = base();
  const n = base();
  o.options.scroll_step = "120"; // string, as a sloppy dotfile would give it
  n.options.scroll_step = 120; // integer
  const { changed } = diffConfig(o, n);
  assert.deepEqual(dom(changed), ["options"], "a type change is a config change");
});

test("reload: a section replaced by a scalar, or a scalar by a section, is a change", () => {
  const o = base();
  const n = base();
  n.theme = "gruvbox";
  assert.deepEqual(dom(diffConfig(o, n).changed), ["theme"]);

  const o2 = base();
  const n2 = base();
  o2.statusbar.widgets = "mode";
  assert.deepEqual(dom(diffConfig(o2, n2).changed), ["statusbar"], "array vs string is a change");
});

test("reload: a non-object container mid-path reads as absent rather than derailing the walk", () => {
  const o = base();
  const n = base();
  n.keymap = "none"; // both keymap.normal and keymap.reserved vanish under it
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.deepEqual(dom(r.changed), ["keymap"]);
  assert.deepEqual(dom(r.restartOnly), ["keymap.reserved"]);
  assert.equal(r.changed.has("theme"), false, "one broken section must not condemn the rest");
});

test("reload: sections reachable only through the prototype chain are invisible to the diff", () => {
  // The shape prototype pollution produces: nothing OWNS the section, but a
  // lookup still finds one. A walk that does not use Object.hasOwn diffs
  // values the config does not actually contain — and then reapplies them.
  const withInherited = (cfg, inherited) => {
    const out = Object.assign(Object.create(inherited), cfg);
    for (const key of Object.keys(inherited)) delete out[key];
    return out;
  };
  const o = withInherited(base(), { graveyard: { cap: 1 }, keymap: { normal: { j: "top" } } });
  const n = withInherited(base(), { graveyard: { cap: 2 }, keymap: { normal: { j: "bottom" } } });

  assert.equal(Object.hasOwn(o, "graveyard"), false, "fixture check: the section is inherited only");
  assert.equal(o.graveyard.cap, 1, "fixture check: an inherited lookup would still find it");

  const { changed, restartOnly } = diffConfig(o, n);
  assert.equal(changed.size, 0, "an inherited keymap is not this config's keymap");
  assert.equal(restartOnly.size, 0, "nor is an inherited graveyard.cap a restart-worthy edit");
});

test("reload: control characters and very large strings compare without incident", () => {
  const control = "asdf\u0000\u001b[31m\nghjkl";
  const huge = "~/".padEnd(200_000, "x");

  const o = base();
  const n = base();
  o.options.hint_chars = control;
  n.options.hint_chars = control;
  o.theme.wal_json = huge;
  n.theme.wal_json = huge;
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.equal(r.changed.size, 0, "byte-identical hostile strings are still equal");

  const n2 = base();
  n2.options.hint_chars = control + "\u0000";
  n2.theme.wal_json = huge;
  assert.deepEqual(
    dom(diffConfig(o, n2).changed),
    ["options"],
    "one trailing control character is still a difference",
  );

  const n3 = base();
  n3.options.hint_chars = control;
  n3.theme.wal_json = huge + "y";
  assert.deepEqual(dom(diffConfig(o, n3).changed), ["theme"]);
});

test("reload: a config carrying an own __proto__ key diffs without grafting anything", () => {
  const o = base();
  const n = base();
  Object.defineProperty(n.options, "__proto__", {
    value: { polluted: true },
    enumerable: true,
    writable: true,
    configurable: true,
  });
  let r;
  assert.doesNotThrow(() => {
    r = diffConfig(o, n);
  });
  assert.ok(r.changed instanceof Set);
  assert.equal(Object.prototype.polluted, undefined, "nothing may reach Object.prototype");
  assert.equal({}.polluted, undefined);
  assert.equal({}.j, undefined);
});

test("reload: diffConfig mutates neither argument", () => {
  const o = base();
  const n = base();
  n.theme.colors.bg = "#000000";
  n.graveyard.cap = 200;
  const oldSnapshot = JSON.stringify(o);
  const newSnapshot = JSON.stringify(n);
  const { changed, restartOnly } = diffConfig(o, n);
  assert.ok(changed.size > 0 && restartOnly.size > 0, "the purity check needs a real diff");
  assert.equal(JSON.stringify(o), oldSnapshot, "the live config must come out untouched");
  assert.equal(JSON.stringify(n), newSnapshot, "the freshly parsed config must come out untouched");
});

test("reload: the same inputs give the same answer every time", () => {
  const o = base();
  const n = base();
  n.statusbar.widgets = ["url", "mode", "clock"];
  n.graveyard.cap = 1;
  const first = diffConfig(o, n);
  const second = diffConfig(o, n);
  assert.deepEqual(dom(first.changed), dom(second.changed));
  assert.deepEqual(dom(first.restartOnly), dom(second.restartOnly));
  assert.equal(
    describeReload(first.changed, first.restartOnly),
    describeReload(second.changed, second.restartOnly),
  );
});

test("reload: describeReload tolerates non-iterable and junk input without throwing", () => {
  for (const [a, b] of [
    [null, null],
    [undefined, undefined],
    [42, {}],
    [{}, 7],
    [new Set(), new Set()],
  ]) {
    let msg;
    assert.doesNotThrow(() => {
      msg = describeReload(a, b);
    });
    assert.equal(msg, "reloaded: nothing changed");
  }
  assert.equal(describeReload([null, 7, "", "theme"], [null, "", "graveyard.cap"]),
    "reloaded: theme — restart for: graveyard.cap",
    "non-string and empty entries are dropped, never rendered");
});

test("reload: describeReload never renders undefined or [object Object]", () => {
  const msgs = [
    describeReload(new Set(), new Set()),
    describeReload(["theme"], []),
    describeReload([], ["graveyard.cap"]),
    describeReload(["theme", "keymap"], ["graveyard.cap", "workspaces.default"]),
    describeReload(null, undefined),
  ];
  for (const msg of msgs) {
    assert.equal(typeof msg, "string");
    assert.ok(msg.length > 0, "the statusbar always gets a line");
    assert.ok(!msg.includes("undefined"), `leaked undefined: ${msg}`);
    assert.ok(!msg.includes("[object Object]"), `leaked an object: ${msg}`);
  }
});

test("reload: restart paths render sorted, so the same set always reads the same way", () => {
  assert.equal(
    describeReload([], ["workspaces.default", "graveyard.cap"]),
    "reloaded: nothing changed — restart for: graveyard.cap, workspaces.default",
  );
  assert.equal(
    describeReload([], ["graveyard.cap", "workspaces.default"]),
    "reloaded: nothing changed — restart for: graveyard.cap, workspaces.default",
  );
});

// 10. DOMAIN_MAP covers every leaf of DEFAULTS ---------------------------------

function leafPaths(obj, prefix = "") {
  const out = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (isPlainObject(value)) {
      const nested = leafPaths(value, path);
      // An EMPTY section has no leaves. Without this the coverage guard below
      // passes vacuously for a whole section nobody governs — DEFAULTS could
      // grow `mods: {}` and reload would be blind to it forever, quietly.
      out.push(...(nested.length ? nested : [path]));
    } else out.push(path);
  }
  return out;
}

test("reload: the coverage walker itself reaches empty sections and nested leaves", () => {
  assert.deepEqual(
    leafPaths({ mods: {}, theme: { colors: { bg: "#1" } }, n: 1, list: ["a"] }),
    ["mods", "theme.colors.bg", "n", "list"],
    "an empty section must surface as a path, or the coverage test below proves nothing",
  );
});

test("reload: every leaf path in DEFAULTS is governed by exactly one DOMAIN_MAP entry", () => {
  const leaves = leafPaths(AetherConfig.DEFAULTS);
  assert.ok(
    leaves.length > 40,
    `the walker found only ${leaves.length} leaves — it is not reading DEFAULTS`,
  );
  for (const path of leaves) {
    assert.notEqual(
      domainForPath(path),
      undefined,
      `${path} belongs to no reload domain — a new TOML key would silently never reload`,
    );
  }
});

test("reload: named DEFAULTS paths classify exactly as the spec says", () => {
  const expected = {
    "focus.quiet_notifications": "focus",
    "workspaces.resurrect": "workspaces",
    "workspaces.default": null,
    "graveyard.cap": null,
    "keymap.reserved.C-w": null,
    "keymap.normal.j": "keymap",
    "theme.colors.bg": "theme",
    "style.radius": "style",
    "panels.scope": "panels",
    "privacy.doh": "privacy",
    "statusbar.widgets": "statusbar",
    "ai.enabled": "ai",
    "boosts.dir": "boosts",
  };
  for (const [path, domain] of Object.entries(expected)) {
    assert.equal(domainForPath(path), domain, `${path} must classify as ${String(domain)}`);
  }
});

// 10b. [options] is three domains, not one -------------------------------------
//
// The reason this needs its own block: `options: "options"` passes every other
// test in this file. Coverage only asserts `domainForPath(leaf) !== undefined`,
// and no other test names an options leaf, so a blanket section entry is green
// while `statusbar_clock = false` reports "reloaded: options" and leaves the
// clock on the bar — resolveWidgets(config) is called ONCE, at statusbar
// construction (aether.uc.js:181, aether-widgets.sys.mjs:94), not per render.
// A message that claims a reapply which did not happen is worse than an honest
// restart nag, so every options leaf is pinned to its real consumer here.

test("reload: every [options] leaf classifies by its REAL consumer, not by its section", () => {
  const expected = {
    // read per-use through opt() → nothing to reapply, the new config is enough
    "options.scroll_step": "options",
    "options.hint_chars": "options",
    "options.pending_timeout_ms": "options",
    "options.palette_max_items": "options",
    "options.which_key_ms": "options",
    // build-time input to resolveWidgets() → the widget registry must be rebuilt
    "options.statusbar_clock": "statusbar",
    // owned by the reload service's interval, not by any per-window reapply
    "options.config_watch": "watcher",
  };
  for (const [path, domain] of Object.entries(expected)) {
    assert.equal(domainForPath(path), domain, `${path} must classify as ${domain}`);
  }
  assert.deepEqual(
    Object.keys(expected).sort(),
    Object.keys(AetherConfig.DEFAULTS.options).map(k => `options.${k}`).sort(),
    "a new [options] key must be classified here by hand — its consumer decides, not its section",
  );
});

test("reload: [options] has no section-level entry, so a new key fails coverage loudly", () => {
  assert.equal(
    domainForPath("options"),
    undefined,
    "a blanket `options` entry would silently classify the next build-time option as read-through",
  );
  assert.equal(domainForPath("options.invented_key"), undefined);
  assert.ok(
    !Object.hasOwn(DOMAIN_MAP, "options"),
    "the leaves are entries; the section is not",
  );
});

test("reload: flipping statusbar_clock rebuilds the statusbar and says so, never 'options'", () => {
  const o = base();
  const n = base();
  n.options.statusbar_clock = false;
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(
    dom(changed),
    ["statusbar"],
    "the widget list is built from this value; reporting `options` would be a false claim",
  );
  assert.equal(restartOnly.size, 0);
  assert.equal(describeReload(changed, restartOnly), "reloaded: statusbar");

  // and it composes with a real [statusbar] edit rather than double-reporting
  const both = base();
  both.options.statusbar_clock = false;
  both.statusbar.widgets = ["url", "mode", "clock"];
  const r = diffConfig(o, both);
  assert.deepEqual(dom(r.changed), ["statusbar"], "one rebuild, named once");
});

test("reload: flipping config_watch reports the watcher, the only thing that reapplies it", () => {
  const o = base();
  const n = base();
  n.options.config_watch = false;
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(
    dom(changed),
    ["watcher"],
    "the poller is the consumer; `options` would claim a read-through that polls on regardless",
  );
  assert.equal(restartOnly.size, 0, "the interval can be stopped without a restart");
  assert.equal(describeReload(changed, restartOnly), "reloaded: watcher");
});

test("reload: a read-through option reports `options` and rebuilds nothing else", () => {
  for (const key of ["scroll_step", "hint_chars", "pending_timeout_ms", "palette_max_items",
                     "which_key_ms"]) {
    const o = base();
    const n = base();
    n.options[key] = bumped(o.options[key]);
    assert.deepEqual(
      dom(diffConfig(o, n).changed),
      ["options"],
      `${key} is read per-use, so it must not cancel the widget schedulers`,
    );
  }
});

test("reload: domainForPath is not a catch-all — ungoverned paths return undefined", () => {
  assert.equal(domainForPath("nonexistent.section.key"), undefined);
  assert.equal(domainForPath("themeX.y"), undefined, "prefix matching must be segment-aligned");
  assert.equal(domainForPath("mods.myscript.enabled"), undefined);
  assert.equal(domainForPath("graveyard.something_else"), undefined,
    "graveyard has no section entry on purpose, so a new key fails coverage loudly");
  for (const key of Object.keys(DOMAIN_MAP)) {
    assert.notEqual(key, "", "an empty key would govern every path");
  }
});

test("reload: a key the user invents outside DOMAIN_MAP is invisible to the diff, on purpose", () => {
  // This is the deliberate boundary, pinned so it is a decision and not an
  // accident. DEFAULTS coverage guarantees every key the overlay actually READS
  // has an owner; a key the user invents under a governed section with no
  // section-level entry has no owner because nothing consumes it — neither a
  // reapply nor a restart would honour it, so naming it as restart-only would
  // be a lie. If a later spec starts reading one of these, it adds the
  // DOMAIN_MAP entry in the same change and the coverage test enforces that.
  const invented = [
    ["keymap.insert", { "C-a": "line_start" }],
    ["graveyard.ttl", 3600],
    ["workspaces.icons", { main: "*" }],
  ];
  for (const [path, value] of invented) {
    assert.equal(domainForPath(path), undefined, `${path} must have no owner for this to hold`);
    const o = base();
    const n = base();
    setAt(n, path, value);
    const { changed, restartOnly } = diffConfig(o, n);
    assert.equal(changed.size, 0, `${path} governs nothing, so it may not force a reapply`);
    assert.equal(restartOnly.size, 0, `${path} governs nothing, so a restart would not honour it`);
  }

  // A whole invented top-level section is the same answer.
  const o = base();
  const n = base();
  n.mods = { myscript: { enabled: true } };
  const r = diffConfig(o, n);
  assert.equal(r.changed.size, 0);
  assert.equal(r.restartOnly.size, 0);
});

test("reload: domainForPath returns undefined for hostile input and reads no inherited key", () => {
  for (const bad of [null, undefined, 42, {}, [], "", "__proto__", "constructor.prototype",
                     "toString", "hasOwnProperty"]) {
    let r;
    assert.doesNotThrow(() => {
      r = domainForPath(bad);
    }, `domainForPath must tolerate ${String(bad)}`);
    assert.equal(r, undefined, `${String(bad)} must not resolve to a domain`);
  }
});

test("reload: DOMAIN_MAP entries never overlap, so no path has two owners", () => {
  const keys = Object.keys(DOMAIN_MAP);
  for (const a of keys) {
    for (const b of keys) {
      if (a === b) continue;
      assert.ok(
        !isPrefixPath(a, b),
        `${a} is a dotted prefix of ${b} — a path under both has an ambiguous owner`,
      );
    }
  }
});

test("reload: every DOMAIN_MAP entry names a path that actually exists in DEFAULTS", () => {
  for (const key of Object.keys(DOMAIN_MAP)) {
    assert.notEqual(
      atPath(AetherConfig.DEFAULTS, key),
      undefined,
      `${key} is a dead entry — it would 'cover' leaves that never appear`,
    );
  }
});

test("reload: DOMAIN_MAP values are null or a DOMAIN_ORDER member, one-for-one", () => {
  const live = [];
  for (const [key, value] of Object.entries(DOMAIN_MAP)) {
    if (value === null) continue;
    assert.equal(typeof value, "string", `${key} must map to a domain string or null`);
    assert.ok(value.length > 0, `${key} must not map to an empty domain`);
    live.push(value);
  }
  for (const value of new Set(live)) {
    assert.equal(
      DOMAIN_ORDER.filter(d => d === value).length,
      1,
      `${value} must appear exactly once in DOMAIN_ORDER`,
    );
  }
  for (const domain of DOMAIN_ORDER) {
    assert.ok(live.includes(domain), `DOMAIN_ORDER lists ${domain}, which no entry produces`);
  }
});

test("reload: a restart-only path never appears in changed, for any DEFAULTS-shaped edit", () => {
  const restartPaths = Object.entries(DOMAIN_MAP)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  assert.ok(restartPaths.length > 0, "the map must declare at least one restart-only path");
  const o = base();
  const n = base();
  n.workspaces.default = "work";
  n.graveyard.cap = 1;
  n.keymap.reserved["C-w"] = "tab_new";
  const { changed, restartOnly } = diffConfig(o, n);
  assert.deepEqual(dom(restartOnly), [...restartPaths].sort());
  assert.equal(changed.size, 0, "restart-only edits must not trigger a single reapply");

  // Naming them is the whole feature (spec §2), so the composed line must carry
  // EVERY one of them. No other test renders more than two, which lets a
  // truncating describeReload drop the third in silence.
  assert.ok(restartPaths.length >= 3, "the map declares three restart-only paths today");
  assert.equal(
    describeReload(changed, restartOnly),
    `reloaded: nothing changed — restart for: ${[...restartPaths].sort().join(", ")}`,
  );
});

test("reload: describeReload renders every domain and every path it is given, never a prefix", () => {
  // Rendering the first two of each is enough to pass every other test in this
  // file. Both lists are taken from the module's own declarations, so a later
  // spec's domain is covered the moment it is declared.
  assert.equal(describeReload(DOMAIN_ORDER, []), `reloaded: ${DOMAIN_ORDER.join(", ")}`);
  assert.ok(DOMAIN_ORDER.length >= 5, "too few domains to pin truncation");

  const restartPaths = Object.entries(DOMAIN_MAP)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
    .sort();
  const msg = describeReload(DOMAIN_ORDER, restartPaths);
  assert.equal(
    msg,
    `reloaded: ${DOMAIN_ORDER.join(", ")} — restart for: ${restartPaths.join(", ")}`,
  );
  for (const path of restartPaths) assert.ok(msg.includes(path), `${path} is missing from: ${msg}`);
});

test("reload: describeReload does not drain the collections it is handed", () => {
  const changed = new Set(["theme", "keymap"]);
  const restartOnly = new Set(["graveyard.cap"]);
  const first = describeReload(changed, restartOnly);
  const second = describeReload(changed, restartOnly);
  assert.equal(first, second, "the same collections must render the same line twice");
  assert.equal(changed.size, 2, "the caller's set must survive the render");
  assert.equal(restartOnly.size, 1);
});

// 11. deferKeymap polarity ------------------------------------------------------

test("reload: deferKeymap is false only for the exact mode 'normal'", () => {
  assert.equal(deferKeymap("normal"), false, "in normal mode the new keymap applies now");
});

test("reload: every other mode defers the keymap, because applying mid-mode is the haunted bug", () => {
  const modes = ["insert", "hint", "palette", "panel", "NORMAL", " normal", "normal ", "",
                 null, undefined, 0, {}, [], Symbol("normal")];
  for (const mode of modes) {
    let r;
    assert.doesNotThrow(() => {
      r = deferKeymap(mode);
    }, `deferKeymap must tolerate ${String(mode)}`);
    assert.equal(r, true, `mode ${String(mode)} must defer — deferring is always safe`);
  }
});

// 12. reload copy: neutral, echoing, lexicon-clean -------------------------------

const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

const R1_STRING_EXPORTS = [
  "reloadedMessage",
  "RELOAD_NO_CHANGE_MESSAGE",
  "restartRequiredMessage",
  "configUnchangedMessage",
];

test("strings: the r1 reload copy is exactly the text the spec pins", () => {
  assert.equal(S.reloadedMessage("theme, keymap"), "reloaded: theme, keymap");
  assert.equal(S.RELOAD_NO_CHANGE_MESSAGE, "reloaded: nothing changed");
  assert.equal(S.restartRequiredMessage("graveyard.cap"), "restart for: graveyard.cap");
  assert.equal(S.configUnchangedMessage(41), "config unchanged: line 41");
});

test("strings: every r1 export survives the f6 harness — one pre-joined argument, echoed", () => {
  const task = "deep work on the spec";
  for (const name of R1_STRING_EXPORTS) {
    assert.ok(Object.hasOwn(S, name), `aether-strings must export ${name}`);
    const value = S[name];
    const rendered = typeof value === "function" ? value(task, "34m") : value;
    assert.equal(typeof rendered, "string", `${name} must yield a string`);
    assert.ok(rendered.length > 0, `${name} must not be empty copy`);
    assert.ok(!BANNED.test(rendered), `${name} carries a banned stem: ${JSON.stringify(rendered)}`);
    if (typeof value === "function" && /message|text/i.test(name)) {
      assert.ok(rendered.includes(task), `${name} must echo its single argument: ${rendered}`);
    }
  }
});

test("strings: the parse-failure line is a line number, not a verdict", () => {
  const msg = S.configUnchangedMessage(41);
  assert.ok(!BANNED.test(msg), `parse-failure copy carries a banned stem: ${msg}`);
  for (const verdict of ["error", "invalid", "bad", "wrong", "broken"]) {
    assert.ok(
      !new RegExp(verdict, "i").test(msg),
      `a typo is a line number, not a '${verdict}' verdict: ${msg}`,
    );
  }
  assert.ok(/41/.test(msg), "the line must be named so it can be found");
});

test("strings: describeReload output is lexicon-clean in every composition", () => {
  const o = base();
  const n = base();
  n.theme.colors.bg = "#000000";
  n.keymap.normal.j = "half_down";
  n.graveyard.cap = 200;
  const { changed, restartOnly } = diffConfig(o, n);
  const composed = describeReload(changed, restartOnly);
  assert.equal(composed, "reloaded: theme, keymap — restart for: graveyard.cap");
  for (const msg of [composed, describeReload(new Set(), new Set()),
                     describeReload(["theme"], []), describeReload([], ["graveyard.cap"])]) {
    assert.ok(!BANNED.test(msg), `describeReload emitted a banned stem: ${msg}`);
  }
});
