import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runBrowserAudit } from "../src/audit.js";
import { createReport } from "../src/report.js";

test("browser audit captures responsive and accessibility findings", async () => {
  const html = `<!doctype html><html><head><style>
    body { margin: 0; } .wide { width: 700px; height: 20px; }
    @keyframes pulse { from { opacity: .5; } to { opacity: 1; } }
    .moving { animation: pulse 1s infinite; } .clipped { height: 8px; overflow: hidden; }
  </style></head><body>
    <div class="wide">overflow fixture</div>
    <button></button><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
    <a href="/empty"></a><a href="/discovered">Discovered route</a><a href="https://example.com/out">External</a><a href="/search?q=secret">Query route</a><a href="/icon.svg">Asset</a><div class="moving"></div><div class="clipped">content that is clipped by the fixture</div>
  </body></html>`;
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(html);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ui-forge-test-"));
  try {
    const report = createReport({
      runId: "browser-test", startedAt: new Date().toISOString(),
      environment: { project: "fixture", baseUrl: `http://127.0.0.1:${address.port}`, browser: "chromium" },
      routes: ["/"], viewports: ["mobile"]
    });
    await runBrowserAudit({
      baseUrl: `http://127.0.0.1:${address.port}`, routes: ["/"], discovery: { enabled: true, maxRoutes: 5 },
      viewports: [{ name: "mobile", width: 390, height: 844 }],
      browser: { engine: "chromium", headless: true, navigationTimeoutMs: 10000 }
    }, report, tempDir);
    assert.ok(report.coverage.routesTested.includes("/discovered"));
    assert.ok(!report.coverage.routesTested.includes("/search"));
    assert.ok(!report.coverage.routesTested.includes("/icon.svg"));
    assert.ok(!report.coverage.routesTested.includes("https://example.com/out"));
    assert.ok(report.coverage.checks.some(item => item.name === "route-discovery" && item.status === "passed"));
    const categories = report.findings.map(item => item.category);
    assert.ok(categories.includes("responsive"));
    assert.ok(categories.includes("accessibility"));
    assert.ok(categories.includes("motion"));
    assert.ok(report.findings.some(item => item.title === "Potentially clipped content detected"));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("axe-wcag-accessibility:")));
    assert.ok(report.findings.some(item => item.title === "Accessibility rule: image-alt"));
    assert.ok(report.findings.some(item => item.title === "Accessibility rule: button-name"));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("reduced-motion:")));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("keyboard-focus-indicator:")));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("ttfb-lab:")));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("lcp-lab:")));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("long-task-lab:")));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("resource-transfer-smoke:")));
    assert.ok(report.coverage.checks.length >= 8);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(tempDir, { recursive: true, force: true });
  }
});
