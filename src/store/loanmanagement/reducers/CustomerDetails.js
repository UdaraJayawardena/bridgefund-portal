import {
  GET_CUSTOMER_DETAILS,
  CLEAR_CUSTOMER_DETAILS
} from '../constants/CustomerDetails';

const customerDetails = (
  state = {
    customerDetails: {} 
  },
  action
) => {
  switch (action.type) {
    case GET_CUSTOMER_DETAILS:
      return Object.assign({}, state, {
        customerDetails: action.customersDetails
      });

    case CLEAR_CUSTOMER_DETAILS:
      return Object.assign({}, state, {
        customerDetails: {}
      });

    default:
      return state;
  }
};

export default customerDetails;
