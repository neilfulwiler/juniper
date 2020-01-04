import _ from 'lodash';
import { Todo } from '../../types';
import {
  AddTodos, DeleteTodo, CompleteTodo, Action, ADD_TODOS, DELETE_TODO, COMPLETE_TODO,
} from '../actions/todos';

export interface State {
  entities: {
    byId: {[key: string]: Todo},
    allIds: string[],
  },
  ui: {
    sortOrder: string[],
  },
}

const initialState: State = { entities: { byId: {}, allIds: [] }, ui: { sortOrder: [] } };

function replace(
  byId: {[id: string]: Todo},
  idToReplace: string,
  f: ((value: Todo) => Todo),
): {[id: string]: Todo} {
  return {
    ...byId,
    idToReplace: f(byId[idToReplace]),
  };
}

function makeSortOrder({ entities }: Pick<State, 'entities'>): string[] {
  const { byId, allIds } = entities;
  const head = _.find(allIds, (id) => !byId[id].prev) as string;
  let node = byId[head];
  const order: string[] = [head];
  while (node.next) {
    node = byId[node.next];
    order.push(node.id);
  }
  return order;
}

function addTodos(state: State, action: AddTodos): State {
  const entities = {
    byId: {
      ...state.entities.byId,
      ...action.todos.reduce((acc, todo) => ({ ...acc, [todo.id]: todo }), {}),
    },
    allIds: _.uniq([...state.entities.allIds, ...action.todos.map(({ id }) => id)]),
  };
  return {
    ...state,
    entities,
    ui: {
      sortOrder: makeSortOrder({ entities }),
    },
  };
}

function deleteTodo(state: State, action: DeleteTodo): State {
  const { prev, next } = state.entities.byId[action.id];
  let { byId } = state.entities;
  if (prev) {
    byId = replace(byId, prev, (prevValue) => ({ ...prevValue, next }));
  }
  if (next) {
    byId = replace(byId, next, (nextValue) => ({ ...nextValue, prev }));
  }
  return {
    ...state,
    entities: {
      byId:
      state.entities.allIds.filter((id) => id !== action.id)
        .reduce((acc, id) => ({ ...acc, [id]: byId[id] }), {}),
      allIds: state.entities.allIds.filter((id) => id !== action.id),
    },
    ui: {
      sortOrder: state.ui.sortOrder.filter((id) => id !== action.id),
    },
  };
}

function completeTodo(state: State, action: CompleteTodo): State {
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
}

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ADD_TODOS:
      return addTodos(state, action);

    case DELETE_TODO:
      return deleteTodo(state, action);

    case COMPLETE_TODO:
      return completeTodo(state, action);


    default:
      return state;
  }
}
