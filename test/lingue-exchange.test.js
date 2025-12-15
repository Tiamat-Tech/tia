import { test } from "node:test";
import assert from "node:assert/strict";
import { createLingueStore, prepareStructuredOffer, acceptStructuredOffer } from "../src/lib/lingue-exchange.js";

test("prepares and accepts structured offers", async () => {
  const store = createLingueStore();
  const offer = prepareStructuredOffer(
    "Issue: Should we deploy now? I propose waiting until traffic is low because risk is smaller."
  );

  assert.ok(offer);
  assert.match(offer.summary, /Issue:/);

  const turtle = await acceptStructuredOffer(store, offer);
  assert.match(turtle, /ibis:Issue/);

  const structure = store.toStructure();
  assert.ok(structure.positions.length >= 1);
});
