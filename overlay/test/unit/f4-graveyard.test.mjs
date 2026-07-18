// f4 — Graveyard: behavioral tests for the pure ring-store module (SDD RED).
// Spec: overlay/specs/f4-vertical-tabs-and-graveyard.md §3 (pure surface),
// §4 tests 1–13. Written before the implementation; the module follows these.
//
// Contract pinned by these tests (no Services/IOUtils/DOM/Date.now inside —
// callers inject closedAt):
//   createStore(cap) -> store (opaque; inspect only via the API below)
//   bury(store, {url, title, closedAt}) -> record {id, url, title, closedAt}
//     assigns a fresh id, enforces the ring cap (oldest falls off), and for a
//     non-buriable url buries nothing: returns null, store unchanged.
//   isBuriable(url) -> boolean (about:/blank/empty/missing → false)
//   search(store, query, maxItems?) -> records, newest first; case-insensitive
//     substring of the whole query against title AND url; "" matches all.
//   exhume(store, id) -> record | null; removes exactly that record.
//   serialize(store) -> string; deserialize(text, cap) -> store (tolerant:
//     bad JSON/shape → empty store, malformed records dropped, overflow
//     truncated to the newest cap, nextId recomputed so ids never collide).
//   formatRecord(record) -> "title — url" ("—" U+2014), bare url when the
//     title is empty/missing — never the text "undefined".
//   NO_MATCHES_MESSAGE / EMPTY_MESSAGE — exact neutral statusbar copy.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createStore,
  bury,
  isBuriable,
  search,
  exhume,
  serialize,
  deserialize,
  formatRecord,
  NO_MATCHES_MESSAGE,
  EMPTY_MESSAGE,
} from "../../chrome/JS/aether-graveyard.sys.mjs";

// Small helper: bury n sequential records and return them in bury order.
function buryMany(store, n, base = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(
      bury(store, {
        url: `https://example.com/page-${base + i}`,
        title: `Page ${base + i}`,
        closedAt: 1000 + base + i,
      }),
    );
  }
  return out;
}

// 1. bury then search("") → newest first ------------------------------------

test("graveyard: bury then search('') returns the record", () => {
  const store = createStore(500);
  const rec = bury(store, {
    url: "https://example.com/a",
    title: "Alpha",
    closedAt: 111,
  });
  assert.ok(rec, "bury must return the buried record");
  assert.equal(rec.url, "https://example.com/a");
  assert.equal(rec.title, "Alpha");
  assert.equal(rec.closedAt, 111);
  assert.ok(rec.id !== undefined && rec.id !== null, "bury must assign an id");

  const got = search(store, "");
  assert.equal(got.length, 1);
  assert.equal(got[0].url, "https://example.com/a");
});

test("graveyard: several buries → search('') lists newest first", () => {
  const store = createStore(500);
  buryMany(store, 4);
  const got = search(store, "");
  assert.deepEqual(
    got.map(r => r.title),
    ["Page 3", "Page 2", "Page 1", "Page 0"],
    "canonical order is newest-first",
  );
});

// 2. ring cap ----------------------------------------------------------------

test("graveyard: burying past the cap drops the oldest, keeps the newest", () => {
  const store = createStore(3);
  buryMany(store, 4); // one past the cap
  const got = search(store, "");
  assert.equal(got.length, 3, "size stays at the cap");
  assert.deepEqual(
    got.map(r => r.title),
    ["Page 3", "Page 2", "Page 1"],
    "oldest (Page 0) fell off; newest kept",
  );
});

// 3. isBuriable + bury refuses non-buriable urls -----------------------------

test("graveyard: isBuriable rejects about:/blank/missing urls, accepts https", () => {
  assert.equal(isBuriable("about:blank"), false);
  assert.equal(isBuriable("about:newtab"), false);
  assert.equal(isBuriable(""), false);
  assert.equal(isBuriable(undefined), false);
  assert.equal(isBuriable("https://example.com/article"), true);
});

