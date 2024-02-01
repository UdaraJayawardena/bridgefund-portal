import { displayNotification } from './Notifier';
import ENV from '../../../config/env';

import {
  PROCESS_LOAN_CONTRACTS,
  // CLEAR_LOAN_CONTRACTS
} from '../constants/LoanContracts';

const api = ENV.LOAN_MANAGEMENT_URL;

const requestLoanContracts = contractId => {
  return async dispatch => {
    await fetch(api + '/sme-loan-contracts/loancontracts/' + contractId)
      .then(res => res.json())
      .then(result => {
        return dispatch(processLoanContracts(result.data));
      })
      .catch(() => {
        dispatch(displayNotification('Request loancontracts - Unexpected error occured!', 'error'))
      });
  };
};

const processLoanContracts = loancontracts => {
  return {
    type: PROCESS_LOAN_CONTRACTS,
    loancontracts
  };
};

// const clearLoanContracts = loancontracts => {
//   return {
//     type: CLEAR_LOAN_CONTRACTS,
//     loancontracts
//   };
// };

export {
  requestLoanContracts,
  processLoanContracts,
  // clearLoanContracts
};
