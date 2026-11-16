# Changelog

## 0.4.0

- Added axe-core browser accessibility scans for WCAG 2.0/2.1 A/AA and best-practice tagged rules.
- Marked axe-core incomplete/manual-review checks as untested.
- Expanded browser integration assertions for common accessibility violations.
- Added bounded unified-diff preflight review with explicit approval for sensitive or broad patches.
- Updated plugin manifests and package version to 0.4.0.

## 0.3.0

- Added a portable Agent Plugins 1.0.0 root manifest.
- Added Cursor and Claude Code plugin and marketplace manifests.
- Added project/user skill installation for Codex, Claude Code, and Cursor.
- Added Playwright CLI detection for routes, viewports, screenshots, console errors, failed requests, responsive overflow, clipping heuristics, first-Tab focus indication, reduced-motion behavior, and layout-shift smoke signals.
- Added evidence-based repair handoff export with explicit non-authorization state and bounded path/sensitive-file scope checks.
- Added config/report JSON Schema validation.
- Added loopback-default target policy, explicit remote opt-in, metadata-host blocking, and same-origin route checks.
- Added unit, schema, installer, and browser integration tests plus GitHub Actions workflow configuration.
- Documented remaining limitations and threat boundaries.

## 0.2.1

- Added initial browser audit runtime and structured reports.
- Added the first version of multi-agent portable skills.
