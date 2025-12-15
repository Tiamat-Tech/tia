import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectIBISStructure,
  summarizeIBIS,
} from "../src/lib/ibis-detect.js";
import {
  structureToDataset,
  datasetToTurtle,
  turtleToDataset,
  datasetToStructure,
} from "../src/lib/ibis-rdf.js";

test("detects IBIS elements from natural language", () => {
  const text =
    "Issue: How should we handle authentication? I propose OAuth2 because it is standard. However, the downside is complexity.";
  const result = detectIBISStructure(text);

  assert.ok(result.issues.length >= 1);
  assert.ok(result.positions.length >= 1);
  assert.ok(result.arguments.length >= 1);
  assert.ok(result.confidence > 0);

  const summary = summarizeIBIS(result);
  assert.match(summary, /Issue:/);
});

test("serializes and parses IBIS RDF using rdf-ext", async () => {
  const structure = {
    issues: [{ id: "issue-1", label: "Choose protocol" }],
    positions: [{ id: "pos-1", label: "Use XMPP" }],
    arguments: [
      { id: "arg-1", label: "Good federation story", stance: "support" },
    ],
  };

  const dataset = structureToDataset(structure);
  assert.ok(dataset.size > 0);

  const turtle = await datasetToTurtle(dataset);
  assert.match(turtle, /ibis:Issue/);

  const parsed = await turtleToDataset(turtle);
  const roundTrip = datasetToStructure(parsed);

  assert.equal(roundTrip.issues[0].label, "Choose protocol");
  assert.equal(roundTrip.positions[0].label, "Use XMPP");
  assert.equal(roundTrip.arguments[0].stance, "support");
});
