export class LanguageModeHandler {
  constructor({ mode, mimeType, logger = console } = {}) {
    this.mode = mode;
    this.mimeType = mimeType;
    this.logger = logger;
  }

  createStanza() {
    throw new Error("createStanza() not implemented");
  }

  parseStanza() {
    throw new Error("parseStanza() not implemented");
  }

  validate() {
    return true;
  }
}
