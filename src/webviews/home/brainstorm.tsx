import { useAtom } from "jotai";
import React from "react";
import { brainstormStateAtom } from "./atoms";

export function Brainstorm() {
  const [state] = useAtom(brainstormStateAtom);

  if (!state) {
    return null;
  }

  return (
    <>
      {state.brainstormPostIdeasResponse.posts.map((commitIdeaList, i) => (
        <div key={i}>
          <div>{commitIdeaList.commitMessage}</div>
          <div>
            {commitIdeaList.postIdeas.map((idea) => (
              <div>
                <div>{idea.title}</div>
                <div>{idea.format}</div>
                <div>{idea.content}</div>
                <div>{idea.visual}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
