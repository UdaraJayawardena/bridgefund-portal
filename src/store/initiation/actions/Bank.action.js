import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
// import { GET_CONTRACT_LIST } from 'store/initiation/constants/Contracts';
import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getBanks = (searchOptions) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/get-banks${searchOptions ? '?' : ''}`) + encodeQueryData(searchOptions) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Banks', error);
    throw Error('Search Error Occurred!');
  }
};

/**
 * Search for contracts
 * @param {object} searchOptions - {key, value, options, contractId, criteria}
 * @returns {object} - { _id, id, contractId }
 */
export const searchBaiBank = (searchOptions) => async dispatch => {

  try {

    const request = {
      url: INITIATION_GATEWAY_URL('/get-bai-banks?') + encodeQueryData(searchOptions)
    };

    const response = await httpService.get(request, dispatch);

    return response;

  } catch (error) {
    console.error('search bank', error);
    throw Error('Search Error Occured!');
  }
};

export const addOrUpdateBank = (params) => async dispatch => {

  try {

    if( !params || !params.bankData ) throw Error('Mandatory data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/update-bank'),
      body: {
        bank: params.bankData
      }
    };

    return httpService.post(request, dispatch)
      .then((response) => {

        const action = params.bankData.action === 'create' ? 'created' : 'updated';
        dispatch(displayNotification(`Bank details ${action} successfully`, 'success'));

        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Add or Update Bank', error);
    throw Error('Add or Update Error Occurred!');
  }
};