import { displayNotification } from './Notifier';
import httpService from '../service/httpService';
import ENV from '../../../config/env';
const api = ENV.FOUNDATION_URL;


export const createPaymentOrder = (requestData) => {

  const data = {
    url: api + ('/payment-orders'),
    body: requestData
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      if (requestData === null || JSON.stringify(requestData) === '{}') {
        dispatch(displayNotification('createPaymentOrder - No payout transaction with open status or No active mandate', 'error'));
        return null;
       }

      return httpService.post(data, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(displayNotification('Successfully Created Payment Order', 'success'));
            return (result);
          }
        })
        .catch(error => {
          dispatch(displayNotification('createPaymentOrder - Unexpected Error Occured', 'error'));
          reject(error);
        });
    });
  };

};

