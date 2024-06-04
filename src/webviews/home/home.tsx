import React, { useCallback, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAtom } from "jotai";
import { Commit as GitCommit } from "../../git";
import { cn } from "../utils";
import { Button } from "../ui/components/button";
import {
  selectedTimelineCommitsAtom,
  homeStateAtom,
  isBrainstormingIdeasAtom,
} from "./atoms";
import { vscode } from "../lib/vscode";
import {
  BRAINSTORM_IDEAS_ACTION_MESSAGE,
  COPY_BRAINSTORM_PROMPT_MESSAGE,
} from "./shared";
import { ExtensionHeaderLinks } from "./components/extension-header-links";

interface CommitProps {
  commit: GitCommit;
}

function Commit({ commit }: CommitProps) {
  const [selectedTimelineCommits, setTimelineCommits] = useAtom(
    selectedTimelineCommitsAtom
  );

  const handleCommitClick = useCallback(() => {
    const newSelectedCommits = new Set(selectedTimelineCommits);
    if (newSelectedCommits.has(commit.hash)) {
      newSelectedCommits.delete(commit.hash);
    } else {
      newSelectedCommits.add(commit.hash);
    }
    setTimelineCommits(newSelectedCommits);
  }, [commit, selectedTimelineCommits]);

  const isAnyChecked = selectedTimelineCommits.size > 0;
  const isChecked = selectedTimelineCommits.has(commit.hash);

  return (
    <div
      className="flex gap-2 items-center justify-between text-sm flex-0 hover:bg-editor cursor-pointer px-5 py-0.5 group"
      onClick={() => handleCommitClick()}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        <i
          className={cn("codicon codicon-git-commit group-hover:hidden", {
            "inline-flex": !isAnyChecked,
            "!hidden": isAnyChecked,
          })}
        ></i>
        <input
          type="checkbox"
          className={cn("group-hover:block", { hidden: !isAnyChecked })}
          value={commit.hash}
          checked={isChecked}
          readOnly
        ></input>
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
        {commit.message}
      </div>
      {commit.authorDate && (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-0 text-muted-foreground flex-0 text-right">
          {formatDistanceToNowStrict(commit.authorDate)}
        </div>
      )}
    </div>
  );
}

export function Home() {
  const [isBrainstormingIdeas, setIsBrainstormingIdeas] = useAtom(
    isBrainstormingIdeasAtom
  );
  const [state] = useAtom(homeStateAtom);
  const [selectedTimelineCommits, setTimelineCommits] = useAtom(
    selectedTimelineCommitsAtom
  );

  const handleBrainstormIdeasClick = useCallback(() => {
    setIsBrainstormingIdeas(true);
    vscode.postMessage({
      type: BRAINSTORM_IDEAS_ACTION_MESSAGE,
      data: Array.from(selectedTimelineCommits.values()),
    });
    setTimelineCommits(new Set());
  }, [setTimelineCommits, selectedTimelineCommits]);

  const handlePromptCopyToClipboard = useCallback(() => {
    vscode.postMessage({
      type: COPY_BRAINSTORM_PROMPT_MESSAGE,
      data: Array.from(selectedTimelineCommits.values()),
    });
  }, [selectedTimelineCommits]);

  if (!state) {
    return null;
  }

  const { repositoryCount, commitHistory } = state;
  const hasCommitsSelected = selectedTimelineCommits.size > 0;

  return (
    <>
      <header className="px-5">
        <div>
          {repositoryCount === 0 && (
            <div className="mb-4 border-editor-border border-l-4 border-0 bg-editor rounded-lg p-3 pl-4">
              <h1 className="font-medium mb-1">No repository detected</h1>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Start using PublicDev by opening an existing git repository
                  folder or cloning a repository from a URL in the Explorer.
                </p>
                <a
                  className="block text-center bg-button text-button-foreground py-1 px-5 rounded"
                  href="command:workbench.view.explorer"
                >
                  Open a Folder or Repository
                </a>
              </div>
            </div>
          )}
          {repositoryCount > 0 && (
            <div className="mb-4 border-editor-border border-l-4 border-0 bg-editor rounded-lg p-3 pl-4">
              <h1 className="font-medium mb-2">Get started with PublicDev</h1>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Ready to build in public? It's this easy:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                  <li>
                    <a
                      href="command:publicdev.setOpenAIApiKey"
                      className="underline"
                    >
                      Configure your OpenAI API key
                    </a>
                  </li>
                  <li>Select one or more commits that you'd like to share.</li>
                  <li>
                    Click "Brainstorm Ideas" to get AI-generated suggestions for
                    your social media posts.
                  </li>
                  <li>
                    Choose the ideas you like and start drafting your perfect
                    message!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
        <ExtensionHeaderLinks />
      </header>
      <main className="pb-32">
        <nav className="space-y-8">
          <div className="px-5">
            <h2 className="mb-2 tracking-widest uppercase text-xs text-muted-foreground">
              Configure
            </h2>
            <div className="space-y-1.5">
              <a
                href="command:publicdev.showSettingsPage"
                className="flex gap-2 items-center"
              >
                <i className="codicon codicon-gear text-sm flex w-5 h-5 items-center justify-center"></i>
                <div>Settings</div>
              </a>
              <a
                href="command:publicdev.setOpenAIApiKey"
                className="flex gap-2 items-center"
              >
                <i className="pdicon pdicon-openai text-sm flex w-5 h-5 items-center justify-center"></i>
                <div>OpenAI API Key</div>
              </a>
            </div>
          </div>
          {commitHistory.length > 0 && (
            <div>
              <h2 className="mb-2 tracking-widest uppercase text-xs text-muted-foreground px-5">
                Timeline
              </h2>
              <div className="space-y-1.5">
                {commitHistory.map((commit, i) => (
                  <Commit key={i} commit={commit} />
                ))}
              </div>
            </div>
          )}
        </nav>
      </main>
      <div className="fixed bottom-0 left-0 right-0 p-4 w-full border-editor-border border-t bg-editor space-y-2">
        <Button
          className="w-full flex gap-2 items-center"
          onClick={() => handlePromptCopyToClipboard()}
          disabled={!hasCommitsSelected}
          variant={"outline"}
        >
          <i className="inline-flex codicon codicon-clippy"></i>
          Copy Prompt
        </Button>
        <Button
          className="w-full flex gap-2 items-center"
          onClick={() => handleBrainstormIdeasClick()}
          disabled={!hasCommitsSelected || isBrainstormingIdeas}
        >
          {!isBrainstormingIdeas && (
            <>
              <i className="inline-flex codicon codicon-lightbulb-sparkle"></i>
              Brainstorm Ideas
            </>
          )}

          {isBrainstormingIdeas && (
            <>
              <i className="inline-flex codicon codicon-loading animate-spin"></i>
              Brainstorming...
            </>
          )}
        </Button>
      </div>
    </>
  );
}
