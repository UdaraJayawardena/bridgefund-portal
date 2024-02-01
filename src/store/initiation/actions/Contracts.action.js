import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { GET_CONTRACT_LIST } from 'store/initiation/constants/Contracts';
import { displayNotification } from './Notifier';
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/
/**
 * Search for contracts
 * @param {object} searchOptions - {key, value, options, contractId, criteria}
 * @returns {object} - { _id, id, contractId }
 */
export const searchContract = (searchOptions) => async dispatch => {

  try {

    const request = {
      url: INITIATION_GATEWAY_URL('/search-contracts?') + encodeQueryData(searchOptions)
    };

    const response = await httpService.get(request, dispatch);

    return response;

  } catch (error) {
    console.error('searchCotntract', error);
    throw Error('Search Error Occured!');
  }
};

export const importContracts = () => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-contracts?') + encodeQueryData({ fields: JSON.stringify({ "contractId": 1, "html": 1 }) })
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_CONTRACT_LIST, payload: response });

        return response;
      })
      .catch((error) => error);


  } catch (error) {

    console.error('importContracts err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getContract = (params) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-contracts?') + encodeQueryData(params)
  };

  try {
    const contracts = await httpService.get(request, dispatch);

    if (!contracts || (Array.isArray(contracts) && contracts.length === 0)) throw ('No Contracts Found!');

    return contracts[0];

  } catch (error) {

    console.error('getContract err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const downloadUnsignedContract = (contractId) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/download-contract?') + encodeQueryData({ contractId })
  };

  try {
    const pdfBuffer = await httpService.get(request, dispatch);

    return pdfBuffer;

  } catch (error) {

    console.error('downloadUnsignedContract err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const regenerateContract = (smeLoanRequestProposalId) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/regenerate-contract?') + encodeQueryData({ smeLoanRequestProposalId })
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch(displayNotification('Successfully regenerated the contract', 'success'));

    return response;

  } catch (error) {

    console.error('regenerateContract err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};
