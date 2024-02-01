// @ts-nocheck
import ENV from '../../../config/env';
import { httpService } from "../service/httpService";
import { displayNotification } from "./Notifier";
import { terminateDirectDebits, findAndUpdateTransaction, clearDirectDebits, processDirectDebits, requestDirectDebits } from './SmeLoanTransaction';
import { requestLoan } from './Loans';
import {
  SELECT_LOAN,
  CLEAR_LOANS,
  CLEAR_SELECTED_LOAN,
  PROCESS_SME_LOANS_BY_CUSTOMER,
  FIND_AND_UPDATE_LOAN,
  SAVE_NEW_SME_LOAN,
  SAVE_NEW_SME_LOAN_BUSY,
  SHOW_TERMINATE_SME_LOAN_MODAL,
  CLEAR_CALCULATED_DATA_OF_LOAN_TRANSACTIONS,
  GET_CALCULATED_DATA_OF_LOAN_TRANSACTIONS,
  SHOW_CANCEL_SME_LOAN_MODAL,
} from '../constants/SmeLoans';
import { getFlexLoanOverviewData,getInversConsentsForLoanBySme } from 'store/loanmanagement/actions/FlexLoan.action';

import { changeCustomerDetails } from "./HeaderNavigation";
import { requestMandates } from "./Mandates";
import { ENVIRONMENT } from "constants/loanmanagement/config";
import { smeLoanType } from 'constants/loanmanagement/sme-loan';

import util from "lib/loanmanagement/utility";

import { getCustomerByVTigerId } from 'store/crm/actions/Customer.action';

const api = ENV.LOAN_MANAGEMENT_URL;
// const directDebitApi = ENV.DIRECT_DEBITS_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;

// export const requestSmeLoans_ = customerId => {
//   return async dispatch => {
//     await fetch(api + '/sme-loans/sme-id/' + customerId)
//       .then(res => res.json())
//       .then(result => {
//         dispatch(processSmeLoans(result.data));
//         return result.data;
//       })
//       .catch(() => {
//         dispatch(displayNotification('Request SME LOANS - Unexpected error occured.', 'error'));
//         return [];
//       });
//   };
// };

