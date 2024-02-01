import ENV from '../../../config/env';
import { displayNotification } from './Notifier';
import {
  SET_BANK_TRANSACTIONS_DATA,
  UPDATE_BANK_TRANSACTION_STATUS,
  UPDATE_BANK_TRANSACTION_RE_RUN,
  UPDATE_BANK_TRANSACTION_REVERSE,
  UPDATE_BANK_STATEMENT_REVERSE,
  SET_DIRECT_DEBIT_LIST_BY_TRANSACTION,
  CLEAR_HOVERED_DD_LIST,
  FIND_AND_UPDATE_BANK_TRANSACTION,
} from '../constants/BankTransactions';
import util from "lib/loanmanagement/utility";
import httpService from 'store/loanmanagement/service/httpService';

const api = ENV.DIRECT_DEBITS_URL;

const apiGatewayUrl = ENV.API_GATEWAY_URL;

/* cSpell:ignore iban  */

export const getAllBankTransactions = (transactionDate, status, bankAccount) => {
  return dispatch => {

    const requestData = {
      url: apiGatewayUrl + `/bank-transactions?transactionDate=${transactionDate}&status=${status}&accountNumber=${bankAccount}`
    };

    return httpService.get(requestData, dispatch)
      // .then(res => res.json())
      .then(result => {
        if (result.success) dispatch(setBankTransactionsData(result.data));
      })
      .catch(() => dispatch(displayNotification('Bank Transactions - Unexpected Error Occurred', 'error')));

    // await fetch(api + `/bank-transactions?transactionDate=${transactionDate}&status=${status}&accountNumber=${bankAccount}`)
    //    .then(res => res.json())
    //    .then(result => {
    //       if (result.success) {
    //          dispatch(setBankTransactionsData(result.data));
    //       }
    //    })
    //    .catch(() => {
    //       dispatch(displayNotification('Banlk Transactions - Unexpected Error Occured', 'error'));
    //    });

  };
};

export const getBankTransaction = (params) => {
  return dispatch => {

    const requestData = {
      url: api + '/bank-transactions?' + util.addQueryParams(params),
    };

    return httpService.get(requestData, dispatch)
      // .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(setBankTransactionsData(result.data));
        } else {
          throw result;
        }
      })
      .catch(() => dispatch(displayNotification('Bank Transactions - Unexpected Error Occurred', 'error')));

    // await fetch(api + '/bank-transactions?' + util.addQueryParams(params))
    //    .then(res => res.json())
    //    .then(result => {
    //       if (result.success) {
    //          dispatch(setBankTransactionsData(result.data));
    //       }
    //       else
    //          throw result;
    //    })
    //    .catch(() => {
    //       dispatch(displayNotification('Bank Transactions - Unexpected Error Occured', 'error'));
    //    });
  };
};

export const getManuallySettledBankTransactionsByContractId = contractId => {
  return dispatch => {

    const requestData = {
      url: api + '/sme-loan-transaction/manually-settled/' + contractId,
    };

    return httpService.get(requestData, dispatch)
      // .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(setBankTransactionsData(result.data));
        }
        else
          throw result;
      })
      .catch(() => {
        dispatch(displayNotification('Bank Transactions - Unexpected Error Occurred', 'error'));
      });

    // await fetch(api + '/sme-loan-transaction/manually-settled/' + contractId)
    //   .then(res => res.json())
    //   .then(result => {
    //     if (result.success) {
    //       dispatch(setBankTransactionsData(result.data));
    //     }
    //     else
    //       throw result;
    //   })
    //   .catch(() => {
    //     dispatch(displayNotification('Bank Transactions - Unexpected Error Occured', 'error'));
    //   });
  };
};

export const setBankTransactionsData = bankTransactions => ({ type: SET_BANK_TRANSACTIONS_DATA, bankTransactions });

