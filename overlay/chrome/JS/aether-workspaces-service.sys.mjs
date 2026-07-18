// Aether workspaces service — the process-wide singleton around the pure
// model (ChromeUtils.importESModule caches this module once per process).
// Owns <profile>/aether-workspaces.json with atomic writes and the
// ContextualIdentityService mint/re-resolve; all decision logic lives in
// aether-workspaces.sys.mjs. Not unit-tested (browser glue) — the pure
// module is.

import { deserialize, serialize, setContainer } from "./aether-workspaces.sys.mjs";

const FILE_NAME = "aether-workspaces.json";

// Lazy: browser deps stay out of module top level (house rule).
function identityService() {
  return ChromeUtils.importESModule(
    "resource://gre/modules/ContextualIdentityService.sys.mjs"
  ).ContextualIdentityService;
}

export const AetherWorkspaces = {
  model: null,
  // First window in wins the restore; later windows just render.
  restored: false,
  _initPromise: null,
  _writeChain: Promise.resolve(),

  // Read the profile file once at process start; idempotent across windows
  // (first caller's defaultName wins). Missing/corrupt file → fresh default
  // model — never bricks, never scolds.
  init(defaultName) {
    return (this._initPromise ??= this._load(defaultName));
  },

  async _load(defaultName) {
    let text = "";
    try {
      const path = this._path();
      if (await IOUtils.exists(path)) text = await IOUtils.readUTF8(path);
    } catch (e) {
      console.info("[aether] workspaces file unreadable, starting fresh:", e);
    }
    this.model = deserialize(text, defaultName);
    return this.model;
  },

  _path() {
    return PathUtils.join(PathUtils.profileDir, FILE_NAME);
  },

  // Mint a container for a workspace name; returns its userContextId.
  mintContainer(name) {
    return identityService().create(name, "circle", "blue").userContextId;
  },

  // A workspace's usable userContextId: 0 stays vanilla; a stale id (the
  // container vanished from this profile) is re-minted by name and the model
  // rewritten — restore must never open tabs into a dead container.
  resolveContainer(ws) {
    if (!ws.containerId) return 0;
    if (identityService().getPublicIdentityFromId(ws.containerId)) {
      return ws.containerId;
    }
    const fresh = this.mintContainer(ws.name);
    setContainer(this.model, ws.name, fresh);
    this.persist();
    return fresh;
  },

  // Async atomic writes (tmpPath), queued so they never interleave; last
  // write wins.
  persist() {
    if (!this.model) return;
    const text = serialize(this.model);
    const path = this._path();
    this._writeChain = this._writeChain
      .then(() => IOUtils.writeUTF8(path, text, { tmpPath: `${path}.tmp` }))
      .catch(e => console.error("[aether] could not write workspaces:", e));
  },
};
