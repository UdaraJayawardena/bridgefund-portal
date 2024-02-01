import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
// import { GET_CONTRACT_LIST } from 'store/initiation/constants/Contracts';
import { displayNotification } from './Notifier';
import { GET_BANK_ACCOUNTS, CLEAR_BANK_ACCOUNTS_LIST } from 'store/initiation/constants/BankAccount';
import { CLEAR_CUSTOMER, CLEAR_SME_LOAN_REQUESTS, GET_CUSTOMER, GET_SME_LOAN_REQUESTS } from 'store/initiation/constants/CreditRiskOverview';
import { SET_CUSTOMER } from 'store/crm/constants/Customer';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);
const CRM_GATEWAT_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getBankAccounts = (data) => async dispatch => {

  try {
    dispatch({ type: CLEAR_BANK_ACCOUNTS_LIST });
    if (!data) throw Error('Bank Transacitons request data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/get-bank-account'),
      body: data
    };

    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch({ type: GET_BANK_ACCOUNTS, payload: response });
        return response;
      })
      .catch((error) => {
        throw error;
      });

  } catch (error) {
    throw Error('Get bank Accounts error occurred!');
  }
};

/**
 * Search for contracts
//  * @param {object} searchOptions - {key, value, options, contractId, criteria}
 * @returns {object} - { _id, id, contractId }
 */

export const searchCustomer = (key, value, criteria, customerId, options = 'i') => async dispatch => {


  const searchOptions = { key, value, options };

  if (criteria) searchOptions.criteria = criteria;
  if (customerId) searchOptions.customerId = customerId;

  const request = {
    url: CRM_GATEWAT_URL('/search-customers?') + encodeQueryData(searchOptions),
  };

  try {
    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('searchCustomer err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const addOrUpdateBankAccounts = (params) => async dispatch => {

  try {

    if (!params) throw Error('Mandatory data are missing');

    const request = {
      url: INITIATION_GATEWAY_URL('/update-bank-account'),
      body: params

    };

    return httpService.post(request, dispatch)
      .then((response) => {

        const action = params.action === 'create' ? 'created' : 'updated';
        dispatch(displayNotification(`Bank account details ${action} successfully`, 'success'));

        return response;
      })
      .catch((error) => { throw error; });

  } catch (error) {
    console.error('Add or Update Bank Account', error);
    throw Error('Add or Update Error Occurred!');
  }
};

export const getCustomerDetails = (queryObj) => async dispatch => {

  const request = {
    url: CRM_GATEWAT_URL('/get-customer-details?') + encodeQueryData(queryObj),
  };

  try {
    const response = await httpService.get(request, dispatch);
    dispatch({ type: GET_CUSTOMER, payload: response });
    return response;

  } catch (error) {

    console.error('getCustomerDetails err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getSmeLoanRequests = (queryObj) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/get-sme-loan-requests?') + encodeQueryData(queryObj),
  };

  try {
    const response = await httpService.get(request, dispatch);
    dispatch({ type: GET_SME_LOAN_REQUESTS, payload: response });
    return response;

  } catch (error) {

    console.error('getSmeLoanRequests err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const clearBankAccounts = () => {
  return {
    type: CLEAR_BANK_ACCOUNTS_LIST
  };
};

export const setCustomerDetails = (data) => {
  return { type: SET_CUSTOMER, payload: data }; // to set global store
};

export const clearCustomerDetails = () => {
  return {
    type: CLEAR_CUSTOMER
  };
};

export const clearSmeLoanRequests = () => {
  return {
    type: CLEAR_SME_LOAN_REQUESTS
  };
};

