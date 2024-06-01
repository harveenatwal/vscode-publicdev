import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { Home } from "./home";
import { INIT_MESSAGE, UPDATE_MESSAGE } from "./shared";
import { useHandleReceivePostMessage } from "../lib/hooks/use-handle-post-message";
import { Brainstorm } from "./brainstorm";
import { useAtom } from "jotai";
import { stateAtom } from "./atoms";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/brainstorm",
    element: <Brainstorm />,
  },
]);

function App() {
  const [state, setState] = useAtom(stateAtom);
  useHandleReceivePostMessage((event: MessageEvent<any>) => {
    const { type, data } = event.data;

    switch (type) {
      case INIT_MESSAGE:
      case UPDATE_MESSAGE:
        setState(data);
        break;
    }
  });

  if (!state) {
    return null;
  }

  return <RouterProvider router={router} />;
}

(function () {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<App />);
})();
