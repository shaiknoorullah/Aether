// b3 — Context Resurrection: behavioral tests for the pure context-record
// module and the f5 serde extension (SDD RED). Spec:
// overlay/specs/b3-context-resurrection.md §2 "Exact behavior", §3 (pure
// surface), §4 tests 1–11. Written before the implementation; the modules
// follow these.
//
// Contract pinned here (no Services/IOUtils/DOM/Date.now inside — time
// arrives as nowMs arguments):
//   aether-resurrect.sys.mjs (new pure module):
//     captureScroll(model, id, url, y, nowMs) — stores/overwrites the tab's
//       context record {url, scrollY, capturedAt} in model.contexts keyed by
//       the f5 ref id. Tracked-id guard: unknown id is ignored. y = 0 DELETES
//       the record (no record is the resting state); non-finite or negative y
//       is ignored. Never throws.
//     restoreY(model, id, loadedUrl) -> y | null — the recorded y only when
//       loadedUrl exactly matches the record's url and y > 0; mismatch,
//       missing record, or a zero record → null. Never force-applies stale.
//     dropContext(model, id) — deletes the record; unknown id is a no-op.
//     pruneContexts(model, nowMs) — drops records older than 30 days (kept at
//       exactly 30 days — boundary explicit), records whose id resolves to no
//       tracked ref, and records whose url no longer matches the ref's
//       current url. Matching records survive untouched.
//     sanitizeContexts(raw) -> contexts store — tolerant per-entry validation
//       for deserialization: wrong shapes and non-numeric keys dropped
//       individually, hostile keys (__proto__ &c) inert, garbage input →
//       empty store. No throw, no prototype pollution.
//   aether-workspaces.sys.mjs (extended, additively):
//     model gains contexts: {} (fresh models start empty);
//     serialize emits schema: 2 plus contexts;
//     deserialize sanitizes contexts (age pruning stays in the service where
//       Date.now lives) and never lets orphan-id reassignment misattach a
//       record to the wrong ref;
//     removeTab drops the closed tab's context record;
//     schema-less v1 files deserialize fine (empty contexts, no throw).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  captureScroll,
  restoreY,
  dropContext,
  pruneContexts,
  sanitizeContexts,
} from "../../chrome/JS/aether-resurrect.sys.mjs";

import {
  createModel,
  switchOrCreate,
  cycleNext,
  rename,
  adopt,
  updateTab,
  removeTab,
  tabsOf,
  serialize,
  deserialize,
} from "../../chrome/JS/aether-workspaces.sys.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * DAY_MS;
const URL_A = "https://example.com/deep-doc";
const URL_B = "https://example.com/elsewhere";

// Helpers ---------------------------------------------------------------------

function modelWithTab(url = URL_A) {
  const m = createModel("main");
  const ref = adopt(m, "main", { url, title: "Doc" });
  return { m, ref };
}

function contextCount(m) {
  return Object.keys(m.contexts ?? {}).length;
}

function snapshot(m) {
  return JSON.stringify(m.contexts);
}

// 1. capture creates the record; latest capture wins --------------------------

test("resurrect: capturing a scroll creates {url, scrollY, capturedAt}; a second capture overwrites", () => {
  const { m, ref } = modelWithTab();
  assert.equal(contextCount(m), 0, "a fresh model has no context records");

  captureScroll(m, ref.id, URL_A, 480, 1_000);
  assert.equal(contextCount(m), 1, "one record per tab");
  const rec = m.contexts[ref.id];
  assert.ok(rec, "the record is keyed by the tab's ref id");
  assert.equal(rec.url, URL_A);
  assert.equal(rec.scrollY, 480);
  assert.equal(rec.capturedAt, 1_000);

  captureScroll(m, ref.id, URL_A, 1200, 2_000);
  assert.equal(contextCount(m), 1, "still one record — overwrite, not accrete");
  assert.equal(m.contexts[ref.id].scrollY, 1200, "latest capture wins");
  assert.equal(m.contexts[ref.id].capturedAt, 2_000);
});

// 2. y = 0 deletes — no record is the resting state ---------------------------

