import { client } from "@xmpp/client";
import { registerXmppAccount, generatePassword } from "./xmpp-register.js";
import fs from "fs/promises";
import path from "path";

/**
 * Attempts to connect to XMPP server, auto-registering if credentials are missing or invalid
 *
 * @param {Object} options - Connection options
 * @param {string} options.service - XMPP service URL
 * @param {string} options.domain - XMPP domain
 * @param {string} options.username - Username
 * @param {string} [options.password] - Password (if missing, will attempt registration)
 * @param {string} [options.resource] - XMPP resource
 * @param {Object} [options.tls] - TLS options
 * @param {string} [options.secretsPath] - Path to secrets.json file
 * @param {boolean} [options.autoRegister=true] - Whether to auto-register if auth fails
 * @param {boolean} [options.autoSuffixUsername=false] - Whether to auto-suffix username on registration conflict
 * @param {number} [options.usernameSuffixStart=1] - Starting suffix for auto-suffixing
 * @param {number} [options.usernameSuffixMax=9] - Max suffix attempts for auto-suffixing
 * @param {Object} [options.logger=console] - Logger instance
 * @returns {Promise<{xmpp: Object, credentials: {username: string, password: string, registered: boolean}}>}
 */
export async function autoConnectXmpp({
  service,
  domain,
  username,
  password,
  resource,
  tls = { rejectUnauthorized: false },
  secretsPath = "config/agents/secrets.json",
  autoRegister = true,
  autoSuffixUsername = ["1", "true", "yes"].includes(
    String(process.env.XMPP_AUTO_SUFFIX_USERNAME || "").toLowerCase()
  ),
  usernameSuffixStart = Number(process.env.XMPP_USERNAME_SUFFIX_START || 1),
  usernameSuffixMax = Number(process.env.XMPP_USERNAME_SUFFIX_MAX || 9),
  logger = console
}) {
  const passwordProvided = Boolean(password);
  let actualPassword = password;
  let wasRegistered = false;
  let resolvedUsername = username;

  // Try to load password from secrets.json if not provided
  if (!actualPassword) {
    actualPassword = await readPasswordFromSecrets({ username, secretsPath, logger });
  }

  if (actualPassword && autoRegister && autoSuffixUsername && !passwordProvided) {
    try {
      const result = await registerWithSuffix({
        service,
        domain,
        username,
        password: actualPassword,
        tls,
        logger,
        autoSuffixUsername,
        usernameSuffixStart,
        usernameSuffixMax
      });
      logger.info(`[AutoConnect] ${result.message}`);
      wasRegistered = true;
      resolvedUsername = result.username || username;
      await savePassword({ username: resolvedUsername, password: actualPassword, secretsPath, logger });
    } catch (err) {
      logger.warn?.(`[AutoConnect] Auto-suffix registration skipped: ${err.message}`);
    }
  }

  // If still no password and auto-register is enabled, register
  if (!actualPassword && autoRegister) {
    logger.info(`[AutoConnect] No password found for ${username}, attempting registration`);

    actualPassword = generatePassword(16);

    try {
      const result = await registerWithSuffix({
        service,
        domain,
        username,
        password: actualPassword,
        tls,
        logger,
        autoSuffixUsername,
        usernameSuffixStart,
        usernameSuffixMax
      });

      logger.info(`[AutoConnect] ${result.message}`);
      wasRegistered = true;
      resolvedUsername = result.username || username;

      // Save to secrets.json
      await savePassword({ username: resolvedUsername, password: actualPassword, secretsPath, logger });
    } catch (err) {
      if (isAlreadyRegisteredError(err)) {
        logger.warn?.(`[AutoConnect] ${err.message}; trying stored credentials instead`);
        actualPassword = await readPasswordFromSecrets({ username, secretsPath, logger });

        if (!actualPassword) {
          throw new Error(`Auto-registration failed: ${err.message} and no stored password found in ${secretsPath}`);
        }
      } else {
        throw new Error(`Auto-registration failed: ${err.message}`);
      }
    }
  }

  if (!actualPassword) {
    throw new Error(`No password available for ${username} and auto-registration is disabled`);
  }

  // Create XMPP client
  const xmppConfig = {
    service,
    domain,
    username: resolvedUsername,
    password: actualPassword,
    resource,
    tls
  };

  const xmpp = client(xmppConfig);

  // Attempt connection
  return new Promise((resolve, reject) => {
    let connected = false;
    let authFailed = false;

    const timeout = setTimeout(() => {
      if (!connected) {
        xmpp.stop().catch(() => {});
        reject(new Error("Connection timeout"));
      }
    }, 15000);

    xmpp.on("error", async (err) => {
      logger.error?.("[AutoConnect] XMPP Error:", err.message);

      // Check if it's an authentication error
      if (err.condition === "not-authorized" || err.message?.includes("auth")) {
        authFailed = true;

        if (autoRegister && !wasRegistered) {
          logger.info("[AutoConnect] Authentication failed, attempting registration");
          clearTimeout(timeout);

          try {
            // Generate new password and register
            const newPassword = generatePassword(16);
            const result = await registerWithSuffix({
              service,
              domain,
              username,
              password: newPassword,
              tls,
              logger,
              autoSuffixUsername,
              usernameSuffixStart,
              usernameSuffixMax
            });

            logger.info(`[AutoConnect] ${result.message}`);
            resolvedUsername = result.username || username;

            // Save to secrets.json
            await savePassword({ username: resolvedUsername, password: newPassword, secretsPath, logger });

            // Try connecting again with new credentials
            xmppConfig.password = newPassword;
            xmppConfig.username = resolvedUsername;
            const newXmpp = client(xmppConfig);

            newXmpp.on("online", (address) => {
              logger.info(`[AutoConnect] Connected as ${address.toString()} after registration`);
              connected = true;
              resolve({
                xmpp: newXmpp,
                credentials: { username: resolvedUsername, password: newPassword, registered: true }
              });
            });

            newXmpp.on("error", (err2) => {
              reject(new Error(`Failed to connect after registration: ${err2.message}`));
            });

            await newXmpp.start();
          } catch (regErr) {
            reject(new Error(`Auto-registration after auth failure failed: ${regErr.message}`));
          }
        } else {
          clearTimeout(timeout);
          reject(err);
        }
      } else if (!connected) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    xmpp.on("online", (address) => {
      if (!authFailed) {
        logger.info(`[AutoConnect] Connected as ${address.toString()}`);
        connected = true;
        clearTimeout(timeout);
        resolve({
          xmpp,
          credentials: { username: resolvedUsername, password: actualPassword, registered: wasRegistered }
        });
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function registerWithSuffix({
  service,
  domain,
  username,
  password,
  tls,
  logger,
  autoSuffixUsername,
  usernameSuffixStart,
  usernameSuffixMax
}) {
  try {
    const result = await registerXmppAccount({
      service,
      domain,
      username,
      password,
      tls,
      logger
    });
    return { ...result, username };
  } catch (err) {
    if (!autoSuffixUsername || !isAlreadyRegisteredError(err)) {
      throw err;
    }
  }

  for (let i = usernameSuffixStart; i <= usernameSuffixMax; i += 1) {
    const candidate = `${username}${i}`;
    try {
      const result = await registerXmppAccount({
        service,
        domain,
        username: candidate,
        password,
        tls,
        logger
      });
      return { ...result, username: candidate };
    } catch (err) {
      if (!isAlreadyRegisteredError(err)) {
        throw err;
      }
    }
  }

  throw new Error(`Auto-registration failed: no available suffixes for ${username}`);
}

/**
 * Save password to secrets.json file
 * @param {Object} options
 * @param {string} options.username - Username
 * @param {string} options.password - Password
 * @param {string} options.secretsPath - Path to secrets.json
 * @param {Object} [options.logger=console] - Logger
 */
async function savePassword({ username, password, secretsPath, logger = console }) {
  try {
    let secrets = { xmpp: {} };

    // Try to read existing secrets
    try {
      const existingData = await fs.readFile(secretsPath, "utf-8");
      secrets = JSON.parse(existingData);
      if (!secrets.xmpp) {
        secrets.xmpp = {};
      }
    } catch (err) {
      // File doesn't exist or is invalid, will create new one
      logger.debug?.(`[AutoConnect] Creating new secrets file at ${secretsPath}`);

      // Ensure directory exists
      const dir = path.dirname(secretsPath);
      await fs.mkdir(dir, { recursive: true });
    }

    // Update password
    secrets.xmpp[username] = password;

    // Write back
    await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2), "utf-8");
    logger.info(`[AutoConnect] Saved password for ${username} to ${secretsPath}`);
  } catch (err) {
    logger.error?.(`[AutoConnect] Failed to save password to ${secretsPath}: ${err.message}`);
    throw err;
  }
}

async function readPasswordFromSecrets({ username, secretsPath, logger = console }) {
  try {
    const secretsData = await fs.readFile(secretsPath, "utf-8");
    const secrets = JSON.parse(secretsData);
    const storedPassword = secrets.xmpp?.[username];

    if (storedPassword) {
      logger.debug?.(`[AutoConnect] Loaded password for ${username} from ${secretsPath}`);
    }

    return storedPassword;
  } catch (err) {
    logger.debug?.(`[AutoConnect] Could not load secrets from ${secretsPath}: ${err.message}`);
    return undefined;
  }
}

function isAlreadyRegisteredError(err) {
  const message = err?.message?.toLowerCase?.() || "";
  return message.includes("already exists") || message.includes("conflict");
}
