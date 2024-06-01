import { Commit } from "../../git";

export interface HomeState {
  repositoryCount: number;
  commitHistory: Commit[];
}

export const INIT_MESSAGE = "init";
export const UPDATE_MESSAGE = "update";
