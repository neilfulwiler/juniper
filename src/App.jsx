import React from 'react';
import Todos from './Todos';


function logIn() {}
function signUp() {

}

function Header() {
  return (
    <div className="header">
      <div
        className="header-button"
        onClick={() => logIn()}
      >
        Log In
      </div>
      <div>|</div>
      <div
        className="header-button"
        onClick={() => signUp()}
      >
        Sign Up
      </div>
    </div>
  );
}


function App() {
  return (
    <div className="App">
      <Header />
      <Todos />
    </div>
  );
}

export default App;
