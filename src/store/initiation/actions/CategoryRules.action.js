import ENV from '../../../config/env';

import { createUrl, encodeQueryData } from 'lib/initiation/utility';

import { httpService } from '../service/httpService';

import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getCategoryRules = (searchOptions) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/get-category-rules${searchOptions ? '?' : ''}`) + encodeQueryData(searchOptions) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Category Rules', error);
    throw Error('Search Error Occurred!');
  }
};

export const getCategoryRulesWithPagination = (searchParams) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/category-rules-pagination${searchParams ? '?' : ''}`) + encodeQueryData(searchParams) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Category Rules with Pagination', error);
    throw Error('Search Error Occurred!');
  }

};

export const getCategoryRulesEnums = (searchParams) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/get-category-rules-enums${searchParams ? '?' : ''}`) + encodeQueryData(searchParams) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Category Rules Enums', error);
    throw Error('Search Error Occurred!');
  }

};

export const processCategoryRules = (requestData) => async dispatch => {

  try {

    const request = { 
      url: INITIATION_GATEWAY_URL('/process-category-rules'),
      body: requestData,
     };

    return httpService.post(request, dispatch)
      .then((response) => {

        let action = requestData.action;

        if(action === 'create') action = 'created';
        if(action === 'update') action = 'updated';
        if(action === 'delete') action = 'deleted';

        dispatch(displayNotification(`Category rules ${action} successfully`, 'success'));

        return response;
      })
      .catch((error) => {throw error;});

  } catch (error) {
    console.error('Process Category Rules', error);
    throw Error('Search Error Occurred!');
  }

};

export const IbanSearchRequest = (searchParams) => async dispatch => {

  try {

    const request = { url: INITIATION_GATEWAY_URL(`/get-unique-ibans-according-to-counter-party-name?counterPartyName=${searchParams}`) };

    return httpService.get(request, dispatch)
      .then((response) => response)
      .catch((error) => error);

  } catch (error) {
    console.error('Get Iban search', error);
    throw Error('Search Error Occurred!');
  }

};