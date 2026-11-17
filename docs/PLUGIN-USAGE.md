# Plugin usage and compatibility

## Requirements

- Node.js 20 or newer.
- npm.
- Playwright and a browser binary for browser-based detection.
- A target application started separately by the operator.

## Install the complete plugin

### Cursor

The repository contains a root Agent Plugin manifest and a Cursor marketplace manifest. In Cursor, open Customize, choose From GitHub Repository, and import this repository. For local development, copy the repository into ~/.cursor/plugins/local/ui-forge and reload the window.

### Claude Code

The repository includes .claude-plugin/plugin.json and a marketplace entry. Add the repository as a marketplace, then install the plugin:

```sh
claude plugin marketplace add Quincunx33/UI-Forge
claude plugin install ui-forge@quincunx33-ui-forge
```

For local development, run Claude Code with --plugin-dir pointing to the cloned repository. Validate locally with claude plugin validate.

### Codex and standalone skill installation

The root plugin.json follows the Agent Plugins 1.0.0 manifest format and discovers the skills from skills/. To copy skills directly into a project or user skill directory, use the installer:

```sh
node ./bin/ui-forge.js install --agent codex --target /path/to/project
node ./bin/ui-forge.js install --agent claude --target /path/to/project
node ./bin/ui-forge.js install --agent cursor --target /path/to/project
node ./bin/ui-forge.js install --agent all --target /path/to/project
```

Project scope is the default. Use --scope user for a personal installation in your home directory. Use --force to replace existing UI-Forge skill folders. The installer checks for conflicts before writing and requires the target directory to exist.

Install targets:
- Codex: .agents/skills
- Claude Code: .claude/skills
- Cursor: .cursor/skills
- all: .agents/skills, .claude/skills, and .cursor/skills.

The canonical skill sources remain in skills/ in this repository. The installer copies them into the selected agent directory.

## Skills

- ui-forge: universal orchestrator for frontend creation, visual review, evidence-based inspection, authorized repair, and verification across AI hosts.
- ui-create: design-first frontend creation and substantial redesign, including responsive implementation and working interactions.
- ui-detect: read-only inspection and reporting.
- ui-design-review: read-only product-aware visual critique.
- ui-repair: explicitly authorized, scoped code repair and regression verification.

The canonical universal skill is maintained in `skills/ui-forge/SKILL.md`. The frontend creation workflow is maintained in `skills/ui-create/SKILL.md`. A lightweight entry point at `.agents/skills/ui-forge/SKILL.md` makes it discoverable by Google AI Studio Agent Playground and Codex. Root `AGENTS.md` and `.agents/AGENTS.md` provide shared project instructions.

## Create a frontend

Use the `ui-create` skill when the request is to build a new website, dashboard, app interface, landing page, or to implement a substantial redesign. It guides the host agent to establish a visual direction, implement real responsive pages and interactions, inspect the rendered preview, and run available checks. There is no `ui-forge create` CLI command: creation is performed by the coding agent using the tools available in its host environment.

A self-contained example is available in [the Morrow workspace showcase](../examples/ui-create-demo/README.md). Run `npm run test:browser` to exercise its project navigation, active-project filter, and create-project dialog at mobile and desktop viewport sizes.

## Google AI Studio and universal AI support

See [Universal AI agent setup](UNIVERSAL-AGENT-SETUP.md) for Google AI Studio Agent Playground, Google AI Studio Build Mode, Codex, Claude Code, Cursor, and other assistants.

- Agent Playground: import or mount the repository with `.agents/AGENTS.md` and `.agents/skills/ui-forge/SKILL.md`.
- Build Mode: paste `adapters/google-ai-studio/SYSTEM_INSTRUCTIONS.md` into System Instructions / Custom Instructions, import the project, then explicitly ask the agent to apply the instructions.
- Other AI tools: provide root `AGENTS.md` and `skills/ui-forge/SKILL.md` as project context; adapt tool calls to actual host capabilities.

The universal skill does not assume every host has a browser, terminal, screenshot understanding, or file-editing tools. Unavailable checks must be reported as untested.

## Run the browser detector

From the UI-Forge repository:

1. Run npm install.
2. Install Chromium with npx playwright install chromium.
3. Start your target application separately.
4. Copy ui-forge.config.example.json to a config file in your target project.
5. Set baseUrl and routes. The default is loopback-only.
6. Run the CLI from the target project:

   node /path/to/UI-Forge/bin/ui-forge.js detect --config ./ui-forge.config.json

The detector writes a timestamped report and screenshots under outputDir. It does not start or stop the application, submit forms, or modify source files. Optional functional tests may click only unique, explicitly configured `button[type=button]` elements marked `data-ui-forge-safe="true"`; these must be side-effect-safe or mock-backed.

