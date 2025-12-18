import dotenv from "dotenv";
import { SememClient } from "../lib/semem-client.js";

dotenv.config();

const sememConfig = {
  baseUrl: process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env.SEMEM_AUTH_TOKEN,
  timeoutMs: parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "8000", 10)
};

const client = new SememClient(sememConfig);

const tellText = process.argv[2] || "Glitch is a canary";
const askText = process.argv[3] || "What is Glitch?";

async function main() {
  console.log("Semem direct test");
  console.log(`Base URL: ${sememConfig.baseUrl}`);
  console.log(`Tell: ${tellText}`);
  console.log(`Ask: ${askText}`);

  try {
    const tellResult = await client.tell(tellText, {
      metadata: { source: "semem-direct-test" }
    });
    console.log("Tell result:", tellResult);
  } catch (err) {
    console.error("Tell failed:", err.message);
  }

  try {
    const askResult = await client.ask(`${askText}\n\nKeep responses brief.`, {
      useContext: true
    });
    console.log("Ask result:", askResult);
  } catch (err) {
    console.error("Ask failed:", err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
