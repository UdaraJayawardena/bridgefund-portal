import ENV from '../../../config/env';
import { displayNotification } from './Notifier';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';
import { SET_COMPANY_STRUCTURE, UPDATE_COMPANY_STRUCTURE } from 'store/crm/constants/CompanyStructure';


/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const CUDCompanyStructure = (requestBody) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/update-company-structure'),
    body: requestBody
  };

  try {

    const response = await httpService.post(request, dispatch);
    dispatch({ type: UPDATE_COMPANY_STRUCTURE, payload: response.companyStructures });

    dispatch(displayNotification('Company structure successfully created!', 'success'));

    return response;
  } catch (error) {
    console.error('CUDCompanyStructure', error);
    throw Error('Unexpected error occured! Please try again.');
    // return {};
  }
};

export const getCompanyStructure = (customerId) => async dispatch => {

  const request = { url: CRM_GATEWAY_URL('/get-company-structures?') + encodeQueryData({ customerId }) };

  try {
    const response = await httpService.get(request, dispatch);

    dispatch({ type: SET_COMPANY_STRUCTURE, payload: response });
    return response;

  } catch (error) {

    console.error('getCompanyStructure err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

/******************************************
 *             Redux Calls                *
 *****************************************/

/**************************
 *    Private Functions   *
 *************************/