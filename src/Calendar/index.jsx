import React, { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import './styles.scss';
import { useEventListener } from '../utils';
import { addEvent } from '../redux/actions';


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


export default function Calendar() {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  const user = useSelector((state) => state.user);
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

  return (
    <div className="timeSlots" ref={timeSlotsRef} onMouseDown={onMouseDown}>
      {timeSlots.map((timeSlot) => (
        <div className="timeSlot" key={timeSlot}>
          {timeSlot.format('HH')}
        </div>
      ))}
      {events.map((event) => {
        const eventStartTime = event.startTime;
        const eventEndTime = event.endTime;
        const eventTop = timeSlots.findIndex((timeSlot) => timeSlot.diff(eventStartTime) === 0) * TIME_SLOT_HEIGHT;
        const eventHeight = eventEndTime.diff(eventStartTime, 'hours') * TIME_SLOT_HEIGHT;
        return (
          <div
            className="event"
            key={event}
            style={{
              position: 'absolute',
              marginLeft: '12px',
              top: `${eventTop}px`,
              height: `${eventHeight}px`,
              width: `${SIDEBAR_WIDTH - FONT_SIZE}px`,
            }}
          />
        );
      })}
      {selection !== undefined && ((s) => {
        const eventStartTime = s.startTime;
        const eventEndTime = s.endTime;
        const eventTop = timeSlots.findIndex((timeSlot) => timeSlot.diff(eventStartTime) === 0) * TIME_SLOT_HEIGHT;
        const eventHeight = eventEndTime.diff(eventStartTime, 'hours') * TIME_SLOT_HEIGHT;
        return (
          <div
            className="selection"
            style={{
              position: 'absolute',
              marginLeft: '12px',
              top: `${eventTop}px`,
              height: `${eventHeight}px`,
              width: `${SIDEBAR_WIDTH - FONT_SIZE}px`,
            }}
          />
        );
      })(selection)}
    </div>
  );
}
