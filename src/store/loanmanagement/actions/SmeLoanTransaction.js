import moment from "moment";
import { httpService } from '../service/httpService';
import { displayNotification } from './Notifier';
import { findAndUpdateLoan, getCalculatedDataOfLoanTransactions, getSingleLoanOverviewData } from './SmeLoans';
import { showAddTransaction } from './Mandates';
import { createPaymentOrder } from './PaymentOrder';
import ENV from '../../../config/env';
import util from "lib/loanmanagement/utility";

/* cSpell:ignore DIRECTDEBITS DIRECTDEBIT errmsg */

import {
  PROCESS_DIRECTDEBITS,
  CLEAR_DIRECTDEBITS,
  PROCESS_SME_MANDATES,
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

import { saveBankTransactionStatus } from "./BankTransactions.js";

const API_GATEWAY_URL = ENV.API_GATEWAY_URL;
const DIRECT_DEBITS_API = ENV.DIRECT_DEBITS_URL;
const LOAN_MANAGEMENT_API = ENV.LOAN_MANAGEMENT_URL;
const mandateServiceUrl = ENV.MANDATE_SERVICE_URL;
// const requestDirectDebits = contractId => {
//   return async dispatch => {
//     return await fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/contract-id/' + contractId)
//       .then(res => res.json())
//       .then(result => {
//         dispatch(clearDirectDebits());
//         dispatch(processDirectDebits(result.data, contractId));
//         return result.data;
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request directdebits - Unexpected error occured!', 'error'))
//         return null;
//       });
//   };
// };

const requestDirectDebits = contractId => {
  return dispatch => {

    const requestData = {
      url: API_GATEWAY_URL + `/Sme-loans-transactions-by-contract-id/?contractId=${contractId}`,
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        if (result.success) {
          dispatch(clearDirectDebits());
          dispatch(processDirectDebits(result.data, contractId));
          return result.data;
        }
      })
      .catch(() => {
        dispatch(displayNotification('Request directdebits - Unexpected error occured!', 'error'));
        return null;
      });
  };
};

// const requestSmeMandates = mandateId => {
//   return async dispatch => {
//     await fetch(DIRECT_DEBITS_API + '/sme-mandates/mandate-id/' + mandateId)
//       .then(res => res.json())
//       .then(result => {
//         return dispatch(processSmeMandates(result.data));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request smemandates - Unexpected error occured!', 'error'))
//       });
//   };
// };

