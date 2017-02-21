// @flow
/* eslint-disable no-underscore-dangle */

import React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { LoginRequest, LoginResponse } from 'siteapi';

import App from 'components/App';
import Login from 'containers/Login';
import Player from 'containers/Player';

import reducers from 'reducers';
import * as siteapi from 'siteapi';

import s from 'styles/style.scss';

const store = createStore(
  combineReducers({
    routing: routerReducer,
    ...reducers,
  }),
  // Redux devtools are still enabled in production!
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

const history = syncHistoryWithStore(browserHistory, store);

console.log("playerx", Player);
render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App} className={s.app}>
        <Route path="/login" component={Login} />
      </Route>
      <Route path="/player" component={Player}>

      </Route>
    </Router>
  </Provider>,
  document.getElementById('root'),
);

        /*<Route path="/search" component={PlayerSearch}>
        </Route>*/