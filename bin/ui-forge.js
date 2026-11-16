#!/usr/bin/env node
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { loadConfig } from "../src/config.js";
import { runBrowserAudit } from "../src/audit.js";
import { createReport, createRunId, writeReport } from "../src/report.js";
import { validateReportSchema } from "../src/schema.js";
import { installSkills } from "../src/install.js";
import { buildRepairHandoff } from "../src/repair-handoff.js";
import { reviewRepairPatch } from "../src/patch-review.js";
import { applyReviewedPatch } from "../src/patch-apply.js";

function help() {
  process.stdout.write(
    "UI-Forge — UI quality engineering plugin\n\n" +
    "Usage:\n" +
    "  ui-forge install --agent <codex|claude|cursor|all> [--scope project|user] [--target <dir>] [--force]\n" +
    "  ui-forge detect --config <file>\n" +
    "  ui-forge handoff --report <report.json> --finding <UIF-ID> [--out <file>]\n" +
    "  ui-forge review --handoff <file> --patch <diff.patch> [--approve]\n" +
    "  ui-forge apply --handoff <file> --patch <diff.patch> --root <repo> --approve --apply\n\n" +
    "Options:\n" +
    "  --config <file>   Path to UI-Forge JSON configuration\n" +
    "  --agent <name>    Target coding agent for skill installation\n" +
    "  --scope <scope>   project (default) or user\n" +
    "  --target <dir>    Project directory for installation (default: current directory)\n" +
    "  --force           Replace existing UI-Forge skill folders\n" +
    "  --approve         Explicitly approve patch application after review\n" +
    "  --apply           Confirm actual patch application (required with --approve)\n" +
    "  --help            Show this help\n\n" +
    "Detection is read-only. Start your local app separately before running an audit.\n" +
    "A repair handoff packages evidence; it never authorizes edits.\n"
  );
}

async function main(args) {
  const command = args[0];
  if (!command || command === "--help" || command === "help") return help();

  if (command === "install") {
    const agentIndex = args.indexOf("--agent");
    if (agentIndex < 0 || !args[agentIndex + 1]) throw new Error("install requires --agent codex|claude|cursor|all.");
    const scopeIndex = args.indexOf("--scope");
    const scope = scopeIndex >= 0 ? args[scopeIndex + 1] : "project";
    const targetIndex = args.indexOf("--target");
    if (targetIndex >= 0 && !args[targetIndex + 1]) throw new Error("--target requires a directory path.");
    const target = targetIndex >= 0 ? path.resolve(args[targetIndex + 1]) : process.cwd();
    const result = await installSkills({ agent: args[agentIndex + 1], scope, force: args.includes("--force"), cwd: target });
    process.stdout.write("Installed UI-Forge skills: " + result.skills.join(", ") + "\nTargets: " + result.targets.join(", ") + "\n");
    return;
  }

  if (command === "review") {
    const handoffIndex = args.indexOf("--handoff");
    const patchIndex = args.indexOf("--patch");
    if (handoffIndex < 0 || !args[handoffIndex + 1] || patchIndex < 0 || !args[patchIndex + 1]) {
      throw new Error("review requires --handoff <file> and --patch <diff.patch>.");
    }
    const handoff = JSON.parse(await readFile(path.resolve(args[handoffIndex + 1]), "utf8"));
    const patch = await readFile(path.resolve(args[patchIndex + 1]), "utf8");
    const review = reviewRepairPatch(handoff, patch, { approvalGranted: args.includes("--approve") });
    process.stdout.write(JSON.stringify(review, null, 2) + "\n");
    if (!review.accepted) process.exitCode = 2;
    return;
  }

  if (command === "apply") {
    const handoffIndex = args.indexOf("--handoff");
    const patchIndex = args.indexOf("--patch");
    const rootIndex = args.indexOf("--root");
    if (handoffIndex < 0 || !args[handoffIndex + 1] || patchIndex < 0 || !args[patchIndex + 1]) {
      throw new Error("apply requires --handoff <file> and --patch <diff.patch>.");
    }
    if (rootIndex < 0 || !args[rootIndex + 1]) throw new Error("apply requires --root <Git repository root>.");
    const handoff = JSON.parse(await readFile(path.resolve(args[handoffIndex + 1]), "utf8"));
    const patch = await readFile(path.resolve(args[patchIndex + 1]), "utf8");
    const result = await applyReviewedPatch({
      handoff, patch,
      root: rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : process.cwd(),
      approved: args.includes("--approve"),
      applyConfirmed: args.includes("--apply")
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  if (command === "handoff") {
    const reportIndex = args.indexOf("--report");
    const findingIndex = args.indexOf("--finding");
    const outputIndex = args.indexOf("--out");
    if (reportIndex < 0 || !args[reportIndex + 1] || findingIndex < 0 || !args[findingIndex + 1]) {
      throw new Error("handoff requires --report <report.json> and --finding <UIF-ID>.");
    }
    if (outputIndex >= 0 && !args[outputIndex + 1]) throw new Error("--out requires a file path.");
    const reportPath = path.resolve(args[reportIndex + 1]);
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    const validation = await validateReportSchema(report);
    if (!validation.valid) throw new Error("Input report failed schema validation: " + JSON.stringify(validation.errors));
    const handoff = buildRepairHandoff(report, args[findingIndex + 1]);
    const outputPath = outputIndex >= 0
      ? path.resolve(args[outputIndex + 1])
      : reportPath.replace(/\.json$/i, "") + "." + args[findingIndex + 1] + ".handoff.json";
    await writeFile(outputPath, JSON.stringify(handoff, null, 2) + "\n", { flag: "wx" });
    process.stdout.write("Repair handoff created (not authorization): " + outputPath + "\n");
    return;
  }

  if (command !== "detect") throw new Error("Unknown command: " + command + ". Available commands: install, detect, handoff, review, apply.");
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
    environment: {
      project: path.basename(process.cwd()), framework: null, baseUrl: config.baseUrl,
      browser: config.browser.engine, commit: process.env.GITHUB_SHA ?? null
    },
    routes: config.routes, viewports: config.viewports.map(item => item.name)
  });
  await runBrowserAudit(config, report, path.join(output, runId));
  report.completedAt = new Date().toISOString();
  const validation = await validateReportSchema(report);
  if (!validation.valid) throw new Error("Generated report failed schema validation: " + JSON.stringify(validation.errors));
  report.summary = report.findings.length + " finding(s); " + report.coverage.checks.length +
    " check(s) recorded. No project source files were modified.";
  const saved = await writeReport(report, output);
  process.stdout.write("UI-Forge audit complete\nFindings: " + report.findings.length + "\nReport: " + saved.reportPath + "\n");
  if (report.findings.some(item => ["critical", "high"].includes(item.severity))) process.exitCode = 2;
}

main(process.argv.slice(2)).catch(error => {
  process.stderr.write("UI-Forge: " + error.message + "\n");
  process.exitCode = 1;
});
