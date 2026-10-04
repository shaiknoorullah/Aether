// r1 — Config/registry surface for live reload (SDD RED). Spec:
// overlay/specs/r1-live-config-reload.md §2 "TOML surface", §4 tests 17–18.
// Same additive f0 pattern as b3-config.test.mjs: the defaults live in
// aether-config.sys.mjs and overlay/config/aether.toml must parse to exactly
// the same values.
//
// Test 18 is the collision guard, and it is the whole reason `config_reload`
// is not called `reload`: `r` is bound to page reload and has been since the
// spike, so a config-reload command registered under that name would silently
// turn `r` into a config reload with nothing on screen to say so.
//
// Note on the spec's wording for test 18: `complete()` is PREFIX-only and r1
// does not change it, so `complete("re")` finds `reload` and nothing else —
// `config_reload` and `theme_reload` are reachable by their own prefixes.
// Asserting otherwise would pin a fuzzy matcher that does not exist yet (x3).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import { REGISTRY, commandEntry, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";
import * as S from "../../chrome/JS/aether-strings.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");
const EXAMPLE = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));

// 17. the watcher switch, defaults and example in sync -------------------------

test("config: options.config_watch defaults to true and the example dotfile agrees", () => {
  assert.equal(EXAMPLE.ok, true, "overlay/config/aether.toml must parse cleanly");
  assert.equal(
    AetherConfig.DEFAULTS.options.config_watch,
    true,
    "saving the config file is the reload; false leaves :config_reload",
  );
  assert.equal(
    EXAMPLE.options.config_watch,
    true,
    "overlay/config/aether.toml and DEFAULTS drifted apart on config_watch",
  );
});

// 18. config_reload and the shipped page reload are distinct commands ----------

test("palette: config_reload and reload are separate entries with separate descriptions", () => {
  assert.ok(Object.hasOwn(REGISTRY, "reload"), "page reload must still be registered");
  assert.ok(Object.hasOwn(REGISTRY, "config_reload"), "r1 adds a config reload command");

  const page = commandEntry("reload");
  const config = commandEntry("config_reload");
  assert.ok(page.description.length > 0, "reload needs a description — three surfaces render it");
  assert.ok(config.description.length > 0, "config_reload needs a description too");
  assert.notEqual(
    page.description,
    config.description,
    "identical copy in the palette means the two commands are indistinguishable on screen",
  );
});

test("palette: the two reload commands carry different risk, proving they are not one command", () => {
  assert.equal(commandEntry("reload").risk, "navigate", "page reload changes which page is shown");
  assert.equal(
    commandEntry("config_reload").risk,
    "mutate-local",
    "config reload changes state on this machine, it does not navigate",
  );
});

test("palette: both reload commands take zero arguments and parse to themselves", () => {
  assert.deepEqual(parse("reload"), { name: "reload", args: [] });
  assert.deepEqual(parse("config_reload"), { name: "config_reload", args: [] });
  assert.equal(commandEntry("reload").min, 0);
  assert.equal(commandEntry("config_reload").min, 0);
});

test("palette: `r` still means page reload, in DEFAULTS and in the example dotfile", () => {
  assert.equal(
    AetherConfig.DEFAULTS.keymap.normal.r,
    "reload",
    "registering config reload over the `reload` name would silently rebind `r`",
  );
  assert.equal(
    EXAMPLE.keymap.normal.r,
    "reload",
    "the shipped dotfile must keep `r` on page reload too",
  );
});

test("palette: each reload command is completable by its own prefix", () => {
  assert.ok(complete("config_", REGISTRY).includes("config_reload"));
  assert.ok(complete("theme_", REGISTRY).includes("theme_reload"));
  assert.deepEqual(
    complete("re", REGISTRY),
    ["reload"],
    "completion is prefix-only today; `re` reaching config_reload would need x3's fuzzy matcher",
  );
});

// 16. load() with !ok keeps the live config, identity-unchanged ----------------
//
// The spec's test 16 lives here rather than in r1-reload.test.mjs because it is
// about the loader, not the diff. load() is glue-shaped — it reaches for
// Services/IOUtils/PathUtils as free globals — but those are the ONLY four
// globals it touches, so a fake filesystem in this process exercises the whole
// all-or-nothing rule on bare `node --test` with no framework and no deps.
// Without it the rule is unexercised, and a mid-write file reverting a live
// keymap to DEFAULTS by way of deepMerge is exactly the bug r1 exists to stop.

const HOME = "/home/aether-test";
const FS = new Map(); // absolute path -> file contents
const pathFor = name => `${HOME}/.config/aether/${name}`;

