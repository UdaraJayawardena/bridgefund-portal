import ENV from '../../../config/env';
import { createUrl } from 'lib/initiation/utility';
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

export const getCreditRiskParameterTypetList = () => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-credit-risk-pt-list')
  };

  try {
    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {
    console.error('getCreditRiskParameterTypetList err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const updateCreditRiskParameterType = (params) => async dispatch => {

  try {

    const request = {
      url: INITIATION_GATEWAY_URL('/update-credit-risk-parameter-types'),
      body: {
        creditRiskParameterTypesObj: params.creditRiskParameterTypesObj
      }
    };

    return httpService.post(request, dispatch)
      .then((response) => {
        // const action = params.creditRiskParameterTypesObj.action;
        // dispatch(displayNotification(`Credit Risk Parameter Type ${action}d successfully`, 'success'));
        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Update Credit Risk Parameter Type', error);
    dispatch(displayNotification(`Update Error Occurred!`, 'error'));
  }
};