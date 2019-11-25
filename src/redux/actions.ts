import moment from 'moment';
import { ThunkAction as BaseThunkAction } from 'redux-thunk';

import {
  Event, Todo, User, TimeRange,
} from '../types';

import db from '../firebase/firebase';

export const ADD_TODOS = 'ADD_TODOS';
export const DELETE_TODO = 'DELETE_TODO';
export const COMPLETE_TODO = 'COMPLETE_TODO';

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';

export const ADD_EVENTS = 'ADD_EVENTS';
export const EVENT_CREATED = 'EVENT_CREATED';
export const DELETE_EVENT = 'DELETE_EVENT';
export const SET_EDITING_EVENT = 'SET_EDITING_EVENT';
export const UPDATE_EVENT = 'UPDATE_EVENT';

type AddTodos = {
  type: typeof ADD_TODOS,
  todos: Todo[],
}

type CompleteTodo = {
  type: typeof COMPLETE_TODO,
  id: string,
  completed: boolean,
}

type DeleteTodo = {
  type: typeof DELETE_TODO,
  id: string,
}

/**
 * batch add events, like on log in
 */
type AddEvents = {
  type: typeof ADD_EVENTS,
  events: Event[],
};

/**
 * an event was just created
 */
type EventCreated = {
  type: typeof EVENT_CREATED,
  event: Event,
};

type UpdateEvent = {
  type: typeof UPDATE_EVENT,
  id: string,
  event: Event,
}

type DeleteEvent = {
  type: typeof DELETE_EVENT,
  id: string,
}

type LogIn = {
  type: typeof LOGGED_IN,
  user: User,
}

type LoggedOut = {
  type: typeof LOGGED_OUT,
}

type SetEditingEvent = {
  type: typeof SET_EDITING_EVENT,
  id: string | undefined,
}

export type Action = EventCreated | AddEvents | UpdateEvent | DeleteEvent | SetEditingEvent |
  AddTodos | CompleteTodo | DeleteTodo |
  LogIn | LoggedOut;

type ThunkAction = BaseThunkAction<void, {}, {}, Action>;

export function createEvent(user: User, { startTime, endTime }: TimeRange): ThunkAction {
  return (dispatch) => {
    db.collection('events').add({
      startTime: startTime.unix(),
      endTime: endTime.unix(),
      uid: user.uid,
    }).then((docRef) => {
      // TOOD grab the actual fields from the docRef
      const event: Event = {
        startTime, endTime, uid: user.uid, id: docRef.id, title: '',
      };
      dispatch({
        type: EVENT_CREATED,
        event,
      });
    });
  };
}

// TODO consolidate these update functions

export function updateTitle(event: Event, { title }: {title: string}): ThunkAction {
  const { id } = event;
  return (dispatch) => {
    db.collection('events').doc(id).update({
      title,
    }).then(() => {
      dispatch({ type: UPDATE_EVENT, id, event: { ...event, title } });
    });
  };
}

export function updateTimeRange(event: Event, { startTime, endTime }: TimeRange): ThunkAction {
  const { id } = event;
  return (dispatch) => {
    db.collection('events').doc(id).update({
      startTime: startTime.unix(),
      endTime: endTime.unix(),
    }).then(() => dispatch({ type: UPDATE_EVENT, id, event: { ...event, startTime, endTime } }));
  };
}

export function deleteEvent(id: string): ThunkAction {
  return (dispatch) => {
    db.collection('events').doc(id).delete().then(() => {
      dispatch({ type: DELETE_EVENT, id });
    });
  };
}


export function completeTodo(id: string, completed: boolean): ThunkAction {
  return (dispatch) => {
    db.collection('todos').doc(id).update({
      completed,
    });

    dispatch({ type: COMPLETE_TODO, id, completed });
  };
}

export function deleteTodo(id: string): ThunkAction {
  return (dispatch) => {
    db.collection('todos').doc(id).delete().then(() => {
      dispatch({ type: DELETE_TODO, id });
    });
  };
}

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
              startTime, endTime, uid, title,
            } = doc.data();
            return {
              startTime: moment(startTime * 1000),
              endTime: moment(endTime * 1000),
              id: doc.id,
              uid,
              title,
            };
          }),
        });
      });
    }
  };
}
