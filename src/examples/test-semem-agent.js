import dotenv from "dotenv";
import { SememClient } from "../lib/semem-client.js";
import { loadAgentProfile } from "../services/agent-registry.js";

dotenv.config();

const profile = loadAgentProfile(process.env.AGENT_PROFILE || "default");
const sememClient = new SememClient({
  baseUrl: profile.sememConfig.baseUrl,
  authToken: profile.sememConfig.authToken
});

const question = process.argv.slice(2).join(" ") || "What is Semem?";

async function main() {
  console.log(`Checking Semem at ${profile.sememConfig.baseUrl} using profile "${profile.profileName}"`);

  try {
    const inspect = await sememClient.inspect();
    console.log("Inspect OK:", JSON.stringify(inspect, null, 2));
  } catch (error) {
    console.error("Inspect failed:", error.message);
  }

  try {
    const response = await sememClient.chatEnhanced(question, profile.features);
    const content = response?.content || response?.answer || JSON.stringify(response);
    console.log("Chat/enhanced response:");
    console.log(content);
  } catch (error) {
    console.error("Chat/enhanced failed:", error.message);
    process.exitCode = 1;
  }
}

main();
