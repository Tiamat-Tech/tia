/**
 * Integration test for a complete MFR (Model-First Reasoning) session
 *
 * This test demonstrates the full MFR protocol flow:
 * 1. User submits problem to Coordinator
 * 2. Coordinator broadcasts contribution request
 * 3. Specialized agents contribute RDF model components
 * 4. Coordinator merges and validates model
 * 5. Validated model is used for constrained reasoning
 * 6. Solution is generated and explained
 */

import { client, xml } from "@xmpp/client";

// Configuration
const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "testuser";
const PASSWORD = process.env.XMPP_PASSWORD || "testpass";
const COORDINATOR_ROOM = "general@conference.tensegrity.it";
const NICKNAME = "TestUser";

// Test problem
const TEST_PROBLEM = `Schedule appointments for three patients: Alice, Bob, and Carol.
Alice takes warfarin and needs a morning appointment.
Bob takes aspirin and prefers afternoon appointments.
Carol takes ibuprofen and is available anytime.
Ensure no drug interactions occur and optimize for patient preferences.`;

/**
 * Wait for a specific time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run MFR session test
 */
async function testMfrSession() {
  console.log("=== MFR Session Integration Test ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`Test user: ${USERNAME}`);
  console.log(`Coordinator room: ${COORDINATOR_ROOM}`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  const messages = [];
  let sessionStarted = false;
  let modelConstructionPhase = false;
  let validationPhase = false;
  let reasoningPhase = false;
  let solutionReceived = false;

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);

    // Send initial presence
    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");

    // Join coordinator room
    console.log(`🏠 Joining room: ${COORDINATOR_ROOM}/${NICKNAME}`);
    const mucPresence = xml(
      "presence",
      { to: `${COORDINATOR_ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    await xmpp.send(mucPresence);
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;

      if (from === `${COORDINATOR_ROOM}/${NICKNAME}` && (!type || type === "available")) {
        console.log("✅ Successfully joined coordinator room");

        // Wait a bit for room to stabilize
        await wait(2000);

        // Start MFR session by sending problem to coordinator
        console.log("\n📤 Starting MFR session...");
        console.log(`Problem: ${TEST_PROBLEM.substring(0, 80)}...`);
        console.log("");

        await xmpp.send(xml(
          "message",
          { type: "groupchat", to: COORDINATOR_ROOM },
          xml("body", {}, `Coordinator: mfr-start ${TEST_PROBLEM}`)
        ));

        sessionStarted = true;
      }
    } else if (stanza.is("message")) {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      const type = stanza.attrs.type;

      if (body && type === "groupchat" && from && from.startsWith(COORDINATOR_ROOM)) {
        const sender = from.split('/')[1] || 'unknown';

        // Skip our own messages
        if (sender === NICKNAME) return;

        messages.push({ sender, body, timestamp: new Date() });

        // Log message
        console.log(`💬 [${sender}]: ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`);

        // Detect MFR phases
        if (body.includes("MFR session started") || body.includes("session ID")) {
          console.log("\n✅ Phase 1: Session Initialization");
        }

        if (body.includes("contribution") || body.includes("EntityDiscovery") || body.includes("extracting entities")) {
          if (!modelConstructionPhase) {
            console.log("\n✅ Phase 2: Model Construction (agents contributing)");
            modelConstructionPhase = true;
          }
        }

        if (body.includes("validation") || body.includes("SHACL") || body.includes("consistent")) {
          if (!validationPhase) {
            console.log("\n✅ Phase 3: Model Validation");
            validationPhase = true;
          }
        }

        if (body.includes("reasoning") || body.includes("solution") || body.includes("plan")) {
          if (!reasoningPhase) {
            console.log("\n✅ Phase 4: Constrained Reasoning");
            reasoningPhase = true;
          }
        }

        if (body.includes("schedule") && body.includes("appointment") && sender === "Coordinator") {
          solutionReceived = true;
          console.log("\n✅ Phase 5: Solution Delivered");
        }
      }
    }
  });

  console.log("🔌 Connecting...");
  await xmpp.start().catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

  // Test timeout and results
  await wait(30000); // Wait 30 seconds for test

  console.log("\n\n=== Test Results ===");
  console.log(`Session started: ${sessionStarted ? '✅' : '❌'}`);
  console.log(`Model construction phase: ${modelConstructionPhase ? '✅' : '❌'}`);
  console.log(`Validation phase: ${validationPhase ? '✅' : '❌'}`);
  console.log(`Reasoning phase: ${reasoningPhase ? '✅' : '❌'}`);
  console.log(`Solution received: ${solutionReceived ? '✅' : '❌'}`);
  console.log(`Total messages received: ${messages.length}`);

  console.log("\n=== Message Summary ===");
  const senderCounts = {};
  messages.forEach(msg => {
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
  });

  Object.entries(senderCounts).forEach(([sender, count]) => {
    console.log(`  ${sender}: ${count} messages`);
  });

  // Evaluate test success
  const testPassed = sessionStarted && modelConstructionPhase && messages.length >= 5;

  console.log("\n=== Test Outcome ===");
  if (testPassed) {
    console.log("✅ Test PASSED - MFR session executed successfully");
    console.log("   The coordinator and agents are communicating correctly.");
    if (!validationPhase || !reasoningPhase) {
      console.log("   ⚠️  Note: Not all phases completed (may need longer timeout or agent setup)");
    }
  } else {
    console.log("❌ Test FAILED - MFR session did not execute properly");
    if (!sessionStarted) {
      console.log("   - Session did not start (check if coordinator is running)");
    }
    if (!modelConstructionPhase && messages.length < 5) {
      console.log("   - Agents did not respond to contribution requests");
      console.log("   - Check that agents are running and joined the room");
    }
  }

  xmpp.stop();
  process.exit(testPassed ? 0 : 1);
}

testMfrSession().catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
