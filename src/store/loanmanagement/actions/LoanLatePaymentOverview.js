/* eslint-disable no-else-return */
import ENV from "../../../config/env";
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import { GET_ALL_LOAN_LATE_PAYMENT_OVERVIEWS } from '../constants/LoanLatePaymentOverview';
import loanmanagement from "constants/loanmanagement";

// const api = ENV.LOAN_MANAGEMENT_URL;
const apiGatewayUrl = ENV.API_GATEWAY_URL;

// export const getAllLoanLatePaymentOverviews = (date) => {
//   const url = `/sme-loan-histories/multiple-overview?date=${date}`;

//   return async dispatch => {
//     await fetch(api + url)
//       .then(res => { return res.json(); })
//       .then(result => {
//         if (result.success) {
//           if (result.data.length === 0) {

//             dispatch(displayNotification('No data for the selected date', 'warning'));
//             dispatch(SetLoanLatePaymentOverviews({}));

//           } else {

//             dispatch(displayNotification('Data retrieved for the selected date', 'success'));
//             const constructedData = counstructLatePaymentOveView(result.data);
//             dispatch(SetLoanLatePaymentOverviews(constructedData));

//           }
//         } else {

//           dispatch(SetLoanLatePaymentOverviews({}));
//           dispatch(displayNotification(result.error.errmsg, 'error'));

//         }
//       })
//       .catch(error => {
//         console.error("getAllLoanLatePaymentOverviews", error);
//         dispatch(
//           displayNotification(
//             "Loan Late Payment Overviews - Unexpected Error occured",
//             "error"
//           )
//         );
//       });
//   };
// };

export const getAllLoanLatePaymentOverviews = (date, frequency, country) => {

  const requestData = { url: apiGatewayUrl + `/Late-payment-data/?generateDate=${date}&country=${country}` };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          if (result.success) {
            if (result.data.length === 0) {

              dispatch(displayNotification('No data for the selected date', 'warning'));
              dispatch(SetLoanLatePaymentOverviews({}));

            } else {

              dispatch(displayNotification('Data retrieved for the selected date', 'success'));
              const constructedData = counstructLatePaymentOveView(result.data, frequency, country);
              dispatch(SetLoanLatePaymentOverviews(constructedData));

            }
          } else {

            dispatch(SetLoanLatePaymentOverviews({}));
            dispatch(displayNotification(result.error.errmsg, 'error'));

          }
        })
        .catch(error => {
          console.error("getAllLoanLatePaymentOverviews", error);
          dispatch(
            displayNotification(
              "Loan Late Payment Overviews - Unexpected Error occured",
              "error"
            )
          );
        });
    });
  };

};

