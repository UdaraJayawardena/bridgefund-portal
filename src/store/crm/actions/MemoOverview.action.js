import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';
import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

 export const getMemos = (customerId, personId, contractId) => async dispatch => {

    try {

      let personQuery = ``;

      let contractQuery = ``;
  
      if(!customerId) throw Error('Customer id is missing');

      if(personId) personQuery = `&personId=${personId}`;

      if(contractId) contractQuery = `&contractId=${contractId}`;
  
      const request = {
        url: CRM_GATEWAY_URL(`/get-memos?customerId=${customerId}${personQuery}${contractQuery}`)
      };
  
      return httpService.get(request, dispatch)
        .then((response) => {
    
          return response;
        })
        .catch((error) => {throw error;});
  
    } catch (error) {
      console.error('Get Memo', error);
      throw Error('Get Memo Error Occurred!');
    }
};

export const CUDMemo = (requestBody) => async dispatch => {

  const action = requestBody.memo.action;

  const request = {
    url: CRM_GATEWAY_URL('/update-memo'),
    body: requestBody
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch(displayNotification(`Successfully ${action}d the Memo`, 'success'));
    
    return response;
  }
  catch (error) {
    console.error('CUDMemo err', error);
    throw Error('CUD Memo Error Occurred!');
  }
};

export const getSmeLoanRequestDetails = (customerId) => async dispatch => {


  const searchOptions = { 'customerId': customerId };

  const request = {
    url: INITIATION_GATEWAY_URL('/get-sme-loan-request-details?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('getSmeLoanRequestDetails err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getProcessDefinitions = () => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-process-definitions?manualOnly=true&latestVersion=true')
  };

  try {

    const response = await httpService.get(request, dispatch);
  
    return response;

  } catch (error) {

    console.error('getProcessDefinitions err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};