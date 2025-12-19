import { xml } from "@xmpp/client";
import { DISCO_INFO_NS } from "./constants.js";

export function createDiscoInfoRequest({ to, id }) {
  return xml(
    "iq",
    { type: "get", to, id },
    xml("query", { xmlns: DISCO_INFO_NS })
  );
}

export function createDiscoInfoResponse({ to, id, features = [], identities = [] }) {
  const featureNodes = features.map((feature) => xml("feature", { var: feature }));
  const identityNodes = identities.map((identity) => xml("identity", {
    category: identity.category,
    type: identity.type,
    name: identity.name
  }));

  return xml(
    "iq",
    { type: "result", to, id },
    xml(
      "query",
      { xmlns: DISCO_INFO_NS },
      ...identityNodes,
      ...featureNodes
    )
  );
}

export function parseDiscoInfo(stanza) {
  const query = stanza.getChild("query", DISCO_INFO_NS);
  if (!query) return null;

  const features = new Set(
    query.getChildren("feature").map((feature) => feature.attrs.var).filter(Boolean)
  );

  const identities = query.getChildren("identity").map((identity) => ({
    category: identity.attrs.category,
    type: identity.attrs.type,
    name: identity.attrs.name
  }));

  return { features, identities };
}

export function attachDiscoInfoResponder(xmppClient, { features = [], identities = [] } = {}) {
  xmppClient.on("iq", async (stanza) => {
    const isDiscoInfo =
      stanza.is("iq") &&
      stanza.attrs.type === "get" &&
      stanza.getChild("query", DISCO_INFO_NS);

    if (!isDiscoInfo) return;

    const reply = createDiscoInfoResponse({
      to: stanza.attrs.from,
      id: stanza.attrs.id,
      features,
      identities
    });

    await xmppClient.send(reply);
  });
}
