import {
  SET_FLEX_LOAN_OVERVIEW_DATA,
  CLEAR_FLEX_LOAN_OVERVIEW_DATA,
  SET_FLEX_LOAN_WITHDRAWALS,
  CLEAR_FLEX_LOAN_WITHDRAWALS,
  SET_ALL_FLEX_LOANS,
} from '../constants/FlexLoan';

const flexLoanOverview = (
  state = {
    flexLoanContratIds: []
  },
  action
) => {
  switch (action.type) {

    case SET_ALL_FLEX_LOANS:
      return {
        ...state,
        flexLoanContratIds: convertToIdList(action.payload)
      };

    default:
      return state;
  }
};

const convertToIdList = (flexLoanList) => {
  if (flexLoanList === 0)
    return [];
  return flexLoanList.map(flexLoan => flexLoan.contractId);
};

export default flexLoanOverview;
