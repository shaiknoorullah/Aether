// Aether workspaces — pure model + serde. Invariants (enforced here): every
// tracked tab belongs to exactly one workspace; at least one workspace always
// exists; `active` always names an existing workspace; names are unique and
// non-empty. No Services, no IOUtils, no DOM, no Date.now — time arrives as
// nowMs arguments and container ids are injected by the glue
// (aether-workspaces-service.sys.mjs owns the file and the containers).
//
// Model: {active, nextId, workspaces: [{name, containerId, tabRefs,
// lastActive, selectedId}]} in CREATION order; tabRefs: [{id, url, title}].
// containerId 0 = no container (vanilla browsing). selectedId is the ref id
// of the workspace's remembered landing tab (null = fall back to the first
// ref) — persisted so restore lands on the active workspace's lastActive tab.

// Neutral statusbar copy — no error states, no scolding.
export function nameInUseMessage(name) {
  return `workspace name in use: ${name}`;
}

export function noWorkspaceMessage(name) {
  return `no workspace: ${name}`;
}

const NEEDS_NAME_MESSAGE = "workspace needs a name";

function find(model, name) {
  return model.workspaces.find(w => w.name === name);
}

export function createModel(defaultName) {
  return {
    active: defaultName,
    nextId: 1,
    workspaces: [
      { name: defaultName, containerId: 0, tabRefs: [], lastActive: 0, selectedId: null },
    ],
  };
}

// Existing name → switch (created: false). New name → create + activate
// (created: true — glue then mints a container and calls setContainer).
// Switching-to stamps that workspace's lastActive recency.
export function switchOrCreate(model, name, nowMs) {
  let ws = find(model, name);
  const created = !ws;
  if (created) {
    ws = { name, containerId: 0, tabRefs: [], lastActive: 0, selectedId: null };
    model.workspaces.push(ws);
  }
  ws.lastActive = nowMs;
  model.active = name;
  return { created };
}

// Glue writes the minted userContextId back onto a created workspace.
export function setContainer(model, name, containerId) {
  const ws = find(model, name);
  if (ws) ws.containerId = containerId;
}

// Palette candidate order: active first, then most-recent lastActive.
export function candidateNames(model) {
  const rest = model.workspaces
    .filter(w => w.name !== model.active)
    .sort((a, b) => b.lastActive - a.lastActive)
    .map(w => w.name);
  return [model.active, ...rest];
}

// gw / :ws_next — advance through CREATION order, wrapping; a single
// workspace cycles to itself.
export function cycleNext(model) {
  const i = model.workspaces.findIndex(w => w.name === model.active);
  model.active = model.workspaces[(i + 1) % model.workspaces.length].name;
  return model.active;
}

// Rename the ACTIVE workspace. Collision or empty name → neutral message,
// model untouched — a rejected rename is not a failure state.
export function rename(model, newName) {
  if (typeof newName !== "string" || newName.trim() === "") {
    return { ok: false, message: NEEDS_NAME_MESSAGE };
  }
  if (find(model, newName)) {
    return { ok: false, message: nameInUseMessage(newName) };
  }
  find(model, model.active).name = newName;
  model.active = newName;
  return { ok: true };
}

// Place a tab in exactly one workspace. No id ⇒ assigns a fresh one; a
// tracked id ⇒ MOVES the ref (the exactly-one invariant), same id.
export function adopt(model, wsName, { id, url, title }) {
  const ws = find(model, wsName);
  if (!ws) return null;
  if (id === undefined || id === null) {
    id = model.nextId++;
  } else {
    removeTab(model, id);
    if (Number.isInteger(id) && id >= model.nextId) model.nextId = id + 1;
  }
  const ref = { id, url, title };
  ws.tabRefs.push(ref);
  return ref;
}

// Remember which tracked tab its workspace last had selected — restore and
// switches land on it (spec: "land on active's lastActive tab"). The id keys
// whichever workspace holds the ref, so a rename never loses the memory.
// Unknown id is a silent no-op, never a throw.
export function markSelected(model, id) {
  for (const ws of model.workspaces) {
    if (ws.tabRefs.some(r => r.id === id)) {
      ws.selectedId = id;
      return;
    }
  }
}

// Rewrite a tracked ref's url/title (only the fields provided). Unknown id
// is a silent no-op, never a throw.
export function updateTab(model, id, { url, title }) {
  for (const ws of model.workspaces) {
    const ref = ws.tabRefs.find(r => r.id === id);
    if (ref) {
      if (typeof url === "string") ref.url = url;
      if (typeof title === "string") ref.title = title;
      return;
    }
  }
}

// Drop a ref wherever it lives; a zero-tab workspace stays alive.
export function removeTab(model, id) {
  for (const ws of model.workspaces) {
    const i = ws.tabRefs.findIndex(r => r.id === id);
    if (i !== -1) {
      ws.tabRefs.splice(i, 1);
      if (ws.selectedId === id) ws.selectedId = null; // fall back to the first ref
      return;
    }
  }
}

export function tabsOf(model, name) {
  return find(model, name)?.tabRefs ?? [];
}

export function serialize(model) {
  return JSON.stringify({
    active: model.active,
    nextId: model.nextId,
    workspaces: model.workspaces,
  });
}

// Tolerant by design — a missing/corrupt file must never brick, never scold:
// bad JSON/shape → fresh default model; malformed workspaces and tabRefs
// dropped; duplicate names → first wins (the dropped one's membership is
// discarded); `active` re-pointed at a survivor; nextId recomputed so fresh
// ids never collide with deserialized ones.
export function deserialize(text, defaultName) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return createModel(defaultName);
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.workspaces)) {
    return createModel(defaultName);
  }
  const seenNames = new Set();
  const seenIds = new Set();
  const orphans = []; // refs whose id was missing/duplicated — reassigned below
  const workspaces = [];
  for (const w of parsed.workspaces) {
    if (!w || typeof w !== "object" || typeof w.name !== "string" || w.name === "") continue;
    if (seenNames.has(w.name)) continue; // first wins
    seenNames.add(w.name);
    const tabRefs = [];
    for (const r of Array.isArray(w.tabRefs) ? w.tabRefs : []) {
      if (!r || typeof r !== "object" || typeof r.url !== "string" || r.url === "") continue;
      const ok = Number.isInteger(r.id) && !seenIds.has(r.id);
      const ref = { id: ok ? r.id : null, url: r.url, title: typeof r.title === "string" ? r.title : "" };
      if (ok) seenIds.add(r.id);
      else orphans.push(ref);
      tabRefs.push(ref);
    }
    workspaces.push({
      name: w.name,
      containerId: Number.isInteger(w.containerId) ? w.containerId : 0,
      tabRefs,
      lastActive: typeof w.lastActive === "number" ? w.lastActive : 0,
      selectedId: Number.isInteger(w.selectedId) ? w.selectedId : null,
    });
  }
  if (!workspaces.length) return createModel(defaultName);
  let nextId = Math.max(0, ...seenIds) + 1;
  for (const ref of orphans) ref.id = nextId++;
  // A selection must point at one of its own surviving refs (orphans got
  // fresh ids above, so a stale selection falls back to the first ref).
  for (const ws of workspaces) {
    if (ws.selectedId !== null && !ws.tabRefs.some(r => r.id === ws.selectedId)) {
      ws.selectedId = null;
    }
  }
  const active = seenNames.has(parsed.active) ? parsed.active : workspaces[0].name;
  return { active, nextId, workspaces };
}
