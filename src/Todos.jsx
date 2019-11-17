import React, {
  useCallback, useState, useEffect, useRef,
} from 'react';
import './App.scss';
import 'typeface-roboto';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_TODO, DELETE_TODO } from './redux/actions';

function Todo({ name, editing, onDelete }) {
  const [value, setValue] = useState(name);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const content = (
    <input
      ref={inputRef}
      value={value}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          inputRef.current.blur();
        }
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      className={classNames({ completed })}
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
          setCompleted(!completed);
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
}

function CreateTodo({ addTodo }) {
  return (
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
}

export default function Todos() {
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(undefined);
  const addTodo = useCallback(() => {
    const id = todos.length;
    dispatch({ type: ADD_TODO, name: '', id });
    setEditing(id);
  }, [todos, dispatch, setEditing]);
  const deleteTodo = useCallback((id) => {
    dispatch({ type: DELETE_TODO, id });
    if (id === editing) {
      setEditing(undefined);
    }
  }, [dispatch]);
  return (
    <div className="todos">
      {todos.map(({ name, id }, idx) => (
        <Todo
          key={id}
          name={name}
          editing={idx === editing}
          onDelete={() => deleteTodo(id)}
        />
      ))}
      <CreateTodo addTodo={addTodo} />
    </div>
  );
}
