import httpService from '../service/httpService';

import ENV from '../../../config/env';

import { encodeQueryData } from 'lib/loanmanagement/utility';



const BASE_URL = ENV.FIRST_ANALYSIS_URL;



export const getFirstAnalysisIndicators = (requestBody) => async dispatch => {

  const request = {
    url: `${BASE_URL}/first-analysis-indicators?${encodeQueryData(requestBody)}`,
    body: requestBody
  };
  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);
  } catch (error) {
    console.error('getFirstAnalysisIndicators err', error);
    throw Error('Unexpected error occurred! Please try again.');
  }

};

