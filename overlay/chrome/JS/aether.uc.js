// ==UserScript==
// @name           aether
// @description    Aether modal keyboard layer + statusbar + palette (f1)
// @include        main
// @loadOrder      10
// ==/UserScript==

// Runs in every browser window via fx-autoconfig. Thin glue only: keydown →
// descriptor → aether-keys decision → effect; palette DOM around the pure
// aether-palette module. Decision logic lives in the .sys.mjs modules.

"use strict";

(() => {
  if (window.Aether) return;

  const { AetherConfig } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-config.sys.mjs"
  );
  const { createEngine } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-keys.sys.mjs"
  );
  const { REGISTRY, parse, complete, cycle, unknownMessage } =
    ChromeUtils.importESModule(
      "chrome://userscripts/content/aether-palette.sys.mjs"
    );
  const { BUILTINS, resolveWidgets, createScheduler, renderWidget } =
    ChromeUtils.importESModule(
      "chrome://userscripts/content/aether-widgets.sys.mjs"
    );
  const { ensureActors } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-actors.sys.mjs"
  );
  ensureActors();

  const MODE = { NORMAL: "normal", INSERT: "insert", HINT: "hint", PALETTE: "palette" };

  class Aether {
    constructor(win, config) {
      this.win = win;
      this.config = config;
      this.engine = createEngine(config);
      this.pendingTimer = null;
      this.contentEditableFocused = false;
      this.paletteState = { candidates: [], index: -1 };
      this.url = "";
      this.message = "";

      this.widgets = resolveWidgets(config);
      const unknown = (config.statusbar?.widgets ?? []).filter(
        id => !(id in BUILTINS)
      );
      if (unknown.length) {
        console.info(`[aether] unknown statusbar widgets skipped: ${unknown.join(", ")}`);
      }

      // Command implementations: every entry takes an optional ctx
      // {decision, modeBefore, args} and performs one effect.
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
        open: ctx => (ctx?.args?.length ? this.navigate(ctx.args[0]) : this.focusUrlbar()),
        open_tab: () => { this.newTab(); this.focusUrlbar(); },
        tab: ctx => this.selectTab(ctx?.args?.[0]),
        tab_new: () => { this.newTab(); this.focusUrlbar(); },
        tab_close: () => this.win.gBrowser.removeCurrentTab(),
        tab_next: () => this.win.gBrowser.tabContainer.advanceSelectedTab(1, true),
        tab_prev: () => this.win.gBrowser.tabContainer.advanceSelectedTab(-1, true),
        hints: () => this.startHints(),
        insert: () => this.setMode(MODE.INSERT),
        esc: ctx => this.escapeEffects(ctx?.modeBefore),
        palette: () => this.openPalette(),
        palette_cycle: () => this.cyclePalette(),
        palette_run: () => this.runPalette(),
        hint_key: ctx => this.sendContent("Aether:HintKey", { key: ctx.decision.key }),
      };

      this.buildStatusbar();
      this.buildPalette();
      this.attach();
      this.renderStatus();
    }

    get mode() {
      return this.engine.mode;
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
      this.onTabCount = () => this.renderWidgets(["tabs"]);
      win.gBrowser.tabContainer.addEventListener("TabOpen", this.onTabCount);
      win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabCount);

      // One timer for every scheduled widget; none scheduled → zero timers.
      this.scheduler = createScheduler(this.widgets, Date.now());
      if (this.scheduler.periodMs !== null) {
        this.tickTimer = win.setInterval(
          () => this.renderWidgets(this.scheduler.tick(Date.now())),
          this.scheduler.periodMs
        );
      }
      this.renderWidgets();

      win.addEventListener("unload", () => this.destroy(), { once: true });
    }

    destroy() {
      const win = this.win;
      win.removeEventListener("keydown", this.onKeydown, true);
      win.document.removeEventListener("focusin", this.onFocusChange, true);
      win.document.removeEventListener("focusout", this.onFocusChange, true);
      try { win.gBrowser.removeProgressListener(this.progressListener); } catch {}
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
      win.gBrowser.tabContainer.removeEventListener("TabOpen", this.onTabCount);
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabCount);
      win.clearTimeout(this.pendingTimer);
      if (this.tickTimer) win.clearInterval(this.tickTimer);
    }

    // --- key handling: descriptor in, decision out, effect applied ----------

    handleKeydown(event) {
      const key = event.key;
      if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") return;

      const modeBefore = this.engine.mode;
      const decision = this.engine.handleKey({
        key,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey,
      });

      switch (decision.kind) {
        case "action":
          this.consume(event);
          this.clearPendingTimer();
          this.leaveTransientMode(modeBefore, decision.command);
          this.run(decision.command, { decision, modeBefore });
          break;
        case "pending":
          this.consume(event);
          this.schedulePendingTimeout();
          break;
        case "swallow":
          this.consume(event);
          this.clearPendingTimer();
          break;
        // passthrough: Firefox/content keeps the event
      }
      this.renderStatus();
    }

    consume(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    schedulePendingTimeout() {
      this.win.clearTimeout(this.pendingTimer);
      this.pendingTimer = this.win.setTimeout(() => {
        this.engine.handleTimeout();
        this.renderStatus();
      }, this.opt("pending_timeout_ms"));
    }

    clearPendingTimer() {
      this.win.clearTimeout(this.pendingTimer);
    }

    run(command, ctx) {
      const fn = this.commands[command];
      if (!fn) {
        console.warn(`[aether] unknown command: ${command}`);
        return;
      }
      try {
        fn(ctx);
      } catch (e) {
        console.error(`[aether] command '${command}' failed:`, e);
      }
    }

    // --- modes --------------------------------------------------------------

    setMode(mode) {
      this.engine.setMode(mode);
      this.renderStatus();
    }

    // Reserved chords fire actions from any mode. When one fires out of a
    // mode that owns transient UI (palette strip, hint labels), tear that UI
    // down *before* the effect runs — otherwise e.g. C-t in palette mode
    // focuses the urlbar, syncUrlbarFocus flips to INSERT, and the strip is
    // orphaned with no owner. Commands that manage their own mode's UI
    // (palette_*, hint_key, esc, re-entry) are exempt.
    leaveTransientMode(modeBefore, command) {
      if (
        modeBefore === MODE.PALETTE &&
        !["palette", "palette_cycle", "palette_run", "esc"].includes(command)
      ) {
        this.closePalette();
        this.setMode(MODE.NORMAL);
      } else if (
        modeBefore === MODE.HINT &&
        !["hints", "hint_key", "esc"].includes(command)
      ) {
        this.sendContent("Aether:HintsStop", {});
        this.setMode(MODE.NORMAL);
      }
    }

    escapeEffects(modeBefore) {
      if (modeBefore === MODE.HINT) this.sendContent("Aether:HintsStop", {});
      if (modeBefore === MODE.PALETTE) this.closePalette();
      if (this.win.gURLBar.focused) this.win.gURLBar.blur();
      if (this.contentEditableFocused) this.sendContent("Aether:Blur", {});
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

    // --- palette ------------------------------------------------------------

    openPalette() {
      this.setMode(MODE.PALETTE); // idempotent when opened via ':'
      this.paletteEl.hidden = false;
      this.paletteInput.value = "";
      this.updatePaletteCandidates();
      this.paletteInput.focus();
    }

    closePalette() {
      this.paletteEl.hidden = true;
      this.paletteInput.blur();
      this.clearMessage();
    }

    updatePaletteCandidates() {
      const candidates = complete(
        this.paletteInput.value,
        REGISTRY,
        this.opt("palette_max_items")
      );
      this.paletteState = { candidates, index: -1 };
      this.renderCandidates();
    }

    cyclePalette() {
      const next = cycle({
        input: this.paletteInput.value,
        candidates: this.paletteState.candidates,
        index: this.paletteState.index,
      });
      this.paletteInput.value = next.input;
      this.paletteState.index = next.index;
      this.renderCandidates();
    }

    runPalette() {
      this.clearMessage();
      const r = parse(this.paletteInput.value);
      if (r.name === undefined) {
        if (r.unknown === "") {
          // vim ex-line behavior: Enter on an empty line closes, runs
          // nothing, says nothing (no dangling "no command: " copy).
          this.closePalette();
          this.setMode(MODE.NORMAL);
          return;
        }
        // Neutral copy; the palette stays open.
        this.showMessage(r.usage ?? unknownMessage(r.unknown));
        return;
      }
      this.closePalette();
      this.setMode(MODE.NORMAL);
      this.run(r.name, { args: r.args });
    }

    selectTab(raw) {
      const n = parseInt(raw, 10);
      const tabs = this.win.gBrowser.tabs;
      if (!Number.isInteger(n) || n < 1 || n > tabs.length) {
        this.showMessage(`no tab: ${raw}`);
        return;
      }
      this.win.gBrowser.selectedTab = tabs[n - 1];
    }

    navigate(url) {
      // URL fixup is Firefox's job, not ours.
      this.win.gBrowser.selectedBrowser.fixupAndLoadURIString(url, {
        triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
      });
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

    // --- statusbar + palette DOM --------------------------------------------

    buildStatusbar() {
      const doc = this.win.document;
      const html = ns => doc.createElementNS("http://www.w3.org/1999/xhtml", ns);
      const bar = html("div");
      bar.id = "aether-statusbar";
      // One span per resolved widget, in config order; renders fill them in.
      this.widgetEls = new Map();
      for (const w of this.widgets) {
        const span = html("span");
        this.widgetEls.set(w.id, span);
        bar.appendChild(span);
      }

      const browserEl = doc.getElementById("browser");
      if (browserEl?.parentNode) {
        browserEl.parentNode.insertBefore(bar, browserEl.nextSibling);
      } else {
        doc.documentElement.appendChild(bar);
      }
      this.bar = bar;
    }

    buildPalette() {
      const doc = this.win.document;
      const html = ns => doc.createElementNS("http://www.w3.org/1999/xhtml", ns);
      const box = html("div");
      box.id = "aether-palette";
      box.hidden = true;

      this.candidatesEl = html("div");
      this.candidatesEl.className = "aether-palette-candidates";

      const row = html("div");
      row.className = "aether-palette-row";
      const prompt = html("span");
      prompt.className = "aether-palette-prompt";
      prompt.textContent = ":";
      this.paletteInput = html("input");
      this.paletteInput.className = "aether-palette-input";
      row.append(prompt, this.paletteInput);

      box.append(this.candidatesEl, row);
      this.bar.parentNode.insertBefore(box, this.bar);
      this.paletteEl = box;

      this.paletteInput.addEventListener("input", () => {
        this.clearMessage();
        this.updatePaletteCandidates();
      });
    }

    renderCandidates() {
      const { candidates, index } = this.paletteState;
      this.candidatesEl.textContent = "";
      const doc = this.win.document;
      candidates.forEach((name, i) => {
        const span = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
        span.textContent = name;
        if (i === index) span.className = "aether-selected";
        this.candidatesEl.appendChild(span);
      });
    }

    // Map renders onto spans. ids omitted → full bar; ids given → only those
    // (events re-render targeted widgets, the scheduler passes its due list).
    renderWidgets(ids) {
      if (!this.bar) return;
      const ctx = {
        mode: this.engine.mode,
        buffer: this.engine.buffer,
        url: this.url,
        message: this.message,
        // TabClose fires before the dying tab leaves gBrowser.tabs (and the
        // close animation keeps it there longer) — count only live tabs.
        tabCount: this.win.gBrowser?.tabs?.filter(t => !t.closing).length ?? 0,
        nowMs: Date.now(),
        locale: undefined, // system locale
      };
      this.bar.dataset.mode = ctx.mode;
      for (const w of this.widgets) {
        if (ids && !ids.includes(w.id)) continue;
        const r = renderWidget(w, ctx);
        const el = this.widgetEls.get(w.id);
        el.textContent = r.text;
        if (r.class) el.className = r.class;
      }
    }

    renderStatus() {
      this.renderWidgets(["mode"]);
    }

    showMessage(text) {
      this.message = text;
      this.renderWidgets(["msg"]);
    }

    clearMessage() {
      this.message = "";
      this.renderWidgets(["msg"]);
    }

    updateUrl(spec) {
      if (!spec) return;
      this.url = spec;
      this.renderWidgets(["url", "tabs"]);
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