globalThis.Ci = { nsIFile: Symbol("nsIFile") };
globalThis.Services = { dirsvc: { get: () => ({ path: HOME }) } };
globalThis.PathUtils = { join: (...parts) => parts.join("/") };
globalThis.IOUtils = {
  async exists(path) {
    return FS.has(path);
  },
  async readUTF8(path) {
    if (!FS.has(path)) throw new Error(`no such file: ${path}`);
    return FS.get(path);
  },
};

// These four run in declaration order and share AetherConfig's module-level
// "last good config", so the first-load case has to come first.

test("config: a broken file on the FIRST load falls back to defaults, never a partial merge", () => {
  FS.clear();
  FS.set(pathFor("aether.toml"), '[options]\nscroll_step = 200\nthis line has no equals\n');
  return AetherConfig.load().then(cfg => {
    assert.equal(
      cfg.options.scroll_step,
      AetherConfig.DEFAULTS.options.scroll_step,
      "with nothing live yet, a rejected parse gives defaults — never the half-read file",
    );
    assert.equal(AetherConfig.current, null, "a rejected parse must not become the live config");
    assert.equal(cfg.sources[0].ok, false, "the source that failed is marked, for the statusbar");
    assert.equal(cfg.sources[0].errorLine, 3, "and the line is named so it can be found");
  });
});

test("config: a rejected reload returns the LIVE config object, identity-unchanged", () => {
  FS.clear();
  FS.set(pathFor("aether.toml"), '[options]\nscroll_step = 200\n\n[keymap.normal]\nj = "half_down"\n');
  return AetherConfig.load().then(async good => {
    assert.equal(good.options.scroll_step, 200);
    assert.equal(good.keymap.normal.j, "half_down");
    assert.equal(AetherConfig.current, good);

    // The mid-write case: a valid prefix cut mid-line. deepMerge over a partial
    // table would resolve every absent key to DEFAULTS and revert the keymap.
    FS.set(pathFor("aether.toml"), '[options]\nscroll_step = 999\n\n[keymap.norm');
    const rejected = await AetherConfig.load();
    assert.equal(rejected, good, "a rejected parse must return the same object, not a fresh merge");
    assert.equal(rejected.options.scroll_step, 200, "the half-written value must not leak in");
    assert.equal(rejected.keymap.normal.j, "half_down", "and the live keymap must not revert");

    // A broken SECOND source rejects the whole load too — all-or-nothing across
    // every layer, not just the first one.
    FS.set(pathFor("aether.toml"), '[options]\nscroll_step = 300\n');
    FS.set(pathFor("aether.local.toml"), "junk\n");
    const rejectedAgain = await AetherConfig.load();
    assert.equal(rejectedAgain, good, "one bad layer keeps the whole live config");
    assert.equal(rejectedAgain.options.scroll_step, 200, "not even the GOOD layer half-applies");

    // …and a good save afterwards is applied normally: rejection is not sticky.
    FS.delete(pathFor("aether.local.toml"));
    const next = await AetherConfig.load();
    assert.notEqual(next, good, "a clean parse produces a new config object");
    assert.equal(next.options.scroll_step, 300);
    assert.equal(AetherConfig.current, next);
  });
});

test("config: load() reports every source it read, in precedence order, for the watcher to stat", () => {
  FS.clear();
  FS.set(pathFor("aether.toml"), "[options]\nscroll_step = 120\n");
  return AetherConfig.load().then(cfg => {
    assert.deepEqual(
      cfg.sources.map(s => s.path),
      AetherConfig.SOURCE_FILES.map(pathFor),
      "the watcher stats what load() read, including the file that does not exist yet",
    );
    assert.equal(cfg.sources[1].exists, false, "an absent layer is a source, not an error");
    assert.equal(cfg.sources[1].ok, true);
    assert.equal(
      Object.hasOwn(JSON.parse(JSON.stringify(cfg)), "sources"),
      false,
      "sources is metadata, not config — an enumerable one would diff on every reload",
    );
  });
});

test("palette: theme_reload survives alongside config_reload, with its own copy", () => {
  const theme = commandEntry("theme_reload");
  assert.ok(theme, "theme_reload stays — muscle memory, and it is genuinely cheaper");
  assert.notEqual(theme.description, commandEntry("config_reload").description);
  assert.notEqual(theme.description, commandEntry("reload").description);
});

