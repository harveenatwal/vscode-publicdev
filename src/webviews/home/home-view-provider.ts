import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../../git";
import { HomeState, INIT_MESSAGE, UPDATE_MESSAGE } from "./shared";
import { BaseViewProvider } from "../base-view-provider";
import { APP_READY_MESSAGE } from "../lib/constants/messages";

const MAX_COMMITS_IN_TIMELINE = 15;
const VIEW_NAME = "home";

export class HomeViewProvider extends BaseViewProvider {
  public static readonly viewType = "publicdev.homeView";

  private homeState?: HomeState;
  private git?: GitAPI;

  constructor(extensionContext: vscode.ExtensionContext) {
    super(extensionContext, VIEW_NAME);

    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;
    if (gitExtension.enabled) {
      this.git = gitExtension.getAPI(1);
    }

    this.initializeHomeState();
    this.bindEvents();
  }

  protected handleReceivePostMessage(data: any) {
    switch (data.type) {
      case APP_READY_MESSAGE: {
        this.postMessage(INIT_MESSAGE, this.homeState);
        break;
      }
    }
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
}
