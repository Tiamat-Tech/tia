import dotenv from "dotenv";
import { spawn } from "child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";

dotenv.config();

const requiredEnv = [
  "XMPP_SERVICE",
  "XMPP_DOMAIN",
  "XMPP_USERNAME",
  "XMPP_PASSWORD",
  "MUC_ROOM"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const testClientNick =
  process.env.TEST_XMPP_NICKNAME ||
  `VitestClient-${Math.random().toString(16).slice(2, 8)}`;

const messages = [];
let agent;
const botProcs = [];

async function waitFor(conditionFn, timeoutMs = 12000, intervalMs = 100) {
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

function startBot(scriptPath, envOverrides = {}) {
  const child = spawn("node", [scriptPath], {
    env: { ...process.env, ...envOverrides },
    stdio: "inherit"
  });
  botProcs.push(child);
  return child;
}

function stopBots() {
  botProcs.forEach((p) => {
    if (p.exitCode === null) {
      p.kill("SIGTERM");
    }
  });
}

function findMessageFrom(senderNickname) {
  return messages.find((m) => m.sender === senderNickname);
}

if (missingEnv.length) {
  describe.skip("XMPP bot integration (env not provided)", () => {
    it("skipped because required env vars are missing", () => {
      expect(missingEnv.length).toBeGreaterThan(0);
    });
  });
} else {
  describe("XMPP bot integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: testClientNick,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: false,
        logger: console
      });

      await agent.start();
      await waitFor(() => agent.isInRoom === true, 10000);
    }, 15000);

    afterAll(async () => {
      stopBots();
      if (agent) {
        await agent.stop();
      }
    });

    const mistralEnvMissing = !process.env.MISTRAL_API_KEY;
    const runMistralTest = process.env.RUN_MISTRAL_BOT_TEST !== "false";
    const mistralNickname = process.env.BOT_NICKNAME || "MistralBot";

    (mistralEnvMissing || !runMistralTest ? it.skip : it)(
      "Mistral bot replies in MUC when mentioned",
      async () => {
        startBot("src/services/mistral-bot.js", {
          MUC_ROOM,
          BOT_NICKNAME: mistralNickname
        });

        // Give the bot a moment to join
        await new Promise((resolve) => setTimeout(resolve, 4000));

        const ping = `${mistralNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(mistralNickname), 15000, 200);

        const reply = findMessageFrom(mistralNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      25000
    );

    const sememTestEnabled = process.env.RUN_SEMEM_BOT_TEST === "true";
    const sememNickname =
      process.env.SEMEM_NICKNAME ||
      process.env.AGENT_NICKNAME ||
      "Semem";

    (!sememTestEnabled ? it.skip : it)(
      "Semem agent replies in MUC when mentioned",
      async () => {
        startBot("src/services/semem-agent.js", {
          MUC_ROOM,
          AGENT_NICKNAME: sememNickname
        });

        await new Promise((resolve) => setTimeout(resolve, 4000));

        const ping = `${sememNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(sememNickname), 15000, 200);

        const reply = findMessageFrom(sememNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      25000
    );
  });
}