const requestSmeMandates = mandateId => {

  const requestData = { url: API_GATEWAY_URL + `/sme-mandates?mandateId=${mandateId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(response => {
          return dispatch(processSmeMandates(response.data));
        })
        .catch(error => {
          dispatch(displayNotification('Request smemandates - Unexpected error occured!', 'error'));
          reject(error);
        });
    });
  };

};

const requestDirectDebitsByContract = contractId => {

  const requestData = { url: DIRECT_DEBITS_API + '/sme-loan-transaction/paymentsnotpaid/' + contractId };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          // @ts-ignore
          dispatch(clearDirectDebits(contractId));
          dispatch(processDirectDebits(result.data, contractId));
          return result.data;
        })
        .catch(error => {
          dispatch(displayNotification('Request directdebits - Unexpected error occured!', 'error'));
          return [];
        });
    });
  };

};

// const requestDirectDebitsByIban = ibanNumber => {
//   return async dispatch => {
//     if (ibanNumber !== null) {
//       await fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/directdebits-counterparty/' + ibanNumber)
//         .then(res => res.json())
//         .then(result => {
//           // return dispatch(processDirectDebitsByIban(result.data));
//           if (result.data === null) {
//             return dispatch(processDirectDebitsByIban([]));
//           }
//           else {
//             return dispatch(processDirectDebitsByIban(result.data));
//           }
//         }).catch(() => {
//           dispatch(displayNotification('Request directDebitsByIban - Unexpected error occured!', 'error'))
//         });
//     } else {
//       return dispatch(processDirectDebitsByIban([]));
//     }
//   }
// }

// const processConnectToDirectDebit = (data, id, checked) => {
//   return async dispatch => {
//     let recode = data;
//     let foundIndex
//     foundIndex = recode.findIndex(fd => fd._id === id);
//     let fdc = recode[foundIndex];
//     fdc.checked = checked;
//     dispatch(setProcess(recode));
//   };
// }

// const setProcess = (recode) => {

//   return async dispatch => {
//     let amount = 0
//     recode.filter(dd => dd.checked === true).map(d => amount = amount + d.amount)
//     await dispatch(connectToDirectDebit(recode, amount));
//   };

// }

// const processConnectAmount = (Obj) => {
//   return async dispatch => {
//     let amount = 0
//     Obj.filter(dd => dd.checked === true).map(d => amount = amount + d.amount)
//     return dispatch(connectAmount(amount));
//   }
// }

const connectUnknownSmeLoanTransaction = (data) => {

  const connectData = {
    smeLoanTransactionMongoIds: [],
    contractId: [],
    status: '',
    statement: 0,
    btID: '',
    partialTransaction: null,
    transactionDate: ''
  };
  Object.assign(connectData, data);

  const transactionUpdateRequestData = {
    url: DIRECT_DEBITS_API + (`/sme-loan-transaction/connectdirectdebits/${connectData.btID}`),
    body: {
      ids: connectData.smeLoanTransactionMongoIds,
      status: connectData.status,
      statement: connectData.statement,
      transactionDate: connectData.transactionDate
    }
  };

  const returnObject = {};

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.put(transactionUpdateRequestData, dispatch)
        .then((response) => {
          returnObject.updatedDirectDebits = response.data;
          return dispatch(calculateNewBalance(null, connectData.status, connectData.contractId));
        })
        .then(() => {
          return dispatch(saveBankTransactionStatus(connectData.btID, 'manually-settled'));
        })
        .then(bankTransaction => {
          returnObject.bankTransaction = bankTransaction;
          if (connectData.partialTransaction) {
            return dispatch(createSmeLoanTransaction(connectData.partialTransaction));
          }
          return {};

        })
        .then((partialTransaction) => {
          returnObject.partialTransaction = partialTransaction;
          resolve(returnObject);
        })
        .catch((error) => {
          console.error('connectUnknownSmeLoanTransaction', error);
          reject(error);
        });
    });
  };
};

const settleUnknownAsPatialPayment = (patrialPayment, btId) => {

  const returnObject = {};
  return dispatch => {
    return new Promise((resolve, reject) => {
      return Promise.resolve(dispatch(createSmeLoanTransaction(patrialPayment)))
        .then((partialPayment) => {
          returnObject.partialPayment = partialPayment;
          return dispatch(saveBankTransactionStatus(btId, 'manually-settled'));
        })
        .then((bankTransaction) => {
          returnObject.bankTransaction = bankTransaction;
          resolve(returnObject);
        })
        .catch(error => {
          console.error('settleAsPatialPayment', error);
          reject(error);
        });
    });
  };
};

// const requestDirectDebitsByMandate = mandateId => {
//   return async dispatch => {
//     await fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/mandate-id/' + mandateId)
//       .then(res => res.json())
//       .then(result => {
//         dispatch(clearDirectDebits(mandateId));
//         return dispatch(processDirectDebits(result.data, mandateId));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request directdebits - Unexpected error occured!', 'error'))
//       });
//   };
// };

const requestDirectDebitsByMandate = mandateId => {

  const requestData = { url: API_GATEWAY_URL + `/Direct-debit-from-mandate/?mandateId=${mandateId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(response => {
          //@ts-ignore
          dispatch(clearDirectDebits(mandateId));
          return dispatch(processDirectDebits(response.data, mandateId));
        })
        .catch(error => {
          dispatch(displayNotification('Request directdebits - Unexpected error occured!', 'error'));
        });
    });
  };

};

