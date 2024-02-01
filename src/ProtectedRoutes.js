/* eslint-disable react/prop-types */
// @ts-nocheck
import React from "react";
import {
  Route,
  Redirect,
} from "react-router-dom";

const PrivateRoute = ({ children, ...rest }) => {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        // eslint-disable-next-line no-undef
        fakeAuth.isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;