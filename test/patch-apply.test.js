import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { applyReviewedPatch } from "../src/patch-apply.js";

const handoff = {
  kind: "ui-forge-repair-handoff",
  scope: { maxFiles: 3, allowedFiles: ["src/app.css"], forbiddenFiles: [] },
  approval: { required: false, granted: false }
};
const patch = [
  "diff --git a/src/app.css b/src/app.css",
  "--- a/src/app.css", "+++ b/src/app.css",
  "@@ -1 +1 @@", "-.app { width: 900px; }", "+.app { max-width: 100%; }"
].join("\\n");

async function makeRepo() {
  const root = await mkdtemp(path.join(os.tmpdir(), "ui-forge-apply-test-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "ui-forge-test@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "UI Forge Test"], { cwd: root });
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src/app.css"), ".app { width: 900px; }\\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  return root;
}

test("applies a reviewed patch only after explicit approval and confirmation", async () => {
  const root = await makeRepo();
  try {
    const result = await applyReviewedPatch({ handoff, patch, root, approved: true, applyConfirmed: true });
    assert.equal(result.applied, true);
    assert.deepEqual(result.files, ["src/app.css"]);
    assert.match(await readFile(path.join(root, "src/app.css"), "utf8"), /max-width: 100%/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("refuses implicit application and patches outside the handoff allowlist", async () => {
  const root = await makeRepo();
  try {
    await assert.rejects(
      applyReviewedPatch({ handoff, patch, root, approved: false, applyConfirmed: false }),
      /explicit approval/
    );
    const otherPatch = patch.replaceAll("src/app.css", "src/other.css");
    await assert.rejects(
      applyReviewedPatch({ handoff, patch: otherPatch, root, approved: true, applyConfirmed: true }),
      /allowlist/
    );
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("refuses to apply when the working tree is dirty", async () => {
  const root = await makeRepo();
  try {
    await writeFile(path.join(root, "uncommitted.txt"), "keep me");
    await assert.rejects(
      applyReviewedPatch({ handoff, patch, root, approved: true, applyConfirmed: true }),
      /working tree is not clean/
    );
  } finally { await rm(root, { recursive: true, force: true }); }
});
