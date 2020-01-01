import { Action, App, CHANGE_APP } from '../actions/nav';

export interface State {
  app: App,
}

const initialState: State = {
  app: 'Todos',
};

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case CHANGE_APP:
      return {
        ...state,
        app: action.app,
      };
    default:
      return state;
  }
}
