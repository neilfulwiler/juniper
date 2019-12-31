import React, {
  useCallback, useEffect, useState,
  CSSProperties,
} from 'react';
import { useSelector } from 'react-redux';
import moment, { Moment } from 'moment';
import './styles.scss';
import {
  roundTo,
} from '../../utils';
import { State, Event as EventType, TimeRange } from '../../types';
import { TIME_SLOT_HEIGHT, useMouseSelection } from './utils';
import EventEditor from './EventEditor';

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
  const editingEvent = useSelector<State, string | undefined>((state) => state.events.ui.editingEvent);
  const [eventRef, setEventRef] = useState<HTMLDivElement | undefined>();
  const {
    id, title, startTime, endTime, notes,
  } = event;
  const [[stateStartTime, stateEndTime], setStateTimeRange] = useState([startTime, endTime]);

  useEffect(() => {
    setStateTimeRange([startTime, endTime]);
  }, [startTime, endTime]);

  const eventTop = stateStartTime.diff(timeSlots[0], 'hours', true) * TIME_SLOT_HEIGHT;
  const eventHeight = stateEndTime.diff(stateStartTime, 'hours', true) * TIME_SLOT_HEIGHT;
  const displayEventHeight = Math.max(eventHeight, 0.75 * TIME_SLOT_HEIGHT);

  const yToTime = useCallback((y) => {
    const actualY = y + (timeSlotsRef.parentElement as HTMLElement).scrollTop;
    return moment(timeSlots[0]).add(
      roundTo(actualY, TIME_SLOT_HEIGHT / 4) / TIME_SLOT_HEIGHT,
      'hours',
    );
  },
  [timeSlotsRef, timeSlots]);

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
  }, [yToTime, setStateTimeRange, endTime]);

  const onAdjustStartTimeComplete = useCallback(({ end }) => {
    const newStartTime = yToTime(end);
    if (newStartTime.diff(endTime) < 0) {
      onUpdateTimeRange({ startTime: newStartTime, endTime });
    } else {
      onUpdateTimeRange({ startTime: endTime, endTime: newStartTime });
    }
  }, [yToTime, endTime]);

  const onStartAdjustStartTime = useMouseSelection(onAdjustingStartTime, onAdjustStartTimeComplete);

  const eventRefCallback = useCallback((node) => {
    if (node && node !== eventRef) {
      setEventRef(node);
    }
  }, [eventRef]);

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
          onUpdateTimeRange={onUpdateTimeRange}
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
