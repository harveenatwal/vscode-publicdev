import * as vscode from "vscode";
import { HomeViewProvider } from "./webviews/home/home-view-provider";
import { SET_OPEN_AI_API_KEY_COMMAND } from "./constants/commands";
import { OPENAI_API_KEY_SECRET_KEY } from "./constants/secrets";

export function activate(context: vscode.ExtensionContext) {
  const homeViewProvider = new HomeViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HomeViewProvider.viewType,
      homeViewProvider
    )
  );

  const setOpenAiApiKeyCommandHandler = async (name: string = "world") => {
    const apiKey = await vscode.window.showInputBox({
      prompt: "Enter your OpenAI API key",
      placeHolder: "sk-...",
    });

    if (apiKey) {
      await context.secrets.store(OPENAI_API_KEY_SECRET_KEY, apiKey);
      vscode.window.showInformationMessage(
        "Your OpenAI API key has been securely encrypted and stored."
      );
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      SET_OPEN_AI_API_KEY_COMMAND,
      setOpenAiApiKeyCommandHandler
    )
  );
}

export function deactivate() {}
