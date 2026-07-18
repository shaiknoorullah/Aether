// Aether spike prefs — telemetry off, hardening-lite, dev tooling.
// Full arkenfox adoption is a later floor decision; this is the spike-safe subset.

// --- required by the overlay ---
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);

// --- Browser Toolbox for overlay development ---
user_pref("devtools.chrome.enabled", true);
user_pref("devtools.debugger.remote-enabled", true);
user_pref("devtools.debugger.prompt-connection", false);
user_pref("browser.aboutConfig.showWarning", false);

// --- telemetry: off, everywhere ---
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.newProfilePing.enabled", false);
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false);
user_pref("toolkit.telemetry.coverage.opt-out", true);
user_pref("toolkit.coverage.opt-out", true);
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
user_pref("browser.newtabpage.activity-stream.telemetry", false);
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("app.normandy.enabled", false);
user_pref("app.normandy.api_url", "");
user_pref("breakpad.reportURL", "");
user_pref("browser.tabs.crashReporting.sendReport", false);
user_pref("captivedetect.canonicalURL", "");
user_pref("network.captive-portal-service.enabled", false);
user_pref("network.connectivity-service.enabled", false);

// --- shed product baggage ---
user_pref("extensions.pocket.enabled", false);
user_pref("browser.shell.checkDefaultBrowser", false);
user_pref("browser.newtabpage.enabled", false);
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
user_pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
user_pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
user_pref("identity.fxaccounts.enabled", false);
user_pref("browser.aboutwelcome.enabled", false);

// --- behavior ---
// f5 owns restore outright: startup stays blank and tabs reopen from
// <profile>/aether-workspaces.json — Firefox sessionstore must never race it
// (its tabs would be unadopted and visible in every workspace).
user_pref("browser.startup.page", 0);
// f5/f7 backstop: workspaces hide other workspaces' tabs, and gBrowser's
// native last-tab close counts only visible ones — a native close path (any
// chord the overlay ever fails to intercept) must never take the window and
// every hidden workspace down with it. closeCurrentTab passes the same flag
// per-call; this pref covers the paths that bypass it.
user_pref("browser.tabs.closeWindowWithLastTab", false);
user_pref("sidebar.revamp", true); // f4: native vertical tabs, restyled by userChrome.css
user_pref("sidebar.verticalTabs", true);
user_pref("dom.security.https_only_mode", true);
user_pref("browser.contentblocking.category", "strict");
user_pref("browser.download.useDownloadDir", false);
