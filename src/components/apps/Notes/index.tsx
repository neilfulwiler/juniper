import React from 'react';
import NotesIcon from '@material-ui/icons/Notes';
import IconButton from '@material-ui/core/IconButton';
import Notes from './Notes';

import './styles.scss';


const App: React.FC<{}> = () => (
  <div className="notes-app">
    <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '24px' }}>
      <NotesIcon />
    </div>
    <div style={{ backgroundColor: 'white', height: '100%', width: '100%' }}>
      <Notes notes={undefined} updateNotes={(notes) => console.log(notes)} />
    </div>
  </div>
);

export default App;
