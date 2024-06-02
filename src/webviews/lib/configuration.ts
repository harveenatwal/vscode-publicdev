import * as vscode from "vscode";
import { Profile } from "./types";

const config = vscode.workspace.getConfiguration("publicdev");

export const getProfile: () => Profile | null = () => {
  const name = config.get<string>("profile.name", "");
  const bio = config.get<string>("profile.bio", "");
  const communicationStyle = config.get<string[]>(
    "profile.communicationStyle",
    []
  );

  if (!name && !bio && communicationStyle.length === 0) {
    return null;
  }

  return {
    name,
    bio,
    communicationStyle,
  };
};

export const getPreferredPlatforms = () => {
  return config.get<string[]>("platform.preferredPlatforms", []);
};
