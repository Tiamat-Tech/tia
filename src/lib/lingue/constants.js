export const LINGUE_NS = "http://purl.org/stuff/lingue/";
export const DISCO_INFO_NS = "http://jabber.org/protocol/disco#info";

export const LANGUAGE_MODES = {
  HUMAN_CHAT: `${LINGUE_NS}HumanChat`,
  IBIS_TEXT: `${LINGUE_NS}IBISText`,
  PROLOG_PROGRAM: `${LINGUE_NS}PrologProgram`,
  PROFILE_EXCHANGE: `${LINGUE_NS}AgentProfileExchange`
};

export const FEATURES = {
  LANG_HUMAN_CHAT: `${LINGUE_NS}feature/lang/human-chat`,
  LANG_IBIS_TEXT: `${LINGUE_NS}feature/lang/ibis-text`,
  LANG_PROLOG_PROGRAM: `${LINGUE_NS}feature/lang/prolog-program`,
  LANG_PROFILE_EXCHANGE: `${LINGUE_NS}feature/lang/profile-exchange`
};

export const MIME_TYPES = {
  HUMAN_CHAT: "text/plain",
  IBIS_TEXT: "text/plain",
  PROLOG_PROGRAM: "text/x-prolog",
  PROFILE_EXCHANGE: "text/turtle"
};

export const MODE_TO_FEATURE = {
  [LANGUAGE_MODES.HUMAN_CHAT]: FEATURES.LANG_HUMAN_CHAT,
  [LANGUAGE_MODES.IBIS_TEXT]: FEATURES.LANG_IBIS_TEXT,
  [LANGUAGE_MODES.PROLOG_PROGRAM]: FEATURES.LANG_PROLOG_PROGRAM,
  [LANGUAGE_MODES.PROFILE_EXCHANGE]: FEATURES.LANG_PROFILE_EXCHANGE
};

export function featuresForModes(modes = []) {
  return Array.from(modes)
    .map((mode) => MODE_TO_FEATURE[mode])
    .filter(Boolean);
}

export const MODE_BY_MIME = {
  [MIME_TYPES.PROLOG_PROGRAM]: LANGUAGE_MODES.PROLOG_PROGRAM,
  [MIME_TYPES.HUMAN_CHAT]: LANGUAGE_MODES.HUMAN_CHAT,
  [MIME_TYPES.IBIS_TEXT]: LANGUAGE_MODES.IBIS_TEXT,
  [MIME_TYPES.PROFILE_EXCHANGE]: LANGUAGE_MODES.PROFILE_EXCHANGE
};

export function modeFromMime(mimeType) {
  return MODE_BY_MIME[mimeType] || null;
}
