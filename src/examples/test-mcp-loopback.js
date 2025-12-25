import dotenv from "dotenv";
import { xml } from "@xmpp/client";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { autoConnectXmpp } from "../lib/xmpp-auto-connect.js";

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function waitForRoomJoin({ xmpp, roomJid, nickname, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for MUC join confirmation"));
    }, timeoutMs);

    const onStanza = (stanza) => {
      if (!stanza.is("presence")) return;
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;
      if (from === `${roomJid}/${nickname}` && !type) {
        clearTimeout(timeout);
        xmpp.off("stanza", onStanza);
        resolve();
      }
    };

    xmpp.on("stanza", onStanza);
  });
}

async function waitForLoopbackEcho({ xmpp, roomJid, loopbackNick, token, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for Loopback response"));
    }, timeoutMs);

    const onStanza = (stanza) => {
      if (!stanza.is("message")) return;
      if (stanza.attrs.type !== "groupchat") return;
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      if (!from || !body) return;
      if (!from.startsWith(roomJid)) return;
      const sender = from.split("/")[1] || "";
      if (sender !== loopbackNick) return;
      if (!body.includes(token)) return;
      clearTimeout(timeout);
      xmpp.off("stanza", onStanza);
      resolve(body);
    };

    xmpp.on("stanza", onStanza);
  });
}

async function main() {
  const profileName = requireEnv("MCP_LOOPBACK_PROFILE");
  const testUsername = requireEnv("XMPP_TEST_USERNAME");
  const testNickname = requireEnv("XMPP_TEST_NICKNAME");
  const timeoutMs = Number(requireEnv("MCP_LOOPBACK_TIMEOUT_MS"));
  const autoRegister = requireEnv("XMPP_TEST_AUTOREGISTER") === "true";
  const secretsPath = requireEnv("AGENT_SECRETS_PATH");

  if (!Number.isFinite(timeoutMs)) {
    throw new Error("MCP_LOOPBACK_TIMEOUT_MS must be a number");
  }

  const profile = await loadAgentProfile(profileName);
  if (!profile) {
    throw new Error(`Loopback agent profile not found: ${profileName}.ttl`);
  }
  const fileConfig = profile.toConfig();
  if (!fileConfig?.xmpp?.service || !fileConfig?.xmpp?.domain) {
    throw new Error("Loopback profile missing XMPP service or domain");
  }
  if (!fileConfig.roomJid || !fileConfig.nickname) {
    throw new Error("Loopback profile missing roomJid or nickname");
  }

  const { xmpp } = await autoConnectXmpp({
    service: fileConfig.xmpp.service,
    domain: fileConfig.xmpp.domain,
    username: testUsername,
    password: process.env.XMPP_TEST_PASSWORD,
    resource: testNickname,
    tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" },
    autoRegister,
    secretsPath
  });

  xmpp.on("error", (err) => {
    console.error("[MCP Loopback Test] XMPP Error:", err);
  });

  await xmpp.send(xml("presence"));
  await xmpp.send(xml(
    "presence",
    { to: `${fileConfig.roomJid}/${testNickname}` },
    xml("x", { xmlns: "http://jabber.org/protocol/muc" })
  ));

  console.log(`[MCP Loopback Test] Joining room ${fileConfig.roomJid} as ${testNickname}`);
  await waitForRoomJoin({
    xmpp,
    roomJid: fileConfig.roomJid,
    nickname: testNickname,
    timeoutMs
  });

  const token = `loopback-${Date.now()}`;
  const message = `${fileConfig.nickname}: ping ${token}`;

  console.log(`[MCP Loopback Test] Sending: ${message}`);
  await xmpp.send(xml(
    "message",
    { type: "groupchat", to: fileConfig.roomJid },
    xml("body", {}, message)
  ));

  const response = await waitForLoopbackEcho({
    xmpp,
    roomJid: fileConfig.roomJid,
    loopbackNick: fileConfig.nickname,
    token,
    timeoutMs
  });

  console.log(`[MCP Loopback Test] Response: ${response}`);
  await xmpp.stop();
}

main().catch((err) => {
  console.error("[MCP Loopback Test] Failed:", err.message);
  process.exit(1);
});
