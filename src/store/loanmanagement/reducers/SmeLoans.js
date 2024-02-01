import {
  SAVE_NEW_SME_LOAN_BUSY,
  SHOW_TERMINATE_SME_LOAN_MODAL,
  SHOW_CANCEL_SME_LOAN_MODAL,
} from '../constants/SmeLoans';

const smeLoans = (
  state = {
    createSmeLoanIsBusy: false,
    showTerminateSmeLoanModal: false,
    isOpenLoanCancelModel:false,
  },
  action
) => {
  switch (action.type) {
   
    case SAVE_NEW_SME_LOAN_BUSY:

      return {
        ...state,
        createSmeLoanIsBusy: !state.createSmeLoanIsBusy
      };

    case SHOW_TERMINATE_SME_LOAN_MODAL:

      return {
        ...state,
        showTerminateSmeLoanModal: !state.showTerminateSmeLoanModal
      }; 

    case SHOW_CANCEL_SME_LOAN_MODAL:

      return{
        ...state,
        isOpenLoanCancelModel:!state.isOpenLoanCancelModel
      };

    default:
      return state;
  }
};

export default smeLoans;