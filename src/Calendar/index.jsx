import React, {
  Fragment, useCallback, useState, useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import './styles.scss';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { useColors, getEventsByName, useEventListener } from '../utils';
import { addEvent, deleteEvent, updateEvent } from '../redux/actions';


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
    onSelecting(clientY > selectionStart
      ? { start: selectionStart, end: clientY }
      : { start: clientY, end: selectionStart });
  }, [selectionStart, onSelecting]);

  const onMouseUp = useCallback((e) => {
    if (selectionStart === undefined) {
      return;
    }

    const { clientY } = e;
    onSelection(clientY > selectionStart
      ? { start: selectionStart, end: clientY }
      : { start: clientY, end: selectionStart });

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
  onUpdateEvent,
  style,
  ...rest
}) {
  const eventRef = useRef();
  const eventStartTime = event.startTime;
  const eventEndTime = event.endTime;
  const eventTop = timeSlots.findIndex((timeSlot) => timeSlot.diff(eventStartTime) === 0) * TIME_SLOT_HEIGHT;
  const eventHeight = Math.max(eventEndTime.diff(eventStartTime, 'hours'), 0.5) * TIME_SLOT_HEIGHT;
  const [value, setValue] = useState(event.title || '');
  return (
    <>
      <div
        ref={eventRef}
        key={event.id}
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
        {...rest}
      >
        {event.title}
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
                    onUpdateEvent({ title: value });
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
    const startTimeSelection = yToTime(start);
    const endTimeSelection = yToTime(end);
    setSelection({ startTime: startTimeSelection, endTime: endTimeSelection });
  }, [yToTime, setSelection]);

  const onSelection = useCallback(({ start, end }) => {
    const startTimeEvent = yToTime(start);
    const endTimeEvent = yToTime(end);
    dispatch(addEvent(user, { startTime: startTimeEvent, endTime: endTimeEvent }));
    setSelection(undefined);
  },
  [yToTime, dispatch]);

  const onMouseDown = useMouseSelection(onSelecting, onSelection);

  const getColor = useColors();

  return (
    <div className="timeSlots" ref={timeSlotsRef} onMouseDown={onMouseDown}>
      {timeSlots.map((timeSlot) => (
        <div className="timeSlot" key={timeSlot}>
          {timeSlot.format('HH')}
        </div>
      ))}
      {events.map((event) => (
        <Event
          key={event.id}
          timeSlots={timeSlots}
          event={event}
          onClick={() => setEditing(event.id)}
          onMouseDown={(e) => e.stopPropagation()}
          className="event"
          onDelete={() => {
            setEditing(undefined);
            dispatch(deleteEvent(event.id));
          }}
          onUpdateEvent={({ title }) => {
            setEditing(undefined);
            dispatch(updateEvent(event.id, { title }));
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
