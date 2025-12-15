import { test } from "node:test";
import assert from "node:assert/strict";
import { LingueStore } from "../src/lib/lingue-store.js";

test("stores and queries positions and arguments", async () => {
  const store = new LingueStore();
  store.addStructure({
    issues: [{ id: "issue-1", label: "Choose protocol" }],
    positions: [
      { id: "pos-1", label: "Use XMPP" },
      { id: "pos-2", label: "Use MQTT" },
    ],
    arguments: [
      { id: "arg-1", label: "Federation support", stance: "support", position: "pos-1" },
      { id: "arg-2", label: "Brokers add ops cost", stance: "object", position: "pos-2" },
    ],
  });

  const positions = store.positionsForIssue("issue-1");
  assert.equal(positions.length, 2);
  assert.equal(positions[0].label, "Use XMPP");

  const args = store.argumentsForPosition("pos-1");
  assert.equal(args.length, 1);
  assert.equal(args[0].stance, "support");

  const turtle = await store.toTurtle();
  assert.match(turtle, /ibis:Position/);
});
