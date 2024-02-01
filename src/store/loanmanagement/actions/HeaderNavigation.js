import ENV from '../../../config/env';
import httpService from 'store/loanmanagement/service/httpService';
import { displayNotification } from './Notifier';
import {
  GET_ALL_CUSTOMER_DETAILS,
  // TOGGLE_SEARCH,
  // SHOW_STATISTIC_PAGE,
  CHANGE_CUSTOMER_DETAILS,
  CLEAR_SELECTED_CUSTOMER,
  // SELECT_CUSTOMER,
  FIND_AND_SELECT_SME,
  CLEAR_HEADER_DISPLAY_MAIN_DATA,
  CLEAR_HEADER_DISPLAY_SUB_DATA,
  SET_HEADER_DISPLAY_MAIN_DATA,
  SET_HEADER_DISPLAY_SUB_DATA,
} from '../constants/HeaderNavigation';
import util from 'lib/loanmanagement/utility';
import { encodeQueryData } from 'lib/crm/utility';

// const getAllCustomers = () => {
//   const api = ENV.CRM_PROXY_URL;
//   return async dispatch => {
//     await fetch(api + '/smes')
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processCustomers(result.data));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request SME List - Unexpected error occured.', 'error'));
//       });
//   };
// };

const getAllCustomers = () => {
  const crmGatewayUrl = ENV.CRM_GATEWAY_URL;
  return dispatch => {
    const queryParams = {
     perPage: 25,
     page: 1,
     includeAddresses: "id type streetName houseNumber postalCode cityName country",
     includeContacts: "type subType value",
     includeStakeHolders: "id personId"
    };
    const requestData = {
     url: crmGatewayUrl + `/crm-management/customers?${encodeQueryData(queryParams)}`
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
       const customersList = util.createCustomersObject(result.data.records);

       return dispatch(processCustomers(customersList));
      })
      .catch(() => {
        dispatch(displayNotification('Request SME List - Unexpected error occured.', 'error'));
      });
  };

};

// const selectCustomer = (smeId) => {
//   return {
//     type: SELECT_CUSTOMER
//   }
// }

const processCustomers = customers => {
  return {
    type: GET_ALL_CUSTOMER_DETAILS,
    customers
  };
};

// const toglleSearch = () => {
//   return {
//     type: TOGGLE_SEARCH
//   };
// };

// const showStatisticPage = () => {
//   return {
//     type: SHOW_STATISTIC_PAGE
//   };
// };

const changeCustomerDetails = customerDetails => {
  return {
    type: CHANGE_CUSTOMER_DETAILS,
    customerDetails
  };
};

const setHeaderDisplayMainData = payload => {
  return {
    type: SET_HEADER_DISPLAY_MAIN_DATA,
    payload
  };
};

const clearHeaderDisplayMainData = () => {
  return {
    type: CLEAR_HEADER_DISPLAY_MAIN_DATA
  };
};

const setHeaderDisplaySubData = payload => {
  return {
    type: SET_HEADER_DISPLAY_SUB_DATA,
    payload
  };
};

const clearHeaderDisplaySubData = () => {
  return {
    type: CLEAR_HEADER_DISPLAY_SUB_DATA
  };
};

const clearSelectedCustomer = () => {
  return {
    type: CLEAR_SELECTED_CUSTOMER
  };
};

const findAndSelectCustomerById = (id) => ({ type: FIND_AND_SELECT_SME, smeId: id });

export {
  getAllCustomers,
  processCustomers,
  // toglleSearch,
  // showStatisticPage,
  changeCustomerDetails,
  clearSelectedCustomer,
  findAndSelectCustomerById,
  setHeaderDisplayMainData,
  setHeaderDisplaySubData,
  clearHeaderDisplaySubData,
  clearHeaderDisplayMainData,
};