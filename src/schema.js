import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validatorCache = new Map();

async function loadValidator(file) {
  if (validatorCache.has(file)) return validatorCache.get(file);
  const schema = JSON.parse(await readFile(path.join(root, "schemas", file), "utf8"));
  const validate = ajv.compile(schema);
  validatorCache.set(file, validate);
  return validate;
}

export async function validateConfigSchema(config) {
  const validate = await loadValidator("config.schema.json");
  const valid = validate(config);
  return { valid: Boolean(valid), errors: validate.errors ?? [] };
}

export async function validateReportSchema(report) {
  const validate = await loadValidator("report.schema.json");
  const valid = validate(report);
  return { valid: Boolean(valid), errors: validate.errors ?? [] };
}

export async function validatePluginManifestSchema(manifest) {
  const validate = await loadValidator("agent-plugin.schema.json");
  const valid = validate(manifest);
  return { valid: Boolean(valid), errors: validate.errors ?? [] };
}
