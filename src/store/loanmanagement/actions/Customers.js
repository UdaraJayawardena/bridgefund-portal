import ENV from '../../../config/env';
import { displayNotification } from "./Notifier";
import { changeCustomerDetails } from './HeaderNavigation';
import util from 'lib/loanmanagement/utility';
import { httpService } from '../service/httpService';

const api = ENV.CRM_GATEWAY_URL;

export const requestCustomerByVTigerIdPromise = vTigerAccountNumber => {

 return async dispatch => {
  try {
    const requestData = {
      url: api + `/crm-management/customers/?vTigerAccountNumber=${vTigerAccountNumber}`
    };
    const response = await httpService.get(requestData, dispatch);

    if(!response.data.records || response.data.records.length === 0){
     throw Error('Customer not foud.');
    }
    const customerDetails = response.data.records? util.createCustomerObject(response.data.records[0]) : [];
    dispatch(changeCustomerDetails(customerDetails));
    return customerDetails;

  } catch (error) {
    dispatch(displayNotification('Request SME by Id - Unexpected error occurred.', 'error'));
    throw(error);
  }
 };
};

export const updateContact = (customer, contact, message) => {
 
 return dispatch => {
  
  return new Promise((resolve, reject) => {
   
   const requestData = {
    url: `${api}/crm-management/contacts/actions`,
    body: {  
     customerId: customer._id,
     contacts: [ {...contact, action: "update"} ],
    }
   };
   return httpService.post(requestData, dispatch)
   .then((response) => {
    
    if (response && response.httpCode === 200) {
     const updatedContact = response.data.returnCode[0].data.value;

     const updatedCustomer = {
      ...customer,
      email: updatedContact
     };
     dispatch(changeCustomerDetails(updatedCustomer));
     dispatch(displayNotification(message, 'success'));
           
      resolve(response);
     }
      reject(response);
    })
    .catch((error) => {
      dispatch(displayNotification(`${message} - unexpected error ocurred`, 'error'));
      reject(error);
    });
   });
 };
};


export const updateCustomer = (customer, customerToUpdate, message) => {
 
 return dispatch => {
  
  return new Promise((resolve, reject) => {
   
   const requestData = {
    url: `${api}/crm-management/customers/actions`,
    body: customerToUpdate
   };
   return httpService.post(requestData, dispatch)
   .then((response) => {
    
    if (response && response.httpCode === 200) {

     const updatedCustomer = {
      ...customer,
      isNeedSyncToAWS: true
     };
     dispatch(changeCustomerDetails(updatedCustomer));
     dispatch(displayNotification(message, 'success'));
           
      resolve(response);
     }
      reject(response);
    })
    .catch((error) => {
      dispatch(displayNotification(`${message} - unexpected error ocurred`, 'error'));
      reject(error);
    });
   });
 };
};