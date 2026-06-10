# T3: Native Messaging Host Attack Surface + OS Sandboxing

## Objective
Research the security implications of Native Messaging Hosts for AI agent browser integration.

## Questions to Answer
1. How does the Native Messaging Host protocol work (manifest, stdio, lifecycle)?
2. What binary verification exists? Can a malicious binary be substituted?
3. What OS-level permissions does a Native Messaging Host process inherit?
4. What argument injection or stdin/stdout manipulation risks exist?
5. How does Native Messaging compare across browsers (Chrome, Firefox, Edge)?
6. What sandboxing options exist for Native Messaging Host processes (AppArmor, SELinux, seccomp, macOS sandbox)?
7. What are the risks of a compromised Native Messaging Host escalating to full system access?
8. What mitigations exist or are recommended for production deployments?

## Search Strategy
- Search for "Native Messaging Host security", "chrome native messaging attack surface"
- Search for "browser native messaging binary verification", "native messaging host sandboxing"
- Search Chrome/Firefox extension docs for native messaging security model
- Search for "native messaging host privilege escalation"
- Look for security audit reports or CVEs related to native messaging

## Output
Write findings to `outputs/.drafts/agent-safe-browser-ipc-research-T3.md` with:
- Section per question
- Source URLs for every claim
- Attack tree or threat model summary
- Mitigation recommendations with feasibility ratings
