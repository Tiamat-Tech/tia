export function assertXmppPassword(profile) {
  if (!profile?.xmppAccount) return;
  if (!profile.xmppAccount.password) {
    const identifier = profile.identifier || profile.nickname || "unknown";
    throw new Error(`XMPP password missing for profile "${identifier}".`);
  }
}
