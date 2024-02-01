import moment from "moment";
import { displayNotification } from './Notifier';
import ENV from '../../../config/env';

import {
  // PROCESS_PAYMENT,
  // PROCESS_HOLIDAYS,
  // ADD_NEW_TRANSACTION,
  // ADD_NEW_TRANSACTION_ERROR,
  // CLEAR_TRANSACTION_ERROR,
  PAYMENTS_AS_AT_DATE
} from '../constants/Payments';

// const api = ENV.CUSTOMER_CONTRACTS_URL;
const directdebitsApi = ENV.DIRECT_DEBITS_URL;

// const requestPayment = customerId => {
//   return async dispatch => {
//     await fetch(api + '/payments/' + customerId)
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processPayments(result.data));
//       })
//       .catch(error => {
//         dispatch(displayNotification('Request Payments - Unexpected error occured!', 'error'))
//       });
//   }
// };

// const requestBankHolidays = () => {
//   return async dispatch => {
//     await fetch(api + '/holidays/years/2018/gt')
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processHolidays(result.data));
//       })
//       .catch(error => {
//         dispatch(displayNotification('Request Bank Holidays - Unexpected error occured.', 'error'))
//       });
//   };
// };

// const addTransaction = transaction => {

//   return async dispatch => {
//     // await fetch(api + '/payments?isTwikeyDissabled=false', {
//     await fetch(api + '/manual-collection', {
//       method: 'post',

//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },

//       body: JSON.stringify(transaction)
//     })
//       .then(res => res.json())

//       .then(result => {
//         // console.log("Result is:  ", result);

//         if (result.success) {
//           dispatch(displayNotification('Transaction created', 'success'))
//           dispatch(showAddTransaction()); //  this is to close the popup
//           dispatch(clearTransactionError());
//           return dispatch(addNewTransaction(result.data));
//         } else {
//           dispatch(displayNotification(result.error.errmsg, 'error'))
//           return dispatch(addNewTransactionError(result.error.errmsg));
//         }
//       })
//       .catch(error => {
//         dispatch(displayNotification('Add Transaction - Unexpected error occured', 'error'))
//       });
//   };
// };

const requestPaymentsAsAtDate = () => {
  return async dispatch => {
    // await fetch(directdebitsApi + '/payments/todaysPayments' )
    // await fetch(directdebitsApi + '/sme-loan-transaction/todays-payments')
    await fetch(directdebitsApi + '/sme-loan-repayment-dd-batch/byExecutionDate/' + moment().format('YYYY-MM-DD'))
      .then(res => res.json())

      .then(result => {
        return dispatch(paymentsAsAtDate(result.data));
      })
      .catch(() => {
        dispatch(displayNotification('Request Todays Payments - Unexpected error occured.', 'error'))
      });
  };
};

// const processPayments = payments => {
//   return {
//     type: PROCESS_PAYMENT,
//     payments
//   };
// };

// const addNewTransactionError = error => {
//   return {
//     type: ADD_NEW_TRANSACTION_ERROR,
//     error
//   };
// };

// const clearTransactionError = error => {
//   return {
//     type: CLEAR_TRANSACTION_ERROR,
//     error
//   };
// };

// const addNewTransaction = newTransaction => {
//   return {
//     type: ADD_NEW_TRANSACTION,
//     newTransaction
//   };
// };

// const processHolidays = holidays => {
//   return {
//     type: PROCESS_HOLIDAYS,
//     holidays
//   };
// };

const paymentsAsAtDate = todaysPayments => {
  return {
    type: PAYMENTS_AS_AT_DATE,
    todaysPayments
  };
};

export {
  // requestPayment,
  // processPayments,
  // addTransaction,
  // requestBankHolidays,
  // clearTransactionError,

  requestPaymentsAsAtDate,
};
