---
name: ui-detect
description: Inspect and test an existing web UI for visual, responsive, functional, accessibility, motion, console, and performance defects. Detection only; never edit project files.
---

# UI-Forge: UI Detection

## Purpose
Run an evidence-first UI quality audit. This skill is strictly read-only with respect to project source files. It may create reports and test artifacts only in the configured output directory.

## Invocation
Use when the user asks to audit, inspect, test, diagnose, or find UI/frontend bugs. Do not use this skill to implement fixes.

## Required behavior
1. Inspect the repository before assuming its framework, package manager, routes, or test tooling.
2. Read project instructions and existing tests. Preserve established conventions.
3. Identify the available browser automation capability. Prefer an existing project setup; do not install dependencies without approval.
4. Confirm the application can be started safely. Never start production services or connect to live customer data without explicit authorization.
5. Record the exact environment, command, base URL, routes, viewport sizes, and checks actually run.
6. Reproduce issues before classifying them as verified.
7. Save evidence and produce a structured report using the UI-Forge report schema.

## CLI runtime\nIf the UI-Forge package is installed and the target app is already running locally, use the bundled command:\n\n- Install dependencies with npm install in the UI-Forge package.\n- Install the selected browser with npx playwright install chromium.\n- Copy ui-forge.config.example.json, set the local baseUrl and routes, then run npx ui-forge detect --config ./ui-forge.config.json.\n- Read the generated JSON report and screenshots under outputDir.\n\nThe current CLI performs route, console, failed-request, viewport overflow, accessible-name, missing image-alt, duplicate-ID, empty-link, and infinite-animation smoke checks. It does not click controls or edit source.\n\n## Audit workflow

### A. Discover
- Identify framework, entry points, package manager, scripts, route definitions, and existing browser/unit tests.
- Determine whether the app is static, server-rendered, or requires authenticated data.
- Identify safe local startup and test commands.
- Do not guess credentials or bypass authentication.

### B. Exercise the interface
When browser automation is available:
- Visit each explicitly requested route; otherwise inspect a safe representative route set.
- Capture screenshots at configured viewport sizes.
- Collect console errors, uncaught exceptions, and failed requests.
- Inspect horizontal overflow, clipped content, overlapping elements, off-screen controls, and unexpected scroll behavior.
- Test visible links, buttons, navigation, menus, dialogs, tabs, and form validation.
- Test keyboard navigation and focus visibility.
- Check reduced-motion behavior.
- Use long text, narrow widths, empty states, and validation messages where safe.

Never submit payments, send real messages, delete records, change account settings, or trigger irreversible external actions. Use mocks or stop before the destructive step.

### C. Review quality
Inspect:
- visual hierarchy, spacing, typography, alignment, density, and consistency;
- responsive behavior and content reflow;
- semantic structure, accessible names, labels, contrast, focus, and keyboard behavior;
- excessive or distracting motion, infinite decorative animation, scroll hijacking, and layout-heavy animation;
- obvious rendering/performance problems.

Do not report subjective preference as a verified defect. Explain the user impact and evidence.

### D. Report
For every finding include:
- stable ID, category, severity, confidence, title, and impact;
- route, viewport, and UI state;
- reproduction steps;
- evidence path or test output;
- suspected cause, explicitly marked as a hypothesis;
- a minimal suggested next step;
- status: verified, likely, not_reproduced, or untested.

Include checks that were skipped and why. A skipped check is untested, never passed.

## Hard boundaries
- Do not modify source files, stylesheets, dependencies, configuration, or tests.
- Do not fix issues, even if the fix appears obvious.
- Do not weaken tests or hide console/network errors.
- Do not claim complete accessibility, security, or responsiveness from automated checks alone.
- If browser automation is unavailable, report that limitation and perform only safe static inspection.

## Completion response
Summarize tested routes/viewports, verified findings by severity, skipped checks, evidence location, and whether repair is recommended. State clearly that no source files were changed.
