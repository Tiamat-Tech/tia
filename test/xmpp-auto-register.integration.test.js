import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { autoConnectXmpp } from "../src/lib/xmpp-auto-connect.js";
import { registerXmppAccount, generatePassword } from "../src/lib/xmpp-register.js";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// Test configuration - assumes tensegrity.it server
const XMPP_SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const XMPP_DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.tensegrity.it";

// Use a unique username for testing
const TEST_USERNAME = `test-auto-${Math.random().toString(16).slice(2, 10)}`;
const TEST_SECRETS_PATH = path.join(process.cwd(), "test", "fixtures", "test-auto-secrets.json");

const messages = [];
let agent;
let xmppClient;
let registeredCredentials;

async function waitFor(conditionFn, timeoutMs = 12000, intervalMs = 150) {
  const start = Date.now();
  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// Only run if server is configured
const serverConfigured = process.env.RUN_TENSEGRITY_TESTS === "true";

if (!serverConfigured) {
  describe.skip("XMPP auto-registration (RUN_TENSEGRITY_TESTS not set)", () => {
    it("skipped because RUN_TENSEGRITY_TESTS is not set to 'true'", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("XMPP auto-registration", () => {
    beforeAll(async () => {
      // Clean up test secrets file if it exists
      try {
        await fs.unlink(TEST_SECRETS_PATH);
      } catch (err) {
        // Ignore if doesn't exist
      }
    }, 5000);

    afterAll(async () => {
      // Clean up
      if (agent) {
        await agent.stop();
      }
      if (xmppClient) {
        await xmppClient.stop().catch(() => {});
      }

      // Clean up test secrets file
      try {
        await fs.unlink(TEST_SECRETS_PATH);
      } catch (err) {
        // Ignore if doesn't exist
      }
    }, 10000);

    it(
      "generates a random password",
      () => {
        const password = generatePassword(16);
        expect(password).toBeDefined();
        expect(password.length).toBe(16);
        expect(typeof password).toBe("string");

        // Should be different each time
        const password2 = generatePassword(16);
        expect(password).not.toBe(password2);
      }
    );

    it(
      "registers a new account successfully",
      async () => {
        const username = `test-reg-${Math.random().toString(16).slice(2, 10)}`;
        const password = generatePassword(16);

        const result = await registerXmppAccount({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username,
          password,
          tls: { rejectUnauthorized: false },
          logger: console
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain(username);
        expect(result.message).toContain("registered successfully");
      },
      20000
    );

    it(
      "auto-connects with registration when no password provided",
      async () => {
        const result = await autoConnectXmpp({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username: TEST_USERNAME,
          password: undefined, // No password - should trigger registration
          resource: "TestClient",
          tls: { rejectUnauthorized: false },
          secretsPath: TEST_SECRETS_PATH,
          autoRegister: true,
          logger: console
        });

        expect(result).toBeDefined();
        expect(result.xmpp).toBeDefined();
        expect(result.credentials).toBeDefined();
        expect(result.credentials.username).toBe(TEST_USERNAME);
        expect(result.credentials.password).toBeDefined();
        expect(result.credentials.registered).toBe(true);

        xmppClient = result.xmpp;
        registeredCredentials = result.credentials;

        // Verify secrets were saved
        const secretsData = await fs.readFile(TEST_SECRETS_PATH, "utf-8");
        const secrets = JSON.parse(secretsData);
        expect(secrets.xmpp[TEST_USERNAME]).toBe(result.credentials.password);
      },
      25000
    );

    it(
      "reuses saved password on second connection",
      async () => {
        // Stop the first client
        await xmppClient.stop();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Connect again without providing password
        const result = await autoConnectXmpp({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username: TEST_USERNAME,
          password: undefined, // Should load from secrets
          resource: "TestClient2",
          tls: { rejectUnauthorized: false },
          secretsPath: TEST_SECRETS_PATH,
          autoRegister: false, // Don't need to register again
          logger: console
        });

        expect(result.credentials.password).toBe(registeredCredentials.password);
        expect(result.credentials.registered).toBe(false); // Wasn't registered this time

        xmppClient = result.xmpp;
      },
      20000
    );

    it(
      "auto-registered account can join MUC and send messages",
      async () => {
        const nickname = `Test-${Math.random().toString(16).slice(2, 6)}`;

        agent = new XmppRoomAgent({
          xmppConfig: {
            service: XMPP_SERVICE,
            domain: XMPP_DOMAIN,
            username: TEST_USERNAME,
            password: registeredCredentials.password,
            tls: { rejectUnauthorized: false }
          },
          roomJid: MUC_ROOM,
          nickname,
          onMessage: async (payload) => {
            messages.push(payload);
          },
          allowSelfMessages: true,
          logger: console
        });

        await agent.start();
        await waitFor(() => agent.isInRoom === true, 15000);

        // Send a test message
        const testBody = `auto-reg-test-${Date.now()}`;
        await agent.sendGroupMessage(testBody);

        // Wait for message to appear
        await waitFor(
          () => messages.some((m) => m.body === testBody),
          10000
        );

        const receivedMessage = messages.find((m) => m.body === testBody);
        expect(receivedMessage).toBeDefined();
        expect(receivedMessage.sender).toBe(nickname);
        expect(receivedMessage.type).toBe("groupchat");
      },
      30000
    );

    it(
      "handles registration conflict gracefully",
      async () => {
        // Try to register with same username again
        const password = generatePassword(16);

        await expect(
          registerXmppAccount({
            service: XMPP_SERVICE,
            domain: XMPP_DOMAIN,
            username: TEST_USERNAME, // Already exists
            password,
            tls: { rejectUnauthorized: false },
            logger: console
          })
        ).rejects.toThrow(/already exists/i);
      },
      20000
    );
  });
}
