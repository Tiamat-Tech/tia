import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/agents/profile-loader.js";

describe("Capability profile loading", () => {
  it("loads coordinator profile with capabilities and aliases", async () => {
    const profile = await loadAgentProfile("coordinator");

    expect(profile).toBeDefined();
    const capabilities = profile.getCapabilitiesArray();
    expect(Array.isArray(capabilities)).toBe(true);
    expect(capabilities.length).toBeGreaterThan(0);
  });

  it("extracts capability command and aliases", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const startCapability = capabilities.find(
      cap => cap.command === "mfr-start"
    );

    expect(startCapability).toBeDefined();
    expect(startCapability.name).toBeDefined();
    expect(startCapability.label).toBe("Start MFR Session");
    expect(startCapability.description).toContain("Model-First Reasoning");
    expect(startCapability.command).toBe("mfr-start");
    expect(startCapability.aliases).toContain("start");
  });

  it("extracts all MFR capabilities from coordinator profile", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const expectedCommands = [
      "mfr-start",
      "mfr-debate",
      "mfr-contribute",
      "mfr-validate",
      "mfr-solve",
      "mfr-status",
      "mfr-list",
      "mfr-help"
    ];

    const actualCommands = capabilities.map(cap => cap.command);

    expectedCommands.forEach(cmd => {
      expect(actualCommands).toContain(cmd);
    });
  });

  it("aliases are arrays", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    capabilities.forEach(cap => {
      expect(Array.isArray(cap.aliases)).toBe(true);
    });
  });

  it("debate capability has correct alias", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const debateCapability = capabilities.find(
      cap => cap.command === "mfr-debate"
    );

    expect(debateCapability).toBeDefined();
    expect(debateCapability.aliases).toContain("debate");
  });

  it("status capability has correct alias", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const statusCapability = capabilities.find(
      cap => cap.command === "mfr-status"
    );

    expect(statusCapability).toBeDefined();
    expect(statusCapability.aliases).toContain("status");
  });

  it("handles profiles without capabilities gracefully", async () => {
    // Chair profile may or may not have capabilities defined yet
    const profile = await loadAgentProfile("chair");

    expect(profile).toBeDefined();
    const capabilities = profile.getCapabilitiesArray();
    expect(Array.isArray(capabilities)).toBe(true);
    // Should be empty array if no capabilities, not undefined
  });

  it("capability objects are properly instantiated", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const cap = capabilities[0];

    // Should have Capability class methods
    expect(typeof cap.matches).toBe("function");
    expect(typeof cap.extractContent).toBe("function");
  });

  it("loaded capabilities can match commands", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const startCap = capabilities.find(
      cap => cap.command === "mfr-start"
    );

    expect(startCap.matches("mfr-start problem X")).toBe(true);
    expect(startCap.matches("start problem X")).toBe(true);
    expect(startCap.matches("other command")).toBe(false);
  });

  it("loaded capabilities can extract content", async () => {
    const profile = await loadAgentProfile("coordinator");
    const capabilities = profile.getCapabilitiesArray();

    const startCap = capabilities.find(
      cap => cap.command === "mfr-start"
    );

    expect(startCap.extractContent("mfr-start problem description")).toBe(
      "problem description"
    );
    expect(startCap.extractContent("start problem description")).toBe(
      "problem description"
    );
  });

  it("backward compatible: old profiles without capabilities still load", async () => {
    // Test that profile loading doesn't break for profiles without capability definitions
    const profile = await loadAgentProfile("mistral");

    expect(profile).toBeDefined();
    const capabilities = profile.getCapabilitiesArray();
    expect(Array.isArray(capabilities)).toBe(true);
    // Empty array for profiles without capabilities
  });
});
