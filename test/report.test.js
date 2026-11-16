import test from "node:test";
import assert from "node:assert/strict";
import { createReport, createRunId } from "../src/report.js";

test("creates an ISO-compatible run identifier", () => {
  assert.equal(createRunId(new Date("2026-01-02T03:04:05.000Z")), "2026-01-02T03-04-05-000Z");
});
test("creates report with detection-only defaults and coverage", () => {
  const report = createReport({ runId: "run-1", startedAt: "2026-01-01T00:00:00.000Z", environment: { project: "sample" }, routes: ["/"], viewports: ["mobile"] });
  assert.equal(report.mode, "detect");
  assert.deepEqual(report.coverage.routesTested, ["/"]);
  assert.deepEqual(report.changedFiles, []);
  assert.deepEqual(report.findings, []);
});
