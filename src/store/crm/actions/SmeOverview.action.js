import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';
import { SET_CUSTOMER, CLEAR_CUSTOMER, SET_SELECTED_CUSTOMER_ID } from 'store/crm/constants/Customer';
import { UPDATE_ADDRESS, SET_ADDRESS, CLEAR_ADDRESS, CLEAR_PERSON_ADDRESS } from 'store/crm/constants/Address';
import { UPDATE_CONTACT, SET_CONTACT, CLEAR_CONTACT, CLEAR_PERSON_CONTACT } from 'store/crm/constants/Contact';
import { SET_CDD_INFO, CLEAR_CDD_INFO, CLEAR_PERSON_CDD_INFO } from 'store/crm/constants/CddInfo';
import { SET_HIGH_RISK_REGISTER, CLEAR_HIGH_RISK_REGISTER, CLEAR_PERSON_HRR } from 'store/crm/constants/HighRiskRegister';
import { SET_PERSON, CLEAR_PERSON } from 'store/crm/constants/Person';
import { SET_IDENTITY, CLEAR_IDENTITY } from '../constants/PersonIdentity';

import { displayNotification } from './Notifier';
import { SET_PERSON_STAKEHOLDER, CLEAR_STAKEHOLDER, CLEAR_PERSON_STAKEHOLDER, ADD_OR_UPDATE_STAKEHOLDER_LIST } from 'store/crm/constants/Stakeholder';
import { CLEAR_COMPANY_STRUCTURE } from 'store/crm/constants/CompanyStructure';
import { SET_IMPORTED_LOAN_REQUST_CONTRACT_ID } from 'store/loanmanagement/constants/LMGlobal';

