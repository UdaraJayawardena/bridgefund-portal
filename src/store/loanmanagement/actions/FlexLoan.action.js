import httpService from '../service/httpService';

import ENV from '../../../config/env';
import { encodeQueryData } from 'lib/loanmanagement/utility';

import {
  SET_FLEX_LOAN_OVERVIEW_DATA,
  CLEAR_FLEX_LOAN_OVERVIEW_DATA, SET_FLEX_LOAN_WITHDRAWALS,
  CLEAR_FLEX_LOAN_WITHDRAWALS, SET_ALL_FLEX_LOANS,SET_INVERS_CONSENTS_FOR_SME
} from "../constants/FlexLoan";

import { displayNotification } from './Notifier';
import { requestDirectDebits } from './SmeLoanTransaction';
import { getSmeLoanHistoriesByContractId } from './SmeLoanHistory';

export const createSmeFlexLoanWithdrawal = (params) => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.API_GATEWAY_URL}/create-sme-flex-loan-withdrawal`,
        body: { ...params }
      };

      return httpService.post(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            dispatch(displayNotification('Sme Flex Loan Withdrawal - Success!', 'success'));
            resolve(response);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loan Withdrawal - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

//get-flex-loan-outstanding-amount

export const getFlexLoanOutstandingAmount = (contractId) => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.API_GATEWAY_URL}/get-flex-loan-outstanding-amount?contractId=${contractId}`
        // url : `${ENV.DIRECT_DEBITS_URL}/sme-loan-transaction/get-flex-loan-outstanding-amount?contractId=${contractId}`
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            resolve(response.data.outstanding);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loan Withdrawal - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const getFlexLoanLatestWithdrawalOrder = (contractId) => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.DIRECT_DEBITS_URL}/sme-loan-withdrawal/get-latest?contractId=${contractId}`
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            resolve(response.data);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loan Withdrawal - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const getFlexLoanOverviewData = (contractId) => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.API_GATEWAY_URL}/sme-flex-loan-transactions-overview?uniqueId=${contractId}`
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.data) {

            dispatch({
              type: SET_FLEX_LOAN_OVERVIEW_DATA,
              payload: response.data
            });

            dispatch(requestDirectDebits(contractId));

            dispatch(getSmeLoanHistoriesByContractId(contractId));

            resolve(response.data);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loan Overview Data - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};


export const getSmeFlexLoanFees = (contractId) => {
  return async dispatch => {
    const requestData = { url: ENV.API_GATEWAY_URL + '/sme-flex-loan-transactions-overview?uniqueId=' + contractId };
    return await httpService.get(requestData, dispatch)
      .then(result => {
        return result.data;
      })
      .catch((error) => {
        console.error('getSmeFlexLoanFeesAndTransactions', error);
        return null;
      });
  };
};

export const getWithdrwalsforSelectedLoan = (contractId) => {
  const condition = { contractId };
  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.DIRECT_DEBITS_URL}/sme-loan-withdrawal/?condition=${JSON.stringify(condition)}`
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.data) {

            dispatch({
              type: SET_FLEX_LOAN_WITHDRAWALS,
              payload: response.data
            });

            resolve(response.data);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loan withdrawals Data - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const getAllFlexloans = () => {

  const condition = { type: 'flex-loan' };

  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${ENV.LOAN_MANAGEMENT_URL}/sme-loans/?condition=${JSON.stringify(condition)}`
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {

          if (response && response.data) {

            dispatch({
              type: SET_ALL_FLEX_LOANS,
              payload: response.data
            });

            resolve(response.data);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Sme Flex Loans - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const startRevison = (requestBody) => dispatch => {

  const request = {
    url: `${ENV.INITIATION_GATEWAY_URL}/start-instance-by-key`,
    body: requestBody
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);

  } catch (error) {
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getUserTasks = (processDefinitionKey, contractId, taskDefinitionKey) => async dispatch => {

  const query = {};

  if (processDefinitionKey) query.processDefinitionKey = processDefinitionKey;
  if (contractId) query.processInstanceBusinessKey = contractId;
  if (taskDefinitionKey) query.taskDefinitionKey = taskDefinitionKey;

  const request = {
    url: `${ENV.INITIATION_GATEWAY_URL}/get-user-tasks?` + encodeQueryData(query)
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const approveRevision = (requestBody) => async dispatch => {

  const requestData = {
    url: `${ENV.INITIATION_GATEWAY_URL}/complete-user-task-by-key`,
    body: requestBody
  };
  try {

    return httpService.post(requestData, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getProcessList = (processInstanceBusinessKey, processDefinitionKey, processState) => async dispatch => {

  const query = {};

  if (processInstanceBusinessKey) query.processInstanceBusinessKey = processInstanceBusinessKey;
  if (processDefinitionKey) query.processDefinitionKey = processDefinitionKey;
  if (processState) query.processState = processState;

  const request = {
    url: `${ENV.INITIATION_GATEWAY_URL}/get-process-list?` + encodeQueryData(query)
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);


  } catch (error) {
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const updateFlexLoan = (requestData) => dispatch => {

  const request = {
    url: `${ENV.API_GATEWAY_URL}/update-sme-loan`,
    body: requestData
  };

  try {
    return httpService.post(request, dispatch)
      .then((response) => {
        dispatch(displayNotification('Successfully updated the flex-loan !', 'success'));
        return response;
      })
      .catch((error) => error);

  } catch (error) {
    throw Error('Unexpected error occured! Please try again.');
  }

};

export const getInversConsentsForLoanBySme = (smeId) => {
  return async dispatch => {
    const requestData = { url: ENV.INITIATION_GATEWAY_URL + '/get-inverse-consents-by-sme?smeId=' + smeId };
    return await httpService.get(requestData, dispatch)
      .then(result => {
        dispatch({ type: SET_INVERS_CONSENTS_FOR_SME, payload: result.data });
        return result.data;
      })
      .catch((error) => {
        console.error('getInverseConsentsForLoanBySme', error);
        return null;
      });
  };
};

export const getGetCustomerLoans = (customerId, contractId) => {
 return async dispatch => {
   const requestData = { url: ENV.API_GATEWAY_URL + '/bf-management/sme-loans?customerId='+customerId + '&contractId=' + contractId };
   return await httpService.get(requestData, dispatch)
     .then(result => {
       return result.data[0];
     })
     .catch((error) => {
       console.error('getGetCustomerLoans', error);
       return null;
     });
 };
};

export const addFlexLoanWithdrawal = (withdrawalData) => {
 return async dispatch => {
  const requestData = { 
     url: ENV.API_GATEWAY_URL + '/bf-management/sme-loans/'+withdrawalData.contractId+'/'+withdrawalData.contractIdExtension+'/withdrawal' ,
     body: withdrawalData
  };
  return await httpService.post(requestData, dispatch)
    .then(response => {
      return response.data;
    })
    .catch((error) => {
      console.error('addFlexLoanWithdrawal', error);
      return null;
    });
  };
};

export const clearFlexLoanOverviewData = () => { return { type: CLEAR_FLEX_LOAN_OVERVIEW_DATA }; };

export const clearWithdrwalsforSelectedLoan = () => { return { type: CLEAR_FLEX_LOAN_WITHDRAWALS }; };

