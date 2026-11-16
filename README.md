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
- opt-in, bounded same-origin anchor discovery (configured routes remain authoritative; query-string routes and asset links are skipped);
- opt-in functional smoke tests that activate only unique `button[type=button]` controls marked `data-ui-forge-safe="true"` and referenced by `data-testid`;
- optional PNG visual regression against manually approved baselines, with pixel diffs saved as run artifacts;
- browser console errors, uncaught page exceptions, and failed requests;
- screenshots at configured viewport sizes;
- horizontal overflow, clipped-content heuristics, and elements extending past the viewport;
- axe-core accessibility rules tagged WCAG 2.0/2.1 A/AA and best-practice, plus DOM smoke checks;
- infinite CSS animation and reduced-motion smoke checks;
- first-Tab focus-indicator and short-run layout-shift smoke checks;
- lab performance signals for TTFB, observed LCP, main-thread long tasks, and Resource Timing transfer sizes (unsupported or unobserved APIs are marked untested);
- evidence-based repair handoff export, bounded unified-diff preflight review, and explicitly approved Git patch application;
- schema-validated JSON reports with evidence paths and explicit check outcomes.

## Controlled repair preflight

Create a handoff from a verified finding, then review a proposed unified diff before applying it:

```sh
node ./bin/ui-forge.js handoff --report .ui-forge/<run>/report.json --finding UIF-0001
node ./bin/ui-forge.js review --handoff <handoff.json> --patch <change.patch>
# After inspection, set scope.allowedFiles to the exact approved paths in the handoff:
node ./bin/ui-forge.js apply --handoff <handoff.json> --patch <change.patch> --root /path/to/project --approve --apply
```

Review is a preflight, not an approval to edit. Application requires both flags, an exact non-empty `scope.allowedFiles` list, a clean Git working tree, no symlink traversal, and a successful `git apply --check`. It is a local Git guard, not an OS-level sandbox; run project tests and review the resulting diff afterwards.

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

Detection never edits project source. Route discovery is disabled by default and follows same-origin anchor URLs only. Functional interaction tests are also disabled by default; they click only unique, configured buttons marked `data-ui-forge-safe="true"` and must be backed by side-effect-safe test behavior or mocks. No forms are submitted. Visual regression compares against manually approved baselines and never creates or overwrites them. Loopback targets are the default; remote targets require explicit allowRemote=true. Known cloud metadata endpoints and cross-origin route escapes are blocked. Treat only systems you own or are authorized to test.

## Current limitations

This is an initial smoke-audit runtime, not a complete QA suite. Automated axe-core rule coverage is not a full WCAG conformance assessment: manual review, assistive-technology testing, exhaustive keyboard interaction coverage, field performance profiling and full Core Web Vitals validation, AI screenshot interpretation, semantic blast-radius analysis, OS-level repair sandboxing, autonomous agent repair loops, and automatic post-repair regression verification remain outstanding. A first-pass smoke check is not a conformance claim. The repair skill is an agent workflow; the CLI can apply an explicitly approved, allowlisted patch but does not autonomously generate or verify repairs. See [ROADMAP.md](ROADMAP.md) and [Threat model](docs/THREAT-MODEL.md).

## License

License has not yet been selected.
