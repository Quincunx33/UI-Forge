import { validateRepairScope } from "./repair-handoff.js";

export function reviewRepairPatch(handoff, patch, options = {}) {
  if (!handoff || handoff.kind !== "ui-forge-repair-handoff") {
    throw new TypeError("A valid UI-Forge repair handoff is required.");
  }
  if (typeof patch !== "string" || !patch.trim()) {
    throw new TypeError("A non-empty unified git diff is required.");
  }
  const approvalGranted = options.approvalGranted === true || handoff.approval?.granted === true;
  const maxChangedLines = Number.isInteger(options.maxChangedLines) && options.maxChangedLines > 0
    ? options.maxChangedLines : 120;
  const headers = [...patch.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)];
  const files = [...new Set(headers.flatMap(match => [match[1], match[2]]))];
  const binary = /^(?:GIT binary patch|Binary files .+ and .+ differ)$/m.test(patch);
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
  const accepted = headers.length > 0 && !binary &&
    scope.unsafePaths.length === 0 && !scope.exceedsLimit &&
    (!approvalRequired || approvalGranted) &&
    changedLines <= maxChangedLines;
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
      ...(scope.unsafePaths.length ? ["Patch contains unsafe absolute or traversal paths."] : []),
      ...(scope.sensitivePaths.length && !approvalGranted ? ["Sensitive paths require explicit approval."] : []),
      ...(scope.exceedsLimit ? ["Patch exceeds the handoff file-count limit."] : []),
      ...(oversized ? [`Patch changes ${changedLines} lines; limit is ${maxChangedLines}. Broad patches require a separate review and approval.`] : [])
    ]
  };
}
