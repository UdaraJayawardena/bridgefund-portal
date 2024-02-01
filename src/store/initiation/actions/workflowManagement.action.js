import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { } from 'store/initiation/constants/LoanRequest';
import { GET_FILTER_LIST } from "../constants/workflowManagement";
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/


export const searchProcess = (params) => async dispatch => {
  const request = {
    url: INITIATION_GATEWAY_URL('/get-root-process-instance-history?') + encodeQueryData(params),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response.records;// need to change when pagination is required. now this is limited to 10 records

  } catch (error) {

    console.error('searchProcess err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const searchProcessLogs = (params) => async dispatch => {

  // eslint-disable-next-line no-unused-vars
  const { processIdentifiers, page, perPage, ...reqParams } = params;
  const requestBody = params.processIdentifiers;

  const request = {
    url: INITIATION_GATEWAY_URL('/get-root-process-instance-history?') + encodeQueryData({ ...reqParams, page, perPage, sortBy: 'startTime', sortOrder: 'desc' })
  };

  if (params.processIdentifiers && (Object.keys(params.processIdentifiers).length !== 0)) {

    for (const propName in params.processIdentifiers) {
      if (params.processIdentifiers[propName] === '' || params.processIdentifiers[propName] === null) {
        delete params.processIdentifiers[propName];
      }
    }

    if (Object.keys(requestBody).length !== 0) {
      Object.assign(request, { body: { processIdentifiers: requestBody, } });
    }

  }

  try {

    const response = await httpService.post(request, dispatch);
    return response;

  } catch (error) {

    console.error('searchProcessLogs err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const fiterProcess = () => async dispatch => {
  const request = {
    url: INITIATION_GATEWAY_URL('/get-process-filters')
  };

  try {

    const response = await httpService.get(request, dispatch);
    dispatch({ type: GET_FILTER_LIST, payload: response });
    return response;

  } catch (error) {

    console.error('fiterProcess err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

