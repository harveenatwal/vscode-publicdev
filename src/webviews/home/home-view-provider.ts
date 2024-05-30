import * as vscode from "vscode";
import { getNonce, replaceWebviewHtmlTokens } from "../utils";
import { API as GitAPI, GitExtension } from "../../git";

const utf8TextDecoder = new TextDecoder("utf8");

export class HomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "publicdev.homeView";

  private _view?: vscode.WebviewView;
  private _git?: GitAPI;

  constructor(private readonly extensionContext: vscode.ExtensionContext) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    webviewView.webview.html = await this.getHtmlForWebview(
      webviewView.webview
    );

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
      }
    });
  }

  private get git() {
    if (!this._git) {
      const gitExtension =
        vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;
      this._git = gitExtension.getAPI(1);
    }
    return this._git;
  }

  private getRootUri() {
    return this.extensionContext.extensionUri;
  }

  private getDistUri() {
    return vscode.Uri.joinPath(this.getRootUri(), "dist");
  }

  private getWebviewsUri() {
    return vscode.Uri.joinPath(this.getDistUri(), "webviews");
  }

  private getNodeModulesUri() {
    return vscode.Uri.joinPath(this.getRootUri(), "node_modules");
  }

  private async getHtmlForWebview(webview: vscode.Webview) {
    const htmlUri = vscode.Uri.joinPath(this.getWebviewsUri(), "home.html");
    const jsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.getWebviewsUri(), "home", "home.js")
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.getDistUri(), "main.css")
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.getNodeModulesUri(),
        "@vscode/codicons/dist/codicon.css"
      )
    );
    const pdiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.getDistUri(), "pdicons.css")
    );

    const [bytes] = await Promise.all([vscode.workspace.fs.readFile(htmlUri)]);
    const html = replaceWebviewHtmlTokens(utf8TextDecoder.decode(bytes), {
      cspSource: webview.cspSource,
      cspNonce: getNonce(),
      cssUri: cssUri.toString(),
      jsUri: jsUri.toString(),
      rootUri: this.getRootUri().toString(),
      codiconsUri: codiconsUri.toString(),
      pdiconsUri: pdiconsUri.toString(),
    });

    return html;
  }
}
