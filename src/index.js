import React from 'react';
// import qs from "querystring";
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
/* Store */
import initializeStore from './store';
/* Core Components */
import Admin from 'layouts/Admin.jsx';
import User from 'layouts/User.jsx';
import Login from 'layouts/login.jsx';
import AuthGuard from './Auth/AuthGuard';
import 'assets/css/material-dashboard-react.css?v=1.6.0';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import ErrorBoundary from 'components/common/ErrorBoundary/ErrorBoundary';

/*Utilities*/
import { getEnv } from "lib/initiation/utility";
const ENV = getEnv();

const store = initializeStore();

if (ENV === 'development') {
  document.getElementsByTagName('body')[0].setAttribute('data-theme', 'dark');
}

const hist = createBrowserHistory();

ReactDOM.render(
  <ErrorBoundary>
  <Provider store={store}>
    <SnackbarProvider
      maxSnack={4}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      hideIconVariant={false}
      dense={false}
      preventDuplicate
    >
      <Router history={hist}>
        <AuthGuard>
          <Switch>
            <Route component={Login} path="/login" />
            <Route component={Admin} path='/admin' />
            <Route component={User} path='/user' />
            <Redirect from="/" to="/user" />
          </Switch>
        </AuthGuard>
      </Router>
    </SnackbarProvider>
  </Provider>
  </ErrorBoundary>,
  document.getElementById('root')
);
