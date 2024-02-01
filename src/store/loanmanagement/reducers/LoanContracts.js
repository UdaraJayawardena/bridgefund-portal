import {
  PROCESS_LOAN_CONTRACTS,
  // CLEAR_LOAN_CONTRACTS
} from '../constants/LoanContracts';

const loancontracts = (
  state = {
    loancontracts: []
  },
  action
) => {
  switch (action.type) {

    case PROCESS_LOAN_CONTRACTS:
      return {
        ...state,
        loancontracts: action.loancontracts
      };

    // case CLEAR_LOAN_CONTRACTS:
    //   return {
    //     ...state,
    //     loancontracts: []
    //   };

    default:
      return state;
  }
};

export default loancontracts;
