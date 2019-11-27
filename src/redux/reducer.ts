import {
  LOGGED_IN,
  LOGGED_OUT,
  ADD_TODOS,
  DELETE_TODO,
  COMPLETE_TODO,
  ADD_EVENTS,
  EVENT_CREATED,
  SET_EDITING_EVENT,
  DELETE_EVENT,
  UPDATE_EVENT,
  Action,
} from './actions';

import { State, Event, Todo } from '../types';

const initialState: State = {
  todos: [
  ],
  user: undefined,
  events: [],
  editingEvent: undefined,
};


function sort(todos: Todo[]): Todo[] {
  return todos.sort((a, b) => a.sortOrder - b.sortOrder);
}

function replace<T>(elements: T[], predicate: ((t: T) => boolean), overrides: Partial<T>) {
  const idx = elements.findIndex(predicate);
  return elements.slice(0, idx).concat(
    [
      { ...elements[idx], ...overrides },
    ],
  ).concat(elements.slice(idx + 1, elements.length));
}

export default function todoApp(state: State = initialState, action: Action): State {
  switch (action.type) {
    case EVENT_CREATED:
      return {
        ...state,
        events: state.events.concat([action.event]),
        editingEvent: action.event.id,
      };
    case ADD_EVENTS:
      return {
        ...state,
        events: state.events
          .filter(({ id }: Event) => action.events.findIndex((e) => e.id === id) === -1)
          .concat(action.events),
      };
    case SET_EDITING_EVENT:
      return {
        ...state,
        editingEvent: action.id,
      };
    case UPDATE_EVENT:
      return {
        ...state,
        events: replace(state.events, (event) => event.id === action.id, action.event),
      };
    case DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.id),
        editingEvent: undefined,
      };
    case ADD_TODOS:
      return {
        ...state,
        todos: sort(state.todos
          .filter(({ id }: Todo) => action.todos.findIndex((e) => e.id === id) === -1)
          .concat(action.todos)),
      };
    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(({ id }) => id !== action.id),
      };

    case COMPLETE_TODO:
      return {
        ...state,
        todos: replace(state.todos, (todo) => todo.id === action.id, { completed: action.completed }),
      };

    case LOGGED_IN:
      return {
        ...state,
        user: action.user,
      };

    case LOGGED_OUT:
      return {
        ...state,
        user: undefined,
        todos: [],
        events: [],
      };

    default:
      return state;
  }
}
