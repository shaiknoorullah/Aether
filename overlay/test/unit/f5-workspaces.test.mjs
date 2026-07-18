// f5 — Workspaces: behavioral tests for the pure model/serde module (SDD RED).
// Spec: overlay/specs/f5-workspaces-and-persistence.md §2 "Exact behavior",
// §3 (pure surface), §4 tests 1–14. Written before the implementation; the
// module follows these.
//
// Contract pinned by these tests (no Services/IOUtils/DOM/Date.now inside —
// time arrives as nowMs arguments; container ids are injected by glue):
//   createModel(defaultName) -> model. Model shape (spec §2, serde-visible):
//     model.active — name of the active workspace (always an existing one)
//     model.workspaces — array in CREATION ORDER of
//       {name, containerId, tabRefs: [{id, url, title}], lastActive}
//     Fresh model: exactly one workspace named defaultName, containerId 0
//     (no container — default browsing stays vanilla), no tabs, active.
//   switchOrCreate(model, name, nowMs) -> {created: boolean} — existing name
//     switches (created false, no duplicate); new name creates + activates
//     (created true, glue then mints a container). Switching-to stamps that
//     workspace's lastActive recency with nowMs.
//   setContainer(model, name, containerId) — glue writes the minted id back.
//   candidateNames(model) -> workspace names for the palette provider:
//     active first, then most-recent lastActive.
//   cycleNext(model) — advances model.active through CREATION order, wrapping;
//     a single workspace cycles to itself. (gw / :ws_next)
//   rename(model, newName) -> {ok: true} | {ok: false, message} — renames the
//     ACTIVE workspace; collision with an existing name or empty string is
//     rejected with a neutral message and the model is untouched.
//   adopt(model, wsName, {id?, url, title}) -> ref {id, url, title} — places a
//     tab in exactly one workspace. No id ⇒ assigns a fresh one; a tracked id
//     ⇒ MOVES the ref (the exactly-one invariant), same id.
//   updateTab(model, id, {url, title}) — rewrites the tracked ref; unknown id
//     is a silent no-op, never a throw.
//   removeTab(model, id) — drops the ref; a zero-tab workspace stays alive.
//   tabsOf(model, name) -> [{id, url, title}] for that workspace.
//   serialize(model) -> string; deserialize(text, defaultName) -> model
//     (tolerant: bad JSON/shape → fresh default model; malformed workspaces
//     and tabRefs dropped; duplicate names → first wins; active re-pointed to
//     a survivor; nextId recomputed so ids never collide). Never throws,
//     never scolds.
//   nameInUseMessage(name) -> "workspace name in use: <name>" (spec §2 copy)
//   noWorkspaceMessage(name) -> "no workspace: <name>" (house style: matches
//     "no command: " / "no tab: ") — both neutral, non-punitive.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createModel,
  switchOrCreate,
  setContainer,
  candidateNames,
  cycleNext,
  rename,
  adopt,
  markSelected,
  updateTab,
  removeTab,
  tabsOf,
  serialize,
  deserialize,
  nameInUseMessage,
  noWorkspaceMessage,
} from "../../chrome/JS/aether-workspaces.sys.mjs";

// Helpers ---------------------------------------------------------------------

function names(model) {
  return model.workspaces.map(w => w.name);
}

function allTrackedIds(model) {
  return model.workspaces.flatMap(w => tabsOf(model, w.name).map(r => r.id));
}

// Parse serialize() output and locate the workspaces array + a workspace
// entry's tabRefs array without pinning the container key names.
function parsedWithWorkspacesKey(model) {
  const parsed = JSON.parse(serialize(model));
  const key = Object.keys(parsed).find(
    k =>
      Array.isArray(parsed[k]) &&
      parsed[k].some(w => w && typeof w === "object" && typeof w.name === "string"),
  );
  assert.ok(key, "serialized form must contain the workspaces array");
  return { parsed, key };
}

