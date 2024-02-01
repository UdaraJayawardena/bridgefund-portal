import httpService from '../service/httpService';

import ENV from '../../../config/env';

import { displayNotification } from './Notifier';

import { SET_SIMULATION_DATE, CLEAR_SIMULATION_DATE, SIMULATION_DATE_REQUEST } from "../constants/Configurations";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const BASE_URL = ENV.API_GATEWAY_URL;

export const getSimulationDate = () => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = { url: `${BASE_URL}/get-simulation-date` };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.data && Object.keys(response.data).length > 0) {

            sessionStorage.setItem('simulation', JSON.stringify({ 'isWorkingDate': response.data.isWorkingDate, 'systemDate': response.data.systemDate }));

            dispatch({
              type: SET_SIMULATION_DATE,
              payload: response.data
            });

            dispatch({
              type: SIMULATION_DATE_REQUEST,
              payload: { status: 'success' }
            });

            resolve(response.data);

          } else {
            dispatch(displayNotification('Please set simulation date in "Simulation Portal".', 'info'));

            dispatch({
              type: CLEAR_SIMULATION_DATE,
              payload: response.data
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

export const getLastHistoryRunDate = () => {

  const requestData = { url: `${BASE_URL}/last-history-run-date` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.error('getLastHistoryRunDate', error);
          reject(error);
        });
    });
  };
};