export const requestSmeLoans = customerId => {

  const requestData = { url: apiGatewayUrl + `/Sme-loans-by-sme-id/?smeId=${customerId}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          // console.log(result, '...Sme-loans-by-sme-id/?smeId')
          dispatch(processSmeLoans(result.data));
          resolve(result.data);
          return result.data;
        })
        .catch(error => {
          dispatch(displayNotification('Request SME LOANS - Unexpected error occured.', 'error'));
          reject(error);
          return [];
        });
    });
  };

};

export const requestSmeLoan = (contractId, updateRedux = true) => {

  return async dispatch => {
    return await fetch(api + '/sme-loans/loans/' + contractId)
      .then(res => res.json())

      .then(result => {
        if (updateRedux) {
          dispatch(processSmeLoans([result.data]));
          dispatch(selectLoan(result.data));
          dispatch(getInversConsentsForLoanBySme(result.data.smeId));
        }
        return result.data;
      })
      .catch((error) => {
        dispatch(displayNotification('Request SME LOAN - Unexpected error occured.', 'error'));
        return error;
      });
  };

};

export const addNewSmeLoan = (newSmeLoan, smeMandate, otherValues, language) => {
  const addSmeLoan = {
    smeLoan: newSmeLoan,
    mandate: {
      _id: smeMandate._id,
      mandateId: smeMandate.mandateId,
      eMandate: smeMandate.eMandate
    },
    ...otherValues,
  };

  return dispatch => {
    return new Promise((resolve, reject) => {
      let smeMandates;
      const requestData = {
        url: `${apiGatewayUrl}/Mandate-by-sme-id/?smeId=${newSmeLoan.smeId}`
      };

      httpService.get(requestData, dispatch)
        .then((response) => {
          smeMandates = response.data;
          if (ENV === ENVIRONMENT.ACCEPTANCE && newSmeLoan.idRefinancedLoan) {
            addSmeLoan.mandate.mandateId = 'SBF-REHERMANADVIES-1';
          }

          const isValidMandate = smeMandates.reduce((isValid, mandate) => {
            return isValid || mandate.mandateId === smeMandate.mandateId;
          }, false);

          if (!isValidMandate) {
            dispatch(displayNotification('Save SME Loan - Invalid mandate for SME', 'error'));
            dispatch(createNewSmeLoanBusy());

          }
          else {
            const reqtData = {
              url: apiGatewayUrl + '/sme-loans',
              body: addSmeLoan
            };
            return httpService.post(reqtData, dispatch, language)
              .then(result => {
                if (result.success) {
                  dispatch(displayNotification('SME loan created', 'success'));
                  dispatch(addOrUpdateSmeLoan(result.data));
                  dispatch(createNewSmeLoanBusy());
                  resolve(result.data);
                  //return result.data;
                }
                // console.error(result.message, 'error');
                // dispatch(displayNotification(result.error.errmsg, 'error'));
                // dispatch(createNewSmeLoanBusy());
                //return null;


              })
              .catch((error) => {
                dispatch(displayNotification('Save SME Loan - Unexpected error occured', 'error'));
                dispatch(createNewSmeLoanBusy());
                reject(error);
                return null;
              });
          }


        });

    });

  };

  // return async dispatch => {

  //   const smeMandates = await fetch(ENV.DIRECT_DEBITS_URL + '/sme-mandates/sme-id/' + newSmeLoan.smeId)
  //     .then(res => res.json());

  //   if (ENV === ENVIRONMENT.ACCEPTANCE && newSmeLoan.idRefinancedLoan) {
  //     addSmeLoan.mandate.mandateId = 'SBF-REHERMANADVIES-1';
  //   }

  //   const isValidMandate = smeMandates.data.reduce((isValid, mandate) => {
  //     return isValid || mandate.mandateId === smeMandate.mandateId;
  //   }, false);

  //   if (!isValidMandate) {

  //     dispatch(displayNotification('Save SME Loan - Invalid mandate for SME', 'error'));
  //     dispatch(createNewSmeLoanBusy());

  //   } else {
  //     console.log('yes')
  //     return await fetch(apiGatewayUrl + '/sme-loans', {
  //       method: 'post',

  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json'
  //       },

  //       body: JSON.stringify(addSmeLoan)
  //     })
  //       .then(res => res.json())

  //       .then(result => {
  //         console.log(result, '...result')
  //         if (result.success) {
  //           dispatch(displayNotification('SME loan created', 'success'));
  //           dispatch(addOrUpdateSmeLoan(result.data));
  //           dispatch(createNewSmeLoanBusy());
  //           return result.data;
  //         }
  //         console.error(result.message, 'error');
  //         dispatch(displayNotification(result.error.errmsg, 'error'));
  //         dispatch(createNewSmeLoanBusy());
  //         return null;

  //       })
  //       .catch(() => {
  //         dispatch(displayNotification('Save SME Loan - Unexpected error occured', 'error'));
  //         dispatch(createNewSmeLoanBusy());
  //         return null;
  //       });
  //   }
  // };
};

// eslint-disable-next-line no-unused-vars
export const addNewSmeFlexLoan = (newSmeLoan, sme) => {

  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${apiGatewayUrl}/create-sme-flex-loan`,
        body: newSmeLoan
      };

      return httpService.post(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            dispatch(displayNotification('SME loan created', 'success'));
            dispatch(addOrUpdateSmeLoan(response.data));
            resolve(response);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Flex loan overview - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const updateSmeFlexLoan = ({ loanData, loanId, contractId }) => {

  return dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: `${api}/sme-loans/update-flex-loan/`,
        body: {
          data: loanData,
          loanId,
          contractId,
        }
      };

      return httpService.put(requestData, dispatch)
        .then((response) => {

          if (response && response.code === 200) {
            dispatch(displayNotification('SME loan updated', 'success'));
            dispatch(addOrUpdateSmeLoan(response.data));
            resolve(response);
          }

          reject(response);
        })
        .catch((error) => {
          dispatch(displayNotification('Flex loan overview - unexpected error ocurred', 'error'));
          reject(error);
        });

    });

  };
};

