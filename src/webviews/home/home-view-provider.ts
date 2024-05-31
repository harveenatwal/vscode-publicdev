import * as vscode from "vscode";
import { getNonce, replaceWebviewHtmlTokens } from "../utils";
import { API as GitAPI, GitExtension } from "../../git";
import {
  HomeState,
  APP_READY_MESSAGE,
  INIT_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";

const utf8TextDecoder = new TextDecoder("utf8");

export class HomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "publicdev.homeView";

  private _view?: vscode.WebviewView;
  private _git?: GitAPI;
  private _homeState?: HomeState;
  private _disposables: vscode.Disposable[] = [];

  constructor(private readonly extensionContext: vscode.ExtensionContext) {
    console.log("constructor");
    this._homeState = this.initializeHomeState();
    this.bindEvents();
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    this._view.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    this._view.webview.html = await this.getHtmlForWebview(webviewView.webview);
    this._view.onDidDispose(() => {
      for (const disposable of this._disposables) {
        disposable.dispose();
      }
    });

    this._disposables.push(
      this._view.webview.onDidReceiveMessage((data) => {
        switch (data.type) {
          case APP_READY_MESSAGE: {
            this.postMessage(INIT_MESSAGE, this._homeState);
            break;
          }
        }
      })
    );

    this.postMessage(UPDATE_MESSAGE, this._homeState);
  }

  private bindEvents() {
    this._disposables.push(
      this.git.onDidOpenRepository(this.handleRepositoryChange)
    );
    this._disposables.push(
      this.git.onDidCloseRepository(this.handleRepositoryChange)
    );
  }

  private handleRepositoryChange() {
    this._homeState = this.initializeHomeState();
    this.postMessage(UPDATE_MESSAGE, this._homeState);
  }

  private initializeHomeState() {
    return {
      repositoryCount: this.git.repositories.length,
    };
  }

  private postMessage(type: string, data: any) {
    if (this._view) {
      this._view.webview.postMessage({
        type,
        data,
      });
    }
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
