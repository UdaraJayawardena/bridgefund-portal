import { GET_ALL_LOAN_LATE_PAYMENT_OVERVIEWS } from '../constants/LoanLatePaymentOverview';

const LoanLatePaymentOverviews = (
  state = {
    loanLatePayments: [],
    totalOverallOriginalLoanValue: 0,
    totalOverallTotalOutstanding: 0,
    totalOverallTotalOverdue: 0,
  },
  action
) => {
  switch (action.type) {
    case GET_ALL_LOAN_LATE_PAYMENT_OVERVIEWS:
      return {
        ...state,
        loanLatePayments: action.payload.listOfPayments ? action.payload.listOfPayments : [],
        totalOverallOriginalLoanValue: action.payload.totalOverallOriginalLoanValue ? action.payload.totalOverallOriginalLoanValue : 0,
        totalOverallTotalOutstanding: action.payload.totalOverallTotalOutstanding ? action.payload.totalOverallTotalOutstanding : 0,
        totalOverallTotalOverdue: action.payload.totalOverallTotalOverdue ? action.payload.totalOverallTotalOverdue : 0,
      };

    default:
      return state;
  }
};

export default LoanLatePaymentOverviews;
