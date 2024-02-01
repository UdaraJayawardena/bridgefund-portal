import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';
import { GET_CUSTOMER_LIST, SET_CUSTOMER_SUCCESS_MANAGERS } from 'store/crm/constants/Customer';
import util from 'lib/loanmanagement/utility';
import { changeCustomerDetails } from 'store/loanmanagement/actions/HeaderNavigation';

/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const searchCustomer = (key, value, criteria, customerId, options = 'i') => async dispatch => {

  const searchOptions = { key, value, options };

  if (criteria) searchOptions.criteria = criteria;
  if (customerId) searchOptions.customerId = customerId;

  const request = {
    url: CRM_GATEWAY_URL('/search-customers?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('searchCustomer err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getCustomerList = () => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/get-customers')
  };

  try {

    const response = await httpService.get(request, dispatch);
    dispatch({ type: GET_CUSTOMER_LIST, payload: response });

    return response;

  } catch (error) {

    console.error('getCustomerList err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getCustomerSuccessManagerList = () => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/get-users-based-on-role?role=CSM')
  };

  try {

    const response = await httpService.get(request, dispatch);
    dispatch({ type: SET_CUSTOMER_SUCCESS_MANAGERS, payload: response.users });

    return response;

  } catch (error) {

    console.error('getCustomerSuccessManagerList err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getCustomerDetails = (customerId) => async dispatch => {

  const searchOptions = { 'customerId': customerId };

  const request = {
    url: CRM_GATEWAY_URL('/get-customer-details?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('getCustomerDetails err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getCustomerDetailsByMongoId = (customerMongoId) => async dispatch => {

  const searchOptions = { 'mongoId': customerMongoId };
  console.log('response' , searchOptions);
  const request = {
    url: CRM_GATEWAY_URL('/get-customer-details?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    console.log('response' , response);
    return response;

  } catch (error) {

    console.error('getCustomerDetails err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getCustomerListPerPage = (perPage, pageNumber, key ) => async dispatch => {

 const queryParams = {
  includeAddresses: "id type streetName houseNumber postalCode cityName country",
	 includeContacts: "type subType value",
  includeStakeHolders: "id personId"
 };
 
 let request = {
  url: CRM_GATEWAY_URL(`/crm-management/customers?${encodeQueryData({...queryParams, perPage, page: pageNumber })}`)
 };

 if( key ) {
  request = {
   url: CRM_GATEWAY_URL(`/crm-management/customers?${encodeQueryData({...queryParams, legalName : key.legalName })}`)
  };
 }
 
 try {
  const response = await httpService.get(request, dispatch);
  const customersList = util.createCustomersObject(response.records);
  const metaData = response._metaData;

  return { customersList, metaData};

 } catch (error) {
   console.error('getCustomerListPerPage err', error);
   throw Error('Unexpected error occured! Please try again.');
 }
};


export const getCustomerByVTigerId = (vTigerAccountNumber) => async dispatch => {

  const queryParams = {
   vTigerAccountNumber,
   includeAddresses: "id type streetName houseNumber postalCode cityName country",
   includeContacts: "type subType value",
   includeStakeHolders: "id personId"
  };

  const request = {
    url: CRM_GATEWAY_URL(`/crm-management/customers?${encodeQueryData(queryParams)}`)
  };

  try {
    const response = await httpService.get(request, dispatch);
    const customer = util.createCustomerObject(response.records[0]);
    dispatch(changeCustomerDetails(customer));
    return customer;

  } catch (error) {
    console.error('getCustomerByVTigerId err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
}


export const getCustomerListByCommonSearch = (legalName) => async dispatch => {
  try {

    const requestBody = {
      "field": 'legalName',
      "serviceModule": "customer",
      "operator": "LIKE",
      "value": legalName,
      "neededFields": ["legalName", "vTigerAccountNumber",'id']
    };

    const request = {
      url: CRM_GATEWAY_URL('/crm-management/common-search'),
      body: requestBody
    };

    const response = await httpService.post(request, dispatch);
    return response;    

  } catch (error) {

    console.error('getCustomerListByCommonSearch err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const requestLendingOpportunity = (contractId) => async (dispatch) => {

  const searchOptions = { 'contractId': contractId };

  const request = {
    url: CRM_GATEWAY_URL('/get-leanding-opportunity?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('Error fetching data from Leanding Opportunity', error);
    throw Error('An error occurred while fetching data from Leanding Opportunity');
  }
};

export const generateOrganizationViewUrl = (organizationId) => async (
  dispatch
) => {

  const searchOptions = { 'organizationId': organizationId };

  const request = {
    url: CRM_GATEWAY_URL('/get-organization-url?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('Error fetching data from Organization Url', error);
    throw Error('An error occurred while fetching data from Organization Url.');
  }
};