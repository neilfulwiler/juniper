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
import { Action } from './redux/actions';
import { loadState, saveState } from './redux/storage';
import { State } from './types';

import App from './components/App/App';


const rootReducer = combineReducers({
  events,
  todos,
  user,
});

const persistedState = loadState();
const store = createStore<State, Action, unknown, unknown>(rootReducer, persistedState, applyMiddleware(thunk, logger));

console.log(store.getState());

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
