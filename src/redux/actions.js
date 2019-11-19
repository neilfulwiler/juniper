import moment from 'moment';

import db from '../firebase/firebase';

export const ADD_TODOS = 'ADD_TODOS';
export const DELETE_TODO = 'DELETE_TODO';
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const COMPLETE_TODO = 'COMPLETE_TODO';
export const ADD_EVENTS = 'ADD_EVENTS';


export function addEvent(user, { startTime, endTime }) {
  return (dispatch) => {
    db.collection('events').add({
      startTime: startTime.unix(),
      endTime: endTime.unix(),
      uid: user.uid,
    }).then(() => {
      dispatch({ type: ADD_EVENTS, events: [{ startTime, endTime }] });
    });
  };
}


export function completeTodo(id, completed) {
  return (dispatch) => {
    db.collection('todos').doc(id).update({
      completed,
    });

    dispatch({ type: COMPLETE_TODO, id, completed });
  };
}

export function deleteTodo(id) {
  return (dispatch) => {
    db.collection('todos').doc(id).delete().then(() => {
      dispatch({ type: DELETE_TODO, id });
    });
  };
}

export function logOut() {
  return (dispatch) => {
    dispatch({ type: LOGGED_OUT });
  };
}

export function logIn(user) {
  return (dispatch) => {
    dispatch({ type: LOGGED_IN, user });
    if (user) {
      db.collection('todos').where('uid', '==', user.uid).get().then((querySnapshot) => {
        dispatch({
          type: ADD_TODOS,
          todos: querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })),
        });
      });
      db.collection('events').where('uid', '==', user.uid).get().then((querySnapshot) => {
        dispatch({
          type: ADD_EVENTS,
          events: querySnapshot.docs.map((doc) => {
            const { startTime, endTime, ...rest } = doc.data();
            return {
              startTime: moment(startTime * 1000),
              endTime: moment(endTime * 1000),
              id: doc.id,
              ...rest,
            };
          }),
        });
      });
    }
  };
}
