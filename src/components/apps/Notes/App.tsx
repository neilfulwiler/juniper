import React from 'react';
import Notes from './Notes';

import './styles.scss';


const App: React.FC<{}> = () => (
  <div className="notes-app">
    <Notes notes={undefined} updateNotes={(notes) => console.log(notes)} />
  </div>
);

export default App;
