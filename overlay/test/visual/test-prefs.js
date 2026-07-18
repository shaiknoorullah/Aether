// Harness-only prefs layered over overlay/prefs/user.js for deterministic runs.
user_pref("browser.startup.page", 1);
user_pref("browser.startup.homepage", "about:blank");
user_pref("browser.sessionstore.resume_from_crash", false);
user_pref("browser.shell.checkDefaultBrowser", false);
user_pref("browser.aboutwelcome.enabled", false);
user_pref("datareporting.policy.firstRunURL", "");
user_pref("toolkit.startup.max_resumed_crashes", -1);
user_pref("browser.tabs.warnOnClose", false);
user_pref("browser.warnOnQuit", false);
user_pref("dom.security.https_only_mode", false); // local test pages are http/file
// Xvfb has no GPU: force software WebRender so the compositor can't crash
// mid-run (observed as AbnormalShutdown + black frames in earlier runs).
user_pref("gfx.webrender.software", true);
user_pref("layers.acceleration.disabled", true);
// f6: notification-suppression evidence is read from the profile's prefs.js
// (the glue flushes the flip/restore immediately for crash safety, so the
// file is the durable record). about:config?filter= does not populate the
// search box in LibreWolf 146, and chrome console output never reaches
// stdout in this release build — so no extra pref is needed here.
