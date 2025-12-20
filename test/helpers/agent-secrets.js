import path from "path";

process.env.AGENT_SECRETS_PATH = path.join(
  process.cwd(),
  "test",
  "fixtures",
  "agent-secrets.json"
);
