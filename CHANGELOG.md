# Changelog

## Unreleased

- Added the `ui-create` frontend design and implementation skill for new websites, dashboards, app interfaces, and explicitly requested redesigns.
- Added a responsive Morrow workspace showcase with local project navigation, filtering, search, and project creation interactions.
- Added Playwright browser coverage for the showcase at mobile and desktop sizes, including safe interaction checks.
- Updated installer, plugin documentation, manifests, and universal setup guidance to include all five skills.

- Added a universal `ui-forge` orchestrator skill for evidence-based detect, design review, repair, and verification across AI hosts.
- Added Google AI Studio Agent Playground discovery files and a Build Mode System Instructions adapter.
- Added root `AGENTS.md`, generic AI setup documentation, and installer support for the universal orchestrator and four focused skills.

- Blocked cross-origin top-level navigation and redirect requests during route discovery and audit runs.
- Hardened screenshot artifact names against traversal and route-name collisions; viewport labels are validated.
- Fixed the `all` installer target to include Codex, Claude Code, and Cursor.
- Added host-agent screenshot interpretation guidance to the visual design review skill.

- Added explicit allowlisted Git patch application via `ui-forge apply`, requiring approval, confirmation, a clean worktree, symlink checks, and `git apply --check`.
- Added tests for patch application success and refusal of implicit, out-of-scope, dirty-tree, and symlink-traversal operations.
- Hardened patch review against mixed-format unified diffs that could bypass the exact file allowlist; added a regression test and rollback guard for unexpected post-apply paths.

- Added opt-in same-origin anchor route discovery with a configurable cap of up to 50 additional routes; configured routes are always retained.
- Excluded external, query-string, fragment, asset, and encoded-separator links from discovery.
- Added lab performance observations for TTFB, observed LCP, long tasks, and resource transfer timing, with unsupported measurements marked untested.
- Expanded browser integration coverage for route discovery and performance check reporting.

- Added opt-in functional smoke checks restricted to explicitly marked safe test buttons; unmarked controls are blocked.
- Added PNG screenshot comparison against manually approved baselines, with pixel-diff artifacts and untested status for missing baselines.
- Added configuration validation and browser integration coverage for safe interactions and visual regression.

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
