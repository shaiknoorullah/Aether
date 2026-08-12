// Aether context resurrection (b3) — pure per-tab context records over the f5
// model: {url, scrollY, capturedAt} keyed by the tab's ref id, living in
// model.contexts and riding inside aether-workspaces.json (schema 2). No
// Services, no IOUtils, no DOM, no Date.now — time arrives as nowMs arguments;
// the glue (aether.uc.js + aether-workspaces-service.sys.mjs) owns capture
// wiring, the one-shot restore, and the file.

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Record keys are ref ids — non-negative integers, as strings after JSON.
const ID_KEY = /^(0|[1-9][0-9]*)$/;

function refUrl(model, id) {
  for (const ws of model.workspaces) {
    const ref = ws.tabRefs.find(r => r.id === id);
    if (ref) return ref.url;
  }
  return undefined;
}

// Store/overwrite the tab's context record — one record per tab, latest wins.
// Tracked-id guard: an unknown id is ignored. y = 0 DELETES the record
// (top-of-page is what a fresh load gives; no record is the resting state);
// non-finite, negative, or non-numeric y is ignored. Never throws.
export function captureScroll(model, id, url, y, nowMs) {
  if (!model || typeof y !== "number" || !Number.isFinite(y) || y < 0) return;
  if (refUrl(model, id) === undefined) return;
  model.contexts ??= {};
  if (y === 0) {
    delete model.contexts[id];
    return;
  }
  model.contexts[id] = { url, scrollY: y, capturedAt: nowMs };
}

// The recorded y, only when the loaded url EXACTLY matches the record's url
// and y > 0 — mismatch (redirect, changed content), missing record, or a zero
// record → null. A stale record is never force-applied.
export function restoreY(model, id, loadedUrl) {
  const rec = model?.contexts?.[id];
  if (!rec || rec.url !== loadedUrl) return null;
  return Number.isFinite(rec.scrollY) && rec.scrollY > 0 ? rec.scrollY : null;
}

// The memory dies with the tab. Unknown id is a silent no-op.
export function dropContext(model, id) {
  if (model?.contexts) delete model.contexts[id];
}

// Drop records older than 30 days (kept at exactly 30 — boundary explicit),
// records whose id resolves to no tracked ref, and records whose url no
// longer matches the ref's current url. Matching records survive untouched.
export function pruneContexts(model, nowMs) {
  const contexts = model?.contexts;
  if (!contexts) return;
  for (const key of Object.keys(contexts)) {
    const rec = contexts[key];
    const url = refUrl(model, Number(key));
    if (url === undefined || rec.url !== url || nowMs - rec.capturedAt > THIRTY_DAYS_MS) {
      delete contexts[key];
    }
  }
}

// Tolerant per-entry validation for deserialization: non-numeric keys
// (__proto__ &c stay inert — they never pass ID_KEY) and wrong shapes are
// dropped individually; garbage input → empty store. No throw, no prototype
// pollution. Age pruning stays in the service, where Date.now lives.
export function sanitizeContexts(raw) {
  const clean = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
  for (const key of Object.keys(raw)) {
    if (!ID_KEY.test(key)) continue;
    const rec = raw[key];
    if (!rec || typeof rec !== "object" || Array.isArray(rec)) continue;
    if (typeof rec.url !== "string" || rec.url === "") continue;
    if (!Number.isFinite(rec.scrollY) || rec.scrollY <= 0) continue;
    if (!Number.isFinite(rec.capturedAt)) continue;
    clean[key] = { url: rec.url, scrollY: rec.scrollY, capturedAt: rec.capturedAt };
  }
  return clean;
}
