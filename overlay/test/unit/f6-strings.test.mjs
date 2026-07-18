// f6 — Strings surface: the non-shaming language guarantee, made mechanical
// (SDD RED). Spec: overlay/specs/f6-ef-supports.md §2 "Language guarantee",
// §4 tests 11–13.
//
// Contract pinned here for overlay/chrome/JS/aether-strings.sys.mjs (pure —
// all f6 user-visible copy lives here and nowhere else):
//   focusStartedMessage(task) -> "focus: <task>"     (transient, :focus)
//   doneMessage(task)         -> "done: <task>"      (transient, :done + quiet
//                                 workspace-switch end — an echo, never a
//                                 duration, never a report card)
//   NO_SESSION_MESSAGE        -> "no focus session"  (:done with no session)
//   focusWidgetText(task, elapsed) -> "<task> · <elapsed>"  (statusbar widget)
//
// The lexicon sweep (test 12) needs no module at all: it reads every string /
// template literal in overlay/chrome/JS/*.{sys.mjs,js} and overlay/loader/
// (the .cfg is JS), plus every CSS `content:` value in overlay/chrome/*.css,
// and asserts the banned stems —
// fail | streak | wasted | behind | should have | procrastinat — appear in
// NONE of them. Zero allowlist: the existing console strings that trip it
// get reworded ("could not …"), not exempted. Comments are exempt by
// construction — the extractor reads literals, not prose. The strings module
// is imported dynamically in tests 11/13 so the sweep runs (and fails on the
// real literals) even while the module does not exist yet.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = join(HERE, "..", "..", "chrome");
const JS_DIR = join(CHROME, "JS");
const LOADER_DIR = join(HERE, "..", "..", "loader");

const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

async function stringsModule() {
  return import("../../chrome/JS/aether-strings.sys.mjs");
}

