import { xml } from "@xmpp/client";
import { MFR_ROOM_TYPES, getRoomForPhase } from "./constants.js";

/**
 * Manager for connecting to and communicating across multiple MUC rooms
 */
export class MultiRoomManager {
  constructor({ xmppClient, rooms, nickname, logger = console } = {}) {
    this.xmppClient = xmppClient;
    this.rooms = rooms || {};
    this.nickname = nickname;
    this.logger = logger;

    // Track joined rooms
    this.joinedRooms = new Set();

    // Track room presence
    this.roomPresence = new Map();
  }

  /**
   * Join all configured MFR rooms
   * @returns {Promise<Array<string>>} Array of joined room JIDs
   */
  async joinAllRooms() {
    const roomTypes = Object.keys(this.rooms);

    this.logger.debug?.(
      `[MultiRoomManager] Joining ${roomTypes.length} rooms as ${this.nickname}`
    );

    const joinPromises = roomTypes.map((type) =>
      this.joinRoom(type)
    );

    await Promise.all(joinPromises);

    return Array.from(this.joinedRooms);
  }

  /**
   * Join a specific room by type
   * @param {string} roomType - Room type (construct, validate, reason)
   * @returns {Promise<string>} Room JID
   */
  async joinRoom(roomType) {
    const roomJid = this.rooms[roomType];

    if (!roomJid) {
      throw new Error(`No room configured for type: ${roomType}`);
    }

    if (this.joinedRooms.has(roomJid)) {
      this.logger.debug?.(
        `[MultiRoomManager] Already in room: ${roomJid}`
      );
      return roomJid;
    }

    this.logger.debug?.(
      `[MultiRoomManager] Joining ${roomType} room: ${roomJid}`
    );

    // Send presence to join room
    const fullRoomJid = `${roomJid}/${this.nickname}`;

    const presence = xml(
      "presence",
      { to: fullRoomJid },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );

    await this.xmppClient.send(presence);

    this.joinedRooms.add(roomJid);
    this.roomPresence.set(roomJid, {
      joined: new Date().toISOString(),
      type: roomType
    });

    return roomJid;
  }

  /**
   * Leave a specific room
   * @param {string} roomType - Room type
   * @returns {Promise<void>}
   */
  async leaveRoom(roomType) {
    const roomJid = this.rooms[roomType];

    if (!roomJid) {
      return;
    }

    if (!this.joinedRooms.has(roomJid)) {
      return;
    }

    this.logger.debug?.(
      `[MultiRoomManager] Leaving ${roomType} room: ${roomJid}`
    );

    const fullRoomJid = `${roomJid}/${this.nickname}`;

    const presence = xml(
      "presence",
      { to: fullRoomJid, type: "unavailable" }
    );

    await this.xmppClient.send(presence);

    this.joinedRooms.delete(roomJid);
    this.roomPresence.delete(roomJid);
  }

  /**
   * Leave all rooms
   * @returns {Promise<void>}
   */
  async leaveAllRooms() {
    const roomTypes = Object.keys(this.rooms);

    this.logger.debug?.(
      `[MultiRoomManager] Leaving ${roomTypes.length} rooms`
    );

    const leavePromises = roomTypes.map((type) =>
      this.leaveRoom(type).catch((err) =>
        this.logger.warn?.(`Failed to leave ${type} room: ${err.message}`)
      )
    );

    await Promise.all(leavePromises);
  }

