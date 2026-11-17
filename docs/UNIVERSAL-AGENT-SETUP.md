# Universal AI agent setup

UI-Forge uses one portable workflow with host-specific entry points. The workflow is shared; tool availability and invocation syntax depend on the AI environment.

## Supported entry points

| Environment | Entry point | How it works |
|---|---|---|
| Google AI Studio Agent Playground | `.agents/AGENTS.md` + `.agents/skills/ui-forge/SKILL.md` | Mount/import the repository files into the agent workspace; the Playground can discover `AGENTS.md` and `SKILL.md` files. |
| Google AI Studio Build Mode | `adapters/google-ai-studio/SYSTEM_INSTRUCTIONS.md` | Paste the instructions into the app's System Instructions / Custom Instructions, import the project, then explicitly ask the agent to apply them. |
| Codex | `AGENTS.md` + `.agents/skills/ui-forge/SKILL.md` | Project instructions plus the native skill directory. |
| Claude Code | `skills/ui-forge/SKILL.md` plus existing plugin skills | Install the plugin or copy the standalone skills into the Claude skill directory. |
| Cursor | `skills/ui-forge/SKILL.md` plus existing plugin skills | Import the plugin or copy the standalone skills into the Cursor skill directory. |
| Other AI assistants | `AGENTS.md` + `.agents/skills/ui-forge/SKILL.md` | Attach or paste the files as project instructions/context. Adapt commands to tools that actually exist. |

## Google AI Studio Agent Playground

1. Import or mount the UI-Forge repository as the agent's workspace.
2. Ensure `.agents/AGENTS.md` and `.agents/skills/ui-forge/SKILL.md` are present.
3. Start a task such as: `Use UI-Forge to inspect the mobile layout and report verified defects. Do not edit files.`
4. For a repair, explicitly request the fix. The agent must follow the approval and verification rules in the skill.

The Agent Playground's supported skill discovery is different from Build Mode's System Instructions field; do not assume that adding a skill file automatically configures every AI Studio surface.

## Google AI Studio Build Mode

1. Import the repository using Build Mode's GitHub import or add the relevant instruction files to the project.
2. Open Settings and locate System Instructions / Custom Instructions.
3. Paste the contents of `adapters/google-ai-studio/SYSTEM_INSTRUCTIONS.md`.
4. Send a separate prompt asking the agent to apply those instructions to the current project and inspect the existing UI before changing anything.
5. Keep the instruction file in the repository so it can be reused in later sessions.

Build Mode instructions guide the agent; they do not themselves run a UI audit. The agent still needs access to the relevant project files and preview/testing capabilities.

## Codex

Keep the root `AGENTS.md` and `.agents/skills/ui-forge/SKILL.md` in the project. The existing installer also supports installing the focused `ui-detect`, `ui-design-review`, and `ui-repair` skills into Codex, Claude Code, and Cursor directories.

## Any other AI

Provide both the root `AGENTS.md` and `.agents/skills/ui-forge/SKILL.md` as context. If the host supports reusable skills, install the skill using its native mechanism. Otherwise, attach the Markdown files to the conversation or paste the instructions into its project/system prompt.

Do not assume every AI has shell access, a browser, screenshot understanding, or file editing. The agent must discover its available tools and mark unavailable checks as untested.

## Example requests

- `Audit the UI at mobile and desktop sizes. Report evidence only; do not edit files.`
- `Review the visual hierarchy and spacing. Keep the current design direction and do not modify source.`
- `Fix the verified navigation overflow with the smallest change, then run regression checks.`
- `Verify this UI change against the original issue and report any regressions. Do not make further edits.`
