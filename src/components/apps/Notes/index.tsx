import React, { useMemo } from 'react';
import throttle from 'lodash.throttle';
import { useDispatch, useSelector } from 'react-redux';
import NotesIcon from '@material-ui/icons/Notes';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment, { Moment } from 'moment';

import { addNotes, updateNotes } from '../../../redux/actions/notes';
import Notes from './Notes';
import { State, Note, User } from '../../../types';

import './styles.scss';


function byDate({ byId, allIds }: {byId: {[key: string]: Note}, allIds: string[]}): Map<string, Note> {
  const byDate: Map<string, Note> = new Map();
  for (const id of allIds) {
    byDate.set(byId[id].date.format('YYYYMMDD'), byId[id]);
  }
  return byDate;
}


const App: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const user: User | undefined = useSelector<State, User | undefined>((state) => state.user.entity);
  const throttledUpdateNotes = useMemo(() => throttle((note: Note | undefined, date: Moment, updatedNotes: string) => {
    if (user === undefined) {
      return;
    }
    if (note !== undefined) {
      dispatch(updateNotes(note.id, updatedNotes));
    } else {
      dispatch(addNotes(user, today, updatedNotes));
    }
  }, 5000), [dispatch, user]);

  const notes: Map<string, Note> = useSelector<State, Map<string, Note>>((state) => byDate(state.notes.entities));

  const today = moment().startOf('day');
  const note: Note | undefined = notes.get(today.format('YYYYMMDD'));

  let content;
  if (user === undefined) {
    content = <CircularProgress />;
  } else {
    content = (
      <div style={{ backgroundColor: 'white', height: '100%', width: '100%' }}>
        <Notes
          key={note && note.id || 'none'}
          notes={note && note.notes}
          updateNotes={(updatedNotes: string) => throttledUpdateNotes(note, today, updatedNotes)}
        />
      </div>
    );
  }

  return (
    <div className="notes-app">
      <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '24px' }}>
        <NotesIcon />
      </div>
      {content}
    </div>
  );
};

export default App;
