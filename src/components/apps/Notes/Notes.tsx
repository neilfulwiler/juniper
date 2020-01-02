import React, { useState } from 'react';
import {
  convertFromRaw, convertToRaw, Editor, EditorState,
} from 'draft-js';


interface Props {
  notes?: string,
  updateNotes: (notes: string) => void,
}


const Notes: React.FC<Props> = ({ notes, updateNotes }) => {
  const [notesEditorState, setNotesEditorState] = useState(
    notes === undefined
      ? EditorState.createEmpty()
      : EditorState.createWithContent(convertFromRaw(JSON.parse(notes))),
  );

  return (
    <Editor
      editorState={notesEditorState}
      onChange={(state: EditorState) => {
        setNotesEditorState(state);
        updateNotes(state);
      }}
    />
  );
};

export default Notes;
