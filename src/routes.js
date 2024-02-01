import {
  List,
  Work,
  Help,
  Euro,
  Pause,
  Person,
  Ballot,
  Category,
  Beenhere,
  Settings,
  Dashboard,
  HowToVote,
  VideoLabel,
  Assessment,
  TrendingUp,
  Description,
  ScatterPlot,
  PriorityHigh,
  AccountCircle,
  AccountBalance,
  ChromeReaderMode,
  AccountBalanceWallet,
  SupervisedUserCircle,
  ListAlt,
  SettingsApplications
} from "@material-ui/icons";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountTreeIcon from '@material-ui/icons/AccountTree';


import { ReactComponent as ProvisionOverviewIcon } from "assets/icons/provision-icon.svg";
import { ReactComponent as SpreadRiskIcon } from "assets/icons/spread-risk-icon.svg";
import { ReactComponent as MultipleLoanOverviewIcon } from "assets/icons/multiple-loan-overview.svg";
import { ReactComponent as BankTransactionIcon } from "assets/icons/bank-transaction.svg";
import { ReactComponent as LoanLatePaymentOverviewIcon } from "assets/icons/loan-late-payment.svg";
import { ReactComponent as LoanRecoveryAppointmentIcon } from "assets/icons/loan-recovery-appointment.svg";
import { ReactComponent as ContractDashboardIcon } from "assets/icons/file-text.svg";
import { ReactComponent as RiskDashboardIcon } from "assets/icons/shuffle.svg";
import { ReactComponent as LoansDashboardIcon } from "assets/icons/list.svg";
import { ReactComponent as AssetManagerDashboardIcon } from "assets/icons/trello.svg";
import { ReactComponent as UserManagementDashboardIcon } from "assets/icons/book-open.svg";
import { ReactComponent as SystemParametersDashboardIcon } from "assets/icons/users.svg";
import { ReactComponent as CustomerDashboardIcon } from "assets/icons/server.svg";
// import { ReactComponent as FinanceDashboardIcon } from "assets/icons/server.svg";
// import { ReactComponent as WorkflowDashboardIcon } from "assets/icons/server.svg";

/* LI < */
import ComingSoon from 'views/initiation/ComingSoon/ComingSoon';
import DashboardPage from "views/initiation/Dashboard/Dashboard";
import BAIOverview from "views/initiation/BAIOverview/BAIOverview";
import AdminDashboard from "views/initiation/Dashboard/AdminDashboard";
import StartInstance from "views/initiation/StartInstance/startInstance";
import BanksOverview from "views/initiation/BanksOverview/BanksOverview";
import CategoryRules from "views/initiation/CategoryRules/CategoryRules";
import LoanRequestOverview from 'views/initiation/LoanRequestOverview/index';
import PlatformOverview from "views/initiation/PlatformOverview/PlatformOverview";
import WorkflowManagement from 'views/initiation/WorkflowManagementOverview/index';
import ContractOverviewNew from 'views/initiation/ContractOverview/ContractOverviewNew';
import DebtFormOverview from "views/initiation/InternalDebtFormOverview/DebtForm";
import BankTransactionTypeOverview from 'views/initiation/BankTrasactionTypeOverview/BankTrasactionTypeOverview';
import SingleAccountOverview from 'views/initiation/SingleAccountOverview/SingleAccountOverview';
import ProcessDashboard from 'views/initiation/ProcessDashboard';
import ParameterDashboard from 'views/initiation/Dashboard/ParameterDashboard';
import FirstAnalysesOverview from "views/initiation/CreditManagement/FirstAnalyses/FirstAnalysesOverview";
/* LI > */

/* CRM Portal < */
import SmeList from 'views/crm/SmeList/SmeList';
import SmeOverview from 'views/crm/SmeOverview/index';
// import ComingSoon from 'views/crm/ComingSoon/ComingSoon';
// import DashboardPage from 'views/crm/Dashboard/Dashboard';
import CrmAdminDashboard from "views/crm/Dashboard/AdminDashboard";
import MemoOverview from 'views/crm/MemoOverview/index';
import SendSmsOverview from "views/crm/SendSmsOverview/SendSmsOverview";
/* CRM Portal > */

