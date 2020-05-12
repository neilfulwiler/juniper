import React from "react";
import { useSelector } from "react-redux";
import Header from "../Header";
import Todos from "../apps/Todos";
import Notes from "../apps/Notes";
import Sidebar from "../Sidebar";
import Stats from "../Stats";
import { State } from "../types";
import { App as AppType } from "../redux/actions/nav";

import "./styles.scss";

function App() {
  const app: AppType = useSelector<State, AppType>((state) => state.nav.app);

  return (
    <div className="App">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Stats />
        <Header />
        <div style={{ display: "flex", height: "100%" }}>
          <Todos />
          <Notes />
        </div>
      </div>
    </div>
  );
}

export default App;
