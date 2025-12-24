import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { loadXmppTestConfig } from "./utils/xmpp-test-credentials.js";

dotenv.config();

const { missingEnv, xmppConfig: XMPP_CONFIG, mucRoom: MUC_ROOM } = loadXmppTestConfig();
const NICKNAME =
  process.env.TEST_XMPP_NICKNAME ||
  `Vitest-${Math.random().toString(16).slice(2, 8)}`;

const messages = [];
let agent;

async function waitFor(conditionFn, timeoutMs = 12000, intervalMs = 150) {
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
  describe.skip("XMPP integration (credentials not provided)", () => {
    it("skipped because required env vars are missing", () => {
      expect(missingEnv.length).toBeGreaterThan(0);
    });
  });
} else {
  describe("XMPP integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: NICKNAME,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: true,
        logger: console
      });

      await agent.start();
      await waitFor(() => agent.isInRoom === true, 10000);
    }, 15000);

    afterAll(async () => {
      if (agent) {
        await agent.stop();
      }
    });

    it(
      "joins the MUC and can post a message",
      async () => {
        const body = `vitest-ping-${Date.now()}`;
        await agent.sendGroupMessage(body);
        await waitFor(
          () => messages.some((m) => m.body === body),
          8000
        );
        const seen = messages.find((m) => m.body === body);
        expect(seen?.roomJid ?? MUC_ROOM).toBeDefined();
      },
      15000
    );
  });
}
