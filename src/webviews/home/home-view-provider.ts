import * as vscode from "vscode";
import { getNonce, replaceWebviewHtmlTokens } from "../utils";

const utf8TextDecoder = new TextDecoder("utf8");

export class HomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "publicdev.homeView";

  private _view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this.getRootUri()],
    };

    webviewView.webview.html = await this.getHtmlForWebview(
      webviewView.webview
    );

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
      }
    });
  }

  private getRootUri() {
    return this.extensionUri;
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
      rootUri: this.getRootUri().toString(),
      codiconsUri: codiconsUri.toString(),
      pdiconsUri: pdiconsUri.toString(),
    });

    return html;
  }
}
