import OpenAI, { ClientOptions } from "openai";

export class OpenAIClientManager {
  private static instance: OpenAIClientManager | null = null;
  private openAi: OpenAI | null;

  private constructor(options: ClientOptions) {
    this.openAi = options.apiKey ? new OpenAI(options) : null;
  } // Private constructor to prevent direct instantiation

  static getInstance(options?: ClientOptions): OpenAIClientManager {
    if (!OpenAIClientManager.instance) {
      if (options) {
        OpenAIClientManager.instance = new OpenAIClientManager(options);
      } else {
        throw new Error("API client not initialized.");
      }
    }
    return OpenAIClientManager.instance;
  }

  setClient(options: ClientOptions): void {
    this.openAi = options.apiKey ? new OpenAI(options) : null;
  }

  getClient(): OpenAI | null {
    return this.openAi;
  }
}
