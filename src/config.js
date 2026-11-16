import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateConfigSchema } from "./schema.js";

const DEFAULTS = {
  routes: ["/"],
  viewports: [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 }
  ],
  mode: "detect",
  allowRemote: false,
  outputDir: ".ui-forge",
  browser: { engine: "chromium", headless: true, navigationTimeoutMs: 30000 },
  repair: { maxAttemptsPerFinding: 2, requireApprovalForSensitiveFiles: true, allowDependencyChanges: false },
  ignore: []
};

export function validateConfig(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return ["Configuration must be a JSON object."];
  }
  if (typeof input.baseUrl !== "string") {
    errors.push("baseUrl must be a URL string.");
  } else {
    try {
      const url = new URL(input.baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) errors.push("baseUrl must use http or https.");
      if (url.username || url.password) errors.push("baseUrl must not contain embedded credentials.");
      const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
      const blockedHosts = new Set(["169.254.169.254", "100.100.100.200", "metadata.google.internal"]);
      if (blockedHosts.has(url.hostname)) {
        errors.push("baseUrl targets a blocked cloud metadata host.");
      } else if (!localHosts.has(url.hostname) && !url.hostname.endsWith(".localhost") && input.allowRemote !== true) {
        errors.push("Remote baseUrl requires allowRemote: true.");
      }
    } catch {
      errors.push("baseUrl must be a valid URL.");
    }
  }
  if (input.mode !== undefined && !["detect", "design-review", "repair"].includes(input.mode)) {
    errors.push("mode must be detect, design-review, or repair.");
  }
  if (input.routes !== undefined) {
    const invalidRoutes = !Array.isArray(input.routes) || input.routes.some(route =>
      typeof route !== "string" || !route.startsWith("/") || route.startsWith("//") || route.includes(String.fromCharCode(92))
    );
    if (invalidRoutes) errors.push("routes must be local absolute paths beginning with one '/' and contain no backslashes.");
  }
  if (input.viewports !== undefined) {
    if (!Array.isArray(input.viewports) || input.viewports.length === 0) {
      errors.push("viewports must be a non-empty array.");
    } else {
      for (const [index, viewport] of input.viewports.entries()) {
        if (!viewport || typeof viewport.name !== "string" || !Number.isInteger(viewport.width) ||
          !Number.isInteger(viewport.height) || viewport.width < 240 || viewport.height < 320) {
          errors.push(`viewports[${index}] requires a name, width >= 240, and height >= 320.`);
        }
      }
    }
  }
  if (input.allowRemote !== undefined && typeof input.allowRemote !== "boolean") errors.push("allowRemote must be a boolean.");
  if (input.outputDir !== undefined && (typeof input.outputDir !== "string" || !input.outputDir.trim())) {
    errors.push("outputDir must be a non-empty path.");
  }
  if (input.browser?.engine && !["chromium", "firefox", "webkit"].includes(input.browser.engine)) {
    errors.push("browser.engine must be chromium, firefox, or webkit.");
  }
  return errors;
}

export async function loadConfig(configPath) {
  const absolutePath = path.resolve(configPath);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read config ${absolutePath}: ${error.message}`);
  }
  const errors = validateConfig(parsed);
  if (errors.length) throw new Error(`Invalid UI-Forge config:\n- ${errors.join("\n- ")}`);
  const schemaResult = await validateConfigSchema(parsed);
  if (!schemaResult.valid) {
    throw new Error("Configuration does not match schemas/config.schema.json: " + JSON.stringify(schemaResult.errors));
  }
  return {
    ...DEFAULTS,
    ...parsed,
    browser: { ...DEFAULTS.browser, ...(parsed.browser ?? {}) },
    repair: { ...DEFAULTS.repair, ...(parsed.repair ?? {}) },
    configDir: path.dirname(absolutePath)
  };
}
