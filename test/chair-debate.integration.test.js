import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { xml } from "@xmpp/client";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { loadXmppTestConfig } from "./utils/xmpp-test-credentials.js";

dotenv.config();

const { missingEnv, xmppConfig: XMPP_CONFIG, mucRoom: MUC_ROOM } = loadXmppTestConfig();

const TEST_NICKNAME =
  process.env.TEST_CHAIR_NICKNAME ||
  `Vitest-Chair-${Math.random().toString(16).slice(2, 8)}`;
const CHAIR_NICKNAME = process.env.CHAIR_NICKNAME || "Chair";

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

async function sendGroupchat(agent, roomJid, body) {
  await agent.xmpp.send(
    xml("message", { to: roomJid, type: "groupchat" }, xml("body", {}, body))
  );
}

if (missingEnv.length) {
  describe.skip("Chair debate integration (credentials not provided)", () => {
    it("skipped because required credentials are missing", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Chair debate integration", () => {
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
      "Chair responds to 'debate <problem>' with debate started message",
      async () => {
        // Clear any previous messages
        messages.length = 0;

        // Simulate what Coordinator broadcasts when it receives "debate" command
        // (In real usage, Coordinator would do this, but it's not running in this test)
        const coordinatorBroadcast = `Issue: Which tools and agents should we use to solve this problem?

Problem: Schedule appointments for patients. Ensure no drug interactions.

Available agents:
  - Mistral: Natural language processing, entity extraction
  - Data: Wikidata/DBpedia knowledge grounding
  - Prolog: Logical reasoning, constraint satisfaction
  - MFR-Semantic: Constraint extraction from domain knowledge

Please contribute:
  Position: I recommend [agent] because...
  Support: [agent] would help because...
  Objection: [agent] may not work because...`;

        await sendGroupchat(agent, MUC_ROOM, coordinatorBroadcast);

        // Wait for Chair to respond
        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== CHAIR_NICKNAME) return false;
            const body = message.body || "";
            return body.includes("Debate started") && body.includes("Issue:");
          });
        }, 20000);

        // Find Chair's response
        const chairResponse = messages.find((message) => {
          if (message.sender !== CHAIR_NICKNAME) return false;
          const body = message.body || "";
          return body.includes("Debate started") && body.includes("Issue:");
        });

        expect(chairResponse).toBeDefined();
        expect(chairResponse.body).toContain("Debate started");
        expect(chairResponse.body).toContain("Issue:");
        expect(chairResponse.body).toContain("Please provide Positions and Arguments");
      },
      30000
    );

    it(
      "Chair tracks positions during debate",
      async () => {
        // Clear any previous messages
        messages.length = 0;

        // First, start a debate by simulating Coordinator's broadcast
        const coordinatorBroadcast = `Issue: Which tools should we use for drug interaction checking?

Available agents: Mistral, Data, Prolog, MFR-Semantic`;

        await sendGroupchat(agent, MUC_ROOM, coordinatorBroadcast);

        // Wait for Chair to acknowledge debate started
        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== CHAIR_NICKNAME) return false;
            const body = message.body || "";
            return body.includes("Debate started");
          });
        }, 10000);

        // Clear messages to isolate the position test
        messages.length = 0;

        // Now send a position
        const position = "Position: I recommend Data agent for drug lookup because it can access Wikidata";
        await sendGroupchat(agent, MUC_ROOM, position);

        // Wait for Chair to acknowledge
        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== CHAIR_NICKNAME) return false;
            const body = message.body || "";
            return body.includes("Noted") && body.includes("Position:");
          });
        }, 15000);

        // Find Chair's acknowledgment
        const chairResponse = messages.find((message) => {
          if (message.sender !== CHAIR_NICKNAME) return false;
          const body = message.body || "";
          return body.includes("Noted") && body.includes("Position:");
        });

        expect(chairResponse).toBeDefined();
        expect(chairResponse.body).toContain("Noted");
        expect(chairResponse.body).toContain("Position:");
      },
      25000
    );

    it(
      "Chair responds to status request during debate",
      async () => {
        // Clear any previous messages
        messages.length = 0;

        // Send status request to Chair
        const statusRequest = `${CHAIR_NICKNAME}: status`;
        await sendGroupchat(agent, MUC_ROOM, statusRequest);

        // Wait for Chair to respond with debate summary
        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== CHAIR_NICKNAME) return false;
            const body = message.body || "";
            return body.includes("Issue:") || body.includes("Positions:");
          });
        }, 15000);

        // Find Chair's status response
        const chairResponse = messages.find((message) => {
          if (message.sender !== CHAIR_NICKNAME) return false;
          const body = message.body || "";
          return body.includes("Issue:") || body.includes("Positions:");
        });

        expect(chairResponse).toBeDefined();
        // Should contain either the current issue or positions summary
        const body = chairResponse.body;
        expect(
          body.includes("Issue:") ||
          body.includes("Positions:") ||
          body.includes("No active issue")
        ).toBe(true);
      },
      25000
    );

    it(
      "Chair ignores plain 'debate' command and waits for Issue broadcast",
      async () => {
        // Clear any previous messages and wait for room to settle
        messages.length = 0;
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send just "debate" command (what user types)
        const debateCommand = "debate Test problem for verification";
        await sendGroupchat(agent, MUC_ROOM, debateCommand);

        // Wait briefly
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Count how many times Chair responded
        const chairResponses = messages.filter((message) => {
          return message.sender === CHAIR_NICKNAME;
        });

        // Chair should either:
        // 1. Not respond at all (ideal - ignores the command), OR
        // 2. Give default "Please contribute" response (acceptable)
        // But should NOT give "Debate started" for the raw command
        if (chairResponses.length > 0) {
          // If Chair responded, it should be the default prompt, not "Debate started"
          chairResponses.forEach(response => {
            expect(response.body).not.toContain("Debate started. Issue: Test problem");
          });
        }

        // The key test: Chair should recognize Coordinator's Issue broadcast
        messages.length = 0;
        const coordinatorIssue = "Issue: What is the best approach for this problem?";
        await sendGroupchat(agent, MUC_ROOM, coordinatorIssue);

        await waitFor(() => {
          return messages.some((message) => {
            if (message.sender !== CHAIR_NICKNAME) return false;
            return message.body.includes("Debate started");
          });
        }, 5000);

        const debateStarted = messages.find(m =>
          m.sender === CHAIR_NICKNAME && m.body.includes("Debate started")
        );

        expect(debateStarted).toBeDefined();
      },
      15000
    );
  });
}
