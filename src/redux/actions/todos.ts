import { ThunkAction as BaseThunkAction } from 'redux-thunk';

import { State, Todo } from '../../types';

import db from '../../firebase/firebase';

export const ADD_TODOS = 'ADD_TODOS';
export const DELETE_TODO = 'DELETE_TODO';
export const COMPLETE_TODO = 'COMPLETE_TODO';

type AddTodos = {
  type: typeof ADD_TODOS,
  todos: Todo[],
}

type CompleteTodo = {
  type: typeof COMPLETE_TODO,
  id: string,
  completed: boolean,
}

type DeleteTodo = {
  type: typeof DELETE_TODO,
  id: string,
}

export type Action = AddTodos | CompleteTodo | DeleteTodo;

type ThunkAction = BaseThunkAction<void, State, {}, Action>;

export function completeTodo(id: string, completed: boolean): ThunkAction {
  return (dispatch) => {
    db.collection('todos').doc(id).update({
      completed,
    });

    dispatch({ type: COMPLETE_TODO, id, completed });
  };
}

export function deleteTodo(id: string): ThunkAction {
  return (dispatch, getState) => {
    const state: State = getState();

    const batch = db.batch();

    const { prev, next } = state.todos.entities.byId[id];
    if (prev) {
      const prevRef = db.collection('todos').doc(prev);
      batch.update(prevRef, { next });
    }
    if (next) {
      const nextRef = db.collection('todos').doc(next);
      batch.update(nextRef, { prev });
    }

    db.collection('todos').doc(id).delete().then(() => {
      dispatch({ type: DELETE_TODO, id });
    });
  };
}