function tabsKeyOf(wsEntry) {
  const key = Object.keys(wsEntry).find(k => Array.isArray(wsEntry[k]));
  assert.ok(key, "serialized workspace entry must contain its tabRefs array");
  return key;
}

// 1. fresh model --------------------------------------------------------------

test("workspaces: fresh model has one default workspace, active, container 0, no tabs", () => {
  const m = createModel("main");
  assert.equal(m.active, "main");
  assert.deepEqual(names(m), ["main"]);
  assert.equal(m.workspaces[0].containerId, 0, "default workspace is container 0 (vanilla)");
  assert.deepEqual(tabsOf(m, "main"), []);
});

// 2. switchOrCreate -----------------------------------------------------------

test("workspaces: switchOrCreate with a new name creates and activates it", () => {
  const m = createModel("main");
  const r = switchOrCreate(m, "dev", 1000);
  assert.equal(r.created, true, "new name must report created: true");
  assert.equal(m.active, "dev");
  assert.deepEqual(names(m), ["main", "dev"], "creation order: main then dev");
});

test("workspaces: switchOrCreate with an existing name switches without duplicating", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const r = switchOrCreate(m, "main", 2000);
  assert.equal(r.created, false, "existing name must report created: false");
  assert.equal(m.active, "main");
  assert.deepEqual(names(m), ["main", "dev"], "no duplicate workspace");
});

// 3. adopt: the exactly-one invariant ----------------------------------------

test("workspaces: adopt places a tab in exactly one workspace", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const ref = adopt(m, "main", { url: "https://example.com/a", title: "Alpha" });
  assert.ok(ref, "adopt must return the ref");
  assert.ok(ref.id !== undefined && ref.id !== null, "adopt must assign an id");
  assert.equal(ref.url, "https://example.com/a");
  assert.equal(ref.title, "Alpha");
  assert.deepEqual(tabsOf(m, "main").map(r => r.id), [ref.id]);
  assert.deepEqual(tabsOf(m, "dev"), [], "the tab lives in main and nowhere else");
});

test("workspaces: adopting a tracked tab into another workspace moves it (invariant)", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const ref = adopt(m, "main", { url: "https://example.com/a", title: "Alpha" });
  const moved = adopt(m, "dev", { id: ref.id, url: "https://example.com/a", title: "Alpha" });
  assert.equal(moved.id, ref.id, "a move keeps the id");
  assert.deepEqual(tabsOf(m, "dev").map(r => r.id), [ref.id], "now in dev");
  assert.deepEqual(tabsOf(m, "main"), [], "gone from main");
  const occurrences = allTrackedIds(m).filter(id => id === ref.id).length;
  assert.equal(occurrences, 1, "every tracked tab is in exactly one workspace");
});

// 4. lastActive recency + candidate ordering ---------------------------------

test("workspaces: switching updates lastActive recency; candidates are active-first then most-recent", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  switchOrCreate(m, "notes", 2000);
  switchOrCreate(m, "main", 3000);
  // active main first, then notes (2000) over dev (1000)
  assert.deepEqual(candidateNames(m), ["main", "notes", "dev"]);
  switchOrCreate(m, "dev", 4000);
  // active dev first, then main (3000) over notes (2000)
  assert.deepEqual(candidateNames(m), ["dev", "main", "notes"]);
});

test("workspaces: candidateNames of a fresh model is just the default", () => {
  assert.deepEqual(candidateNames(createModel("main")), ["main"]);
});

// 5. cycleNext ---------------------------------------------------------------

test("workspaces: cycleNext walks creation order and wraps", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  switchOrCreate(m, "notes", 2000); // active: notes; creation order: main, dev, notes
  cycleNext(m);
  assert.equal(m.active, "main", "past the last workspace wraps to the first");
  cycleNext(m);
  assert.equal(m.active, "dev");
  cycleNext(m);
  assert.equal(m.active, "notes");
  cycleNext(m);
  assert.equal(m.active, "main", "keeps wrapping");
});

