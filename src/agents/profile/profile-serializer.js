import rdf from "rdf-ext";
import { Writer } from "n3";
import {
  PREFIXES,
  nodeFromValue,
  addProfileComponentTriples,
  addMcpMetadata
} from "./profile-rdf.js";

export function profileToDataset(profile) {
  const dataset = rdf.dataset();
  const subject = rdf.namedNode(`#${profile.identifier}`);

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.foaf + "nick"),
    rdf.literal(profile.nickname)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.schema + "identifier"),
    rdf.literal(profile.identifier)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.agent + "roomJid"),
    rdf.literal(profile.roomJid)
  ));

  profile.type.forEach(type => {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.rdf + "type"),
      rdf.namedNode(PREFIXES.agent + type)
    ));
  });

  if (profile.xmppAccount) {
    const xmppNode = rdf.blankNode();
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.agent + "xmppAccount"),
      xmppNode
    ));

    const xmpp = profile.xmppAccount;
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "service"), rdf.literal(xmpp.service)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "domain"), rdf.literal(xmpp.domain)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "username"), rdf.literal(xmpp.username)));
    if (xmpp.passwordKey) {
      dataset.add(rdf.quad(
        xmppNode,
        rdf.namedNode(PREFIXES.xmpp + "passwordKey"),
        rdf.literal(xmpp.passwordKey)
      ));
    }
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "resource"), rdf.literal(xmpp.resource)));
  }

  if (profile.provider) {
    const providerNode = rdf.blankNode();
    let providerPredicate;
    if (profile.provider.type === 'mistral') {
      providerPredicate = PREFIXES.agent + "aiProvider";
    } else if (profile.provider.type === 'semem') {
      providerPredicate = PREFIXES.agent + "mcpProvider";
    } else if (profile.provider.type === 'data') {
      providerPredicate = PREFIXES.agent + "dataProvider";
    } else {
      providerPredicate = PREFIXES.agent + "aiProvider";
    }

    dataset.add(rdf.quad(subject, rdf.namedNode(providerPredicate), providerNode));

    const config = profile.provider.config;
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'features') {
        const predicate = PREFIXES.ai + key;
        dataset.add(rdf.quad(providerNode, rdf.namedNode(predicate), rdf.literal(String(value))));
      }
    });

    if (config.features) {
      const featuresNode = rdf.blankNode();
      dataset.add(rdf.quad(providerNode, rdf.namedNode(PREFIXES.ai + "features"), featuresNode));
      Object.entries(config.features).forEach(([key, value]) => {
        dataset.add(rdf.quad(
          featuresNode,
          rdf.namedNode(PREFIXES.ai + key),
          rdf.literal(String(value))
        ));
      });
    }
  }

  if (profile.lingue) {
    profile.lingue.supports?.forEach((modeUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "supports"),
        rdf.namedNode(modeUri)
      ));
    });

    if (profile.lingue.prefers) {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "prefers"),
        rdf.namedNode(profile.lingue.prefers)
      ));
    }

    profile.lingue.understands?.forEach((resourceUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "understands"),
        rdf.namedNode(resourceUri)
      ));
    });

    if (profile.lingue.profile) {
      const profileNode = profile.lingue.profile.uri
        ? rdf.namedNode(profile.lingue.profile.uri)
        : rdf.blankNode();

      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "profile"),
        profileNode
      ));

      if (profile.lingue.profile.availability) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "availability"),
          nodeFromValue(profile.lingue.profile.availability)
        ));
      }

      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "in",
        profile.lingue.profile.inputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "out",
        profile.lingue.profile.outputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "dependsOn",
        profile.lingue.profile.dependencies, PREFIXES.lng + "Dependency");

      if (profile.lingue.profile.algorithmLanguage) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "alang"),
          rdf.literal(profile.lingue.profile.algorithmLanguage)
        ));
      }

      if (profile.lingue.profile.location) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "location"),
          nodeFromValue(profile.lingue.profile.location)
        ));
      }
    }
  }

  if (profile.mcp) {
    addMcpMetadata(dataset, subject, profile.mcp);
  }

  return dataset;
}

export async function profileToTurtle(profile) {
  const dataset = profileToDataset(profile);
  const writer = new Writer({ prefixes: {
    agent: PREFIXES.agent,
    foaf: PREFIXES.foaf,
    schema: PREFIXES.schema,
    xmpp: PREFIXES.xmpp,
    ai: PREFIXES.ai,
    dcterms: PREFIXES.dcterms,
    lng: PREFIXES.lng,
    ibis: PREFIXES.ibis,
    rdfs: PREFIXES.rdfs,
    mcp: PREFIXES.mcp
  }});

  dataset.forEach((quad) => {
    writer.addQuad(quad);
  });

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) return reject(err);
      resolve(result.trim());
    });
  });
}
