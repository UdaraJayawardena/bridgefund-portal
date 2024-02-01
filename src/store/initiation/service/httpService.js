import { displayNotification } from "../actions/Notifier";

import ErrorMapper from "./error-mapper";

import initializeStore from '../index';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const configurations = initializeStore().getState().config;

// const COMMON_HEADERS = {

// };

const handleErrors = (response) => {

  if (response.success) {
    return response;
  }

  if (response.message === 'SESSION_EXPIRED') {

    cookies.remove('session-token', { path: '/' });
    sessionStorage.clear();

    response.error.code = 4012;
    response.error.errmsg = ErrorMapper.getError(response.error);

    // window.history.back(); /* this or put a href to redirect to login */
  }

  throw response;
};


const getSimulationSystemDateFromState = () => {
  try {
    return initializeStore().getState().configurations;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const httpService = {

  /*
  * inputs : {
  *     url : 'string',
  *     headers : 'object'
  * }
  * */
  get: (params, dispatch, checkSimulationDate = false) => {

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

    if (process.env.NODE_ENV !== 'production') {
      const configurations = getSimulationSystemDateFromState();

      if (checkSimulationDate) {

        if (!configurations || !configurations.simulations.systemDate) {
          dispatch(displayNotification('Can\'t find simulation date!', 'warning'));
          // throw ({'error': 'Can\'t find simulation date!'});
          throw Object.assign(new Error('Can\'t find simulation date!'), { code: 404 });
        }

      }

    }

    return fetch(params.url, settings)
      .then(response => response.json())
      .then(handleErrors)
      .then((response) => (response.data))
      .catch(err => {
        const { error } = err;

        if (dispatch) dispatch(displayNotification(ErrorMapper.getError(error), 'error'));

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
  post: (params, dispatch, checkSimulationDate = false) => {

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

      if (process.env.NODE_ENV !== 'production') {
        const configurations = getSimulationSystemDateFromState();

        if (checkSimulationDate) {

          if (!configurations || !configurations.simulations.systemDate) {
            dispatch(displayNotification('Can\'t find simulation date!', 'warning'));
            reject({ 'error': 'Can\'t find simulation date!' });
          }

        }

      }

      return fetch(params.url, settings)
        .then(response => response.json())
        .then(handleErrors)
        .then((response) => { resolve(response.data); })
        .catch(err => {

          if (err.message === 'Failed to fetch') {
            err = { code: 5001, errmsg: 'Cannot connect to the server! Service Unavailable' };
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
  
}


export default httpService;