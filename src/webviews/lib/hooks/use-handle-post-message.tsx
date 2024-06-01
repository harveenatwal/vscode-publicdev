import { useEffect } from "react";
import { APP_READY_MESSAGE } from "../constants/messages";
import { vscode } from "../vscode";

export const useHandleReceivePostMessage = (
  listener?: (event: MessageEvent<any>) => void
) =>
  useEffect(() => {
    if (listener) {
      window.addEventListener("message", listener);
    }
    // App is ready. Let Webview know.
    vscode.postMessage({ type: APP_READY_MESSAGE });
    return () => {
      if (listener) {
        window.removeEventListener("message", listener);
      }
    };
  }, []);
