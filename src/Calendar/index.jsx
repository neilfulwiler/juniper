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
  roundTo, timeRangesOverlap, useColors, useEventListener,
} from '../utils';
import {
  addEvent, deleteEvent, updateTimeRange, updateTitle,
} from '../redux/actions';


// height from css = 48px
const TIME_SLOT_HEIGHT = 48;

// time slot height is 1hr
const timeSlotDuration = 1; // hours

const SIDEBAR_WIDTH = 105;

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
  const eventHeight = Math.max(stateEndTime.diff(stateStartTime, 'hours', true), 0.5) * TIME_SLOT_HEIGHT;
  const [value, setValue] = useState(title || '');

  const yToTime = useCallback((y) => moment(startTime).add(
    roundTo(y, TIME_SLOT_HEIGHT / 4)
    / TIME_SLOT_HEIGHT, 'hours',
  ),
  [startTime]);

  const getTimeRangeFromShift = useCallback(({ start, end }) => {
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
  }, [getTimeRangeFromShift]);

  const onStartDrag = useMouseSelection(onDragging, onDragComplete);

  const onAdjusting = useCallback(({ end }) => {
    const newEndTime = yToTime(end);
    if (newEndTime.diff(startTime) > 0) {
      setStateTimeRange([startTime, newEndTime]);
    } else {
      setStateTimeRange([newEndTime, startTime]);
    }
  }, [startTime, yToTime, setStateTimeRange]);

  const onAdjustComplete = useCallback(({ end }) => {
    const newEndTime = yToTime(end);
    if (newEndTime.diff(startTime)) {
      onUpdateTimeRange({ startTime, endTime: newEndTime });
    } else {
      onUpdateTimeRange({ startTime: newEndTime, endTime: startTime });
    }
  }, [yToTime]);

  const onStartAdjust = useMouseSelection(onAdjusting, onAdjustComplete);

  return (
    <>
      <div className="event-container">
        <div
          ref={eventRef}
          key={id}
          style={{
            ...{
              top: `${eventTop}px`,
              height: `${eventHeight}px`,
              width: `${SIDEBAR_WIDTH - FONT_SIZE}px`,
            },
            ...style,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartDrag(e);
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
        <div
          className="event-end-adjuster"
          style={{
            top: `${eventTop + eventHeight}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartAdjust(e);
          }}
        />
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
