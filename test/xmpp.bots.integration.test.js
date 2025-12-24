import dotenv from "dotenv";
import { spawn } from "child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { loadXmppTestConfig } from "./utils/xmpp-test-credentials.js";

dotenv.config();

const { missingEnv, xmppConfig: XMPP_CONFIG, mucRoom: MUC_ROOM } = loadXmppTestConfig();
const testClientNick =
  process.env.TEST_XMPP_NICKNAME ||
  `VitestClient-${Math.random().toString(16).slice(2, 8)}`;

const messages = [];
let agent;
const botProcs = [];

async function waitFor(conditionFn, timeoutMs = 20000, intervalMs = 150) {
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
  const base = senderNickname.toLowerCase();
  return messages.find((m) => m.sender?.toLowerCase().startsWith(base));
}

if (missingEnv.length) {
  describe.skip("XMPP bot integration (credentials not provided)", () => {
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
      await waitFor(() => agent.isInRoom === true, 18000);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }, 30000);

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
        await new Promise((resolve) => setTimeout(resolve, 8000));

        const ping = `${mistralNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(mistralNickname), 20000, 200);

        const reply = findMessageFrom(mistralNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      40000
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

        await new Promise((resolve) => setTimeout(resolve, 20000));

        const ping = `${sememNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(sememNickname), 45000, 200);

        const reply = findMessageFrom(sememNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      70000
    );
  });
}
