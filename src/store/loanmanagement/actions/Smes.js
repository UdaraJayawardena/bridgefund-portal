import ENV from '../../../config/env';
import { displayNotification } from "./Notifier";
import {
  PROCESS_SELECTED_SME,
  CLEAR_SELECTED_SME
} from '../constants/Smes';
import { httpService } from '../service/httpService';
import { changeCustomerDetails } from './HeaderNavigation';

const api = ENV.CRM_PROXY_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;

// export const requestSmeByIban = iban => {
//   return async dispatch => {
//     await fetch(api + '/smes/iban/' + iban)
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processSme(result.data));
//       })
//       .catch(error => {
//         dispatch(displayNotification('Request SME by Iban - Unexpected error occured.', 'error'))
//       });
//   };
// };

export const requestSmeByIbanNumber = ibanNumber => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      const requestData = {
        url: apiGatewayUrl + `/get-customer-by-iban?ibanNumber=${ibanNumber}&includeAddresses=id%20type%20streetName%20houseNumber%20postalCode%20cityName%20country&includeContacts=type%20subType%20value&includeStakeHolders=id%20personId`
      };
      return httpService.get(requestData)
        .then(response => {
          dispatch(processSme(response.data));
          resolve(response.data);
        })
        .catch((error) => {
          console.error('requestSmeByIbanNumber', error);
          reject(error);
        });
    });
  };
};

// export const requestSmeById = smeId => {
 
//   return async dispatch => {
//     await fetch(api + '/smes/id/' + smeId)
//       .then(res => res.json())
//       .then(result => {
//         return dispatch(processSme(result.data));
//       })
//       .catch(error => {
//         console.error('requestSmeById', error);
//         dispatch(displayNotification('Request SME by Id - Unexpected error occured.', 'error'));
//       });
//   };
// };

export const requestSmeByIdPromise = smeId => {

  return async dispatch => {
    return await fetch(api + '/smes/id/' + smeId)
      .then(res => res.json())
      .then(result => {
        dispatch(changeCustomerDetails(result.data));
        return result.data;
      })
      .catch((error) => {
        dispatch(displayNotification('Request SME by Id - Unexpected error occurred.', 'error'));
        return error;
      });
  };

};

export const updateSmeEmail = (sme) => {

  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${apiGatewayUrl}/update-sme`,
        body: sme
      };

      return httpService.post(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            dispatch(changeCustomerDetails(response.data));
            dispatch(displayNotification('SME email updated', 'success'));
            // dispatch(addOrUpdateSmeLoan(response.data));
            resolve(response);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('SME email update - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

const processSme = sme => {
  return {
    type: PROCESS_SELECTED_SME,
    sme
  };
};

export const clearSelectedSme = () => {
  return {
    type: CLEAR_SELECTED_SME
  };
};