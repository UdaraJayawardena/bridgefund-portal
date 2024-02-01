import { combineReducers } from 'redux';

import contracts from './Contracts';
import mandates from './Mandates';
import payments from './Payments';
import headerNavigation from './HeaderNavigation';
import dashboardLoanDetails from './Dashboard';
import customerDetails from './CustomerDetails';
import interestPenalty from './InterestPenalty';
import notifier from "./Notifier";
import provisionOverview from './provisionOverview';
import sbi from './SBI';
import reports from './Reports';
import provisionParameters from './ProvisionParameters';
import loanStopHistory from './SmeLoanTemporaryLoanStop';
import loanRecoveryAppointments from './LoanRecoveryApointments';
import loans from './Loans';
import loancontracts from './LoanContracts';
import smeLoanTransaction from './SmeLoanTransaction';
import smemandates from './SmeMandates';
import bankTransactions from './BankTransactions';
import smeLoanHistory from './SmeLoanHistory';
import directdebitbatchs from './DirectDebitBatch';
import smeLoans from './SmeLoans';
import loanlatepaymentoverview from './LoanLatePaymentOverview';
import notifications from './Notifications';
import smes from './Smes';
import snapshot from './Snapshot.reducer';
import generatepaymentrequest from './GeneratePaymentRequest';
import configurations from './Configurations.reducer';
import flexLoanOverview from './FlexLoan';
import user from "./User.reducer";

const rootReducer = combineReducers({
  contracts,
  mandates,
  payments,
  headerNavigation,
  dashboardLoanDetails,
  customerDetails,
  interestPenalty,
  notifier,
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
  snapshot,
  generatepaymentrequest,
  configurations,
  flexLoanOverview,
  user,
});

export default rootReducer;
