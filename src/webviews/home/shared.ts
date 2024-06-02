import { Commit } from "../../git";

export interface HomeState {
  repositoryCount: number;
  commitHistory: Commit[];
}

export const INIT_MESSAGE = "init";
export const UPDATE_MESSAGE = "update";
export const BRAINSTORM_IDEAS_ACTION_MESSAGE = "brainstorm_ideas_action";
