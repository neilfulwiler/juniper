import { Moment } from 'moment';

import { State as EventsState } from './redux/reducers/events';
import { State as TodosState } from './redux/reducers/todos';
import { State as UserState } from './redux/reducers/user';

export interface State {
  user: UserState,
  todos: TodosState,
  events: EventsState,
}

export interface User {
  uid: string,
}

export interface Todo {
  id: string,
  sortOrder: number,
  completed: boolean,
  name: string,
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
