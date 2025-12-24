import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { ModelNegotiationHandler } from "../src/lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES } from "../src/lib/mfr/constants.js";
import { loadXmppTestConfig } from "./utils/xmpp-test-credentials.js";

dotenv.config();

const { missingEnv, xmppConfig: XMPP_CONFIG, mucRoom: MUC_ROOM } = loadXmppTestConfig();

const TEST_NICKNAME =
  process.env.TEST_MFR_NICKNAME ||
  `Vitest-Mistral-${Math.random().toString(16).slice(2, 8)}`;
const TARGET_NICKNAME = process.env.MISTRAL_NICKNAME || "Mistral";

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

if (missingEnv.length || !process.env.MISTRAL_API_KEY) {
  describe.skip("Mistral MFR integration (credentials not provided)", () => {
    it("skipped because required credentials are missing", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Mistral MFR integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: TEST_NICKNAME,
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
      "receives a natural language explanation after SessionComplete",
      async () => {
        const sessionId = randomUUID();
        const negotiationHandler = new ModelNegotiationHandler({ logger: console });
        const payload = {
          messageType: MFR_MESSAGE_TYPES.SESSION_COMPLETE,
          sessionId,
          solutions: [
            {
              success: true,
              message: "Generated plan with 2 actions",
              plan: ["book_appointment", "confirm_interaction"]
            }
          ],
          timestamp: new Date().toISOString()
        };

        const stanza = negotiationHandler.createStanza(
          MUC_ROOM,
          payload,
          `MFR session complete ${sessionId}`,
          { type: "groupchat" }
        );

        await agent.xmpp.send(stanza);

        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== TARGET_NICKNAME) return false;
            const body = message.body || "";
            return body.includes("Solution explanation") || body.includes("Solution:");
          });
        }, 30000);

        const reply = messages.find((message) => {
          if (message.sender !== TARGET_NICKNAME) return false;
          const body = message.body || "";
          return body.includes("Solution explanation") || body.includes("Solution:");
        });

        expect(reply).toBeDefined();
      },
      40000
    );
  });
}
