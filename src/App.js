import React, {useState} from 'react';
import './App.css';
import 'typeface-roboto';
import IconButton from '@material-ui/core/IconButton';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import classNames from 'classnames';

const todos = [
  {name: 'link to shard transitions from i/titan'},
  {name: 'initialize traces in mqtt'},
  {name: 'remove delta payload fields from queue entry'},
  {name: 'roll out one iris'},
];

function Todo({name}) {
  const [value, setValue] = useState(name);
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState(false);
  const content = editing ? (
      <input 
        className="todoInput"
        value={value} 
        onChange={e => setValue(e.target.value)}
      />
     ) : <div className={classNames({completedTask: checked})} onClick={() => setEditing(true)}>{value}</div>;

  return (
    <div className="todo">
      <IconButton onClick={() => setChecked(!checked)}>
        {checked ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}
      </IconButton>
      {content}
    </div>
  );
}

function App() {
  const [value, setValue] = useState("");

  return (
    <div className="App">
      <div className="list">
        {todos.map(({name}, idx) => (
          <Todo key={idx} name={name}/>
        ))}
      </div>
    </div>
  );
}

export default App;
