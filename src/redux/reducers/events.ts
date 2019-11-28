import { Event } from '../../types';
import {
  Action, EVENT_CREATED, ADD_EVENTS, SET_EDITING_EVENT, UPDATE_EVENT, DELETE_EVENT,
} from '../actions/events';
import { replace } from './utils';


interface UIState {
  editingEvent: string | undefined,
}

export interface State {
  entities: Event[],
  ui: UIState,
}

const initialState = {
  entities: [],
  ui: {
    editingEvent: undefined,
  },
};

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case EVENT_CREATED:
      return {
        ...state,
        entities: state.entities.concat([action.event]),
        ui: { editingEvent: action.event.id },
      };
    case ADD_EVENTS:
      return {
        ...state,
        entities: state.entities
          .filter(({ id }: Event) => action.events.findIndex((e) => e.id === id) === -1)
          .concat(action.events),
      };
    case SET_EDITING_EVENT:
      return {
        ...state,
        ui: { editingEvent: action.id },
      };
    case UPDATE_EVENT:
      return {
        ...state,
        entities: replace(state.entities, (event) => event.id === action.id, action.event),
      };
    case DELETE_EVENT:
      return {
        ...state,
        entities: state.entities.filter((event) => event.id !== action.id),
        ui: { editingEvent: undefined },
      };

    default:
      return state;
  }
}
