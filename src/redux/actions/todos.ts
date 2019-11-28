import { ThunkAction as BaseThunkAction } from 'redux-thunk';

import { Todo } from '../../types';

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

type ThunkAction = BaseThunkAction<void, {}, {}, Action>;

export function completeTodo(id: string, completed: boolean): ThunkAction {
  return (dispatch) => {
    db.collection('todos').doc(id).update({
      completed,
    });

    dispatch({ type: COMPLETE_TODO, id, completed });
  };
}

export function deleteTodo(id: string): ThunkAction {
  return (dispatch) => {
    db.collection('todos').doc(id).delete().then(() => {
      dispatch({ type: DELETE_TODO, id });
    });
  };
}
