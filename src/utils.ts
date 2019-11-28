import { useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Moment } from 'moment';
import { Event, State } from './types';

export const colors = [
  {
    color: 'rgb(232, 193, 160)',
  },
  {
    color: 'rgb(244, 117, 96)',
  },
  {
    color: 'rgb(232, 168, 56)',
  },
  {
    color: 'rgb(224, 210, 85)',
  },
  {
    color: 'rgb(232, 168, 56)',
  },
];

export function getEventsByName(events: Event[]): [string, Event[]][] {
  const byName: {[key: string]: Event[]} = events.reduce((acc, event) => {
    const { title } = event;
    if (!acc.hasOwnProperty(title)) {
      acc[title] = [];
    }
    acc[title].push(event);
    return acc;
  }, {} as {[key: string]: Event[]});

  Object.values(byName).forEach((list) => list.sort((a, b) => a.startTime.diff(b.startTime)));

  const eventsByName = Object.entries(byName);
  eventsByName.sort(([_titleA, a], [_titleB, b]) => a[0].startTime.diff(b[0].startTime));
  return eventsByName;
}

export function useColors() {
  const events = useSelector<State, Event[]>((state) => state.events.entities);
  const eventsByName = getEventsByName(events).map(([title]) => title);
  return useCallback((title) => {
    if (title === undefined) {
      return '#BDBDBD';
    }
    const style = colors[eventsByName.indexOf(title)];
    if (!style) {
      return 'grey';
    }
    const { color } = style;
    return color;
  }, [eventsByName]);
}

export function timeRangesOverlap([a1, a2]: [Moment, Moment], [b1, b2]: [Moment, Moment]): boolean {
  return (a1 >= b1 && a1 <= b2) || (a2 >= b1 && a2 <= b2);
}


export function useEventListener(eventName: string, handler: (event: any) => void, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef<(event: any) => void>();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) {
        return () => {};
      }

      // Create event listener that calls handler function stored in ref
      const eventListener = (event: any) => savedHandler.current && savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element], // Re-run if eventName or element changes
  );
}

export function roundTo(x: number, mod: number): number {
  return x % mod < mod / 2 ? x - (x % mod) : x - (x % mod) + mod;
}
