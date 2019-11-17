import { ADD_TODO, DELETE_TODO } from './actions';

const initialState = {
  todos: [
    { name: 'link to shard transitions from i/titan', id: 0 },
    { name: 'initialize traces in mqtt', id: 1 },
    { name: 'remove delta payload fields from queue entry', id: 2 },
    { name: 'roll out one iris', id: 3 },
  ],
};

export default function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: state.todos.concat(
          [{ name: action.name, id: action.id }],
        ),
      };
    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(({ id }) => id !== action.id),
      };
    default:
      return state;
  }
}