test("resurrect: capturing y = 0 deletes the tab's record, never stores a zero", () => {
  const { m, ref } = modelWithTab();
  captureScroll(m, ref.id, URL_A, 480, 1_000);
  assert.equal(contextCount(m), 1);

  captureScroll(m, ref.id, URL_A, 0, 2_000);
  assert.equal(contextCount(m), 0, "scrolled-to-top serializes as no record");

  // and a zero capture with no existing record stays a clean no-op
  assert.doesNotThrow(() => captureScroll(m, ref.id, URL_A, 0, 3_000));
  assert.equal(contextCount(m), 0);
});

// 3. unknown id / bogus y ignored ---------------------------------------------

test("resurrect: unknown tab id or non-finite/negative y leaves contexts unchanged", () => {
  const { m, ref } = modelWithTab();
  captureScroll(m, ref.id, URL_A, 480, 1_000);
  const before = snapshot(m);

  assert.doesNotThrow(() => captureScroll(m, 999, URL_A, 300, 2_000), "untracked id: no throw");
  for (const y of [NaN, Infinity, -Infinity, -1, -480, "120"]) {
    assert.doesNotThrow(() => captureScroll(m, ref.id, URL_A, y, 2_000), `y=${String(y)}: no throw`);
  }
  assert.equal(snapshot(m), before, "no orphan record, no clobbered record");
});

// 4. restoreY: exact url match only -------------------------------------------

test("resurrect: restoreY returns y on exact url match; mismatch, missing, or zero → null", () => {
  const { m, ref } = modelWithTab();
  captureScroll(m, ref.id, URL_A, 480, 1_000);

  assert.equal(restoreY(m, ref.id, URL_A), 480, "exact match restores");
  assert.equal(restoreY(m, ref.id, URL_B), null, "redirect/changed url: stale record never forced");
  assert.equal(restoreY(m, ref.id, URL_A + "#frag"), null, "match is exact, not prefix");
  assert.equal(restoreY(m, 999, URL_A), null, "no record → null");

  // a zero record can only arrive from a crafted file — still never restored
  m.contexts[ref.id] = { url: URL_A, scrollY: 0, capturedAt: 1_000 };
  assert.equal(restoreY(m, ref.id, URL_A), null, "y = 0 → null");
});

// 5. pruneContexts: the 30-day boundary, nowMs injected -----------------------

test("resurrect: pruneContexts drops records older than 30 days, keeps exactly-30-day records", () => {
  const m = createModel("main");
  const fresh = adopt(m, "main", { url: URL_A, title: "Fresh" });
  const edge = adopt(m, "main", { url: URL_B, title: "Edge" });
  const stale = adopt(m, "main", { url: "https://example.com/stale", title: "Stale" });

  const now = 100 * DAY_MS;
  captureScroll(m, fresh.id, URL_A, 100, now - DAY_MS);
  captureScroll(m, edge.id, URL_B, 200, now - THIRTY_DAYS_MS); // exactly 30 days
  captureScroll(m, stale.id, "https://example.com/stale", 300, now - THIRTY_DAYS_MS - 1);

  pruneContexts(m, now);
  assert.equal(restoreY(m, fresh.id, URL_A), 100, "fresh record survives");
  assert.equal(restoreY(m, edge.id, URL_B), 200, "exactly 30 days is kept — boundary explicit");
  assert.equal(m.contexts[stale.id], undefined, "older than 30 days is dropped");
});

// 6. pruneContexts: orphan ids and url drift ----------------------------------

test("resurrect: pruneContexts drops orphan-id and url-drifted records; matching survive untouched", () => {
  const m = createModel("main");
  const keep = adopt(m, "main", { url: URL_A, title: "Keep" });
  const drift = adopt(m, "main", { url: URL_B, title: "Drift" });

  const now = 10 * DAY_MS;
  captureScroll(m, keep.id, URL_A, 480, now - 1);
  captureScroll(m, drift.id, URL_B, 900, now - 1);
  const keepBefore = JSON.stringify(m.contexts[keep.id]);

  // the drifted tab navigated on: the ref's url no longer matches its record
  updateTab(m, drift.id, { url: "https://example.com/moved-on" });
  // an orphan record whose id resolves to no tracked ref (spec-pinned store shape)
  m.contexts[999] = { url: URL_A, scrollY: 50, capturedAt: now - 1 };

  pruneContexts(m, now);
  assert.equal(m.contexts[999], undefined, "orphan id dropped");
  assert.equal(m.contexts[drift.id], undefined, "url drift dropped");
  assert.equal(
    JSON.stringify(m.contexts[keep.id]),
    keepBefore,
    "a matching record survives untouched",
  );
});

