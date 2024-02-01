import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  SAVE_NEW_MANDATE,
  PROCESS_SME_MANDATES_BY_CUSTOMER,
  CLEAR_SME_MANDATES,
  CLEAR_SME_MANDATES_BY_CUSTOMER,
  UPDATE_SME_MANDATE,
  UPDATE_SME_MANDATE_STATUS
} from '../constants/SmeMandates';

const mandateServiceUrl = ENV.MANDATE_SERVICE_URL;
const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

// const requestSmeMandates_ = customerId => {
//   return async dispatch => {
//     await fetch(api + '/sme-mandates/sme-id/' + customerId)
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processSmeMandates(result.data));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request Mandates - Unexpected error occured.', 'error'));
//       });
//   };
// };

const requestSmeMandates = customerId => {

  const requestData = { url: API_GATEWAY_URL + `/request-mandates?customerId=${customerId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          return dispatch(processSmeMandates(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Request Mandates - Unexpected error occured.', 'error'));
        });
    });
  };

};

const processSmeMandates = smeMandatesByCustomer => {
  return {
    type: PROCESS_SME_MANDATES_BY_CUSTOMER,
    smeMandatesByCustomer
  };
};

const createNewMandate = newMandate => {
  return {
    type: SAVE_NEW_MANDATE,
    newMandate
  };
};

const updateMandate = mandateData => {
  return {
    type: UPDATE_SME_MANDATE,
    mandateData
  };
};

const clearSmeMandates = () => {
  return {
    type: CLEAR_SME_MANDATES
  };
};

const clearSmeMandatesByCustomer = () => {
  return {
    type: CLEAR_SME_MANDATES_BY_CUSTOMER
  };
};

const updateMandateStatus = mandateData => {
  return {
    type: UPDATE_SME_MANDATE_STATUS,
    mandateData
  };
};

export {
  requestSmeMandates,
  createNewMandate,
  updateMandate,
  clearSmeMandates,
  clearSmeMandatesByCustomer,
  updateMandateStatus
};