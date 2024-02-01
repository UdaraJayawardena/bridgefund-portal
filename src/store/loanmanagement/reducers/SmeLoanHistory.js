import {
  PROCESS_SMELOANHISTORY,
  CLEAR_SMELOANHISTORY,
  PROCESS_SME_LOAN_HISTORIES,
  CLEAR_SME_LOAN_HISTORIES,
} from '../constants/SmeLoanHistory';

const smeLoanHistory = (

  state = {
    smeloanhistory: {},
    smeloanhistories: []
  },
  action
) => {
  switch (action.type) {

    case PROCESS_SMELOANHISTORY:
      return Object.assign({}, state, {
        smeloanhistory: action.smeloanhistory ? action.smeloanhistory : {}
      });
    case CLEAR_SMELOANHISTORY:
      return {
        ...state,
        smeloanhistory: {}
      }
    case PROCESS_SME_LOAN_HISTORIES:
      return Object.assign({}, state, {
        smeloanhistories: action.smeLoanHistories ? action.smeLoanHistories : []
      });
    case CLEAR_SME_LOAN_HISTORIES:
      return {
        ...state,
        smeloanhistories: []
      }
    default:
      return state;
  }
};

export default smeLoanHistory;