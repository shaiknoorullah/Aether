// ==UserScript==
// @name           aether
// @description    Aether modal keyboard layer + statusbar (Phase 0 spike)
// @include        main
// @loadOrder      10
// ==/UserScript==

// Runs in every browser window via fx-autoconfig. The spike's job:
// prove chrome-level modal input (incl. overriding reserved shortcuts) and
// zero-chrome with a summonable urlbar. Everything else is floor work.

"use strict";

(() => {
  if (window.Aether) return;

  const { AetherConfig } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-config.sys.mjs"
  );
  const { ensureActors } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-actors.sys.mjs"
  );
  ensureActors();

  const MODE = { NORMAL: "normal", INSERT: "insert", HINT: "hint" };
  const PENDING_TIMEOUT_MS = 800;

  class Aether {
    constructor(win, config) {
      this.win = win;
      this.config = config;
      this.mode = MODE.NORMAL;
      this.pending = "";
      this.pendingTimer = null;
      this.contentEditableFocused = false;

      this.commands = {
        scroll_down: () => this.sendContent("Aether:Scroll", { dy: this.opt("scroll_step") }),
        scroll_up: () => this.sendContent("Aether:Scroll", { dy: -this.opt("scroll_step") }),
        half_down: () => this.sendContent("Aether:HalfPage", { dir: 1 }),
        half_up: () => this.sendContent("Aether:HalfPage", { dir: -1 }),
        top: () => this.sendContent("Aether:ScrollTo", { where: "top" }),
        bottom: () => this.sendContent("Aether:ScrollTo", { where: "bottom" }),
        back: () => this.win.gBrowser.selectedBrowser.goBack(),
        forward: () => this.win.gBrowser.selectedBrowser.goForward(),
        reload: () => this.win.gBrowser.selectedBrowser.reload(),
        open: () => this.focusUrlbar(),
        open_tab: () => { this.newTab(); this.focusUrlbar(); },
        tab_new: () => { this.newTab(); this.focusUrlbar(); },
        tab_close: () => this.win.gBrowser.removeCurrentTab(),
        tab_next: () => this.win.gBrowser.tabContainer.advanceSelectedTab(1, true),
        tab_prev: () => this.win.gBrowser.tabContainer.advanceSelectedTab(-1, true),
        hints: () => this.startHints(),
        insert: () => this.setMode(MODE.INSERT),
        esc: () => this.escape(),
      };

      this.buildStatusbar();
      this.attach();
      this.setMode(MODE.NORMAL);
    }

    opt(name) {
      return this.config.options[name] ?? AetherConfig.DEFAULTS.options[name];
    }

    // --- wiring -------------------------------------------------------------

    attach() {
      const win = this.win;
      this.onKeydown = e => this.handleKeydown(e);
      win.addEventListener("keydown", this.onKeydown, true);

      this.onFocusChange = () => this.syncUrlbarFocus();
      win.document.addEventListener("focusin", this.onFocusChange, true);
      win.document.addEventListener("focusout", this.onFocusChange, true);

      this.progressListener = {
        onLocationChange: (wp, req, loc) => this.updateUrl(loc?.spec),
        QueryInterface: ChromeUtils.generateQI([
          "nsIWebProgressListener",
          "nsISupportsWeakReference",
        ]),
      };
      win.gBrowser.addProgressListener(this.progressListener);
      this.onTabSelect = () => this.updateUrl(win.gBrowser.currentURI?.spec);
      win.gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);

      if (this.opt("statusbar_clock")) {
        this.clockTimer = win.setInterval(() => this.updateClock(), 30_000);
        this.updateClock();
      }

      win.addEventListener("unload", () => this.destroy(), { once: true });
    }

    destroy() {
      const win = this.win;
      win.removeEventListener("keydown", this.onKeydown, true);
      win.document.removeEventListener("focusin", this.onFocusChange, true);
      win.document.removeEventListener("focusout", this.onFocusChange, true);
      try { win.gBrowser.removeProgressListener(this.progressListener); } catch {}
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
      if (this.clockTimer) win.clearInterval(this.clockTimer);
    }

    // --- key handling -------------------------------------------------------

    handleKeydown(event) {
      const key = event.key;
      if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") return;

      const combo = this.comboFor(event);

      // Reserved chords are ours in every mode — the spike's core proof.
      const reserved = this.config.keymap.reserved[combo];
      if (reserved) {
        this.consume(event);
        this.run(reserved);
        return;
      }

      if (key === "Escape") {
        this.consume(event);
        this.escape();
        return;
      }

      // While typing (urlbar, content fields, explicit insert): hands off.
      if (this.mode === MODE.INSERT) return;

      if (this.mode === MODE.HINT) {
        if (event.ctrlKey || event.altKey || event.metaKey) return;
        if (key.length === 1) {
          this.consume(event);
          this.sendContent("Aether:HintKey", { key });
        }
        return;
      }

      // NORMAL mode. Modified chords we don't own pass through (Ctrl+C etc).
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (key.length !== 1) return; // F-keys, arrows, Tab: let Firefox have them

      const seq = this.pending + key;
      const keymap = this.config.keymap.normal;
      this.consume(event); // printable keys never reach content in normal mode

      if (keymap[seq]) {
        this.clearPending();
        this.run(keymap[seq]);
      } else if (Object.keys(keymap).some(k => k.startsWith(seq))) {
        this.setPending(seq);
      } else {
        this.clearPending();
      }
    }

    comboFor(event) {
      let mods = "";
      if (event.ctrlKey) mods += "C-";
      if (event.altKey) mods += "A-";
      if (event.metaKey) mods += "M-";
      if (!mods) return null;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      return mods + key;
    }

    consume(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    setPending(seq) {
      this.pending = seq;
      this.win.clearTimeout(this.pendingTimer);
      this.pendingTimer = this.win.setTimeout(() => this.clearPending(), PENDING_TIMEOUT_MS);
      this.renderStatus();
    }

    clearPending() {
      this.pending = "";
      this.win.clearTimeout(this.pendingTimer);
      this.renderStatus();
    }

    run(command) {
      const fn = this.commands[command];
      if (!fn) {
        console.warn(`[aether] unknown command: ${command}`);
        return;
      }
      try {
        fn();
      } catch (e) {
        console.error(`[aether] command '${command}' failed:`, e);
      }
    }

    // --- modes --------------------------------------------------------------

    setMode(mode) {
      this.mode = mode;
      this.renderStatus();
    }

    escape() {
      if (this.mode === MODE.HINT) this.sendContent("Aether:HintsStop", {});
      if (this.win.gURLBar.focused) this.win.gURLBar.blur();
      if (this.contentEditableFocused) this.sendContent("Aether:Blur", {});
      this.clearPending();
      this.setMode(MODE.NORMAL);
    }

    startHints() {
      this.setMode(MODE.HINT);
      this.sendContent("Aether:HintsStart", { chars: this.opt("hint_chars") });
    }

    syncUrlbarFocus() {
      const focused = this.win.gURLBar.focused;
      if (focused && this.mode !== MODE.INSERT) {
        this.setMode(MODE.INSERT);
      } else if (!focused && this.mode === MODE.INSERT && !this.contentEditableFocused) {
        this.setMode(MODE.NORMAL);
      }
    }

    onContentMessage(name, data) {
      switch (name) {
        case "Aether:Focus":
          this.contentEditableFocused = data.editable;
          if (data.editable && this.mode === MODE.NORMAL) {
            this.setMode(MODE.INSERT);
          } else if (!data.editable && this.mode === MODE.INSERT && !this.win.gURLBar.focused) {
            this.setMode(MODE.NORMAL);
          }
          break;
        case "Aether:HintsDone":
          if (this.mode === MODE.HINT) this.setMode(MODE.NORMAL);
          break;
      }
    }

    // --- browser plumbing ---------------------------------------------------

    sendContent(name, data) {
      try {
        this.win.gBrowser.selectedBrowser.browsingContext
          ?.currentWindowGlobal?.getActor("AetherContent")
          ?.sendAsyncMessage(name, data);
      } catch (e) {
        console.error(`[aether] sendContent ${name} failed:`, e);
      }
    }

    newTab() {
      const gBrowser = this.win.gBrowser;
      const tab = gBrowser.addTrustedTab
        ? gBrowser.addTrustedTab("about:blank")
        : gBrowser.addTab("about:blank", {
            triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
          });
      gBrowser.selectedTab = tab;
    }

    focusUrlbar() {
      this.win.gURLBar.focus();
      this.win.gURLBar.select();
    }

    // --- statusbar ----------------------------------------------------------

    buildStatusbar() {
      const doc = this.win.document;
      const html = ns => doc.createElementNS("http://www.w3.org/1999/xhtml", ns);
      const bar = html("div");
      bar.id = "aether-statusbar";
      this.modeEl = html("span");
      this.modeEl.className = "aether-mode";
      this.urlEl = html("span");
      this.urlEl.className = "aether-url";
      this.clockEl = html("span");
      this.clockEl.className = "aether-clock";
      bar.append(this.modeEl, this.urlEl, this.clockEl);

      const browserEl = doc.getElementById("browser");
      if (browserEl?.parentNode) {
        browserEl.parentNode.insertBefore(bar, browserEl.nextSibling);
      } else {
        doc.documentElement.appendChild(bar);
      }
      this.bar = bar;
    }

    renderStatus() {
      if (!this.bar) return;
      this.bar.dataset.mode = this.mode;
      this.modeEl.textContent = this.pending
        ? `${this.mode.toUpperCase()} ${this.pending}`
        : this.mode.toUpperCase();
    }

    updateUrl(spec) {
      if (this.urlEl && spec) this.urlEl.textContent = spec;
    }

    updateClock() {
      if (!this.clockEl) return;
      const now = new Date();
      this.clockEl.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  (async () => {
    try {
      const config = await AetherConfig.load();
      window.Aether = new Aether(window, config);
      console.info("[aether] overlay active");
    } catch (e) {
      console.error("[aether] init failed:", e);
    }
  })();
})();
