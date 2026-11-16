# UI-Forge

**Autonomous UI Quality Engineering & Repair Plugin**

UI-Forge is a modular, portable coding-agent plugin for evidence-based UI inspection, design review, frontend testing, and controlled repair.

It is designed around three separate agent skills:

| Skill | Purpose | Can edit project source? |
|---|---|---:|
| `ui-detect` | Find and document UI defects with evidence | **No** |
| `ui-design-review` | Review visual quality and provide prioritized recommendations | **No** |
| `ui-repair` | Fix confirmed defects and run regression checks | **Yes, only when explicitly invoked** |

## Current implementation

- [x] Portable plugin manifest (`plugin.json`)
- [x] Three reusable agent skills with explicit responsibilities
- [x] Configuration JSON Schema
- [x] Structured audit-report JSON Schema
- [x] Detection-only and repair safety boundaries
- [ ] Browser automation runtime and executable audit commands
- [ ] Automated visual, responsive, accessibility, motion, and functional checks
- [ ] Regression verification and CI validation
- [ ] Validated agent-specific installation adapters

The skills are usable as agent instructions now. Browser testing is **not yet bundled as an executable engine**; it requires a compatible browser automation tool or a future UI-Forge runtime.

## Quick start

1. Copy the `skills/` directory into the skill location supported by your coding agent.
2. Ask the agent to use **ui-detect** to inspect a web project. This is report-only and must not modify source files.
3. Ask for **ui-design-review** when you want a product-aware visual critique without code changes.
4. After reviewing findings, explicitly ask the agent to use **ui-repair** for an approved fix.
5. Keep the generated report and evidence with the project so repairs can be verified later.

See [Plugin usage and compatibility](docs/PLUGIN-USAGE.md) for installation guidance and current limitations.

## Design principles

- **Evidence before edits:** reproduce and record a defect before changing code.
- **Minimal repair:** fix the root cause; do not rewrite unrelated components.
- **No generic AI styling:** avoid gratuitous gradients, glass effects, glow, floating decoration, excessive cards, badges, and decorative motion.
- **Motion with purpose:** keep useful interaction feedback and respect reduced-motion preferences.
- **Responsive by verification:** test actual viewport sizes and content, not just CSS breakpoints.
- **Accessibility is functional quality:** keyboard, focus, semantics, contrast, and assistive-technology behavior matter.
- **Regression protection:** every repair must rerun relevant checks.
- **Honest reporting:** distinguish verified failures, suspected issues, and untested areas.

## Repository structure

```text
.
├── plugin.json
├── skills/
│   ├── ui-detect/SKILL.md
│   ├── ui-design-review/SKILL.md
│   └── ui-repair/SKILL.md
├── schemas/
│   ├── config.schema.json
│   └── report.schema.json
└── docs/
    ├── ARCHITECTURE.md
    ├── PLUGIN-USAGE.md
    └── QUALITY-GATES.md
```

## Safety boundaries

- Detection and design review must not edit project source files.
- Repair requires explicit user intent and must remain scoped to confirmed findings.
- Never modify authentication, payment, security-sensitive, or destructive flows without explicit authorization.
- Never delete user data, disable tests, or weaken quality gates to make a build pass.
- Ask before broad redesigns, dependency migrations, or destructive changes.
- Keep a clear record of files changed, checks run, and remaining risks.

## License

License has not yet been selected.
