import ENV from '../../../config/env';
import { httpService } from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  PROCESS_SMELOANHISTORY,
  CLEAR_SMELOANHISTORY,
  PROCESS_SME_LOAN_HISTORIES,
  CLEAR_SME_LOAN_HISTORIES,
} from '../constants/SmeLoanHistory';

const api = ENV.LOAN_MANAGEMENT_URL;

/******************************************
 *               API CALLS                *
 *****************************************/

export const getSmeLoanHistoryByContractId = (contractId) => {

  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { url : api + '/sme-loan-histories/latest/contract-id/' + contractId };
      
      return httpService.get(requestData, dispatch)
        .then(response => {
          dispatch(processSmeLoanHistory(response.data));
          resolve(response);
        })
        .catch(err => {
          dispatch(displayNotification('Get Loan History Details - Unexpected error occured.', 'error'))
          reject(err);
        });
    });
  };
};

export const getSmeLoanHistoriesByContractId = (contractId) => {
  // return dispatch => {

  //   return new Promise((resolve, reject) => {

  //     const requestData = {
  //       url: api + '/sme-loan-histories/contract-id/' + contractId,
  //     };

  //     return httpService.get(requestData, dispatch)
  //       .then((response) => {
  //        // if (!response.success) throw response;
  //                dispatch(processSmeLoanHistories(response.data));
  //       })
  //       .catch((error) => {
  //         dispatch(displayNotification('Get Loan History Details - Unexpected error occured.', 'error'));
  //         reject(error);
  //       });

  //   });

  // };

  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { url : api + '/sme-loan-histories/contract-id/' + contractId };
      
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          dispatch(processSmeLoanHistories(result.data));
        })
        .catch(err => {
          dispatch(displayNotification('Get Loan History Details - Unexpected error occured.', 'error'));
        });
    });
  };
};

/******************************************
 *             Redux Calls                *
 *****************************************/

export const clearSmeLoanHistory = () => ({ type: CLEAR_SMELOANHISTORY });

export const clearSmeLoanHistories = () => ({ type: CLEAR_SME_LOAN_HISTORIES });

/**************************
 *    Private Functions   *
 *************************/

const processSmeLoanHistory = smeloanhistory => ({ type: PROCESS_SMELOANHISTORY, smeloanhistory });

const processSmeLoanHistories = smeLoanHistories => ({ type: PROCESS_SME_LOAN_HISTORIES, smeLoanHistories });