// 7. closing a tab drops its record -------------------------------------------

test("resurrect: removeTab drops the closed tab's context; dropContext on unknown id is a no-op", () => {
  const { m, ref } = modelWithTab();
  const other = adopt(m, "main", { url: URL_B, title: "Other" });
  captureScroll(m, ref.id, URL_A, 480, 1_000);
  captureScroll(m, other.id, URL_B, 250, 1_000);

  removeTab(m, ref.id);
  assert.equal(m.contexts[ref.id], undefined, "the memory dies with the tab");
  assert.equal(restoreY(m, other.id, URL_B), 250, "the sibling's record survives");

  assert.doesNotThrow(() => dropContext(m, 424242), "unknown id: silent no-op");
  dropContext(m, other.id);
  assert.equal(contextCount(m), 0);
});

// 8. serialize: schema 2 + contexts; round trip -------------------------------

test("resurrect: serialize emits schema 2 with contexts; round trip preserves surviving records", () => {
  const m = createModel("main");
  const a = adopt(m, "main", { url: URL_A, title: "A" });
  switchOrCreate(m, "dev", 1_000);
  const b = adopt(m, "dev", { url: URL_B, title: "B" });
  captureScroll(m, a.id, URL_A, 480, 5_000);
  captureScroll(m, b.id, URL_B, 1200, 6_000);

  const parsed = JSON.parse(serialize(m));
  assert.equal(parsed.schema, 2, "serialize now emits schema: 2");
  assert.ok(parsed.contexts && typeof parsed.contexts === "object", "contexts ride in the JSON");

  const revived = deserialize(serialize(m), "unused");
  assert.equal(restoreY(revived, a.id, URL_A), 480, "record tied to a surviving ref round-trips");
  assert.equal(restoreY(revived, b.id, URL_B), 1200);
  assert.equal(revived.contexts[a.id].capturedAt, 5_000, "capturedAt survives for age pruning");
});

// 9. schema-less v1 files tolerated -------------------------------------------

test("resurrect: a schema-less v1 f5 file deserializes to a valid model with empty contexts", () => {
  // exactly what the pre-b3 serialize wrote: no schema, no contexts
  const v1 = JSON.stringify({
    active: "main",
    nextId: 2,
    workspaces: [
      {
        name: "main",
        containerId: 0,
        tabRefs: [{ id: 1, url: URL_A, title: "A" }],
        lastActive: 0,
        selectedId: null,
      },
    ],
  });
  let m;
  assert.doesNotThrow(() => {
    m = deserialize(v1, "main");
  }, "old files tolerated, no throw");
  assert.deepEqual(tabsOf(m, "main").map(r => r.url), [URL_A], "membership survives");
  assert.equal(contextCount(m), 0, "empty contexts");
  // and the revived model works: capture + restore behave
  captureScroll(m, 1, URL_A, 480, 1_000);
  assert.equal(restoreY(m, 1, URL_A), 480);
});

// 10. malformed context entries dropped individually, no pollution ------------

test("resurrect: sanitizeContexts drops wrong shapes and hostile keys, keeps valid siblings", () => {
  const raw = JSON.parse(`{
    "5": {"url": "${URL_A}", "scrollY": 480, "capturedAt": 1000},
    "6": {"url": 42, "scrollY": 10, "capturedAt": 1},
    "7": "junk",
    "8": null,
    "9": {"url": "${URL_B}", "scrollY": "high", "capturedAt": 1},
    "10": {"url": "${URL_B}", "scrollY": 10, "capturedAt": "yesterday"},
    "abc": {"url": "${URL_B}", "scrollY": 10, "capturedAt": 1},
    "__proto__": {"url": "https://evil.example", "scrollY": 1, "capturedAt": 1}
  }`);
  const clean = sanitizeContexts(raw);
  assert.equal(Object.keys(clean).length, 1, "only the valid sibling survives");
  assert.equal(clean[5].url, URL_A);
  assert.equal(clean[5].scrollY, 480);
  assert.equal(clean[5].capturedAt, 1000);
  assert.equal({}.url, undefined, "no prototype pollution");
  assert.equal({}.scrollY, undefined, "no prototype pollution");

  for (const garbage of [null, undefined, 42, "junk", []]) {
    let out;
    assert.doesNotThrow(() => {
      out = sanitizeContexts(garbage);
    }, `sanitizeContexts(${String(garbage)}) must not throw`);
    assert.equal(Object.keys(out).length, 0, "garbage input → empty store");
  }
});

