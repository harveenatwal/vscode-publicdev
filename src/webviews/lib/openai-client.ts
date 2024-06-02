import OpenAI, { ClientOptions } from "openai";

export class OpenAIClientManager {
  private static instance: OpenAIClientManager | null = null;
  private openAi: OpenAI;

  private constructor(options: ClientOptions) {
    this.openAi = new OpenAI(options);
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
    this.openAi = new OpenAI(options);
  }

  getClient(): OpenAI {
    return this.openAi;
  }
}
