import { ThunkAction as BaseThunkAction } from 'redux-thunk';

import { TimeRange, User, Event } from '../../types';

import db from '../../firebase/firebase';

export const ADD_EVENTS = 'ADD_EVENTS';
export const EVENT_CREATED = 'EVENT_CREATED';
export const DELETE_EVENT = 'DELETE_EVENT';
export const SET_EDITING_EVENT = 'SET_EDITING_EVENT';
export const UPDATE_EVENT = 'UPDATE_EVENT';

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

type SetEditingEvent = {
  type: typeof SET_EDITING_EVENT,
  id: string | undefined,
}

export type Action = EventCreated | AddEvents | UpdateEvent | DeleteEvent | SetEditingEvent;

type ThunkAction = BaseThunkAction<void, {}, {}, Action>;

// TODO consolidate these update functions

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

export function updateEvent(event: Event, updates: Partial<Event>): ThunkAction {
  const { id } = event;
  return (dispatch) => {
    const { startTime, endTime } = updates;

    db.collection('events').doc(id).update({
      ...updates,
      ...(startTime ? { startTime: startTime.unix() } : {}),
      ...(endTime ? { endTime: endTime.unix() } : {}),
    }).then(() => {
      dispatch({ type: UPDATE_EVENT, id, event: { ...event, ...updates } });
    });
  };
}

export function deleteEvent(id: string): ThunkAction {
  return (dispatch) => {
    db.collection('events').doc(id).delete().then(() => {
      dispatch({ type: DELETE_EVENT, id });
    });
  };
}