const counstructLatePaymentOveView = (itemList, frequency, country) => {

  // header display values
  let totalOverallOriginalLoanValue = 0;
  let totalOverallTotalOutstanding = 0;
  let totalOverallTotalOverdue = 0;

  const listOfPayments = [];
  let count = 0;
  for (let i = 1; i < 6; i++) {
    for (let j = 1; j < 6; j++) {
      listOfPayments[count] = {
        repaymentCategory: j,
        stage: i,
        overallTotalLoanAmountOfBlock: 0,
        overallOutstandingTotalAmountOfBlock: 0,
        overallTotalOverdueAmountOfBlock: 0,
        loanItemList: []
      };
      count++;
    }
  }
  itemList.forEach(lateLoan => {
    //for no frequency selected and no country specified
    if (frequency === '' && country ==='All') {
      if ([1, 2, 3, 4, 5].indexOf(lateLoan.repaymentCategory) !== -1 && [1, 2, 3, 4, 5].indexOf(lateLoan.stage) !== -1) {
        totalOverallOriginalLoanValue += lateLoan.overallTotalLoanAmount;
        totalOverallTotalOutstanding += lateLoan.overallOutstandingTotalAmount;
        totalOverallTotalOverdue += lateLoan.overallTotalOverdueAmount;

        const originalIndex = listOfPayments.findIndex(payment => payment.stage === lateLoan.stage && payment.repaymentCategory === lateLoan.repaymentCategory);
        listOfPayments[originalIndex].overallTotalLoanAmountOfBlock += lateLoan.overallTotalLoanAmount;
        listOfPayments[originalIndex].overallOutstandingTotalAmountOfBlock += lateLoan.overallOutstandingTotalAmount;
        listOfPayments[originalIndex].overallTotalOverdueAmountOfBlock += lateLoan.overallTotalOverdueAmount;
        listOfPayments[originalIndex].loanItemList.push(lateLoan);
      }
    }
    //for no frequency selected but country specified
    else if (frequency === '' && lateLoan.country === country) {
     if ([1, 2, 3, 4, 5].indexOf(lateLoan.repaymentCategory) !== -1 && [1, 2, 3, 4, 5].indexOf(lateLoan.stage) !== -1) {
       totalOverallOriginalLoanValue += lateLoan.overallTotalLoanAmount;
       totalOverallTotalOutstanding += lateLoan.overallOutstandingTotalAmount;
       totalOverallTotalOverdue += lateLoan.overallTotalOverdueAmount;

       const originalIndex = listOfPayments.findIndex(payment => payment.stage === lateLoan.stage && payment.repaymentCategory === lateLoan.repaymentCategory);
       listOfPayments[originalIndex].overallTotalLoanAmountOfBlock += lateLoan.overallTotalLoanAmount;
       listOfPayments[originalIndex].overallOutstandingTotalAmountOfBlock += lateLoan.overallOutstandingTotalAmount;
       listOfPayments[originalIndex].overallTotalOverdueAmountOfBlock += lateLoan.overallTotalOverdueAmount;
       listOfPayments[originalIndex].loanItemList.push(lateLoan);
     }
   }
   else {
     //for frequency selected and no country specified
      if ([1, 2, 3, 4, 5].indexOf(lateLoan.repaymentCategory) !== -1 && [1, 2, 3, 4, 5].indexOf(lateLoan.stage) !== -1 && lateLoan.directDebitFrequency === frequency && country ==='All') {
        totalOverallOriginalLoanValue += lateLoan.overallTotalLoanAmount;
        totalOverallTotalOutstanding += lateLoan.overallOutstandingTotalAmount;
        totalOverallTotalOverdue += lateLoan.overallTotalOverdueAmount;

        const originalIndex = listOfPayments.findIndex(payment => payment.stage === lateLoan.stage && payment.repaymentCategory === lateLoan.repaymentCategory);
        listOfPayments[originalIndex].overallTotalLoanAmountOfBlock += lateLoan.overallTotalLoanAmount;
        listOfPayments[originalIndex].overallOutstandingTotalAmountOfBlock += lateLoan.overallOutstandingTotalAmount;
        listOfPayments[originalIndex].overallTotalOverdueAmountOfBlock += lateLoan.overallTotalOverdueAmount;
        listOfPayments[originalIndex].loanItemList.push(lateLoan);
      }
      //for frequency selected and country specified
      if ([1, 2, 3, 4, 5].indexOf(lateLoan.repaymentCategory) !== -1 && [1, 2, 3, 4, 5].indexOf(lateLoan.stage) !== -1 && lateLoan.directDebitFrequency === frequency && lateLoan.country === country) {
       totalOverallOriginalLoanValue += lateLoan.overallTotalLoanAmount;
       totalOverallTotalOutstanding += lateLoan.overallOutstandingTotalAmount;
       totalOverallTotalOverdue += lateLoan.overallTotalOverdueAmount;

       const originalIndex = listOfPayments.findIndex(payment => payment.stage === lateLoan.stage && payment.repaymentCategory === lateLoan.repaymentCategory);
       listOfPayments[originalIndex].overallTotalLoanAmountOfBlock += lateLoan.overallTotalLoanAmount;
       listOfPayments[originalIndex].overallOutstandingTotalAmountOfBlock += lateLoan.overallOutstandingTotalAmount;
       listOfPayments[originalIndex].overallTotalOverdueAmountOfBlock += lateLoan.overallTotalOverdueAmount;
       listOfPayments[originalIndex].loanItemList.push(lateLoan);
     }
    }
  });
  return { listOfPayments, totalOverallOriginalLoanValue, totalOverallTotalOutstanding, totalOverallTotalOverdue };
};
export const SetLoanLatePaymentOverviews = (payload) => {
  return {
    type: GET_ALL_LOAN_LATE_PAYMENT_OVERVIEWS,
    payload
  };
};