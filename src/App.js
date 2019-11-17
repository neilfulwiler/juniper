import React, {useState, useEffect, useRef} from 'react';
import './App.scss';
import 'typeface-roboto';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import classNames from 'classnames';

const initialTodos = [
  {name: 'link to shard transitions from i/titan', id: 0},
  {name: 'initialize traces in mqtt', id: 1},
  {name: 'remove delta payload fields from queue entry', id: 2},
  {name: 'roll out one iris', id: 3},
];

function Todo({name, editing, onDelete}) {
  const [value, setValue] = useState(name);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (editing) {
      inputRef.current.focus(); 
    }
  }, [editing]);

  const content =
    <input 
      ref={inputRef}
      value={value} 
      onKeyPress={e => {
        if (e.key === 'Enter') {
          inputRef.current.blur();
        }
      }}
      onChange={e => {
        setValue(e.target.value)
      }}
      className={classNames({completed: completed})} 
      spellCheck={false}
      placeholder="Add Title"
      type="text"
    />;

  return (
    <div className="todo">
      <IconButton 
        className="action"
        onClick={() => {
        setCompleted(!completed);
      }}>
        {completed ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}
      </IconButton>
      {content}
      <IconButton 
        className="action"
        onClick={() => {
          onDelete();
      }}>
        <DeleteOutlineIcon />
      </IconButton>
    </div>
  );
}

function CreateTodo({addTodo}) {
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

function App() {
  const [todos, setTodos] = useState(initialTodos);
  const [editing, setEditing] = useState(undefined);
  return (
    <div className="App">
      <div className="todos">
        {todos.map(({name, id}, idx) => (
          <Todo 
            key={id} 
            name={name} 
            editing={idx === editing} 
            onDelete={() => setTodos(
              todos
                .slice(0, idx)
                .concat(todos.slice(idx+1, todos.length)))}/>
        ))}
        <CreateTodo addTodo={() => {
          setTodos(todos.concat({name: "", id: todos.length}));
          setEditing(todos.length);
        }}/>
      </div>
    </div>
  );
}

export default App;
