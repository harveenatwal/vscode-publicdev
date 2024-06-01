import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { formatDistanceToNowStrict } from "date-fns";
import { atom, useAtom } from "jotai";
import {
  HomeState,
  APP_READY_MESSAGE,
  INIT_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";
import { Commit as GitCommit } from "../../git";
import { cn } from "../utils";
import { Button } from "../ui/components/button";

const selectedTimelineCommitsAtom = atom(new Set<string>());

// Get a reference to the VS Code webview api.
// We use this API to post messages back to our extension.
const vscode = acquireVsCodeApi();

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

function App() {
  const [state, setState] = useState<HomeState>();
  const [selectedTimelineCommits, setTimelineCommits] = useAtom(
    selectedTimelineCommitsAtom
  );

  useEffect(() => {
    // Handle messages sent from the extension to the webview
    const listener = (event: MessageEvent<any>) => {
      const { type, data } = event.data;

      switch (type) {
        case INIT_MESSAGE:
        case UPDATE_MESSAGE:
          setState(data);
          break;
      }
    };
    window.addEventListener("message", listener);
    // App is ready. Let Webview know.
    vscode.postMessage({ type: APP_READY_MESSAGE });
    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

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
        <nav className="flex justify-between mb-4">
          <div className="flex gap-1 items-center -ml-2">
            <div className="group relative">
              <a href="https://x.com/PublicDevTeam">
                <i className="hover:bg-editor p-2 rounded inline-flex codicon codicon-twitter text-sm"></i>
              </a>
              <span className="group-hover:opacity-100 pointer-events-none absolute top-10 -left-1 w-max opacity-0 transition-opacity border shadow p-1 bg-tooltip text-tooltip-foreground rounded border-tooltip-border">
                @PublicDevTeam
              </span>
            </div>
            <div className="group relative">
              <a href="https://github.com/harveenatwal/vscode-publicdev/issues">
                <i className="hover:bg-editor p-2 rounded inline-flex codicon codicon-feedback text-sm"></i>
              </a>
              <span className="group-hover:opacity-100 pointer-events-none absolute top-10 -left-4 w-max opacity-0 transition-opacity border shadow p-1 px-2 bg-tooltip text-tooltip-foreground rounded border-tooltip-border">
                Issues
              </span>
            </div>
          </div>
          <div className="flex gap-1 items-center -mr-2">
            <div className="group relative">
              <a href="https://github.com/harveenatwal/vscode-publicdev/">
                <i className="hover:bg-editor p-2 rounded inline-flex codicon codicon-github text-sm"></i>
              </a>
              <span className="group-hover:opacity-100 pointer-events-none absolute top-10 -left-16 w-max opacity-0 transition-opacity border shadow p-1 px-2 bg-tooltip text-tooltip-foreground rounded border-tooltip-border">
                Github Repo
              </span>
            </div>
          </div>
        </nav>
      </header>
      <main className="pb-20">
        <nav className="space-y-8">
          <div className="px-5">
            <h2 className="mb-2 tracking-widest uppercase text-xs text-muted-foreground">
              Configure API Key
            </h2>
            <a
              href="command:publicdev.setOpenAIApiKey"
              className="flex gap-2 items-center"
            >
              <i className="pdicon pdicon-openai text-sm inline-flex"></i>
              <div>OpenAI </div>
            </a>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 w-full border-editor-border border-t bg-editor">
        <Button
          className="w-full flex gap-2 items-center"
          disabled={!hasCommitsSelected}
        >
          <i className="inline-flex codicon codicon-lightbulb-sparkle"></i>
          Brainstorm Ideas
        </Button>
      </div>
    </>
  );
}

(function () {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<App />);
})();
