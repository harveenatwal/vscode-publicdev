import * as vscode from "vscode";
import { getNonce, replaceWebviewHtmlTokens } from "./utils";

const UTF8_TEXT_DECODER = new TextDecoder("utf8");

export abstract class BaseViewProvider implements vscode.WebviewViewProvider {
  protected view?: vscode.WebviewView;
  protected disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionContext: vscode.ExtensionContext,
    private readonly viewName: string
  ) {}

  protected abstract handleReceivePostMessage(data: any): Promise<void>;

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;

    this.view.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    this.view.webview.html = await this.getHtmlForWebview(webviewView.webview);
    this.view.onDidDispose(() => {
      for (const disposable of this.disposables) {
        disposable.dispose();
      }
    });

    this.disposables.push(
      this.view.webview.onDidReceiveMessage(
        this.handleReceivePostMessage.bind(this)
      )
    );
  }

  protected postMessage(type: string, data?: any) {
    if (this.view) {
      this.view.webview.postMessage({
        type,
        data,
      });
    }
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

  private getViewIndexUri() {
    return vscode.Uri.joinPath(this.getWebviewsUri(), `index.html`);
  }

  private getViewJsUri(webview: vscode.Webview) {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.getWebviewsUri(),
        this.viewName,
        `${this.viewName}.js`
      )
    );
  }
  private getMainCssUri(webview: vscode.Webview) {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(this.getDistUri(), "main.css")
    );
  }
  private getCodiconsUri(webview: vscode.Webview) {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.getNodeModulesUri(),
        "@vscode/codicons/dist/codicon.css"
      )
    );
  }
  private getPdiconsUri(webview: vscode.Webview) {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(this.getDistUri(), "pdicons.css")
    );
  }

  private async getHtmlForWebview(webview: vscode.Webview) {
    const bytes = await vscode.workspace.fs.readFile(this.getViewIndexUri());
    return replaceWebviewHtmlTokens(UTF8_TEXT_DECODER.decode(bytes), {
      cspSource: webview.cspSource,
      cspNonce: getNonce(),
      cssUri: this.getMainCssUri(webview).toString(),
      jsUri: this.getViewJsUri(webview).toString(),
      rootUri: this.getRootUri().toString(),
      codiconsUri: this.getCodiconsUri(webview).toString(),
      pdiconsUri: this.getPdiconsUri(webview).toString(),
    });
  }
}