/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const CUDCustomer = (requestBody) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/cud-customer'),
    body: requestBody
  };

  try {

    const response = await httpService.post(request, dispatch);

    updateSmeOverviewStates(requestBody, response, dispatch);

    if (!showErrorMessage(response.errors, dispatch)) dispatch(displayNotification('Successfully updated the customer', 'success'));

    return response;
  } catch (error) {
    console.error('CUDCustomer err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const CUDPerson = (requestBody) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/cud-person'),
    body: requestBody
  };

  try {

    const response = await httpService.post(request, dispatch);

    updateSmeOverviewStates(requestBody, response, dispatch);

    if (!showErrorMessage(response.errors, dispatch)) dispatch(displayNotification('Successfully updated the person', 'success'));

    return response;
  } catch (error) {
    console.error('CUDPerson err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getCustomerAddressContact = (customerId, legalName, activeIndicator = 'yes', isNotSelected = false) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/get-customer-address-contact?') + encodeQueryData({ customerId, legalName, activeIndicator })
  };

  try {

    const response = await httpService.get(request, dispatch);
    if (isNotSelected) return response;

    setSmeOverviewStates(response, dispatch, 'customerDetails');
    dispatch(setSelectedCustomerId(customerId));
    return response;

  } catch (error) {

    console.error('getCustomerAddressContact err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const getPersonAddressContact = (mongoId, customerId, personId, personInitials, namePrefix, surname, activeIndicator) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/get-person-address-contact?') + encodeQueryData({ mongoId, customerId, personId, personInitials, namePrefix, surname, activeIndicator })
  };

  try {

    const response = await httpService.get(request, dispatch);
    setSmeOverviewStates(response, dispatch, 'personDetails');

    return response;

  } catch (error) {

    console.error('getCustomerAddressContact err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

/******************************************
 *             Redux Calls                *
 *****************************************/


export const resetState = () => dispatch => {
  dispatch({ type: CLEAR_CUSTOMER });
  dispatch({ type: CLEAR_ADDRESS });
  dispatch({ type: CLEAR_CDD_INFO });
  dispatch({ type: CLEAR_CONTACT });
  dispatch({ type: CLEAR_HIGH_RISK_REGISTER });
  dispatch({ type: CLEAR_IDENTITY });
  dispatch({ type: CLEAR_PERSON });
  dispatch({ type: CLEAR_STAKEHOLDER });
  dispatch({ type: CLEAR_COMPANY_STRUCTURE });
};

export const clearPersonOverview = () => dispatch => {
  dispatch({ type: CLEAR_PERSON });
  dispatch({ type: CLEAR_PERSON_STAKEHOLDER });
  dispatch({ type: CLEAR_PERSON_HRR });
  dispatch({ type: CLEAR_PERSON_ADDRESS });
  dispatch({ type: CLEAR_PERSON_CONTACT });
  dispatch({ type: CLEAR_PERSON_CDD_INFO });
  dispatch({ type: CLEAR_IDENTITY });
};

/**************************
 *    Private Functions   *
 *************************/

const updateSmeOverviewStates = (sentData, receivedData, dispatch) => {

  const { customer, address, contact, cddInfo, highRiskRegister, person, personIdentity, stakeholder } = sentData;

  if (receivedData.customer?._id && customer && customer.action !== 'none') dispatch({ type: SET_CUSTOMER, payload: receivedData.customer });
  if (receivedData.address?.length > 0 && address && address.data.length !== 0) dispatch({ type: UPDATE_ADDRESS, payload: receivedData.address });
  if (receivedData.contact?.length > 0 && contact && contact.data.length !== 0) dispatch({ type: UPDATE_CONTACT, payload: receivedData.contact });
  if (receivedData.cddInfo?._id && cddInfo && cddInfo.action !== 'none') dispatch({ type: SET_CDD_INFO, payload: receivedData.cddInfo });
  if (receivedData.highRiskRegister?._id && highRiskRegister && highRiskRegister.action !== 'none') dispatch({ type: SET_HIGH_RISK_REGISTER, payload: receivedData.highRiskRegister });
  if (receivedData.person?._id && person && person.action !== 'none') dispatch({ type: SET_PERSON, payload: receivedData.person });
  if (receivedData.personIdentity?._id && personIdentity && personIdentity.action !== 'none') dispatch({ type: SET_IDENTITY, payload: receivedData.personIdentity });
  if (receivedData.stakeholder?._id && stakeholder && stakeholder.action !== 'none') {
    dispatch({ type: SET_PERSON_STAKEHOLDER, payload: receivedData.stakeholder });
    dispatch({ type: ADD_OR_UPDATE_STAKEHOLDER_LIST, payload: receivedData.stakeholder });
  }
};

const setSmeOverviewStates = (response, dispatch, origin = null) => {
  const {
    customer, address, contact, cddInfo, highRiskRegister,
    person, personIdentity
  } = response;

  if (customer) {
    dispatch({ type: SET_CUSTOMER, payload: customer });
    dispatch({ type: CLEAR_PERSON_STAKEHOLDER });
    dispatch({ type: CLEAR_STAKEHOLDER });
    dispatch({ type: CLEAR_COMPANY_STRUCTURE });
  }
  if (person) dispatch({ type: SET_PERSON, payload: response.person });
  if (address) dispatch({ type: SET_ADDRESS, payload: address, origin });
  if (contact) dispatch({ type: SET_CONTACT, payload: contact, origin });
  if (cddInfo) dispatch({ type: SET_CDD_INFO, payload: cddInfo });
  if (personIdentity) dispatch({ type: SET_IDENTITY, payload: response.personIdentity });
  if (highRiskRegister) dispatch({ type: SET_HIGH_RISK_REGISTER, payload: highRiskRegister });
};

const showErrorMessage = (errors, dispatch) => {

  let isError = false;
  if (errors) {
    for (const key of Object.keys(errors)) {
      if (!errors[key] || errors[key].length <= 0) continue;
      let errorMessage = 'Something went wrong while updating ' + key + '. Please try again!';
      try {
        JSON.parse(errors[key][0]);
      } catch {
        errorMessage = errors[key][0];
      }
      isError = true;
      dispatch(displayNotification(key + ' error! ' + errorMessage, 'error'));
    }
  }
  return isError;
};

export const setSelectedCustomerId = (id) => ({ type: SET_SELECTED_CUSTOMER_ID, payload: id });

export const setImportedLoanRequestContractId = (id) => ({ type: SET_IMPORTED_LOAN_REQUST_CONTRACT_ID, payload: id });