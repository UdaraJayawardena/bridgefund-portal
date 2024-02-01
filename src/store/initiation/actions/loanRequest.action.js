import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { GET_CONTRACT_ID, GET_LOAN_REQUEST_LIST, PROCESS_LOAN_REQUEST, CLEAR_LOAN_REQUEST } from 'store/initiation/constants/LoanRequest';
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const startLoanInitiation = (requestBody) => dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/start-instance-by-key'),
    body: requestBody
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_CONTRACT_ID, payload: response });
        return response;
      })
      .catch((error) => error);

  } catch (error) {

    console.error('startLoanInitiation err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const importLoanRequest = (taskDefinitionKey, contractId) => async dispatch => {

  const query = {};

  if (taskDefinitionKey) query.taskDefinitionKeyLike = `%${taskDefinitionKey}%`;
  if (contractId) query.processInstanceBusinessKey = contractId;

  const request = {
    url: INITIATION_GATEWAY_URL('/get-user-tasks?') + encodeQueryData(query)
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        // if (!contractId) {
          dispatch({ type: CLEAR_LOAN_REQUEST });
          dispatch({ type: GET_LOAN_REQUEST_LIST, payload: response });
        // }

        return response;
      })
      .catch((error) => error);


  } catch (error) {

    console.error('importLoanRequest err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const processLoanRequest = (requestBody) => dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/complete-user-task'),
    body: requestBody
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: PROCESS_LOAN_REQUEST, payload: response });
        return response;
      })
      .catch((error) => error);

  } catch (error) {

    console.error('processLoanRequest err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const completeFirstAnalyses = (requestBody) => dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/complete-first-analyses'),
    body: requestBody
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);

  } catch (error) {

    console.error('updateSmeLoanRequest err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};