import {
  PROCESS_LOAN,
  // SELECT_LOAN,
  // CLEAR_LOANS,
  CLEAR_LOAN
} from '../constants/Loans';

const loans = (
  state = {
    loan: {},
    // selectedLoan: {}
  },
  action
) => {
  switch (action.type) {
    case PROCESS_LOAN:
      return {
        ...state,
        loan: action.loan
      };

    // case SELECT_LOAN:
    //   return {
    //     ...state,
    //     selectedLoan: action.loan
    //   };

    // case CLEAR_LOANS:
    //   return {
    //     ...state,
    //     loans: []
    //   };
    
    case CLEAR_LOAN:
      return {
        ...state,
        loan: []
      };
      
    default:
      return state;
  }
};

export default loans;
