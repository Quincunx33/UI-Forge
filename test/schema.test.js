import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateConfigSchema, validateReportSchema } from "../src/schema.js";

test("example config satisfies the published configuration schema", async () => {
  const config = JSON.parse(await readFile(new URL("../ui-forge.config.example.json", import.meta.url), "utf8"));
  const result = await validateConfigSchema(config);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("a complete empty audit report satisfies the report schema", async () => {
  const now = new Date().toISOString();
  const report = {
    schemaVersion: "1.0", runId: "test-run", mode: "detect",
    startedAt: now, completedAt: now,
    environment: { project: "fixture", framework: null, baseUrl: "http://localhost:3000", browser: "chromium", commit: null },
    coverage: { routesTested: ["/"], viewportsTested: ["mobile"], checks: [{ name: "navigation", status: "passed" }] },
    findings: [], changedFiles: [], summary: "No source files changed."
  };
  const result = await validateReportSchema(report);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("report schema rejects an unknown finding severity", async () => {
  const now = new Date().toISOString();
  const report = {
    schemaVersion: "1.0", runId: "bad", mode: "detect", startedAt: now,
    environment: { project: "fixture" },
    coverage: { routesTested: [], viewportsTested: [], checks: [] },
    findings: [{ id: "X", category: "visual", severity: "catastrophic", confidence: "high", title: "Bad severity", status: "verified" }]
  };
  const result = await validateReportSchema(report);
  assert.equal(result.valid, false);
});
