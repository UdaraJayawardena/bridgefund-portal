import ENV from '../../../config/env';
import { httpService } from "../service/httpService";

import { displayNotification } from './Notifier';

import {
  UPDATE_TEMPORARY_STOP,
  ADD_TEMPORARY_LOAN_STOP,
  SHOW_TEMPORARY_LOAN_STOP,
  SET_LOAN_STOP_HISTORY_ORIGIN,
  PROCESS_LOAN_STOP_HISTORY_DATA,
  SET_IS_ACTIVE_AVAILABLE_FOR_SME,
  SWITCH_LOAN_STOP_HISTORY_IS_BUSY,
  CLEAR_SME_LOAN_TEMPORARY_LOAN_STOP_DATA
}
  from '../constants/SmeLoanTemporaryLoanStop';

import { requestDirectDebits } from './SmeLoanTransaction';
import { findAndUpdateLoan } from './SmeLoans';

// import { sendEmail } from './Notifications';
// import Util from '../../lib/utility'
// import moment from 'moment';

/******************************************
 *               BASE URLS                *
 *****************************************/

const LOAN_MANAGEMENT_API = ENV.LOAN_MANAGEMENT_URL;
const DIRECTDEBIT_API = ENV.DIRECT_DEBITS_URL;
// const SETTINGS_API = ENV.SETTINGS_URL
const API_GATEWAY_API = ENV.API_GATEWAY_URL;

/******************************************
 *               API CALLS                *
 *****************************************/

// export const stopLoanTemporarily = (loan, startDate, endDate, interestPerDay, totalInterest, numberOfdays, sme) => {
//   return async dispatch => {

//     // if (interestPerDay < 25) {
//     //   dispatch(displayNotification('Interest per day can not be less than 25 euros', 'error'));
//     //   dispatch(switchLoanStopHistoryIsBusyStatus());
//     // } else {
//       /**
//        *  retrieve the active loan stops
//        */
//       await fetch(LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/get-active-loan-stop-history/' + loan.contractId)
//         .then((res => res.json()))
//         .then(result => {
//           if (!result.success) {
//             return dispatch(displayNotification(result.error.errmsg, 'error'));
//           }
//           const activeLoanStops = result.data.activeLoanStops;
//           loan = result.data.loan ? result.data.loan : loan;

//           const data = {
//             loan: loan,
//             activeLoanStops: activeLoanStops,
//             startDate: startDate,
//             endDate: endDate,
//             interestPerDay: interestPerDay,
//             totalInterest: totalInterest,
//             numberOfdays: numberOfdays
//           };

//           /**
//            * updates the directdebits with the new collection dates
//            */
//           return fetch(DIRECTDEBIT_API + '/sme-loan-transaction/create-sme-loan-stop', {
//             method: 'post',

//             headers: {
//               Accept: 'application/json',
//               'Content-Type': 'application/json'
//             },

//             body: JSON.stringify(data)
//           });
//         })
//         .then(res => res.json())
//         .then(result => {
//           if (!result.success) {
//             throw result;
//           }
//           const data = {
//             ...result.data,
//             loan: loan,
//             startDate: startDate,
//             endDate: endDate,
//             interestPerDay: interestPerDay,
//             totalInterest: totalInterest,
//             numberOfdays: numberOfdays
//           };

//           /**
//            * save the loan stop history object
//            * update the new collection end date
//            */
//           return fetch(LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/create-sme-loan-stop', {
//             method: 'post',

//             headers: {
//               Accept: 'application/json',
//               'Content-Type': 'application/json'
//             },

//             body: JSON.stringify(data)
//           });
//         })
//         .then(res => res.json())
//         .then(result => {

//           if (!result.success) {
//             throw result;
//           }
//           if (result.data.vtigerError) {
//             dispatch(displayNotification(result.data.vtigerError, 'error'));
//           }

//           dispatch(displayNotification('Temporary loan stop was successfull', 'success'));
//           dispatch(showHideTemporaryLoanStop());
//           dispatch(addTemporaryLoanStop(result.data.smeLoanTemporaryLoanStop));
//           dispatch(findAndUpdateLoan(result.data.loan));
//           dispatch(requestDirectDebits(loan.contractId));
//           dispatch(switchIsActiveAvailableForSME(true));

//           const mailData = {
//             "to": sme.email,
//             "type": "TEMPORARY_LOAN_STOP",
//             "data": {
//               "smeStakeholderName": sme.firstName || sme.name,
//               "startDate": moment(startDate).format('DD-MM-YYYY'),
//               "endDate": moment(endDate).format('DD-MM-YYYY'),
//               "totalInterest": Util.currencyConverter()(totalInterest),
//               "maturityDate": moment(result.data.loan.maturityDate).format('DD-MM-YYYY'),
//               "smeId": sme.id,
//             },
//             "reason": "loan-temporarily-stop"
//           };

