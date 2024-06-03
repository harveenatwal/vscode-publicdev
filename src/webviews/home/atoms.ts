import { atom } from "jotai";
import { HomeState, BrainstormState } from "./shared";

export const homeStateAtom = atom<HomeState | null>(null);
export const brainstormStateAtom = atom<BrainstormState | null>(null);

export const selectedTimelineCommitsAtom = atom(new Set<string>());
export const isBrainstormingIdeasAtom = atom(false);