test("workspaces: a single workspace cycles to itself, no throw", () => {
  const m = createModel("main");
  assert.doesNotThrow(() => cycleNext(m));
  assert.equal(m.active, "main");
});

// 6. rename ------------------------------------------------------------------

test("workspaces: rename changes the active workspace's name", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const r = rename(m, "hack");
  assert.equal(r.ok, true);
  assert.equal(m.active, "hack");
  assert.deepEqual(names(m), ["main", "hack"], "renamed in place; creation order kept");
});

test("workspaces: rename to an existing name is rejected with the neutral copy, model unchanged", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const before = JSON.stringify([m.active, names(m)]);
  const r = rename(m, "main");
  assert.equal(r.ok, false);
  assert.equal(r.message, nameInUseMessage("main"));
  assert.equal(JSON.stringify([m.active, names(m)]), before, "nothing changed");
});

test("workspaces: rename to an empty string is rejected neutrally, model unchanged", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000);
  const before = JSON.stringify([m.active, names(m)]);
  const r = rename(m, "");
  assert.equal(r.ok, false);
  assert.ok(typeof r.message === "string" && r.message.length > 0, "a message, not silence");
  assert.equal(JSON.stringify([m.active, names(m)]), before, "nothing changed");
});

// 7. zero-tab workspaces survive ---------------------------------------------

test("workspaces: removing the last tab leaves the workspace alive and the model valid", () => {
  const m = createModel("main");
  const ref = adopt(m, "main", { url: "https://example.com/only", title: "Only" });
  removeTab(m, ref.id);
  assert.deepEqual(names(m), ["main"], "zero-tab workspace survives");
  assert.equal(m.active, "main", "active still names an existing workspace");
  assert.deepEqual(tabsOf(m, "main"), []);
  // the model still works: adopting again is fine
  assert.doesNotThrow(() => adopt(m, "main", { url: "https://example.com/b", title: "B" }));
});

// 8. updateTab ---------------------------------------------------------------

test("workspaces: updateTab rewrites url/title for a tracked id", () => {
  const m = createModel("main");
  const ref = adopt(m, "main", { url: "https://example.com/old", title: "Old" });
  updateTab(m, ref.id, { url: "https://example.com/new", title: "New" });
  const [got] = tabsOf(m, "main");
  assert.equal(got.id, ref.id);
  assert.equal(got.url, "https://example.com/new");
  assert.equal(got.title, "New");
});

test("workspaces: updateTab with an unknown id is a no-op, no throw", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/a", title: "A" });
  const before = JSON.stringify(tabsOf(m, "main"));
  assert.doesNotThrow(() =>
    updateTab(m, "no-such-id", { url: "https://example.com/x", title: "X" }),
  );
  assert.equal(JSON.stringify(tabsOf(m, "main")), before, "nothing changed");
});

// 9. serialize → deserialize round trip --------------------------------------

test("workspaces: round trip preserves workspaces, creation order, containers, active, membership", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/m1", title: "M1" });
  adopt(m, "main", { url: "https://example.com/m2", title: "M2" });
  switchOrCreate(m, "dev", 1000);
  setContainer(m, "dev", 7);
  adopt(m, "dev", { url: "https://example.com/d1", title: "D1" });
  switchOrCreate(m, "notes", 2000);
  setContainer(m, "notes", 9);
  switchOrCreate(m, "dev", 3000); // land on dev

  const revived = deserialize(serialize(m), "fallback-unused");

  assert.equal(revived.active, "dev", "active survives (defaultName is NOT used)");
  assert.deepEqual(names(revived), ["main", "dev", "notes"], "creation order survives");
  assert.deepEqual(
    revived.workspaces.map(w => w.containerId),
    m.workspaces.map(w => w.containerId),
    "containerIds survive",
  );
  for (const name of ["main", "dev", "notes"]) {
    assert.deepEqual(
      tabsOf(revived, name).map(r => ({ url: r.url, title: r.title })),
      tabsOf(m, name).map(r => ({ url: r.url, title: r.title })),
      `membership of '${name}' survives`,
    );
  }
});

