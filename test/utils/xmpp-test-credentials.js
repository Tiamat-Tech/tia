import fs from "fs";
import path from "path";

export function loadXmppTestConfig() {
  const requiredEnv = ["XMPP_SERVICE", "XMPP_DOMAIN", "MUC_ROOM", "TEST_XMPP_ACCOUNT"];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  const secretsPath = process.env.AGENT_SECRETS_PATH ||
    path.join(process.cwd(), "config", "agents", "secrets.json");

  if (!fs.existsSync(secretsPath)) {
    return {
      missingEnv: [...missingEnv, "AGENT_SECRETS_PATH or config/agents/secrets.json"]
    };
  }

  const secrets = JSON.parse(fs.readFileSync(secretsPath, "utf8"));
  const accountKey = process.env.TEST_XMPP_ACCOUNT;
  const entry = accountKey ? secrets[accountKey] : null;

  if (!entry) {
    return {
      missingEnv: [...missingEnv, `secrets.json:${accountKey || "TEST_XMPP_ACCOUNT"}`]
    };
  }

  const username = typeof entry === "string" ? accountKey : entry.username || accountKey;
  const password = typeof entry === "string" ? entry : entry.password;

  if (!username || !password) {
    return {
      missingEnv: [...missingEnv, `secrets.json:${accountKey}`]
    };
  }

  return {
    missingEnv,
    xmppConfig: {
      service: process.env.XMPP_SERVICE,
      domain: process.env.XMPP_DOMAIN,
      username,
      password,
      tls: { rejectUnauthorized: false }
    },
    mucRoom: process.env.MUC_ROOM,
    accountKey
  };
}
