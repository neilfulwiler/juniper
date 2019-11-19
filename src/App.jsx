import React from 'react';
import Header from './Header';
import Todos from './Todos';
import Sidebar from './Sidebar';
import Stats from './Stats';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div style={{ width: '100%' }}>
        <Stats />
        <Header />
        <Todos />
      </div>
    </div>
  );
}

export default App;
