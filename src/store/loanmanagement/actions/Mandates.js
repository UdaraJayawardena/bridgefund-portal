import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  PROCESS_MANDATES,
  TOGGLE_ADD_NEW_MANDATE,
  SHOW_ADD_CONTRACT,
  SHOW_ADD_FLEX_CONTRACT,
  SHOW_ADD_TRANSACTION,
  SELECT_MANDATE,
  DE_SELECT_MANDATE,
  SAVE_MANDATE_ERROR,
  CLEAR_MANDATE_ERROR,
  SAVE_MANDATE_IS_BUSSY,
  CLEAR_BIC_FIELD,
  CLEAR_MANDATES
} from '../constants/Mandates';

import { createNewMandate, updateMandate, requestSmeMandates } from "./SmeMandates";
import moment from 'moment';

const api = ENV.DIRECT_DEBITS_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;
const mandateServiceUrl = ENV.MANDATE_SERVICE_URL;
// const requestMandates = mandateId => {
//   return async dispatch => {
//     //fetch(api + '/mandates/' + mandateId)
//     await fetch(api + '/sme-mandates/sme-id/' + mandateId)
//       .then(res => res.json())

//       .then(result => {
//         return dispatch(processMandates(result.data));
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request Mandates - Unexpected error occured.', 'error'))
//       });
//   };
// };

const requestMandates = customerId => {

  const requestData = { url: `${apiGatewayUrl}/Mandate-by-sme-id/?smeId=${customerId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          resolve(result.data);
          return dispatch(processMandates(result.data));
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
          reject(error);
        });
    });
  };

};

const saveNewMandate = newMandate => {
 
    const data = {
   url: apiGatewayUrl + ('/create-new-mandate'),
    body: newMandate
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          if (result) {
            dispatch(displayNotification('Mandate created!', 'success'));
            dispatch(requestSmeMandates(newMandate.customerId));
            dispatch(createMandatebussy());
            dispatch(clearBicField());
          } else {
            dispatch(displayNotification(result.error.errmsg, 'error'));
            dispatch(createMandateError(result.error.errmsg));
            dispatch(createMandatebussy());
            dispatch(clearBicField());
          }
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
          dispatch(createMandatebussy());
          reject(error);
        });
    });
  };

};

const activateSepaMandate = (mandateId, customerId) => {
 
  const data = {
    url: `${apiGatewayUrl }/activate-sepa-mandate`,
     body: {
      filter: {
        mandateId: mandateId,
        customerId: customerId
      },
      update: {
        status: 'ACTIVE'
      }
     }
   };

return dispatch => {
  return new Promise((resolve, reject) => {

    return httpService.post(data, dispatch)
      .then(result => {
        if (result) {
          dispatch(displayNotification('Mandate Activated successfully!', 'success'));
          dispatch(updateMandate(result.data));
          resolve(result);
      
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          reject(result.error.errmsg);
        }
      })
      .catch(error => {
        dispatch(displayNotification('Sepa Mandate Activation - Unexpected error occured.', 'error'));
        reject(error);
      });
  });
};

};

const setMandateToEmandate = mandateId => {

  const data = {
    url: `${apiGatewayUrl }/set-mandate-to-emandate`,
     body: {
      filter: {
        mandateId: mandateId
      },
      update: {
        eMandate: true
      }
     }
   };
   return dispatch => {
    return new Promise((resolve, reject) => {
  
      return httpService.post(data, dispatch)
        .then(result => {
          if (result) {
            
            dispatch(updateMandate(result.data));
        
          } else {
            dispatch(displayNotification(result.error.errmsg, 'error'));
        
          }
        })
        .catch(error => {
          dispatch(displayNotification('Set mandate to e-mandate - Unexpected error occured.', 'error'));
          reject(error);
        });
    });
  };

};

const downloadMandate = (mandateId, documentId) => {

  const requestData = { url: `${apiGatewayUrl}/download-mandate?mandateId=${mandateId}&documentId=${documentId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.data && result.data.documentUrl) {
            const documentUrl = result.data.documentUrl;
            const a = document.createElement("a");
            a.href = documentUrl;
            const fileName = documentUrl.split("/").pop();
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(documentUrl);
            a.remove();
            dispatch(displayNotification('Mandate Download!', 'success'));
  
          } else {
            dispatch(displayNotification('Mandate download - Unexpected error occured.', 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
          reject(error);
        });
    });
  };

};

