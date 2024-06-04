import React from "react";

export function ExtensionHeaderLinks() {
  return (
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
  );
}
