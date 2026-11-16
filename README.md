# UI-Forge

**Autonomous UI Quality Engineering & Repair Plugin**

UI-Forge is a cross-agent engineering plugin designed to help coding agents build, inspect, test, and repair real web interfaces without falling into generic AI-generated design patterns.

It combines two independent but connected systems:

1. **Detection & Verification** — browser-driven functional tests, visual inspection, responsive checks, accessibility audits, performance checks, and evidence-backed reports.
2. **Controlled Repair** — root-cause analysis, minimal code changes, targeted retesting, regression checks, and safe rollback guidance.

UI-Forge is not a one-click redesign tool. It must preserve product intent and existing behavior while fixing demonstrable defects.

## Design principles

- **Evidence before edits:** reproduce and record a defect before changing code.
- **Minimal repair:** fix the root cause; do not rewrite unrelated components.
- **No generic AI styling:** no automatic blue/green gradients, glassmorphism, excessive cards, badges, glow, or decorative motion.
- **Motion with purpose:** animation must communicate state or improve interaction; respect reduced-motion preferences.
- **Responsive by verification:** test actual viewport sizes and content, not just CSS breakpoints.
- **Accessibility is functional quality:** keyboard, focus, semantics, contrast, and assistive-technology behavior matter.
- **Regression protection:** every repair must rerun relevant tests.
- **Honest reporting:** distinguish verified failures, suspected issues, and untested areas.

## Planned capabilities

| Area | Responsibility |
|---|---|
| Design intelligence | Product-aware visual direction and design-system consistency |
| Browser automation | Navigation, interaction, screenshots, console and network errors |
| Visual QA | Layout, spacing, typography, overflow, clipping, and visual regression |
| Responsive QA | Mobile, tablet, laptop, and desktop viewport checks |
| Interaction QA | Buttons, links, forms, menus, dialogs, and keyboard flows |
| Motion audit | Excessive, distracting, inaccessible, or expensive animations |
| Accessibility audit | Semantic structure, keyboard access, focus, contrast, and reduced motion |
| Performance audit | Rendering, layout shifts, heavy effects, and avoidable work |
| Repair engine | Root-cause analysis and minimal, scoped code changes |
| Regression engine | Retest repaired behavior and detect newly introduced defects |

## Repository status

This repository is currently in the **foundation / specification phase**. The architecture and roadmap are being established before implementation. Do not assume a capability is implemented merely because it appears in the plan.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Quality gates](docs/QUALITY-GATES.md)
- [Roadmap](ROADMAP.md)

## Intended compatibility

The design targets multiple coding-agent environments rather than one vendor-specific runtime. Agent-specific adapters and skill packaging will be added as the supported formats are validated.

## Safety boundaries

- Never claim a page is secure, encrypted, accessible, or fully responsive without evidence.
- Never modify authentication, payment, security-sensitive, or destructive flows without explicit authorization.
- Never delete user data, disable tests, or weaken quality gates to make a build pass.
- Ask before broad redesigns, dependency migrations, or destructive changes.
- Keep a clear record of files changed, checks run, and remaining risks.

## License

License has not yet been selected.