const requestMandate = (mandateId) => {

  const requestData = { url: apiGatewayUrl + `/request-mandate?mandateId=${mandateId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if(result){
          dispatch(createNewMandate(result.data));
          }
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
        });
    });
  };

};

const addNewLoanRequestId = (mandateId, customerId, newLoanReqId, updatedLinkedToLoanReqIds, ibanNumber) => {
 
  const data = {
    url: `${apiGatewayUrl}/add-new-loan-req-id`,
     body: {
      
        mandateId: mandateId,
        customerId: customerId,
        newLoanReqId: newLoanReqId,
        updatedLinkedToLoanReqIds: updatedLinkedToLoanReqIds,
        ibanNumber: ibanNumber,
     }
   };

return dispatch => {
  return new Promise((resolve, reject) => {

    return httpService.post(data, dispatch)
      .then(result => {
        if (result) {
          const statusList = ['open', 'paused', 'failed', 'frequently-failed', 'rejected', 'frequently-rejected'];

            const queryParams = {
              query: {
                contractId: newLoanReqId,
                status: { $in : statusList }
              },
              updates: {
                mandateId: result.data.mandateId,
                mandate: result.data._id 
              }
            };
          dispatch(updateSmeLoanTransations(queryParams, 'add-new-loan-req-id-to-mandate'));
          dispatch(displayNotification('Added new loan request Id successfully!', 'success'));
          dispatch(requestSmeMandates(customerId));
          resolve(result);
      
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          reject(result.error.errmsg);
        }
      })
      .catch(error => {
        dispatch(displayNotification(`Error Add new loan request Id - ${error.error.errmsg}`, 'error'));
        reject(error);
      });
  });
};

};

const inactivateMandate = (mandateId, customerId) => {
 
  const data = {
    url: `${apiGatewayUrl}/update-single-mandate`,
     body: {
      filter: {
        mandateId: mandateId,
        customerId: customerId
      },
      update: {
        status: 'INACTIVE'
      }
     }
   };

return dispatch => {
  return new Promise((resolve, reject) => {

    return httpService.post(data, dispatch)
      .then(result => {
        if (result) {
          dispatch(displayNotification('Mandate Inactivated successfully!', 'success'));
          dispatch(requestSmeMandates(customerId));
          resolve(result);
      
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          reject(result.error.errmsg);
        }
      })
      .catch(error => {
        dispatch(displayNotification('Mandate inactivation - Unexpected error occured.', 'error'));
        reject(error);
      });
  });
};

};

const activateSelectedMandate = params => {

  const data = {
    url: `${apiGatewayUrl}/activate-selected-mandate`,
     body: params
   };
   return dispatch => {
    return new Promise((resolve, reject) => {
  
      return httpService.post(data, dispatch)
        .then(result => {
          if (result) {

            const statusList = ['open', 'paused', 'failed', 'frequently-failed', 'rejected', 'frequently-rejected'];

            const queryParams = {
              query: {
                mandateId: result.data.inactivatedMandate,
                status: { $in : statusList }
              },
              updates: {
                mandateId: result.data.activatedMandate.mandateId,
                mandate: result.data.activatedMandate._id 
              }
            };

            dispatch(updateSmeLoanTransations(queryParams, 'transfer-to-new-mandate'));
            dispatch(requestSmeMandates(params.customerId));
            dispatch(displayNotification(`Mandate "${result.data.activatedMandate.mandateId}" is Activated successfully! \n
              SME loan request ids- [${result.data.linkedToLoanRequests}] has been linked with activated mandate.`, 'success', 4300));
          } else {
            dispatch(displayNotification(`There is an error occurred when activating selected mandate. error - ${result.error.errmsg}`, 'error'));
          }
        })
        .catch(err => {
          dispatch(displayNotification(`Error activating mandate - ${err.error.errmsg}`, 'error'));
          reject(err);
        });
    });
  };

};

const updateSmeLoanTransations = (params, action = null) => {
  
  const data = {
    url: `${apiGatewayUrl}/direct-debits/sme-loan-transaction/update-multiple-transactions`,
     body: params
   };
   return dispatch => {
    return new Promise((resolve, reject) => {
  
      return httpService.post(data, dispatch)
        .then(result => {
          if (result) {
            if(action === 'transfer-to-new-mandate'){
              dispatch(displayNotification(`SME loan transactions related to ${params.query.mandateId} is successfully
                updated to ${params.updates.mandateId}`, 'success', 4300));
            }else if(action === 'add-new-loan-req-id-to-mandate'){
              dispatch(displayNotification(`SME loan transactions related to ${params.query.contractId} is successfully
                updated to ${params.updates.mandateId}`, 'success', 4300));
            }
            else {
              dispatch(displayNotification(`SME loan transactions updated successfully`, 'success'));
            }
             
          } else {
            dispatch(displayNotification(`There is an error occurred when updating sme loan transactions. 
              error - ${result.error.errmsg}`, 'error'));
          }
        })
        .catch(err => {
          dispatch(displayNotification(`Error when update SmeLoan Transations - ${err.error.errmsg} `, 'error'));
          reject(err);
        });
    });
  };

};

const updateMandateStatus = (mandateId, status, customerId) => {
  const data = {
    url: `${apiGatewayUrl }/update-single-mandate`,
     body: {
      filter: {
        mandateId: mandateId
      },
      update: {
        status: status
      }
     }
   };

return dispatch => {
  return new Promise((resolve, reject) => {

    return httpService.post(data, dispatch)
      .then(result => {
        if (result) {
          dispatch(displayNotification('update mandate status successfully!', 'success'));
          dispatch(requestSmeMandates(customerId));
          resolve(result);
      
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          reject(result.error.errmsg);
        }
      })
      .catch(error => {
        dispatch(displayNotification('update mandate status - Unexpected error occured.', 'error'));
        reject(error);
      });
  });
};

};

const changeMandateStatusToSigningPending = (mandateId, customerId) => {
 
  const data = {
    url: `${apiGatewayUrl}/update-single-mandate`,
     body: {
      filter: {
        mandateId: mandateId,
        customerId: customerId
      },
      update: {
        status: 'SIGNING_PENDING'
      }
     }
   };

return dispatch => {
  return new Promise((resolve, reject) => {

    return httpService.post(data, dispatch)
      .then(result => {
        if (result) {
          dispatch(displayNotification('Mandate status change to signing pending', 'success'));
          dispatch(requestSmeMandates(customerId));
          resolve(result);
      
        } else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          reject(result.error.errmsg);
        }
      })
      .catch(error => {
        dispatch(displayNotification('Mandate status change to signing pending - Unexpected error occured.', 'error'));
        reject(error);
      });
  });
};

};



// AFter save or cancel when create a new mandate, BIC field should be empty
const clearBicField = () => {
  return {
    type: CLEAR_BIC_FIELD
  };
};

// const createNewMandate = newMandate => {
//   return {
//     type: SAVE_NEW_MANDATE,
//     newMandate
//   };
// };

const clearMandateError = () => {
  return {
    type: CLEAR_MANDATE_ERROR
  };
};

const createMandateError = mandateSaveErr => {
  return {
    type: SAVE_MANDATE_ERROR,
    mandateSaveErr
  };
};

const createMandatebussy = () => {
  return {
    type: SAVE_MANDATE_IS_BUSSY
  };
};

const processMandates = mandates => {
  return {
    type: PROCESS_MANDATES,
    mandates
  };
};

const toggleAddNew = () => {
  return {
    type: TOGGLE_ADD_NEW_MANDATE
  };
};

const showAddContact = () => {
  return {
    type: SHOW_ADD_CONTRACT
  };
};

const showAddFlexContact = () => {
  return {
    type: SHOW_ADD_FLEX_CONTRACT
  };
};

const showAddTransaction = () => {
  return {
    type: SHOW_ADD_TRANSACTION
  };
};

const selectMandate = mandate => {
  return {
    type: SELECT_MANDATE,
    mandate
  };
};

const deSelectMandate = () => {
  return {
    type: DE_SELECT_MANDATE
  };
};

const clearMandates = () => {
  return {
    type: CLEAR_MANDATES
  };
};

export {
  requestMandates,
  processMandates,
  toggleAddNew,
  saveNewMandate,
  showAddContact,
  showAddTransaction,
  selectMandate,
  deSelectMandate,
  clearMandateError,
  createMandatebussy,
  clearBicField,
  clearMandates,
  activateSepaMandate,
  setMandateToEmandate,
  showAddFlexContact,
  downloadMandate,
  addNewLoanRequestId,
  inactivateMandate,
  activateSelectedMandate,
  updateSmeLoanTransations,
  updateMandateStatus,
  changeMandateStatusToSigningPending
};
