import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function createRunId(date = new Date()) {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

export function createReport({ runId, startedAt, environment, routes, viewports }) {
  return {
    schemaVersion: "1.0", runId, mode: "detect", startedAt, environment,
    coverage: { routesTested: routes, viewportsTested: viewports, checks: [] },
    findings: [], changedFiles: [], summary: ""
  };
}

export async function writeReport(report, outputDir) {
  const runDir = path.resolve(outputDir, report.runId);
  await mkdir(runDir, { recursive: true });
  const reportPath = path.join(runDir, "report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  return { runDir, reportPath };
}
