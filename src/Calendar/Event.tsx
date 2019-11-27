import React, {
  useCallback, useState,
  useEffect,
  CSSProperties,
} from 'react';
import throttle from 'lodash.throttle';
import {
  convertFromRaw, convertToRaw, Editor, EditorState,
} from 'draft-js';
import { useSelector } from 'react-redux';
import Popper from '@material-ui/core/Popper';
import moment, { Moment } from 'moment';
import './styles.scss';
import IconButton from '@material-ui/core/IconButton';
import CreateIcon from '@material-ui/icons/Create';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import {
  roundTo,
  useEventListener,
} from '../utils';
import { State, Event as EventType, TimeRange } from '../types';
import { TIME_SLOT_HEIGHT } from './constants';
import { useMouseSelection } from './utils';


interface EventEditorProps {
  title: string,
  startTime: Moment,
  endTime: Moment,
  onUpdateTitle: (args: {title: string}) => void,
  onUpdateNotes: (args: {notes: string}) => void,
  onBlur: () => void,
  onDelete: () => void,
  eventRef: HTMLDivElement,
  notes?: string,
}

const EventEditor: React.FC<EventEditorProps> = ({
  title, startTime, endTime, onUpdateTitle, onBlur, onUpdateNotes, onDelete, eventRef, notes,
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
              {startTime.format('LT')}
              {' '}
    -
              {endTime.format('LT')}
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

interface Props {
  timeSlotsRef: HTMLDivElement,
  timeSlots: Moment[],
  event: EventType,
  onDelete: () => void,
  onUpdateTitle: (args: {title: string}) => void,
  onUpdateNotes: (args: {notes: string}) => void,
  onUpdateTimeRange: (args: TimeRange) => void,
  style: CSSProperties,
  onBlur: () => void,
  onClick: () => void,
}

const Event: React.FC<Props> = ({
  timeSlotsRef,
  timeSlots,
  event,
  onDelete,
  onUpdateTitle,
  onUpdateNotes,
  onUpdateTimeRange,
  style,
  onBlur,
  onClick,
}: Props) => {
  const editingEvent = useSelector<State, string | undefined>((state) => state.editingEvent);
  const [eventRef, setEventRef] = useState<HTMLDivElement | undefined>();
  const {
    id, title, startTime, endTime, notes,
  } = event;
  const [[stateStartTime, stateEndTime], setStateTimeRange] = useState([startTime, endTime]);
  const eventTop = stateStartTime.diff(timeSlots[0], 'hours', true) * TIME_SLOT_HEIGHT;
  const eventHeight = stateEndTime.diff(stateStartTime, 'hours', true) * TIME_SLOT_HEIGHT;
  const displayEventHeight = Math.max(eventHeight, 0.75 * TIME_SLOT_HEIGHT);
  const [value, setValue] = useState(title || '');

  const yToTime = useCallback((y) => {
    const actualY = y + (timeSlotsRef.parentElement as HTMLElement).scrollTop;
    return moment(timeSlots[0]).add(
      roundTo(actualY, TIME_SLOT_HEIGHT / 4) / TIME_SLOT_HEIGHT,
      'hours',
    );
  },
  [startTime, timeSlotsRef]);

  const getTimeRangeFromShift = useCallback(({ start, end }): [Moment, Moment] => {
    const startTimeY = yToTime(start);
    const endTimeY = yToTime(end);
    const timeShift = endTimeY.diff(startTimeY, 'hours', true);
    const newStartTime = moment(startTime).add(timeShift, 'hours');
    const newEndTime = moment(endTime).add(timeShift, 'hours');
    return [newStartTime, newEndTime];
  }, [yToTime, startTime, endTime]);

  const onDragging = useCallback(({ start, end }) => {
    setStateTimeRange(getTimeRangeFromShift({ start, end }));
  }, [getTimeRangeFromShift, setStateTimeRange]);

  const onDragComplete = useCallback(({ start, end }) => {
    const [newStart, newEnd] = getTimeRangeFromShift({ start, end });
    onUpdateTimeRange({ startTime: newStart, endTime: newEnd });
  }, [getTimeRangeFromShift, onUpdateTimeRange]);

  const onStartDrag = useMouseSelection(onDragging, onDragComplete);

  const onAdjustingEndtime = useCallback(({ end }) => {
    const newEndTime = yToTime(end);
    if (newEndTime.diff(startTime) > 0) {
      setStateTimeRange([startTime, newEndTime]);
    } else {
      setStateTimeRange([newEndTime, startTime]);
    }
  }, [startTime, yToTime, setStateTimeRange]);

  const onAdjustEndtimeComplete = useCallback(({ end }) => {
    const newEndTime = yToTime(end);
    if (newEndTime.diff(startTime)) {
      onUpdateTimeRange({ startTime, endTime: newEndTime });
    } else {
      onUpdateTimeRange({ startTime: newEndTime, endTime: startTime });
    }
  }, [onUpdateTimeRange, startTime, yToTime]);

  const onStartAdjustEndtime = useMouseSelection(onAdjustingEndtime, onAdjustEndtimeComplete);

  const onAdjustingStartTime = useCallback(({ end }) => {
    const newStartTime = yToTime(end);
    if (newStartTime.diff(endTime) < 0) {
      setStateTimeRange([newStartTime, endTime]);
    } else {
      setStateTimeRange([endTime, newStartTime]);
    }
  }, [startTime, yToTime, setStateTimeRange]);

  const onAdjustStartTimeComplete = useCallback(({ end }) => {
    const newStartTime = yToTime(end);
    if (newStartTime.diff(endTime) < 0) {
      setStateTimeRange([newStartTime, endTime]);
    } else {
      setStateTimeRange([endTime, newStartTime]);
    }
  }, [onUpdateTimeRange, startTime, yToTime]);

  const onStartAdjustStartTime = useMouseSelection(onAdjustingStartTime, onAdjustStartTimeComplete);

  const eventRefCallback = useCallback((node) => {
    if (node && node !== eventRef) {
      setEventRef(node);
    }
  }, []);

  return (
    <>
      <div className="event-container">
        <div
          className="event-start-adjuster"
          style={{
            top: `${eventTop}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartAdjustStartTime(e);
          }}
        />
        <div
          ref={eventRefCallback}
          key={id}
          className="event"
          style={{
            ...{
              top: `${eventTop}px`,
              height: `${displayEventHeight}px`,
              width: '94px',
            },
            ...(
              eventHeight < displayEventHeight ? { borderRadius: '0px 0px 6px 6px' } : {}
            ),
            ...style,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartDrag(e);
          }}
          onClick={() => onClick()}
        >
          {title}
          <div className="event-hours">
            {stateStartTime.format('LT')}
            {' '}
  -
            {stateEndTime.format('LT')}
          </div>
        </div>
        <div
          className="event-end-adjuster"
          style={{
            top: `${eventTop + displayEventHeight}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartAdjustEndtime(e);
          }}
        />
      </div>
      {id === editingEvent && eventRef && (
        <EventEditor
          title={title}
          startTime={stateStartTime}
          endTime={stateEndTime}
          onBlur={onBlur}
          onUpdateTitle={onUpdateTitle}
          onUpdateNotes={onUpdateNotes}
          onDelete={onDelete}
          eventRef={eventRef}
          notes={notes}
        />
      )}
    </>
  );
};

export default Event;
