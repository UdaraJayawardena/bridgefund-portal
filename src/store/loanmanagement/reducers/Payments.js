import {
  // PROCESS_PAYMENT,
  // PROCESS_HOLIDAYS,
  // ADD_NEW_TRANSACTION,
  // ADD_NEW_TRANSACTION_ERROR,
  // CLEAR_TRANSACTION_ERROR,
  PAYMENTS_AS_AT_DATE
} from '../constants/Payments';
// import { SAVE_NEW_PAYMENT } from '../constants/AddNewPayments';
// import { ADD_NEW_TRANSACTIONS_OF_CONTRACT } from '../constants/Contracts';
// import moment from 'moment';
// import { object } from 'prop-types';

const payments = (
  state = {
    // payments: [],
    // holidays: [],
    // addTransactionError: '',
    todaysPayments: []
  },
  action
) => {
  switch (action.type) {
    // case PROCESS_PAYMENT:
    //   return Object.assign({}, state, {
    //     payments: action.payments
    //   });

    /* case SAVE_NEW_PAYMENT:

            const newObject = state.payments.slice(0);

            newObject.push(action.newPayment);

            return {
                ...state,
                payments: newObject
            };*/

    // case ADD_NEW_TRANSACTIONS_OF_CONTRACT:
    //   const existingPayments = state.payments.slice(0);

    //   action.newTransactionsOfContract.map(transaction => {
    //     existingPayments.push(transaction);
    //   });

    //   return {
    //     ...state,
    //     payments: existingPayments
    //   };

    // case ADD_NEW_TRANSACTION_ERROR:
    //   return {
    //     ...state,
    //     addTransactionError: action.error + "..!! Can't create Transaction."
    //   };

    // case CLEAR_TRANSACTION_ERROR:
    //   return {
    //     ...state,
    //     addTransactionError: ''
    //   };

    // case ADD_NEW_TRANSACTION:
    //   const newPayments = state.payments.slice(0);

    //   newPayments.push(action.newTransaction);

    //   return {
    //     ...state,

    //     payments: newPayments
    //   };

    // case PROCESS_HOLIDAYS:
    //   let holidays = [];

    //   action.holidays.map(obj => {
    //     holidays.push(moment(obj.date).format('DD-MM-YYYY'));
    //   });

    //   return {
    //     ...state,
    //     holidays: holidays
    //   };

    case PAYMENTS_AS_AT_DATE:

      return Object.assign({}, state, {
        todaysPayments: action.todaysPayments
      });

    default:
      return state;
  }
};

export default payments;
