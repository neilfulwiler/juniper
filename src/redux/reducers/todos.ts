import _ from 'lodash';
import { Todo } from '../../types';
import {
  Action, ADD_TODOS, DELETE_TODO, COMPLETE_TODO,
} from '../actions/todos';

export interface State {
  entities: {
    byId: {[key: string]: Todo},
    allIds: string[],
  }
}

const initialState: State = { entities: { byId: {}, allIds: [] } };

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ADD_TODOS:
      return {
        ...state,
        entities: {
          byId: {
            ...state.entities.byId,
            ...action.todos.reduce((acc, todo) => ({ ...acc, [todo.id]: todo }), {}),
          },
          allIds: _.uniq([...state.entities.allIds, ...action.todos.map(({ id }) => id)]),
        },
      };
    case DELETE_TODO:
      return {
        ...state,
        entities: {
          byId: state.entities.allIds.filter((id) => id !== action.id)
            .reduce((acc, id) => ({ ...acc, [id]: state.entities.byId[id] }), {}),
          allIds: state.entities.allIds.filter((id) => id !== action.id),
        },
      };

    case COMPLETE_TODO:
      return {
        ...state,
        entities: {
          byId: {
            ...state.entities.byId,
            [action.id]: {
              ...state.entities.byId[action.id],
              completed: action.completed,
            },
          },
          allIds: state.entities.allIds,
        },
      };

    default:
      return state;
  }
}
