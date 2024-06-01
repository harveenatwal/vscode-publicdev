import React from "react";
import { useHandleReceivePostMessage } from "../lib/hooks/use-handle-post-message";

export function Brainstorm() {
  useHandleReceivePostMessage((event: MessageEvent<any>) => {
    const { type, data } = event.data;

    switch (type) {
    }
  });

  return (
    <>
      <main>Hello world</main>
    </>
  );
}
