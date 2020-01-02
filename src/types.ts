import { Moment } from 'moment';

import { State as EventsState } from './redux/reducers/events';
import { State as TodosState } from './redux/reducers/todos';
import { State as UserState } from './redux/reducers/user';
import { State as NavState } from './redux/reducers/nav';
import { State as NotesState } from './redux/reducers/notes';

export interface State {
  user: UserState,
  todos: TodosState,
  events: EventsState,
  nav: NavState,
  notes: NotesState,
}

export interface User {
  uid: string,
}

export interface Date {
  year: number,
  month: number,
  day: number,
}

export interface Note {
  id: string,
  date: Moment,
  notes: string,
}

export interface Todo {
  id: string,
  completed: boolean,
  name: string,

  // prev & next point to 2 other todos forming a doubly linked list
  prev?: string,
  next?: string,
}

export interface TimeRange {
  startTime: Moment,
  endTime: Moment,
}

export interface Event extends TimeRange {
  id: string,
  uid: string,
  title: string,
  notes?: string,
}
