import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
// import { GET_CONTRACT_LIST } from 'store/initiation/constants/Contracts';
import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);
const FIRST_ANALYSIS_URL = createUrl(ENV.FIRST_ANALYSIS_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getPlatformParameters = (searchOptions) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/get-platform-parameters${searchOptions ? '?' : ''}`) + encodeQueryData(searchOptions) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Platform Parameters', error);
    throw Error('Search Error Occurred!');
  }
};

export const getAFAParameters = (params) => async dispatch => {

  try {

    const request = {
      url: FIRST_ANALYSIS_URL('/first-analysis-parameters/latest?') + encodeQueryData(params),
    };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get AFA Platform Parameters', error);
    throw Error('Search Error Occurred!');
  }
};

export const addOrUpdatePlatformParameters = (params) => async dispatch => {

  try {

    if( !params || !params.platformParameter ) throw Error('Mandatory data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/update-platform-parameter'),
      body: {
        platformParameter: params.platformParameter
      }
    };

    return httpService.post(request, dispatch)
      .then((response) => {

        const action = params.platformParameter.action === 'create' ? 'created' : 'updated';
        dispatch(displayNotification(`Platform parameter details ${action} successfully`, 'success'));

        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Add or Update Platform parameter', error);
    throw Error('Add or Update Error Occurred!');
  }
};

export const addAFAPlatformParameters = (params) => async dispatch => {

  try {

    if (!params) throw Error('Mandatory data are missing');
    const request = {
      url: FIRST_ANALYSIS_URL('/first-analysis-parameters'),
      body: params

    };

    return httpService.post(request, dispatch)
      .then((response) => {

        const action = params.action === 'create' ? 'created' : 'updated';
        dispatch(displayNotification(`AFA platform parameter details ${action} successfully`, 'success'));

        return response;
      })
      .catch((error) => { throw error; });

  } catch (error) {
    console.error('Add AFA parameter', error);
    throw Error('Add or Update Error Occurred!');
  }
};