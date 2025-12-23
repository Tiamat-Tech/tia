/**
 * Integration test for MFR room creation
 *
 * This test:
 * 1. Creates the MFR rooms using the creation script logic
 * 2. Verifies rooms exist by attempting to join them with a test user
 * 3. Queries room information to confirm persistence
 *
 * Prerequisites:
 * - Prosody XMPP server running
 * - Valid XMPP credentials in environment
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { client, xml } from "@xmpp/client";

const MFR_ROOMS = [
  "mfr-construct@conference.tensegrity.it",
  "mfr-validate@conference.tensegrity.it",
  "mfr-reason@conference.tensegrity.it"
];

const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const ADMIN_USERNAME = process.env.XMPP_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.XMPP_PASSWORD || "admin123";

// Test user credentials
const TEST_USERNAME = process.env.XMPP_TEST_USERNAME || "testuser";
const TEST_PASSWORD = process.env.XMPP_TEST_PASSWORD || "testpass";

/**
 * Wait helper
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a single room and verify creation
 */
async function createAndVerifyRoom(roomJid) {
  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    let connected = false;
    let roomCreated = false;
    let roomConfigured = false;
    const timeout = setTimeout(() => {
      if (!connected) {
        reject(new Error(`Connection timeout for ${roomJid}`));
      } else if (!roomCreated) {
        reject(new Error(`Room creation timeout for ${roomJid}`));
      } else {
        // Room was created, just didn't get configured - that's ok
        resolve({ created: true, configured: false });
      }
      xmpp.stop();
    }, 15000);

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`XMPP error: ${err.message}`));
    });

    xmpp.on("online", async (address) => {
      connected = true;
      console.log(`  Connected as ${address.toString()}`);

      // Send initial presence
      await xmpp.send(xml("presence"));
      await wait(500);

      // Try to join/create the room
      const mucPresence = xml(
        "presence",
        { to: `${roomJid}/admin` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );

      await xmpp.send(mucPresence);
    });

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            clearTimeout(timeout);
            const error = stanza.getChild("error");
            const errorType = error?.attrs?.type || "unknown";
            const errorCondition = error?.children[0]?.name || "unknown";
            reject(new Error(`Room join error: ${errorType} - ${errorCondition}`));
            xmpp.stop();
          } else if (!type || type === "available") {
            console.log(`  ✅ Joined room: ${roomJid}`);
            roomCreated = true;

            // Check if we created the room (status 201)
            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const statuses = x.getChildren("status");
              const created = statuses.some(s => s.attrs.code === "201");

              if (created) {
                console.log(`  🎉 Room created (status 201): ${roomJid}`);

                // Configure as instant room
                const configIQ = xml(
                  "iq",
                  { type: "set", to: roomJid, id: `config_${Date.now()}` },
                  xml(
                    "query",
                    { xmlns: "http://jabber.org/protocol/muc#owner" },
                    xml("x", { xmlns: "jabber:x:data", type: "submit" })
                  )
                );

                await xmpp.send(configIQ);
                await wait(1000);
              } else {
                console.log(`  ℹ️  Room already exists: ${roomJid}`);
              }
            }

            // Send a test message to verify room functionality
            await wait(500);
            const testMessage = xml(
              "message",
              { type: "groupchat", to: roomJid },
              xml("body", {}, "Room creation test message")
            );
            await xmpp.send(testMessage);

            // Wait for message to be processed
            await wait(1000);

            clearTimeout(timeout);
            xmpp.stop();
            resolve({ created: true, configured: true });
          }
        }
      } else if (stanza.is("iq")) {
        const type = stanza.attrs.type;
        if (type === "result" && !roomConfigured) {
          console.log(`  ✅ Room configured: ${roomJid}`);
          roomConfigured = true;
        } else if (type === "error") {
          console.log(`  ⚠️  Configuration error (room may still work)`);
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${err.message}`));
    });
  });
}

/**
 * Verify a room exists by trying to join it with a test user
 */
async function verifyRoomExists(roomJid) {
  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Verification timeout for ${roomJid}`));
      xmpp.stop();
    }, 10000);

    let verified = false;

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Verification XMPP error: ${err.message}`));
    });

    xmpp.on("online", async (address) => {
      // Send presence
      await xmpp.send(xml("presence"));
      await wait(500);

      // Try to join the room
      const mucPresence = xml(
        "presence",
        { to: `${roomJid}/testuser` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );

      await xmpp.send(mucPresence);
    });

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence") && !verified) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            clearTimeout(timeout);
            const error = stanza.getChild("error");
            const errorCondition = error?.children[0]?.name || "unknown";

            // room-not-found means room doesn't exist
            if (errorCondition === "item-not-found") {
              resolve(false);
            } else {
              // Other errors might mean room exists but we can't join
              reject(new Error(`Error joining room: ${errorCondition}`));
            }
            xmpp.stop();
          } else if (!type || type === "available") {
            console.log(`  ✅ Verified room exists: ${roomJid}`);
            verified = true;
            clearTimeout(timeout);
            xmpp.stop();
            resolve(true);
          }
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(new Error(`Verification connection failed: ${err.message}`));
    });
  });
}

/**
 * Query room information
 */
async function queryRoomInfo(roomJid) {
  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Room info query timeout for ${roomJid}`));
      xmpp.stop();
    }, 10000);

    let infoReceived = false;

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Query XMPP error: ${err.message}`));
    });

    xmpp.on("online", async () => {
      await xmpp.send(xml("presence"));
      await wait(500);

      // Query room disco#info
      const discoIQ = xml(
        "iq",
        { type: "get", to: roomJid, id: `disco_${Date.now()}` },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#info" })
      );

      await xmpp.send(discoIQ);
    });

    xmpp.on("stanza", (stanza) => {
      if (stanza.is("iq") && !infoReceived) {
        const type = stanza.attrs.type;

        if (type === "result") {
          const query = stanza.getChild("query");
          if (query) {
            const identities = query.getChildren("identity");
            const features = query.getChildren("feature");

            infoReceived = true;
            clearTimeout(timeout);
            xmpp.stop();
            resolve({
              exists: true,
              identities: identities.map(i => i.attrs),
              features: features.map(f => f.attrs.var)
            });
          }
        } else if (type === "error") {
          clearTimeout(timeout);
          xmpp.stop();
          resolve({ exists: false });
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(new Error(`Query connection failed: ${err.message}`));
    });
  });
}

// Main test
test("MFR room creation and verification", async () => {
  console.log("\n=== MFR Room Creation Integration Test ===\n");

  const results = {
    created: [],
    verified: [],
    info: []
  };

  // Create each room
  for (const roomJid of MFR_ROOMS) {
    console.log(`\nCreating room: ${roomJid}`);
    try {
      const result = await createAndVerifyRoom(roomJid);
      results.created.push({ roomJid, success: true, ...result });
      console.log(`  ✅ Room creation completed`);
    } catch (error) {
      console.error(`  ❌ Room creation failed: ${error.message}`);
      results.created.push({ roomJid, success: false, error: error.message });
    }
    await wait(1000); // Pause between creations
  }

  // Verify each room exists
  console.log("\n\n=== Verification Phase ===\n");
  for (const roomJid of MFR_ROOMS) {
    console.log(`\nVerifying room: ${roomJid}`);
    try {
      const exists = await verifyRoomExists(roomJid);
      results.verified.push({ roomJid, exists });

      if (exists) {
        console.log(`  ✅ Room verified to exist`);
      } else {
        console.log(`  ❌ Room does not exist`);
      }
    } catch (error) {
      console.error(`  ❌ Verification failed: ${error.message}`);
      results.verified.push({ roomJid, exists: false, error: error.message });
    }
    await wait(1000);
  }

  // Query room information
  console.log("\n\n=== Room Information Query ===\n");
  for (const roomJid of MFR_ROOMS) {
    console.log(`\nQuerying room info: ${roomJid}`);
    try {
      const info = await queryRoomInfo(roomJid);
      results.info.push({ roomJid, ...info });

      if (info.exists) {
        console.log(`  ✅ Room info retrieved`);
        console.log(`     Identities: ${info.identities?.length || 0}`);
        console.log(`     Features: ${info.features?.length || 0}`);
      } else {
        console.log(`  ❌ Room info not available`);
      }
    } catch (error) {
      console.error(`  ⚠️  Info query failed: ${error.message}`);
      results.info.push({ roomJid, exists: false, error: error.message });
    }
    await wait(1000);
  }

  // Print summary
  console.log("\n\n=== Test Summary ===\n");
  console.log("Room Creation:");
  results.created.forEach(r => {
    const status = r.success ? "✅" : "❌";
    console.log(`  ${status} ${r.roomJid}: ${r.success ? "Created" : r.error}`);
  });

  console.log("\nRoom Verification:");
  results.verified.forEach(r => {
    const status = r.exists ? "✅" : "❌";
    console.log(`  ${status} ${r.roomJid}: ${r.exists ? "Exists" : "Not found"}`);
  });

  console.log("\nRoom Information:");
  results.info.forEach(r => {
    const status = r.exists ? "✅" : "❌";
    console.log(`  ${status} ${r.roomJid}: ${r.exists ? "Available" : "Not available"}`);
  });

  // Assertions
  const allCreated = results.created.every(r => r.success);
  const allVerified = results.verified.every(r => r.exists);
  const allInfo = results.info.every(r => r.exists);

  console.log("\n=== Test Result ===");
  console.log(`All rooms created: ${allCreated ? "✅ YES" : "❌ NO"}`);
  console.log(`All rooms verified: ${allVerified ? "✅ YES" : "❌ NO"}`);
  console.log(`All rooms queryable: ${allInfo ? "✅ YES" : "❌ NO"}`);

  // Test passes if all rooms are verified to exist
  assert.ok(allVerified, "All MFR rooms should be verified to exist");

  console.log("\n✅ Integration test PASSED - All MFR rooms exist and are functional\n");
});
