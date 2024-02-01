import { displayNotification } from "../actions/Notifier";

import ErrorMapper from "./error-mapper";

import initializeStore from '../../index';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const configurations = initializeStore().getState().config;

// const COMMON_HEADERS = {

// };

const handleErrors = (response) => {

  if (response.success) {
    return response;
  }

  throw response;
};

export const httpService = {

  /*
  * inputs : {
  *     url : 'string',
  *     headers : 'object'
  * }
  * */
  get: (params, dispatch) => {

    const settings = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };

    if (params && params.ignoreSession !== true) {
      settings.headers['Authorization'] = 'Bearer ' + cookies.get('session-token');
    }

    if (params && params.skipHeaders) delete settings.headers;

    return fetch(params.url, settings)
      .then(response => response.json())
      .then(handleErrors)
      .then((response) => (response.data))
      .catch(err => {

        if (dispatch) dispatch(displayNotification(ErrorMapper.getError(err), 'error'));

        throw (err);
      });

  },

  /*
  * inputs : {
  *   url : 'string',
  *   body : 'string/object/FormData',
  *   headers : 'object'
  * }
  * */
  post: (params, dispatch) => {

    return new Promise((resolve, reject) => {

      if (typeof params.body === 'object') params.body['systemDate'] = configurations.systemDate;

      const body = (params.body && (typeof params.body !== 'string') && !(params.body instanceof FormData)) ? JSON.stringify(params.body) : params.body;

      const settings = {
        method: 'POST',
        headers: { /* systemDate: configurations.systemDate */ },
        body
      };

      const _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (params.body && (typeof params.body !== 'string') && !(params.body instanceof FormData)) settings.headers = Object.assign(_headers, settings.headers);

      if (params && params.headers) {
        settings.headers = Object.assign(settings.headers, params.headers);
      }

      if (params && params.ignoreSession !== true) {
        settings.headers['Authorization'] = 'Bearer ' + (cookies.get('session-token'));
      }

      return fetch(params.url, settings)
        .then(response => response.json())
        .then(handleErrors)
        .then((response) => { resolve(response.data); })
        .catch(err => {

          if (err.message === 'Failed to fetch') {
            err = { httpCode: 400, message: 'Cannot connect to the server! Service Unavailable' };
          }
          if (dispatch) dispatch(displayNotification(ErrorMapper.getError(err), 'error'));

          reject(err);
        });
    });

  },

  download: (params, dispatch) => {
    const settings = {
      method: 'GET',
      headers: {
        "Content-Type": "application/zip",
        'Authorization' : 'Bearer ' + cookies.get('session-token')
      },
    };

    return fetch(params.url, settings)
    .then(response => response)
    .catch(err => {
      const { error } = err;

      if (dispatch) dispatch(displayNotification(ErrorMapper.getError(error), 'error'));

      throw (err);
    });
  }
};

export default httpService;