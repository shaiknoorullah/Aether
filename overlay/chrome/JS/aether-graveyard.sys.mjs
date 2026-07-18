// Aether tab graveyard — pure ring store + search + serde. No tab death:
// every real close is archived here, searchable from the palette, any entry
// resurrectable. No Services, no IOUtils, no DOM, no Date.now — callers
// inject closedAt and do the file I/O (aether-graveyard-service.sys.mjs).
// Canonical order is newest-first, everywhere.

export const NO_MATCHES_MESSAGE = "graveyard: no matches";
export const EMPTY_MESSAGE = "graveyard: empty";

const DEFAULT_CAP = 500;

// Opaque store: records[0] is the newest; oldest falls off the end past cap.
export function createStore(cap) {
  return {
    cap: Number.isInteger(cap) && cap > 0 ? cap : DEFAULT_CAP,
    nextId: 1,
    records: [],
  };
}

// Blank/about: tabs carry no context worth archiving; everything else does.
export function isBuriable(url) {
  return typeof url === "string" && url.trim() !== "" && !url.startsWith("about:");
}

// Archive one close. Assigns a fresh id, enforces the ring cap (oldest falls
// off). A non-buriable url buries nothing: returns null, store unchanged.
// `workspace` (the f5 field) is carried when provided.
export function bury(store, { url, title, closedAt, workspace }) {
  if (!isBuriable(url)) return null;
  const record = {
    id: store.nextId++,
    url,
    title: typeof title === "string" ? title : "",
    closedAt,
  };
  if (typeof workspace === "string" && workspace) record.workspace = workspace;
  store.records.unshift(record);
  if (store.records.length > store.cap) store.records.length = store.cap;
  return record;
}

// Case-insensitive substring of the whole query against title AND url,
// newest first; "" matches all. maxItems caps without reordering.
export function search(store, query, maxItems = Infinity) {
  const q = (query ?? "").toLowerCase();
  return store.records
    .filter(r => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q))
    .slice(0, maxItems);
}

// Resurrection: remove exactly that record and hand it back (it's no longer
// dead). Unknown id → null, store unchanged.
export function exhume(store, id) {
  const i = store.records.findIndex(r => r.id === id);
  if (i === -1) return null;
  return store.records.splice(i, 1)[0];
}

export function serialize(store) {
  return JSON.stringify({ records: store.records });
}

// Tolerant by design — a missing/corrupt file must never brick, never scold:
// bad JSON/shape → empty store, malformed records dropped, overflow truncated
// to the newest cap, nextId recomputed so fresh ids never collide.
export function deserialize(text, cap) {
  const store = createStore(cap);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return store;
  }
  const raw = Array.isArray(parsed?.records) ? parsed.records : [];
  const kept = [];
  for (const r of raw) {
    if (!r || typeof r !== "object" || typeof r.url !== "string" || r.url === "") continue;
    const record = {
      id: Number.isInteger(r.id) ? r.id : null,
      url: r.url,
      title: typeof r.title === "string" ? r.title : "",
      closedAt: typeof r.closedAt === "number" ? r.closedAt : 0,
    };
    if (typeof r.workspace === "string") record.workspace = r.workspace; // reserved for f5
    kept.push(record);
    if (kept.length === store.cap) break; // serialized newest-first; rest is older
  }
  store.nextId = kept.reduce((max, r) => Math.max(max, r.id ?? 0), 0) + 1;
  for (const r of kept) {
    if (r.id === null) r.id = store.nextId++;
  }
  store.records = kept;
  return store;
}

// Candidate-row text: "title — url", bare url when the title is empty/missing
// — never the text "undefined".
export function formatRecord(record) {
  const title = typeof record.title === "string" ? record.title : "";
  return title ? `${title} — ${record.url}` : record.url;
}
