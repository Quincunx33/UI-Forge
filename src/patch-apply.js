import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { reviewRepairPatch } from "./patch-review.js";

const execFileAsync = promisify(execFile);

export async function applyReviewedPatch({ handoff, patch, root, approved, applyConfirmed }) {
  if (approved !== true || applyConfirmed !== true) {
    throw new Error("Applying a patch requires both explicit approval and --apply confirmation.");
  }
  if (!handoff?.scope || !Array.isArray(handoff.scope.allowedFiles) || handoff.scope.allowedFiles.length === 0) {
    throw new Error("Handoff scope.allowedFiles must contain the exact files inspected and approved for this repair.");
  }
  const review = reviewRepairPatch(handoff, patch, { approvalGranted: true });
  if (!review.accepted) throw new Error("Patch review rejected: " + review.reasons.join(" "));
  const allowed = new Set(handoff.scope.allowedFiles);
  const forbidden = new Set(handoff.scope.forbiddenFiles ?? []);
  const unexpected = review.files.filter(file => !allowed.has(file) || forbidden.has(file));
  if (unexpected.length) throw new Error("Patch contains files outside the explicit handoff allowlist: " + unexpected.join(", "));
  const requestedRoot = path.resolve(root ?? process.cwd());
  const { stdout: gitRootOutput } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], { cwd: requestedRoot });
  const gitRoot = path.resolve(gitRootOutput.trim());
  if (gitRoot !== requestedRoot) throw new Error("Run patch application from the exact Git repository root.");
  const { stdout: status } = await execFileAsync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: gitRoot });
  if (status.trim()) throw new Error("Refusing to apply a repair patch while the Git working tree is not clean. Commit or stash existing work first.");
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ui-forge-patch-"));
  const patchPath = path.join(tempDir, "reviewed.patch");
  try {
    await writeFile(patchPath, patch, { encoding: "utf8", flag: "wx" });
    await execFileAsync("git", ["apply", "--check", "--whitespace=error", patchPath], { cwd: gitRoot, maxBuffer: 1024 * 1024 });
    await execFileAsync("git", ["apply", "--whitespace=error", patchPath], { cwd: gitRoot, maxBuffer: 1024 * 1024 });
    const { stdout: changed } = await execFileAsync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: gitRoot });
    const changedPaths = changed.split("\\n").filter(Boolean).map(line => line.slice(3).replace(/^"(.*)"$/, "$1"));
    const unexpectedChanges = changedPaths.filter(file => !allowed.has(file));
    if (unexpectedChanges.length) {
      throw new Error("Applied patch produced paths outside the approved allowlist: " + unexpectedChanges.join(", ") + ". Inspect the working tree immediately.");
    }
    return { applied: true, root: gitRoot, files: review.files, changedPaths };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
