import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../Header';
import Todos from '../Todos/Todos';
import Sidebar from '../Sidebar';
import Stats from '../Stats';
import { State } from '../types';
import { App as AppType } from '../redux/actions/nav';

import './styles.scss';

function App() {
  const app: AppType = useSelector<State, AppType>((state) => state.nav.app);

  let content;
  switch (app) {
    case 'Todos':
      content = <Todos />;
      break;
    case 'Notes':
      content = <h1>hi</h1>;
      break;
  }

  return (
    <div className="App">
      <Sidebar />
      <div style={{ width: '100%' }}>
        <Stats />
        <Header />
        {content}
      </div>
    </div>
  );
}

export default App;
