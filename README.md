# UI-Forge

**Frontend creation, UI review, visual auditing, and controlled repair workflows for AI coding agents.**

UI-Forge is not a separate AI model. It is a portable set of agent skills plus a small CLI runtime. Your AI coding agent reads the skills and performs the implementation or review; the CLI runs repeatable browser audits, creates evidence reports, reviews patches, and applies explicitly approved changes.

## What UI-Forge does

UI-Forge supports this workflow:

```text
Create → Review → Detect → Repair → Verify
```

| Workflow | Use it for | Source editing |
|---|---|---|
| `ui-create` | Build a new frontend or implement a substantial redesign | Yes, when requested |
| `ui-design-review` | Review visual quality, UX, and responsive design | Never |
| `ui-detect` | Find and document verified UI defects | Never |
| `ui-repair` | Fix confirmed defects with the smallest safe change | Only when explicitly requested |
| `ui-forge` | Orchestrate the complete workflow across AI hosts | Depends on the selected mode |

## Requirements

- Node.js 20 or newer
- npm
- An AI coding agent such as Codex, Claude Code, Cursor, or another agent that can read project instructions
- Chromium for browser-based audits

## Quick start

### 1. Clone and install UI-Forge

```sh
git clone https://github.com/Quincunx33/UI-Forge.git
cd UI-Forge
npm install
npx playwright install chromium
```

### 2. Install the skills into your project

Replace `/path/to/your-project` with the project where you want to use UI-Forge:

```sh
node ./bin/ui-forge.js install \
  --agent all \
  --target /path/to/your-project
```

Install for one specific agent if needed:

```sh
# Codex
node ./bin/ui-forge.js install --agent codex --target /path/to/your-project

# Claude Code
node ./bin/ui-forge.js install --agent claude --target /path/to/your-project

# Cursor
node ./bin/ui-forge.js install --agent cursor --target /path/to/your-project
```

The installer places the skills in the project-level directories below:

```text
.agents/skills/       # Codex and compatible agents
.claude/skills/       # Claude Code
.cursor/skills/       # Cursor
```

Project scope is the default. Use `--scope user` for a personal user-level installation. Existing skill folders are not overwritten unless you explicitly add `--force`.

### 3. Open your project in the AI agent

Start the agent from the target project directory and ask it to use the appropriate UI-Forge workflow. For example:

```text
Use the UI-Forge ui-create workflow.

Build a polished, responsive project dashboard with a sidebar,
project cards, search, active/completed filters, and a create-project
dialog. Preserve the existing stack, make all interactions functional,
and verify the result at mobile and desktop sizes.
```

There is no `ui-forge create` CLI command. Frontend creation is performed by the AI coding agent using the `ui-create` skill and the host's coding, preview, and browser capabilities.

## Common agent prompts

### Create a frontend

```text
Use UI-Forge ui-create.
Build a responsive landing page for a design studio with an accessible
navigation menu, hero section, services, case studies, pricing, FAQ,
and a validated contact form. Inspect the rendered result before finishing
and run the available tests.
```

### Review without editing

```text
Use UI-Forge ui-design-review.
Review the current interface at mobile, tablet, and desktop sizes.
Do not edit files. Report visual hierarchy, spacing, typography, contrast,
responsive behavior, accessibility, and interaction issues with evidence.
```

### Detect defects without editing

```text
Use UI-Forge ui-detect.
Audit this application on mobile and desktop. Do not modify source files.
Report only verified issues with severity, reproduction steps, evidence,
and a suggested repair.
```

### Repair a confirmed issue

```text
Use UI-Forge ui-repair.
Fix only the verified mobile horizontal-overflow issue.
Preserve the existing design and behavior, make the smallest safe change,
and run the relevant regression and browser checks afterward.
```

## Run a browser audit

The CLI detector is read-only: it does not start or stop your app, submit forms, or edit source files.

### 1. Start your application separately

```sh
cd /path/to/your-project
npm run dev
```

Assume the app is available at `http://127.0.0.1:3000`.

### 2. Create a configuration file

```sh
cp /path/to/UI-Forge/ui-forge.config.example.json \
   /path/to/your-project/ui-forge.config.json
```

A minimal configuration looks like this:

```json
{
  "baseUrl": "http://127.0.0.1:3000",
  "routes": ["/", "/projects"],
  "viewports": [
    { "name": "mobile", "width": 390, "height": 844 },
    { "name": "desktop", "width": 1440, "height": 900 }
  ],
  "mode": "detect",
  "outputDir": ".ui-forge",
  "browser": {
    "engine": "chromium",
    "headless": true,
    "navigationTimeoutMs": 30000
  },
  "allowRemote": false
}
```

