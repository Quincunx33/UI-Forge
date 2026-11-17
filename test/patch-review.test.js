import test from "node:test";
import assert from "node:assert/strict";
import { buildRepairHandoff } from "../src/repair-handoff.js";
import { reviewRepairPatch } from "../src/patch-review.js";

const report = {
  schemaVersion: "1.0", runId: "run-1",
  findings: [{
    id: "UIF-0001", category: "responsive", severity: "medium", confidence: "high",
    title: "Horizontal overflow", status: "verified", evidence: ["screenshots/mobile.png"]
  }]
};
const handoff = buildRepairHandoff(report, "UIF-0001");

test("accepts a small, scoped text patch for review", () => {
  const patch = [
    "diff --git a/src/layout.css b/src/layout.css",
    "--- a/src/layout.css", "+++ b/src/layout.css",
    "@@ -1,2 +1,2 @@", "-.page { width: 1000px; }", "+.page { max-width: 100%; }"
  ].join("\n");
  const result = reviewRepairPatch(handoff, patch);
  assert.equal(result.accepted, true);
  assert.equal(result.changedLines, 2);
  assert.deepEqual(result.files, ["src/layout.css"]);
});

test("rejects traversal, binary, and oversized patches", () => {
  const traversal = "diff --git a/../secret b/../secret\n--- a/../secret\n+++ b/../secret\n+oops";
  assert.equal(reviewRepairPatch(handoff, traversal).accepted, false);
  const backslash = "diff --git a/src\\app.css b/src\\app.css\n--- a/src\\app.css\n+++ b/src\\app.css\n+bad";
  assert.equal(reviewRepairPatch(handoff, backslash).accepted, false);
  const quotedTraversal = `diff --git "a/../outside" "b/../outside"\n--- "a/../outside"\n+++ "b/../outside"\n+bad`;
  assert.equal(reviewRepairPatch(handoff, quotedTraversal).accepted, false);
  const rename = "diff --git a/src/a.css b/src/b.css\nsimilarity index 100%\nrename from src/a.css\nrename to src/b.css";
  assert.equal(reviewRepairPatch(handoff, rename).accepted, false);
  const mode = "diff --git a/src/a.css b/src/a.css\nold mode 100644\nnew mode 100755";
  assert.equal(reviewRepairPatch(handoff, mode).accepted, false);
  const binary = "diff --git a/image.png b/image.png\nGIT binary patch\nliteral 4";
  assert.equal(reviewRepairPatch(handoff, binary).binary, true);
  assert.equal(reviewRepairPatch(handoff, binary).accepted, false);
  const lines = Array.from({ length: 122 }, (_, i) => "+" + i).join("\n");
  const broad = "diff --git a/src/a.js b/src/a.js\n--- a/src/a.js\n+++ b/src/a.js\n@@ -1,0 +1,122 @@\n" + lines;
  assert.equal(reviewRepairPatch(handoff, broad).oversized, true);
  assert.equal(reviewRepairPatch(handoff, broad).accepted, false);
  assert.equal(reviewRepairPatch(handoff, broad, { approvalGranted: true }).accepted, true);
});


test("rejects a traditional unified-diff section hidden after an allowlisted git diff", () => {
  const mixedPatch = [
    "diff --git a/src/layout.css b/src/layout.css",
    "--- a/src/layout.css", "+++ b/src/layout.css",
    "@@ -1 +1 @@", "-.page { width: 1000px; }", "+.page { max-width: 100%; }",
    "--- a/src/private.txt", "+++ b/src/private.txt",
    "@@ -1 +1 @@", "-private", "+exposed"
  ].join("\\n");
  const result = reviewRepairPatch(handoff, mixedPatch, { approvalGranted: true });
  assert.equal(result.accepted, false);
  assert.ok(result.reasons.some(reason => reason.includes("additional unified-diff file sections")));
});
\ntest("requires explicit approval for sensitive paths", () => {
  const patch = "diff --git a/src/auth.ts b/src/auth.ts\n--- a/src/auth.ts\n+++ b/src/auth.ts\n@@ -1 +1 @@\n-old\n+new";
  const denied = reviewRepairPatch(handoff, patch);
  assert.equal(denied.accepted, false);
  assert.equal(denied.approvalRequired, true);
  const approved = reviewRepairPatch(handoff, patch, { approvalGranted: true });
  assert.equal(approved.accepted, true);
});
