import { AgentRunner } from "../agents/core/agent-runner.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";

/**
 * Create an agent from a profile file (.ttl) and provider instance.
 * This is the config-driven approach - loads configuration from Turtle files.
 *
 * @param {string} profileName - Name of the profile file (without .ttl extension)
 * @param {Object} provider - Provider instance (must implement handle() method)
 * @param {Object} options - Optional configuration
 * @param {string} options.profileDir - Directory containing profile .ttl files (default: ./config/agents or AGENT_PROFILE_DIR env)
 * @param {string} options.secretsPath - Path to secrets.json file (default: <profileDir>/secrets.json)
 * @param {Object} options.logger - Logger instance (default: console)
 * @param {boolean} options.allowSelfMessages - Include bot's own messages (default: false)
 * @param {Object} options.historyStore - Custom history store instance
 * @param {number} options.maxAgentRounds - Maximum agent-to-agent interaction rounds (default: from system config)
 * @returns {Promise<AgentRunner>} AgentRunner instance ready to start
 *
 * @example
 * import { createAgent, DemoProvider } from "tia-agents";
 *
 * const runner = await createAgent("mybot", new DemoProvider(), {
 *   profileDir: "./config/agents",
 *   logger: console
 * });
 *
 * await runner.start();
 */
export async function createAgent(profileName, provider, options = {}) {
  if (!profileName) {
    throw new Error("profileName is required");
  }
  if (!provider) {
    throw new Error("provider is required");
  }

  const profile = await loadAgentProfile(profileName, {
    profileDir: options.profileDir,
    secretsPath: options.secretsPath
  });

  if (!profile) {
    throw new Error(`Profile not found: ${profileName}`);
  }

  const config = profile.toConfig();
  const logger = options.logger || console;

  // Load agent roster and system config if available
  let agentRoster;
  let systemConfig;
  try {
    agentRoster = await loadAgentRoster(options.profileDir);
  } catch (err) {
    logger.warn?.("Could not load agent roster:", err.message);
  }

  try {
    systemConfig = await loadSystemConfig(options.profileDir);
  } catch (err) {
    logger.warn?.("Could not load system config:", err.message);
  }

  // Create Lingue negotiator if profile supports Lingue modes
  let negotiator;
  if (profile.lingue && profile.lingue.supports && profile.lingue.supports.length > 0) {
    const handlers = {};

    if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
      handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
    }
    if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
      handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
    }

    negotiator = new LingueNegotiator({
      profile,
      handlers,
      logger
    });
  }

  return new AgentRunner({
    xmppConfig: config.xmpp,
    roomJid: profile.roomJid,
    nickname: profile.nickname,
    provider,
    negotiator,
    mentionDetector: createMentionDetector(profile.nickname, [profile.nickname]),
    commandParser: defaultCommandParser,
    allowSelfMessages: options.allowSelfMessages || false,
    historyStore: options.historyStore,
    maxAgentRounds: options.maxAgentRounds || systemConfig?.maxAgentRounds,
    agentRoster,
    logger
  });
}

/**
 * Create an agent with simple programmatic configuration (no profile file needed).
 * This is the programmatic approach - all configuration provided directly.
 *
 * @param {Object} config - Agent configuration
 * @param {Object} config.xmppConfig - XMPP connection configuration
 * @param {string} config.xmppConfig.service - XMPP server URL (e.g., "xmpp://localhost:5222")
 * @param {string} config.xmppConfig.domain - XMPP domain (e.g., "xmpp")
 * @param {string} config.xmppConfig.username - Bot username
 * @param {string} config.xmppConfig.password - Bot password (optional if autoRegister=true)
 * @param {string} config.xmppConfig.resource - XMPP resource (optional)
 * @param {boolean} config.autoRegister - Auto-register if authentication fails (optional, default: false)
 * @param {string} config.secretsPath - Path to save auto-registered credentials (optional, default: "config/agents/secrets.json")
 * @param {string} config.roomJid - MUC room JID (e.g., "general@conference.xmpp")
 * @param {string} config.nickname - Bot display nickname
 * @param {Object} config.provider - Provider instance (must implement handle() method)
 * @param {Object} config.logger - Logger instance (optional, default: console)
 * @param {boolean} config.allowSelfMessages - Include bot's own messages (optional, default: false)
 * @param {Object} config.historyStore - Custom history store instance (optional)
 * @param {number} config.maxAgentRounds - Maximum agent-to-agent interaction rounds (optional, default: 5)
 * @returns {AgentRunner} AgentRunner instance ready to start
 *
 * @example
 * import { createSimpleAgent, DemoProvider } from "tia-agents";
 *
 * const runner = createSimpleAgent({
 *   xmppConfig: {
 *     service: "xmpp://localhost:5222",
 *     domain: "xmpp",
 *     username: "mybot",
 *     password: "secret"
 *   },
 *   roomJid: "general@conference.xmpp",
 *   nickname: "MyBot",
 *   provider: new DemoProvider()
 * });
 *
 * await runner.start();
 */
export function createSimpleAgent(config) {
  const {
    xmppConfig,
    roomJid,
    nickname,
    provider,
    logger,
    allowSelfMessages,
    historyStore,
    maxAgentRounds,
    autoRegister,
    secretsPath
  } = config;

  if (!xmppConfig || !roomJid || !nickname || !provider) {
    throw new Error("Missing required config: xmppConfig, roomJid, nickname, provider");
  }

  return new AgentRunner({
    xmppConfig,
    roomJid,
    nickname,
    provider,
    mentionDetector: createMentionDetector(nickname, [nickname]),
    commandParser: defaultCommandParser,
    allowSelfMessages: allowSelfMessages || false,
    historyStore,
    maxAgentRounds: maxAgentRounds || 5,
    autoRegister: autoRegister || false,
    secretsPath,
    logger: logger || console
  });
}
