import { AgentRunner, loadAgentProfile } from "../src/index.js";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";

const profile = await loadAgentProfile("prolog");
if (!profile) {
  throw new Error("Missing prolog profile.");
}

const runner = new AgentRunner({
  profile,
  provider: new PrologProvider({ nickname: profile.nickname })
});

await runner.start();
