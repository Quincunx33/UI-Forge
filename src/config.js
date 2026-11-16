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
  discovery: { enabled: false, maxRoutes: 20 },
  interactions: [],
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
  if (input.discovery !== undefined) {
    if (!input.discovery || typeof input.discovery !== "object" || Array.isArray(input.discovery)) {
      errors.push("discovery must be an object.");
    } else {
      if (input.discovery.enabled !== undefined && typeof input.discovery.enabled !== "boolean") errors.push("discovery.enabled must be a boolean.");
      if (input.discovery.maxRoutes !== undefined && (!Number.isInteger(input.discovery.maxRoutes) || input.discovery.maxRoutes < 1 || input.discovery.maxRoutes > 50)) {
        errors.push("discovery.maxRoutes must be an integer between 1 and 50.");
      }
    }
  }
  if (input.interactions !== undefined) {
    if (!Array.isArray(input.interactions)) errors.push("interactions must be an array.");
    else for (const [index, item] of input.interactions.entries()) {
      if (!item || typeof item !== "object" || Array.isArray(item)) { errors.push(`interactions[${index}] must be an object.`); continue; }
      if (typeof item.name !== "string" || !item.name.trim()) errors.push(`interactions[${index}].name must be a non-empty string.`);
      if (typeof item.testId !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(item.testId)) errors.push(`interactions[${index}].testId must use 1-64 letters, numbers, underscores, or hyphens.`);
      if (typeof item.route !== "string" || !item.route.startsWith("/") || item.route.startsWith("//") || item.route.includes(String.fromCharCode(92))) errors.push(`interactions[${index}].route must be a local absolute path.`);
      if (item.expectedText !== undefined && (typeof item.expectedText !== "string" || item.expectedText.length > 500)) errors.push(`interactions[${index}].expectedText must be a string of at most 500 characters.`);
    }
  }
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
    discovery: { ...DEFAULTS.discovery, ...(parsed.discovery ?? {}) },
    interactions: parsed.interactions ?? [],
    configDir: path.dirname(absolutePath)
  };
}
