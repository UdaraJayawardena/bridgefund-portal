import moment from "moment";
import ENV from "../../../config/env";
import { displayNotification } from "./Notifier";
import {
  // PROCESS_LOAN_DETAILS,
  PROCESS_EVENT_LOGS,
  PROCESS_LOAN_HISTORY
} from "../constants/Dashboard";

// const api = ENV.CUSTOMER_CONTRACTS_URL;
const apiGateway = ENV.API_GATEWAY_URL;
const setingsApi = ENV.SETTINGS_URL;

const getEventLogs = () => {
  return async dispatch => {
    // const response = await fetch(api + '/eventlogs');
    const response = await fetch(setingsApi + "/system-logs?logType=event-log");

    const result = await response.json();

    let { data } = result;

    if (data) {

      data = data.map(data => {
        // this is to remove the time field and make the sort easy

        const { smeCompany, priority, smeId } = data.metaData;

        return {
          timestamp: moment(data.createdAt).valueOf(),
          createdAt: moment(data.createdAt).format("YYYY-MM-DD"),
          customerName: smeCompany,
          priority: priority,
          customerId: smeId,
          message: data.message
        };
      });

      return dispatch(processEventLogData(data));

    }
  };
};

const getLoanTrends = () => {
  return async dispatch => {
    await fetch(apiGateway + '/get-previous-working-days-for-trends')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(processLoanHistory(result.data));
        }
      })
      .catch(() => {
        dispatch(
          displayNotification("Loan Trends - Unexpected Error Occured", "error")
        );
      });
  };
};

// const processLoanData = loanData => {
//   return {
//     type: PROCESS_LOAN_DETAILS,
//     loanData
//   };
// };

const processEventLogData = eventLogs => {
  return {
    type: PROCESS_EVENT_LOGS,
    eventLogs
  };
};

const processLoanHistory = loanHistory => {
  return {
    type: PROCESS_LOAN_HISTORY,
    loanHistory
  };
};

export { getEventLogs, getLoanTrends };
