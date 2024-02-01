import {
   SET_BANK_TRANSACTIONS_DATA,
   UPDATE_BANK_TRANSACTION_STATUS,
   UPDATE_BANK_TRANSACTION_RE_RUN,
   // CLEAR_BANK_TRANSACTIONS,
   UPDATE_BANK_TRANSACTION_REVERSE,
   UPDATE_BANK_STATEMENT_REVERSE,
   SET_DIRECT_DEBIT_LIST_BY_TRANSACTION,
   CLEAR_HOVERED_DD_LIST,
   FIND_AND_UPDATE_BANK_TRANSACTION
} from '../constants/BankTransactions';

const bankTransactions = (
   state = {
      // addNewBankTransactionsPopupState: false,
      bankTransactions: [],
      updateBankTransactionStatus: false,
      bankTransactionReverse: {},
      bankStatementReverse: {},
      hoverdDirectDebits: []
   },
   action
) => {
   switch (action.type) {

      case SET_BANK_TRANSACTIONS_DATA:
         return Object.assign({}, state, {
            bankTransactions: action.bankTransactions
         });

      case SET_DIRECT_DEBIT_LIST_BY_TRANSACTION:
         return Object.assign({}, state, {
            hoverdDirectDebits: action.hoverdDirectDebits
         });

      case CLEAR_HOVERED_DD_LIST:
         return Object.assign({}, state, {
            hoverdDirectDebits: []
         });

      // case CLEAR_BANK_TRANSACTIONS:
      //    return Object.assign({}, state, {
      //       bankTransactions: []
      //    });

      case UPDATE_BANK_TRANSACTION_STATUS:
         return {
            ...state,
            updateBankTransactionStatus: action.updateBankTransactionStatus
         }

      case UPDATE_BANK_TRANSACTION_RE_RUN: {
         let index = state.bankTransactions.findIndex(transaction => transaction._id.toString() === action.bankTransactionReRun._id.toString())
         state.bankTransactions[index] = action.bankTransactionReRun;
         return state;
      }
      case UPDATE_BANK_TRANSACTION_REVERSE:
         return {
            ...state,
            bankTransactionReverse: action.bankTransactionReverse
         }
      case UPDATE_BANK_STATEMENT_REVERSE:
         return {
            ...state,
            bankStatementReverse: action.bankStatementReverse
         }
      case FIND_AND_UPDATE_BANK_TRANSACTION: {
         const bankTransactions = state.bankTransactions;
         const index = bankTransactions.findIndex(bt => bt._id.toString() === action.bankTransaction._id.toString());
         if (index > -1) bankTransactions[index] = action.bankTransaction;
         else bankTransactions.push(action.bankTransaction);

         return {
            ...state,
            bankTransactions
         }
      }
      default:
         return state;
   }
};

// const addOrUpdateArray = (array, newArray) => {
//    for (let i = 0; i < newArray.length; i++) {
//       let newBankTransaction = newArray[i];
//       let index = array.findIndex(transaction => transaction._id.toString() === newBankTransaction._id.toString())

//       if (index >= 0)
//          array[index] = newBankTransaction;
//       else
//          array.push(newBankTransaction);
//    }
//    return array;
// }

export default bankTransactions;
