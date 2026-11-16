import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/config.js";

test("accepts a valid minimal config", () => {
  assert.deepEqual(validateConfig({ baseUrl: "http://localhost:3000" }), []);
});
test("rejects invalid protocol and routes", () => {
  const errors = validateConfig({ baseUrl: "file:///tmp/site", routes: ["relative"] });
  assert.ok(errors.some(error => error.includes("http or https")));
  assert.ok(errors.some(error => error.includes("beginning with")));
});
test("rejects invalid viewport dimensions", () => {
  const errors = validateConfig({ baseUrl: "http://localhost:3000", viewports: [{ name: "tiny", width: 100, height: 200 }] });
  assert.ok(errors.some(error => error.includes("width >= 240")));
});
test("rejects unknown mode and browser engine", () => {
  const errors = validateConfig({ baseUrl: "http://localhost:3000", mode: "autofix", browser: { engine: "unknown" } });
  assert.ok(errors.some(error => error.includes("mode")));
  assert.ok(errors.some(error => error.includes("browser.engine")));
});

test("requires explicit opt-in for remote targets and blocks metadata hosts", () => {
  assert.ok(validateConfig({ baseUrl: "https://example.com" }).some(error => error.includes("allowRemote")));
  assert.deepEqual(validateConfig({ baseUrl: "https://example.com", allowRemote: true }), []);
  assert.ok(validateConfig({ baseUrl: "http://169.254.169.254", allowRemote: true }).some(error => error.includes("metadata")));
  assert.ok(validateConfig({ baseUrl: "http://user:pass@localhost:3000" }).some(error => error.includes("credentials")));
});

test("rejects protocol-relative and backslash routes", () => {
  assert.ok(validateConfig({ baseUrl: "http://localhost:3000", routes: ["//other-host/path"] }).some(error => error.includes("local absolute paths")));
  assert.ok(validateConfig({ baseUrl: "http://localhost:3000", routes: ["/\\\\evil.test"] }).some(error => error.includes("local absolute paths")));
});
