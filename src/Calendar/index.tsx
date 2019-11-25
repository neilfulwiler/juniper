import React, {
  useCallback, useState, useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment, { Moment } from 'moment';
import './styles.scss';
import {
  timeRangesOverlap, useColors, roundTo,
} from '../utils';
import {
  createEvent, deleteEvent, updateTimeRange, updateTitle, SET_EDITING_EVENT,
} from '../redux/actions';
import Event from './Event';
import {
  Event as EventType, State, TimeRange, User,
} from '../types';
import { useMouseSelection } from './utils';
import {
  timeSlotDuration, TIME_SLOT_HEIGHT, SIDEBAR_WIDTH, FONT_SIZE,
} from './constants';


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
  const events = useSelector<State, EventType[]>((state) => state.events);
  const editingEvent = useSelector<State, string | undefined>((state) => state.editingEvent);
  const user = useSelector<State, User | undefined>((state) => state.user);
  const [selection, setSelection] = useState<TimeRange | undefined>(undefined);

  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const startTime = moment().startOf('day');
  const endTime = moment(startTime).add(1, 'day');
  const timeSlots = Array.from({ length: 24 }).map((_, idx) => moment(startTime).add(idx, 'hours'));

  const yToTime = useCallback((y) => {
    if (!timeSlotsRef.current) {
      return moment();
    }

    const actualY = y + (timeSlotsRef.current.parentElement as HTMLElement).scrollTop;
    const numSlots = roundTo((actualY - timeSlotsRef.current.offsetTop), TIME_SLOT_HEIGHT / 4) / TIME_SLOT_HEIGHT;
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
    <div className="timeSlots" ref={timeSlotsRef} onMouseDown={onMouseDown}>
      {timeSlots.map((timeSlot) => (
        <div className="timeSlot" key={timeSlot.format()}>
          {timeSlot.format('HH')}
        </div>
      ))}
      {events.filter((e) => timeRangesOverlap([e.startTime, e.endTime], [startTime, endTime])).map((event, idx) => (timeSlotsRef.current
        && (
        <Event
          timeSlotsRef={timeSlotsRef.current}
          key={event.id}
          timeSlots={timeSlots}
          event={event}
          onClick={() => dispatch({
            type: SET_EDITING_EVENT,
            id: event.id,
          })}
          onDelete={() => {
            dispatch(deleteEvent(event.id));
          }}
          onUpdateTitle={({ title }: {title: string}) => {
            dispatch(updateTitle(event, { title }));
          }}
          onUpdateTimeRange={(timeRange: TimeRange) => {
            if (event.startTime.diff(timeRange.startTime) !== 0 || event.endTime.diff(timeRange.endTime) !== 0) {
              dispatch(updateTimeRange(event, timeRange));
            }
          }}
          editing={editingEvent === event.id}
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
