import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../../git";
import {
  BRAINSTORM_IDEAS_ACTION_MESSAGE,
  HomeState,
  INIT_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";
import { BaseViewProvider } from "../base-view-provider";
import { APP_READY_MESSAGE } from "../lib/constants/messages";
import { OpenAIClientManager } from "../lib/openai-client";
import { brainstormIdeasPrompt, systemMessage } from "./prompts";

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

  protected async handleReceivePostMessage(data: any) {
    switch (data.type) {
      case APP_READY_MESSAGE: {
        this.postMessage(INIT_MESSAGE, this.homeState);
        break;
      }
      case BRAINSTORM_IDEAS_ACTION_MESSAGE: {
        await this.brainstormIdeas(data.data);
      }
    }
  }

  private async brainstormIdeas(commits: string[]) {
    const openAIClientManager = OpenAIClientManager.getInstance();
    const openai = openAIClientManager.getClient();
    const recentCommits = await this.getRecentCommitHistory();

    const completion = await openai.chat.completions.create({
      messages: [
        systemMessage(),
        brainstormIdeasPrompt(
          recentCommits.filter((commit) => commits.includes(commit.hash))
        ),
      ],
      model: "gpt-3.5-turbo",
    });
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
