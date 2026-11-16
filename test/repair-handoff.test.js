import test from "node:test";
import assert from "node:assert/strict";
import { buildRepairHandoff, isSensitivePath, validateRepairScope } from "../src/repair-handoff.js";

const report = {
  schemaVersion: "1.0", runId: "run-1",
  findings: [{
    id: "UIF-0001", category: "responsive", severity: "medium", confidence: "high",
    title: "Horizontal overflow", impact: "Content exceeds viewport",
    route: "/", viewport: "mobile", reproduction: ["Open /"],
    evidence: ["screenshots/mobile.png"], status: "verified"
  }]
};

test("creates a non-authorizing repair handoff from a verified finding", () => {
  const handoff = buildRepairHandoff(report, "UIF-0001");
  assert.equal(handoff.kind, "ui-forge-repair-handoff");
  assert.equal(handoff.execution.authorized, false);
  assert.equal(handoff.approval.granted, false);
  assert.equal(handoff.finding.id, "UIF-0001");
});

test("refuses untested and missing findings", () => {
  assert.throws(() => buildRepairHandoff({ findings: [{ id: "x", status: "untested" }] }, "x"), /cannot be handed/);
  assert.throws(() => buildRepairHandoff(report, "missing"), /not found/);
});

test("detects sensitive paths and requires approval", () => {
  assert.equal(isSensitivePath(".env.production"), true);
  assert.equal(isSensitivePath("src/components/Header.jsx"), false);
  const handoff = buildRepairHandoff({
    ...report, findings: [{ ...report.findings[0], impact: "This touches authentication and personal data." }]
  }, "UIF-0001");
  assert.equal(handoff.approval.required, true);
  assert.equal(validateRepairScope(handoff, ["src/Header.jsx"]).allowed, false);
  handoff.approval.granted = true;
  assert.equal(validateRepairScope(handoff, ["src/Header.jsx"]).allowed, true);
});

test("rejects traversal, absolute paths, sensitive files and oversized scopes", () => {
  const handoff = buildRepairHandoff(report, "UIF-0001");
  assert.equal(validateRepairScope(handoff, ["../outside.js"]).allowed, false);
  assert.equal(validateRepairScope(handoff, ["/etc/passwd"]).allowed, false);
  const sensitive = validateRepairScope(handoff, [".github/workflows/ci.yml"]);
  assert.equal(sensitive.allowed, false);
  assert.equal(sensitive.approvalRequired, true);
  handoff.approval.granted = true;
  assert.equal(validateRepairScope(handoff, [".github/workflows/ci.yml"]).allowed, true);
  assert.equal(validateRepairScope(handoff, ["C:\\\\outside\\\\file.js"]).allowed, false);
  assert.equal(validateRepairScope(handoff, ["a.js", "b.js", "c.js", "d.js"]).allowed, false);
});
