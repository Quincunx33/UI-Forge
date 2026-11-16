# UI-Forge Roadmap

This roadmap is the source of truth for project scope. A checked item means the code or documentation exists; it does not imply a passing CI run unless explicitly stated.

## Phase 0 — Project foundation
- [x] Create repository and define project purpose.
- [x] Establish detection-versus-repair separation.
- [x] Define evidence-first and minimal-change principles.
- [x] Define portable plugin manifest and capability contract.
- [x] Define configuration schema and structured report schema.
- [x] Define initial repair approval and safety boundaries.
- [x] Add threat model, target policy, and initial permission boundaries.

## Phase 1 — Agent skill foundation
- [x] Add read-only UI detection skill.
- [x] Add read-only visual design review skill.
- [x] Add explicitly invoked controlled repair skill.
- [x] Document plugin usage and current limitations.
- [x] Validate standard skill directory formats for Codex, Claude Code, and Cursor.
- [x] Add project/user skill installer for Codex, Claude Code, and Cursor.
- [ ] Add other agent adapters when their skill formats are validated.

## Phase 2 — Detection runtime
- [x] Add Node.js CLI entry point and config validation.
- [x] Add optional Playwright browser adapter.
- [x] Capture console errors, failed requests, and page exceptions.
- [x] Capture screenshots for configured routes and viewports.
- [x] Detect horizontal overflow and elements extending beyond viewport.
- [x] Add basic accessible-name smoke checks.
- [x] Produce structured JSON reports with evidence paths and schema validation.
- [x] Enforce loopback-default target policy, remote opt-in, and same-origin route navigation.
- [ ] Add route discovery with safe limits.
- [ ] Add functional interaction tests using safe mocks and opt-in controls.
- [x] Add first-pass DOM clipping heuristics (not general overlap detection).

## Phase 3 — Automated quality audits
- [x] Add initial checks for missing image alt attributes, unlabeled controls, empty links, and duplicate IDs.
- [x] Add initial infinite CSS animation smoke detection.
- [x] Add a first-Tab focus-indicator smoke check.\n- [ ] Add dedicated accessibility engine and comprehensive keyboard/focus checks.
- [x] Add a first-pass reduced-motion preference check.\n- [ ] Add comprehensive motion audit: scroll hijacking and layout-animation analysis.
- [x] Add a short-run layout-shift smoke metric.\n- [ ] Add field-style performance metrics and full Core Web Vitals profiling.
- [ ] Add visual baseline comparison and reviewable diffs.
- [ ] Add screenshot interpretation adapter with confidence and evidence.
- [ ] Add broad responsive content stress checks.
- [ ] Avoid false claims where a check cannot be automated reliably.

## Phase 4 — Controlled repair engine
- [x] Define explicit repair skill, approval gates, and bounded retry policy.
- [x] Implement finding-to-repair task handoff format with evidence, approval state, and verification slots.
- [x] Add CLI export for a single verified finding (`ui-forge handoff`).
- [x] Add initial path-scope guard for traversal, sensitive paths, and bounded file counts.
- [ ] Add scoped patch review and sensitive-file detection.
- [ ] Add repair execution adapter with user approval.
- [ ] Add automated regression verification and before/after evidence.
- [ ] Ensure repair stops on ambiguous causes or repeated failure.

## Phase 5 — Regression and verification
- [ ] Rerun the failing test after each repair.
- [ ] Run relevant existing project tests and build checks.
- [ ] Compare screenshots at the same viewport and state.
- [ ] Detect regressions outside the original defect.
- [ ] Generate final quality report with verified, unresolved, and untested items.

## Phase 6 — Distribution and quality
- [x] Add validated skill installation targets for Codex, Claude Code, and Cursor.
- [x] Add Node.js unit tests, schema tests, and a Playwright integration fixture.
- [x] Add GitHub Actions CI workflow configuration.
- [ ] Verify CI execution on a working GitHub Actions runner.
- [ ] Add example projects and reproducible demos.
- [x] Add versioned v0.3.0 changelog and installation documentation.
- [ ] Publish a tagged release after CI is verified.

## Definition of done

A feature is complete only when:
1. Its behavior is implemented.
2. Automated tests cover its important paths.
3. Failure behavior is documented.
4. It has been exercised against a real sample project.
5. Documentation describes actual behavior, not intended behavior.
