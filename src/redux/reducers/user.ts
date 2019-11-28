import { User } from '../../types';
import { Action, LOGGED_IN, LOGGED_OUT } from '../actions/user';

export interface State {
  entity: User | undefined,
}

export default function reducer(state: State = { entity: undefined }, action: Action): State {
  switch (action.type) {
    case LOGGED_IN:
      return { entity: action.user };

    case LOGGED_OUT:
      return { entity: undefined };

    default:
      return state;
  }
}
