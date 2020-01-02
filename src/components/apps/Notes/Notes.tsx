import React, { useCallback, useState } from 'react';
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

  useCallback(() => {
    notes !== undefined && setNotesEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(notes))));
  }, [notes]);

  return (
    <div className="notes-editor">
      <Editor
        editorState={notesEditorState}
        onChange={(state: EditorState) => {
          setNotesEditorState(state);
          updateNotes(JSON.stringify(convertToRaw(state.getCurrentContent())));
        }}
      />
    </div>
  );
};

export default Notes;