//           dispatch(sendEmail(mailData));
//         })
//         .catch(error => {
//           if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
//           else dispatch(displayNotification('Temporary Loan Stop - Unexpected Error Occured', 'error'));
//         })
//         .finally(() => {
//           dispatch(switchLoanStopHistoryIsBusyStatus());
//         });

//     // }
//   }
// };

// this function is a update of above function (use camunda workflow)
export const stopLoanTemporarily = (loanStopData) => {
  
  const { loan, startDate, endDate, interestPerDay, totalInterest, numberOfdays, stopCountStatus, temporyLoanStopCount, symbol, contactDetails } = loanStopData;
  
    const data = {
      temporyLoanStop: {
        loan: {
          contractIdExtension: loan.contractIdExtension,
          type: loan.type,
          status: loan.status,
          country:loan.country,
          currency:loan.currency,
          language:loan.language,
          principleAmount: loan.principleAmount,
          interestAmount: loan.interestAmount,
          initialCostAmount: loan.initialCostAmount,
          recurringCostAmount: loan.recurringCostAmount,
          totalMarginAmount: loan.totalMarginAmount,
          totalLoanAmount: loan.totalLoanAmount,
          otherCostAmount: loan.otherCostAmount,
          overallTotalLoanAmount: loan.overallTotalLoanAmount,
          interestPercentageBasePerMonth: loan.interestPercentageBasePerMonth,
          interestPercentageRiskSurchargePerMonth: loan.interestPercentageRiskSurchargePerMonth,
          interestPercentageTotal: loan.interestPercentageTotal,
          interestAnnualPercentageRate: loan.interestAnnualPercentageRate,
          riskCategory: loan.riskCategory,
          plannedNumberOfDirectDebit: loan.plannedNumberOfDirectDebit,
          discountAmount: loan.discountAmount,
          closingPaymentAmount: loan.closingPaymentAmount,
          partialPaymentAmount: loan.partialPaymentAmount,
          totalCostAmount: loan.totalCostAmount,
          _id: loan._id,
          contractId: loan.contractId,
          createdAt: loan.createdAt,
          directDebitFrequency: loan.directDebitFrequency,
          firstDirectDebitDate: loan.firstDirectDebitDate,
          maturityDate: loan.maturityDate,
          smeId: loan.smeId,
          startDate: loan.startDate,
          updatedAt: loan.updatedAt,
          idRefinancedLoan: '',

        },
        startDate: startDate,
        endDate: endDate,
        interestPerDay: Number(interestPerDay),
        totalInterest: totalInterest,
        numberOfDays: numberOfdays,
        stopCountStatus: stopCountStatus,
        temporyLoanStopCount: temporyLoanStopCount,
        currencySymbol: symbol,
        contactDetails: contactDetails
      }
    };

    const requestData = {
      url: API_GATEWAY_API + ('/sme-loan-tempory-loan-stop'),
      body: data
    };

    return dispatch => {
      return new Promise((resolve, reject) => {
  
        return httpService.post(requestData, dispatch)
          .then(response => {
            dispatch(displayNotification('Temporary loan stop was successfull', 'success'));
            dispatch(showHideTemporaryLoanStop());
            dispatch(addTemporaryLoanStop(response.data.smeLoanTemporyLoanStop));
            dispatch(findAndUpdateLoan(response.data.updatedSmeLoan));
            dispatch(requestDirectDebits(loan.contractId));
            dispatch(switchIsActiveAvailableForSME(true));
            resolve(response);
          })
          .catch(error => {
            if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
            else dispatch(displayNotification('Temporary Loan Stop - Unexpected Error Occured', 'error'));
            reject(error);
          })
          .finally(() => {
            dispatch(switchLoanStopHistoryIsBusyStatus());
          });
      });
    };
};

export const getLoanStopHistoryByLoanId = loanId => {
  
  return dispatch => {

    const requestData = {
      url: LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/loan-id/' + loanId,
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        if (result.success) {
          dispatch(processLoanStopHistoryData(result.data));
          return result.data;
        }
        dispatch(processLoanStopHistoryData([]));
        return [];
      })
      .catch((error) => {
        if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
        else dispatch(displayNotification('Get Temporary Loan History - Unexpected Error Occured', 'error'));
        return [];
      });
    };
  
};

