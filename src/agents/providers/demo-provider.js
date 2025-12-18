export class DemoProvider {
  constructor({ nickname = "DemoBot", logger = console } = {}) {
    this.nickname = nickname;
    this.logger = logger;
    this.responses = [
      "Woof! I'm a demo bot. I'd normally use Mistral AI for responses.",
      "That's an interesting question! In a real deployment, I'd use AI to answer.",
      "I'm just a demo right now, but imagine I had the power of Mistral AI!",
      "Bark bark! Demo mode active. Set MISTRAL_API_KEY for real AI responses.",
      "Good question! I'd love to help with that using proper AI responses.",
      "Demo bot here! I can simulate conversations but need Mistral AI for real intelligence."
    ];
  }

  async handle({ command, content, metadata }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];
    const sender = metadata.sender || "";
    return sender ? `@${sender} ${response}` : response;
  }
}

export default DemoProvider;
