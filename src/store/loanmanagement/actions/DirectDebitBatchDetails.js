import ENV from "../../../config/env";
import { displayNotification } from "./Notifier";
import {
  SET_DIRECT_DEBIT_LOGS, // ADD_ITEM_TO_PROCESS_LIST,
  SWITCH_IS_LOADING
} from '../constants/DirectDebitBatch';
import util from "lib/loanmanagement/utility";
import { httpService } from "../service/httpService";

const api = ENV.DIRECT_DEBITS_URL;
const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

export const getAllDirectDebitBatchDetails = (date) => {
  const url = date ? `/direct-debit-batch-process/batch-details?date=${date}` : '/direct-debit-batch-process/batch-details';
  return async dispatch => {
    await fetch(api + url)
      .then(res => { return res.json(); })
      .then(result => {
        if (result.success) {
          dispatch(SetDirectDebitBatchLogs(result.data.batch));
        } else {
          dispatch(SetDirectDebitBatchLogs({}));
          dispatch(displayNotification(result.error.errmsg, 'error'));
        }
      })
      .catch(error => {
        console.error("getAllDirectDebitBatchDetails", error);
        dispatch(
          displayNotification(
            "Direct Debit Batch Details - Unexpected Error occured",
            "error"
          )
        );
      });
  };
};

// export const registerTransactions = (unselectedBatchDetailIds) => {
//   return async dispatch => {
//     dispatch(isProcessingBatchDetails());
//     await fetch(api + '/direct-debit-batch-process/register-direct-debits/',
//       {
//         method: 'post',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json'
//         },

//         body: JSON.stringify({
//           unselectedBatchDetailIds: unselectedBatchDetailIds
//         })
//       })
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Successfully proceed the batch', 'success'));
//         } else {
//           console.error(result);
//           dispatch(displayNotification('Batch processing error', 'error'));
//         }
//       })
//       .catch(error => {
//         console.error(error);
//         dispatch(displayNotification('Direct Debit Batch Processing - Unexpected Error Occured', 'error'));
//       })
//       .finally(() => {
//         dispatch(getAllDirectDebitBatchDetails());
//         dispatch(isProcessingBatchDetails());
//       });
//   };
// }

// export const registerBatch = (date = null) => {
//   return async dispatch => {
//     dispatch(isProcessingBatchDetails());
//     await fetch(api + '/direct-debit-batch-process/register-batch', {
//       method: 'post',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//     })
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Successfully registered the batch', 'success'));
//         } else {
//           console.error(result);
//           dispatch(displayNotification('Batch register error', 'error'));
//         }
//       })
//       .catch(error => {
//         console.error('Register Batch', error);
//         dispatch(displayNotification('Direct Debit Batch Registering - Unexpected Error Occured', 'error'));
//       })
//       .finally(() => {
//         dispatch(getAllDirectDebitBatchDetails());
//         dispatch(isProcessingBatchDetails());
//       });
//   };
// };

export const createXML = (unselectedBatchDetailIds, date) => {
  return async dispatch => {
    dispatch(isProcessingBatchDetails());
    await fetch(api + '/direct-debit-batch-process/register-and-create-batch?date=' + date, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        unselectedBatchDetailIds: unselectedBatchDetailIds
      })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(displayNotification('Successfully registered the batch', 'success'));
        } else {
          console.error(result);
          dispatch(displayNotification('Batch register error', 'error'));
        }
      })
      .catch(error => {
        console.error('Register Batch', error);
        dispatch(displayNotification('Direct Debit Batch Registering - Unexpected Error Occured', 'error'));
      })
      .finally(() => {
        dispatch(getAllDirectDebitBatchDetails(date));
        dispatch(isProcessingBatchDetails());
      });
  };
};

// export const revertTransactions = (batchId) => {
//   return async dispatch => {
//     dispatch(isProcessingBatchDetails());
//     await fetch(api + '/direct-debit-batch-process/revert-transactions',
//       {
//         method: 'post',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           batchId: batchId
//         })
//       })
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Successfully reverted the transactions', 'success'));
//         } else {
//           console.error(result);
//           dispatch(displayNotification(result.error.errmsg, 'error'));
//         }
//       })
//       .catch(error => {
//         console.error('Revert Transactions', error);
//         dispatch(displayNotification('Batch Process Revert Transactions - Unexpected Error Occured', 'error'));
//       })
//       .finally(() => {
//         dispatch(getAllDirectDebitBatchDetails());
//         dispatch(isProcessingBatchDetails());
//       });
//   }
// }

// export const registerTransaction = (batchDetailId) => {
//   return async dispatch => {
//     dispatch(isProcessingBatchDetails());
//     await fetch('register-transaction',
//       {
//         method: 'post',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           batchDetailId: batchDetailId
//         })
//       })
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Successfully registered the transaction', 'success'));
//         } else {
//           console.error(result);
//           dispatch(displayNotification(result.error.errmsg, 'error'));
//         }
//       })
//       .catch(error => {
//         console.error('Register Transaction', error);
//         dispatch(displayNotification('Register Transaction - Unexpected Error Occured', 'error'));
//       })
//       .finally(() => {
//         dispatch(getAllDirectDebitBatchDetails());
//         dispatch(isProcessingBatchDetails());
//       });
//   }
// }

export const getLastestBatch = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const url = API_GATEWAY_URL + '/get-latest-batch?' + util.addQueryParams(params);
      const requestData = { url };
      return httpService.get(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('getLastestBatch', err);
          reject(err);
        });
    });
  };
};

export const GetBatchByCreationDate = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      // const url = API_GATEWAY_URL + '/get-batch-by-creation-date?' + util.addQueryParams(params);
      const requestData = { url : API_GATEWAY_URL + '/get-batch-by-creation-date?' + util.addQueryParams(params) };
      return httpService.get(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('GetBatchByCreationDate', err);
          reject(err);
        });
    });
  };
};

export const getTransactionsForBatchView = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { url : API_GATEWAY_URL + '/get-transactions-for-batch-view?' + util.addQueryParams(params) };
      return httpService.get(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('GetBatchByCreationDate', err);
          reject(err);
        });
    });
  };
};

export const getUpdateTransactionsCount = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { url : API_GATEWAY_URL + '/get-updated-transactions-count/' + params.id };
      
      return httpService.get(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('getUpdateTransactionsCount', err);
          reject(err);
        });
    });
  };
};

export const regenerateBatch = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { 
        url : API_GATEWAY_URL + '/re-generate-transaction-batch',
        body: { ...params, regenerate : true }
      };
      
      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('GetBatchByCreationDate', err);
          reject(err);
        });
    });
  };
};

export const approveBatch = (params) => {
  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { 
        url : API_GATEWAY_URL + '/approve-generated-batch',
        body: { ...params }
      };
      
      return httpService.post(requestData, dispatch)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          console.error('approveBatch', err);
          reject(err);
        });
    });
  };
};

export const SetDirectDebitBatchLogs = (logs) => {
  return {
    type: SET_DIRECT_DEBIT_LOGS,
    logs
  };
};
// export const SetItemToCHeckList = (logs) => {
//   return {
//     type: ADD_ITEM_TO_PROCESS_LIST,
//     logs
//   };
// };
export const isProcessingBatchDetails = () => {
  return { type: SWITCH_IS_LOADING };
};
