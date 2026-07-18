// Child side of the AetherContent actor. Runs inside content processes:
// - tracks focus of editable elements (drives auto-insert mode in chrome)
// - executes scroll commands
// - renders and drives hint mode (top frame only for the spike)

const EDITABLE_INPUT_TYPES = new Set([
  "text", "search", "url", "tel", "email", "password", "number", "date",
  "datetime-local", "month", "week", "time",
]);

const CLICKABLE_SELECTOR = [
  "a[href]", "button", "input", "select", "textarea", "summary",
  '[role="link"]', '[role="button"]', '[role="tab"]', '[role="menuitem"]',
  "[onclick]", '[tabindex]:not([tabindex="-1"])',
].join(",");

function isEditable(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.localName;
  if (tag === "textarea" || tag === "select") return true;
  if (tag === "input") {
    return EDITABLE_INPUT_TYPES.has((el.getAttribute("type") || "text").toLowerCase());
  }
  return false;
}

export class AetherContentChild extends JSWindowActorChild {
  hints = null; // { container, items: [{label, el, badge}], typed }

  handleEvent(event) {
    switch (event.type) {
      case "focusin":
        if (isEditable(event.target)) {
          this.sendAsyncMessage("Aether:Focus", { editable: true });
        }
        break;
      case "focusout":
        if (isEditable(event.target)) {
          this.sendAsyncMessage("Aether:Focus", { editable: false });
        }
        break;
    }
  }

  receiveMessage(msg) {
    const win = this.contentWindow;
    if (!win) return;
    switch (msg.name) {
      case "Aether:Scroll":
        win.scrollBy({ top: msg.data.dy, behavior: "instant" });
        break;
      case "Aether:HalfPage":
        win.scrollBy({ top: (win.innerHeight / 2) * msg.data.dir, behavior: "instant" });
        break;
      case "Aether:ScrollTo":
        win.scrollTo({
          top: msg.data.where === "top" ? 0 : win.document.documentElement.scrollHeight,
          behavior: "instant",
        });
        break;
      case "Aether:Blur":
        win.document.activeElement?.blur();
        break;
      case "Aether:HintsStart":
        this.startHints(msg.data.chars);
        break;
      case "Aether:HintKey":
        this.hintKey(msg.data.key);
        break;
      case "Aether:HintsStop":
        this.stopHints();
        break;
    }
  }

  // --- hint mode ------------------------------------------------------------

  startHints(chars) {
    this.stopHints();
    const doc = this.document;
    const win = this.contentWindow;
    const candidates = [];
    for (const el of doc.querySelectorAll(CLICKABLE_SELECTOR)) {
      const rect = el.getBoundingClientRect();
      if (
        rect.width > 0 && rect.height > 0 &&
        rect.bottom > 0 && rect.top < win.innerHeight &&
        rect.right > 0 && rect.left < win.innerWidth &&
        el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false
      ) {
        candidates.push({ el, rect });
      }
    }
    if (!candidates.length) {
      this.sendAsyncMessage("Aether:HintsDone", { reason: "empty" });
      return;
    }

    const labels = this.makeLabels(chars, candidates.length);
    const container = doc.createElement("div");
    container.id = "aether-hints";
    container.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;pointer-events:none;font:bold 11px monospace;";
    const items = candidates.map(({ el, rect }, i) => {
      const badge = doc.createElement("span");
      badge.textContent = labels[i];
      badge.style.cssText =
        "position:absolute;background:#d79921;color:#1d2021;padding:1px 3px;" +
        "border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,.5);" +
        `left:${Math.max(0, rect.left)}px;top:${Math.max(0, rect.top)}px;`;
      container.appendChild(badge);
      return { label: labels[i], el, badge };
    });
    doc.documentElement.appendChild(container);
    this.hints = { container, items, typed: "" };
  }

  makeLabels(chars, count) {
    // shortest uniform label length that covers count
    let len = 1;
    while (chars.length ** len < count) len++;
    const labels = [];
    const total = chars.length ** len;
    for (let i = 0; i < total && labels.length < count; i++) {
      let label = "";
      let n = i;
      for (let d = 0; d < len; d++) {
        label = chars[n % chars.length] + label;
        n = Math.floor(n / chars.length);
      }
      labels.push(label);
    }
    return labels;
  }

  hintKey(key) {
    if (!this.hints) return;
    this.hints.typed += key;
    const typed = this.hints.typed;
    const remaining = this.hints.items.filter(it => it.label.startsWith(typed));
    if (remaining.length === 0) {
      this.stopHints();
      this.sendAsyncMessage("Aether:HintsDone", { reason: "nomatch" });
      return;
    }
    if (remaining.length === 1 && remaining[0].label === typed) {
      const el = remaining[0].el;
      this.stopHints();
      this.sendAsyncMessage("Aether:HintsDone", { reason: "activated" });
      if (isEditable(el)) {
        el.focus();
      } else {
        el.focus?.();
        el.click();
      }
      return;
    }
    for (const it of this.hints.items) {
      it.badge.style.display = it.label.startsWith(typed) ? "" : "none";
    }
  }

  stopHints() {
    this.hints?.container.remove();
    this.hints = null;
  }
}
