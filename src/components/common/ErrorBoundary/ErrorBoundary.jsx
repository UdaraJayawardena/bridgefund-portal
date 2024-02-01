import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { getAccessToken } from '../../../services/auth-service';

import './ErrorBoundary.css';
import AppConfig from 'constants/AppConfig';

import LogoBridgeFund from 'assets/icons/logo-BF.svg';
import errorPageImage from 'assets/img/error-page.png';

class ErrorBoundary extends Component  {
    constructor(props) {
        super(props);
        
        this.state = { 
          hasError: false,
          errDetails: null,
          infoText: null
        };
      }

      static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        // return { hasError: true };
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        // Display fallback UI
        console.log({ error, errorInfo });
        this.setState({ 
          hasError: true,
          error: error,
          errorInfo: errorInfo
        });
        
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
      }

      render() {
        const { hasError, error, errorInfo } = this.state;

        if (hasError) {
          // You can render any custom fallback UI
          // return <h1>Something went wrong.</h1>;
          return (<div class="b-w h-v-h">
                      <header class="page-container page-container-responsive space-top-4">
                      {/* <img src={AppConfig.appLogo} alt="logo" width="40" height="40" /> */}
                      <img src={LogoBridgeFund} alt="logo" width="200" height="50" />                      
                          <span class="screen-reader-only icon icon-airbnb link-icon h2 f-w h-l-f-s">
                            Bridgefund
                          </span>
                      </header>
                    <div class="page-container page-container-responsive ">
                      <div class="row space-top-8 space-8 row-table m-l-90">
                          <div class="col-5 col-middle d-b f-c-g p-t-15">
                            <h1 class="text-jumbo text-ginormous">Oops!</h1>
                            <h2 class="h2-s">There seems to be a problem in the system!.</h2>
                            <h6 class="h6-s m-b-t">Error details</h6>
                            <div>
                              {error.message}
                            </div>
                            <div className="card-body">
                              <details className="error-details">
                                <summary>Click for more details</summary>
                                    {error.stack}
                              </details>
                            </div>
                            <ul class="list-unstyled">
                              <li class="h6-s">Here are some helpful links instead:</li>
                            </ul>
                          </div>
                          <div class="col-5 col-middle text-center d-b">
                            <img src={errorPageImage} alt="error-logo" />
                          </div>
                        </div>
                      </div>
                  </div>
                  );

        }
        
        return this.props.children;
      }
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]).isRequired,
};

export default ErrorBoundary;