test("resurrect: deserialize drops malformed context entries individually, keeps valid ones", () => {
  const m = createModel("main");
  const a = adopt(m, "main", { url: URL_A, title: "A" });
  captureScroll(m, a.id, URL_A, 480, 1_000);
  const parsed = JSON.parse(serialize(m));
  Object.assign(parsed.contexts, {
    junk: { url: URL_B, scrollY: 10, capturedAt: 1 },
    77: "not a record",
  });
  // JSON.parse is the only way to plant an own __proto__ key
  const withProto = JSON.parse(
    JSON.stringify(parsed).replace('"contexts":{', '"contexts":{"__proto__":{"url":"https://evil.example","scrollY":9,"capturedAt":1},'),
  );

  let revived;
  assert.doesNotThrow(() => {
    revived = deserialize(JSON.stringify(withProto), "main");
  });
  assert.equal(restoreY(revived, a.id, URL_A), 480, "the valid sibling record survives");
  assert.equal(Object.keys(revived.contexts).length, 1, "malformed entries dropped individually");
  assert.equal({}.url, undefined, "no prototype pollution");
});

// 11. f5 invariants hold with contexts present --------------------------------

test("resurrect: adopt/rename/cycleNext leave contexts untouched", () => {
  const m = createModel("main");
  const a = adopt(m, "main", { url: URL_A, title: "A" });
  captureScroll(m, a.id, URL_A, 480, 1_000);
  const before = snapshot(m);

  switchOrCreate(m, "dev", 2_000);
  adopt(m, "dev", { url: URL_B, title: "B" }); // fresh adopt
  adopt(m, "dev", { id: a.id, url: URL_A, title: "A" }); // move — same id, record still valid
  assert.equal(rename(m, "hack").ok, true);
  cycleNext(m);
  assert.equal(snapshot(m), before, "model surgery never touches the records");
  assert.equal(restoreY(m, a.id, URL_A), 480, "the moved tab keeps its context (ids are model-wide)");
});

test("resurrect: orphan-id reassignment during deserialize cannot misattach a record", () => {
  // A file where one ref lost its id: deserialize reassigns it a fresh id
  // (max seen + 1 = 6 in the current f5 scheme). A stale context keyed at
  // that very id must not glue itself onto the reassigned ref.
  const crafted = JSON.stringify({
    schema: 2,
    active: "main",
    nextId: 7,
    workspaces: [
      {
        name: "main",
        containerId: 0,
        tabRefs: [
          { id: 5, url: URL_A, title: "A" },
          { url: URL_B, title: "B" }, // no id — reassigned on deserialize
        ],
        lastActive: 0,
        selectedId: null,
      },
    ],
    contexts: {
      5: { url: URL_A, scrollY: 480, capturedAt: 1_000 },
      6: { url: "https://example.com/stale-from-a-past-life", scrollY: 999, capturedAt: 1_000 },
    },
  });
  const m = deserialize(crafted, "main");

  const trackedIds = new Set(tabsOf(m, "main").map(r => r.id));
  for (const key of Object.keys(m.contexts)) {
    assert.ok(trackedIds.has(Number(key)), `record ${key} must point at a tracked ref`);
  }
  assert.equal(restoreY(m, 5, URL_A), 480, "the honestly-keyed record survives");

  const orphanRef = tabsOf(m, "main").find(r => r.url === URL_B);
  const rec = m.contexts[orphanRef.id];
  assert.ok(
    rec === undefined || rec.url === URL_B,
    "a reassigned ref never inherits some other tab's record",
  );
  assert.equal(
    restoreY(m, orphanRef.id, "https://example.com/stale-from-a-past-life"),
    null,
    "the stale record can never restore onto the wrong tab",
  );
});
