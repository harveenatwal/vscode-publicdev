import { Commit } from "../../git";
import { BrainstormPostIdeasResponse } from "./schema";

export interface HomeState {
  repositoryCount: number;
  commitHistory: Commit[];
}

export interface BrainstormState {
  brainstormPostIdeasResponse: BrainstormPostIdeasResponse;
}

export const INIT_MESSAGE = "init";
export const UPDATE_MESSAGE = "update";
export const BRAINSTORM_IDEAS_ACTION_MESSAGE = "brainstorm_ideas_action";
export const COPY_BRAINSTORM_PROMPT_MESSAGE = "copy_brainstorm_prompt";
export const SHOW_BRAINSTORM_PANEL_MESSAGE = "show_brainstorm_panel";
export const FINISHED_BRAINSTORMING_MESSAGE = "finished_brainstorming";
export const COPY_TO_CLIPBOARD_MESSAGE = "copy_to_clipboard";
