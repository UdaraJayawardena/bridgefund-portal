import {
  PROCESS_DIRECTDEBITS,
  CLEAR_DIRECTDEBITS,
  // CONNECT_TO_DIRECTDEBIT,
  // CONNECT_AMOUNT,
  // SAVE_CONNECT_DIRECTDEBITS,
  // LOAD_COUNTER_PARTY_DIRECT_DEBITS,
  ADD_NEW_DIRECT_DEBIT_ERROR,
  CLEAR_DIRECT_DEBIT_ERROR,
  FIND_AND_UPDATE_TRANSACTION,
  // GET_CONNECT_OVERVIEW_DATA,
  FIND_AND_REMOVE_TRANSACTION,
} from '../constants/SmeLoanTransaction';
import { cloneDeep } from 'lodash';

const directdebits = (
  state = {
    directdebits: [],
    // connectAmount: 0,
    // statusSaveDDConnect: false,
    // directdebitsbycounterparty: {},
    contractId: null,
    directDebitError: '',
    // restPartialPaymentAmount: 0,
    // overviewData: {}
  },
  action
) => {
  switch (action.type) {
    case PROCESS_DIRECTDEBITS:
      return {
        ...state,
        directdebits: action.directdebits,
        contractId: action.contractID,
        // connectAmount: 0
      };

    case CLEAR_DIRECTDEBITS:
      return {
        ...state,
        directdebits: [],
        contractId: null,
        directDebitError: '',
        // connectAmount: 0,
        // statusSaveDDConnect: false
      };

    // case CONNECT_TO_DIRECTDEBIT:
    //   return {
    //     ...state,
    //     directdebits: action.directdebits,
    //     connectAmount: action.connectAmount
    //   }
    // case CONNECT_AMOUNT:
    //   return {
    //     ...state,
    //     connectAmount: action.connectAmount
    //   }
    // case SAVE_CONNECT_DIRECTDEBITS:
    //   return {
    //     ...state,
    //     statusSaveDDConnect: action.statusSaveDDConnect,
    //   }
    // case LOAD_COUNTER_PARTY_DIRECT_DEBITS:
    //   return {
    //     ...state,
    //     directdebitsbycounterparty: action.directdebitsbycounterparty,
    //     directdebits: action.directdebitsbycounterparty.ddList,
    //     contractId: action.contractId
    //   }

    case ADD_NEW_DIRECT_DEBIT_ERROR:
      return {
        ...state,
        directDebitError: action.error + "..!! Can't create direct debit."
      };

    case CLEAR_DIRECT_DEBIT_ERROR:
      return {
        ...state,
        directDebitError: ''
      };

    case FIND_AND_UPDATE_TRANSACTION: {
      const transactionToUpdate = !Array.isArray(action.transaction) ? [action.transaction] : action.transaction
      const directdebits = findAndUpdateMultipleTransactions(state.directdebits, transactionToUpdate);

      return {
        ...state,
        directdebits: directdebits,

      };
    }
    case FIND_AND_REMOVE_TRANSACTION: {
      let directdebits = cloneDeep(state.directdebits);
      const index = directdebits.findIndex(tr => tr.id === action.id);
      if (index > -1) {
        directdebits.splice(index, 1);
      }

      return { ...state, directdebits };
    } default:
      return state;

    // case GET_CONNECT_OVERVIEW_DATA:
    //   return {
    //     ...state,
    //     overviewData: action.overviewData
    //   }
  }
};

const findAndUpdateMultipleTransactions = (transactions, updatedTransactions) => {

  for (const transaction of updatedTransactions) {
    const index = transactions.findIndex(tr => transaction.id === tr.id)
    if (index > -1) transactions[index] = transaction;
    else transactions.push(transaction);
  }
  return transactions;
}

export default directdebits;