export const getLoanStopHistoryBySME = SME_Id => {

  const requestData = { url: LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/sme-id/' + SME_Id };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(processLoanStopHistoryData(result.data));
          }
          else {
            dispatch(processLoanStopHistoryData([]));
          }
        })
        .catch(error => {
          if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
          else dispatch(displayNotification('Get Temporary Loan History - Unexpected Error Occured', 'error'));
          reject(error);
        });
    });
  };

};

// export const getActiveLoanStopHistoryIsAvailableBySME = SME_Id => {
//   return async dispatch => {
//     await fetch(LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/get-active-loan-stops-is-available-by-smeId/' + SME_Id)
//       .then(res => res.json())
//       .then(result => {
//         const isAvailable = false;
//         if (result.success) {
//           dispatch(switchIsActiveAvailableForSME(result.data));
//         }
//         else {
//           dispatch(processLoanStopHistoryData(isAvailable));
//         }
//       })
//       .catch(error => {
//         if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
//         else dispatch(displayNotification('Get Temporary Loan History - Unexpected Error Occured', 'error'));
//       });
//   };
// };

export const getActiveLoanStopHistoryIsAvailableBySME = customerId => {

  // const requestData = { url: API_GATEWAY_API + `/Get-active-loan-stops/?smeId=${customerId}` };

  // return dispatch => {
  //   return new Promise((resolve, reject) => {
  //     return httpService.get(requestData, dispatch)
  //       .then(result => {
  //         const isAvailable = false;
  //             if (result.success) {
  //               dispatch(switchIsActiveAvailableForSME(result.data));
  //             }
  //             else {
  //               dispatch(processLoanStopHistoryData(isAvailable));
  //             }
  //       })
  //       .catch(error => {
  //         if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
  //         else dispatch(displayNotification('Get Temporary Loan History - Unexpected Error Occured', 'error'));
  //         reject(error);
  //       });
  //   });
  // };
 
  return (dispatch) => {

    fetch(API_GATEWAY_API + `/Get-active-loan-stops/?smeId=${customerId}`, {
     method: 'get',
     headers: {
       Accept: 'application/json',
       'Content-Type': 'application/json'
     }
   }).then(res => res.json())
     .then(result => {
      const isAvailable = false;
      if (result.success) {
        dispatch(switchIsActiveAvailableForSME(result.data));
      }
      else {
        dispatch(processLoanStopHistoryData(isAvailable));
      }
        
     })
     .catch(error => {
       
      if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
      else dispatch(displayNotification('Get Temporary Loan History - Unexpected Error Occured', 'error'));
     });
   };
};

export const getTemporyLoanStopInterestAmountPerDay = (contractId, startDate, endDate, initialCostAmount,
  loanInterestAmount, plannedNumberOfDirectDebit) => {

  return dispatch => {

    const requestData = {
      url: DIRECTDEBIT_API + `/sme-loan-transaction/calculate-temporary-loan-stop-interest?` +
        `contractId=${contractId}` +
        `&startDate=${startDate}` +
        `&endDate=${endDate}` +
        `&initialCostAmount=${initialCostAmount}` +
        `&loanInterestAmount=${loanInterestAmount}` +
        `&plannedNumberOfDirectDebit=${plannedNumberOfDirectDebit}`
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        if (result.success) {
          return (result.data);
        }

        dispatch(displayNotification(result.error.errmsg, 'error'));
        return null;
      })
      .catch((error) => {
        if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
        else dispatch(displayNotification('get temporary loan stop amount per day - Unexpected Error Occured', 'error'));
      });
  };
 
};

export const cancelLoanStop = (smeLoanTemporaryLoanStop, smeId) => {

  return async dispatch => {

    let loan = {};

    /**
     *  retrieve the active loan stops
     */
    await fetch(LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/get-active-loan-stop-history/' + smeLoanTemporaryLoanStop.loanNumber)
      .then((res => res.json()))
      .then(result => {
        if (!result.success) {
          throw result;
        }
        const activeLoanStops = result.data.activeLoanStops;
        loan = result.data.loan ? result.data.loan : loan;
        return fetch(DIRECTDEBIT_API + '/sme-loan-transaction/cancel-sme-loan-stop', {
          method: 'post',

          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            smeLoanTemporaryLoanStop: smeLoanTemporaryLoanStop,
            activeLoanStops: activeLoanStops,
            loan: loan
          })
        });
      })
      .then(res => res.json())
      .then(result => {
        if (!result.success) {
          throw result;
        }
        const data = {
          loanEndDate: result.data.loanEndDate,
          smeLoanTemporaryLoanStop: smeLoanTemporaryLoanStop,
          loan: loan,
          smeId: smeId
        };
        return fetch(LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/cancel-sme-loan-stop', {
          method: 'post',

          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(data)
        });
      })
      .then(res => res.json())
      .then((result) => {
        if (!result.success) {
          throw result;
        }
        dispatch(displayNotification('Succesfully canceled the temporary loan stop', 'success'));
        dispatch(showHideTemporaryLoanStop());
        dispatch(updateTemporaryLoanStop(result.data.smeLoanTemporaryLoanStop));
        dispatch(findAndUpdateLoan(result.data.loan));
        dispatch(requestDirectDebits(loan.contractId));
        dispatch(getActiveLoanStopHistoryIsAvailableBySME(smeId));
      })
      .catch(error => {
        if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
        else dispatch(displayNotification('Temporary Loan Stop - Unexpected Error Occured', 'error'));
      })
      .finally(() => {
        dispatch(switchLoanStopHistoryIsBusyStatus());
      });
  };
};

