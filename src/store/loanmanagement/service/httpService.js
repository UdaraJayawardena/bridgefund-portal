import { displayNotification } from "../actions/Notifier";

import ErrorMapper from "./error-mapper";

import initializeStore from "../..";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

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

  /*`
  * inputs : {
  *     url : 'string',
  *     headers : 'object'
  * }
  * */
  get: (params, dispatch, checkSimulationDate = false) => {

    try {

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

      if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
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
        .catch(err => {
          const { error } = err;

          if (dispatch) dispatch(displayNotification(ErrorMapper.getError(error || err), 'error'));

          throw (err);
        });

    } catch (error) {
      console.log(error);
      throw error;
    }

  },

  /*
  * inputs : {
  *   url : 'string',
  *   body : 'string/object/FormData',
  *   headers : 'object'
  * }
  * */
  post: (params, dispatch, langauge = 'nl', checkSimulationDate = false) => {

    return new Promise((resolve, reject) => {

      const body = (params.body && (typeof params.body !== 'string') && !(params.body instanceof FormData)) ? JSON.stringify(params.body) : params.body;

      const settings = {
        method: 'POST',
        headers: {},
        body
      };

      const _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': langauge
      };

      if (params.body && (typeof params.body !== 'string') && !(params.body instanceof FormData)) settings.headers = Object.assign(_headers, settings.headers);

      if (params && params.headers) {
        settings.headers = Object.assign(settings.headers, params.headers);
      }

      if (params && params.ignoreSession !== true) {
        settings.headers['Authorization'] = 'Bearer ' + cookies.get('session-token');
      }

      if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
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
        .then((response) => { resolve(response); })
        .catch(err => {
          const { error } = err;
          if (dispatch) dispatch(displayNotification(ErrorMapper.getError(error), 'error'));

          reject(err);
        });
    });
  },

  /**
   * HTTP PUT Requests
   * @param {Object} params - { url, body, headers }
   */
  put: (params, dispatch, checkSimulationDate = false) => {

    return new Promise((resolve, reject) => {

      const body = (params.body && (typeof params.body !== 'string') && !(params.body instanceof FormData)) ? JSON.stringify(params.body) : params.body;

      const headers = !(params.body instanceof FormData) ? { 'Accept': 'application/json', 'Content-Type': 'application/json' } : {};
      const settings = {
        method: 'PUT',
        headers: headers,
        body
      };

      if (params && params.headers) {
        settings.headers = Object.assign(settings.headers, params.headers);
      }

      if (params && params.ignoreSession !== true) {
        settings.headers['Authorization'] = 'Bearer ' + cookies.get('session-token');
      }
      
      if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
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
        .then((response) => resolve(response))
        .catch(err => {

          const { error } = err;

          if (dispatch) dispatch(displayNotification(ErrorMapper.getError(error || err), 'error'));

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