  /**
   * Broadcast message to a specific room
   * @param {string} roomType - Room type
   * @param {string|Object} message - Message body or stanza
   * @returns {Promise<void>}
   */
  async broadcastToRoom(roomType, message) {
    const roomJid = this.rooms[roomType];

    if (!roomJid) {
      throw new Error(`No room configured for type: ${roomType}`);
    }

    if (!this.joinedRooms.has(roomJid)) {
      this.logger.warn?.(
        `[MultiRoomManager] Not joined to ${roomType} room, joining first`
      );
      await this.joinRoom(roomType);
    }

    let stanza;

    if (typeof message === "string") {
      // Simple text message
      stanza = xml(
        "message",
        { to: roomJid, type: "groupchat" },
        xml("body", {}, message)
      );
    } else if (message.is && message.is("message")) {
      // Already a stanza, just update recipient
      stanza = message;
      stanza.attrs.to = roomJid;
      stanza.attrs.type = "groupchat";
    } else {
      throw new Error("Invalid message format");
    }

    this.logger.debug?.(
      `[MultiRoomManager] Broadcasting to ${roomType} room: ${roomJid}`
    );

    await this.xmppClient.send(stanza);
  }

  /**
   * Get the appropriate room for a protocol phase
   * @param {string} phase - MFR protocol phase
   * @returns {string} Room type
   */
  getRoomTypeForPhase(phase) {
    return getRoomForPhase(phase);
  }

  /**
   * Broadcast to the room appropriate for a given phase
   * @param {string} phase - MFR protocol phase
   * @param {string|Object} message - Message to broadcast
   * @returns {Promise<void>}
   */
  async broadcastForPhase(phase, message) {
    const roomType = this.getRoomTypeForPhase(phase);
    return this.broadcastToRoom(roomType, message);
  }

  /**
   * Switch active context to a different room
   * @param {string} fromRoomType - Current room type
   * @param {string} toRoomType - Target room type
   * @returns {Promise<Object>} Switch result
   */
  async switchRoom(fromRoomType, toRoomType) {
    this.logger.debug?.(
      `[MultiRoomManager] Switching from ${fromRoomType} to ${toRoomType}`
    );

    // Ensure we're in the target room
    await this.joinRoom(toRoomType);

    // Optionally leave the previous room (keeping it for now)
    // await this.leaveRoom(fromRoomType);

    return {
      from: this.rooms[fromRoomType],
      to: this.rooms[toRoomType],
      switched: new Date().toISOString()
    };
  }

  /**
   * Get list of joined rooms
   * @returns {Array<string>} Array of room JIDs
   */
  getJoinedRooms() {
    return Array.from(this.joinedRooms);
  }

  /**
   * Check if joined to a specific room type
   * @param {string} roomType - Room type
   * @returns {boolean} True if joined
   */
  isJoinedToRoom(roomType) {
    const roomJid = this.rooms[roomType];
    return roomJid ? this.joinedRooms.has(roomJid) : false;
  }

  /**
   * Get room JID for a room type
   * @param {string} roomType - Room type
   * @returns {string|null} Room JID or null
   */
  getRoomJid(roomType) {
    return this.rooms[roomType] || null;
  }

  /**
   * Get all configured rooms
   * @returns {Object} Rooms configuration
   */
  getRooms() {
    return { ...this.rooms };
  }

  /**
   * Get room presence information
   * @returns {Array<Object>} Array of room presence info
   */
  getRoomPresence() {
    const presence = [];

    for (const [roomJid, data] of this.roomPresence.entries()) {
      presence.push({
        roomJid,
        ...data
      });
    }

    return presence;
  }

  /**
   * Send a direct message (not to a room)
   * @param {string} to - Recipient JID
   * @param {string|Object} message - Message to send
   * @returns {Promise<void>}
   */
  async sendDirectMessage(to, message) {
    let stanza;

    if (typeof message === "string") {
      stanza = xml(
        "message",
        { to, type: "chat" },
        xml("body", {}, message)
      );
    } else if (message.is && message.is("message")) {
      stanza = message;
      stanza.attrs.to = to;
      stanza.attrs.type = "chat";
    } else {
      throw new Error("Invalid message format");
    }

    this.logger.debug?.(
      `[MultiRoomManager] Sending direct message to ${to}`
    );

    await this.xmppClient.send(stanza);
  }
}

export default MultiRoomManager;