/* LM Portal < */
import SmeListLM from "views/loanmanagement/SmeList/SmeList.jsx";
import Overview from "views/loanmanagement/Overview/Overview.jsx";
import SettingsView from "views/loanmanagement/Settings/index.jsx";
// import ComingSoon from 'views/loanmanagement/ComingSoon/ComingSoon';
import SingleLoanOverview from "views/loanmanagement/IntegratedSingleLoanOverview"; // need to uncomment when dshborad is live
import DashboardPageLM from "views/loanmanagement/Dashboard/Dashboard.jsx";
import Notifications from "views/loanmanagement/SystemLogs/LogsOverview.jsx";
import AdminDashboardLM from "views/loanmanagement/Dashboard/AdminDashboard.jsx";
import ProvisionParameters from "components/loanmanagement/Setting/Setting.jsx";
import FlexLoanOverview from "views/loanmanagement/FlexLoanOverview/FlexLoanOverview";
// import ChamberOfCommerce from "views/loanmanagement/ChamberOfCommerce/ChamberOfCommerce";
import LoanTemporaryStop from "views/loanmanagement/LoanTemporaryStop/LoanTemporaryStop";
import ProvisionOverview from "views/loanmanagement/ProvisionOverview/ProvisionOverview";
import SpreadRiskOverview from "views/loanmanagement/SpreadRiskOverview/SpreadRiskOverview";
import BookPlannedIncome from "views/loanmanagement/BookSmeLoanPlannedIncome/BookPlannedIncome";
import MultipleLoanOverview from "views/loanmanagement/MultipleLoanOverview/MultipleLoanOverview";
import BankTransactionOverview from "views/loanmanagement/BankTransactionOverview/BankTransactionOverview";
import LoanLatePaymentOverview from "views/loanmanagement/LoanLatePaymentOverview/LoanLatePaymentOverview";
import SmeLoanTransactionsList from "views/loanmanagement/SmeLoanTransactionEditor/SmeLoanTransactionsList";
import DirectDebitBatchDetails from "views/loanmanagement/DirectDebitBatchDetails/DirectDebitBatchDetails.jsx";
import SmeLoanRecoveryAppointment from "views/loanmanagement/LoanRecoveryAppointment/SmeLoanRecoveryAppointment";
import LiquidityRequirementsOverview from "views/loanmanagement/LiquidityRequirementsOverview/LiquidityRequirementsOverview";
import GenericTabContainer from "views/common/DashboardView/GenericTabContainer";
import LoansGivenOverview from "views/loanmanagement/LoanGivenOverview/LoanGivenOverview";
import MandateApprovalOverview from "views/loanmanagement/MandateApprovalOverview/MandateApprovalOverview";

/* LM Portal > */
import MyDashboard from 'views/common/DashboardView/MyDashboard/MyDashboard';

import { decriptedRoutes } from './lib/initiation/userPermission';

const routeTools = {
  icons: {
    List,
    Work,
    Help,
    Euro,
    Pause,
    Person,
    Ballot,
    ListAlt,
    Category,
    Beenhere,
    Settings,
    Dashboard,
    HowToVote,
    VideoLabel,
    Assessment,
    TrendingUp,
    Description,
    ScatterPlot,
    PriorityHigh,
    AccountCircle,
    AccountBalance,
    ChromeReaderMode,
    AccountBalanceWallet,
    SupervisedUserCircle, ProvisionOverviewIcon, SpreadRiskIcon, MultipleLoanOverviewIcon, BankTransactionIcon, 
    LoanLatePaymentOverviewIcon, LoanRecoveryAppointmentIcon, SettingsApplications,
    ContractDashboardIcon,RiskDashboardIcon,LoansDashboardIcon,AssetManagerDashboardIcon,
    UserManagementDashboardIcon,SystemParametersDashboardIcon,CustomerDashboardIcon,AttachMoneyIcon,AccountTreeIcon
  },
  components: { ComingSoon, DashboardPage, BAIOverview, AdminDashboard, 
    StartInstance, DebtFormOverview, BanksOverview, CategoryRules, LoanRequestOverview, 
    PlatformOverview, WorkflowManagement, ContractOverviewNew, BankTransactionTypeOverview, 
    SingleAccountOverview, ProcessDashboard, SmeList, SmeOverview, CrmAdminDashboard, MemoOverview,
    SmeListLM, Overview, SettingsView, SingleLoanOverview, DashboardPageLM, Notifications, AdminDashboardLM, 
    ProvisionParameters, FlexLoanOverview, /* ChamberOfCommerce, */ LoanTemporaryStop, ProvisionOverview, 
    SpreadRiskOverview, BookPlannedIncome, MultipleLoanOverview, BankTransactionOverview, LoanLatePaymentOverview, 
    SmeLoanTransactionsList, DirectDebitBatchDetails, SmeLoanRecoveryAppointment, LiquidityRequirementsOverview,
    ParameterDashboard, GenericTabContainer, MyDashboard, FirstAnalysesOverview, LoansGivenOverview, MandateApprovalOverview,
    SendSmsOverview
  }
};

const _mapIconAndComponent = (route) => {
  if (typeof route.component === 'string' && route.component && (route.cluster === 'LoanInitiation' || route.cluster === 'CRM' || route.cluster === 'LoanManagement')) route.component = routeTools.components[route.component];
  if (typeof route.icon === 'string' && route.icon) route.icon = routeTools.icons[route.icon];
  if (route.children && Array.isArray(route.children)) {
    route.children = route.children.map(childRoute => _mapIconAndComponent(childRoute));
  }
  return route;
};

export const userPermittedRoutes = () => decriptedRoutes().map(route => _mapIconAndComponent(route));
