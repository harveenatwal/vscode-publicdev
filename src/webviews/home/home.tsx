import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <>
      <header>
        <div>
          <div className="mb-4 border-editor-border border-l-4 border-0 bg-editor rounded-lg p-3 pl-4">
            <h1 className="font-medium mb-1">No repository detected</h1>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Start using PublicDev by opening an existing git repository
                folder or cloning a repository from a URL in the Explorer.
              </p>
              <a
                className="block text-center bg-button text-button-foreground py-1 px-4 rounded"
                href="command:workbench.view.explorer"
              >
                Open a Folder or Repository
              </a>
            </div>
          </div>
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
                <li>Find the commit you want to share.</li>
                <li>
                  Right-click the commit and select <br />
                  PublicDev -{">"} Share on X (Twitter).
                </li>
              </ol>
            </div>
          </div>
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
              <a href="https://github.com/harveymoonlights/vscode-publicdev/issues">
                <i className="hover:bg-editor p-2 rounded inline-flex codicon codicon-feedback text-sm"></i>
              </a>
              <span className="group-hover:opacity-100 pointer-events-none absolute top-10 -left-4 w-max opacity-0 transition-opacity border shadow p-1 px-2 bg-tooltip text-tooltip-foreground rounded border-tooltip-border">
                Issues
              </span>
            </div>
          </div>
          <div className="flex gap-1 items-center -mr-2">
            <div className="group relative">
              <a href="https://github.com/harveymoonlights/vscode-publicdev/">
                <i className="hover:bg-editor p-2 rounded inline-flex codicon codicon-github text-sm"></i>
              </a>
              <span className="group-hover:opacity-100 pointer-events-none absolute top-10 -left-16 w-max opacity-0 transition-opacity border shadow p-1 px-2 bg-tooltip text-tooltip-foreground rounded border-tooltip-border">
                Github Repo
              </span>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <nav className="space-y-8">
          <div>
            <h2 className="mb-2 tracking-widest uppercase text-xs text-muted-foreground">
              Configure API Keys
            </h2>
            <a
              href="command:publicdev.setOpenAIApiKey"
              className="flex gap-2 items-center"
            >
              <i className="pdicon pdicon-openai text-sm inline-flex"></i>
              <div>OpenAI </div>
            </a>
          </div>
        </nav>
      </main>
    </>
  );
}

(function () {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<App />);

  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  function initialize() {}

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "initialize":
        initialize();
        return;
    }
  });
})();
