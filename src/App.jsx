import React from 'react';
import Header from './Header';
import Todos from './Todos';
import Sidebar from './Sidebar';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div style={{ width: '100%' }}>
        <Header />
        <Todos />
      </div>
    </div>
  );
}

export default App;
