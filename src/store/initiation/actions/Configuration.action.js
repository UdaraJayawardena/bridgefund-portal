import httpService from '../service/httpService';

import ENV from '../../../config/env';

import { displayNotification } from './Notifier';

import { encodeQueryData } from 'lib/loanmanagement/utility';

import { SET_SIMULATION_DATE, CLEAR_SIMULATION_DATE, SIMULATION_DATE_REQUEST } from "../constants/Configurations";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const BASE_URL = ENV.FOUNDATION_GATEWAY;

export const getSimulationDate = () => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = { url: `${BASE_URL}/get-simulation-date` };

      return httpService.get(requestData, dispatch)
        .then((response) => {
          if (response && Object.keys(response).length > 0) {

            sessionStorage.setItem('simulation', JSON.stringify({ 'isWorkingDate': response.isWorkingDate, 'systemDate': response.systemDate }));

            dispatch({
              type: SET_SIMULATION_DATE,
              payload: response
            });

            dispatch({
              type: SIMULATION_DATE_REQUEST,
              payload: { status: 'success' }
            });

            resolve(response);

          } else {
            dispatch(displayNotification('Please set simulation date in "Simulation Portal".', 'info'));

            dispatch({
              type: CLEAR_SIMULATION_DATE,
              payload: response
            });

            reject({ 'error': 'simulation not set' });
          }

        })
        .catch((error) => {
          console.error('Error while getting simulation date : ', error);

          dispatch({
            type: SIMULATION_DATE_REQUEST,
            payload: { status: 'failed' }
          });

          reject("There are some error occurred.");
        });

    });

  };
};

export const getFieldNameValues = (requestBody) => async dispatch => {

  const request = {
    url: `${BASE_URL}/get-field-name-values`,
    body: requestBody
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    console.error('getFieldNameValues err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getLocales = (requestBody) => async dispatch => {

  const request = {
    url: `${BASE_URL}/get-locales?${encodeQueryData(requestBody)}`,
    body: requestBody
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);


  } catch (error) {
    console.error('getLocales err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};