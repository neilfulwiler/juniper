import React, {
  useCallback, useState, useRef,
  useEffect,
  CSSProperties,
} from 'react';
import Popper from '@material-ui/core/Popper';
import moment, { Moment } from 'moment';
import './styles.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import {
  roundTo,
} from '../utils';
import { Event as EventType, TimeRange } from '../types';
import { TIME_SLOT_HEIGHT } from './constants';
import { useMouseSelection } from './utils';


interface Props {
  timeSlotsRef: HTMLDivElement,
  timeSlots: Moment[],
  event: EventType,
  onClick: () => void,
  onDelete: () => void,
  onUpdateTitle: (args: {title: string}) => void,
  onUpdateTimeRange: (args: TimeRange) => void,
  editing: boolean,
  style: CSSProperties,
}

const Event: React.FC<Props> = ({
  timeSlotsRef,
  timeSlots,
  event,
  editing,
  onDelete,
  onUpdateTitle,
  onUpdateTimeRange,
  style,
  ...rest
}: Props) => {
  const [eventRef, setEventRef] = useState<HTMLDivElement | undefined>();
  const {
    id, title, startTime, endTime,
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
    if (node) {
      setEventRef(node);
    }
  }, []);


  const [inputRef, setInputRef] = useState<HTMLInputElement | undefined>();
  const inputRefCallback = useCallback((node) => {
    if (node) {
      setInputRef(node);
    }
  }, []);

  useEffect(() => {
    editing && inputRef && inputRef.focus();
  }, [editing, inputRef]);

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
            top: `${eventTop + displayEventHeight}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartAdjustEndtime(e);
          }}
        />
      </div>
      {eventRef
        && (
        <Popper
          className="eventEditor-popper"
          open={editing}
          anchorEl={eventRef}
          placement="right"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="arrow-left" />
          <div
            className="eventEditor-container"
          >
            <div className="eventEditor-content">
              <input
                ref={inputRefCallback}
                placeholder="add event name"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateTitle({ title: value });
                  }
                }}
              />
              <div className="eventEditor-timerange">
                {stateStartTime.format('LT')}
                {' '}
  -
                {stateEndTime.format('LT')}
              </div>
            </div>
            <div className="toolbar">
              <IconButton
                onClick={onDelete}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </div>
        </Popper>
        )}
    </>
  );
};

export default Event;