export const setHoveredDirectDebitListByTransactionId = (transactionId) => {
  return dispatch => {

    const requestData = {
      url: api + '/sme-loan-transaction/transaction-id/' + transactionId,
    };

    return httpService.get(requestData, dispatch)
      // .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(directDebitsByHoveredTransaction(result.data));
        }
        else
          throw result;
      })
      .catch(() => dispatch(displayNotification('Bank Transactions - Unexpected Error Occurred', 'error')));

    // await fetch(api + '/sme-loan-transaction/transaction-id/' + transactionId)
    //   .then(res => res.json())
    //   .then(result => {
    //     // console.log('result in action ',result.data);
    //     if (result.success) {
    //       dispatch(directDebitsByHoveredTransaction(result.data));
    //     }
    //     else
    //       throw result;
    //   })
    //   .catch(() => {
    //     dispatch(displayNotification('Banlk Transactions - Unexpected Error Occured', 'error'));
    //   });
  };
};

//to get dd list by hovered transaction id in statusHistory of the dd
export const directDebitsByHoveredTransaction = hoverdDirectDebits => ({ type: SET_DIRECT_DEBIT_LIST_BY_TRANSACTION, hoverdDirectDebits });

export const saveBankTransactionStatus = (transactionId, status) => {
  return dispatch => {
    try {

      const requestData = {
        url: api + `/bank-transactions/change-banktransaction-status/${transactionId}`,
        body: { status }
      };

      return httpService.put(requestData, dispatch)
        .then((response) => {
          dispatch(updateBackTransactionInState(response.data));
          return response.data;
        })
        .catch(() => dispatch(displayNotification('Bank Transactions Status - Unexpected Error Occurred', 'error')));

      // const requestData = {
      //   url: api + `/bank-transactions/change-banktransaction-status/${transactionId}`,
      //   body: { status }
      // };
      // const response = await httpService.put(requestData, dispatch);
      // dispatch(updateBackTransactionInState(response.data));
      // return response.data;

    } catch (error) {
      console.error('saveBankTransactionStatus', error);
      throw error;
    }
  };
  // return async dispatch => {
  //    let data = { "status": status }
  //    //bank-transactions/change-banktransaction-status/:transactionID
  //    fetch(api + `/bank-transactions/change-banktransaction-status/${transactionId}`, {
  //       method: 'put',

  //       headers: {
  //          Accept: 'application/json',
  //          'Content-Type': 'application/json'
  //       },

  //       body: JSON.stringify(data)
  //    })
  //       .then(res => res.json())

  //       .then(result => {
  //          if (result.success) {
  //             console.log('saveBankTransactionStatus', result.data);
  //             dispatch(updateBankTransactionStatus(status))
  //             dispatch(getAllBankTransactions(result.data.transactionDate))
  //             dispatch(displayNotification('Bank Transaction processed!', 'success'))
  //          }
  //          else {
  //             let error = result.error.errmsg;
  //             if (result.error.errlogs) {
  //                error = result.error.errlogs[0].error.message ? result.error.errlogs[0].error.message : error
  //             }
  //             dispatch(displayNotification(result.message, 'error'))
  //             dispatch(displayNotification(result.error.errmsg, 'error'))
  //             dispatch(displayNotification(error, 'error'))
  //             dispatch(updateBankTransactionStatus('error'))
  //          }
  //       })
  //       .catch(() => {
  //          dispatch(displayNotification('Bank Transaction process - Unexpected error occured.', 'error'))
  //          dispatch(updateBankTransactionStatus('error'))
  //       });
  // }
};