//export const cancelLoanStop = (smeLoanTemporaryLoanStop, smeId) => {
// const requestData = { url: LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/get-active-loan-stop-history/' + smeLoanTemporaryLoanStop.loanNumber };

  // return dispatch => {
  //   let loan = {};

  //   return new Promise((resolve, reject) => {
  //     return httpService.get(requestData, dispatch)
  //       .then(result => {
  //         if (!result.success) {
  //           throw result;
  //         }
  //         const activeLoanStops = result.data.activeLoanStops;
  //         loan = result.data.loan ? result.data.loan : loan;

  //         const data = {
  //           url: DIRECTDEBIT_API + '/sme-loan-transaction/cancel-sme-loan-stop',
  //           body: {
  //             smeLoanTemporaryLoanStop: smeLoanTemporaryLoanStop,
  //             activeLoanStops: activeLoanStops,
  //             loan: loan
  //           }
  //         };

  //         return httpService.post(data, dispatch)
  //           .then(response => {
  //             if (!response.success) {
  //               throw response;
  //             }
  //             const data = {
  //               loanEndDate: response.data.loanEndDate,
  //               smeLoanTemporaryLoanStop: smeLoanTemporaryLoanStop,
  //               loan: loan,
  //               smeId: smeId
  //             };

  //             const reqData = {
  //               url: LOAN_MANAGEMENT_API + '/sme-loan-temporary-loan-stop/cancel-sme-loan-stop',
  //               body: data
  //             };

  //             return httpService.post(reqData, dispatch)
  //               .then(result => {
  //                 if (!result.success) {
  //                   throw result;
  //                 }
  //                 dispatch(displayNotification('Succesfully canceled the temporary loan stop', 'success'));
  //                 dispatch(showHideTemporaryLoanStop());
  //                 dispatch(updateTemporaryLoanStop(result.data.smeLoanTemporaryLoanStop));
  //                 dispatch(findAndUpdateLoan(result.data.loan));
  //                 dispatch(requestDirectDebits(loan.contractId));
  //                 dispatch(getActiveLoanStopHistoryIsAvailableBySME(smeId));
  //               })
  //               .catch(error => {
  //                 if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
  //                 else dispatch(displayNotification('Temporary Loan Stop - Unexpected Error Occured', 'error'));
  //               })
  //               .finally(() => {
  //                 dispatch(switchLoanStopHistoryIsBusyStatus());
  //               });

  //           });
  //       });
  //   });
  // };
//}
/******************************************
 *             Redux Calls                *
 *****************************************/

export const switchLoanStopHistoryIsBusyStatus = () => ({ type: SWITCH_LOAN_STOP_HISTORY_IS_BUSY });

export const showHideTemporaryLoanStop = () => ({ type: SHOW_TEMPORARY_LOAN_STOP });

export const clearLoanTemporaryLoanStopData = () => ({ type: CLEAR_SME_LOAN_TEMPORARY_LOAN_STOP_DATA });

export const setLoanStopHistoryOrigin = origin => {
  return {
    type: SET_LOAN_STOP_HISTORY_ORIGIN,
    origin
  };
};

/**************************
 *    Private Functions   *
 *************************/

const processLoanStopHistoryData = loanStopHistoryData => {
  return {
    type: PROCESS_LOAN_STOP_HISTORY_DATA,
    loanStopHistoryData
  };
};

const switchIsActiveAvailableForSME = isActiveAvailableForSME => {
  return {
    type: SET_IS_ACTIVE_AVAILABLE_FOR_SME,
    isActiveAvailableForSME
  };
};

const updateTemporaryLoanStop = temporaryStop => {
  return {
    type: UPDATE_TEMPORARY_STOP,
    temporaryStop
  };
};
const addTemporaryLoanStop = temporaryStop => {
  return {
    type: ADD_TEMPORARY_LOAN_STOP,
    temporaryStop
  };
};