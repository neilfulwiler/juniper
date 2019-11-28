import { useState, useCallback } from 'react';
import {
  useEventListener,
} from '../../utils';

type Handler = (args: {start: number, end: number}) => void;

// height from css = 48px
export const TIME_SLOT_HEIGHT = 48;

// time slot height is 1hr
export const timeSlotDuration = 1; // hours

export const SIDEBAR_WIDTH = 105;

export const FONT_SIZE = 12;

export function useMouseSelection(onSelecting: Handler, onSelection: Handler) {
  const [selectionStart, setSelectionStart] = useState<number | undefined>(undefined);

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
