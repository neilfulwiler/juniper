import React, {
  useCallback, useState, useEffect, useRef,
} from 'react';
import '../App.scss';
import 'typeface-roboto';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useEventListener } from '../utils';
import { completeTodo, deleteTodo as deleteTodoAction, ADD_TODOS } from '../redux/actions';
import { State, Todo as TodoType, User } from '../types';
import db from '../firebase/firebase';

interface TodoProps {
  name: string,
  id: string,
  completed: boolean,
  editing: boolean,
  onDelete: () => void,
  onUpdateStatus: (completed: boolean) => void,
}

const Todo: React.FC<TodoProps> = ({
  name, id, completed, editing, onDelete, onUpdateStatus,
}: TodoProps) => {
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const content = (
    <input
      ref={inputRef}
      value={value}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && inputRef.current) {
          inputRef.current.blur();
        }
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      className={classNames({ completed })}
      onBlur={() => {
        db.collection('todos').doc(id).update({ name: value });
      }}
      spellCheck={false}
      placeholder="Add Title"
      type="text"
    />
  );

  return (
    <div className="todo">
      <IconButton
        className="action"
        onClick={() => {
          onUpdateStatus(!completed);
        }}
      >
        {completed ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </IconButton>
      {content}
      <IconButton
        className="action"
        onClick={() => {
          onDelete();
        }}
      >
        <DeleteOutlineIcon />
      </IconButton>
    </div>
  );
};

const CreateTodo: React.FC<{addTodo: () => void}> = ({ addTodo }: {addTodo: () => void}) => (
  <div className="createButton">
    <IconButton
      size="medium"
      onClick={() => {
        addTodo();
      }}
    >
      <AddCircleIcon />
    </IconButton>
  </div>
);


function useKeyBindings(addTodo: () => void): void {
  const handlePlus = useCallback((e) => {
    if (e.key === '+') {
      addTodo();
    }
  }, [addTodo]);

  useEventListener('keypress', handlePlus);
}

const Footer: React.FC<{}> = ({ children }) => <div className="footer">{children}</div>;

export default function Todos() {
  const todos = useSelector<State, TodoType[]>((state) => state.todos);
  const user = useSelector<State, User | undefined>((state) => state.user);
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
}
