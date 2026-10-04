// r4 schema 3 — tab metadata in the workspaces file. Found by the v1.2.0
// visual verification (2026-10-04): the pure tabsource serde existed and was
// unit-tested, but aether-workspaces' serialize still wrote schema 2 and
// dropped `tabMeta`, so every rename/tag/pin/mark died on relaunch. These pin
// the join between the two modules — the half no per-module test could see.
//
//   serialize(model)            -> schema 3; `tabMeta` rides next to contexts
//   deserialize(text)           -> tabMeta restored, sanitized, and — like b3
//                                  contexts — kept only for ids a ref honestly
//                                  carried in the file
//   removeTab(model, id)        -> drops the tab's metadata (it moved to the
//                                  graveyard record at burial, not here)
//   schema-2 / schema-less files deserialize with an empty tabMeta

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createModel,
  adopt,
  serialize,
  deserialize,
  removeTab,
} from "../../chrome/JS/aether-workspaces.sys.mjs";
import { applyMeta } from "../../chrome/JS/aether-tabsource.sys.mjs";

const URL_A = "https://example.com/a";
const URL_B = "https://example.org/b";

function modelWithMeta() {
  const m = createModel("main");
  const a = adopt(m, "main", { url: URL_A, title: "A" });
  const b = adopt(m, "main", { url: URL_B, title: "B" });
  let meta = applyMeta({}, { id: a.id, rename: "spec draft", mark: "a" });
  meta = applyMeta(meta, { id: b.id, pin: 1, tags: ["work"] });
  m.tabMeta = meta;
  return { m, a, b };
}

test("r4 serde: serialize emits schema 3 with tabMeta beside contexts", () => {
  const { m, a, b } = modelWithMeta();
  const parsed = JSON.parse(serialize(m));
  assert.equal(parsed.schema, 3);
  assert.ok(parsed.contexts && typeof parsed.contexts === "object", "b3 contexts still ride");
  assert.deepEqual(parsed.tabMeta[a.id], { rename: "spec draft", mark: "a" });
  assert.deepEqual(parsed.tabMeta[b.id], { tags: ["work"], pin: 1 });
});

test("r4 serde: rename, tags, pin and mark survive a round trip", () => {
  const { m, a, b } = modelWithMeta();
  const back = deserialize(serialize(m), "unused");
  assert.equal(back.tabMeta[a.id].rename, "spec draft");
  assert.equal(back.tabMeta[a.id].mark, "a");
  assert.equal(back.tabMeta[b.id].pin, 1);
  assert.deepEqual(back.tabMeta[b.id].tags, ["work"]);
});

test("r4 serde: metadata for an id no ref carries is dropped, never misattached", () => {
  const { m, a } = modelWithMeta();
  const parsed = JSON.parse(serialize(m));
  parsed.tabMeta["999"] = { rename: "orphan" };
  const back = deserialize(JSON.stringify(parsed), "unused");
  assert.equal(back.tabMeta["999"], undefined);
  assert.equal(back.tabMeta[a.id].rename, "spec draft");
});

test("r4 serde: schema-2 and schema-less files load with an empty tabMeta", () => {
  const v2 = JSON.stringify({
    schema: 2,
    active: "main",
    nextId: 2,
    workspaces: [{ name: "main", containerId: 0, tabRefs: [{ id: 1, url: URL_A, title: "A" }] }],
    contexts: {},
  });
  assert.deepEqual(deserialize(v2, "main").tabMeta, {});
  const v1 = JSON.stringify({
    active: "main",
    nextId: 2,
    workspaces: [{ name: "main", containerId: 0, tabRefs: [{ id: 1, url: URL_A, title: "A" }] }],
  });
  assert.deepEqual(deserialize(v1, "main").tabMeta, {});
});

test("r4 serde: hostile tabMeta keys stay inert", () => {
  const { m } = modelWithMeta();
  const parsed = JSON.parse(serialize(m));
  const text = JSON.stringify(parsed).replace('"tabMeta":{', '"tabMeta":{"__proto__":{"rename":"x"},');
  const back = deserialize(text, "unused");
  assert.equal({}.rename, undefined, "no prototype pollution");
  assert.equal(Object.getPrototypeOf(back.tabMeta) === Object.prototype || Object.getPrototypeOf(back.tabMeta) === null, true);
});

test("r4 serde: removeTab drops the closed tab's metadata", () => {
  const { m, a, b } = modelWithMeta();
  removeTab(m, a.id);
  assert.equal(m.tabMeta[a.id], undefined);
  assert.equal(m.tabMeta[b.id].pin, 1, "siblings untouched");
});

test("r4 serde: a fresh model starts with an empty tabMeta", () => {
  assert.deepEqual(createModel("main").tabMeta, {});
});
