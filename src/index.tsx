import React from 'react';
import throttle from 'lodash.throttle';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import 'typeface-roboto';

import './index.css';
import * as serviceWorker from './serviceWorker';
import './firebase/firebase';
import events from './redux/reducers/events';
import todos from './redux/reducers/todos';
import user from './redux/reducers/user';
import nav from './redux/reducers/nav';
import notes from './redux/reducers/notes';
import { Action } from './redux/actions';
import { loadState, saveState } from './redux/storage';
import { State } from './types';

import App from './components/App';


const rootReducer = combineReducers({
  events,
  todos,
  user,
  nav,
  notes,
});

const persistedState = undefined; // loadState();
const store = createStore<State, Action, unknown, unknown>(rootReducer, persistedState, applyMiddleware(thunk, logger));

store.subscribe(throttle(() => {
  // saveState(store.getState());
}, 1000));


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