// ============================================================================
// 13/14/15 — parseToml called DIRECTLY, on the shapes a mid-write actually makes
// ============================================================================
//
// Everything above reaches the parser only through load(), and the one
// truncation asserted there cuts inside a section header (`[keymap.norm`) —
// the single truncation shape the `no =` branch catches by accident. A cut
// that lands AFTER an `=` is the common case (values are longer than keys and
// a writer emits `key = ` before the value), and it produces a syntactically
// fine `key = value` pair. These tests call parseToml directly so no shape
// hides behind the loader.

test("parse: a valid file parses ok, with the same table the forgiving parser produced", () => {
  const table = parseToml(
    '# a comment\n[options]\nscroll_step = 200\nstatusbar_clock = false\n\n' +
      '[statusbar]\nwidgets = ["mode", "url"]\n\n[keymap.normal]\nj = "half_down"\n',
  );
  assert.equal(table.ok, true);
  assert.equal(table.errorLine, null);
  assert.deepEqual(JSON.parse(JSON.stringify(table)), {
    options: { scroll_step: 200, statusbar_clock: false },
    statusbar: { widgets: ["mode", "url"] },
    keymap: { normal: { j: "half_down" } },
  });
});

test("parse: a line that is not blank, comment, section or key = value names its line number", () => {
  const cases = [
    ["[options]\nscroll_step = 200\nthis line has no equals\n", 3],
    ["junk\n", 1],
    ["[options]\n= 200\n", 2],
    ["[options]\nscroll_step =\n", 2],
    ["[options]\nscroll_step = 200\n[keymap.norm\n", 3],
    ["\n\n\n# comment\nbare_word\n", 5],
  ];
  for (const [text, line] of cases) {
    const table = parseToml(text);
    assert.equal(table.ok, false, `must reject: ${JSON.stringify(text)}`);
    assert.equal(table.errorLine, line, `wrong line for ${JSON.stringify(text)}`);
  }
});

test("parse: the FIRST offending line wins, so the reported line is the one to open", () => {
  const table = parseToml("[options]\nfirst junk\nsecond junk\n");
  assert.equal(table.errorLine, 2, "naming the last one would send the user to the wrong place");
});

// BLOCKED — the fix is four lines in aether-config.sys.mjs (a Foundation-owned
// shared file this pass may not edit). See the r1 blocking report. The
// assertions below are the spec's test 15, written correctly; they pass
// unchanged (verified against a patched copy of the whole tree) the moment
// this lands right after the `if (!key || !raw)` guard:
//
//   if ((raw.startsWith('"') && raw.indexOf('"', 1) === -1) ||
//       (raw.startsWith("[") && !raw.includes("]"))) {
//     errorLine ??= lineNumber;
//     continue;
//   }
//
// It must be indexOf/includes, NOT endsWith. The comment stripper only cuts at
// the FIRST `#`, and stands down entirely when that `#` is inside a string, so
// `hint_chars = "ab#cd"  # trailing comment` reaches here with the trailing
// comment still attached — an endsWith('"') test rejects that valid line and
// breaks f0-config's "comments, blanks and quoted keys never trip the
// rejection". Ask whether the value ever CLOSES, not what it ends with.
//
const TRUNCATION_BLOCKED =
  "blocked: needs the unterminated-literal guard in aether-config.sys.mjs (Foundation-owned)";

test("r1: parse rejects a value line cut mid-literal — the real mid-write shape",
  () => {
    const cases = [
      // a writer that got as far as the opening quote of a string value
      ['[options]\nhint_chars = "arst', 2],
      // ...or the opening bracket of an array value
      ['[statusbar]\nwidgets = ["mode", "url"', 2],
      // ...or exactly one character past the `=`
      ['[theme]\nsource = "', 2],
    ];
    for (const [text, line] of cases) {
      const table = parseToml(text);
      assert.equal(table.ok, false, `a mid-write cut must reject: ${JSON.stringify(text)}`);
      assert.equal(table.errorLine, line);
    }
  });

test("r1: a cut string value never becomes a corrupted string value",
  () => {
    // Today `hint_chars = "arst` yields the STRING `"arst` — leading quote and
    // all — and `source = "` yields the empty string, both with ok: true. Half
    // the file then merges over DEFAULTS and the rest of the config reverts.
    assert.equal(parseToml('[options]\nhint_chars = "arst').options?.hint_chars, undefined);
    assert.equal(parseToml('[theme]\nsource = "').theme?.source, undefined);
    assert.equal(parseToml('[statusbar]\nwidgets = ["mode"').statusbar?.widgets, undefined);
  });

