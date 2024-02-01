import { displayNotification } from './Notifier';
import ENV from '../../../config/env';
import httpService from 'store/loanmanagement/service/httpService';

import {
  PROCESS_LOAN,
  // SELECT_LOAN,
  // CLEAR_LOANS,
  CLEAR_LOAN
} from '../constants/Loans';

// const api = ENV.LOAN_MANAGEMENT_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;

// const requestLoan = contractId => {
//   return async dispatch => {
//     await fetch(api + '/sme-loans/loans/' + contractId)
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) return dispatch(processLoan(result.data));
//         else displayNotification(result.error.errmsg, 'error');
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request loans - Unexpected error occured!', 'error'))
//       });
//   };
// };

const requestLoan = contractId => {

  const requestData = { url: `${apiGatewayUrl}/Sme-loans-by-contract-id/?contractId=${contractId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.success){ 
                  dispatch(processLoan(result.data));
                  resolve(result.data);
                  //return;
                }
        })
        .catch(error => {
          dispatch(displayNotification('Request loans - Unexpected error occured!', 'error'));
          reject(error);
        });
    });
  };
};

const processLoan = loan => {
  return {
    type: PROCESS_LOAN,
    loan
  };
};

// const selectLoan = loans => {
//   return {
//     type: SELECT_LOAN,
//     loans
//   };
// };

// const clearLoans = loans => {
//   return {
//     type: CLEAR_LOANS,
//     loans
//   };
// };

const clearLoan = loan => {
  return {
    type: CLEAR_LOAN,
    loan
  };
};

export {
  requestLoan,
  processLoan,
  // selectLoan,
  // clearLoans,
  clearLoan
};
