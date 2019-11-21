import React, {
  Fragment, useCallback, useState, useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import './styles.scss';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import {
  timeRangesOverlap, useColors, getEventsByName, useEventListener,
} from '../utils';
import {
  addEvent, deleteEvent, updateTimeRange, updateTitle,
} from '../redux/actions';


// height from css = 48px
const TIME_SLOT_HEIGHT = 49;

// time slot height is 1hr
const timeSlotDuration = 1; // hours

const SIDEBAR_WIDTH = 120;

const FONT_SIZE = 12;


function useMouseSelection(onSelecting, onSelection) {
  const [selectionStart, setSelectionStart] = useState(undefined);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const { clientY } = e;
    setSelectionStart(clientY);
  }, [setSelectionStart]);

  const onMouseMove = useCallback((e) => {
    if (selectionStart === undefined) {
      return;
    }

    const { clientY } = e;
    onSelecting({ start: selectionStart, end: clientY });
  }, [selectionStart, onSelecting]);

  const onMouseUp = useCallback((e) => {
    if (selectionStart === undefined) {
      return;
    }

    const { clientY } = e;
    onSelection({ start: selectionStart, end: clientY });

    setSelectionStart(undefined);
  }, [selectionStart, onSelection]);

  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseup', onMouseUp);

  return onMouseDown;
}


function Event({
  timeSlots,
  event,
  editing,
  onDelete,
  onUpdateTitle,
  onUpdateTimeRange,
  style,
  ...rest
}) {
  const dispatch = useDispatch();
  const eventRef = useRef();
  const {
    id, title, startTime, endTime,
  } = event;
  const [[stateStartTime, stateEndTime], setStateTimeRange] = useState([startTime, endTime]);
  const eventTop = stateStartTime.diff(timeSlots[0], 'hours', true) * TIME_SLOT_HEIGHT;
  const eventHeight = Math.max(stateEndTime.diff(stateStartTime, 'hours'), 0.5) * TIME_SLOT_HEIGHT;
  const [value, setValue] = useState(title || '');

  const yToTime = useCallback(({ start, end }) => {
    const gotShift = Math.min(
      Math.max(-eventTop, end - start),
      24 * TIME_SLOT_HEIGHT - (eventTop + eventHeight),
    );
    const newStartTime = moment(startTime).add(gotShift / TIME_SLOT_HEIGHT, 'hours');
    const newEndTime = moment(endTime).add(gotShift / TIME_SLOT_HEIGHT, 'hours');
    return [newStartTime, newEndTime];
  }, [startTime, endTime]);

  const onSelecting = useCallback(({ start, end }) => {
    setStateTimeRange(yToTime({ start, end }));
  }, [yToTime, setStateTimeRange]);

  const onSelection = useCallback(({ start, end }) => {
    const [newStart, newEnd] = yToTime({ start, end });
    onUpdateTimeRange({ startTime: newStart, endTime: newEnd });
  }, [yToTime]);

  const onMouseDown = useMouseSelection(onSelecting, onSelection);

  return (
    <>
      <div
        ref={eventRef}
        key={id}
        style={{
          ...{
            position: 'absolute',
            marginLeft: '12px',
            top: `${eventTop}px`,
            height: `${eventHeight}px`,
            width: `${SIDEBAR_WIDTH - FONT_SIZE}px`,
          },
          ...style,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
        {...rest}
      >
        {title}
        <div className="event-hours">
          {stateStartTime.format('LT')}
          {' '}
-
          {stateEndTime.format('LT')}
        </div>
      </div>
      {eventRef.current !== null
        && (
        <Popper className="eventEditor-popper" open={editing} anchorEl={eventRef.current} placement="right">
          <div className="arrow-left" />
          <div
            className="eventEditor-content"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <IconButton
              onClick={onDelete}
            >
              <DeleteOutlineIcon />
            </IconButton>
            <div className="inputHolder">
              <input
                placeholder="add event name"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateTitle({ title: value });
                  }
                }}
              />
            </div>
          </div>
        </Popper>
        )}
    </>
  );
}


export default function Calendar() {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  const user = useSelector((state) => state.user);
  const [editing, setEditing] = useState(undefined);
  const [selection, setSelection] = useState(undefined);

  const timeSlotsRef = useRef();
  const startTime = moment().startOf('day');
  const endTime = moment(startTime).add(1, 'day');
  const timeSlots = Array.from({ length: 24 }).map((_, idx) => moment(startTime).add(idx, 'hours'));

  const yToTime = useCallback((y) => {
    const actualY = y + timeSlotsRef.current.parentElement.scrollTop;
    const numSlots = Math.floor((actualY - timeSlotsRef.current.offsetTop) / TIME_SLOT_HEIGHT);
    return moment(startTime).add(
      numSlots * timeSlotDuration,
      'hours',
    );
  }, [timeSlotsRef, startTime]);

  const onSelecting = useCallback(({ start, end }) => {
    const [realStart, realEnd] = end > start ? [start, end] : [end, start];
    const startTimeSelection = yToTime(realStart);
    const endTimeSelection = yToTime(realEnd);
    setSelection({ startTime: startTimeSelection, endTime: endTimeSelection });
  }, [yToTime, setSelection]);

  const onSelection = useCallback(({ start, end }) => {
    const [realStart, realEnd] = end > start ? [start, end] : [end, start];
    const startTimeEvent = yToTime(realStart);
    const endTimeEvent = yToTime(realEnd);
    dispatch(addEvent(user, { startTime: startTimeEvent, endTime: endTimeEvent }));
    setSelection(undefined);
  },
  [user, yToTime, dispatch]);

  const onMouseDown = useMouseSelection(onSelecting, onSelection);

  const getColor = useColors();

  return (
    <div className="timeSlots" ref={timeSlotsRef} onMouseDown={onMouseDown}>
      {timeSlots.map((timeSlot) => (
        <div className="timeSlot" key={timeSlot}>
          {timeSlot.format('HH')}
        </div>
      ))}
      {events.filter((e) => timeRangesOverlap([e.startTime, e.endTime], [startTime, endTime])).map((event) => (
        <Event
          key={event.id}
          timeSlots={timeSlots}
          event={event}
          onClick={() => setEditing(event.id)}
          className="event"
          onDelete={() => {
            setEditing(undefined);
            dispatch(deleteEvent(event.id));
          }}
          onUpdateTitle={({ title }) => {
            setEditing(undefined);
            dispatch(updateTitle(event, { title }));
          }}
          onUpdateTimeRange={(timeRange) => {
            setEditing(undefined);
            dispatch(updateTimeRange(event, timeRange));
          }}
          editing={editing === event.id}
          style={{ backgroundColor: getColor(event.title) }}
        />
      ))}
      {selection !== undefined && ((s) => (
        <Event
          timeSlots={timeSlots}
          event={s}
          editing={false}
          className="selection"
          style={{ backgroundColor: getColor(s.title) }}
        />
      ))(selection)}
    </div>
  );
}