export const updateSmeLoan = (maturityDate, contractId) => {

  return async dispatch => {

    if (contractId !== null) {
      fetch(api + `/sme-loans/contract-id/${contractId}`, {
        method: 'put',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({ 'maturityDate': maturityDate })
      })
        .then(res => res.json())

        .then(() => {
          dispatch(createNewSmeLoanBusy());
        })
        .catch(() => {
          dispatch(displayNotification('Update SME Loan - Unexpected error occured.', 'error'));
        });
    } else {
      dispatch(displayNotification('Update SME Loan - ContractID not available.', 'error'));
    }
  };
};

export const getSingleLoanOverviewData = (contractId) => {

  return dispatch => {
    return new Promise((resolve, reject) => {

      const requestData = { url: api + '/sme-loans/single_loan_overview/' + contractId };

      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.success) {

            const loan = result.data.loan;
            const sme = result.data.sme;

            dispatch(addOrUpdateSmeLoan(loan));
            dispatch(selectLoan(loan));
            dispatch(changeCustomerDetails(sme));
            dispatch(requestMandates(sme.id));

            if (loan.type === 'fixed-loan') {
              dispatch(getCalculatedDataOfLoanTransactions(contractId));
            }
            if (loan.type === 'flex-loan') {
              dispatch(getFlexLoanOverviewData(contractId));
              dispatch(getInversConsentsForLoanBySme(sme.id));
            }

            resolve(result.data);
          } else {
            dispatch(displayNotification(result.error.errmsg, 'error'));
            reject(result.error.errmsg);
          }
        })
        .catch(err => {
          dispatch(displayNotification('Single Loan Overview - Unexpected error occurred', 'error'));
          reject(err);
        });
    });
  };

};

export const getCalculatedDataOfLoanTransactions = (contractId) => {
  const requestData = { url: apiGatewayUrl + '/sme-loan-transactions-overview?uniqueId=' + contractId };
  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch({ type: GET_CALCULATED_DATA_OF_LOAN_TRANSACTIONS, payload: result.data.overview });
            dispatch(clearDirectDebits());
            dispatch(processDirectDebits(result.data.transactions, contractId));
            return resolve();
          }
        })
        .catch(error => {
          dispatch(displayNotification('Single Loan Overview Transaction Calculations - Unexpected error occurred', 'error'));
          reject(error);
        });
    });
  };
};

