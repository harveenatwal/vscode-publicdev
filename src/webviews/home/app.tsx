import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter, useNavigate, useRoutes } from "react-router-dom";
import { Home } from "./home";
import {
  FINISHED_BRAINSTORMING_MESSAGE,
  INIT_MESSAGE,
  SHOW_BRAINSTORM_PANEL_MESSAGE,
  UPDATE_MESSAGE,
} from "./shared";
import { useHandleReceivePostMessage } from "../lib/hooks/use-handle-post-message";
import { Brainstorm } from "./brainstorm";
import { useAtom } from "jotai";
import {
  brainstormStateAtom,
  homeStateAtom,
  isBrainstormingIdeasAtom,
} from "./atoms";

function App() {
  const [homeState, setHomeState] = useAtom(homeStateAtom);
  const [brainstormState, setBrainstormState] = useAtom(brainstormStateAtom);
  const [isBrainstormingIdeas, setIsBrainstormingIdeas] = useAtom(
    isBrainstormingIdeasAtom
  );
  const navigate = useNavigate();
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/brainstorm",
      element: <Brainstorm />,
    },
  ]);

  useHandleReceivePostMessage((event: MessageEvent<any>) => {
    const { type, data } = event.data;

    switch (type) {
      case INIT_MESSAGE:
      case UPDATE_MESSAGE:
        setHomeState(data);
        break;
      case SHOW_BRAINSTORM_PANEL_MESSAGE:
        setBrainstormState(data);
        navigate("/brainstorm");
        break;
      case FINISHED_BRAINSTORMING_MESSAGE:
        setIsBrainstormingIdeas(false);
        break;
    }
  });

  return routes;
}

(function () {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
})();
