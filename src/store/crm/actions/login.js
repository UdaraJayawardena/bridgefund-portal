import { createEncryptor } from 'simple-encryptor';

import ENV from '../../../config/env';
import HTTP_SERVICE from '../service/httpService';

import { displayNotification } from './Notifier';
import { USER_PERMISSION } from 'store/crm/constants/user';

import { encodeQueryData } from 'lib/crm/utility';

import Cookies from 'universal-cookie';

const encryptor = createEncryptor(ENV.ENCRYPTION_KEY);

const API_GATEWAY = ENV.CRM_GATEWAY_URL;

const cookies = new Cookies();

/******************************************
 *               API CALLS                *
 *****************************************/

export const login = ({ userName, password, token = '' }) => {

  const data = {
    loginData: {
      userId: userName,
      password: password
    }
  };

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/log-in',
        body: data,
        ignoreSession: true
      };

      const routesAndPermissionRequest = {
        url: API_GATEWAY + '/get-permissions-and-routes-for-front-end?' + encodeQueryData({ cluster: 'BF_CRM', isGetPermissions: true }),
        ignoreSession: false
      };
      const authorizationRequest = {
        url: API_GATEWAY + '/is-authorized',
        ignoreSession: false
      };

      const getToken = token === '' ? HTTP_SERVICE.post(requestData) : Promise.resolve({ token: token });

      return getToken
        .then(result => {
          token = result.token;
          cookies.set('session-token', token, { path: '/', expires: new Date(Date.now() + (12*3600*1000)) });
          return HTTP_SERVICE.get(routesAndPermissionRequest);
        })
        .then(response => {
          dispatch({ type: USER_PERMISSION, payload: response.permissions });
          const encrypted = encryptor.encrypt(response.permissions);
          const encryptedRoutes = encryptor.encrypt(response.routes);

          sessionStorage.setItem('userPermissions', encrypted);
          sessionStorage.setItem('routes', encryptedRoutes);
          return HTTP_SERVICE.post(authorizationRequest);
        })
        .then(authorizationResponse => {
          sessionStorage.setItem('user', authorizationResponse.userDetails.userName);
          sessionStorage.setItem('userPreferredLanguage ', authorizationResponse.userDetails.preferredLanguage);
          dispatch(displayNotification('Credintial approved.', 'success'));
          return resolve(token);

        })
        .catch((error) => {
          cookies.remove('session-token', { path: '/' });
          sessionStorage.clear();
          dispatch(displayNotification('User not authorized.', 'error'));
          return reject(error);
        });
    });
  };
};

export const isUserAuthentcate = (authenicateType) => {
  const logedInUser = cookies.get('session-token');
  const data = {
    type: authenicateType
  };

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/is-authenticate',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: logedInUser
        },
        body: JSON.stringify(data),
        ignoreSession: true
      };

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          return resolve(result);
        })
        .catch(() => {
          return reject();
        });
    });
  };
};

export const isUserAuthorized = () => {
  const logedInUser = cookies.get('session-token');
  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/is-authorized',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: logedInUser
        },
        ignoreSession: true
      };

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          return resolve(result);
        })
        .catch(() => {
          return reject();
        });
    });
  };
};