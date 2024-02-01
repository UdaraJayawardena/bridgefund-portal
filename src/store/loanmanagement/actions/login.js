import { createEncryptor } from 'simple-encryptor';

import { displayNotification } from './Notifier';

import HTTP_SERVICE from '../service/httpService';

import ENV from '../../../config/env';

import { USER_PERMISSION } from 'store/loanmanagement/constants/user';

import { encodeQueryData } from 'lib/loanmanagement/utility';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const encryptor = createEncryptor(ENV.ENCRYPTION_KEY);
const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

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
        url: API_GATEWAY_URL + '/log-in',
        body: data,
        ignoreSession: true
      };
      const routesAndPermissionRequest = {
        url: API_GATEWAY_URL + '/get-permissions-and-routes-for-front-end?' + encodeQueryData({ cluster: 'BF_Loan_Management', isGetPermissions: true }),
        ignoreSession: false
      };
      const authorizationRequest = {
        url: API_GATEWAY_URL + '/is-authorized',
        ignoreSession: false
      };

      const getToken = token === '' ? HTTP_SERVICE.post(requestData) : Promise.resolve({ data: { token: token } });

      return getToken
        .then(result => {
          token = result.data.token;
          cookies.set('session-token', token, { path: '/', expires: new Date(Date.now() + (12*3600*1000)) });
          return HTTP_SERVICE.get(routesAndPermissionRequest);
        })
        .then(response => {
          dispatch({ type: USER_PERMISSION, payload: response.data.permissions });
          const encrypted = encryptor.encrypt(response.data.permissions);
          const encryptedRoutes = encryptor.encrypt(response.data.routes);

          sessionStorage.setItem('userPermissions', encrypted);
          sessionStorage.setItem('routes', encryptedRoutes);
          return HTTP_SERVICE.post(authorizationRequest);
        })
        .then(authorizationResponse => {

          sessionStorage.setItem('user', authorizationResponse.data.userDetails.userName);
          sessionStorage.setItem('userPreferredLanguage ', authorizationResponse.data.userDetails.preferredLanguage);
          sessionStorage.setItem('profileImage ', authorizationResponse.data.userDetails.profileImage);
          dispatch(displayNotification('Credintial approved.', 'success'));
          return resolve(token);
        })
        .catch(() => {
          cookies.remove('session-token', { path: '/' });
          sessionStorage.clear();
          dispatch(displayNotification('User not authorized.', 'error'));
          return reject();
        });
    });
  };
};

export const isUserAuthentcate = (authenticateType) => {

  const loggedInUser = cookies.get('session-token');
  const data = {
    type: authenticateType
  };

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY_URL + '/is-authenticate',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: loggedInUser
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

