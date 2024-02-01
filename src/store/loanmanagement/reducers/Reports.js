
import {
   GET_MULTIPLE_OVERVIEW_DATA,
   SET_SINGLE_LOAN_HISTORY_DATA
} from '../constants/Reports';

const Reports = (
   state = {
      multipleLoanOverviewData: [],
      selectedLoanHistory: {}
   },
   action
) => {
   switch (action.type) {
      case GET_MULTIPLE_OVERVIEW_DATA:
         return Object.assign({}, state, {
            multipleLoanOverviewData: action.loanData
         });
      case SET_SINGLE_LOAN_HISTORY_DATA:
         return Object.assign({}, state, {
            selectedLoanHistory: action.loanHistory
         });
      default:
         return state;
   }
};

export default Reports;
