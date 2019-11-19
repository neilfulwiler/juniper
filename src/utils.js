import { useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

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

export function getEventsByName(events) {
  const byName = events.reduce((acc, event) => {
    const { title } = event;
    if (!acc.hasOwnProperty(title)) {
      acc[title] = [];
    }
    acc[title].push(event);
    return acc;
  }, {});

  Object.values(byName).forEach((list) => list.sort((a, b) => a.startTime.diff(b.startTime)));

  const eventsByName = Object.entries(byName);
  eventsByName.sort(([_titleA, a], [_titleB, b]) => a[0].startTime.diff(b[0].startTime));
  return eventsByName;
}

export function useColors() {
  const events = useSelector((state) => state.events);
  const eventsByName = getEventsByName(events).map(([title]) => title);
  return useCallback((title) => {
    if (title === undefined) {
      return '#BDBDBD';
    }
    const { color } = colors[eventsByName.indexOf(title)];
    return color;
  }, [events]);
}

export function useEventListener(eventName, handler, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();

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
      if (!isSupported) return () => {};

      // Create event listener that calls handler function stored in ref
      const eventListener = (event) => savedHandler.current(event);

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
