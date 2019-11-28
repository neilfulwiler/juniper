import { Todo } from '../../types';
import {
  Action, ADD_TODOS, DELETE_TODO, COMPLETE_TODO,
} from '../actions/todos';
import { replace } from './utils';

export interface State {
  entities: Todo[],
}

function sort(todos: Todo[]): Todo[] {
  return todos.sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function reducer(state: State = { entities: [] }, action: Action): State {
  switch (action.type) {
    case ADD_TODOS:
      return {
        ...state,
        entities: sort(state.entities
          .filter(({ id }: Todo) => action.todos.findIndex((e) => e.id === id) === -1)
          .concat(action.todos)),
      };
    case DELETE_TODO:
      return {
        ...state,
        entities: state.entities.filter(({ id }) => id !== action.id),
      };

    case COMPLETE_TODO:
      return {
        ...state,
        entities: replace(state.entities, (todo) => todo.id === action.id, { completed: action.completed }),
      };

    default:
      return state;
  }
}
