import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../../git";
import {
  BRAINSTORM_IDEAS_ACTION_MESSAGE,
  COPY_BRAINSTORM_PROMPT_MESSAGE,
  COPY_TO_CLIPBOARD_MESSAGE,
  FINISHED_BRAINSTORMING_MESSAGE,
  HomeState,
  INIT_MESSAGE,
  SHOW_BRAINSTORM_PANEL_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";
import { BaseViewProvider } from "../base-view-provider";
import { APP_READY_MESSAGE } from "../lib/constants/messages";
import { OpenAIClientManager } from "../lib/openai-client";
import {
  brainstormIdeasPrompt,
  brainstormIdeasPromptJsonSchema,
  systemMessage,
} from "./prompts";
import { z } from "zod";
import { brainstormPostIdeasResponseSchema } from "./schema";
import { OPENAI_API_KEY_SECRET_KEY } from "../../constants/secrets";

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

  protected async handleReceivePostMessage(message: any) {
    const { type, data } = message;
    switch (type) {
      case APP_READY_MESSAGE: {
        this.postMessage(INIT_MESSAGE, this.homeState);
        break;
      }
      case BRAINSTORM_IDEAS_ACTION_MESSAGE: {
        await this.brainstormIdeas(data);
        break;
      }
      case COPY_BRAINSTORM_PROMPT_MESSAGE: {
        await this.copyBrainstormPrompt(data);
        break;
      }
      case COPY_TO_CLIPBOARD_MESSAGE: {
        this.copyToClipboard(data);
        break;
      }
    }
  }

  private async brainstormIdeas(commits: string[]) {
    const openAIClientManager = OpenAIClientManager.getInstance();
    const openai = openAIClientManager.getClient();
    if (!openai) {
      return;
    }

    const recentCommits = await this.getRecentCommitHistory();
    const selectedCommits = recentCommits.filter((commit) =>
      commits.includes(commit.hash)
    );

    try {
      const completion = await openai.chat.completions.create({
        response_format: { type: "json_object" },
        messages: [
          systemMessage(),
          brainstormIdeasPromptJsonSchema(),
          brainstormIdeasPrompt(selectedCommits),
        ],
        model: "gpt-3.5-turbo",
      });
      this.postMessage(FINISHED_BRAINSTORMING_MESSAGE);

      const jsonContent = completion.choices[0]?.message?.content;
      if (!jsonContent) {
        vscode.window.showErrorMessage("OpenAI API response missing content");
        return;
      }

      try {
        const jsonData = JSON.parse(jsonContent);
        const parsedData = brainstormPostIdeasResponseSchema.parse(jsonData);
        this.postMessage(SHOW_BRAINSTORM_PANEL_MESSAGE, {
          brainstormPostIdeasResponse: parsedData,
        });
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          const errorMessage = `Invalid JSON schema: ${parseError.issues
            .map((issue) => issue.message)
            .join(", ")}`;
          console.error(`[ERROR] ${errorMessage}`);
        }
        vscode.window.showErrorMessage(
          "Error parsing JSON from OpenAI response"
        );
      }
    } catch (apiError: any) {
      this.postMessage(FINISHED_BRAINSTORMING_MESSAGE);
      if (apiError.response) {
        const errorResponse = apiError.response.data;
        const errorMessage = `OpenAI API error: ${errorResponse.error.message} (Type: ${errorResponse.error.type})`;
        console.log(`[ERROR] ${errorMessage}`);
        vscode.window.showErrorMessage(errorMessage);
      } else {
        vscode.window.showErrorMessage(
          "OpenAI API error: Network or request issue"
        );
        console.log(
          `[ERROR] OpenAI API error: Network or request issue: ${apiError.message}`
        );
      }
    }
  }

  private async copyBrainstormPrompt(commits: string[]) {
    const recentCommits = await this.getRecentCommitHistory();
    const selectedCommits = recentCommits.filter((commit) =>
      commits.includes(commit.hash)
    );
    const system = systemMessage().content;
    const prompt = brainstormIdeasPrompt(selectedCommits).content as string;

    this.copyToClipboard(system + "\n\n" + prompt);
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
    this.disposables.push(
      this.extensionContext.secrets.onDidChange(async (e) => {
        if (e.key === OPENAI_API_KEY_SECRET_KEY) {
          await this.updateHomeState();
        }
      })
    );
  }

  private async handleRepositoryChange() {
    await this.updateHomeState();
  }

  private async updateHomeState() {
    await this.initializeHomeState();
    this.postMessage(UPDATE_MESSAGE, this.homeState);
  }

  private async initializeHomeState() {
    const repositories = this.git?.repositories || [];

    this.homeState = {
      repositoryCount: repositories.length,
      commitHistory: await this.getRecentCommitHistory(),
      hasAnApiKey: OpenAIClientManager.getInstance().getClient() !== null,
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
