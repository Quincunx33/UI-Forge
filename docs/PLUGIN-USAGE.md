# Plugin usage and compatibility

## Requirements

- Node.js 20 or newer for the CLI runtime.
- A local development server started by the user or the project workflow.
- Playwright and its browser binaries for browser-based detection.

## Install the plugin

Clone the repository or copy it into your coding-agent workspace. The three portable Markdown skills are in the skills directory:
- ui-detect: read-only inspection and reporting.
- ui-design-review: read-only product-aware visual critique.
- ui-repair: explicitly authorized, scoped code repair and regression verification.

Agent skill discovery paths differ. Copy each skill folder into the directory documented by the target agent. The canonical instructions remain in this repository; do not maintain divergent copies.

## Run the browser detector

From the UI-Forge repository:

1. Install package dependencies with npm install.
2. Install Chromium with npx playwright install chromium.
3. Start the target application separately, for example with the project's own development command.
4. Copy ui-forge.config.example.json to a local config file and set baseUrl, routes, and viewports.
5. Run:

   node ./bin/ui-forge.js detect --config ./ui-forge.config.json

The detector writes a timestamped report and screenshots under outputDir. It does not start or stop the application, submit forms, click controls, modify source files, or repair findings.

The current detector checks route response, browser console errors, uncaught page exceptions, failed requests, horizontal overflow, elements extending past the viewport, missing image alt attributes, potentially unlabeled controls, empty links, duplicate IDs, and infinite CSS animations. These are initial automated checks, not a complete accessibility or functional test suite.

## Configuration

See ui-forge.config.example.json and schemas/config.schema.json. The runtime currently accepts:
- baseUrl: target origin.
- routes: local paths beginning with /.
- viewports: named viewport dimensions.
- mode: detect only for the executable browser runtime.
- outputDir: report and screenshot destination.
- browser: Playwright browser engine and navigation timeout.

The schema includes forward-looking repair settings; the CLI does not execute repair mode.

## Report format

The JSON report follows schemas/report.schema.json. Checks not run must be marked untested or blocked, never passed. Evidence paths are relative to the individual run directory.

## Safety and limitations

- Only run against systems you own or are authorized to test.
- Do not point the detector at production systems containing real user data unless explicitly authorized and appropriately isolated.
- Browser tests are read-only smoke checks; visiting a route can still trigger application-side analytics or other page-load behavior.
- No forms are submitted and no visible controls are activated.
- Detection mode does not edit project source.
- The current runtime does not perform visual AI interpretation, screenshot diffing, exhaustive keyboard testing, full WCAG auditing, performance profiling, or automatic repair.
- Agent skills provide portable workflows; browser capabilities depend on the connected agent and installed tools.