export const reRunBankTransaction = (bankTransaction, selectedBankAccount) => {
  return dispatch => {

    const requestData = {
      url: api + '/bank-statements/process/rerun',
      body: { statementNumber: bankTransaction.statementNumber, ibanNumber: selectedBankAccount }
    };

    return httpService.post(requestData, dispatch)
      .then(() => {
        dispatch(updateBankTransactionReRun(bankTransaction));
        dispatch(displayNotification('Bank Statement re-run processed!', 'success'));
      })
      .catch(() => dispatch(displayNotification('Bank Statement process - Unexpected error occurred.', 'error')))
      .finally(() => {
        dispatch(getAllBankTransactions(bankTransaction.transactionDate));
        console.log('bankTransaction : ', bankTransaction);
      });

    // await fetch(api + '/bank-statements/process/rerun', {
    //   method: 'post',

    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json'
    //   },

    //   body: JSON.stringify({ statementNumber: bankTransaction.statementNumber, ibanNumber: selectedBankAccount })

    // })
    //   .then(res => res.json())

    //   .then(() => {
    //     dispatch(updateBankTransactionReRun(bankTransaction));
    //     dispatch(displayNotification('Bank Statement re-run processed!', 'success'));
    //   })
    //   .catch(() => {
    //     dispatch(displayNotification('Bank Statement process - Unexpected error occured.', 'error'));
    //   })
    //   .finally(() => {
    //     dispatch(getAllBankTransactions(bankTransaction.transactionDate));
    //     console.log('bankTransaction : ', bankTransaction);
    //   });
  };
};

export const updateBankTransactionReRun = bankTransactionReRun => ({ type: UPDATE_BANK_TRANSACTION_RE_RUN, bankTransactionReRun });

export const reverseBankTransaction = (bankTransaction, transactionDate) => {
  return dispatch => {

    const requestData = {
      url: api + '/bank-transactions/process/reverse',
      body: bankTransaction
    };

    return httpService.post(requestData, dispatch)
      .then(() => {
        dispatch(updateBankTransactionReverse(bankTransaction));
        dispatch(displayNotification('Bank Transaction reverse processed!', 'success'));
      })
      .catch(() => dispatch(displayNotification('Bank Transaction process - Unexpected error occurred.', 'error')))
      .finally(() => dispatch(getAllBankTransactions(transactionDate)));

    // await fetch(api + '/bank-transactions/process/reverse', {
    //   method: 'post',

    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json'
    //   },

    //   body: JSON.stringify(bankTransaction)

    // })
    //   .then(res => res.json())

    //   .then(() => {
    //     dispatch(updateBankTransactionReverse(bankTransaction));
    //     dispatch(displayNotification('Bank Transaction reverse processed!', 'success'));
    //   })
    //   .catch(() => {
    //     dispatch(displayNotification('Bank Transaction process - Unexpected error occured.', 'error'));
    //   })
    //   .finally(() => {
    //     dispatch(getAllBankTransactions(transactionDate));
    //   });

  };
};

export const reverseBankStatement = (bankTransaction, selectedBankAccount) => {
  return async dispatch => {

    const requestData = {
      url: api + '/bank-statements/process/reverse',
      body: { statementNumber: bankTransaction.statementNumber, ibanNumber: selectedBankAccount }
    };

    return httpService.post(requestData, dispatch, true)
      .then(() => {
        dispatch(updateBankStatementReverse(bankTransaction.statementNumber));
        dispatch(displayNotification('Bank Statement reverse processed!', 'success'));
      })
      .catch(() => dispatch(displayNotification('Bank Statement process - Unexpected error occurred.', 'error')))
      .finally(() => dispatch(getAllBankTransactions(bankTransaction.transactionDate)));

  };
};

const updateBackTransactionInState = (bankTransaction) => ({ type: FIND_AND_UPDATE_BANK_TRANSACTION, bankTransaction });

export const updateBankTransactionReverse = bankTransactionReverse => ({ type: UPDATE_BANK_TRANSACTION_REVERSE, bankTransactionReverse });

export const updateBankTransactionStatus = bankTransactionStatus => ({ type: UPDATE_BANK_TRANSACTION_STATUS, bankTransactionStatus });

export const clearHoveredDDList = () => ({ type: CLEAR_HOVERED_DD_LIST });

export const updateBankStatementReverse = bankStatementReverse => ({ type: UPDATE_BANK_STATEMENT_REVERSE, bankStatementReverse });