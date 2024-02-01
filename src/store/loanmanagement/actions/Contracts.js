// import { requestPayment } from './Payments';
import { displayNotification } from './Notifier';
import ENV from '../../../config/env';
import { httpService } from '../service/httpService';

import {
  // PROCESS_CONTRACTS,
  // SAVE_NEW_CONTRACT,
  // SAVE_NEW_CONTRACT_BUSSY,
  // SHOW_TERMINATE_CONTRACT_MODAL,
  // SELECT_CONTRACT,
  // ADD_NEW_TRANSACTIONS_OF_CONTRACT,
  // SHOW_TEMPORARY_LOAN_STOP,
  // CLEAR_CONTRACTS,
  SET_OPPOTUNITY_DETAILS,
  CELAR_OPPOTUNITY_DETAILS,
  EDIT_CONTRACT_FIELD,
  RE_CALCULATE_TOTAL_INTEREST,
  STORE_BASE_RATE
} from '../constants/Contracts';

import { createUrl } from 'lib/crm/utility';

const api = ENV.CRM_GATEWAY_URL;
// const api = ENV.CUSTOMER_CONTRACTS_URL;

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

// const requestContracts = customerId => {
//   return async dispatch => {
//     await fetch(api + '/contracts/' + customerId)
//       .then(res => res.json())
//       .then(result => {
//         return dispatch(processContracts(result.data));
//       })
//       .catch(error => {
//         dispatch(displayNotification('Request contracts - Unexpected error occured!', 'error'))
//       });
//   };
// };

// const saveNewContract = (newContract, customerId) => {
//   return async dispatch => {
//     fetch(api + '/contracts?isTwikeyDissabled=true', {
//       method: 'post',

//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },

//       body: JSON.stringify(newContract)
//     })
//       .then(res => res.json())

//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Contract created', 'success'))
//           dispatch(createNewContract(result.data.contract));
//           dispatch(requestPayment(customerId));
//         } else {
//           let error = result.error.errmsg;
//           if (result.error.errlogs) {
//             error = result.error.errlogs[0].error.message ? result.error.errlogs[0].error.message : error
//           }
//           dispatch(displayNotification(result.message, 'error'))
//           dispatch(displayNotification(result.error.errmsg, 'error'))
//           dispatch(displayNotification(error, 'error'))
//         }

//         dispatch(createNewContractBusy());
//       })
//       .catch(error => {
//         dispatch(displayNotification('Save contract - Unexpected error occured', 'error'))
//       });
//   };
// };

// const terminateContract = (contractData, customerId) => {
//   return async dispatch => {
//     fetch(api + '/contracts/terminate', {
//       method: 'post',

//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },

//       body: JSON.stringify(contractData)
//     })
//       .then(res => res.json())

//       .then(result => {
//         if (result.success) {
//           dispatch(showTerminateContractModal())
//           dispatch(displayNotification('Contract terminated!', 'success'))
//           dispatch(requestContracts(customerId));
//           dispatch(requestPayment(customerId));
//         }
//         else {
//           let error = result.error.errmsg;
//           if (result.error.errlogs) {
//             error = result.error.errlogs[0].error.message ? result.error.errlogs[0].error.message : error
//           }
//           dispatch(displayNotification(result.message, 'error'))
//           dispatch(displayNotification(result.error.errmsg, 'error'))
//           dispatch(displayNotification(error, 'error'))
//         }
//       })
//       .catch(error => {
//         dispatch(displayNotification('Terminate contract - Unexpected error occured.', 'error'))
//       });
//   };
// };

const requestContraDetailsFromOppotunity = (oppotunityId, baseRateChanged = false) => {
  return dispatch => {

     const requestData = {
      url: api + `/crm-management/vtiger-crm/potential/potentialno/${oppotunityId}`
    };
        
    return httpService.get(requestData, dispatch)
      // .then(res => res.json())
      .then(result => {
        if (result.success) {
          if(baseRateChanged){
            // recalculating total interest due to base rate changed
            dispatch(reCalcualteTotalInterest(result.data))
          }else{
            dispatch(saveOppotunityDetails(result.data));
          }
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
        }
      })
      .catch(error => {
        console.log('requestContraDetailsFromOppotunity', error);
        dispatch(clearOppotunityDetails());
        dispatch(displayNotification('Get Opportunity Details - Unexpected Error Occured', 'error'));
      })
  }
}

// const processContracts = contracts => {
//   return {
//     type: PROCESS_CONTRACTS,
//     contracts
//   };
// };

// const createNewContract = newContract => {
//   return {
//     type: SAVE_NEW_CONTRACT,
//     newContract
//   };
// };

// const createNewContractBusy = () => {
//   return {
//     type: SAVE_NEW_CONTRACT_BUSSY
//   };
// };

// const createNewTransactionsOfContract = newTransactionsOfContract => {
//   return {
//     type: ADD_NEW_TRANSACTIONS_OF_CONTRACT,

//     newTransactionsOfContract
//   };
// };

// const showTerminateContractModal = () => {
//   return {
//     type: SHOW_TERMINATE_CONTRACT_MODAL
//   };
// };

// const showHideTemporaryLoanStop = () => {
//   return {
//     type: SHOW_TEMPORARY_LOAN_STOP
//   };
// };

// const selectContract = contract => {
//   return {
//     type: SELECT_CONTRACT,
//     contract
//   };
// };

// const clearContracts = contracts => {
//   return {
//     type: CLEAR_CONTRACTS,
//     contracts
//   };
// };

const saveOppotunityDetails = oppotunityDetails => {
  return {
    type: SET_OPPOTUNITY_DETAILS,
    oppotunityDetails
  }
}
const clearOppotunityDetails = () => {
  return {
    type: CELAR_OPPOTUNITY_DETAILS
  }
}
const editContractField = (fieldName, fieldValue) => {
  return {
    type: EDIT_CONTRACT_FIELD,
    fieldName,
    fieldValue
  }
}

const getContract = (contractId, type) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL(`/get-contracts?contractId=${contractId}&fields=contractId`)
  };

  const flexLoanNotify = 'You must generate a contract in Contract-Dashboard before adding a Credit Line';
  const fixLoanNotify = 'You must generate a contract in Contract-Dashboard before adding a Loan';

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        const isContractExists = response.data.length;
        if (isContractExists === 0) {
          if (type === 'FLEX') {
            dispatch(displayNotification(flexLoanNotify, 'error'));
          } else if (type === 'FIX') {
            dispatch(displayNotification(fixLoanNotify, 'error'));
          }

          return 'CONTRACT-NOT-EXISTS';
        }
        return 'CONTRACT-EXISTS';

      })
      .catch((error) => error);

  } catch (error) {
    console.error('Contract Validation Error', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

const storeBaseRate = rate => {

  return {
    type : STORE_BASE_RATE,
    rate 
  }
  
}

const reCalcualteTotalInterest = oppotunity => {

  return {
    type : RE_CALCULATE_TOTAL_INTEREST,
    oppotunity 
  }
  
}

export {
  // requestContracts,
  // processContracts,
  // saveNewContract,
  // createNewContractBusy,
  // showTerminateContractModal,
  // selectContract,
  // terminateContract,
  // showHideTemporaryLoanStop,
  // clearContracts,
  requestContraDetailsFromOppotunity,
  clearOppotunityDetails,
  editContractField,
  getContract,
  reCalcualteTotalInterest,
  storeBaseRate
};
