import { Moment } from 'moment';

export interface State {
  user?: User,
  todos: Todo[],
  events: Event[],
  editingEvent?: string,
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
