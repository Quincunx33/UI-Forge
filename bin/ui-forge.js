#!/usr/bin/env node
import path from "node:path";
import { loadConfig } from "../src/config.js";
import { runBrowserAudit } from "../src/audit.js";
import { createReport, createRunId, writeReport } from "../src/report.js";
import { validateReportSchema } from "../src/schema.js";

function help() {
  process.stdout.write("UI-Forge — UI quality audit\n\nUsage:\n  ui-forge detect --config <file>\n\nOptions:\n  --config <file>   Path to UI-Forge JSON configuration\n  --help            Show this help\n\nDetection is read-only. Start your local app separately before running an audit.\n");
}

async function main(args) {
  const command = args[0];
  if (!command || command === "--help" || command === "help") return help();
  if (command !== "detect") throw new Error(`Unknown command: ${command}. Available command: detect.`);
  const configIndex = args.indexOf("--config");
  if (configIndex < 0 || !args[configIndex + 1]) throw new Error("detect requires --config <file>.");
  const configPath = path.resolve(args[configIndex + 1]);
  const config = await loadConfig(configPath);
  if (config.mode !== "detect") throw new Error("The browser runtime currently supports mode=detect only. Repair remains an agent-invoked workflow.");
  const started = new Date();
  const runId = createRunId(started);
  const output = path.resolve(path.dirname(configPath), config.outputDir);
  const report = createReport({
    runId, startedAt: started.toISOString(),
    environment: { project: path.basename(process.cwd()), framework: null, baseUrl: config.baseUrl, browser: config.browser.engine, commit: process.env.GITHUB_SHA ?? null },
    routes: config.routes, viewports: config.viewports.map(item => item.name)
  });
  await runBrowserAudit(config, report, path.join(output, runId));
  report.completedAt = new Date().toISOString();
  const validation = await validateReportSchema(report);
  if (!validation.valid) throw new Error("Generated report failed schema validation: " + JSON.stringify(validation.errors));
  report.summary = `${report.findings.length} finding(s); ${report.coverage.checks.length} check(s) recorded. No project source files were modified.`;
  const saved = await writeReport(report, output);
  process.stdout.write(`UI-Forge audit complete\nFindings: ${report.findings.length}\nReport: ${saved.reportPath}\n`);
  if (report.findings.some(item => ["critical", "high"].includes(item.severity))) process.exitCode = 2;
}

main(process.argv.slice(2)).catch(error => {
  process.stderr.write(`UI-Forge: ${error.message}\n`);
  process.exitCode = 1;
});
