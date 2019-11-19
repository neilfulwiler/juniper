import {
  LOGGED_IN, LOGGED_OUT, ADD_TODOS, DELETE_TODO, COMPLETE_TODO,
} from './actions';

const initialState = {
  todos: [
  ],
  user: undefined,
};


function sort(todos) {
  return todos.sort((a, b) => a.sortOrder - b.sortOrder);
}

function replace(elements, predicate, overrides) {
  const idx = elements.findIndex(predicate);
  return elements.slice(0, idx).concat(
    [
      { ...elements[idx], ...overrides },
    ],
  ).concat(elements.slice(idx + 1, elements.length));
}

export default function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODOS:
      return {
        ...state,
        todos: sort(state.todos.concat(action.todos
          .filter(({ id }) => state.todos.findIndex((e) => e.id === id) === -1))),
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
      };

    default:
      return state;
  }
}
