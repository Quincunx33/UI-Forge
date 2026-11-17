import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { installSkills, resolveSkillTargets } from "../src/install.js";

test("maps agent names to their documented project skill directories", () => {
  const root = "/workspace/project";
  assert.deepEqual(resolveSkillTargets("codex", "project", root), [path.join(root, ".agents/skills")]);
  assert.deepEqual(resolveSkillTargets("claude", "project", root), [path.join(root, ".claude/skills")]);
  assert.deepEqual(resolveSkillTargets("cursor", "project", root), [path.join(root, ".cursor/skills")]);
  assert.deepEqual(resolveSkillTargets("all", "project", root), [
    path.join(root, ".agents/skills"), path.join(root, ".claude/skills"), path.join(root, ".cursor/skills")
  ]);
});

test("rejects unknown agents and scopes", () => {
  assert.throws(() => resolveSkillTargets("unknown"), /agent must be/);
  assert.throws(() => resolveSkillTargets("codex", "global"), /scope must be/);
});

test("installs skills and refuses to overwrite without force", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "ui-forge-install-"));
  try {
    const result = await installSkills({ agent: "codex", cwd });
    assert.equal(result.skills.length, 5);
    assert.ok(result.skills.includes("ui-create"));
    const createSkill = path.join(cwd, ".agents/skills/ui-create/SKILL.md");
    assert.match(await readFile(createSkill, "utf8"), /Frontend Design & Creation/);
    assert.ok(result.skills.includes("ui-forge"));
    const universal = path.join(cwd, ".agents/skills/ui-forge/SKILL.md");
    assert.match(await readFile(universal, "utf8"), /Universal Frontend Design & Engineering/);
    const installed = path.join(cwd, ".agents/skills/ui-detect/SKILL.md");
    const original = await readFile(installed, "utf8");
    assert.match(original, /UI-Forge: UI Detection/);
    await assert.rejects(
      installSkills({ agent: "codex", cwd }),
      /Existing skills were found/
    );
    await installSkills({ agent: "codex", cwd, force: true });
    assert.equal(await readFile(installed, "utf8"), original);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