const terminateDirectDebits = (terminateObj) => {

  const requestData = {
    url: API_GATEWAY_URL + '/Sme-loans-transaction-terminate',
    body: terminateObj
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(requestDirectDebits(terminateObj.contractId));
            dispatch(displayNotification('Direct debits terminated', 'success'));
          } else {
            dispatch(displayNotification('Direct debit terminate failed - Unexpected error occured', 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('Direct debit terminate - Unexpected error occured', 'error'));
        });
    });
  };

};

const addManualCollectionDirectDebit = transaction => {

  const requestData = {
    url: DIRECT_DEBITS_API + '/sme-loan-transaction/manual-collection',
    body: transaction
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(displayNotification('Direct debits created', 'success'));
            dispatch(showAddTransaction());
            dispatch(clearDirectDebitError());
          } else {
            dispatch(displayNotification(result.error.errmsg, 'error'));
            dispatch(addNewDirectDebitError(result.error.errmsg));
          }
        })
        .catch(error => {
          dispatch(displayNotification('Direct debits creation failed', 'error'));
        });
    });
  };

};

const startLoanAction = (contractId, frequency, paymentOrderData, systemDate) => {

  const payOutToUpdate = {
    condition: { contractId, type: 'pay-out', },
    data: { plannedDate: moment(systemDate).format('YYYY-MM-DD'), }
  };

  const requestData = {
    url: DIRECT_DEBITS_API + '/sme-loan-transaction/start-loan',
    body: {
      contractId: contractId,
      loanFrequency: frequency
    }
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {

            const maturityDate = result.data.loanEndDate;

            if (!maturityDate) throw Object.assign(new Error(), { error: { errmsg: 'Maturity Date Not Found!' } });

            const reqData = {
              url: LOAN_MANAGEMENT_API + '/sme-loans/contract-id/' + contractId,
              body: {
                maturityDate: maturityDate,
                shouldCalculateAPR: false
              }
            };

            return httpService.put(reqData, dispatch)
              .then(result => {
                if (result.success) {
                  dispatch(updatePayoutTransaction(payOutToUpdate));
                  dispatch(createPaymentOrder({ ...paymentOrderData, date: moment(systemDate).format('YYYY-MM-DD') }));
                  dispatch(findAndUpdateLoan(result.data.smeLoan));
                  dispatch(requestDirectDebits(contractId));
                  dispatch(getCalculatedDataOfLoanTransactions(result.data.smeLoan.contractId));
                  dispatch(getSingleLoanOverviewData(result.data.smeLoan.contractId));
                  dispatch(displayNotification('Loan Started Successfully', 'success'));
                } else {
                  throw result.error;
                }
              })
              .catch(error => {
                const errmsg = (error.error && error.error.errmsg) || error.errmsg || 'Loan Starting failed';
                dispatch(addNewDirectDebitError(errmsg));
                dispatch(displayNotification(errmsg, 'error'));
              });

          }
        });
    });
  };

  // const payOutToUpdate = {
  //   condition: { contractId, type: 'pay-out', },
  //   data: { plannedDate: moment(systemDate).format('YYYY-MM-DD'), }
  // };

  // return async dispatch => {
  //   await fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/start-loan', {
  //     method: 'post',

  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json'
  //     },

  //     body: JSON.stringify({
  //       contractId: contractId,
  //       loanFrequency: frequency
  //     })
  //   })
  //     .then(res => res.json())

  //     .then(result => {
  //       if (result.success) {

  //         const maturityDate = result.data.loanEndDate;

  //         if (!maturityDate) throw Object.assign(new Error(), { error: { errmsg: 'Maturity Date Not Found!' } });

  //         return fetch(LOAN_MANAGEMENT_API + '/sme-loans/contract-id/' + contractId, {
  //           method: 'put',
  //           headers: {
  //             Accept: 'application/json',
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify({
  //             maturityDate: maturityDate,
  //             shouldCalculateAPR: false
  //           })
  //         });
  //       }
  //       throw result;

  //     })
  //     .then(res => res.json())
  //     .then((result) => {
  //       if (result.success) {
  //         dispatch(updatePayoutTransaction(payOutToUpdate));
  //         dispatch(createPaymentOrder({ ...paymentOrderData, date: moment(systemDate).format('YYYY-MM-DD') }));
  //         dispatch(findAndUpdateLoan(result.data.smeLoan));
  //         dispatch(requestDirectDebits(contractId));
  //         dispatch(getCalculatedDataOfLoanTransactions(result.data.smeLoan.contractId));
  //         dispatch(getSingleLoanOverviewData(result.data.smeLoan.contractId));
  //         dispatch(displayNotification('Loan Started Successfully', 'success'));
  //       } else {
  //         throw result.error;
  //       }
  //     })
  //     .catch(error => {
  //       const errmsg = (error.error && error.error.errmsg) || error.errmsg || 'Loan Starting failed';
  //       dispatch(addNewDirectDebitError(errmsg));
  //       dispatch(displayNotification(errmsg, 'error'));
  //     });
  // };
};

const calculateNewBalance = (smeLoanTransactionId, status, contractId) => {
  return async dispatch => {

    const requestData = {
      url: DIRECT_DEBITS_API + '/sme-loan-transaction/calculate-new-balance',
      body: { smeLoanTransactionId, status, contractId }
    };

    try {
      await httpService.put(requestData, dispatch);
      return true;
    }
    catch (error) {
      console.error('calculateNewBalance', error);
    }
  };
};

const createSmeLoanTransaction = transaction => {

  const requestData = {
    url: DIRECT_DEBITS_API + ('/sme-loan-transaction/create-single-sme-loan-transaction'),
    body: transaction
  };
  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.error('createSmeLoanTransaction', error);
          reject(error);
        });
    });
  };
};

