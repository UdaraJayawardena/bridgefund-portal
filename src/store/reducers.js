/* LI < */
import { combineReducers } from 'redux';
import baiOverview from "./initiation/reducers/BAIOverview.reducer";
import bankAccount from "./initiation/reducers/BankAccount.reducer";
import bankTransactionsLI from "./initiation/reducers/BankTransactions.reducer";
import config from "./initiation/reducers/Configuration.reducer";
import contract from "./initiation/reducers/Contracts.reducer";
import creditRiskOverview from "./initiation/reducers/CreditRiskOverview.reducer";
import debtForm from "./initiation/reducers/DebtForm.reducer";
import loanRequest from "./initiation/reducers/LoanRequest.reducer";
import notifier from "./initiation/reducers/Notifier.reducer";
import processDashboard from "./initiation/reducers/ProcessDashboard.reducer";
import snapshot from "./initiation/reducers/Snapshot.reducer";
import user from "./initiation/reducers/User.reducer";
import workFlowManagement from "./initiation/reducers/workflowManagement.reducer";
/* LI > */

/* CRM < */
import address from "./crm/reducers/Address.reducer";
import cddinfo from "./crm/reducers/CddInfo.reducer";
// import config from "./Configuration.reducer";
import companyStructure from "./crm/reducers/CompanyStructure.reducer";
import contact from "./crm/reducers/Contact.reducer";
import customer from "./crm/reducers/Customer.reducer";
import highRiskRegister from "./crm/reducers/HighRiskRegister.reducer";
import person from "./crm/reducers/Person.reducer";
import personIdentity from "./crm/reducers/PersonIdentity.reducer";
// import snapshot from "./Snapshot.reducer";
import stakeholder from "./crm/reducers/Stakeholder.reducer";
// import user from "./User.reducer";
/* CRM > */

/* LM < */

import contracts from './loanmanagement/reducers/Contracts';
import mandates from './loanmanagement/reducers/Mandates';
import payments from './loanmanagement/reducers/Payments';
import headerNavigation from './loanmanagement/reducers/HeaderNavigation';
import dashboardLoanDetails from './loanmanagement/reducers/Dashboard';
import customerDetails from './loanmanagement/reducers/CustomerDetails';
import interestPenalty from './loanmanagement/reducers/InterestPenalty';
// import notifier from "./loanmanagement/reducers/Notifier";
import provisionOverview from './loanmanagement/reducers/provisionOverview';
import sbi from './loanmanagement/reducers/SBI';
import reports from './loanmanagement/reducers/Reports';
import provisionParameters from './loanmanagement/reducers/ProvisionParameters';
import loanStopHistory from './loanmanagement/reducers/SmeLoanTemporaryLoanStop';
import loanRecoveryAppointments from './loanmanagement/reducers/LoanRecoveryApointments';
import loans from './loanmanagement/reducers/Loans';
import loancontracts from './loanmanagement/reducers/LoanContracts';
import smeLoanTransaction from './loanmanagement/reducers/SmeLoanTransaction';
import smemandates from './loanmanagement/reducers/SmeMandates';
import bankTransactions from './loanmanagement/reducers/BankTransactions';
import smeLoanHistory from './loanmanagement/reducers/SmeLoanHistory';
import directdebitbatchs from './loanmanagement/reducers/DirectDebitBatch';
import smeLoans from './loanmanagement/reducers/SmeLoans';
import loanlatepaymentoverview from './loanmanagement/reducers/LoanLatePaymentOverview';
import notifications from './loanmanagement/reducers/Notifications';
import smes from './loanmanagement/reducers/Smes';
// import snapshot from './loanmanagement/reducers/Snapshot.reducer';
import generatepaymentrequest from './loanmanagement/reducers/GeneratePaymentRequest';
import configurations from './loanmanagement/reducers/Configurations.reducer';
import flexLoanOverview from './loanmanagement/reducers/FlexLoan';
import lmglobal from './loanmanagement/reducers/LMGlobal.reducer';
// import user from "./loanmanagement/reducers/User.reducer";
/* LM > */

const rootReducer = combineReducers({
  bankAccount,
  baiOverview,
  bankTransactionsLI,
  config,
  contract,
  creditRiskOverview,
  debtForm,
  loanRequest,
  notifier,
  processDashboard,
  snapshot,
  user,
  workFlowManagement,
  address, //Starting CRM Related
  cddinfo,
  // config,
  contact,
  customer,
  highRiskRegister,
  personIdentity,
  person,
  // notifier,
  // snapshot,
  stakeholder,
  companyStructure,
  // user,
  contracts, //Starting LM Related
  mandates,
  payments,
  headerNavigation,
  dashboardLoanDetails,
  customerDetails,
  interestPenalty,
  // notifier,
  provisionOverview,
  reports,
  loanStopHistory,
  sbi,
  provisionParameters,
  loanRecoveryAppointments,
  loans,
  loancontracts,
  smeLoanTransaction,
  smemandates,
  bankTransactions,
  smeLoanHistory,
  directdebitbatchs,
  smeLoans,
  loanlatepaymentoverview,
  notifications,
  smes,
  // snapshot,
  generatepaymentrequest,
  configurations,
  flexLoanOverview,
  lmglobal,
  // user,
});

export default rootReducer;