# Architecture

## 1. System model

UI-Forge is a modular coding-agent plugin with a shared quality workflow. Detection and repair are separate capabilities with a common evidence and finding model.

```text
Coding Agent
    |
Plugin / Agent Adapter
    |
Project Discovery & Safe Environment
    |
    +---------------- Detection Engine ----------------+
    | Browser | Visual | Responsive | A11y | Motion   |
    | Console | Network | Interaction | Performance    |
    +-----------------------+-------------------------+
                            |
                    Findings & Evidence
                            |
                    Triage / Risk Gate
                            |
                 Repair Planner (bounded)
                            |
                   Scoped Code Changes
                            |
                 Regression Verification
                            |
                    Quality Report
```

## 2. Core modules

### Project Discovery
Identify framework, package manager, routes, scripts, test tools, and existing conventions. Prefer existing project tooling; do not impose a new stack without need.

### Browser Test Adapter
Use a real browser automation runtime where available. Capture:
- console errors and uncaught exceptions;
- failed network requests;
- navigation and interaction outcomes;
- screenshots and viewport metadata;
- reproducible steps and test environment.

### Visual Inspection
Evaluate layout and hierarchy using screenshots and DOM measurements. Findings should describe observable defects, not subjective taste presented as fact.

Examples:
- horizontal overflow at a specific viewport;
- overlapping navigation and content;
- clipped text or controls;
- inconsistent spacing within a defined design system;
- low contrast or unreadable typography.

### Responsive Inspector
Run a configurable viewport matrix. Include narrow mobile, standard mobile, tablet, laptop, and wide desktop defaults; allow project-specific overrides. Test long text, empty states, validation messages, and dynamic content.

### Interaction Inspector
Exercise links, buttons, forms, menus, dialogs, tabs, and keyboard paths. Do not submit real payments, send messages, delete records, or trigger other destructive external actions.

### Motion Auditor
Inspect CSS and runtime behavior for:
- infinite decorative motion;
- excessive simultaneous transitions;
- scroll hijacking and disruptive parallax;
- animation of layout-heavy properties;
- motion that blocks interaction;
- missing `prefers-reduced-motion` support.

Do not ban all animation. Keep purposeful state feedback and meaningful transitions.

### Accessibility Auditor
Check semantic HTML, accessible names, keyboard operation, focus visibility, focus order, contrast, form errors, and reduced-motion behavior. Automated checks are not a substitute for manual assistive-technology review.

### Repair Planner
Prioritize verified defects by impact, reproducibility, and confidence. Explain the root cause and propose the smallest viable patch. Preserve the established visual language unless the user requests redesign.

### Regression Verifier
Rerun the original failing test, relevant neighboring tests, build/lint/type checks where available, and before/after visual comparisons. A repair is not complete merely because the code edit succeeded.

## 3. Finding contract

Each finding should contain:
- stable identifier;
- category and severity;
- confidence level;
- concise title and impact;
- affected route, viewport, and state;
- reproduction steps;
- evidence references (screenshot, console entry, DOM measurement, test output);
- suspected root cause, clearly marked as a hypothesis;
- suggested minimal repair;
- verification status.

Severity must be based on user impact:
- **Critical:** blocks a core task or creates a serious accessibility/safety issue.
- **High:** major functionality or layout is broken.
- **Medium:** noticeable defect with a workaround.
- **Low:** minor inconsistency or polish issue.

## 4. Repair safety

- Start in report-only mode.
- Do not edit files during detection-only runs.
- Keep repairs scoped to confirmed findings.
- Ask before broad redesigns, dependency upgrades, or changes to sensitive flows.
- Never remove or weaken tests to hide failures.
- Bound repair retries and stop on repeated failure.
- Preserve a clear diff and report all modified files.

## 5. Design quality policy

Avoid defaulting to generic AI aesthetics. In particular, do not add gradients, glow, glass effects, floating decorations, excessive rounded cards, badges, or animation without a product-specific reason.

Design decisions should follow the project's purpose, existing brand, information hierarchy, content density, and user tasks. Prefer coherent typography, deliberate spacing, accessible contrast, and restrained motion.

## 6. Portability

Keep the quality workflow independent from a specific coding agent. Agent adapters should provide:
- installation and invocation instructions;
- supported skill or command format;
- tool capability declarations;
- permission and approval behavior;
- limitations and fallback behavior.

The core report schema and quality rules should remain consistent across adapters.
