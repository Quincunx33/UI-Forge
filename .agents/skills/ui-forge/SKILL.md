---
name: ui-forge
description: Universal UI engineering workflow for evidence-based inspection, design review, controlled repair, and regression verification.
---

# UI-Forge Skill Entry Point

The canonical, full UI-Forge skill is maintained at `skills/ui-forge/SKILL.md`.

Before handling a UI/frontend task, read that file and follow its complete workflow. It defines the portable behavior shared by Google AI Studio Agent Playground, Codex, Claude Code, Cursor, and other AI assistants.

Then load the focused workflow when relevant:
- `skills/ui-detect/SKILL.md` for read-only detection.
- `skills/ui-design-review/SKILL.md` for read-only visual critique.
- `skills/ui-repair/SKILL.md` for explicitly authorized repair.

Do not duplicate or override the canonical instructions here. Adapt tool usage to the host environment and report unavailable checks as untested.
