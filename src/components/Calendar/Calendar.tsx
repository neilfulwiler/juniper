import React, {
  useCallback, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment, { Moment } from 'moment';
import './styles.scss';
import {
  timeRangesOverlap, useColors, roundTo,
} from '../../utils';
import {
  createEvent, deleteEvent, updateTimeRange, updateNotes, updateTitle, SET_EDITING_EVENT,
} from '../../redux/actions/events';
import Event from './Event';
import {
  Event as EventType, State, TimeRange, User,
} from '../../types';
import {
  timeSlotDuration, TIME_SLOT_HEIGHT, SIDEBAR_WIDTH, FONT_SIZE,
  useMouseSelection,
} from './utils';

const SelectingEvent: React.FC<{timeSlots: Moment[], timeRange: TimeRange}> = ({
  timeSlots,
  timeRange,
}: {timeSlots: Moment[], timeRange: TimeRange}) => {
  const { startTime, endTime } = timeRange;
  const eventTop = startTime.diff(timeSlots[0], 'hours', true) * TIME_SLOT_HEIGHT;
  const eventHeight = Math.max(endTime.diff(startTime, 'hours', true), 0.5) * TIME_SLOT_HEIGHT;
  return (
    <div className="event-container">
      <div
        className="selection"
        style={{
          top: `${eventTop}px`,
          height: `${eventHeight}px`,
          width: `${SIDEBAR_WIDTH - FONT_SIZE}px`,
        }}
      >
        <div className="event-hours">
          {startTime.format('LT')}
          {' '}
  -
          {endTime.format('LT')}
        </div>
      </div>
    </div>
  );
};


const Calendar: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const events = useSelector<State, EventType[]>((state) => state.events.entities);

  const user = useSelector<State, User | undefined>((state) => state.user.entity);
  const [selection, setSelection] = useState<TimeRange | undefined>(undefined);

  const startTime = moment().startOf('day');
  const endTime = moment(startTime).add(1, 'day');
  const timeSlots = Array.from({ length: 24 }).map((_, idx) => moment(startTime).add(idx, 'hours'));

  const [timeSlotsRef, setTimeSlotsRef] = useState<HTMLDivElement | undefined>();
  const timeSlotsRefCallback = useCallback((node) => {
    if (node) {
      setTimeSlotsRef(node);
    }
  }, []);

  const yToTime = useCallback((y) => {
    if (!timeSlotsRef) {
      return moment();
    }

    const actualY = y + (timeSlotsRef.parentElement as HTMLElement).scrollTop;
    const numSlots = roundTo((actualY - timeSlotsRef.offsetTop), TIME_SLOT_HEIGHT / 4) / TIME_SLOT_HEIGHT;
    return moment(startTime).add(
      numSlots * timeSlotDuration,
      'hours',
    );
  }, [timeSlotsRef, startTime]);

  const onSelecting = useCallback(({ start, end }: {start: number, end: number}) => {
    const [realStart, realEnd] = end > start ? [start, end] : [end, start];
    const startTimeSelection = yToTime(realStart);
    const endTimeSelection = yToTime(realEnd);
    setSelection({ startTime: startTimeSelection, endTime: endTimeSelection });
  }, [yToTime, setSelection]);

  const onSelection = useCallback(({ start, end }: {start: number, end: number}) => {
    const [realStart, realEnd] = end > start ? [start, end] : [end, start];
    const startTimeEvent = yToTime(realStart);
    const endTimeEvent = yToTime(realEnd);
    dispatch(createEvent(user as User, { startTime: startTimeEvent, endTime: endTimeEvent }));
    setSelection(undefined);
  },
  [user, yToTime, dispatch]);

  const onMouseDown = useMouseSelection(onSelecting, onSelection);


  const getColor = useColors();
  return (
    <div className="timeSlots" ref={timeSlotsRefCallback} onMouseDown={onMouseDown}>
      {timeSlots.map((timeSlot) => (
        <div className="timeSlot" key={timeSlot.format()}>
          {timeSlot.format('HH')}
        </div>
      ))}
      {events.filter((e) => timeRangesOverlap([e.startTime, e.endTime], [startTime, endTime])).map((event, idx) => (timeSlotsRef
        && (
        <Event
          timeSlotsRef={timeSlotsRef}
          key={event.id}
          timeSlots={timeSlots}
          event={event}
          onClick={() => dispatch({
            type: SET_EDITING_EVENT,
            id: event.id,
          })}
          onBlur={() => dispatch({
            type: SET_EDITING_EVENT,
            id: undefined,
          })}
          onDelete={() => {
            dispatch(deleteEvent(event.id));
          }}
          onUpdateTitle={({ title }: {title: string}) => {
            dispatch(updateTitle(event, { title }));
          }}
          onUpdateNotes={(args) => {
            dispatch(updateNotes(event, args));
          }}
          onUpdateTimeRange={(timeRange: TimeRange) => {
            if (event.startTime.diff(timeRange.startTime) !== 0 || event.endTime.diff(timeRange.endTime) !== 0) {
              dispatch(updateTimeRange(event, timeRange));
            }
          }}
          style={{ backgroundColor: getColor(event.title) }}
        />
        )
      ))}
      {selection !== undefined && ((s) => (
        <SelectingEvent
          timeSlots={timeSlots}
          timeRange={s}
        />
      ))(selection)}
    </div>
  );
};

export default Calendar;
