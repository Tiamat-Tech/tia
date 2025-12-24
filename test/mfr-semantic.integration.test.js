import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { ModelNegotiationHandler, ModelFirstRdfHandler } from "../src/lib/lingue/handlers/index.js";
import { MFR_CONTRIBUTION_TYPES, MFR_MESSAGE_TYPES } from "../src/lib/mfr/constants.js";
import { loadXmppTestConfig } from "./utils/xmpp-test-credentials.js";

dotenv.config();

const { missingEnv, xmppConfig: XMPP_CONFIG, mucRoom: MUC_ROOM } = loadXmppTestConfig();
const NICKNAME =
  process.env.TEST_MFR_NICKNAME ||
  `Vitest-MFR-${Math.random().toString(16).slice(2, 8)}`;
const TARGET_NICKNAME = process.env.MFR_SEMANTIC_NICKNAME || "MfrSemantic";

const messages = [];
let agent;

async function waitFor(conditionFn, timeoutMs = 15000, intervalMs = 200) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

if (missingEnv.length) {
  describe.skip("MFR semantic integration (credentials not provided)", () => {
    it("skipped because required env vars are missing", () => {
      expect(missingEnv.length).toBeGreaterThan(0);
    });
  });
} else {
  describe("MFR semantic integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: NICKNAME,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: false,
        logger: console
      });

      await agent.start();
      await waitFor(() => agent.isInRoom === true, 10000);
    }, 20000);

    afterAll(async () => {
      if (agent) {
        await agent.stop();
      }
    });

    it(
      "receives constraint RDF from the MFR semantic agent",
      async () => {
        const sessionId = randomUUID();
        const negotiationHandler = new ModelNegotiationHandler({ logger: console });
        const payload = {
          messageType: MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST,
          sessionId,
          problemDescription:
            "Schedule appointments for patients. Alice takes warfarin. Bob takes aspirin. Ensure no drug interactions.",
          requestedContributions: [
            MFR_CONTRIBUTION_TYPES.CONSTRAINT,
            MFR_CONTRIBUTION_TYPES.ONTOLOGY_VALIDATION
          ],
          timestamp: new Date().toISOString()
        };

        const stanza = negotiationHandler.createStanza(
          MUC_ROOM,
          payload,
          `MFR contribution request ${sessionId}`,
          { type: "groupchat" }
        );

        await agent.xmpp.send(stanza);

        const rdfHandler = new ModelFirstRdfHandler({ logger: console });
        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== TARGET_NICKNAME) return false;
            const payloadNode = message.stanza?.getChild?.("payload", "http://purl.org/stuff/lingue/");
            if (!payloadNode) return false;
            const parsed = rdfHandler.parseStanza(message.stanza);
            return (
              parsed?.payload?.includes("mfr:Constraint") ||
              parsed?.payload?.includes("mfr:DomainRule")
            );
          });
        }, 20000);

        const reply = messages.find((message) => {
          if (message.sender !== TARGET_NICKNAME) return false;
          const payloadNode = message.stanza?.getChild?.("payload", "http://purl.org/stuff/lingue/");
          if (!payloadNode) return false;
          const parsed = rdfHandler.parseStanza(message.stanza);
          return (
            parsed?.payload?.includes("mfr:Constraint") ||
            parsed?.payload?.includes("mfr:DomainRule")
          );
        });

        expect(reply).toBeDefined();
      },
      25000
    );
  });
}
