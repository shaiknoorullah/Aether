# IPC Research Summary

## Recommended Architecture (Layered)

### Layer 1: Sidebar <-> Background
- **Method**: `runtime.connect` (port-based long-lived connections)
- **Security**: Fully internal to extension, pages cannot inject
- **Use for**: AI sidebar communicating with background orchestrator

### Layer 2: Background <-> Content Script
- **Method**: `runtime.sendMessage` / `runtime.connect` ports
- **Security**: Internal, validate sender tab/frame
- **Use for**: Background dispatching commands to content scripts in active tab

### Layer 3: Content Script <-> Page
- **Method**: `exportFunction` + `cloneInto` (Firefox-specific)
- **Security**: Xray vision protects content script from page manipulation. Exported functions run in content script privilege — validate all arguments.
- **Use for**: Injecting safe API surface into page for automation
- **Avoid**: `window.postMessage` (any script can intercept/spoof)

### Layer 4: OS-Level (Optional)
- **Method**: Native Messaging Host via `runtime.connectNative`
- **Security**: No binary verification by browser. Host runs with full user privileges.
- **Use for**: File I/O, launching processes, connecting to WebDriver BiDi
- **Latency**: ~1.5-2ms per message on persistent connection
- **Limit**: 1MB response, 4GB request
- **Distribution**: Separate install required (manifest in `~/.mozilla/native-messaging-hosts/`)

## All Approaches Evaluated

| Approach | Security | Automation Power | Complexity | Status |
|----------|----------|-----------------|------------|--------|
| WebExtension Messaging | High | Medium | Low | Stable, recommended |
| Native Messaging Host | Medium | High | High (distribution) | Stable, optional |
| MessageChannel/MessagePort | Good | Medium | Medium | Stable |
| userScripts API | Good | Full DOM | Medium | Stable MV3 |
| exportFunction/cloneInto | Medium | High | Low | Stable, Firefox-only, recommended |
| window.postMessage | Low | Medium | Low | Stable, NOT recommended |
| WebSocket localhost | Medium-High | Varies | High | NOT recommended |
| Marionette/WebDriver BiDi | Extreme risk | Complete | High | External automation only |
| Firefox RDP | Extreme | Unlimited | Very High | Nightly/DevEdition only |
| SharedWorker/BroadcastChannel | Low | None | Low | Same-origin limited |

## Key Firefox-Specific Mechanisms

### Xray Vision
- Content scripts see "clean" DOM — original prototypes, no page expandos
- Page scripts cannot see content script variables
- `wrappedJSObject` bypasses Xray (dangerous, use for reading only)

### exportFunction
- Exports content script function into page scope
- Function runs with content script privileges
- Arguments arrive as Xray wrappers (safe)
- NEVER trust arguments without validation

### cloneInto
- Creates structured clone from content script scope into page scope
- The clone is a copy — page cannot reach back
- With `cloneFunctions: true`, functions are also exported

### Firefox MV3 Notes
- Background: service workers (still maturing in Firefox)
- Host permissions: separate `host_permissions` key
- Code evaluation not available in content scripts (MV3 restriction)
- `activeTab` grants temporary permission on user interaction only
