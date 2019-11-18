import {
  LOGGED_IN, LOGGED_OUT, ADD_TODOS, DELETE_TODO,
} from './actions';

const initialState = {
  todos: [
  ],
  user: undefined,
};

export default function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODOS:
      return {
        ...state,
        todos: state.todos.concat(action.todos
          .filter(({ id }) => state.todos.findIndex((e) => e.id === id) === -1)),
      };
    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(({ id }) => id !== action.id),
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
