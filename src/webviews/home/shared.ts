import { Commit } from "../../git";

export interface HomeState {
  repositoryCount: number;
  commitHistory: Commit[];
}

export const APP_READY_MESSAGE = "ready";
export const INIT_MESSAGE = "init";
export const UPDATE_MESSAGE = "update";
