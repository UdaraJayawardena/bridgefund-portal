import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
   GET_MULTIPLE_OVERVIEW_DATA,
   SET_SINGLE_LOAN_HISTORY_DATA
} from '../constants/Reports';
import Utility from '../../../lib/loanmanagement/utility';
import { isNullOrUndefined } from 'util';

const api = ENV.LOAN_MANAGEMENT_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;

// export const requestMultipleOverviewData = (SBI_Code, date) => {
//    SBI_Code = isNullOrUndefined(SBI_Code) ? '' : SBI_Code;
//    date = isNullOrUndefined(date) ? '' : date;
//    const url = api + '/sme-loan-histories/multiple-overview/?' + Utility.encodeQueryData({ sbicode: SBI_Code, date: date });
//    return async dispatch => {
//       await fetch(url)
//          .then(res => res.json())

//          .then(result => {
//             if (result.success) {
//                result.data.length > 0 ?
//                   dispatch(displayNotification('Data retrieved successfully', 'success')) :
//                   dispatch(displayNotification('No data available for the selected date or SBI', 'warning'));
//                dispatch(processMultipleLoanOverviewData(result.data));
//             } else {
//                displayNotification('Something went wrong... Please try again!', 'error');
//             }
//          })
//          .catch(() => {
//             dispatch(displayNotification('Request Multiple Loan Overview Data - Unexpected error occured.', 'error'));
//          });
//    };
// };

export const requestMultipleOverviewData = (SBI_Code, date, country) => {

   SBI_Code = isNullOrUndefined(SBI_Code) ? '' : SBI_Code;
   date = isNullOrUndefined(date) ? '' : date;  
   country = country? country : '';
  
   const requestData = { url:  apiGatewayUrl + '/Spread-risk-over-view/?'+Utility.encodeQueryData({ sbiCode: SBI_Code, generateDate: date, country: country })};

   return dispatch => {
     return new Promise((resolve, reject) => {
       return httpService.get(requestData, dispatch)
         .then(result => {
            if (result.success) {
               console.log("Data = ", result.success);
               result.data.length > 0 ?
                  dispatch(displayNotification('Data retrieved successfully', 'success')) :
                  dispatch(displayNotification('No data available for the selected date or SBI', 'warning'));
               dispatch(processMultipleLoanOverviewData(result.data));
            }
         })
         .catch(error => {
            dispatch(displayNotification('Request Multiple Loan Overview Data - Unexpected error occured.', 'error'));
           reject(error);
         });
     });
   };
   
 };

export const getLatestLoanHistoryByLoanId = loanId => {

   const requestData = { url: api + '/sme-loan-histories/loan-id/' + loanId };

   return dispatch => {
     return new Promise((resolve, reject) => {
       return httpService.get(requestData, dispatch)
         .then(result => {
            if (result.success) {
               dispatch(saveSingleLoanHistoryData(result.data));
            }
         })
         .catch(error => {
            console.log(error);
            dispatch(displayNotification('Request Latest Loan History Data - Unexpected error occured.', 'error'));
         });
     });
   };

};

export const processMultipleLoanOverviewData = loanData => {
   return {
      type: GET_MULTIPLE_OVERVIEW_DATA,
      loanData
   };
};

export const saveSingleLoanHistoryData = loanHistory => {
   return {
      type: SET_SINGLE_LOAN_HISTORY_DATA,
      loanHistory
   };
};