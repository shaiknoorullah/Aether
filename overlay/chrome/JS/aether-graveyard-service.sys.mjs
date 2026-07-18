// Aether graveyard service — the process-wide singleton around the pure ring
// store (ChromeUtils.importESModule caches this module once per process, so
// multi-window closes share one graveyard). Owns the profile persistence file
// and the shutdown flag; all decision logic lives in aether-graveyard.sys.mjs.
// Not unit-tested (browser glue) — the pure module is.

import {
  bury,
  search,
  exhume,
  serialize,
  deserialize,
} from "./aether-graveyard.sys.mjs";

const FILE_NAME = "aether-graveyard.json";

export const AetherGraveyard = {
  store: null,
  // Set by quit-application-granted: closes during shutdown are session
  // restore's business, not ours — recording them would duplicate every tab
  // at next launch.
  shuttingDown: false,
  _initPromise: null,
  _writeChain: Promise.resolve(),

  // Read the profile file once at startup; idempotent across windows (first
  // caller's cap wins). A missing/corrupt file deserializes to an empty
  // store — never bricks.
  init(cap) {
    return (this._initPromise ??= this._load(cap));
  },

  async _load(cap) {
    let text = "";
    try {
      const path = this._path();
      if (await IOUtils.exists(path)) text = await IOUtils.readUTF8(path);
    } catch (e) {
      console.info("[aether] graveyard file unreadable, starting empty:", e);
    }
    this.store = deserialize(text, cap);
    Services.obs.addObserver(() => {
      this.shuttingDown = true;
    }, "quit-application-granted");
    return this.store;
  },

  _path() {
    return PathUtils.join(PathUtils.profileDir, FILE_NAME);
  },

  bury(record) {
    if (!this.store || this.shuttingDown) return null;
    const buried = bury(this.store, record);
    if (buried) this._persist();
    return buried;
  },

  exhume(id) {
    if (!this.store) return null;
    const record = exhume(this.store, id);
    if (record) this._persist();
    return record;
  },

  search(query, maxItems) {
    return this.store ? search(this.store, query, maxItems) : [];
  },

  isEmpty() {
    return !this.store || this.store.records.length === 0;
  },

  // Async writes, queued so they never interleave; last write wins.
  _persist() {
    const text = serialize(this.store);
    this._writeChain = this._writeChain
      .then(() => IOUtils.writeUTF8(this._path(), text, { tmpPath: `${this._path()}.tmp` }))
      .catch(e => console.error("[aether] could not write graveyard:", e));
  },
};
