import { registerXmppAccount, generatePassword } from "../lib/xmpp-register.js";

/**
 * Simple test script for client-side XMPP registration
 *
 * This tests XEP-0077 in-band registration from the client side,
 * without requiring SSH access to the server.
 *
 * Usage:
 *   node src/examples/test-registration.js
 */

const SERVICE = "xmpp://tensegrity.it:5222";
const DOMAIN = "tensegrity.it";
const USERNAME = `testbot-${Math.random().toString(16).slice(2, 8)}`;
const PASSWORD = generatePassword(16);

console.log("=== XMPP Client-Side Registration Test ===");
console.log(`Service: ${SERVICE}`);
console.log(`Domain: ${DOMAIN}`);
console.log(`Username: ${USERNAME}`);
console.log(`Password: ${PASSWORD}`);
console.log("");

console.log("Attempting registration from client side...");
console.log("(This does NOT require SSH access to the server)");
console.log("");

registerXmppAccount({
  service: SERVICE,
  domain: DOMAIN,
  username: USERNAME,
  password: PASSWORD,
  tls: { rejectUnauthorized: false },
  logger: console
})
  .then((result) => {
    console.log("");
    console.log("✅ SUCCESS!");
    console.log(result.message);
    console.log("");
    console.log("Credentials:");
    console.log(`  Username: ${USERNAME}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log(`  JID: ${USERNAME}@${DOMAIN}`);
    console.log("");
    console.log("You can now use these credentials to connect!");
    process.exit(0);
  })
  .catch((error) => {
    console.log("");
    console.log("❌ FAILED");
    console.log(`Error: ${error.message}`);
    console.log("");
    console.log("Common issues:");
    console.log("  - Server doesn't have 'register' module enabled");
    console.log("  - allow_registration = false in prosody.cfg.lua");
    console.log("  - invites_register module is blocking open registration");
    process.exit(1);
  });
