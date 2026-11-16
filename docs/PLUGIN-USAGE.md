# Plugin usage and compatibility

## Package model

UI-Forge uses a vendor-neutral core package:
- `plugin.json` describes the plugin identity, capabilities, skill entry points, schemas, and safety defaults.
- `skills/*/SKILL.md` contains independently invocable agent skills.
- `schemas/` defines the configuration and report contracts.

This layout is the canonical source. Agent-specific wrappers should point to or package these same instructions rather than maintaining divergent copies.

## Skills

### ui-detect
Read-only inspection. It can inspect source and run safe tests, but must not edit project source, styles, tests, or dependencies.

### ui-design-review
Read-only visual critique. It must separate objective usability defects from subjective preferences.

### ui-repair
Editing workflow. Invoke only after the user explicitly asks for a repair. It must use evidence, make minimal changes, and verify the original issue and relevant regressions.

## Configuration

The JSON Schema is in [schemas/config.schema.json](../schemas/config.schema.json). A minimal configuration:

```json
{
  "mode": "detect",
  "routes": ["/"],
  "viewports": [
    { "name": "mobile", "width": 390, "height": 844 },
    { "name": "desktop", "width": 1440, "height": 900 }
  ],
  "outputDir": ".ui-forge"
}
```

Configuration is a contract for future runtime adapters; the current skills do not yet execute this configuration automatically.

## Report format

The report contract is in [schemas/report.schema.json](../schemas/report.schema.json). Findings must include severity, confidence, context, reproduction, evidence, and a truthful status. Checks that were not run must be marked `untested`.

## Agent compatibility

The core instructions are portable Markdown, but skill discovery paths differ by agent and version. Do not assume that placing this repository in a project automatically installs every skill. For each target agent, validate:
- its documented skill directory and frontmatter requirements;
- whether it supports project-local or user-global skills;
- how it grants browser, terminal, and file-edit permissions;
- how approval prompts and tool restrictions are represented.

Until those checks are completed, installation is manual: copy the relevant skill folder into the skill directory documented by your agent, then invoke the skill by name.

## Runtime status

This repository currently contains skill instructions and machine-readable contracts. It does **not** yet ship a browser automation executable, screenshot analyzer, visual regression runner, or autonomous patch executor. The skills must not claim those runtime features exist. Browser automation depends on the tools available to the connected coding agent until the dedicated runtime is implemented.
