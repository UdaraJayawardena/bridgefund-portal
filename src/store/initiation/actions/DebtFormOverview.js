import ENV from '../../../config/env';
import { createUrl,encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { GET_DEBT_FORM_DATA , CLEAR_DEBT_FORM_DATA, UPDATE_DEBT_AT_THIRD_PARTY, CLEAR_DEBT_AT_THIRD_PARTY, UPDATE_DEBITOR_CREDITOR, CLEAR_DEBITOR_CREDITOR, IMPORT_REQUEST_ID} from 'store/initiation/constants/DebtForm';
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);
/******************************************
 *               API CALLS                *
 *****************************************/

export const importDebtsAndDebitorsCreditors = (requestBody) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-debit-and-debetors-creditors'),
    body: requestBody
  };

  try {
    dispatch({ type: CLEAR_DEBT_FORM_DATA });
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_DEBT_FORM_DATA, payload: response });
       
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    console.error('importDebtsAndDebitorsCreditors err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const updateDebtAtThirdParty = (requestBody) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/update-debt-at-third-party'),
    body: requestBody
  };

  try {
    dispatch({ type: CLEAR_DEBT_AT_THIRD_PARTY });
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: UPDATE_DEBT_AT_THIRD_PARTY, payload: response });
        return response;
      })
      .catch((error) => {
        throw Error(`Unexpected error occured! Please try again. + ${error}`);
        });


  } catch (error) {
    console.error('updateDebtAtThirdParty err', error);
    throw Error(`Unexpected error occured! Please try again. + ${error}`);
  }

};

export const updateDebitorsCreditors = (requestBody) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/update-debtor-creditor'),
    body: requestBody
  };

  try {
    dispatch({ type: CLEAR_DEBITOR_CREDITOR });
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: UPDATE_DEBITOR_CREDITOR, payload: response });
       
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    console.error('updateDebitorsCreditors err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const imporRequestId = (requestBody) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-sme-loan-request?')+ encodeQueryData(requestBody),
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        dispatch({ type: IMPORT_REQUEST_ID, payload: response });
       
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    console.error('imporRequestId err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};