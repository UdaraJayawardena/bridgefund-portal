// @ts-nocheck
import ENV from '../../../config/env';
import { httpService } from "../service/httpService";
import { displayNotification } from "./Notifier";
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { GET_BANK_ACCOUNTS, CLEAR_BANK_ACCOUNTS_LIST } from 'store/initiation/constants/BankAccount';

const apiGatewayUrl = ENV.API_GATEWAY_URL;
const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);


/** get the mandate list by given criteria  */
const getMandateList = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { 
        url: `${apiGatewayUrl}/get-mandate-for-approval-oveview`,
        body: params
      };
      
      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          dispatch(displayNotification('Mandate list loading error', 'error'));
          console.error('Mandate list loading error', err);
          reject(err);
        });
    });
  };
};

const updateMandate = (params) => {
  
  return dispatch => {
    return new Promise((resolve, reject) => {
      const requestData = {
        url: `${apiGatewayUrl}/update-mandate-by-action`,
        body: params
      };     
      
      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {          
          if(err.error && err.error.errmsg){
            dispatch(displayNotification(err.error.errmsg, 'error'));
          }   
          dispatch(displayNotification('Mandate updating error', 'error'));       
          console.error('Mandate updating error', err);
          reject(err);
        });
    });
  };
};

const getMandateByMandateId = (mandateId) =>{    
  return dispatch => {
    return new Promise((resolve, reject) => {
      const request = {
        url: `${apiGatewayUrl}/sme-mandates?mandateId=`+mandateId
      };

      return httpService.get(request, dispatch)
        .then((response) => {      
          resolve(response.data);
        })
        .catch(err => {
          dispatch(displayNotification('Get mandate error', 'error'));
          console.error('Get mandate error', err);
          reject(err);
        });
      });
    };
};

const getBankAccounts = (data) => async dispatch => {
  try {      
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

const getPaginatedMandate = (params) =>  {
  //console.log('getPaginatedMandate action request',params);

  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { 
        url: `${apiGatewayUrl}/get-paginated-mandates`,
        body: params
      };
      
      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          dispatch(displayNotification('Mandate list loading error', 'error'));
          console.error('Mandate list loading error', err);
          reject(err);
        });
    });
  };


  // return dispatch => {
  //   return new Promise((resolve, reject) => {  
  //   const request = {
  //     url: `${apiGatewayUrl}/get-paginated-mandates`,
  //     body: data
  //   };
  //   console.log('getPaginatedMandate action request',request);
  //   return httpService.post(request, dispatch)
  //     .then((response) => {
  //       return resolve({ ...response.data });
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });
  //   });
  // };
  
};


export {
  getMandateList,
  updateMandate,
  getMandateByMandateId,
  getBankAccounts,
  getPaginatedMandate,
};