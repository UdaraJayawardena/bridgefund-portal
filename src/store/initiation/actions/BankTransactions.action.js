import ENV from '../../../config/env';
import { createUrl } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { GET_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW, CLEAR_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW , GET_SELECTED_BANK_TRANSACTION_FOR_MULTIPLE_IDS} from 'store/initiation/constants/BankTransactions';
import { displayNotification } from './Notifier';
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getBankTransactionsForGivenFilters = (data) => async dispatch => {

  try {

    if (!data) throw Error('Bank Transacitons request data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/get-bank-transactions'),
      body: data
    };

    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW, payload: response });
        return response;
      })
      .catch((error) => {
        throw error;
      });

  } catch (error) {
    throw Error('Get bank transactions error occurred!');
  }
};

export const updateBankTransactions = (params) => async dispatch => {

  try {

    if (!params) throw Error('Mandatory data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/update-bank-transaction'),
      body: params

    };

    return httpService.post(request, dispatch)
      .then((response) => {

        dispatch(displayNotification(`Bank transaction details updated successfully`, 'success'));

        return response;
      })
      .catch((error) => { throw error; });

  } catch (error) {
    console.error('updateBankTransactions', error);
    throw Error('updateBankTransactions!');
  }
};

export const clearBankTransactionsForGivenFilters = () => {
  return {
    type: CLEAR_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW
  };
};

export const getBankTransactionsforMultipleIds = (data) => async dispatch => {

  try {

    if (!data) throw Error('Bank Transacitons id data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/find-bank-transactions-with-multiple-bank-ids'),
      body: data
    };

    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_SELECTED_BANK_TRANSACTION_FOR_MULTIPLE_IDS, payload: response });
        return response;
      })
      .catch((error) => {
        throw error;
      });

  } catch (error) {
    throw Error('Get bank transactions for multiple Ids error occurred!');
  }
};

export const sendTransactionToMlModel = (params) => async dispatch => {

  try {

    if (!params) throw Error('Mandatory data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/send-transactions-to-ml-model'),
      body: params

    };

    return httpService.post(request, dispatch)
      .then((response) => {

        return response;
      })
      .catch((error) => { throw error; });

  } catch (error) {
    console.error('sendTransactionToMlModel', error);
    throw Error('sendTransactionToMlModel!');
  }
};

export const getMlPredictions = (requestData) => async dispatch => {

  try {

    const request = { 
      url: INITIATION_GATEWAY_URL('/get-ml-predictions'),
      body: requestData,
     };

    return httpService.post(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Check ML Predictions', error);
    throw Error('Check ML Predictions error Occurred!');
  }

};