export const terminateSmeLoan = (terminateObj, customerId) => {

  const data = {
    url: apiGatewayUrl + '/Sme-loans-terminate',
    body: terminateObj
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          if (result.success) {
            //dispatch(showTerminateSmeLoanModal());
            dispatch(displayNotification('SME loan terminated', 'success'));
            dispatch(terminateDirectDebits(terminateObj));
            dispatch(requestSmeLoans(customerId));

          } else {
            let error = result.error.errmsg;
            if (result.error.errlogs) {
              error = result.error.errlogs[0].error.message ? result.error.errlogs[0].error.message : error;
            }
            dispatch(displayNotification(result.message, 'error'));
            dispatch(displayNotification(result.error.errmsg, 'error'));
            dispatch(displayNotification(error, 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('SME loan terminate - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };

};

export const refinanceLoan = (data,language) => {
  const requestData = {
    url: apiGatewayUrl + ('/refinance-sme-loan'),
    body: data
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch ,language)
        .then(response => {
          dispatch(findAndUpdateLoan(response.data.parentSmeLoan));
          dispatch(addOrUpdateSmeLoan(response.data.smeLoan));
          resolve(response.data);
          dispatch(displayNotification('Refinace Successfull', 'success'));
        })
        .catch(error => {
          dispatch(displayNotification('SME loan refinance - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };
};

// redeem loan
export const redeemLoan = (data, language) => {

  const requestData = {
    url: apiGatewayUrl + ('/redeem-sme-loan'),
    body: data
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch, language)
        .then(response => {
          dispatch(findAndUpdateLoan(response.data.smeLoan));
          dispatch(requestDirectDebits(response.data.smeLoan.contractId));
          dispatch(getCalculatedDataOfLoanTransactions(response.data.smeLoan.contractId));
          dispatch(getSingleLoanOverviewData(response.data.smeLoan.contractId));
          resolve(response.data);
          dispatch(displayNotification('Redeem Successfull', 'success'));
        })
        .catch(error => {
          dispatch(displayNotification('SME loan redeem - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };
};


// process sme loans planned income
export const ProcessSmeLoanPlannedIncome = (input) => {
  const requestData = {
    url: apiGatewayUrl + '/book-planned-income',
    body: input
  };
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      return httpService.post(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          resolve(result.data);
        })
        .catch(error => {
          if (error.error) {
            if (error.error.errmsg) {
              dispatch(displayNotification(error.error.errmsg, 'warning'));
            } else {
              dispatch(displayNotification('Process Sme loan planned income - Unexpected error occured', 'error'));
            }
          } else {
            dispatch(displayNotification('Process Sme loan planned income - Unexpected error occured', 'error'));
          }
          reject(error);
        });
    });
  };
};

export const refundLoan = (data) => {

  const requestData = {
    url: apiGatewayUrl + ('/refund-sme-loan'),
    body: data
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(response => {
          dispatch(findAndUpdateTransaction(response.data));
          resolve(response.data);
          dispatch(displayNotification('Refund Successfull', 'success'));
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
          dispatch(displayNotification('SME loan refund - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };
};

// export const downloadTransactionOverviewPDF = (requestData) => {
//   return (dispatch) => {

//     return new Promise((resolve, reject) => {

//       return fetch(DIRECT_DEBITS_API + '/sme-loan-transaction/generate-transaction-details-as-pdf', {
//         method: 'post',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(requestData)
//       })
//         .then(res => res.blob())
//         .then(blob => {
//           const url = window.URL.createObjectURL(new Blob([blob]));
//           const link = document.createElement('a');
//           link.href = url;
//           link.setAttribute('download', `sample-file.pdf`);

//           document.body.appendChild(link);

//           link.click();

//           link.parentNode.removeChild(link);
//         })
//         .catch(error => {
//           dispatch(displayNotification('SME loan TransactionOverview - Unexpected error occured', 'error'));
//           reject(error);
//         });
//     });
//   };
// };

export const generateTransactionOverview = (data, callback) => {

  const requestData = {
    url: apiGatewayUrl + '/display-report',
    body: data.smeLoan
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {
            callback(result, null);
          }
          else {
            dispatch(displayNotification(result.error.errmsg, 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('SME loan pdf - Unexpected error occured', 'error'));
          callback(null, error);
        });
    });
  };

};

export const getSmeLoanByLoanId = (loanId) => {
  return dispatch => {
    const requestData = {
      url: api + `/sme-loans/?_id=${loanId}`
    };
    return new Promise((resolve, reject) => {
      return httpService.get(requestData)
        .then(response => {
          dispatch({ type: SELECT_LOAN, loan: response.data[0] });
          resolve(response.data[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
};

export const getSmeLoanByQuery = (condition = {}, fields = {}) => {
  return dispatch => {
    const requestData = {
      url: api + `/sme-loans/?condition=${JSON.stringify(condition)}&&fields=${JSON.stringify(fields)}`
    };
    return new Promise((resolve, reject) => {
      return httpService.get(requestData)
        .then(response => {
          // console.log(response.data[0])
          if (response.data[0]) dispatch({ type: SELECT_LOAN, loan: response.data[0] });
          resolve(response.data[0] ? response.data[0] : null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
};

export const getSmeLoansByQuery = (condition = {}, fields = {}) => {
  return () => {
    const requestData = {
      url: api + `/sme-loans/?condition=${JSON.stringify(condition)}&&fields=${JSON.stringify(fields)}`
    };
    return new Promise((resolve, reject) => {
      return httpService.get(requestData)
        .then(response => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
};

export const claimLoanByLoanId = (loanId, smeId) => {
  return async dispatch => {
    return Promise.resolve(dispatch(getSmeLoanByLoanId(loanId)))
      .then((response) => {
        const contractId = response.contractId;
        dispatch(getCustomerByVTigerId(smeId));
        return dispatch(requestDirectDebits(contractId));
      })
      .then(() => {
        return true;
      })
      .catch(error => {
        console.error('claimLoanByLoanId', error);
        return false;
      });
  };
};


export const getLatestSmeLoanBySmeIdAndStatus = (smeId, status) => {
  return async () => {
    const requestData = {
      url: apiGatewayUrl + '/latest-sme-loan?' + util.addQueryParams({ smeId, status })
    };
    return await httpService.get(requestData)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error('getLatestSmeLoanBySmeIdAndStatus', error);
        return null;
      });
  };
};

export const getSmeLoanFeesAndTransactions = (contractId) => {
  return async dispatch => {
    const requestData = { url: apiGatewayUrl + '/sme-loan-transactions-overview?uniqueId=' + contractId };
    return await httpService.get(requestData, dispatch)
      .then(result => {
        dispatch({ type: GET_CALCULATED_DATA_OF_LOAN_TRANSACTIONS, payload: result.data.overview });
        dispatch(clearDirectDebits());
        dispatch(processDirectDebits(result.data.transactions, contractId));
        return result.data;
      })
      .catch((error) => {
        console.error('getSmeLoanFeesAndTransactions', error);
        return null;
      });
  };
};

export const cancelLoan = (requestData) => {
  const data = {
    url: apiGatewayUrl + ('/cancel-sme-loan'),
    body: requestData
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(response => {
          if (response.success) {
            dispatch(showCancelSmeLoanModal());
            resolve(response.data);
            dispatch(getSingleLoanOverviewData(requestData.contractId));
            dispatch(getCalculatedDataOfLoanTransactions(requestData.contractId));
            dispatch(displayNotification('Loan Cancel Successfull', 'success'));
          } else {
            dispatch(displayNotification(response.error.errmsg, 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification(error.error.errmsg, 'error'));
          dispatch(displayNotification('SME loan refund - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };

};

export const claimLoan = (requestData) => {
  const data = {
    url: apiGatewayUrl + ('/claim-sme-loan'),
    body: requestData
  };

  return dispatch => {
    return new Promise((resolve, reject) => {
      let claimResponse;
      return httpService.post(data, dispatch)
        .then(response => {
          claimResponse = response;
          if (response.success) {
            if (response.data.msg) {
              dispatch(requestLoan(requestData.smeLoan.contractId))
                .then(result => {
                  if (result) {
                    dispatch(findAndUpdateLoan(result));
                    // dispatch(findAndUpdateTransaction(claimResponse.data.smeLoanTransactions));
                    dispatch(getSingleLoanOverviewData(requestData.smeLoan.contractId));
                    dispatch(getCalculatedDataOfLoanTransactions(requestData.smeLoan.contractId));
                    resolve(claimResponse.data);
                    dispatch(displayNotification('Claim Successfull', 'success'));
                  }
                  resolve();
                  return;
                });
              dispatch(requestDirectDebits(requestData.smeLoan.contractId))
                .then(result => {
                  if (result) {
                    dispatch(findAndUpdateTransaction(result));
                  }
                  resolve();
                  return;
                })
                .catch(error => {
                  dispatch(displayNotification('SME loan claim - Unexpected error occured', 'error'));
                  reject(error);
                });
            }
            else {
              dispatch(displayNotification('Claim already made', 'warning'));
            }
          }
          else {
            dispatch(displayNotification(claimResponse.error.errmsg, 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('SME loan claim - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };

};

export const getPlatformParameters = (searchOptions) => async dispatch => {

  const request = {
    url: `${ENV.INITIATION_GATEWAY_URL}/get-platform-parameters${searchOptions ? '?' : ''}` + util.encodeQueryData(searchOptions),
  };

  try {
    return httpService.get(request, dispatch)
      .then((response) => {
        return response;
      })
      .catch((error) => error);

  } catch (error) {
    console.error('Get Platform Parameters err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const checkOutstandingFixedLoans = (smeId) => async dispatch => {

  try {
    if (!smeId) throw Error('Sme id is missing');

    const requestData = {
      url: api + `/sme-loans/?smeId=${smeId}&&type=${smeLoanType.FIXED}`
    };

    return httpService.get(requestData, dispatch)
      .then((response) => {

        const loans = response.data;

        const selectedLoan = loans.find(loan => loan.status !== 'loan-normally-settled' && loan.status !== 'loan-fully-refinanced' && loan.status !== 'loan-fully-redeemed' && loan.status !== 'cancelled');

        const hasLoan = selectedLoan ? false : true;

        return hasLoan;
      })
      .catch((error) => { throw error; });

  } catch (error) {

    console.error('Check outstanding fixed loans', error);
    throw Error('Check Outstanding Fixed Loans Error Occurred!');
  }
};

export const startStopSmeLoanInterestPenalty = (requestData) => {
  const data = {
    url: apiGatewayUrl + ('/start-stop-sme-loan-interest-penalty'),
    body: requestData
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(response => {
          if (response.success) {
            resolve(response.data);
          } else {
            dispatch(displayNotification(response.error.errmsg, 'error'));
          }
        })
        .catch(error => {
          dispatch(displayNotification('SME loan refund - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };

};

export const getLoansGivenOverviewData = (startDate, endDate, country) => {
  const requestData = {
    url: apiGatewayUrl + '/loans-given-overview?' + util.addQueryParams({ startDate, endDate, country })
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.get(requestData, dispatch)
        .then(response => {
          if (response.success) {
            resolve(response.data);
          }
        })
        .catch(error => {
          dispatch(displayNotification('Loans given overview - Unexpected error occured', 'error'));
          reject(error);
        });
    });
  };

};
/************
 *          *
 ***********/

export const clearLoans = () => ({ type: CLEAR_LOANS });

export const selectLoan = loan => ({ type: SELECT_LOAN, loan });

export const clearSelectedLoan = () => ({ type: CLEAR_SELECTED_LOAN });

export const createNewSmeLoanBusy = () => ({ type: SAVE_NEW_SME_LOAN_BUSY });

export const findAndUpdateLoan = loan => ({ type: FIND_AND_UPDATE_LOAN, loan });

export const showTerminateSmeLoanModal = () => ({ type: SHOW_TERMINATE_SME_LOAN_MODAL });

export const showCancelSmeLoanModal = () => ({ type: SHOW_CANCEL_SME_LOAN_MODAL });

export const clearCalculatedDataOfLoanTransactions = () => ({ type: CLEAR_CALCULATED_DATA_OF_LOAN_TRANSACTIONS });

/***********
 * Private *
 **********/

const addOrUpdateSmeLoan = newSmeLoan => ({ type: SAVE_NEW_SME_LOAN, newSmeLoan });

const processSmeLoans = smeLoansByCustomer => ({ type: PROCESS_SME_LOANS_BY_CUSTOMER, smeLoansByCustomer });
