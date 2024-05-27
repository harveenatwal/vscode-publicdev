import * as vscode from "vscode";
import { HomeViewProvider } from "./webviews/home/home-view-provider";

export function activate(context: vscode.ExtensionContext) {
  const homeViewProvider = new HomeViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HomeViewProvider.viewType,
      homeViewProvider
    )
  );
}

export function deactivate() {}
