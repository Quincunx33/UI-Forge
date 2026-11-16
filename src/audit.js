import path from "node:path";
import { mkdir } from "node:fs/promises";

function addFinding(report, item) {
  report.findings.push({
    id: `UIF-${String(report.findings.length + 1).padStart(4, "0")}`,
    category: item.category, severity: item.severity ?? "medium",
    confidence: item.confidence ?? "high", title: item.title,
    impact: item.impact ?? "", route: item.route ?? null,
    viewport: item.viewport ?? null, state: item.state ?? null,
    reproduction: item.reproduction ?? [], evidence: item.evidence ?? [],
    rootCauseHypothesis: item.rootCauseHypothesis ?? null,
    suggestedRepair: item.suggestedRepair ?? null, status: item.status ?? "verified"
  });
}

export async function runBrowserAudit(config, report, runDir) {
  let playwright;
  try { playwright = await import("playwright"); }
  catch { throw new Error("Playwright is not installed. Run npm install in the UI-Forge package, then npx playwright install chromium."); }
  const browserType = playwright[config.browser.engine];
  if (!browserType) throw new Error(`Unsupported browser engine: ${config.browser.engine}`);
  const browser = await browserType.launch({ headless: config.browser.headless });
  const screenshotDir = path.join(runDir, "screenshots");
  await mkdir(screenshotDir, { recursive: true });
  const base = new URL(config.baseUrl);

  try {
    for (const route of config.routes) {
      const targetUrl = new URL(route, base);\n      if (targetUrl.origin !== base.origin) throw new Error("Refusing cross-origin route: " + route);\n      const target = targetUrl.toString();
      for (const viewport of config.viewports) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();
        page.setDefaultNavigationTimeout(config.browser.navigationTimeoutMs);
        const routeLabel = route.replace(/[^a-z0-9_-]/gi, "_") || "root";
        const screenshotPath = path.join(screenshotDir, `${routeLabel}-${viewport.name}.png`);
        page.on("pageerror", error => addFinding(report, {
          category: "runtime", severity: "high", title: "Uncaught page exception",
          impact: error.message, route, viewport: viewport.name, evidence: [error.message]
        }));
        page.on("console", message => {
          if (message.type() === "error") addFinding(report, {
            category: "runtime", severity: "medium", title: "Browser console error",
            impact: message.text(), route, viewport: viewport.name, evidence: [message.text()]
          });
        });
        page.on("requestfailed", request => addFinding(report, {
          category: "network", severity: "medium", title: "Failed network request",
          impact: `${request.method()} ${request.url()} — ${request.failure()?.errorText ?? "request failed"}`,
          route, viewport: viewport.name, evidence: [request.url(), request.failure()?.errorText ?? "unknown"]
        }));

        try {
          const response = await page.goto(target, { waitUntil: "domcontentloaded" });
          if (!response || !response.ok()) addFinding(report, {
            category: "functional", severity: "high", title: "Route did not return a successful response",
            impact: `HTTP status: ${response?.status() ?? "no response"}`, route,
            viewport: viewport.name, evidence: [target]
          });
          await page.screenshot({ path: screenshotPath, fullPage: true, animations: "disabled" });
          const screenshotEvidence = path.relative(runDir, screenshotPath);
          const metrics = await page.evaluate(() => {
            const root = document.documentElement;
            const body = document.body;
            const overflowing = [...document.querySelectorAll("body *")].filter(element => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return rect.width > 0 && rect.right > window.innerWidth + 1 && !["fixed", "absolute"].includes(style.position);
            }).slice(0, 10).map(element => ({
              tag: element.tagName.toLowerCase(), id: element.id || null,
              className: typeof element.className === "string" ? element.className.slice(0, 120) : null,
              right: Math.round(element.getBoundingClientRect().right)
            }));
            const unlabeledControls = [...document.querySelectorAll("button, input:not([type=hidden]), select, textarea")].filter(el => {
              return !(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.labels?.length ||
                el.getAttribute("title") || (el.innerText || "").trim());
            }).length;
            const imagesWithoutAlt = [...document.images].filter(image => !image.hasAttribute("alt")).length;
            const emptyLinks = [...document.querySelectorAll("a[href]")].filter(link =>
              !(link.getAttribute("aria-label") || link.getAttribute("aria-labelledby") || (link.innerText || "").trim() || link.querySelector("img[alt]"))
            ).length;
            const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
            const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
            const infiniteAnimations = [...document.querySelectorAll("body *")].filter(element => {
              const style = getComputedStyle(element);
              return style.animationName !== "none" && style.animationIterationCount.split(",").some(value => value.trim() === "infinite");
            }).length;
            return {
              documentWidth: Math.max(root.scrollWidth, body?.scrollWidth ?? 0),
              viewportWidth: window.innerWidth, overflowing, unlabeledControls,
              imagesWithoutAlt, emptyLinks, duplicateIds, infiniteAnimations
            };
          });

          if (metrics.documentWidth > metrics.viewportWidth + 1) addFinding(report, {
            category: "responsive", severity: "high", title: "Horizontal page overflow detected",
            impact: `Document width ${metrics.documentWidth}px exceeds viewport width ${metrics.viewportWidth}px.`,
            route, viewport: viewport.name, evidence: [screenshotEvidence],
            reproduction: [`Open ${target}`, `Set viewport to ${viewport.width}×${viewport.height}`],
            suggestedRepair: "Inspect overflowing elements and constrain the responsible layout without hiding meaningful content."
          });
          if (metrics.overflowing.length) addFinding(report, {
            category: "responsive", severity: "medium", confidence: "medium",
            title: "Elements extend beyond the viewport",
            impact: `${metrics.overflowing.length} element(s) extend past the right viewport edge.`,
            route, viewport: viewport.name,
            evidence: [screenshotEvidence, JSON.stringify(metrics.overflowing)]
          });
          if (metrics.unlabeledControls > 0) addFinding(report, {
            category: "accessibility", severity: "medium", confidence: "medium",
            title: "Potentially unlabeled controls",
            impact: `${metrics.unlabeledControls} controls have no detectable accessible name.`,
            route, viewport: viewport.name, evidence: [screenshotEvidence],
            suggestedRepair: "Check accessible names using associated labels, aria-label, or aria-labelledby."
          });
          if (metrics.imagesWithoutAlt > 0) addFinding(report, {
            category: "accessibility", severity: "medium", confidence: "high",
            title: "Images missing alt attributes",
            impact: `${metrics.imagesWithoutAlt} image(s) do not declare an alt attribute.`,
            route, viewport: viewport.name, evidence: [screenshotEvidence],
            suggestedRepair: "Add meaningful alternative text, or alt=\"\" for purely decorative images."
          });
          if (metrics.emptyLinks > 0) addFinding(report, {
            category: "accessibility", severity: "high", confidence: "medium",
            title: "Links may have no accessible name",
            impact: `${metrics.emptyLinks} link(s) have no detectable text or accessible label.`,
            route, viewport: viewport.name, evidence: [screenshotEvidence]
          });
          if (metrics.duplicateIds.length > 0) addFinding(report, {
            category: "accessibility", severity: "medium", confidence: "high",
            title: "Duplicate HTML id attributes",
            impact: `Duplicate IDs: ${metrics.duplicateIds.join(", ")}`,
            route, viewport: viewport.name, evidence: [screenshotEvidence]
          });
          if (metrics.infiniteAnimations > 0) addFinding(report, {
            category: "motion", severity: "low", confidence: "medium",
            title: "Infinite CSS animations detected",
            impact: `${metrics.infiniteAnimations} element(s) have an infinite CSS animation; verify that each is meaningful and respects reduced-motion preferences.`,
            route, viewport: viewport.name, evidence: [screenshotEvidence]
          });
          report.coverage.checks.push(
            { name: `navigation:${route}:${viewport.name}`, status: response?.ok() ? "passed" : "failed" },
            { name: `screenshot:${route}:${viewport.name}`, status: "passed" },
            { name: `horizontal-overflow:${route}:${viewport.name}`, status: metrics.documentWidth > metrics.viewportWidth + 1 ? "failed" : "passed" },
            { name: `accessible-name-smoke:${route}:${viewport.name}`, status: metrics.unlabeledControls ? "failed" : "passed" }
          );
        } catch (error) {
          addFinding(report, {
            category: "functional", severity: "high", title: "Route audit could not complete",
            impact: error.message, route, viewport: viewport.name,
            evidence: [target], status: "likely"
          });
          report.coverage.checks.push({ name: `route-audit:${route}:${viewport.name}`, status: "blocked", reason: error.message });
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
}
