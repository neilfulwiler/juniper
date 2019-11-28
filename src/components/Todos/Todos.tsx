import React, {
  useCallback, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEventListener } from '../../utils';
import { completeTodo, deleteTodo as deleteTodoAction, ADD_TODOS } from '../../redux/actions/todos';
import { State, Todo as TodoType, User } from '../../types';
import db from '../../firebase/firebase';

import CreateTodo from './CreateTodo';
import Footer from './Footer';
import Todo from './Todo';


function useKeyBindings(addTodo: () => void): void {
  const handlePlus = useCallback((e) => {
    if (e.key === '+') {
      addTodo();
    }
  }, [addTodo]);

  useEventListener('keypress', handlePlus);
}

const Todos: React.FC<{}> = () => {
  const todos = useSelector<State, TodoType[]>((state) => state.todos.entities);
  const user = useSelector<State, User | undefined>((state) => state.user.entity);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState<string | undefined>(undefined);

  const addTodo = useCallback(() => {
    if (!user) {
      // put it into local storage?
      return;
    }

    // hard to put this into actions because I want to set editing equal to the
    // new id. I could put editing state into redux
    const sortOrder = Math.max(...todos.map((todo: TodoType) => todo.sortOrder)) + 1;
    if (isNaN(sortOrder)) throw new Error('bad sort order');
    db.collection('todos').add({
      name: '',
      uid: user.uid,
      sortOrder,
    }).then(({ id }: {id: string}) => {
      dispatch({ type: ADD_TODOS, todos: [{ name: '', id, sortOrder }] });
      setEditing(id);
    });
  }, [todos, user, dispatch, setEditing]);


  const deleteTodo = useCallback((id) => {
    dispatch(deleteTodoAction(id));
    if (id === editing) {
      setEditing(undefined);
    }
  }, [dispatch, editing]);

  useKeyBindings(addTodo);

  return (
    <div className="todos">
      {todos.map(({ name, id, completed }) => (
        <Todo
          key={id}
          id={id}
          name={name}
          editing={id === editing}
          onDelete={() => deleteTodo(id)}
          onUpdateStatus={(update) => {
            dispatch(completeTodo(id, update));
          }}
          completed={completed}
        />
      ))}
      <Footer>
        <CreateTodo addTodo={addTodo} />
      </Footer>
    </div>
  );
};


export default Todos;
