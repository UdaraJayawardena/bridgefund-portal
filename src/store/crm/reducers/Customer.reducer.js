/* eslint-disable import/no-anonymous-default-export */
import {
  // CLEAR_CUSTOMER,
  // SET_CUSTOMER,
  GET_CUSTOMER_LIST,
  SET_CUSTOMER_SUCCESS_MANAGERS,
  // SET_SELECTED_CUSTOMER_ID
} from "../constants/Customer";

const defaultState = {
  // selectedCustomer: {}, // taken to lmglobal reducer
  // selectedCustomer_ua: Date.now(),// taken to lmglobal reducer
  customerList: [],//remain after dashboard issues
  customerSuccessManagerList: [], //remain after dashboard issues
  // selectedCustomerId: ''// taken to lmglobal reducer
};

export default (state = defaultState, action) => {
  switch (action.type) {

    // case CLEAR_CUSTOMER:
    //   return {
    //     ...state,
    //     selectedCustomer: {},
    //     selectedCustomer_ua: Date.now(),
    //   };

    // case SET_CUSTOMER:
    //   return {
    //     ...state,
    //     selectedCustomer: action.payload,
    //     selectedCustomer_ua: Date.now()
    //   };

    case GET_CUSTOMER_LIST:
      return {
        ...state,
        customerList: action.payload

      };

    case SET_CUSTOMER_SUCCESS_MANAGERS:
      return {
        ...state,
        customerSuccessManagerList: action.payload
      };

    // case SET_SELECTED_CUSTOMER_ID:
    //   return {
    //     ...state,
    //     selectedCustomerId: action.payload
    //   };

    default:
      return state;
  }
};
