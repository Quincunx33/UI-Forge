# UI-Forge

**Autonomous UI Quality Engineering & Repair Plugin**

UI-Forge is a modular coding-agent plugin for evidence-based UI inspection, design review, frontend testing, and controlled repair.

## Three agent skills

| Skill | Purpose | Source editing |
|---|---|---|
| ui-detect | Find and document UI defects with evidence | Never |
| ui-design-review | Review visual quality and recommend improvements | Never |
| ui-repair | Fix confirmed defects and run regression checks | Only when explicitly invoked |

## Executable browser detector

The repository now includes a Node.js CLI and optional Playwright browser runtime.

- Route response checks.
- Browser console errors and uncaught exceptions.
- Failed network requests.
- Screenshots at configured viewport sizes.
- Horizontal overflow and off-screen element smoke checks.
- Basic accessible-name smoke checks.
- Timestamped JSON reports with evidence references.

### Quick start

```sh
npm install
npx playwright install chromium
# Start your own local development server separately.
cp ui-forge.config.example.json ui-forge.config.json
# Edit baseUrl and routes, then:
node ./bin/ui-forge.js detect --config ./ui-forge.config.json
```

See [Plugin usage](docs/PLUGIN-USAGE.md) for setup, configuration, and limitations.

## Repository layout

```text
.
├── plugin.json
├── bin/                  # CLI
├── src/                  # Runtime and browser audit
├── skills/               # Portable agent skills\n├── src/install.js        # Agent skill installer
├── schemas/              # Config and report contracts
├── test/                 # Node.js tests
├── docs/
└── .github/workflows/    # CI
```

## Safety

Detection is read-only with respect to project source. The CLI does not submit forms, click controls, start or stop the target app, or perform repairs. Run only against systems you own or are authorized to test. Repair requires explicit user intent and must remain scoped to confirmed findings.

## Current limitations

The browser runtime is an initial smoke-audit engine, not a complete QA suite. Full WCAG auditing, keyboard interaction coverage, comprehensive motion/reduced-motion analysis, performance profiling, screenshot visual regression, AI screenshot interpretation, and executable autonomous repair are not yet implemented. The current detector includes basic checks for infinite CSS animations and common accessible-name issues. See [ROADMAP.md](ROADMAP.md).

## License

License has not yet been selected.
