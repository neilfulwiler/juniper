import { ThunkAction as BaseThunkAction } from 'redux-thunk';

import { ADD_TODOS, Action as TodoAction } from './todos';
import { ADD_EVENTS, Action as EventAction } from './events';

import {
  User,
} from '../../types';

import { fromSerializedEvent } from '../storage';

import db from '../../firebase/firebase';

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';

type LogIn = {
  type: typeof LOGGED_IN,
  user: User,
}

type LoggedOut = {
  type: typeof LOGGED_OUT,
}

export type Action = LogIn | LoggedOut;

type ThunkAction = BaseThunkAction<void, {}, {}, Action | TodoAction | EventAction>;

export function logOut(): ThunkAction {
  return (dispatch) => {
    dispatch({ type: LOGGED_OUT });
  };
}

export function logIn(user: User): ThunkAction {
  return (dispatch) => {
    dispatch({ type: LOGGED_IN, user });
    if (user) {
      db.collection('todos').where('uid', '==', user.uid).get().then((querySnapshot) => {
        dispatch({
          type: ADD_TODOS,
          todos: querySnapshot.docs.map((doc) => {
            const { sortOrder, completed, name } = doc.data();
            return {
              id: doc.id,
              sortOrder,
              completed,
              name,
            };
          }),
        });
      });
      db.collection('events').where('uid', '==', user.uid).get().then((querySnapshot) => {
        dispatch({
          type: ADD_EVENTS,
          events: querySnapshot.docs.map((doc) => {
            const {
              startTime, endTime, uid, title, notes,
            } = doc.data();
            return fromSerializedEvent({
              id: doc.id,
              startTime,
              endTime,
              uid,
              title,
              notes,
            });
          }),
        });
      });
    }
  };
}
