import {
  PROCESS_SME_MANDATES,
} from '../constants/SmeLoanTransaction';

import {
  PROCESS_SME_MANDATES_BY_CUSTOMER,
  CLEAR_SME_MANDATES,
  CLEAR_SME_MANDATES_BY_CUSTOMER,
  UPDATE_SME_MANDATE,
  UPDATE_SME_MANDATE_STATUS
} from '../constants/SmeMandates'

import {
  SAVE_NEW_MANDATE
} from '../constants/Mandates';

const smemandates = (
  state = {
    smemandates: [],
    smeMandatesByCustomer: []
  },
  action
) => {
  switch (action.type) {
    case PROCESS_SME_MANDATES:
      
      return {
        ...state,
        smemandates: [action.smemandates]
      };

    case CLEAR_SME_MANDATES:
      return {
        ...state,
        smemandates: []
      };

    case PROCESS_SME_MANDATES_BY_CUSTOMER:
      return {
        ...state,
        smeMandatesByCustomer: action.smeMandatesByCustomer
      }

    case SAVE_NEW_MANDATE:
      const newObject = state.smeMandatesByCustomer.slice(0);

      newObject.push(action.newMandate);

      return {
        ...state,
        smeMandatesByCustomer: newObject,
        serverError: ''
      };

    case UPDATE_SME_MANDATE:

      const newMandates = state.smeMandatesByCustomer.map(mandate => {
        return mandate.mandateId === action.mandateData.mandateId ?
          action.mandateData : mandate;
      });

      return {
        ...state,
        smeMandatesByCustomer: newMandates
      };
      case UPDATE_SME_MANDATE_STATUS:

        const mandatesWIthUpdatedStatus = state.smeMandatesByCustomer.map(mandate => {
          if (mandate.mandateId === action.mandateData.mandateId) {
            return {
              ...mandate,
              status: action.mandateData.status
            };
          }
          return mandate;
        });
        return {
          ...state,
          smeMandatesByCustomer: mandatesWIthUpdatedStatus
        };

    case CLEAR_SME_MANDATES_BY_CUSTOMER:
      return {
        ...state,
        smeMandatesByCustomer: []
      };

    default:
      return state;
  }
};

export default smemandates;
