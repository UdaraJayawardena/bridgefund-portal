import ENV from '../../../config/env';
import httpService from 'store/loanmanagement/service/httpService';
import { SHOW_GENERATE_PAYMENT_REQUEST } from '../constants/GeneratePaymentRequest';
import { displayNotification } from './Notifier';
const loanManagementApi = ENV.LOAN_MANAGEMENT_URL;
const configurationApi = ENV.CONFIGURATION_URL;

export const sendTikkiePayment = (data) => {

  const requestData = {
    url: loanManagementApi + ('/tikkie-payment'),
    body: data
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  };
};

export const getTikkieMaximumAmount = (type) => {

  return dispatch => {
    const requestData = {
      url: configurationApi + `/tikkie/type/${type}`
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        if (result.success) {
          return (result.data);
        }
      })
      .catch(() => {
        dispatch(displayNotification('get Tikkie maximum amount - Unexpected Error Occured', 'error'));
      });
  };
};

export const showGeneratePaymentRequest = () => ({ type: SHOW_GENERATE_PAYMENT_REQUEST });
