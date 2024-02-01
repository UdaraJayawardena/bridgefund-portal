import ENV from '../../../config/env';
import httpService from 'store/loanmanagement/service/httpService';
import { displayNotification } from './Notifier'
import {
  GET_CUSTOMER_DETAILS,
  CLEAR_CUSTOMER_DETAILS
} from '../constants/CustomerDetails';

const getCustomerDetails = customerId => {
  const api = ENV.CHAMBER_OF_COMMERCE_URL;

  return dispatch => {
    const requestData = {
      url: api + '/ventureByCustomer/' + customerId
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        return dispatch(processCustomerDetails(result.data));
      })
      .catch(() => {
        dispatch(displayNotification('Request Company Details - Unexpected error occured.', 'error'));
      });
  };
};

const processCustomerDetails = customersDetails => {
  return {
    type: GET_CUSTOMER_DETAILS,
    customersDetails
  };
};

const clearCustomerDetails = () => {
  return {
    type: CLEAR_CUSTOMER_DETAILS
  };
};

export { getCustomerDetails, clearCustomerDetails };
