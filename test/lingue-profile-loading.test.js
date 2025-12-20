import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/agents/profile-loader.js";

const LINGUE_NS = "http://purl.org/stuff/lingue/";
const IBIS_NS = "https://vocab.methodandstructure.com/ibis#";

describe("Lingue profile loading", () => {
  it("loads Lingue capabilities for mistral profile", async () => {
    const profile = await loadAgentProfile("mistral");

    expect(profile.lingue.supports).toBeInstanceOf(Set);
    expect(profile.lingue.supports.has(`${LINGUE_NS}HumanChat`)).toBe(true);
    expect(profile.lingue.supports.has(`${LINGUE_NS}IBISText`)).toBe(true);
    expect(profile.lingue.prefers).toBe(`${LINGUE_NS}HumanChat`);
    expect(profile.lingue.understands.has(IBIS_NS)).toBe(true);
  });

  it("loads Lingue profile details", async () => {
    const profile = await loadAgentProfile("mistral");

    expect(profile.lingue.profile).toBeTruthy();
    expect(profile.lingue.profile.availability).toBe(`${LINGUE_NS}Process`);
    expect(profile.lingue.profile.inputs).toContain("XMPP MUC text");
    expect(profile.lingue.profile.outputs).toContain("XMPP MUC text + IBIS RDF");
  });

  it("loads demo profile with HumanChat only", async () => {
    const profile = await loadAgentProfile("demo");

    expect(profile.lingue.supports.has(`${LINGUE_NS}HumanChat`)).toBe(true);
    expect(profile.lingue.supports.has(`${LINGUE_NS}IBISText`)).toBe(false);
    expect(profile.lingue.understands.size).toBe(0);
  });
});
