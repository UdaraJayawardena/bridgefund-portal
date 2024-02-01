import ENV from '../../../config/env';
import { createUrl } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getbankTransactionTypes = (bankId) => async dispatch => {

    try {
  
      if( !bankId ) throw Error('Bank id is missing');
  
      const request = {
        url: INITIATION_GATEWAY_URL('/get-bank-transactions-types-bybankid'),
        body: {
            action: 'get',
            bankId: bankId
        }
      };
  
      return httpService.post(request, dispatch)
        .then((response) => {
    
          return response;
        })
        .catch((error) => {throw error;});
  
    } catch (error) {
      console.error('Get Bank Transaction Types', error);
      throw Error('Get Bank Transaction Types Error Occurred!');
    }
};

export const addOrUpdateBankTransactionType = (params) => async dispatch => {

  try {

    if( !params || !params.bankTransactionType ) return dispatch(displayNotification(`Mandatory data are missing`, 'warning'));

    if(!params.bankTransactionType.bank_id) return dispatch(displayNotification(`Please select a bank`, 'warning'));

    if ( params.bankTransactionType.inserted_date ) delete params.bankTransactionType.inserted_date;

    if ( params.bankTransactionType.updated_date ) delete params.bankTransactionType.updated_date;

    const request = {
      url: INITIATION_GATEWAY_URL('/update-bank-transaction-type'),
      body: {
        bankTransactionTypes: params.bankTransactionType
      }
    };

    return httpService.post(request, dispatch)
      .then((response) => {

        const action = params.bankTransactionType.action;

        dispatch(displayNotification(`Bank Transaction Type ${action}d successfully`, 'success'));

        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Add or Update Bank Transaction Type', error);
    dispatch(displayNotification(`Add or Update Error Occurred!`, 'error'));
  }
};