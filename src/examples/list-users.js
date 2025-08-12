import { client, xml } from "@xmpp/client";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const XMPP_DOMAIN = "xmpp";
const XMPP_SERVICE = "xmpp://localhost:5222";

async function listUsers() {
  try {
    const adminClient = client({
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      tls: { rejectUnauthorized: false },
    });

    console.log(`Connecting as admin to list users...`);

    await new Promise((resolve, reject) => {
      adminClient.on("error", reject);
      adminClient.on("online", resolve);
      adminClient.start().catch(reject);
    });

    console.log(`Connected as admin@${XMPP_DOMAIN}`);

    // Get server statistics which may include user info
    const statsQuery = xml(
      "iq",
      { type: "get", to: XMPP_DOMAIN, id: `stats-${Date.now()}` },
      xml("query", { xmlns: "http://jabber.org/protocol/stats" })
    );

    const statsResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout getting server stats"));
      }, 10000);

      adminClient.on("stanza", (stanza) => {
        if (stanza.is("iq") && stanza.attrs.id === statsQuery.attrs.id) {
          clearTimeout(timeout);
          resolve(stanza);
        }
      });

      adminClient.send(statsQuery).catch(reject);
    });

    console.log("\nServer Statistics:");
    if (statsResult.attrs.type === "result") {
      const query = statsResult.getChild("query");
      if (query) {
        const stats = query.getChildren("stat");
        stats.forEach(stat => {
          const name = stat.attrs.name;
          const value = stat.getChildText("value");
          if (name && value) {
            console.log(`  ${name}: ${value}`);
          }
        });
      } else {
        console.log("  No statistics available");
      }
    } else {
      console.log("  Failed to get statistics");
    }

    // Try to get roster/contact list (this may show some user info)
    const rosterQuery = xml(
      "iq",
      { type: "get", id: `roster-${Date.now()}` },
      xml("query", { xmlns: "jabber:iq:roster" })
    );

    try {
      const rosterResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout getting roster"));
        }, 5000);

        adminClient.on("stanza", (stanza) => {
          if (stanza.is("iq") && stanza.attrs.id === rosterQuery.attrs.id) {
            clearTimeout(timeout);
            resolve(stanza);
          }
        });

        adminClient.send(rosterQuery).catch(reject);
      });

      console.log("\nRoster Information:");
      if (rosterResult.attrs.type === "result") {
        const query = rosterResult.getChild("query");
        if (query) {
          const items = query.getChildren("item");
          if (items.length > 0) {
            items.forEach(item => {
              console.log(`  Contact: ${item.attrs.jid} (${item.attrs.name || 'No name'})`);
            });
          } else {
            console.log("  No contacts in roster");
          }
        }
      } else {
        console.log("  Failed to get roster");
      }
    } catch (error) {
      console.log(`  Roster query failed: ${error.message}`);
    }

    await adminClient.stop();

    console.log("\nNote: XMPP servers typically don't expose user lists for privacy reasons.");
    console.log("To check if specific users exist, try connecting with their credentials or");
    console.log("use the server's admin tools directly:");
    console.log("  docker exec tbox-xmpp-1 prosodyctl adduser username@xmpp");
    
  } catch (error) {
    console.error('Error listing users:', error.message);
    process.exit(1);
  }
}

listUsers().catch(console.error);