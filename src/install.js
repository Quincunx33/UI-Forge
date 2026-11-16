import { access, cp, mkdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillNames = ["ui-detect", "ui-design-review", "ui-repair"];

export function resolveSkillTargets(agent, scope = "project", cwd = process.cwd(), home = os.homedir()) {
  const locations = {
    codex: [".agents/skills"],
    claude: [".claude/skills"],
    cursor: [".cursor/skills"],
    all: [".agents/skills", ".claude/skills"]
  };
  if (!locations[agent]) throw new Error("agent must be codex, claude, cursor, or all.");
  if (!["project", "user"].includes(scope)) throw new Error("scope must be project or user.");
  const base = scope === "user" ? home : cwd;
  return locations[agent].map(location => path.join(base, location));
}

export async function installSkills({ agent, scope = "project", force = false, cwd = process.cwd(), home = os.homedir() }) {
  const targets = resolveSkillTargets(agent, scope, cwd, home);
  const conflicts = [];
  for (const target of targets) {
    for (const name of skillNames) {
      try { await access(path.join(target, name)); conflicts.push(path.join(target, name)); }
      catch { /* target skill does not exist */ }
    }
  }
  if (conflicts.length && !force) {
    throw new Error("Existing skills were found; nothing was installed. Re-run with --force to replace only these UI-Forge skill folders: " + conflicts.join(", "));
  }
  for (const target of targets) {
    await mkdir(target, { recursive: true });
    for (const name of skillNames) {
      await cp(path.join(root, "skills", name), path.join(target, name), { recursive: true, force, errorOnExist: !force });
    }
  }
  return { targets, skills: skillNames };
}
