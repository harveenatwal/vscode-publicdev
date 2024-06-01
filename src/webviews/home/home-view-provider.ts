import * as vscode from "vscode";
import { getNonce, replaceWebviewHtmlTokens } from "../utils";
import { API as GitAPI, GitExtension } from "../../git";
import {
  HomeState,
  APP_READY_MESSAGE,
  INIT_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";

const UTF8_TEXT_DECODER = new TextDecoder("utf8");
const MAX_COMMITS_IN_TIMELINE = 15;

export class HomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "publicdev.homeView";

  private disposables: vscode.Disposable[] = [];

  private view?: vscode.WebviewView;
  private homeState?: HomeState;
  private git?: GitAPI;

  constructor(private readonly extensionContext: vscode.ExtensionContext) {
    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;
    if (gitExtension.enabled) {
      this.git = gitExtension.getAPI(1);
    }

    this.initializeHomeState();
    this.bindEvents();
  }

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
      this.view.webview.onDidReceiveMessage((data) => {
        switch (data.type) {
          case APP_READY_MESSAGE: {
            this.postMessage(INIT_MESSAGE, this.homeState);
            break;
          }
        }
      })
    );

    this.postMessage(UPDATE_MESSAGE, this.homeState);
  }

  private bindEvents() {
    if (this.git) {
      this.disposables.push(
        this.git.onDidOpenRepository(this.handleRepositoryChange.bind(this))
      );
      this.disposables.push(
        this.git.onDidCloseRepository(this.handleRepositoryChange.bind(this))
      );
    }
  }

  private async handleRepositoryChange() {
    await this.initializeHomeState();
    this.postMessage(UPDATE_MESSAGE, this.homeState);
  }

  private async initializeHomeState() {
    const repositories = this.git?.repositories || [];

    this.homeState = {
      repositoryCount: repositories.length,
      commitHistory: await this.getRecentCommitHistory(),
    };
  }

  private async getRecentCommitHistory() {
    const repositories = this.git?.repositories || [];
    const repoLogs = await Promise.all(
      repositories.map(async (repo) => await repo.log())
    );
    const commitHistory = repoLogs
      .flatMap((log) => log)
      .sort((a, b) =>
        a.authorDate && b.authorDate
          ? b.authorDate.valueOf() - a.authorDate.valueOf()
          : 0
      );
    return commitHistory.slice(0, MAX_COMMITS_IN_TIMELINE);
  }

  private postMessage(type: string, data: any) {
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
    const html = replaceWebviewHtmlTokens(UTF8_TEXT_DECODER.decode(bytes), {
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