// --- literal extraction ------------------------------------------------------
// A small state machine over JS source: collects the contents of '…', "…" and
// `…` literals (template chunks between ${…} expressions are collected;
// expression code — including nested strings, which are collected in their
// own right — is walked as code). Line and block comments are skipped, so
// prose stays exempt. Good enough for this codebase's style; regex literals
// are walked as code (none here contain quote characters).
function extractJsLiterals(src) {
  const literals = [];
  const stack = ["code"]; // code | line | block | sq | dq | tpl | expr
  const exprDepth = []; // brace depth per open ${ } frame
  let buf = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const d = src[i + 1];
    const mode = stack[stack.length - 1];
    if (mode === "code" || mode === "expr") {
      if (c === "/" && d === "/") {
        stack.push("line");
        i++;
      } else if (c === "/" && d === "*") {
        stack.push("block");
        i++;
      } else if (c === "'" || c === '"' || c === "`") {
        stack.push(c === "'" ? "sq" : c === '"' ? "dq" : "tpl");
        buf = "";
      } else if (mode === "expr") {
        if (c === "{") {
          exprDepth[exprDepth.length - 1]++;
        } else if (c === "}") {
          if (exprDepth[exprDepth.length - 1] === 0) {
            stack.pop(); // resume the template; its next chunk starts fresh
            exprDepth.pop();
            buf = "";
          } else {
            exprDepth[exprDepth.length - 1]--;
          }
        }
      }
      continue;
    }
    if (mode === "line") {
      if (c === "\n") stack.pop();
      continue;
    }
    if (mode === "block") {
      if (c === "*" && d === "/") {
        stack.pop();
        i++;
      }
      continue;
    }
    // inside a string or template chunk
    if (c === "\\") {
      buf += d ?? "";
      i++;
      continue;
    }
    if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`")) {
      if (buf) literals.push(buf);
      stack.pop();
      continue;
    }
    if (mode === "tpl" && c === "$" && d === "{") {
      if (buf) literals.push(buf);
      buf = "";
      stack.push("expr");
      exprDepth.push(0);
      i++;
      continue;
    }
    buf += c;
  }
  return literals;
}

// CSS: only `content:` values are user-visible text; comments are stripped
// first so prose stays exempt there too.
function extractCssContentValues(src) {
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const re = /content\s*:\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(noComments))) out.push(m[2] ?? m[3] ?? "");
  return out.filter(Boolean);
}

function sweepTargets() {
  const targets = [];
  for (const f of readdirSync(JS_DIR).sort()) {
    if (f.endsWith(".sys.mjs") || f.endsWith(".js")) {
      targets.push({
        file: `overlay/chrome/JS/${f}`,
        literals: extractJsLiterals(readFileSync(join(JS_DIR, f), "utf8")),
      });
    }
  }
  for (const f of readdirSync(CHROME).sort()) {
    if (f.endsWith(".css")) {
      targets.push({
        file: `overlay/chrome/${f}`,
        literals: extractCssContentValues(readFileSync(join(CHROME, f), "utf8")),
      });
    }
  }
  // The loader ships with the overlay too — "across the overlay" means the
  // autoconfig snippet (.cfg is JS) and its prefs file, not just chrome/.
  for (const f of readdirSync(LOADER_DIR).sort()) {
    if (f.endsWith(".cfg") || f.endsWith(".js")) {
      targets.push({
        file: `overlay/loader/${f}`,
        literals: extractJsLiterals(readFileSync(join(LOADER_DIR, f), "utf8")),
      });
    }
  }
  return targets;
}

// 11. every export of the strings module is non-empty, echoes the task, clean --

test("strings: every export is non-empty, echoes the task where applicable, no banned stem", async () => {
  const mod = await stringsModule();
  const exportNames = Object.keys(mod);
  assert.ok(exportNames.length > 0, "the strings module must export the f6 copy");

  // The named surface glue and widgets rely on (spec §2/§3):
  assert.equal(mod.focusStartedMessage("write f6 spec"), "focus: write f6 spec");
  assert.equal(mod.doneMessage("write f6 spec"), "done: write f6 spec");
  assert.equal(mod.NO_SESSION_MESSAGE, "no focus session");
  assert.equal(mod.focusWidgetText("write f6 spec", "2h 7m"), "write f6 spec · 2h 7m");

  // And EVERY export — constants and functions on representative args — is a
  // non-empty string free of the banned lexicon.
  const task = "deep work on the spec";
  for (const name of exportNames) {
    const value = mod[name];
    const rendered = typeof value === "function" ? value(task, "34m") : value;
    assert.equal(typeof rendered, "string", `export '${name}' must yield a string`);
    assert.ok(rendered.length > 0, `export '${name}' must not be empty copy`);
    assert.ok(
      !BANNED.test(rendered),
      `export '${name}' carries a banned stem: ${JSON.stringify(rendered)}`,
    );
    if (typeof value === "function" && /message|text/i.test(name)) {
      assert.ok(
        rendered.includes(task),
        `export '${name}' should echo the task, got ${JSON.stringify(rendered)}`,
      );
    }
  }
});

// 12. the lexicon sweep — the guarantee itself --------------------------------

test("strings: no string literal or CSS content value in the overlay carries a banned stem", () => {
  const violations = [];
  for (const { file, literals } of sweepTargets()) {
    for (const lit of literals) {
      if (BANNED.test(lit)) violations.push(`${file}: ${JSON.stringify(lit)}`);
    }
  }
  assert.deepEqual(
    violations,
    [],
    `banned lexicon (fail|streak|wasted|behind|should have|procrastinat) found in:\n  ${violations.join(
      "\n  ",
    )}\nReword neutrally ("could not …") — the sweep has no allowlist.`,
  );
});

test("strings: the sweep actually reads the overlay (self-check, not a vacuous pass)", () => {
  const targets = sweepTargets();
  const files = targets.map(t => t.file);
  assert.ok(
    files.includes("overlay/chrome/JS/aether.uc.js"),
    "sweep must cover the glue file",
  );
  assert.ok(files.some(f => f.endsWith("userChrome.css")), "sweep must cover the chrome CSS");
  assert.ok(
    files.includes("overlay/loader/aether-loader.cfg"),
    "sweep must cover the loader (its console strings are user-visible copy too)",
  );
  const total = targets.reduce((n, t) => n + t.literals.length, 0);
  assert.ok(total > 50, `extractor found only ${total} literals — it is not reading the code`);
});

// 13. ending is an echo, not a report card ------------------------------------

test("strings: doneMessage echoes the task and carries no duration digits", async () => {
  const { doneMessage } = await stringsModule();
  const task = "write the ef spec"; // digit-free on purpose
  const msg = doneMessage(task);
  assert.ok(msg.includes(task), "the task is echoed back");
  assert.ok(
    !/\d/.test(msg.replace(task, "")),
    `no duration, no summary, no judgment — got ${JSON.stringify(msg)}`,
  );
});
