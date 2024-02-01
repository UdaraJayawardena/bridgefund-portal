import {
   SWITCH_LOAN_STOP_HISTORY_IS_BUSY,
   SET_IS_ACTIVE_AVAILABLE_FOR_SME,
   PROCESS_LOAN_STOP_HISTORY_DATA,
   SET_LOAN_STOP_HISTORY_ORIGIN,
   SHOW_TEMPORARY_LOAN_STOP,
   ADD_TEMPORARY_LOAN_STOP,
   UPDATE_TEMPORARY_STOP,
} from "../constants/SmeLoanTemporaryLoanStop";

const LoanStopHistory = (
   state = {
      loanStopHistoryData: [],
      origin: '',
      isBusy: false,
      isActiveAvailableForSME: false,
      showTemporaryLoanStop: false
   },
   action
) => {
   switch (action.type) {
      case PROCESS_LOAN_STOP_HISTORY_DATA:
         return Object.assign({}, state, {
            loanStopHistoryData: action.loanStopHistoryData
         });

      case SET_LOAN_STOP_HISTORY_ORIGIN:
         return {
            ...state,
            origin: action.origin
         };

      case SWITCH_LOAN_STOP_HISTORY_IS_BUSY:
         return {
            ...state,
            isBusy: !state.isBusy
         };

      case SET_IS_ACTIVE_AVAILABLE_FOR_SME:
         return {
            ...state,
            isActiveAvailableForSME: action.isActiveAvailableForSME
         };

      case SHOW_TEMPORARY_LOAN_STOP:
         return {
            ...state,
            showTemporaryLoanStop: !state.showTemporaryLoanStop
         };

      case UPDATE_TEMPORARY_STOP:
         return {
            ...state,
            loanStopHistoryData: state.loanStopHistoryData.map(loanStop => { return action.temporaryStop._id.toString() === loanStop._id.toString() ? action.temporaryStop : loanStop })
         };

      case ADD_TEMPORARY_LOAN_STOP:
         const loanStopHistoryData = state.loanStopHistoryData;
         loanStopHistoryData.push(action.temporaryStop);

         return {
            ...state,
            loanStopHistoryData: loanStopHistoryData
         };

      default:
         return state;
   };
}

export default LoanStopHistory;