const createOrUpdateSmeLoanTransaction = (transaction, processType) => async dispatch => {

  const requestData = {
    url: API_GATEWAY_URL + '/create-update-sme-loan-transaction',
    body: {
      smeLoanTransaction: transaction,
      processType
    }
  };

  try {
    const response = await httpService.post(requestData, dispatch);
    if (transaction.status === 'deleted') {
      dispatch({ type: FIND_AND_REMOVE_TRANSACTION, id: transaction.id });
    } else {
      dispatch(findAndUpdateTransaction(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('createOrUpdateSmeLoanTransaction', error);
    throw error;
  }
};

// const requestOverviewData = (contractId) => {

//   return async dispatch => {

//     await fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/overview/unique-id/' + contractId)
//       .then(res => res.json())
//       .then(result => {

//         dispatch(requestConnectOverviewData(result.data.overview));
//         return result.data;
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request overview data - Unexpected error occured!', 'error'))
//       });
//   };
// };

const processDirectDebits = (directdebits, contractID) => {
  return {
    type: PROCESS_DIRECTDEBITS,
    directdebits,
    contractID
  };
};

const clearDirectDebits = () => ({ type: CLEAR_DIRECTDEBITS });

const processSmeMandates = smemandates => {
  return {
    type: PROCESS_SME_MANDATES,
    smemandates
  };
};

// const connectToDirectDebit = (directdebits, connectAmount) => {
//   return {
//     type: CONNECT_TO_DIRECTDEBIT,
//     directdebits,
//     connectAmount
//   };
// };

// const connectAmount = connectAmount => {
//   return {
//     type: CONNECT_AMOUNT,
//     connectAmount
//   };
// };

// const statusSaveConnectDirectDebits = statusSaveDDConnect => {
//   return {
//     type: SAVE_CONNECT_DIRECTDEBITS,
//     statusSaveDDConnect
//   }
// }

// const processDirectDebitsByIban = directdebitsbycounterparty => {
//   return {
//     type: LOAD_COUNTER_PARTY_DIRECT_DEBITS,
//     directdebitsbycounterparty,
//     contractId: (directdebitsbycounterparty.ddList && directdebitsbycounterparty.ddList.length > 0) ?
//       directdebitsbycounterparty.ddList[0].contractId : undefined
//   }
// }

const addNewDirectDebitError = error => {
  return {
    type: ADD_NEW_DIRECT_DEBIT_ERROR,
    error
  };
};

const clearDirectDebitError = error => {
  return {
    type: CLEAR_DIRECT_DEBIT_ERROR,
    error
  };
};

const findAndUpdateTransaction = transaction => {
  return {
    type: FIND_AND_UPDATE_TRANSACTION,
    transaction
  };
};

// const requestConnectOverviewData = (overviewData) => {
//   return {
//     type: GET_CONNECT_OVERVIEW_DATA,
//     overviewData
//   }
// };

const reactivateSmeLoanTransactions = (loanId, transactionsList, transactionsFrequency, reactivateType, country = 'NL') => {

  const requestData = {
    url: API_GATEWAY_URL + '/reactivate-sme-loan-transactions',
    body: {
      "loanId": loanId,
      "transactionsIds": transactionsList,
      "frequency": transactionsFrequency,
      "reactivateType": reactivateType,
      "country": country
    }
  };

  return dispatch => {

    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch, true)
        .then((response => {
          if (!response.success) throw response;
          if (response.data && response.data.length > 0) {
            dispatch(displayNotification('Transaction reactivated successfully', 'success'));
          } else {
            dispatch(displayNotification('Process completed', 'info'));
          }

          dispatch(findAndUpdateTransaction(response.data));
          resolve(response.data);
        }))
        .catch(error => {
          dispatch(displayNotification('Unexpected error occured while reactivating', 'error'));
          console.error('reactivateSmeLoanTransactions', error);
          reject(error);
        });
    });
  };
};