// 10. malformed JSON / wrong shape → fresh default model ----------------------

test("workspaces: deserialize of garbage never throws, yields the fresh default model", () => {
  for (const text of ["not json {", "42", '"a string"', "null", '{"workspaces": 12}', ""]) {
    let m;
    assert.doesNotThrow(() => {
      m = deserialize(text, "main");
    }, `deserialize(${JSON.stringify(text)}) must not throw`);
    assert.equal(m.active, "main");
    assert.deepEqual(names(m), ["main"], "fresh default model");
    assert.equal(m.workspaces[0].containerId, 0);
    assert.deepEqual(tabsOf(m, "main"), []);
    // and the fresh model still works
    assert.doesNotThrow(() => adopt(m, "main", { url: "https://example.com/x", title: "x" }));
  }
});

// 11. malformed entries dropped, active re-pointed ----------------------------

test("workspaces: deserialize drops malformed workspaces and tabRefs, keeps valid ones", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/keep", title: "Keep" });
  switchOrCreate(m, "dev", 1000);
  adopt(m, "dev", { url: "https://example.com/dev", title: "Dev" });

  const { parsed, key } = parsedWithWorkspacesKey(m);
  parsed[key].push(null, "not an object", { containerId: 3 }, { name: 42 });
  const mainEntry = parsed[key].find(w => w && w.name === "main");
  const tabsKey = tabsKeyOf(mainEntry);
  mainEntry[tabsKey].push(null, "junk", { title: "no url here" }, { url: 12345 });

  const revived = deserialize(JSON.stringify(parsed), "main");
  assert.deepEqual(names(revived), ["main", "dev"], "junk workspaces dropped, valid kept");
  assert.deepEqual(
    tabsOf(revived, "main").map(r => r.url),
    ["https://example.com/keep"],
    "junk refs dropped, valid ref kept",
  );
  assert.deepEqual(tabsOf(revived, "dev").map(r => r.url), ["https://example.com/dev"]);
});

test("workspaces: deserialize re-points active at a surviving workspace", () => {
  const m = createModel("main");
  switchOrCreate(m, "dev", 1000); // active: dev
  const { parsed, key } = parsedWithWorkspacesKey(m);
  parsed[key] = parsed[key].filter(w => !(w && w.name === "dev")); // dev vanishes
  const revived = deserialize(JSON.stringify(parsed), "fallback");
  assert.deepEqual(names(revived), ["main"]);
  assert.equal(revived.active, "main", "active re-pointed at a survivor");
});

test("workspaces: a file with zero valid workspaces yields the default model", () => {
  const m = createModel("main");
  const { parsed, key } = parsedWithWorkspacesKey(m);
  parsed[key] = [null, "junk", { containerId: 1 }]; // nothing valid left
  const revived = deserialize(JSON.stringify(parsed), "main");
  assert.equal(revived.active, "main");
  assert.deepEqual(names(revived), ["main"]);
  assert.deepEqual(tabsOf(revived, "main"), []);
});

// 12. duplicate names: first wins ---------------------------------------------

test("workspaces: duplicate names in a file → first kept, dropped membership discarded", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/first", title: "First" });
  const { parsed, key } = parsedWithWorkspacesKey(m);
  const orig = parsed[key].find(w => w && w.name === "main");
  const dup = JSON.parse(JSON.stringify(orig));
  const tabsKey = tabsKeyOf(dup);
  const dupRef = { ...dup[tabsKey][0], url: "https://example.com/dup", title: "Dup" };
  dup[tabsKey] = [dupRef];
  parsed[key].push(dup);

  const revived = deserialize(JSON.stringify(parsed), "main");
  assert.deepEqual(names(revived), ["main"], "one 'main' survives");
  assert.deepEqual(
    tabsOf(revived, "main").map(r => r.url),
    ["https://example.com/first"],
    "first entry's membership wins; the dropped one's is discarded",
  );
  assert.equal(revived.active, "main", "invariant holds");
});

