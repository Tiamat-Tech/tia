import { client, xml } from "@xmpp/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const XMPP_DOMAIN = "xmpp";
const XMPP_SERVICE = "xmpp://localhost:5222";

async function createXMPPClient(username, password) {
  return client({
    service: XMPP_SERVICE,
    domain: XMPP_DOMAIN,
    username: username,
    password: password,
    tls: { rejectUnauthorized: false },
  });
}

async function checkUserExists(username) {
  return new Promise((resolve) => {
    const testClient = client({
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: username,
      password: "invalid",
      tls: { rejectUnauthorized: false },
    });

    testClient.on("error", (err) => {
      if (err.condition === 'not-authorized') {
        resolve(true);
      } else {
        resolve(false);
      }
      testClient.stop();
    });

    testClient.on("online", () => {
      resolve(true);
      testClient.stop();
    });

    testClient.start().catch(() => resolve(false));
  });
}

async function createUser(adminClient, username, password) {
  return new Promise((resolve, reject) => {
    const iq = xml(
      "iq",
      { type: "set", to: XMPP_DOMAIN, id: `reg-${Date.now()}` },
      xml(
        "query",
        { xmlns: "jabber:iq:register" },
        xml("username", {}, username),
        xml("password", {}, password)
      )
    );

    const timeout = setTimeout(() => {
      reject(new Error(`Timeout creating user ${username}`));
    }, 10000);

    adminClient.on("stanza", (stanza) => {
      if (stanza.is("iq") && stanza.attrs.id === iq.attrs.id) {
        clearTimeout(timeout);
        if (stanza.attrs.type === "result") {
          resolve(`User ${username} created successfully`);
        } else {
          const error = stanza.getChild("error");
          const errorText = error ? error.getChildText("text") || error.attrs.code : "Unknown error";
          reject(new Error(`Failed to create user ${username}: ${errorText}`));
        }
      }
    });

    adminClient.send(iq).catch(reject);
  });
}

async function addUsersFromJson(jsonFile = "users.json") {
  try {
    const usersPath = path.resolve(__dirname, jsonFile);
    
    if (!fs.existsSync(usersPath)) {
      console.error(`Users file not found: ${usersPath}`);
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    if (!Array.isArray(usersData)) {
      console.error('Users file must contain an array of user objects');
      return;
    }

    console.log(`Connecting as admin to create users...`);
    const adminClient = await createXMPPClient(ADMIN_USERNAME, ADMIN_PASSWORD);

    await new Promise((resolve, reject) => {
      adminClient.on("error", reject);
      adminClient.on("online", resolve);
      adminClient.start().catch(reject);
    });

    console.log(`Connected as admin@${XMPP_DOMAIN}`);

    for (const user of usersData) {
      if (!user.username || !user.password) {
        console.warn('Skipping user with missing username or password:', user);
        continue;
      }

      console.log(`Checking if user ${user.username} exists...`);
      const exists = await checkUserExists(user.username);
      
      if (exists) {
        console.log(`User ${user.username} already exists, skipping`);
        continue;
      }

      try {
        console.log(`Creating user ${user.username}...`);
        const result = await createUser(adminClient, user.username, user.password);
        console.log(result);
      } catch (error) {
        console.error(`Error creating user ${user.username}:`, error.message);
      }
    }

    await adminClient.stop();
    console.log('User creation process completed');
    
  } catch (error) {
    console.error('Error in addUsersFromJson:', error);
    process.exit(1);
  }
}

const jsonFile = process.argv[2] || "users.json";
addUsersFromJson(jsonFile).catch(console.error);