export class NegotiationState {
  constructor({ offerTtlMs = 30000, activeTtlMs = 600000, clock = Date } = {}) {
    this.offerTtlMs = offerTtlMs;
    this.activeTtlMs = activeTtlMs;
    this.clock = clock;
    this.offers = new Map();
    this.activeModes = new Map();
  }

  offer(peerJid, modes) {
    const now = this.clock.now();
    this.offers.set(peerJid, {
      modes: Array.from(modes || []),
      expiresAt: now + this.offerTtlMs
    });
  }

  hasOffer(peerJid) {
    const offer = this.offers.get(peerJid);
    if (!offer) return false;
    if (offer.expiresAt <= this.clock.now()) {
      this.offers.delete(peerJid);
      return false;
    }
    return true;
  }

  accept(peerJid, mode) {
    const offer = this.offers.get(peerJid);
    if (!offer || offer.expiresAt <= this.clock.now()) {
      this.offers.delete(peerJid);
      return false;
    }

    if (!offer.modes.includes(mode)) return false;

    this.offers.delete(peerJid);
    this.setActiveMode(peerJid, mode);
    return true;
  }

  reject(peerJid) {
    this.offers.delete(peerJid);
  }

  setActiveMode(peerJid, mode) {
    const now = this.clock.now();
    this.activeModes.set(peerJid, {
      mode,
      expiresAt: now + this.activeTtlMs
    });
  }

  getActiveMode(peerJid) {
    const active = this.activeModes.get(peerJid);
    if (!active) return null;
    if (active.expiresAt <= this.clock.now()) {
      this.activeModes.delete(peerJid);
      return null;
    }
    return active.mode;
  }

  clear(peerJid) {
    this.offers.delete(peerJid);
    this.activeModes.delete(peerJid);
  }

  cleanup() {
    const now = this.clock.now();
    for (const [peerJid, offer] of this.offers.entries()) {
      if (offer.expiresAt <= now) this.offers.delete(peerJid);
    }
    for (const [peerJid, active] of this.activeModes.entries()) {
      if (active.expiresAt <= now) this.activeModes.delete(peerJid);
    }
  }
}
