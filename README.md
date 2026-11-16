# UI-Forge

**Autonomous UI Quality Engineering & Repair Plugin**

UI-Forge is a modular coding-agent plugin for evidence-based UI inspection, design review, frontend testing, and controlled repair.

## Agent skills

| Skill | Purpose | Source editing |
|---|---|---|
| ui-detect | Find and document UI defects with evidence | Never |
| ui-design-review | Review visual quality and recommend improvements | Never |
| ui-repair | Fix confirmed defects and run regression checks | Only when explicitly invoked |

## Quick start

Requirements: Node.js 20+, npm, and a Playwright browser.

For a quick reproducible test, run the [vanilla demo](examples/vanilla-demo/README.md).

```sh
# In the UI-Forge repository
npm install
npx playwright install chromium

# Install into your target project (replace the path)
node ./bin/ui-forge.js install --agent all --target /path/to/your-project

# Start your target app yourself, then in your target project:
cp /path/to/UI-Forge/ui-forge.config.example.json ui-forge.config.json
# Edit baseUrl and routes, then run:
node /path/to/UI-Forge/bin/ui-forge.js detect --config ./ui-forge.config.json
```

The root manifest follows the portable Agent Plugins 1.0.0 format. Cursor and Claude Code marketplace manifests are included. The installer can copy skills into Codex, Claude Code, and Cursor project/user skill directories. See [Plugin usage](docs/PLUGIN-USAGE.md). To try the detector, follow [the vanilla demo](examples/vanilla-demo/README.md).

## Browser detection runtime

Run unit tests with `npm test`; run the real-browser fixture separately with `npm run test:browser` after installing Chromium.

The initial Playwright detector checks:
- route response and navigation failures;
- browser console errors, uncaught page exceptions, and failed requests;
- screenshots at configured viewport sizes;
- horizontal overflow, clipped-content heuristics, and elements extending past the viewport;
- axe-core accessibility rules tagged WCAG 2.0/2.1 A/AA and best-practice, plus DOM smoke checks;
- infinite CSS animation and reduced-motion smoke checks;
- first-Tab focus-indicator and short-run layout-shift smoke checks;
- evidence-based repair handoff export and bounded unified-diff preflight review (never applies patches);
- schema-validated JSON reports with evidence paths and explicit check outcomes.

## Repository layout

```text
.
├── plugin.json             # Portable Agent Plugins manifest
├── .cursor-plugin/         # Cursor plugin and marketplace manifests
├── .claude-plugin/         # Claude Code plugin and marketplace manifests
├── bin/                    # CLI
├── src/                    # Runtime, installer, schema validation
├── skills/                 # Canonical portable agent skills
├── schemas/                # Config, report, and plugin schemas
├── test/                   # Unit and browser integration tests
├── examples/vanilla-demo/  # Reproducible intentionally-buggy demo
├── docs/
└── .github/workflows/      # CI
```

## Safety

Detection is read-only with respect to project source. It does not submit forms, click controls, start or stop the target app, or perform repairs. Loopback targets are the default; remote targets require explicit allowRemote=true. Known cloud metadata endpoints and cross-origin route escapes are blocked. Treat only systems you own or are authorized to test.

## Current limitations

This is an initial smoke-audit runtime, not a complete QA suite. Automated axe-core rule coverage is not a full WCAG conformance assessment: manual review, assistive-technology testing, exhaustive keyboard interaction coverage, field performance profiling, screenshot visual regression, AI screenshot interpretation, and executable autonomous repair remain outstanding. A first-pass smoke check is not a conformance claim. The repair skill is an agent workflow; the CLI can review a proposed diff but cannot apply it. See [ROADMAP.md](ROADMAP.md) and [Threat model](docs/THREAT-MODEL.md).

## License

License has not yet been selected.