test("graveyard: bury of a non-buriable url leaves the store unchanged", () => {
  const store = createStore(500);
  buryMany(store, 2);
  const before = search(store, "").map(r => r.id);
  for (const url of ["about:blank", "about:newtab", "", undefined]) {
    const rec = bury(store, { url, title: "nope", closedAt: 999 });
    assert.equal(rec, null, `bury(${JSON.stringify(url)}) must bury nothing`);
  }
  assert.deepEqual(search(store, "").map(r => r.id), before, "store unchanged");
});

// 4. case-insensitive substring over title AND url ---------------------------

test("graveyard: search is case-insensitive over both title and url", () => {
  const store = createStore(500);
  bury(store, {
    url: "https://github.com/anthropics/repo",
    title: "some repo",
    closedAt: 1,
  });
  bury(store, {
    url: "https://example.com/docs",
    title: "README and Docs",
    closedAt: 2,
  });

  // uppercase query hits a lowercase url
  const byUrl = search(store, "GitHub");
  assert.equal(byUrl.length, 1);
  assert.equal(byUrl[0].url, "https://github.com/anthropics/repo");

  // lowercase query hits an uppercase title
  const byTitle = search(store, "readme");
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].title, "README and Docs");
});

// 5. no hits + maxItems cap --------------------------------------------------

test("graveyard: search with no hits returns an empty array", () => {
  const store = createStore(500);
  buryMany(store, 3);
  assert.deepEqual(search(store, "zzz-not-there"), []);
});

test("graveyard: maxItems caps results without reordering", () => {
  const store = createStore(500);
  buryMany(store, 5);
  const all = search(store, "");
  const capped = search(store, "", 2);
  assert.equal(capped.length, 2);
  assert.deepEqual(
    capped.map(r => r.id),
    all.slice(0, 2).map(r => r.id),
    "capped list is a prefix of the full newest-first list",
  );
});

// 6. exhume ------------------------------------------------------------------

test("graveyard: exhume removes exactly that record and returns it", () => {
  const store = createStore(500);
  const [, middle] = buryMany(store, 3);
  const got = exhume(store, middle.id);
  assert.ok(got, "exhume of a known id returns the record");
  assert.equal(got.id, middle.id);
  assert.equal(got.url, middle.url);
  const rest = search(store, "");
  assert.equal(rest.length, 2);
  assert.ok(!rest.some(r => r.id === middle.id), "exhumed record is gone");
});

test("graveyard: exhume of an unknown id returns null, store unchanged", () => {
  const store = createStore(500);
  buryMany(store, 3);
  const before = search(store, "").map(r => r.id);
  assert.equal(exhume(store, "no-such-id"), null);
  assert.deepEqual(search(store, "").map(r => r.id), before);
});

// 7. serialize/deserialize round-trip ----------------------------------------

test("graveyard: round-trip preserves records, order, and cap behavior", () => {
  const store = createStore(3);
  buryMany(store, 3);
  const revived = deserialize(serialize(store), 3);

  assert.deepEqual(
    search(revived, "").map(r => ({ url: r.url, title: r.title, closedAt: r.closedAt })),
    search(store, "").map(r => ({ url: r.url, title: r.title, closedAt: r.closedAt })),
    "records and newest-first order survive the round-trip",
  );

  // cap behavior still holds after the round-trip
  bury(revived, { url: "https://example.com/new", title: "New", closedAt: 9999 });
  const got = search(revived, "");
  assert.equal(got.length, 3, "cap still enforced after deserialize");
  assert.equal(got[0].title, "New");
  assert.ok(!got.some(r => r.title === "Page 0"), "oldest fell off");
});

// 8. malformed JSON / wrong shape → empty store, no throw --------------------

