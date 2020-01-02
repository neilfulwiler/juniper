import moment from 'moment';
import { App } from './reducers/nav';
import { Todo, Event, State } from '../types';

interface SerializedState {
  todos: {entities: SerializedTodo[]},
  events: {entities: SerializedEvent[]},
  nav: { app: App },
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

const fromSerializedState = ({ todos, events, nav }: SerializedState): State => ({
  todos: { entities: todos.entities.map(fromSerializedTodo) },
  events: { entities: events.entities.map(fromSerializedEvent), ui: { editingEvent: undefined } },
  user: { entity: undefined },
  nav,
  notes: { entities: { byId: {}, allIds: [] } },
});

const toSerializedState = ({ todos, events, nav }: State): SerializedState => ({
  todos: { entities: todos.entities.map(toSerializedTodo) },
  events: { entities: events.entities.map(toSerializedEvent) },
  nav,
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
  localStorage.setItem('state', JSON.stringify(toSerializedState(state)));
};
