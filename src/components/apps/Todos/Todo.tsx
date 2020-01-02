import React, {
  useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import db from '../../../firebase/firebase';

interface Props {
  name: string,
  id: string,
  completed: boolean,
  editing: boolean,
  onDelete: () => void,
  onUpdateStatus: (completed: boolean) => void,
}

const Todo: React.FC<Props> = ({
  name, id, completed, editing, onDelete, onUpdateStatus,
}: Props) => {
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

export default Todo;