test("graveyard: deserialize of garbage never throws, yields an empty store", () => {
  for (const text of ["not json {", "42", '"a string"', "null", '{"records": "nope"}', ""]) {
    let store;
    assert.doesNotThrow(() => {
      store = deserialize(text, 500);
    }, `deserialize(${JSON.stringify(text)}) must not throw`);
    assert.deepEqual(search(store, ""), [], "corrupt input deserializes to empty");
    // and the empty store still works
    assert.doesNotThrow(() =>
      bury(store, { url: "https://example.com/x", title: "x", closedAt: 1 }),
    );
  }
});

// 9. malformed individual records dropped, valid ones kept -------------------

test("graveyard: deserialize drops malformed records and keeps valid ones", () => {
  const good = createStore(500);
  bury(good, { url: "https://example.com/keep", title: "Keep", closedAt: 5 });
  const parsed = JSON.parse(serialize(good));
  // splice junk in alongside the valid record, whatever the container key is
  const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
  assert.ok(key, "serialized form must contain the records array");
  parsed[key].push(
    { title: "no url here", closedAt: 6 }, // missing url
    { url: 12345, title: "wrong type", closedAt: 7 }, // url not a string
    "not even an object",
    null,
  );
  const revived = deserialize(JSON.stringify(parsed), 500);
  const got = search(revived, "");
  assert.equal(got.length, 1, "only the valid record survives");
  assert.equal(got[0].url, "https://example.com/keep");
});

// 10. oversized file truncated to the newest cap -----------------------------

test("graveyard: deserialize of an oversized file keeps only the newest cap", () => {
  const big = createStore(10);
  buryMany(big, 5);
  const revived = deserialize(serialize(big), 3);
  const got = search(revived, "");
  assert.equal(got.length, 3);
  assert.deepEqual(
    got.map(r => r.title),
    ["Page 4", "Page 3", "Page 2"],
    "newest 3 kept, oldest 2 dropped",
  );
});

// 11. id continuity across a round-trip --------------------------------------

test("graveyard: bury after a round-trip never collides with a deserialized id", () => {
  const store = createStore(500);
  buryMany(store, 4);
  const revived = deserialize(serialize(store), 500);
  const existing = new Set(search(revived, "").map(r => r.id));
  const fresh = bury(revived, {
    url: "https://example.com/fresh",
    title: "Fresh",
    closedAt: 2000,
  });
  assert.ok(fresh, "bury after round-trip succeeds");
  assert.ok(!existing.has(fresh.id), "nextId recomputed — no id collision");
});

// 12. formatRecord -----------------------------------------------------------

test("graveyard: formatRecord renders 'title — url'", () => {
  assert.equal(
    formatRecord({ id: 1, url: "https://example.com/a", title: "Alpha", closedAt: 1 }),
    "Alpha — https://example.com/a",
  );
});

test("graveyard: formatRecord with empty/missing title is the bare url, never 'undefined'", () => {
  const bare = formatRecord({ id: 1, url: "https://example.com/a", title: "", closedAt: 1 });
  assert.equal(bare, "https://example.com/a");
  const missing = formatRecord({ id: 2, url: "https://example.com/b", closedAt: 2 });
  assert.equal(missing, "https://example.com/b");
  assert.ok(!missing.includes("undefined"), "no 'undefined' text ever");
});

// 13. copy guard: neutral, non-shaming messages ------------------------------

test("graveyard: no-match and empty copy is exact and non-punitive", () => {
  assert.equal(NO_MATCHES_MESSAGE, "graveyard: no matches");
  assert.equal(EMPTY_MESSAGE, "graveyard: empty");
  for (const msg of [NO_MATCHES_MESSAGE, EMPTY_MESSAGE]) {
    const lower = msg.toLowerCase();
    for (const word of ["error", "invalid", "fail", "wrong", "bad", "oops", "sorry", "!"]) {
      assert.ok(!lower.includes(word), `copy must not contain punitive wording: '${word}'`);
    }
  }
});
