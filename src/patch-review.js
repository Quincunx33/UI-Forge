import { validateRepairScope } from "./repair-handoff.js";

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
  const files = [...new Set(headers.flatMap(match => [match[1], match[2]]))];
  const binary = /^(?:GIT binary patch|Binary files .+ and .+ differ)$/m.test(patch);
  const renameOrCopy = /^(?:rename|copy) (?:from|to) /m.test(patch);
  const modeChanges = /^(?:old mode|new mode|new file mode|deleted file mode) /m.test(patch);
  const quotedPaths = headers.some(match => match[1].startsWith('"') || match[2].startsWith('"'));
  const backslashPaths = headers.some(match => match[1].includes(String.fromCharCode(92)) || match[2].includes(String.fromCharCode(92)));
  const changedLines = patch.split("\n").filter(line =>
    (line.startsWith("+") && !line.startsWith("+++")) ||
    (line.startsWith("-") && !line.startsWith("---"))
  ).length;
  const scopedHandoff = {
    ...handoff,
    approval: { ...handoff.approval, granted: approvalGranted }
  };
  const scope = validateRepairScope(scopedHandoff, files);
  const oversized = changedLines > maxChangedLines;
  const approvalRequired = scope.approvalRequired || oversized;
  const accepted = headers.length > 0 && !quotedPaths && !backslashPaths && !binary && !renameOrCopy && !modeChanges &&
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