// 13. id continuity across a round trip ---------------------------------------

test("workspaces: adopt after a round trip never collides with a deserialized tab id", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/a", title: "A" });
  switchOrCreate(m, "dev", 1000);
  adopt(m, "dev", { url: "https://example.com/b", title: "B" });
  const revived = deserialize(serialize(m), "main");
  const existing = new Set(allTrackedIds(revived));
  assert.ok(existing.size >= 2, "round trip kept the tracked ids");
  const fresh = adopt(revived, "main", { url: "https://example.com/c", title: "C" });
  assert.ok(!existing.has(fresh.id), "nextId recomputed — no id collision");
});

// 13b. remembered landing tab (spec §2 Persistence: restore lands on the
// active workspace's lastActive tab — the selection must survive serde) ------

test("workspaces: markSelected remembers a workspace's landing tab across a round trip", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/m1", title: "M1" });
  switchOrCreate(m, "dev", 1000);
  const blank = adopt(m, "dev", { url: "about:blank", title: "" });
  const page = adopt(m, "dev", { url: "https://example.com/d1", title: "D1" });
  markSelected(m, blank.id);
  markSelected(m, page.id); // latest selection wins
  const revived = deserialize(serialize(m), "unused");
  const dev = revived.workspaces.find(w => w.name === "dev");
  assert.equal(dev.selectedId, page.id, "the remembered tab survives serde");
});

test("workspaces: markSelected keys the workspace holding the ref; unknown id is a no-op", () => {
  const m = createModel("main");
  const a = adopt(m, "main", { url: "https://example.com/a", title: "A" });
  switchOrCreate(m, "dev", 1000);
  markSelected(m, a.id); // a lives in main even though dev is active
  assert.equal(m.workspaces.find(w => w.name === "main").selectedId, a.id);
  assert.equal(m.workspaces.find(w => w.name === "dev").selectedId, null);
  assert.doesNotThrow(() => markSelected(m, 999));
});

test("workspaces: removing the selected tab clears the selection; rename keeps it", () => {
  const m = createModel("main");
  const a = adopt(m, "main", { url: "https://example.com/a", title: "A" });
  markSelected(m, a.id);
  const r = rename(m, "hack");
  assert.equal(r.ok, true);
  assert.equal(m.workspaces[0].selectedId, a.id, "rename never forgets the landing tab");
  removeTab(m, a.id);
  assert.equal(m.workspaces[0].selectedId, null, "a dead selection falls back to the first ref");
});

test("workspaces: deserialize drops a selection that points at no surviving ref", () => {
  const m = createModel("main");
  adopt(m, "main", { url: "https://example.com/a", title: "A" });
  const parsed = JSON.parse(serialize(m));
  parsed.workspaces[0].selectedId = 424242; // stale / foreign id
  const revived = deserialize(JSON.stringify(parsed), "main");
  assert.equal(revived.workspaces[0].selectedId, null);
  parsed.workspaces[0].selectedId = "junk";
  const revived2 = deserialize(JSON.stringify(parsed), "main");
  assert.equal(revived2.workspaces[0].selectedId, null);
});

// 14. copy guard: neutral, non-shaming messages -------------------------------

test("workspaces: message copy is exact and non-punitive", () => {
  assert.equal(nameInUseMessage("dev"), "workspace name in use: dev");
  assert.equal(noWorkspaceMessage("dev"), "no workspace: dev");
  const m = createModel("main");
  switchOrCreate(m, "dev", 1);
  const empty = rename(m, "");
  for (const msg of [nameInUseMessage("dev"), noWorkspaceMessage("dev"), empty.message]) {
    assert.ok(typeof msg === "string" && msg.length > 0);
    const lower = msg.toLowerCase();
    for (const word of ["error", "invalid", "fail", "wrong", "bad", "oops", "sorry", "!"]) {
      assert.ok(!lower.includes(word), `copy must not contain punitive wording: '${word}' in '${msg}'`);
    }
  }
});
