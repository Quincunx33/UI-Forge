import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm, mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";
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
    <button></button><button type="button" data-testid="safe-toggle" data-ui-forge-safe="true" onclick="document.querySelector('#result').textContent='Saved'">Run safe check</button><button type="button" data-testid="unsafe-toggle" onclick="document.querySelector('#result').textContent='Unsafe clicked'">Do not run</button><p id="result"></p><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
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
      interactions: [
        { name: "safe-toggle", testId: "safe-toggle", route: "/", expectedText: "Saved" },
        { name: "unsafe-toggle", testId: "unsafe-toggle", route: "/" }
      ],
      viewports: [{ name: "mobile", width: 390, height: 844 }],
      browser: { engine: "chromium", headless: true, navigationTimeoutMs: 10000 }
    }, report, tempDir);
    assert.ok(report.coverage.routesTested.includes("/discovered"));
    assert.ok(!report.coverage.routesTested.includes("/search"));
    assert.ok(!report.coverage.routesTested.includes("/icon.svg"));
    assert.ok(!report.coverage.routesTested.includes("https://example.com/out"));
    assert.ok(report.coverage.checks.some(item => item.name === "route-discovery" && item.status === "passed"));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("interaction:safe-toggle:") && item.status === "passed"));
    assert.ok(report.coverage.checks.some(item => item.name.startsWith("interaction:unsafe-toggle:") && item.status === "blocked"));
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

    const baselineDir = path.join(tempDir, "baselines");
    await mkdir(baselineDir, { recursive: true });
    await copyFile(path.join(tempDir, "screenshots", "_-mobile.png"), path.join(baselineDir, "_-mobile.png"));
    const visualConfig = {
      baseUrl: `http://127.0.0.1:${address.port}`, routes: ["/"],
      viewports: [{ name: "mobile", width: 390, height: 844 }],
      browser: { engine: "chromium", headless: true, navigationTimeoutMs: 10000 },
      visualRegression: { enabled: true, baselineDir: "baselines", threshold: 0.1, maxDiffPixels: 0 },
      configDir: tempDir
    };
    const visualPass = createReport({
      runId: "visual-pass", startedAt: new Date().toISOString(),
      environment: { project: "fixture", baseUrl: `http://127.0.0.1:${address.port}`, browser: "chromium" },
      routes: ["/"], viewports: ["mobile"]
    });
    await runBrowserAudit(visualConfig, visualPass, path.join(tempDir, "visual-pass"));
    assert.ok(visualPass.coverage.checks.some(item => item.name.startsWith("visual-regression:") && item.status === "passed"));

    const baselinePath = path.join(baselineDir, "_-mobile.png");
    const alteredBaseline = PNG.sync.read(await readFile(baselinePath));
    const centerPixel = (Math.floor(alteredBaseline.height / 2) * alteredBaseline.width + Math.floor(alteredBaseline.width / 2)) * 4;
    alteredBaseline.data[centerPixel] = alteredBaseline.data[centerPixel] === 0 ? 255 : 0;
    await writeFile(baselinePath, PNG.sync.write(alteredBaseline));
    const visualFail = createReport({
      runId: "visual-fail", startedAt: new Date().toISOString(),
      environment: { project: "fixture", baseUrl: `http://127.0.0.1:${address.port}`, browser: "chromium" },
      routes: ["/"], viewports: ["mobile"]
    });
    await runBrowserAudit(visualConfig, visualFail, path.join(tempDir, "visual-fail"));
    assert.ok(visualFail.coverage.checks.some(item => item.name.startsWith("visual-regression:") && item.status === "failed"));
    assert.ok(visualFail.findings.some(item => item.title === "Screenshot differs from approved visual baseline"));
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(tempDir, { recursive: true, force: true });
  }
});
