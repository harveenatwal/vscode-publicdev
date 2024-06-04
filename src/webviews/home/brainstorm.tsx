import { useAtom } from "jotai";
import React, { useCallback } from "react";
import { brainstormStateAtom } from "./atoms";
import { ExtensionHeaderLinks } from "./components/extension-header-links";
import { Link } from "react-router-dom";
import { PostIdea } from "./schema";
import { vscode } from "../lib/vscode";
import { COPY_TO_CLIPBOARD_MESSAGE } from "./shared";

interface PlatformIconProps {
  platform: string;
}

function PlatformIcon({ platform }: PlatformIconProps) {
  // In the off chance that there are multiple platforms,
  // try to show the first platform.
  const platform_ = platform.split(",")[0];

  switch (platform_.toLowerCase()) {
    case "twitter":
      return (
        <a href="https://x.com/">
          <i className="flex pdicon pdicon-twitter-x"></i>
        </a>
      );
    case "linkedin":
      return (
        <a href="https://linkedin.com/">
          <i className="flex pdicon pdicon-linkedin"></i>
        </a>
      );
    case "mastodon":
      return (
        <a href="https://mastodon.social/explore">
          <i className="flex pdicon pdicon-mastodon"></i>
        </a>
      );
    case "bluesky":
      return (
        <a href="https://bsky.app/">
          <i className="flex pdicon pdicon-bluesky"></i>
        </a>
      );
    case "facebook":
      return (
        <a href="https://facebook.com/">
          <i className="flex pdicon pdicon-facebook"></i>
        </a>
      );
    case "instagram":
      return (
        <a href="https://instagram.com/">
          <i className="flex pdicon pdicon-instagram"></i>
        </a>
      );
    case "threads":
      return <i className="flex pdicon pdicon-threads"></i>;
  }
  return <>{platform}</>;
}

export function Brainstorm() {
  const [state] = useAtom(brainstormStateAtom);
  const handleCopyIdea = useCallback((idea: PostIdea) => {
    vscode.postMessage({
      type: COPY_TO_CLIPBOARD_MESSAGE,
      data: idea.visual ? idea.content + "\n" + idea.visual : idea.content,
    });
  }, []);

  if (!state) {
    return null;
  }

  return (
    <div className="py-4">
      <header className="px-5">
        <ExtensionHeaderLinks />
      </header>
      <main className="px-5">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground flex gap-1 items-center"
            >
              <i className="flex codicon codicon-arrow-small-left"></i>
              Back to timeline
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          {state.brainstormPostIdeasResponse.posts.map((commitIdeaList, i) => (
            <>
              {commitIdeaList.postIdeas.map((idea, j) => (
                <div
                  key={i * j + j}
                  className="relative rounded overflow-hidden border border-editor-border py-5"
                >
                  <div className="absolute bg-editor opacity-50 inset-0 -z-50"></div>
                  <div className="px-5">
                    <div className="flex justify-between items-center gap-2 w-full mb-3 text-editor-foreground">
                      <div className="text-medium">
                        <span className="opacity-90">{idea.ideaType}</span>
                      </div>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="opacity-90">
                          <PlatformIcon platform={idea.platform}></PlatformIcon>
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground w-full">
                      {idea.content}
                    </div>
                    {idea.visual && (
                      <div className="text-muted-foreground w-full my-3">
                        [{idea.visual}]
                      </div>
                    )}
                    <div className="w-full flex mt-5 justify-between items-center">
                      <div className="border border-editor-border text-editor-foreground px-2 py-1 rounded-sm text-sm relative overflow-hidden">
                        <div className="absolute bg-editor inset-0 -z-40"></div>
                        <span className="opacity-70">{idea.format}</span>
                      </div>
                      <div
                        className="flex text-muted-foreground hover:text-button cursor-pointer"
                        onClick={() => handleCopyIdea(idea)}
                      >
                        <i className="flex codicon codicon-copy"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ))}
        </div>
      </main>
    </div>
  );
}
