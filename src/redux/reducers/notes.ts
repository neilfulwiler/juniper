import _ from 'lodash';
import { Date, Note } from '../../types';
import { ADD_NOTES, UPDATE_NOTES, Action } from '../actions/notes';

export interface State {
  entities: {
    byId: {[id: string]: Note},
    allIds: string[],
  }
}

const initialState: State = {
  entities: {
    byId: {},
    allIds: [],
  },
};

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case UPDATE_NOTES:
      return {
        ...state,
        entities: {
          ...state.entities,
          byId: {
            ...state.entities.byId,
            [action.id]: {
              id: action.id,
              date: state.entities.byId[action.id].date,
              notes: action.notes,
            },
          },
        },
      };

    case ADD_NOTES:
      return {
        ...state,
        entities: {
          ...state.entities,
          byId: {
            ...state.entities.byId,
            ...action.notes.reduce((acc, note) => ({ ...acc, [note.id]: note }), {}),
          },
          allIds: _.uniq([...state.entities.allIds, ...action.notes.map(({ id }) => id)]),
        },
      };

    default:
      return state;
  }
}