const updatePayoutTransaction = (transactionObj) => {

  const requestData = {
    url: DIRECT_DEBITS_API + '/sme-loan-transaction/update-single-transaction',
    body: transactionObj
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.put(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(displayNotification('PayOut Planned Date Updated', 'success'));
          } else {
            dispatch(displayNotification('Update PayOut Planned Date - Unexpected error occured', 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('updatePayoutTransaction - Unexpected error occured', 'error'));
        });
    });
  };

};

const getSmeLoanTransactions = (data) => {

  return dispatch => {

    const transactionUpdateRequestData = {
      url: DIRECT_DEBITS_API + (`/sme-loan-transaction/?${util.addQueryParams(data)}`),
    };

    return new Promise((resolve, reject) => {
      return httpService.get(transactionUpdateRequestData, dispatch)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error('connectUnknownSmeLoanTransaction', error);
          reject(error);
        });
    });

  };
};

const checkFailedSmeLoanTransactions = (data) => async dispatch => {
  const requestData = {
    url: API_GATEWAY_URL + '/sme-loans-failed-transactions-by-contract-id',
    body: data
  };

  try {
    const response = await httpService.post(requestData, dispatch);
    return response.data;
  } catch (error) {
    console.error('checkFailedSmeLoanTransactions', error);
    throw error;
  }
};

export {
  requestDirectDebits,
  processDirectDebits,
  clearDirectDebits,
  requestSmeMandates,
  processSmeMandates,
  requestDirectDebitsByContract,
  // processConnectToDirectDebit,
  connectUnknownSmeLoanTransaction,
  settleUnknownAsPatialPayment,
  // connectToDirectDebit,
  // processConnectAmount,
  // connectAmount,
  // saveConnectDirectDebits,
  // statusSaveConnectDirectDebits,
  // requestDirectDebitsByIban,
  requestDirectDebitsByMandate,
  terminateDirectDebits,
  addManualCollectionDirectDebit,
  addNewDirectDebitError,
  clearDirectDebitError,
  startLoanAction,
  // updatePartialPaymentOnSmeLoanTransaction,
  findAndUpdateTransaction,
  // requestOverviewData,
  createSmeLoanTransaction,
  reactivateSmeLoanTransactions,
  createOrUpdateSmeLoanTransaction,

  getSmeLoanTransactions,
  checkFailedSmeLoanTransactions,
};