// A bare-word cut (`enabled = fals`, `cap = 12` from `120`) is structurally
// undetectable by this grammar: it is a syntactically complete `key = value`.
// That one is the WATCHER's job — the stat-twice stability check in
// aether-reload-service.sys.mjs, which does not exist yet. Pinned here so the
// gap is a decision on record rather than an oversight; see the blocking report.
test("parse: a bare-word cut is grammatically valid and is the watcher's problem, not the parser's",
  () => {
    const table = parseToml("[ai]\nenabled = fals");
    assert.equal(table.ok, true, "the grammar cannot see this — only stat-twice can");
    assert.equal(
      table.ai.enabled,
      "fals",
      "and it is TRUTHY, which flips the AI kill switch on — hence the stability check",
    );
  });

// ============================================================================
// Metadata squatting — the all-or-nothing rule must not be optional
// ============================================================================

const SQUAT_BLOCKED =
  "blocked: needs parse metadata off the table (WeakMap + parseResult()) in aether-config.sys.mjs";

test("BLOCKED(r1): a dotfile cannot squat the parse metadata and opt out of the rule",
  { todo: SQUAT_BLOCKED }, () => {
    // `ok = true` on line 1 keeps ok true while errorLine names line 3: every
    // broken file half-applies forever. `ok = false` rejects the config
    // permanently with no line to name. `[ok]` yields an object, which is
    // `!== false` and so always accepted.
    assert.equal(parseToml("ok = true\n[options]\njunk\n").ok, false,
      "a squatted `ok` must not override the parser's own verdict");
    assert.equal(parseToml("ok = false\n[options]\nscroll_step = 200\n").ok, true,
      "a squatted `ok` must not reject a file that parsed cleanly");
    assert.equal(parseToml("[ok]\nx = 1\n").ok, true);
    assert.equal(parseToml("[ok]\nx = 1\njunk\n").ok, false);
    // ...and the squatted values survive as CONFIG, which is why the metadata
    // belongs beside the table rather than on it.
    assert.equal(parseToml("ok = true\n[options]\njunk\n").ok !== undefined, true);
  });

// ============================================================================
// A rejected load must still name the line — otherwise the copy is unreachable
// ============================================================================
//
// These reuse the fake filesystem installed above and run last on purpose:
// AetherConfig keeps ONE module-level "last good config" and a rejected load
// resolves to it, so anything here would otherwise change what the tests above
// observe.

const REJECT_BLOCKED =
  "blocked: load() must re-stamp `sources` on the rejected path in aether-config.sys.mjs " +
  "— `return withSources(lastConfig ?? { ...DEFAULTS }, sources)`";

test("r1: a rejected reload carries the failing line, so the statusbar can name it",
  async () => {
    FS.clear();
    FS.set(pathFor("aether.toml"), '[options]\nscroll_step = 200\n\n[keymap.normal]\nj = "half_down"\n');
    const good = await AetherConfig.load();
    assert.equal(good.sources[0].ok, true);

    FS.set(pathFor("aether.toml"), "[options]\nscroll_step = 999\njunk line\n");
    const rejected = await AetherConfig.load();

    // identity is preserved — that part already works and must keep working
    assert.equal(rejected, good, "the live config object is what a rejected load resolves to");
    assert.equal(rejected.options.scroll_step, 200);

    // ...but today `sources` is the STALE set from the last good load, so it
    // reports ok: true / errorLine: null and S.configUnchangedMessage(line) can
    // never be rendered with a real line.
    assert.equal(rejected.sources[0].ok, false, "the rejected source must be marked as rejected");
    assert.equal(rejected.sources[0].errorLine, 3, "and the line must survive to the caller");
    assert.equal(
      S.configUnchangedMessage(rejected.sources[0].errorLine),
      "config unchanged: line 3",
      "this is the whole point of the copy: it must be reachable from a real load",
    );
  });

// ============================================================================
// The command must exist, not merely be registered
// ============================================================================

const WIRE_BLOCKED =
  "blocked: aether.uc.js has no `config_reload` in this.commands (glue, out of scope this pass)";

test("r1: config_reload is implemented, not just registered and described",
  () => {
    // Every other palette assertion in this file passes against a registry
    // entry with no implementation behind it: run() looks the name up in
    // aether.uc.js's `this.commands`, finds nothing, console.warns and returns.
    // Discoverable in the palette, described by `describe`, and a no-op with
    // nothing on screen — strictly worse than not existing.
    const glue = readFileSync(join(HERE, "..", "..", "chrome", "JS", "aether.uc.js"), "utf8");
    // assert.ok, not assert.match: a failed match dumps all 70KB of the glue
    // into the run output, which is unreadable for everyone else's tests.
    assert.ok(
      /^\s*config_reload\s*:/m.test(glue),
      "config_reload is in REGISTRY but has no entry in aether.uc.js's this.commands",
    );
  });
