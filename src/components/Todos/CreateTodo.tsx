import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';

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


export default CreateTodo;
