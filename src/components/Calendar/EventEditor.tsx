import React, { useCallback, useEffect, useState } from 'react';
import {
  convertFromRaw, convertToRaw, Editor, EditorState,
} from 'draft-js';
import throttle from 'lodash.throttle';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import CreateIcon from '@material-ui/icons/Create';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';
import moment, { Moment } from 'moment';
import TimeRangePicker from '../TimeRangePicker';
import { momentToTime, Time } from '../TimeRangePicker/utils';

interface Props {
  title: string,
  startTime: Moment,
  endTime: Moment,
  onUpdateTitle: (args: {title: string}) => void,
  onUpdateNotes: (args: {notes: string}) => void,
  onBlur: () => void,
  onDelete: () => void,
  onUpdateTimeRange: (args: {startTime: Moment, endTime: Moment}) => void,
  onStopEditing: () => void,
  eventRef: HTMLDivElement,
  notes?: string,
}

const EventEditor: React.FC<Props> = ({
  title, startTime, endTime, onUpdateTitle, onBlur, onUpdateNotes, onDelete, onStopEditing, eventRef, notes,
  onUpdateTimeRange,
}) => {
  const [value, setValue] = useState(title);
  const [editingNotes, setEditingNotes] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | undefined>();
  const inputRefCallback = useCallback((node) => {
    if (node) {
      setInputRef(node);
    }
  }, []);

  useEffect(() => {
    inputRef && inputRef.focus();
  }, [inputRef]);

  const [notesEditorState, setNotesEditorState] = useState(
    notes === undefined
      ? EditorState.createEmpty()
      : EditorState.createWithContent(convertFromRaw(JSON.parse(notes))),
  );

  const [editorRef, setEditorRef] = useState<HTMLInputElement | null>(null);

  const editorRefCallback = useCallback((node) => {
    node && setEditorRef(node);
  }, [setEditorRef]);

  useEffect(() => {
    editingNotes && editorRef && editorRef.focus();
  }, [editingNotes, editorRef]);

  const updateNotes = throttle((state) => onUpdateNotes({ notes: JSON.stringify(convertToRaw(state.getCurrentContent())) }));

  const range = [
    momentToTime(startTime),
    momentToTime(endTime),
  ];

  return (
    <Popper
      open
      className="eventEditor-popper"
      anchorEl={eventRef}
      placement="right"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="arrow-left" />
      <div
        className="eventEditor-container"
      >
        <div className="eventEditor-header">
          <div className="eventEditor-title">
            <input
              ref={inputRefCallback}
              placeholder="add event name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateTitle({ title: value });
                } else if (e.key === 'Escape') {
                  onBlur();
                }
              }}
            />
            <div className="eventEditor-timerange">
              <TimeRangePicker
                range={range}
                onRangeChange={([start, end]: [Time, Time]) => {
                  const newStartTime = moment(startTime)
                    .hours(start.hours)
                    .minutes(start.minutes);
                  const newEndTime = moment(endTime)
                    .hours(end.hours)
                    .minutes(end.minutes);
                  console.log(`new time range: ${newStartTime.format()} - ${newEndTime.format()}`);
                  onUpdateTimeRange({ startTime: newStartTime, endTime: newEndTime });
                }}
              />
            </div>

          </div>
          <div className="eventEditor-toolbar">
            <IconButton
              onClick={() => {
                setEditingNotes(!editingNotes);
              }}
            >
              <CreateIcon />
            </IconButton>
            <IconButton
              onClick={() => onDelete()}
            >
              <DeleteOutlineIcon />
            </IconButton>
            <IconButton
              onClick={() => onStopEditing()}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        {editingNotes && (
          <div className="eventEditor-notes">
            <Editor
              ref={editorRefCallback}
              editorState={notesEditorState}
              onChange={(state: EditorState) => {
                setNotesEditorState(state);
                updateNotes(state);
              }}
            />
          </div>
        )}
      </div>
    </Popper>
  );
};

export default EventEditor;
