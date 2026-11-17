import { validateRepairScope } from "./repair-handoff.js";

function inspectCanonicalDiff(patch) {
  const lines = patch.trimEnd().split(/\r?\n/);
  const sections = [];
  let current = null;
  let valid = true;
  let changedLines = 0;

  const startHunk = line => {
    const match = line.match(/^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/);
    if (!match || current.oldHeader === null || current.newHeader === null) {
      valid = false;
      return;
    }
    current.hunks += 1;
    current.oldRemaining = match[1] === undefined ? 1 : Number(match[1]);
    current.newRemaining = match[2] === undefined ? 1 : Number(match[2]);
    current.inHunk = true;
  };

  const finishSection = () => {
    if (!current) return;
    const header = current.header.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (!header || current.oldHeader === null || current.newHeader === null || current.hunks === 0 ||
        current.oldRemaining !== 0 || current.newRemaining !== 0) {
      valid = false;
    } else {
      const oldPath = header[1];
      const newPath = header[2];
      const oldMatches = current.oldHeader === "/dev/null" || current.oldHeader === `a/${oldPath}`;
      const newMatches = current.newHeader === "/dev/null" || current.newHeader === `b/${newPath}`;
      if (!oldMatches || !newMatches ||
          (current.oldHeader === "/dev/null" && current.newHeader !== `b/${newPath}`) ||
          (current.newHeader === "/dev/null" && current.oldHeader !== `a/${oldPath}`) ||
          (current.oldHeader === "/dev/null" && current.newHeader === "/dev/null")) {
        valid = false;
      }
    }
    current = null;
  };

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      finishSection();
      current = {
        header: line,
        oldHeader: null,
        newHeader: null,
        hunks: 0,
        oldRemaining: 0,
        newRemaining: 0,
        inHunk: false
      };
      sections.push(current);
      continue;
    }
    if (!current) {
      if (line.trim()) valid = false;
      continue;
    }

    if (!current.inHunk) {
      if (line.startsWith("--- ")) {
        if (current.oldHeader !== null) valid = false;
        current.oldHeader = line.slice(4);
      } else if (line.startsWith("+++ ")) {
        if (current.newHeader !== null) valid = false;
        current.newHeader = line.slice(4);
      } else if (line.startsWith("@@ ")) {
        startHunk(line);
      } else if (line.trim() && !line.startsWith("index ")) {
        valid = false;
      }
      continue;
    }

    if (current.oldRemaining === 0 && current.newRemaining === 0) {
      if (line.startsWith("@@ ")) {
        startHunk(line);
      } else if (line !== "\\ No newline at end of file") {
        valid = false;
      }
      continue;
    }

    if (line.startsWith(" ")) {
      current.oldRemaining -= 1;
      current.newRemaining -= 1;
    } else if (line.startsWith("-")) {
      current.oldRemaining -= 1;
      changedLines += 1;
    } else if (line.startsWith("+")) {
      current.newRemaining -= 1;
      changedLines += 1;
    } else if (line !== "\\ No newline at end of file") {
      valid = false;
    }
    if (current.oldRemaining < 0 || current.newRemaining < 0) valid = false;
  }

  finishSection();
  return { valid: valid && sections.length > 0, sections, changedLines };
}

export function reviewRepairPatch(handoff, patch, options = {}) {
  if (!handoff || handoff.kind !== "ui-forge-repair-handoff") {
    throw new TypeError("A valid UI-Forge repair handoff is required.");
  }
  if (typeof patch !== "string" || !patch.trim()) {
    throw new TypeError("A non-empty unified git diff is required.");
  }
  const approvalGranted = options.approvalGranted === true;
  const maxChangedLines = Number.isInteger(options.maxChangedLines) && options.maxChangedLines > 0
    ? options.maxChangedLines : 120;
  const headers = [...patch.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)];
  const canonicalDiff = inspectCanonicalDiff(patch);
  const files = [...new Set(headers.flatMap(match => [match[1], match[2]]))];
  const binary = /^(?:GIT binary patch|Binary files .+ and .+ differ)$/m.test(patch);
  const renameOrCopy = /^(?:rename|copy) (?:from|to) /m.test(patch);
  const modeChanges = /^(?:old mode|new mode|new file mode|deleted file mode) /m.test(patch);
  const quotedPaths = headers.some(match => match[1].startsWith('"') || match[2].startsWith('"'));
  const backslashPaths = headers.some(match => match[1].includes(String.fromCharCode(92)) || match[2].includes(String.fromCharCode(92)));
  const changedLines = canonicalDiff.changedLines;
  const scopedHandoff = {
    ...handoff,
    approval: { ...handoff.approval, granted: approvalGranted }
  };
  const scope = validateRepairScope(scopedHandoff, files);
  const oversized = changedLines > maxChangedLines;
  const approvalRequired = scope.approvalRequired || oversized;
  const accepted = headers.length > 0 && canonicalDiff.valid && canonicalDiff.sections.length === headers.length &&
    !quotedPaths && !backslashPaths && !binary && !renameOrCopy && !modeChanges &&
    scope.unsafePaths.length === 0 && !scope.exceedsLimit &&
    (!approvalRequired || approvalGranted);
  return {
    accepted,
    files,
    changedLines,
    maxChangedLines,
    binary,
    oversized,
    approvalRequired,
    approvalGranted,
    unsafePaths: scope.unsafePaths,
    sensitivePaths: scope.sensitivePaths,
    exceedsFileLimit: scope.exceedsLimit,
    reasons: [
      ...(headers.length ? [] : ["No unified git diff file headers found."]),
      ...(!canonicalDiff.valid || canonicalDiff.sections.length !== headers.length
        ? ["Patch contains malformed or additional unified-diff file sections; only canonical git diff sections are supported."] : []),
      ...(binary ? ["Binary patches are not supported by this review adapter."] : []),
      ...(renameOrCopy ? ["File rename and copy patches are not supported."] : []),
      ...(modeChanges ? ["File mode and symlink mode changes are not supported."] : []),
      ...(quotedPaths ? ["Quoted or escaped diff paths are not supported; inspect the patch manually."] : []),
      ...(backslashPaths ? ["Backslash diff paths are not supported; use normalized repository-relative paths."] : []),
      ...(scope.unsafePaths.length ? ["Patch contains unsafe absolute or traversal paths."] : []),
      ...(scope.sensitivePaths.length && !approvalGranted ? ["Sensitive paths require explicit approval."] : []),
      ...(scope.exceedsLimit ? ["Patch exceeds the handoff file-count limit."] : []),
      ...(oversized ? [`Patch changes ${changedLines} lines; limit is ${maxChangedLines}. Broad patches require a separate review and approval.`] : [])
    ]
  };
}
