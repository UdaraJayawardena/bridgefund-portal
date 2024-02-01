// import moment from 'moment';
import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  PROCESS_DEFAULT_PROVISION_DETAILS,
  PROCESS_PROVISION_DETAILS
} from '../constants/ProvisionOverview';

const api = ENV.LOAN_MANAGEMENT_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;
// const getAllProvisionDetails = (date) => {

//   return async (dispatch) => {

//     date = date ? date : '';
//     await fetch(api + `/sme-loan-histories/provision-overview/generated-date/${date}`)
//       .then(res => res.json())
//       .then(result => {
//         dispatch(processProvisionDetails(result.data));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Get Provision Details - Unexpected error occured.', 'error'));
//       });
//   };
// };

const getAllProvisionDetails = (date, country) => {

  const requestData = { url: `${apiGatewayUrl}/Provision-data/?generateDate=${date}&country=${country}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          console.log(result)
          dispatch(processProvisionDetails(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Get Provision Details - Unexpected error occured.', 'error'));
          resolve(error);
        });
    });
  };
};

const getDefaultLoanProvisionDetails = (date, country) => {
console.log(country)
  const requestData = { url: `${apiGatewayUrl}/get-default-loan-calculations-for-provision/?overviewDate=${date}&country=${country}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          dispatch(processDefaultProvisionDetails(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Get Default Loans Provision Details - Unexpected error occured.', 'error'));
          resolve(error);
        });
    });
  };

};

const updateProvisionPercentage = (provision) => {

  return async dispatch => {

    fetch(api + '/smeloanhistory', {

      method: 'put',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(provision)
    })
      .then(res => res.json())

      .then(result => {

        if (result.success) {
          dispatch(getAllProvisionDetails());
        } else {
          dispatch(displayNotification('Error occured during the update.', 'error'));
        }
      })
      .catch(() => {
        dispatch(displayNotification('Update Provision Pecentage - Unexpected error occured.', 'error'));
      });
  };
};

const processProvisionDetails = provisions => {
  return {
    type: PROCESS_PROVISION_DETAILS,
    provisions
  };
};

const processDefaultProvisionDetails = payload => {
  return {
    type: PROCESS_DEFAULT_PROVISION_DETAILS,
    payload
  };
};

export { getAllProvisionDetails, updateProvisionPercentage, getDefaultLoanProvisionDetails };