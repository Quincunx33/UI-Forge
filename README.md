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

The installer supports Codex, Claude Code, and Cursor project/user skill directories. See [Plugin usage](docs/PLUGIN-USAGE.md).

## Browser detection runtime

The initial Playwright detector checks:
- route response and navigation failures;
- browser console errors, uncaught page exceptions, and failed requests;
- screenshots at configured viewport sizes;
- horizontal overflow and elements extending past the viewport;
- potentially unlabeled controls, missing image alt attributes, empty links, and duplicate IDs;
- infinite CSS animation smoke signals;
- schema-validated JSON reports with evidence paths.

## Repository layout

```text
.
├── plugin.json
├── bin/                  # CLI
├── src/                  # Runtime, installer, schema validation
├── skills/               # Canonical portable agent skills
├── src/install.js        # Multi-agent installer
├── schemas/              # Config and report contracts
├── test/                 # Unit and browser integration tests
├── docs/
└── .github/workflows/    # CI
```

## Safety

Detection is read-only with respect to project source. It does not submit forms, click controls, start or stop the target app, or perform repairs. Loopback targets are the default; remote targets require explicit allowRemote=true. Known cloud metadata endpoints and cross-origin route escapes are blocked. Treat only systems you own or are authorized to test.

## Current limitations

This is an initial smoke-audit runtime, not a complete QA suite. Full WCAG auditing, keyboard interaction coverage, comprehensive reduced-motion analysis, performance profiling, screenshot visual regression, AI screenshot interpretation, and executable autonomous repair are not yet implemented. The repair skill is an agent workflow, not an automatic CLI patcher. See [ROADMAP.md](ROADMAP.md) and [Threat model](docs/THREAT-MODEL.md).

## License

License has not yet been selected.
