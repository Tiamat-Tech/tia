/**
 * Simple MFR Session Runner
 *
 * This example shows how to programmatically initiate an MFR session
 * and interact with the coordinator agent.
 *
 * Usage:
 *   node src/examples/run-mfr-session.js "your problem description"
 *
 * Example problems:
 *   1. Scheduling with constraints:
 *      "Schedule meetings for Alice, Bob, and Carol on Monday.
 *       Alice is only available in the morning, Bob needs at least 2 hours,
 *       and Carol can't meet before Bob."
 *
 *   2. Resource allocation:
 *      "Allocate 3 servers to 5 tasks: database, web server, cache, worker, backup.
 *       Database needs high memory, web server needs good network,
 *       cache and worker can share a server."
 *
 *   3. Planning:
 *      "Plan a trip from London to Tokyo with stops in Paris and Dubai.
 *       Budget is $3000, prefer direct flights when possible,
 *       need to arrive by Friday."
 */

import { client, xml } from "@xmpp/client";

// Configuration from environment or defaults
const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "admin";
const PASSWORD = process.env.XMPP_PASSWORD || "admin123";
const COORDINATOR_ROOM = process.env.COORDINATOR_ROOM || "general@conference.tensegrity.it";
const NICKNAME = process.env.CLIENT_NICKNAME || "MFR-Client";
const TIMEOUT_MS = parseInt(process.env.MFR_TIMEOUT_MS || "120000"); // 2 minutes default

// Get problem from command line
const problem = process.argv[2];

if (!problem) {
  console.error("Usage: node run-mfr-session.js \"<problem description>\"");
  console.error("");
  console.error("Example:");
  console.error('  node run-mfr-session.js "Schedule 3 appointments for patients with drug constraints"');
  process.exit(1);
}

/**
 * Wait helper
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run an MFR session
 */
async function runMfrSession(problemDescription) {
  console.log("=== MFR Session Runner ===");
  console.log(`Problem: ${problemDescription}`);
  console.log("");
  console.log("Configuration:");
  console.log(`  Service: ${SERVICE}`);
  console.log(`  Username: ${USERNAME}`);
  console.log(`  Room: ${COORDINATOR_ROOM}`);
  console.log(`  Timeout: ${TIMEOUT_MS}ms`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  let sessionId = null;
  let solution = null;
  let inRoom = false;
  const responses = [];

  return new Promise((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      console.log("\n⏱️  Session timeout reached");
      xmpp.stop();
      resolve({ sessionId, solution, responses, timedOut: true });
    }, TIMEOUT_MS);

    xmpp.on("error", (err) => {
      console.error("❌ XMPP Error:", err.message);
      clearTimeout(timeoutHandle);
      reject(err);
    });

    xmpp.on("online", async (address) => {
      console.log(`✅ Connected as: ${address.toString()}`);

      // Send presence
      await xmpp.send(xml("presence"));

      // Join coordinator room
      console.log(`🏠 Joining coordinator room...`);
      await xmpp.send(xml(
        "presence",
        { to: `${COORDINATOR_ROOM}/${NICKNAME}` },
        xml(
          "x",
          { xmlns: "http://jabber.org/protocol/muc" },
          // Avoid receiving MUC history so we don't parse stale solutions.
          xml("history", { maxchars: "0", maxstanzas: "0", seconds: "0" })
        )
      ));
    });

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        if (from === `${COORDINATOR_ROOM}/${NICKNAME}`) {
          const type = stanza.attrs.type;
          if (!type || type === "available") {
            console.log("✅ Joined room, starting MFR session...");
            console.log("");
            inRoom = true;

            // Wait a moment for room to stabilize
            await wait(1000);

            // Send MFR start command
            console.log(`📤 Sending: mfr-start ${problemDescription.substring(0, 60)}${problemDescription.length > 60 ? '...' : ''}`);
            await xmpp.send(xml(
              "message",
              { type: "groupchat", to: COORDINATOR_ROOM },
              xml("body", {}, `mfr-start ${problemDescription}`)
            ));
          }
        }
      } else if (stanza.is("message")) {
        const from = stanza.attrs.from;
        const body = stanza.getChildText("body");
        const type = stanza.attrs.type;

        if (body && type === "groupchat" && from && from.startsWith(COORDINATOR_ROOM)) {
          const sender = from.split('/')[1] || 'unknown';

          // Skip own messages
          if (sender === NICKNAME) return;

          responses.push({ sender, body });

          // Display message with formatting
          if (sender === "Coordinator") {
            console.log(`\n🎯 [${sender}]`);
            console.log(`   ${body}`);
          } else {
            console.log(`\n💬 [${sender}]`);
            console.log(`   ${body.substring(0, 150)}${body.length > 150 ? '...' : ''}`);
          }

          // Extract session ID
          if (!sessionId) {
            const match = body.match(/session\s+(?:id|started)[:\s]*([a-f0-9-]{36})/i);
            if (match) {
              sessionId = match[1];
              console.log(`\n📋 Session ID: ${sessionId}`);
            }
          }

          // Check for solution (avoid false positives like "Solution request broadcast")
          const lowerBody = body.toLowerCase();
          const isSolutionRequest =
            lowerBody.includes("solution request") ||
            lowerBody.includes("request solutions") ||
            lowerBody.includes("waiting for agent solutions");
          const looksLikeSolution =
            /\b(solution|schedule|plan|allocation)\b/i.test(body) &&
            !isSolutionRequest;

          if (sender === "Coordinator" && looksLikeSolution) {
            solution = body;
            console.log("\n✅ Solution received!");

            // Wait a moment for any final messages
            await wait(2000);

            clearTimeout(timeoutHandle);
            xmpp.stop();
            resolve({ sessionId, solution, responses, completed: true });
          }

          // Check for errors
          if (body.toLowerCase().includes("error") || body.toLowerCase().includes("failed")) {
            if (sender === "Coordinator") {
              console.log("\n❌ Session encountered an error");
              await wait(2000);
              clearTimeout(timeoutHandle);
              xmpp.stop();
              resolve({ sessionId, solution, responses, error: body });
            }
          }
        }
      }
    });

    console.log("🔌 Connecting...");
    xmpp.start().catch((err) => {
      clearTimeout(timeoutHandle);
      reject(err);
    });
  });
}

// Main execution
console.log("Starting MFR session...\n");

runMfrSession(problem)
  .then((result) => {
    console.log("\n\n=== Session Summary ===");
    console.log(`Session ID: ${result.sessionId || 'N/A'}`);
    console.log(`Responses received: ${result.responses.length}`);
    console.log(`Solution delivered: ${result.solution ? 'Yes' : 'No'}`);
    if (result.solution) {
      console.log("\n=== Solution ===");
      console.log(result.solution);
    }

    if (result.completed) {
      console.log("\n✅ MFR session completed successfully");
      process.exit(0);
    } else if (result.error) {
      console.log("\n❌ MFR session failed");
      console.log(`Error: ${result.error}`);
      process.exit(1);
    } else if (result.timedOut) {
      console.log("\n⏱️  MFR session timed out");
      console.log("The coordinator may still be processing the request.");
      process.exit(2);
    } else {
      console.log("\n⚠️  MFR session ended without clear resolution");
      process.exit(3);
    }
  })
  .catch((err) => {
    console.error("\n❌ Session error:", err.message);
    process.exit(1);
  });
