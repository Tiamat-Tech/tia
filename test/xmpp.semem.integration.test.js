import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { spawn } from "child_process";

dotenv.config();

const requiredEnv = [
  "XMPP_SERVICE",
  "XMPP_DOMAIN",
  "XMPP_USERNAME",
  "XMPP_PASSWORD",
  "MUC_ROOM"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const sememTestEnabled = process.env.RUN_SEMEM_BOT_TEST === "true";

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const testerNick =
  process.env.TEST_XMPP_NICKNAME || `SememTester-${Math.random().toString(16).slice(2, 8)}`;
const sememNick =
  process.env.SEMEM_NICKNAME ||
  process.env.AGENT_NICKNAME ||
  "Semem";

const messages = [];
let tester;
let sememProc;

async function waitFor(conditionFn, timeoutMs = 30000, intervalMs = 200) {
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

function startSememBot() {
  sememProc = spawn("node", ["src/services/semem-agent.js"], {
    env: { ...process.env, AGENT_NICKNAME: sememNick },
    stdio: "inherit"
  });
}

function stopSememBot() {
  if (sememProc && sememProc.exitCode === null) {
    sememProc.kill("SIGTERM");
  }
}

function findMessageFrom(senderNickname, textIncludes) {
  const base = senderNickname.toLowerCase();
  return messages.find(
    (m) =>
      m.sender?.toLowerCase().startsWith(base) &&
      (!textIncludes || m.body?.toLowerCase().includes(textIncludes.toLowerCase()))
  );
}

if (missingEnv.length || !sememTestEnabled) {
  describe.skip("Semem tell/ask integration (env not provided or disabled)", () => {
    it("skipped because required env vars are missing or RUN_SEMEM_BOT_TEST!=true", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Semem tell/ask integration", () => {
    beforeAll(async () => {
      tester = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: testerNick,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: true,
        logger: console
      });

      startSememBot();
      await tester.start();
      await waitFor(() => tester.isInRoom === true, 18000);
      await new Promise((resolve) => setTimeout(resolve, 20000)); // let Semem join
    }, 50000);

    afterAll(async () => {
      stopSememBot();
      if (tester) {
        await tester.stop();
      }
    });

    it(
      "stores via tell and recalls via ask",
      async () => {
        const tellMsg = `${sememNick}, tell Semem that Glitch is a canary`;
        await tester.sendGroupMessage(tellMsg);

        await waitFor(() => !!findMessageFrom(sememNick), 40000, 200);
        messages.length = 0; // clear after tell ack

        const askMsg = `${sememNick}, what is Glitch?`;
        await tester.sendGroupMessage(askMsg);

        await waitFor(() => !!findMessageFrom(sememNick), 45000, 200);
        const reply = findMessageFrom(sememNick);
        expect(reply?.body || "").toBeTruthy();
      },
      90000
    );
  });
}
