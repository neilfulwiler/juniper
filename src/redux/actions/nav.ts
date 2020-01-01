import { ThunkAction as BaseThunkAction } from 'redux-thunk';

export const CHANGE_APP = 'CHANGE_APP';

export type App = 'Todos' | 'Notes';

type ChangeApp = {
  type: typeof CHANGE_APP,
  app: App,
}

export type Action = ChangeApp;

type ThunkAction = BaseThunkAction<void, {}, {}, Action>;

export function changeApp(app: App): ThunkAction {
  return (dispatch) => {
    dispatch({ type: CHANGE_APP, app });
  };
}
