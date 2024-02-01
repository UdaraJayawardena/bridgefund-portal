import { combineReducers } from 'redux';
import baiOverview from "./BAIOverview.reducer";
import bankAccount from "./BankAccount.reducer";
import bankTransactions from "./BankTransactions.reducer";
import config from "./Configuration.reducer";
import contract from "./Contracts.reducer";
import creditRiskOverview from "./CreditRiskOverview.reducer";
import debtForm from "./DebtForm.reducer";
import loanRequest from "./LoanRequest.reducer";
import notifier from "./Notifier.reducer";
import processDashboard from "./ProcessDashboard.reducer";
import snapshot from "./Snapshot.reducer";
import user from "./User.reducer";
import workFlowManagement from "./workflowManagement.reducer";

const rootReducer = combineReducers({
  baiOverview,
  bankAccount,
  bankTransactions,
  config,
  contract,
  creditRiskOverview,
  debtForm,
  loanRequest,
  notifier,
  processDashboard,
  snapshot,
  user,
  workFlowManagement
});

export default rootReducer;