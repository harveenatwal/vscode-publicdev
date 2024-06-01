import { atom } from "jotai";
import { HomeState } from "./shared";

export const stateAtom = atom<HomeState | null>(null);
export const selectedTimelineCommitsAtom = atom(new Set<string>());
