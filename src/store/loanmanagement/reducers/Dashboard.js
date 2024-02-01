import {
  PROCESS_EVENT_LOGS,
  PROCESS_LOAN_HISTORY
} from '../constants/Dashboard';

const dashboardLoanDetails = (
  state = {
    loanDetails: [],
    events: [],
    error: 'IBAN Numbers are not matching',
    trendsUp: [],
    trendsDown: []
  },
  action
) => {
  switch (action.type) {

    case PROCESS_EVENT_LOGS:
      return Object.assign({}, state, {
        events: action.eventLogs
      });
    case PROCESS_LOAN_HISTORY: {

      const processedTrendList = processTrendings(action.loanHistory);

      return {
        ...state,
        trendsUp: processedTrendList.trendsUp,
        trendsDown: processedTrendList.trendsDown
      }
    }
    default:
      return state;
  }
};

const processTrendings = (trendList) => {

  const trendsUp = [];
  const trendsDown = [];

  for (const singleTrend of trendList) {
    if (singleTrend.trend === 'up') {
      trendsUp.push(singleTrend);
    } else {
      trendsDown.push(singleTrend);
    }
  }

  const processedTrends = {
    'trendsUp': trendsUp,
    'trendsDown': trendsDown
  }

  return processedTrends
};

export default dashboardLoanDetails;
