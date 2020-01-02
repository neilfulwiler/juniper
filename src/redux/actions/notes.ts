import { Moment } from 'moment';
import { ThunkAction as BaseThunkAction } from 'redux-thunk';
import { Date, Note, User } from '../../types';
import db from '../../firebase/firebase';

export const ADD_NOTES = 'ADD_NOTES';
export const UPDATE_NOTES = 'UPDATE_NOTES';

type AddNotes = {
  type: typeof ADD_NOTES,
  notes: Note[],
}

type UpdateNotes = {
  type: typeof UPDATE_NOTES,
  id: string,
  notes: string,
}

export type Action = AddNotes | UpdateNotes;

type ThunkAction = BaseThunkAction<void, {}, {}, Action>;

export function addNotes(user: User, date: Moment, notes: string): ThunkAction {
  return (dispatch) => {
    db.collection('notes').add({
      uid: user.uid,
      date: date.format(),
      notes,
    }).then(({ id }: {id: string}) => {
      dispatch({ type: ADD_NOTES, notes: [{ id, date, notes }] });
    });
  };
}

export function updateNotes(id: string, notes: string): ThunkAction {
  return (dispatch) => {
    db.collection('notes').doc(id).update({
      notes,
    });

    dispatch({ type: UPDATE_NOTES, id, notes });
  };
}
