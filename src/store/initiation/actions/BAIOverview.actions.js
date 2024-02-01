import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { GET_REQUEST_BLOCK_LIST , CLEAR_REQUEST_BLOCK_LIST} from 'store/initiation/constants/BAIOverview';
/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const importBlockRequest = (smeLoanRequestId) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-sme-loan-request-with-bank-account-details?') + encodeQueryData({ smeLoanRequestId })
  };

  try {
    dispatch({ type: CLEAR_REQUEST_BLOCK_LIST });
    return httpService.get(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_REQUEST_BLOCK_LIST, payload: response });
       
        return response;
      })
      .catch((error) => error);


  } catch (error) {

    console.error('importBlockRequest err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};
