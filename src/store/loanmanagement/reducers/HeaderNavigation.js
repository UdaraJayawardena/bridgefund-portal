import {
  CLEAR_HEADER_DISPLAY_MAIN_DATA,
  CLEAR_HEADER_DISPLAY_SUB_DATA,
  SET_HEADER_DISPLAY_MAIN_DATA,
  SET_HEADER_DISPLAY_SUB_DATA,
} from '../constants/HeaderNavigation';

const headerNavigation = (
  state = {
    headerDisplayMainData: '',
    headerDisplaySubData: '',
  },
  action
) => {
  switch (action.type) {
    
    case SET_HEADER_DISPLAY_MAIN_DATA: {
      return {
        ...state,
        headerDisplayMainData: action.payload,
      };
    }

    case CLEAR_HEADER_DISPLAY_MAIN_DATA: {
      return {
        ...state,
        headerDisplayMainData: '',
      };
    }

    case SET_HEADER_DISPLAY_SUB_DATA: {
      return {
        ...state,
        headerDisplaySubData: action.payload,
      };
    }

    case CLEAR_HEADER_DISPLAY_SUB_DATA: {
      return {
        ...state,
        headerDisplaySubData: '',
      };
    }

    default:
      return state;
  }
};

export default headerNavigation;

// const selectCustomer = (customers, smeId) => {

//   let customer = {};

//   if (customers) {

//     customer = customers.find(cus => cus.id == smeId);
//     customer.name = customer.firstName + ' ' + customer.lastName;
//   }

//   return customer;
// }


