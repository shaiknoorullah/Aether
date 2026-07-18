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
  const { resolvePalette, emitCss, expandPath } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-theme.sys.mjs"
  );
  const { isBuriable, formatRecord, NO_MATCHES_MESSAGE, EMPTY_MESSAGE } =
    ChromeUtils.importESModule(
      "chrome://userscripts/content/aether-graveyard.sys.mjs"
    );
  const { AetherGraveyard } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-graveyard-service.sys.mjs"
  );
  const {
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
  } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-workspaces.sys.mjs"
  );
  const { AetherWorkspaces } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-workspaces-service.sys.mjs"
  );
  const {
    startSession,
    endSession,
    onWorkspaceSwitch,
    onWorkspaceRename,
    notificationsSuppressed,
  } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-focus.sys.mjs"
  );
  const {
    focusStartedMessage,
    doneMessage,
    NO_SESSION_MESSAGE,
    AI_OFF_PANEL_MESSAGE,
    AI_ON_MESSAGE,
    AI_OFF_MESSAGE,
    gatewayErrorMessage,
  } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-strings.sys.mjs"
  );
  const { validateBaseUrl, buildRequest, sseFeed } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-ai-client.sys.mjs"
  );
  const {
    resolveEnabled,
    setEnabled,
    assertOn,
    newConversation,
    addUser,
    beginAssistant,
    addDelta,
    finishAssistant,
    messagesFor,
  } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-ai-state.sys.mjs"
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
  );
  const { ensureActors } = ChromeUtils.importESModule(
    "chrome://userscripts/content/aether-actors.sys.mjs"
  );
  ensureActors();

  const MODE = { NORMAL: "normal", INSERT: "insert", HINT: "hint", PALETTE: "palette" };

  // f6 notification suppression: the pref we flip and the crash-safe marker
  // holding its pre-session value (restored on end, unload, and startup).
  const NOTIF_PREF = "dom.webnotifications.enabled";
  const NOTIF_MARKER_PREF = "aether.focus.notif_restore";

  // f7 kill switch: the persisted user toggle (:ai_on/:ai_off). Wins over the
  // TOML [ai] enabled value — the dotfile is read-only, we never rewrite it.
  const AI_PREF = "aether.ai.enabled";

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
      this.suppressAdopt = false;
      this.focusSession = null; // f6: at most one, in-memory, never persisted
      // f7: kill-switch state (pref > TOML > builtin OFF), one in-memory
      // conversation per window (restart clears it), one in-flight request at
      // most — its AbortController is what :ai_off pulls.
      this.aiConfig = { ...AetherConfig.DEFAULTS.ai, ...(config.ai ?? {}) };
      this.aiState = { enabled: resolveEnabled(this.aiConfig, this.readAiPref()) };
      this.aiConversation = newConversation();
      this.aiAbort = null;
      this.aiPromptFocused = false;
      // Crash safety: a marker left by a session that never ended (crash,
      // kill -9) restores the notification pref on the next startup. A second
      // window opening mid-session is NOT a crash — restoreNotifPref stands
      // down while a sibling window's session is live.
      this.restoreNotifPref();

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
        tab_close: () => this.closeCurrentTab(),
        tab_next: () => this.win.gBrowser.tabContainer.advanceSelectedTab(1, true),
        tab_prev: () => this.win.gBrowser.tabContainer.advanceSelectedTab(-1, true),
        // Per-window, never persisted — zero-chrome is the resting state.
        tabs_toggle: () => {
          this.quietSidebar();
          this.win.document.documentElement.toggleAttribute("aether-tabs");
        },
        graveyard: () => this.openPalette("graveyard "),
        // Multi-word names are legal (the palette provider passes the full
        // remainder), so both name-taking commands join their args.
        ws: ctx => this.switchWorkspace(ctx?.args?.join(" ")),
        ws_next: () => this.cycleWorkspace(),
        ws_rename: ctx => this.renameWorkspace(ctx?.args?.join(" ")),
        focus: ctx => this.startFocus(ctx?.args?.join(" ")),
        done: () => this.endFocus(),
        ai: () => this.toggleAiSidebar(),
        ai_on: () => this.setAiEnabled(true),
        ai_off: () => this.setAiEnabled(false),
        hints: () => this.startHints(),
        insert: () => this.setMode(MODE.INSERT),
        esc: ctx => this.escapeEffects(ctx?.modeBefore),
        palette: () => this.openPalette(),
        palette_cycle: () => this.cyclePalette(),
        palette_run: () => this.runPalette(),
        theme_reload: () =>
          this.applyTheme().then(sourceUsed => this.showMessage(`theme: ${sourceUsed}`)),
        hint_key: ctx => this.sendContent("Aether:HintKey", { key: ctx.decision.key }),
      };

      this.buildStatusbar();
      this.buildPalette();
      this.buildAiSidebar();
      this.attach();
      this.initWorkspaces();
      // Best effort at startup; tabs_toggle retries before every summon (the
      // sidebar-main element upgrades lazily, so the root may not exist yet).
      this.quietSidebar();
      this.renderStatus();
      // Startup goes through the same path as :theme_reload, just quietly.
      this.applyTheme().catch(e => console.error("[aether] could not apply theme:", e));
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

      // f7: the kill switch is ONE state across every window — the persisted
      // pref is the authority and each window observes it, so a sibling's
      // :ai_off flips this window too (state, widget, panel, in-flight
      // request). Same multi-window discipline as f6's sessionElsewhere.
      this.onAiPrefChange = () => this.syncAiEnabled();
      Services.prefs.addObserver(AI_PREF, this.onAiPrefChange);

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

      // Graveyard: archive real user closes. Session store announces a
      // window-level close before dismantling tabs — those closes are its
      // business (restore), not the graveyard's.
      this.windowClosing = false;
      this.onWindowClosing = () => (this.windowClosing = true);
      win.addEventListener("SSWindowClosing", this.onWindowClosing);
      this.onTabClose = e => this.buryTab(e);
      win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabClose);

      // Workspaces: every TabOpen adopts into the active workspace; TabClose
      // drops the ref (AFTER buryTab — the grave record wants the workspace
      // name); location/title changes keep the ref current; TabSelect
      // remembers the workspace's landing tab. Shutdown closes are session
      // teardown, not membership changes — the model must survive them.
      this.onWsTabOpen = e => this.adoptTab(e.target);
      win.gBrowser.tabContainer.addEventListener("TabOpen", this.onWsTabOpen);
      this.onWsTabClose = e => this.releaseTab(e.target);
      win.gBrowser.tabContainer.addEventListener("TabClose", this.onWsTabClose);
      this.onWsTabSelect = e => {
        const model = AetherWorkspaces.model;
        if (!model || e.target._aetherWsId === undefined) return;
        // Teardown reselects tabs as it dismantles them — those are not the
        // user landing anywhere, and recording one would corrupt the
        // remembered tab that restore must land on.
        if (AetherGraveyard.shuttingDown || this.windowClosing) return;
        markSelected(model, e.target._aetherWsId);
        AetherWorkspaces.persist();
      };
      win.gBrowser.tabContainer.addEventListener("TabSelect", this.onWsTabSelect);
      this.onWsAttrModified = e => {
        if (e.detail?.changed?.includes("label")) {
          this.updateTabRef(e.target, { title: e.target.label });
        }
      };
      win.gBrowser.tabContainer.addEventListener("TabAttrModified", this.onWsAttrModified);
      this.wsProgressListener = {
        onLocationChange: (browser, wp, req, loc) => {
          // Top-level navigations only — an iframe (ad/embed) navigating must
          // never rewrite the tab's persisted url.
          if (!wp.isTopLevel) return;
          const tab = win.gBrowser.getTabForBrowser(browser);
          if (tab) this.updateTabRef(tab, { url: loc?.spec });
        },
      };
      win.gBrowser.addTabsProgressListener(this.wsProgressListener);

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
      try { Services.prefs.removeObserver(AI_PREF, this.onAiPrefChange); } catch {}
      try { win.gBrowser.removeProgressListener(this.progressListener); } catch {}
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
      win.gBrowser.tabContainer.removeEventListener("TabOpen", this.onTabCount);
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabCount);
      win.removeEventListener("SSWindowClosing", this.onWindowClosing);
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose);
      win.gBrowser.tabContainer.removeEventListener("TabOpen", this.onWsTabOpen);
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onWsTabClose);
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onWsTabSelect);
      win.gBrowser.tabContainer.removeEventListener("TabAttrModified", this.onWsAttrModified);
      try { win.gBrowser.removeTabsProgressListener(this.wsProgressListener); } catch {}
      win.clearTimeout(this.pendingTimer);
      if (this.tickTimer) win.clearInterval(this.tickTimer);
      // The hard switch also covers teardown: no request outlives its window.
      this.aiAbort?.abort();
      this.aiAbort = null;
      // A session dies with its window; the pref does not — unless a sibling
      // window's session is still live (the guard inside restoreNotifPref).
      this.restoreNotifPref();
    }

    // --- key handling: descriptor in, decision out, effect applied ----------

    handleKeydown(event) {
      const key = event.key;
      if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") return;

      // The AI prompt gets no bypass here: it rides the urlbar/insert rule.
      // While it has focus the mode is INSERT (wireAiSidebar + the focus
      // sync), so unreserved keys pass through to it via the engine — and
      // reserved chords stay ours in every mode, prompt focus included.
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
        console.error(`[aether] could not run command '${command}':`, e);
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
      if (this.aiPromptFocused) this.exitAiPrompt();
      // Transient means transient: Escape dismisses the msg echo, so the bar
      // actually comes to rest instead of carrying old copy across pages.
      this.clearMessage();
    }

    startHints() {
      this.setMode(MODE.HINT);
      this.sendContent("Aether:HintsStart", { chars: this.opt("hint_chars") });
    }

    // Document-level focus sync. INSERT is owned by three surfaces — the
    // urlbar, a content editable, and the AI prompt — and only reverts to
    // NORMAL when none of them holds focus.
    syncUrlbarFocus() {
      const focused = this.win.gURLBar.focused;
      if (focused && this.mode !== MODE.INSERT) {
        this.setMode(MODE.INSERT);
      } else if (
        !focused &&
        this.mode === MODE.INSERT &&
        !this.contentEditableFocused &&
        !this.aiPromptFocused
      ) {
        this.setMode(MODE.NORMAL);
      }
    }

    onContentMessage(name, data) {
      switch (name) {
        case "Aether:Focus":
          this.contentEditableFocused = data.editable;
          if (data.editable && this.mode === MODE.NORMAL) {
            this.setMode(MODE.INSERT);
          } else if (
            !data.editable &&
            this.mode === MODE.INSERT &&
            !this.win.gURLBar.focused &&
            !this.aiPromptFocused
          ) {
            this.setMode(MODE.NORMAL);
          }
          break;
        case "Aether:HintsDone":
          if (this.mode === MODE.HINT) this.setMode(MODE.NORMAL);
          break;
      }
    }

    // --- palette ------------------------------------------------------------

    openPalette(prefill = "") {
      this.setMode(MODE.PALETTE); // idempotent when opened via ':'
      this.paletteEl.hidden = false;
      this.paletteInput.value = prefill;
      this.updatePaletteCandidates();
      this.paletteInput.focus();
      this.paletteInput.setSelectionRange(prefill.length, prefill.length);
    }

    closePalette() {
      this.paletteEl.hidden = true;
      this.paletteInput.blur();
      this.clearMessage();
    }

    // ':graveyard …' / ':ws …' → the query string (may be ""); anything else
    // → null. The f4 one-off grew into this two-entry provider map — still
    // not general argument completion, and it stops here.
    graveyardQuery(input) {
      const m = input.match(/^\s*graveyard(?:\s+(.*))?$/);
      return m ? (m[1] ?? "").trim() : null;
    }

    wsQuery(input) {
      const m = input.match(/^\s*ws(?:\s+(.*))?$/);
      return m ? (m[1] ?? "").trim() : null;
    }

    updatePaletteCandidates() {
      const input = this.paletteInput.value;
      const graveyardQ = this.graveyardQuery(input);
      const wsQ = graveyardQ === null ? this.wsQuery(input) : null;
      if (graveyardQ !== null) {
        // Candidate row switches to graveyard matches, newest first.
        const records = AetherGraveyard.search(graveyardQ, this.opt("palette_max_items"));
        this.paletteState = { candidates: records.map(formatRecord), records, index: -1 };
      } else if (wsQ !== null && AetherWorkspaces.model) {
        // Candidate row switches to workspace names: active first, then
        // most-recent lastActive.
        const names = candidateNames(AetherWorkspaces.model)
          .filter(n => n.toLowerCase().startsWith(wsQ.toLowerCase()))
          .slice(0, this.opt("palette_max_items"));
        this.paletteState = { candidates: names, wsNames: true, index: -1 };
      } else {
        const candidates = complete(input, REGISTRY, this.opt("palette_max_items"));
        this.paletteState = { candidates, index: -1 };
      }
      this.renderCandidates();
    }

    cyclePalette() {
      if (this.paletteState.records || this.paletteState.wsNames) {
        // Provider rows: cycle the selection only — the typed query survives.
        const { candidates } = this.paletteState;
        if (!candidates.length) return;
        this.paletteState.index = (this.paletteState.index + 1) % candidates.length;
        this.renderCandidates();
        return;
      }
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
      if (this.paletteState.records) {
        this.resurrect();
        return;
      }
      if (this.paletteState.wsNames) {
        // Enter on ':ws …': a Tab-selected candidate switches; otherwise the
        // typed name switches-or-creates; a bare ':ws' lands on the first
        // candidate (the active workspace — a harmless no-op).
        const { candidates, index } = this.paletteState;
        const typed = this.wsQuery(this.paletteInput.value);
        const name = index !== -1 ? candidates[index] : typed || candidates[0];
        this.closePalette();
        this.setMode(MODE.NORMAL);
        if (name) this.switchWorkspace(name);
        return;
      }
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

    // Enter on ':graveyard …': open the selected (or first) match in a new
    // tab and exhume it — no longer dead. No matches keeps the palette open
    // with neutral copy.
    resurrect() {
      const { records, index } = this.paletteState;
      if (!records.length) {
        this.showMessage(AetherGraveyard.isEmpty() ? EMPTY_MESSAGE : NO_MATCHES_MESSAGE);
        return;
      }
      const record = records[index === -1 ? 0 : index];
      AetherGraveyard.exhume(record.id);
      this.closePalette();
      this.setMode(MODE.NORMAL);
      this.newTab();
      this.navigate(record.url);
    }

    // --- workspaces ----------------------------------------------------------

    // First window in owns the restore (the service model is process-wide);
    // later windows just render the active name. Never bricks: a failed
    // restore leaves a plain working browser.
    initWorkspaces() {
      try {
        if (!AetherWorkspaces.restored) {
          AetherWorkspaces.restored = true;
          this.restoreWorkspaces();
        }
      } catch (e) {
        console.error("[aether] could not restore workspaces:", e);
      }
      this.renderWidgets(["workspace", "tabs"]);
    }

    // We own restore outright: startup stays blank, tabs reopen from our JSON
    // in their workspace's container (a vanished container is re-minted by
    // name), inactive workspaces hide, and the startup blank tab is dropped
    // once real tabs exist. Fresh profile: the startup tab is adopted into
    // the default workspace.
    restoreWorkspaces() {
      const model = AetherWorkspaces.model;
      const gB = this.win.gBrowser;
      const startupTab = gB.selectedTab;
      if (!model.workspaces.some(w => w.tabRefs.length)) {
        this.adoptTab(startupTab);
        return;
      }
      for (const ws of model.workspaces) {
        const userContextId = AetherWorkspaces.resolveContainer(ws);
        for (const ref of ws.tabRefs) {
          this.addWorkspaceTab(ref.url, userContextId)._aetherWsId = ref.id;
        }
      }
      this.applyWorkspaceView();
      if (startupTab._aetherWsId === undefined) {
        const spec = gB.getBrowserForTab(startupTab)?.currentURI?.spec;
        if (!spec || spec === "about:blank") gB.removeTab(startupTab);
        else this.adoptTab(startupTab); // a real startup url joins the active workspace
      }
      AetherWorkspaces.persist();
    }

    // :ws <name> — switch-or-create. A new name mints a container; a mint
    // that does not take leaves the workspace vanilla rather than broken.
    switchWorkspace(name) {
      if (!name) return;
      const model = AetherWorkspaces.model;
      const { created } = switchOrCreate(model, name, Date.now());
      if (created) {
        try {
          setContainer(model, name, AetherWorkspaces.mintContainer(name));
        } catch (e) {
          console.error("[aether] could not mint container, workspace stays vanilla:", e);
        }
      }
      this.focusOnWorkspaceSwitch();
      this.applyWorkspaceView();
      AetherWorkspaces.persist();
    }

    // gw / :ws_next — creation order, wrapping. The switchOrCreate call only
    // stamps lastActive recency (the name always exists).
    cycleWorkspace() {
      const model = AetherWorkspaces.model;
      switchOrCreate(model, cycleNext(model), Date.now());
      this.focusOnWorkspaceSwitch();
      this.applyWorkspaceView();
      AetherWorkspaces.persist();
    }

    renameWorkspace(name) {
      const model = AetherWorkspaces.model;
      const oldActive = model?.active;
      const r = rename(model, name);
      if (!r.ok) {
        this.showMessage(r.message); // neutral copy, nothing changes
        return;
      }
      // A rename is not a context switch: a session bound to the renamed
      // (active) workspace follows the new name, so the binding never goes
      // stale and a same-workspace switch stays a no-op.
      this.focusSession = onWorkspaceRename(this.focusSession, oldActive, model.active);
      this.renderWidgets(["workspace"]);
      AetherWorkspaces.persist();
    }

    // Switch mechanics: show the target's tabs → select its remembered (or
    // first) tab — an empty workspace opens one fresh tab in its container —
    // → hide every other workspace's tabs. Hidden tabs keep loading/playing;
    // they're invisible, not suspended.
    applyWorkspaceView() {
      const model = AetherWorkspaces.model;
      const gB = this.win.gBrowser;
      const activeIds = new Set(tabsOf(model, model.active).map(r => r.id));
      const mine = [];
      const others = [];
      for (const tab of gB.tabs) {
        if (tab._aetherWsId === undefined) continue;
        (activeIds.has(tab._aetherWsId) ? mine : others).push(tab);
      }
      for (const tab of mine) gB.showTab(tab);
      // The remembered landing tab lives in the model (persisted), so it
      // survives restarts and renames; null/stale falls back to the first.
      const selectedId = model.workspaces.find(w => w.name === model.active)?.selectedId;
      let target = mine.find(t => t._aetherWsId === selectedId) ?? mine[0];
      if (!target) {
        target = this.addWorkspaceTab("about:blank", this.activeContainerId());
        target._aetherWsId = adopt(model, model.active, { url: "about:blank", title: "" }).id;
      }
      gB.selectedTab = target;
      for (const tab of others) gB.hideTab(tab);
      this.renderWidgets(["workspace", "tabs"]);
    }

    // Membership bookkeeping (TabOpen/TabClose/location/title → model).
    adoptTab(tab) {
      const model = AetherWorkspaces.model;
      if (!model || this.suppressAdopt || tab._aetherWsId !== undefined) return;
      const ref = adopt(model, model.active, {
        url: this.win.gBrowser.getBrowserForTab(tab)?.currentURI?.spec ?? "about:blank",
        title: tab.label ?? "",
      });
      tab._aetherWsId = ref.id;
      AetherWorkspaces.persist();
    }

    releaseTab(tab) {
      const model = AetherWorkspaces.model;
      if (!model || tab._aetherWsId === undefined) return;
      // Shutdown/window teardown closes every tab — that is restore's input,
      // not a membership change.
      if (AetherGraveyard.shuttingDown || this.windowClosing) return;
      removeTab(model, tab._aetherWsId);
      AetherWorkspaces.persist();
      // Safety net for close paths that bypass tab_close: if the active
      // workspace just lost its last tab, give it a fresh one once the close
      // settles — a zero-tab workspace survives, the window never goes down
      // with it.
      if (!tabsOf(model, model.active).length) {
        this.win.setTimeout(() => {
          if (AetherWorkspaces.model === model && !tabsOf(model, model.active).length) {
            this.applyWorkspaceView();
          }
        }, 0);
      }
    }

    updateTabRef(tab, fields) {
      const model = AetherWorkspaces.model;
      if (!model || tab._aetherWsId === undefined) return;
      updateTab(model, tab._aetherWsId, fields);
      AetherWorkspaces.persist();
    }

    workspaceOf(tab) {
      const model = AetherWorkspaces.model;
      if (!model || tab._aetherWsId === undefined) return undefined;
      return model.workspaces.find(w => w.tabRefs.some(r => r.id === tab._aetherWsId))?.name;
    }

    activeContainerId() {
      const model = AetherWorkspaces.model;
      return model?.workspaces.find(w => w.name === model.active)?.containerId || 0;
    }

    // A tab we open for a known workspace ref — TabOpen adoption is
    // suppressed because the caller assigns the ref id itself.
    addWorkspaceTab(url, userContextId) {
      const gB = this.win.gBrowser;
      const opts = { userContextId: userContextId || 0, skipAnimation: true };
      this.suppressAdopt = true;
      try {
        return gB.addTrustedTab
          ? gB.addTrustedTab(url, opts)
          : gB.addTab(url, {
              ...opts,
              triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
            });
      } finally {
        this.suppressAdopt = false;
      }
    }

    // --- focus sessions (f6) --------------------------------------------------

    // :focus <task> — start a session bound to the active workspace. Starting
    // over an active session replaces it: a switch, not an error.
    startFocus(task) {
      if (!task) return;
      this.focusSession = startSession(
        task,
        AetherWorkspaces.model?.active ?? "",
        Date.now()
      );
      this.applyNotifSuppression();
      this.showMessage(focusStartedMessage(this.focusSession.task));
      this.renderWidgets(["focus"]);
    }

    // :done — end the session. The message is an echo of the task, never a
    // duration; no session → neutral copy, nothing else happens.
    endFocus() {
      const { ended } = endSession(this.focusSession);
      this.focusSession = null;
      this.restoreNotifPref();
      this.showMessage(ended ? doneMessage(ended.task) : NO_SESSION_MESSAGE);
      this.renderWidgets(["focus"]);
    }

    // A workspace switch is a context end; landing on the session's own
    // workspace is a no-op. Called after the active workspace changes.
    focusOnWorkspaceSwitch() {
      const r = onWorkspaceSwitch(
        this.focusSession,
        AetherWorkspaces.model?.active ?? ""
      );
      if (!r.ended) return;
      this.focusSession = null;
      this.restoreNotifPref();
      this.showMessage(doneMessage(r.ended.task)); // quiet end, same copy path
      this.renderWidgets(["focus"]);
    }

    // True when ANOTHER browser window holds a live focus session — its
    // suppression must survive this window's startup, teardown, and session
    // ends (opening or closing a window never silently undoes it).
    sessionElsewhere() {
      try {
        for (const w of Services.wm.getEnumerator("navigator:browser")) {
          if (w !== this.win && w.Aether?.focusSession) return true;
        }
      } catch {}
      return false;
    }

    // Flip dom.webnotifications.enabled off for the session, stashing the
    // pre-session value in a marker pref first — crash-safe: end-of-session,
    // window unload, and startup all restore-and-clear the marker (unless a
    // sibling window's session still owns it — see restoreNotifPref). The
    // immediate savePrefFile makes the profile's prefs.js the durable record
    // of both prefs — crash safety first, and the visual harness reads the
    // same file as its evidence channel (spec §5 state 3).
    applyNotifSuppression() {
      if (!notificationsSuppressed(this.focusSession, this.config)) return;
      try {
        if (!Services.prefs.prefHasUserValue(NOTIF_MARKER_PREF)) {
          Services.prefs.setBoolPref(
            NOTIF_MARKER_PREF,
            Services.prefs.getBoolPref(NOTIF_PREF, true)
          );
        }
        Services.prefs.setBoolPref(NOTIF_PREF, false);
        // Flush now: the marker only saves anyone if it hits disk before a
        // crash — the periodic save timer is too slow a promise for that.
        Services.prefs.savePrefFile(null);
        console.info(`[aether] focus notifications quiet: ${NOTIF_PREF}=false`);
      } catch (e) {
        console.error("[aether] could not suppress notifications:", e);
      }
    }

    restoreNotifPref() {
      // Another window's live session owns the suppression: stand down.
      if (this.sessionElsewhere()) return;
      try {
        if (Services.prefs.prefHasUserValue(NOTIF_MARKER_PREF)) {
          const original = Services.prefs.getBoolPref(NOTIF_MARKER_PREF, true);
          Services.prefs.setBoolPref(NOTIF_PREF, original);
          Services.prefs.clearUserPref(NOTIF_MARKER_PREF);
          Services.prefs.savePrefFile(null); // the cleared marker hits disk too
          console.info(`[aether] focus notifications restored: ${NOTIF_PREF}=${original}`);
        }
      } catch (e) {
        console.error("[aether] could not restore notification pref:", e);
      }
    }

    // --- local AI sidebar (f7) ------------------------------------------------

    // A chrome-owned right-side panel: XUL <browser> loading the static
    // chrome://userchrome/content/ai-sidebar.html — never remote content. The
    // page ships no script; everything is wired from here (same-process
    // chrome document).
    buildAiSidebar() {
      const doc = this.win.document;
      const box = doc.createXULElement("vbox");
      box.id = "aether-ai-sidebar";
      box.hidden = true;
      const browser = doc.createXULElement("browser");
      browser.setAttribute("disableglobalhistory", "true");
      browser.setAttribute("src", "chrome://userchrome/content/ai-sidebar.html");
      box.appendChild(browser);
      // Last child of the #browser hbox = the right edge, after the content.
      const browserEl = doc.getElementById("browser");
      (browserEl ?? doc.documentElement).appendChild(box);
      this.aiSidebarEl = box;
      this.aiBrowser = browser;
      // Same-process load: wire the prompt and theme once the page is in.
      browser.addEventListener(
        "load",
        () => {
          this.wireAiSidebar();
          this.applyAiTheme();
          this.renderAiPanel();
        },
        true
      );
    }

    aiDoc() {
      try {
        return this.aiBrowser?.contentDocument ?? null;
      } catch {
        return null;
      }
    }

    // Prompt wiring, once per loaded document. The prompt follows the
    // urlbar/insert rule exactly: focus puts the engine in INSERT (the badge
    // says so), unreserved keys pass through handleKeydown to the input,
    // reserved chords never do. Enter sends (a passthrough key, handled
    // here); Escape is the engine's — its esc action calls exitAiPrompt,
    // returning focus to content (NORMAL) without closing the panel. The
    // local Escape branch below is a belt for any path the engine missed.
    wireAiSidebar() {
      const doc = this.aiDoc();
      const input = doc?.getElementById("aether-ai-input");
      if (!input || this.aiWiredDoc === doc) return;
      this.aiWiredDoc = doc;
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.sendAiPrompt();
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.exitAiPrompt();
        }
      });
      input.addEventListener("focus", () => {
        this.aiPromptFocused = true;
        if (this.mode !== MODE.INSERT) this.setMode(MODE.INSERT);
      });
      input.addEventListener("blur", () => {
        this.aiPromptFocused = false;
        if (
          this.mode === MODE.INSERT &&
          !this.win.gURLBar.focused &&
          !this.contentEditableFocused
        ) {
          this.setMode(MODE.NORMAL);
        }
      });
    }

    // a / :ai — toggle. Opening focuses the prompt (when the switch is on);
    // the conversation is per-window and survives the panel closing.
    toggleAiSidebar() {
      const box = this.aiSidebarEl;
      if (!box) return;
      if (!box.hidden) {
        if (this.aiPromptFocused) this.exitAiPrompt();
        box.hidden = true;
        return;
      }
      box.hidden = false;
      this.wireAiSidebar();
      this.applyAiTheme();
      this.renderAiPanel();
      if (this.aiState.enabled && this.aiUsable()) {
        this.aiDoc()?.getElementById("aether-ai-input")?.focus();
      }
    }

    exitAiPrompt() {
      this.aiDoc()?.getElementById("aether-ai-input")?.blur();
      this.aiPromptFocused = false;
      try {
        this.win.gBrowser.selectedBrowser.focus();
      } catch {}
      if (this.mode === MODE.INSERT) this.setMode(MODE.NORMAL);
    }

    // Loopback-only, enforced in code: a non-loopback or non-http(s)
    // base_url means AI behaves as unavailable — never a remote fetch.
    aiUsable() {
      return validateBaseUrl(this.aiConfig.base_url);
    }

    // Reflect the switch into the panel: on → live prompt; off → the calm
    // off-state (prompt disabled, one neutral line naming :ai_on); invalid
    // base_url → same calm shape, naming the gateway it will not use.
    renderAiPanel() {
      const doc = this.aiDoc();
      const input = doc?.getElementById("aether-ai-input");
      const off = doc?.getElementById("aether-ai-off");
      if (!input || !off) return;
      const usable = this.aiUsable();
      const live = this.aiState.enabled && usable;
      input.disabled = !live;
      off.hidden = live;
      off.textContent = usable
        ? AI_OFF_PANEL_MESSAGE
        : gatewayErrorMessage(this.aiConfig.base_url);
      if (!live && this.aiPromptFocused) this.exitAiPrompt();
    }

    // One transcript line; textContent only — model output is text, never
    // markup, never executed. kind: user | assistant | note.
    appendAiTurn(kind, text) {
      const doc = this.aiDoc();
      const transcript = doc?.getElementById("aether-ai-transcript");
      if (!transcript) return null;
      const el = doc.createElement("div");
      el.className = `aether-ai-turn aether-ai-turn-${kind}`;
      el.textContent = text;
      transcript.appendChild(el);
      transcript.scrollTop = transcript.scrollHeight;
      return el;
    }

    // :ai_on / :ai_off — flip, persist the pref, re-render everywhere. The
    // off flip is hard: any in-flight request is aborted, not just ignored.
    // This window flips locally first (so the switch obeys the hand on it
    // even if the pref write fails); the pref write then fans the same flip
    // out to every sibling window via their AI_PREF observers.
    setAiEnabled(want) {
      const r = setEnabled(this.aiState, want);
      this.aiState = { enabled: r.enabled };
      if (r.abortInFlight && this.aiAbort) {
        this.aiAbort.abort();
        this.aiAbort = null;
      }
      try {
        Services.prefs.setBoolPref(AI_PREF, r.persist);
        Services.prefs.savePrefFile(null);
      } catch (e) {
        console.error("[aether] could not persist the ai pref:", e);
      }
      this.showMessage(want ? AI_ON_MESSAGE : AI_OFF_MESSAGE);
      this.renderWidgets(["ai"]);
      this.renderAiPanel();
    }

    // AI_PREF observer target — fires in every window when any window (this
    // one included) persists a flip. Converge on the resolved state; in the
    // invoking window the state already matches, so this is a no-op there.
    // The hard-switch contract holds across windows: turning OFF aborts THIS
    // window's in-flight request too, and its statusbar/panel re-render, so
    // no window is left able to reach the socket while the switch is off.
    syncAiEnabled() {
      const enabled = resolveEnabled(this.aiConfig, this.readAiPref());
      if (this.aiState.enabled === enabled) return;
      this.aiState = { enabled };
      if (!enabled && this.aiAbort) {
        this.aiAbort.abort();
        this.aiAbort = null;
      }
      this.renderWidgets(["ai"]);
      this.renderAiPanel();
    }

    readAiPref() {
      try {
        return Services.prefs.prefHasUserValue(AI_PREF)
          ? Services.prefs.getBoolPref(AI_PREF)
          : undefined;
      } catch {
        return undefined;
      }
    }

    // The single network path. assertOn throws while the switch is off —
    // there is no route from prompt to socket. Requests go ONLY to the
    // validated loopback base_url; the prompt box is the only input source
    // (no page content, ever). One attempt, one calm line on any trouble.
    async sendAiPrompt() {
      const doc = this.aiDoc();
      const input = doc?.getElementById("aether-ai-input");
      const text = input?.value.trim();
      if (!text || this.aiAbort) return; // nothing to send / one at a time
      try {
        assertOn(this.aiState);
      } catch {
        this.renderAiPanel();
        return;
      }
      if (!this.aiUsable()) {
        this.renderAiPanel();
        return;
      }
      input.value = "";
      this.aiConversation = addUser(this.aiConversation, text);
      this.appendAiTurn("user", text);
      const { url, init } = buildRequest(
        this.aiConfig,
        messagesFor(this.aiConversation)
      );
      this.aiConversation = beginAssistant(this.aiConversation);
      const turnEl = this.appendAiTurn("assistant", "");
      const ctrl = new AbortController();
      this.aiAbort = ctrl;
      try {
        const resp = await this.win.fetch(url, { ...init, signal: ctrl.signal });
        if (!resp.ok) throw new Error(`gateway status ${resp.status}`);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;
        while (!done) {
          const { value, done: eof } = await reader.read();
          if (eof) break;
          const r = sseFeed(buffer, decoder.decode(value, { stream: true }));
          buffer = r.buffer;
          for (const d of r.deltas) {
            this.aiConversation = addDelta(this.aiConversation, d);
            if (turnEl) turnEl.textContent += d; // text, never markup
          }
          done = r.done;
        }
      } catch (e) {
        // An abort is the user's own hand on the switch — no extra copy.
        if (e?.name !== "AbortError") {
          this.appendAiTurn("note", gatewayErrorMessage(this.aiConfig.base_url));
        }
      } finally {
        // Conversation stays intact either way — a partial answer is kept.
        this.aiConversation = finishAssistant(this.aiConversation);
        if (this.aiAbort === ctrl) this.aiAbort = null;
      }
    }

    // The sidebar page is its own document: CSS vars don't cross the
    // boundary, so the resolved theme text is mirrored into it.
    applyAiTheme() {
      const doc = this.aiDoc();
      if (!doc?.documentElement || !this.themeCssText) return;
      let style = doc.getElementById("aether-theme");
      if (!style) {
        style = doc.createElement("style");
        style.id = "aether-theme";
        doc.documentElement.appendChild(style);
      }
      style.textContent = this.themeCssText;
    }

    // --- graveyard: real user closes only ------------------------------------

    buryTab(event) {
      if (AetherGraveyard.shuttingDown || this.windowClosing) return; // shutdown/window close → session restore's job
      if (event.detail?.adoptedBy) return; // moved to another window, not dead
      if (PrivateBrowsingUtils.isWindowPrivate(this.win)) return; // never recorded, privacy rule
      const tab = event.target;
      const url = this.win.gBrowser.getBrowserForTab(tab)?.currentURI?.spec;
      if (!isBuriable(url)) return; // blank/about: tabs carry no context
      AetherGraveyard.bury({
        url,
        title: tab.label ?? "",
        closedAt: Date.now(),
        workspace: this.workspaceOf(tab), // f5: buries carry the workspace name
      });
    }

    // The sidebar revamp's launcher (gear/tool buttons + their splitter)
    // renders inside <sidebar-main>'s shadow root — userChrome.css can't
    // reach it, and native code even sets inline visibility on the buttons.
    // Adopt one hiding sheet into that shadow root. Idempotent per root;
    // retried on every tabs_toggle because the element upgrades lazily.
    quietSidebar() {
      try {
        const root = this.win.document.querySelector(
          "#sidebar-main sidebar-main"
        )?.shadowRoot;
        if (!root || root === this.quietedSidebarRoot) return;
        const sheet = new this.win.CSSStyleSheet();
        sheet.replaceSync(
          ".buttons-wrapper, #sidebar-tools-and-extensions-splitter { display: none !important; }"
        );
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        this.quietedSidebarRoot = root;
      } catch (e) {
        console.error("[aether] could not quiet the sidebar:", e);
      }
    }

    // x / Ctrl+W. Closing the active workspace's only visible tab must never
    // close the window — every other workspace's hidden tabs live in it, and
    // gBrowser's last-tab logic counts only visible tabs. Open the
    // workspace's replacement tab first (its container, adopted with a real
    // ref), then close; the workspace survives as one fresh tab.
    // closeWindowWithLastTab:false is the backstop for the same native path.
    closeCurrentTab() {
      const gB = this.win.gBrowser;
      const dying = gB.selectedTab;
      const visible = (gB.visibleTabs ?? gB.tabs).filter(t => !t.closing);
      if (visible.length <= 1) {
        const model = AetherWorkspaces.model;
        const fresh = this.addWorkspaceTab("about:blank", this.activeContainerId());
        if (model) {
          fresh._aetherWsId = adopt(model, model.active, {
            url: "about:blank",
            title: "",
          }).id;
          AetherWorkspaces.persist();
        }
        gB.selectedTab = fresh;
      }
      gB.removeTab(dying, { closeWindowWithLastTab: false });
    }

    selectTab(raw) {
      const n = parseInt(raw, 10);
      // Visible tabs only — hidden workspaces are not addressable by number.
      const tabs = this.win.gBrowser.visibleTabs ?? this.win.gBrowser.tabs;
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

    // --- theming ------------------------------------------------------------

    // Read sources, resolve one validated palette, swap the text of the
    // single <style id="aether-theme"> element. Called at init and by
    // :theme_reload. Missing wal file → null text, not an error.
    async applyTheme() {
      const theme = this.config.theme ?? AetherConfig.DEFAULTS.theme;
      let walText = null;
      try {
        const home = Services.dirsvc.get("Home", Ci.nsIFile).path;
        const path = expandPath(theme.wal_json ?? "", home);
        if (path && (await IOUtils.exists(path))) {
          walText = await IOUtils.readUTF8(path);
        }
      } catch (e) {
        console.info("[aether] wal palette unreadable:", e);
      }
      const { palette, sourceUsed } = resolvePalette({
        source: theme.source,
        walText,
        tomlColors: theme.colors,
      });
      if (walText !== null && sourceUsed !== "wal" && (theme.source === "auto" || theme.source === "wal")) {
        console.info(`[aether] wal palette did not validate; theme: ${sourceUsed}`);
      }
      const doc = this.win.document;
      let style = doc.getElementById("aether-theme");
      if (!style) {
        style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
        style.id = "aether-theme";
        doc.documentElement.appendChild(style);
      }
      style.textContent = emitCss(palette);
      this.themeCssText = style.textContent;
      this.applyAiTheme(); // the sidebar page mirrors the same palette
      return sourceUsed;
    }

    // --- browser plumbing ---------------------------------------------------

    sendContent(name, data) {
      try {
        this.win.gBrowser.selectedBrowser.browsingContext
          ?.currentWindowGlobal?.getActor("AetherContent")
          ?.sendAsyncMessage(name, data);
      } catch (e) {
        console.error(`[aether] could not send ${name} to content:`, e);
      }
    }

    // New tabs (t / O / resurrection) open in the active workspace's
    // container; TabOpen adoption files them into its membership.
    newTab() {
      const gBrowser = this.win.gBrowser;
      const opts = { userContextId: this.activeContainerId() };
      const tab = gBrowser.addTrustedTab
        ? gBrowser.addTrustedTab("about:blank", opts)
        : gBrowser.addTab("about:blank", {
            ...opts,
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
        // close animation keeps it there longer) — count only live tabs, and
        // only visible ones: hidden workspaces don't inflate the count.
        tabCount:
          this.win.gBrowser?.tabs?.filter(t => !t.closing && !t.hidden).length ?? 0,
        workspace: AetherWorkspaces.model?.active ?? "",
        focus: this.focusSession ?? undefined, // {task, startedAt} for the widget
        ai: { enabled: this.aiState?.enabled === true }, // f7: the switch, always visible
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
      await AetherGraveyard.init(
        config.graveyard?.cap ?? AetherConfig.DEFAULTS.graveyard.cap
      );
      await AetherWorkspaces.init(
        config.workspaces?.default ?? AetherConfig.DEFAULTS.workspaces.default
      );
      window.Aether = new Aether(window, config);
      console.info("[aether] overlay active");
    } catch (e) {
      console.error("[aether] could not init:", e);
    }
  })();
})();
