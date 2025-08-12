import { client, xml } from "@xmpp/client";

async function discoverServices() {
  console.log("=== XMPP Service Discovery ===");
  console.log("");

  const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "admin",
    password: "admin123",
    tls: { rejectUnauthorized: false },
  });

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);
    
    // Send initial presence
    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");
    
    console.log("\n🔍 Discovering services on server...");
    
    // Discover services on the main domain
    await xmpp.send(xml(
      "iq",
      { type: "get", to: "xmpp", id: "disco_items" },
      xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
    ));
    
    // Also try to discover what conference.xmpp supports
    setTimeout(async () => {
      console.log("\n🔍 Checking conference.xmpp specifically...");
      await xmpp.send(xml(
        "iq",
        { type: "get", to: "conference.xmpp", id: "disco_conf_info" },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#info" })
      ));
    }, 2000);
    
    // Try a different room name to see if it's a room-specific issue
    setTimeout(async () => {
      console.log("\n🔍 Trying to create a test room...");
      await xmpp.send(xml("presence", { to: "testroom@conference.xmpp/testuser" }));
    }, 4000);
  });

  xmpp.on("stanza", (stanza) => {
    if (stanza.is("iq")) {
      const type = stanza.attrs.type;
      const id = stanza.attrs.id;
      const from = stanza.attrs.from;
      
      if (id === "disco_items") {
        console.log("\n📋 Services discovered on server:");
        if (type === "result") {
          const query = stanza.getChild("query");
          if (query) {
            const items = query.getChildren("item");
            if (items.length > 0) {
              items.forEach(item => {
                console.log(`  ✅ ${item.attrs.jid} - ${item.attrs.name || 'No name'}`);
              });
            } else {
              console.log("  ⚠️  No services found");
            }
          }
        } else {
          console.log("  ❌ Failed to get services list");
        }
      } else if (id === "disco_conf_info") {
        console.log("\n📋 Conference service info:");
        if (type === "result") {
          console.log("  ✅ conference.xmpp is responding!");
          const query = stanza.getChild("query");
          if (query) {
            const features = query.getChildren("feature");
            console.log("  Features:");
            features.forEach(feature => {
              console.log(`    - ${feature.attrs.var}`);
            });
          }
        } else if (type === "error") {
          console.log("  ❌ conference.xmpp returned error:");
          const error = stanza.getChild("error");
          if (error) {
            const condition = error.children[0];
            if (condition) {
              console.log(`    ${condition.name}`);
            }
          }
        }
      }
    } else if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;
      
      if (from && from.includes("testroom@conference.xmpp")) {
        console.log("\n🏠 Test room response:");
        if (type === "error") {
          const error = stanza.getChild("error");
          if (error) {
            const condition = error.children[0];
            console.log(`  ❌ Error: ${condition ? condition.name : 'unknown'}`);
          }
        } else {
          console.log(`  ✅ Test room joined successfully!`);
        }
        
        // We're done with testing
        setTimeout(() => {
          console.log("\n=== Discovery Complete ===");
          xmpp.stop();
          process.exit(0);
        }, 1000);
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);
  
  // Timeout after 15 seconds
  setTimeout(() => {
    console.log("⏰ Discovery timeout reached");
    process.exit(0);
  }, 15000);
}

discoverServices().catch(console.error);