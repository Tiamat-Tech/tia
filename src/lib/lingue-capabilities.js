import { xml } from "@xmpp/client";

export const LINGUE_FEATURES = [
  "http://purl.org/stuff/lingue/ibis-rdf",
  "http://purl.org/stuff/lingue/ask-tell",
  "http://purl.org/stuff/lingue/meta-transparent",
];

export function attachDiscoInfoResponder(xmpp, features = LINGUE_FEATURES) {
  xmpp.on("iq", async (stanza) => {
    const isDiscoInfo =
      stanza.is("iq") &&
      stanza.attrs.type === "get" &&
      stanza.getChild("query", "http://jabber.org/protocol/disco#info");

    if (!isDiscoInfo) return;

    const reply = xml(
      "iq",
      { type: "result", to: stanza.attrs.from, id: stanza.attrs.id },
      xml(
        "query",
        { xmlns: "http://jabber.org/protocol/disco#info" },
        ...features.map((f) => xml("feature", { var: f }))
      )
    );
    await xmpp.send(reply);
  });
}

export function hasLingueFeature(stanza, featureUri) {
  const query = stanza.getChild("query", "http://jabber.org/protocol/disco#info");
  if (!query) return false;
  return query.getChildren("feature").some((feature) => feature.attrs.var === featureUri);
}
