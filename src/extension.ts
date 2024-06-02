import { window, ExtensionContext, Disposable, commands } from "vscode";
import { HomeViewProvider } from "./webviews/home/home-view-provider";
import {
  OPEN_SETTINGS_COMMAND,
  SET_OPEN_AI_API_KEY_COMMAND,
} from "./constants/commands";
import { OPENAI_API_KEY_SECRET_KEY } from "./constants/secrets";

export function activate(context: ExtensionContext) {
  // Ensure all disposables are properly subscribed and disposed of
  // when the extension unloads.
  const disposables: Disposable[] = [];
  context.subscriptions.push(
    new Disposable(() => Disposable.from(...disposables).dispose())
  );

  const homeViewProvider = window.registerWebviewViewProvider(
    HomeViewProvider.viewType,
    new HomeViewProvider(context)
  );
  disposables.push(homeViewProvider);

  const setOpenAiApiKeyCommandHandler = async (name: string = "world") => {
    const apiKey = await window.showInputBox({
      prompt: "Enter your OpenAI API key",
      placeHolder: "sk-...",
    });

    if (apiKey) {
      await context.secrets.store(OPENAI_API_KEY_SECRET_KEY, apiKey);
      window.showInformationMessage(
        "Your OpenAI API key has been securely encrypted and stored."
      );
    }
  };
  const setOpenAIApiKeyCommand = commands.registerCommand(
    SET_OPEN_AI_API_KEY_COMMAND,
    setOpenAiApiKeyCommandHandler
  );
  disposables.push(setOpenAIApiKeyCommand);

  const openSettingsCommand = commands.registerCommand(
    OPEN_SETTINGS_COMMAND,
    () => {
      commands.executeCommand("workbench.action.openSettings", "PublicDev");
    }
  );
  disposables.push(openSettingsCommand);
}

export function deactivate() {}
