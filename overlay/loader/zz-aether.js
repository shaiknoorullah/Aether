// Aether: autoconfig must run unsandboxed so the loader can register chrome
// URLs and load scripts. Installed into <app>/defaults/pref/ (the zz- prefix
// makes it load last and win).
pref("general.config.sandbox_enabled", false);
