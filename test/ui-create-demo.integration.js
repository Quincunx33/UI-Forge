import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { chromium } from "playwright";
import { readFile, mkdtemp, rm, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBrowserAudit } from "../src/audit.js";
import { createReport } from "../src/report.js";

const demoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../examples/ui-create-demo");
const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]]
]);

test("UI creation demo renders responsively and its primary interactions work", async () => {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    if (pathname === "/favicon.ico") { response.writeHead(204); response.end(); return; }
    const asset = assets.get(pathname);
    if (!asset) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    try {
      const body = await readFile(path.join(demoRoot, asset[0]));
      response.writeHead(200, { "content-type": asset[1] });
      response.end(body);
    } catch {
      response.writeHead(500);
      response.end("Demo asset unavailable");
    }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "ui-forge-create-demo-"));
  try {
    const report = createReport({
      runId: "ui-create-demo",
      startedAt: new Date().toISOString(),
      environment: { project: "ui-create-demo", baseUrl, browser: "chromium" },
      routes: ["/"],
      viewports: ["narrow-mobile", "mobile", "tablet", "desktop"]
    });
    await runBrowserAudit({
      baseUrl,
      routes: ["/"],
      viewports: [
        { name: "narrow-mobile", width: 360, height: 800 },
        { name: "mobile", width: 390, height: 844 },
        { name: "tablet", width: 768, height: 1024 },
        { name: "desktop", width: 1440, height: 1000 }
      ],
      interactions: [
        { name: "switch-to-projects", testId: "nav-projects", route: "/", expectedText: "at your own pace." },
        { name: "filter-active-projects", testId: "filter-active", route: "/", expectedText: "2 active projects" },
        { name: "open-create-project-dialog", testId: "create-project", route: "/", expectedText: "Give your next idea a place to grow." }
      ],
      browser: { engine: "chromium", headless: true, navigationTimeoutMs: 10000 }
    }, report, outputDir);

    for (const viewport of ["narrow-mobile", "mobile", "tablet", "desktop"]) {
      for (const interaction of ["switch-to-projects", "filter-active-projects", "open-create-project-dialog"]) {
        const check = report.coverage.checks.find(item =>
          item.name.startsWith(`interaction:${interaction}:/:${viewport}`)
        );
        assert.ok(check, `Missing ${interaction} check for ${viewport}`);
        assert.equal(check.status, "passed", check.reason);
      }
      assert.ok(report.coverage.checks.some(item =>
        item.name === `horizontal-overflow:/:${viewport}` && item.status === "passed"
      ));
      assert.ok(report.coverage.checks.some(item =>
        item.name.startsWith(`axe-wcag-accessibility:/:${viewport}`)
      ));
    }

    const screenshots = await readdir(path.join(outputDir, "screenshots"));
    assert.ok(screenshots.some(name => name.endsWith("-mobile.png")));
    assert.ok(screenshots.some(name => name.endsWith("-desktop.png")));
    assert.ok(!report.coverage.checks.some(item => item.name.includes("console-errors:") && item.status === "failed"));
    assert.ok(!report.coverage.checks.some(item => item.name.includes("failed-requests:") && item.status === "failed"));

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(baseUrl);
      await page.keyboard.press("/");
      assert.equal(await page.locator("#project-search").evaluate(element => element === document.activeElement), true);
      await page.locator("#project-search").fill("northstar");
      assert.equal(await page.locator("#project-grid .project-card:visible").count(), 1);
      await page.locator("#project-search").fill("");

      await page.getByRole("button", { name: /New project/ }).click();
      assert.equal(await page.locator("#project-dialog").evaluate(element => element.open), true);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#project-dialog").evaluate(element => element.open), false);

      await page.getByRole("button", { name: /New project/ }).click();
      await page.locator("#project-name").fill("Tiny test garden");
      await page.getByRole("button", { name: /Create project/ }).click();
      await page.getByText("Tiny test garden", { exact: true }).waitFor({ state: "visible" });
      assert.equal(await page.locator("#project-grid .project-card").count(), 4);
      assert.equal((await page.locator("#toast").textContent()).trim(), "Your new project has a home.");
      await page.getByRole("button", { name: /In progress/ }).click();
      assert.equal((await page.locator("#project-count").textContent()).trim(), "3 active projects");
      assert.equal((await page.locator(".nav-count").textContent()).trim(), "4");
    } finally {
      await browser.close();
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(outputDir, { recursive: true, force: true });
  }
});
