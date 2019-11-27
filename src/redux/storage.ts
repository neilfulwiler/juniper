import moment from 'moment';
import { Todo, Event, State } from '../types';

interface SerializedState {
  todos: SerializedTodo[],
  events: SerializedEvent[],
}

interface SerializedTodo {
  id: string,
  sortOrder: number,
  completed: boolean,
  name: string,
}

interface SerializedTimeRange {
  startTime: number,
  endTime: number,
}

interface SerializedEvent extends SerializedTimeRange {
  id: string,
  uid: string,
  title: string,
  notes?: string,
}

const fromSerializedTodo = (todo: SerializedTodo): Todo => todo;

const toSerializedTodo = (todo: Todo): SerializedTodo => todo;

export const fromSerializedEvent = ({
  id, uid, title, startTime, endTime, notes,
}: SerializedEvent): Event => ({
  id,
  uid,
  title,
  startTime: moment.unix(startTime),
  endTime: moment.unix(endTime),
  notes,
});

const toSerializedEvent = ({
  id, uid, title, startTime, endTime, notes,
}: Event): SerializedEvent => ({
  id,
  uid,
  title,
  startTime: startTime.unix(),
  endTime: endTime.unix(),
  notes,
});

const fromSerializedState = ({ todos, events }: SerializedState): State => ({
  todos: todos.map(fromSerializedTodo),
  events: events.map(fromSerializedEvent),
});

const toSerializedState = ({ todos, events }: State): SerializedState => ({
  todos: todos.map(toSerializedTodo),
  events: events.map(toSerializedEvent),
});

export const loadState = (): State | undefined => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return fromSerializedState(JSON.parse(serializedState) as SerializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: State): void => {
  try {
    localStorage.setItem('state', JSON.stringify(toSerializedState(state)));
  } catch {
    // ignore write errors
  }
};
