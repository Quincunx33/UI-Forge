# UI-Forge Roadmap

This roadmap is the source of truth for project scope. Items are plans until implemented and verified.

## Phase 0 — Project foundation
- [x] Create repository and define project purpose.
- [x] Establish detection-versus-repair separation.
- [x] Define evidence-first and minimal-change principles.
- [x] Define portable plugin manifest and capability contract.
- [x] Define configuration schema and structured report schema.
- [x] Define initial repair approval and safety boundaries.
- [ ] Add threat model and formal permission model.

## Phase 1 — Agent skill foundation
- [x] Add read-only UI detection skill.
- [x] Add read-only visual design review skill.
- [x] Add explicitly invoked controlled repair skill.
- [x] Document current plugin usage and limitations.
- [ ] Validate installation format against target coding agents.
- [ ] Add agent-specific adapters and install/update tooling.

## Phase 2 — Detection runtime
- [ ] Inspect project structure and identify framework/build/test commands automatically.
- [ ] Add browser automation adapter.
- [ ] Capture console errors, failed requests, and page exceptions.
- [ ] Add route and interaction discovery with safe limits.
- [ ] Capture screenshots at configured viewports.
- [ ] Detect horizontal overflow, clipping, overlap, and missing content.
- [ ] Produce schema-valid findings with severity, confidence, reproduction steps, and evidence.

## Phase 3 — Automated quality audits
- [ ] Functional checks for links, buttons, forms, dialogs, and navigation.
- [ ] Responsive viewport matrix and content stress checks.
- [ ] Accessibility checks: semantics, keyboard, focus, contrast, labels, reduced motion.
- [ ] Motion audit: excessive loops, scroll hijacking, layout animation, and reduced-motion gaps.
- [ ] Performance checks: layout shifts, expensive effects, and interaction responsiveness.
- [ ] Visual regression baseline and reviewable diffs.
- [ ] Avoid false claims where a check cannot be automated reliably.

## Phase 4 — Controlled repair engine
- [ ] Convert verified findings into scoped repair tasks.
- [ ] Identify root cause and affected components.
- [ ] Apply minimal patches while preserving design intent and behavior.
- [ ] Require approval for high-risk or broad changes.
- [ ] Keep repair attempts bounded; prevent endless self-edit loops.
- [ ] Record before/after evidence and changed files.

## Phase 5 — Regression and verification
- [ ] Rerun the failing test after each repair.
- [ ] Run relevant existing project tests and build checks.
- [ ] Compare screenshots at the same viewport and state.
- [ ] Detect regressions outside the original defect.
- [ ] Stop and report when tests remain unstable or contradictory.
- [ ] Generate final quality report with verified, unresolved, and untested items.

## Phase 6 — Distribution and quality
- [ ] Add validated adapters for Codex, Claude Code, Cursor, and other requested agents.
- [ ] Add CI validation for manifests, schemas, scripts, and documentation.
- [ ] Add example projects and reproducible demos.
- [ ] Publish versioned releases and installation/update documentation.

## Definition of done

A feature is complete only when:
1. Its behavior is implemented.
2. Automated tests cover its important paths.
3. Failure behavior is documented.
4. It has been exercised against a real sample project.
5. Documentation describes actual behavior, not intended behavior.