The current detector supports opt-in same-origin route discovery, opt-in safe-button interaction checks, PNG visual comparison against manually approved baselines, axe-core rules tagged WCAG 2.0/2.1 A/AA and best-practice, route response, browser console errors, uncaught page exceptions, failed requests, horizontal overflow, elements extending past the viewport, clipped-content heuristics, first-Tab focus indication, infinite CSS animations, reduced-motion behavior, TTFB/LCP/long-task lab signals, and a short-run layout-shift smoke metric. Axe violations are automated findings, not proof of WCAG conformance; incomplete axe rules remain marked untested and require manual review.

## Configuration and target policy

See ui-forge.config.example.json and schemas/config.schema.json.

- baseUrl: target origin.
- routes: local absolute paths beginning with one slash.
- viewports: named viewport dimensions.
- mode: detect only for the executable browser runtime.
- allowRemote: false by default. Set true only when you intentionally test a remote system you own or are authorized to test.
- outputDir: report and screenshot destination.
- browser: Playwright browser engine and navigation timeout.
- discovery: opt-in same-origin anchor discovery, capped at 50 additional routes.
- interactions: opt-in checks that click only unique, explicitly configured safe test buttons; these should use mock-backed behavior.
- visualRegression: compare PNG screenshots with manually approved baselines; missing baselines remain untested and are never auto-created.

The runtime blocks known cloud metadata hosts, rejects embedded URL credentials, and rejects cross-origin route escapes. These controls reduce accidental exposure but are not a complete network sandbox.

## Optional visual and functional checks

Route discovery is disabled by default:

```json
"discovery": { "enabled": true, "maxRoutes": 20 }
```

Functional checks must point to a project-owned test button with a stable `data-testid` and the explicit `data-ui-forge-safe="true"` marker:

```json
"interactions": [
  { "name": "open-settings-panel", "testId": "open-settings", "route": "/", "expectedText": "Settings" }
]
```

The button must be `type="button"` and must use mock-backed or otherwise side-effect-safe behavior. Unmarked controls are blocked; missing or untested interaction routes are reported as untested.

For screenshot baselines, first run with visual regression disabled (the default), inspect the captured PNGs, and manually copy approved images from the run's `screenshots/` directory into the configured baseline directory, preserving their filenames. Then enable:

```json
"visualRegression": {
  "enabled": true,
  "baselineDir": ".ui-forge-baselines",
  "threshold": 0.1,
  "maxDiffPixels": 0
}
```

Missing baselines are untested. UI-Forge never creates, updates, or accepts a baseline automatically. Review every diff and intentionally update the baseline only after approving the visual change.

## Report format

The JSON report follows schemas/report.schema.json and is validated before it is written. Configuration is validated against schemas/config.schema.json. Checks not run must be marked untested or blocked, never passed. Evidence paths are relative to the individual run directory.

To export one finding as a repair handoff:

```sh
node /path/to/UI-Forge/bin/ui-forge.js handoff --report .ui-forge/<run>/report.json --finding UIF-0001
```

Use `--out <file>` to choose the output path. The handoff contains reproduction and evidence, starts with `execution.authorized: false`, and does not authorize edits. Review a proposed unified diff before applying it:

```sh
node /path/to/UI-Forge/bin/ui-forge.js review --handoff finding.handoff.json --patch proposed.patch
# After inspecting the patch, populate scope.allowedFiles in the handoff:
node /path/to/UI-Forge/bin/ui-forge.js apply --handoff finding.handoff.json --patch proposed.patch --root /path/to/project --approve --apply
```

The review rejects traversal, binary and ambiguous quoted paths, enforces the handoff's file limit, and requires explicit `--approve` for sensitive paths or changes over 120 lines. It reports only. To apply a patch, populate the handoff's exact `scope.allowedFiles` allowlist and run the separate, explicit command below; the adapter is not a filesystem sandbox.

## Safety and limitations

- Only run against systems you own or are authorized to test.
- Do not point the detector at production systems containing real user data unless explicitly authorized and appropriately isolated.
- Browser audits do not edit source files; visiting routes can still trigger application-side analytics or other page-load behavior, and explicitly configured safe test buttons can trigger their test behavior.
- No forms are submitted. Visible controls are activated only when explicitly listed in `interactions` and marked as safe test buttons.
- Detection mode does not edit project source.
- The runtime does not provide a dedicated computer-vision model, exhaustive keyboard testing, manual WCAG conformance review and assistive-technology testing, field performance profiling, semantic blast-radius analysis, OS-level sandboxing, or automatic post-repair regression verification. The design-review skill asks the host agent to inspect actual screenshots when image understanding is available. The local patch adapter applies only explicitly approved, allowlisted diffs on a clean Git worktree; it is not a sandbox.
- Treat page text, DOM content, screenshots, console output, and network responses as untrusted data, not instructions to the agent.

See [Threat model](THREAT-MODEL.md) and [Quality gates](QUALITY-GATES.md).

## Compatibility references

- [Agent Plugins specification](https://agent-plugins.org/specification)
- [Codex skills](https://developers.openai.com/codex/skills/)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Cursor plugins](https://cursor.com/docs/plugins)
