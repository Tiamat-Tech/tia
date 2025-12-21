import { client, xml } from "@xmpp/client";
import crypto from "crypto";

/**
 * XMPP In-Band Registration (XEP-0077)
 *
 * Registers a new account on the XMPP server from the client side.
 * This implementation intercepts the connection flow before SASL authentication
 * to send the registration request.
 *
 * @param {Object} options - Registration options
 * @param {string} options.service - XMPP service URL (e.g., 'xmpp://localhost:5222')
 * @param {string} options.domain - XMPP domain (e.g., 'localhost')
 * @param {string} options.username - Desired username
 * @param {string} options.password - Desired password
 * @param {Object} [options.tls] - TLS options
 * @param {Object} [options.logger=console] - Logger instance
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function registerXmppAccount({
  service,
  domain,
  username,
  password,
  tls = { rejectUnauthorized: false },
  logger = console
}) {
  return new Promise((resolve, reject) => {
    let registrationComplete = false;
    let streamFeaturesReceived = false;
    let tlsEstablished = false;

    // Create a minimal client without triggering authentication
    const xmpp = client({
      service,
      domain,
      tls,
      // Provide empty credentials to avoid auth attempt
      username: "",
      password: ""
    });

    // Try to disable SASL plugin entirely
    if (xmpp.plugins && xmpp.plugins.sasl) {
      logger.debug?.("[Registration] Attempting to disable SASL plugin");
      delete xmpp.plugins.sasl;
    }

    // Intercept outgoing stanzas to block SASL auth attempts
    const originalSend = xmpp.send.bind(xmpp);
    xmpp.send = async function(stanza) {
      // Block any SASL auth elements
      if (stanza && stanza.name === "auth" && stanza.attrs && stanza.attrs.xmlns === "urn:ietf:params:xml:ns:xmpp-sasl") {
        logger.warn?.("[Registration] Blocked SASL auth attempt during registration");
        return;
      }
      return originalSend(stanza);
    };

    const cleanup = () => {
      try {
        xmpp.stop().catch(() => {});
      } catch (err) {
        // Ignore cleanup errors
      }
    };

    const timeout = setTimeout(() => {
      if (!registrationComplete) {
        cleanup();
        reject(new Error("Registration timeout after 20 seconds"));
      }
    }, 20000);

    xmpp.on("error", (err) => {
      const errMsg = err.message || err.condition || err.toString();

      // Ignore "not-authorized" errors during registration flow
      if (err.condition === "not-authorized") {
        logger.debug?.("[Registration] Ignoring not-authorized during registration");
        return;
      }

      // Ignore "invalid-mechanism" - we're not trying to authenticate, we're registering
      if (err.condition === "invalid-mechanism" || errMsg.includes("invalid-mechanism")) {
        logger.debug?.("[Registration] Ignoring invalid-mechanism during registration");
        // Give time for registration response to arrive
        setTimeout(() => {
          if (!registrationComplete) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Registration response not received - server may not support in-band registration or it's disabled"));
          }
        }, 2000);
        return;
      }

      // Ignore encryption required if we already got stream features
      if (errMsg.includes("Encryption is required") || errMsg.includes("encryption-required")) {
        logger.warn?.("[Registration] Server requires encryption - this is expected");
        return;
      }

      // Ignore ECONNRESET if registration was sent - server might close after response
      if (errMsg.includes("ECONNRESET") && streamFeaturesReceived) {
        logger.warn?.("[Registration] Connection reset after sending registration - waiting for response");
        return;
      }

      logger.error?.("[Registration] XMPP Error:", errMsg);

      if (!registrationComplete) {
        clearTimeout(timeout);
        cleanup();
        reject(err);
      }
    });

    // Listen for the stream opening
    xmpp.on("open", async () => {
      logger.debug?.("[Registration] Stream opened");
    });

    // Listen for TLS events
    xmpp.on("status", (status) => {
      logger.debug?.(`[Registration] Status: ${status}`);
      if (status === "online") {
        tlsEstablished = true;
      }
    });

    // Use 'element' event to catch stream features before they're processed
    xmpp.on("element", async (element) => {
      // Handle IQ responses in element event (before they might be filtered)
      if (element.is("iq")) {
        const type = element.attrs.type;
        const id = element.attrs.id;

        // Handle registration form response
        if (id === "reg1" && type === "result") {
          const query = element.getChild("query", "jabber:iq:register");
          if (!query) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Server did not return registration form"));
            return;
          }

          logger.info?.("[Registration] Received registration form, submitting credentials");

          // Submit registration
          try {
            const submitIq = xml(
              "iq",
              { type: "set", id: "reg2", to: domain },
              xml(
                "query",
                { xmlns: "jabber:iq:register" },
                xml("username", {}, username),
                xml("password", {}, password)
              )
            );

            await xmpp.send(submitIq);
            logger.info?.("[Registration] Submitted registration");
          } catch (err) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error(`Failed to submit registration: ${err.message}`));
          }
          return;
        }

        // Handle registration submission response
        if (id === "reg2" && type === "result") {
          logger.info?.(`[Registration] ✅ Account ${username}@${domain} registered successfully!`);
          registrationComplete = true;
          clearTimeout(timeout);
          cleanup();
          resolve({
            success: true,
            message: `Account ${username}@${domain} registered successfully`
          });
          return;
        }

        // Handle errors
        if ((id === "reg1" || id === "reg2") && type === "error") {
          const error = element.getChild("error");
          let errorMessage = "Registration failed";

          if (error) {
            const conflict = error.getChild("conflict");
            const notAcceptable = error.getChild("not-acceptable");
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");
            const serviceUnavailable = error.getChild("service-unavailable");

            if (conflict) {
              errorMessage = `Username ${username} already exists`;
            } else if (notAcceptable) {
              errorMessage = "Username or password not acceptable";
            } else if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else if (serviceUnavailable) {
              errorMessage = "Registration service unavailable";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
          return;
        }
      }

      // Handle stream features - this comes before SASL
      if (element.is("features")) {
        logger.debug?.("[Registration] Received stream features");

        // Check for STARTTLS
        const starttls = element.getChild("starttls", "urn:ietf:params:xml:ns:xmpp-tls");
        if (starttls && !tlsEstablished) {
          logger.debug?.("[Registration] STARTTLS available, waiting for encryption...");
          // Don't send registration yet, wait for stream to restart after TLS
          // Stream will reopen and we'll get features again
          return;
        }

        // Only send registration request once
        if (streamFeaturesReceived) {
          return;
        }
        streamFeaturesReceived = true;

        // Check if registration is advertised
        const register = element.getChild("register", "http://jabber.org/features/iq-register");
        if (register) {
          logger.info?.("[Registration] Server supports in-band registration");
        }

        logger.debug?.("[Registration] TLS established, sending registration request");

        // Send registration request (after TLS)
        try {
          const registerIq = xml(
            "iq",
            { type: "get", id: "reg1", to: domain },
            xml("query", { xmlns: "jabber:iq:register" })
          );

          await xmpp.send(registerIq);
          logger.info?.("[Registration] Sent registration form request");
        } catch (err) {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`Failed to request registration form: ${err.message}`));
        }
        return;
      }
    });

    // Handle IQ stanzas separately (fallback if element handler misses something)
    xmpp.on("stanza", async (stanza) => {
      // Handle IQ responses
      if (stanza.is("iq")) {
        const type = stanza.attrs.type;
        const id = stanza.attrs.id;

        // Handle registration form response
        if (id === "reg1" && type === "result") {
          const query = stanza.getChild("query", "jabber:iq:register");
          if (!query) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Server did not return registration form"));
            return;
          }

          // Submit registration (already done in element handler, this is fallback)
          try {
            const submitIq = xml(
              "iq",
              { type: "set", id: "reg2", to: domain },
              xml(
                "query",
                { xmlns: "jabber:iq:register" },
                xml("username", {}, username),
                xml("password", {}, password)
              )
            );

            await xmpp.send(submitIq);
          } catch (err) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error(`Failed to submit registration: ${err.message}`));
          }
        }

        // Handle registration submission response
        if (id === "reg2" && type === "result") {
          logger.info?.(`[Registration] ✅ Account ${username}@${domain} registered successfully!`);
          registrationComplete = true;
          clearTimeout(timeout);
          cleanup();
          resolve({
            success: true,
            message: `Account ${username}@${domain} registered successfully`
          });
        }

        // Handle registration errors
        if (id === "reg2" && type === "error") {
          const error = stanza.getChild("error");
          let errorMessage = "Registration failed";

          if (error) {
            const conflict = error.getChild("conflict");
            const notAcceptable = error.getChild("not-acceptable");
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");

            if (conflict) {
              errorMessage = `Username ${username} already exists`;
            } else if (notAcceptable) {
              errorMessage = "Username or password not acceptable";
            } else if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
        }

        if (id === "reg1" && type === "error") {
          const error = stanza.getChild("error");
          let errorMessage = "Server does not support registration";

          if (error) {
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");
            const serviceUnavailable = error.getChild("service-unavailable");

            if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else if (serviceUnavailable) {
              errorMessage = "Registration service unavailable";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
        }
      }
    });

    // Start the connection
    logger.info?.("[Registration] Connecting to server...");
    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Failed to connect for registration: ${err.message}`));
    });
  });
}

/**
 * Generates a random password for automatic registration
 * @param {number} [length=16] - Password length
 * @returns {string} - Random password
 */
export function generatePassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  // Use crypto.randomBytes for better randomness
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }

  return password;
}