### 3. Run the detector

```sh
cd /path/to/your-project
node /path/to/UI-Forge/bin/ui-forge.js detect \
  --config ./ui-forge.config.json
```

The run writes a timestamped report and screenshots under `outputDir`:

```text
.ui-forge/
└── <run-id>/
    ├── report.json
    └── screenshots/
```

The detector can check route responses, navigation failures, same-origin route discovery, console errors, uncaught exceptions, failed requests, responsive overflow, clipped content, axe-core accessibility rules, reduced-motion behavior, first-Tab focus, layout-shift smoke signals, and selected lab performance signals.

Axe output and browser smoke checks are evidence for investigation, not a complete WCAG conformance claim. Unsupported or unavailable checks are reported as `untested`.

## Optional interaction checks

Interaction checks are opt-in. Only project-owned, side-effect-safe buttons marked with `data-ui-forge-safe="true"` are eligible.

```html
<button
  type="button"
  data-testid="open-settings"
  data-ui-forge-safe="true">
  Open settings
</button>
```

```json
{
  "interactions": [
    {
      "name": "open-settings-panel",
      "testId": "open-settings",
      "route": "/",
      "expectedText": "Settings"
    }
  ]
}
```

Forms are not submitted. Unmarked controls are not clicked.

## Route discovery and visual regression

Route discovery is disabled by default. Enable bounded same-origin discovery explicitly:

```json
{
  "discovery": {
    "enabled": true,
    "maxRoutes": 20
  }
}
```

Visual regression is also opt-in and compares only against manually approved PNG baselines:

```json
{
  "visualRegression": {
    "enabled": true,
    "baselineDir": ".ui-forge-baselines",
    "threshold": 0.1,
    "maxDiffPixels": 0
  }
}
```

Missing baselines are marked `untested`. UI-Forge never creates or overwrites a baseline automatically.

## Controlled repair workflow

Create a handoff from a verified report finding:

```sh
node /path/to/UI-Forge/bin/ui-forge.js handoff \
  --report .ui-forge/<run-id>/report.json \
  --finding UIF-0001 \
  --out finding.handoff.json
```

Review a proposed unified diff before applying it:

```sh
node /path/to/UI-Forge/bin/ui-forge.js review \
  --handoff finding.handoff.json \
  --patch proposed.patch
```

After inspecting the result and filling the handoff's exact `scope.allowedFiles` list, apply it explicitly:

```sh
node /path/to/UI-Forge/bin/ui-forge.js apply \
  --handoff finding.handoff.json \
  --patch proposed.patch \
  --root /path/to/your-project \
  --approve \
  --apply
```

Application requires a clean Git working tree, an exact file allowlist, explicit approval, symlink checks, and a successful `git apply --check`. The adapter is a Git guard, not an OS-level sandbox.

## CLI reference

```text
ui-forge install --agent <codex|claude|cursor|all> [--scope project|user] [--target <dir>] [--force]
ui-forge detect --config <file>
ui-forge handoff --report <report.json> --finding <UIF-ID> [--out <file>]
ui-forge review --handoff <file> --patch <diff.patch> [--approve]
ui-forge apply --handoff <file> --patch <diff.patch> --root <repo> --approve --apply
```

## Verify UI-Forge itself

From the repository root:

```sh
npm install
npx playwright install chromium
npm test
npm run check
npm run test:browser
```

The repository's current quality gate includes 31 unit/schema/installer/repair/patch tests and 2 browser integration tests.

## Safety and limitations

- Run audits only against systems you own or are authorized to test.
- Loopback targets are the default. Remote targets require explicit `allowRemote: true`.
- Known cloud metadata hosts, embedded URL credentials, and cross-origin route escapes are blocked.
- Detection is read-only and does not modify project source.
- Browser checks are not a complete accessibility, security, performance, or visual-quality assessment.
- Manual review, assistive-technology testing, field performance profiling, exhaustive keyboard coverage, and full Core Web Vitals validation remain necessary where applicable.

See the detailed documentation:

- [Plugin usage](docs/PLUGIN-USAGE.md)
- [Universal AI agent setup](docs/UNIVERSAL-AGENT-SETUP.md)
- [Quality gates](docs/QUALITY-GATES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT-MODEL.md)
- [Roadmap](ROADMAP.md)
