import React from 'react';
/* LI < */
import ComingSoon from 'views/initiation/ComingSoon/ComingSoon';
import CreditManagementCharts from "views/initiation/CreditManagement/Charts/CreditManagementCharts";
import CreditManagementCategories from "views/initiation/CreditManagement/Categories/CreditManagementCategories";
import CreditManagementInternalTypes from "views/initiation/CreditManagement/InternalTypes/CreditManagementInternalTypes";
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
import MyTaskList from 'views/initiation/ProcessDashboard/MyTaskList';
import ParametersOverview from 'views/initiation/CreditManagement/Parameters/ParametersOverview';
import CustomerProcessOverview from 'views/initiation/ProcessDashboard/CustomerProcessOverview';
import StatusProcessOverview from 'views/initiation/ProcessDashboard/StatusProcessOverview';
import CheckTransactionOverview from 'views/initiation/CreditManagement/CheckTransactions/CheckTransactionOverview';
import FirstAnalysesOverview from "views/initiation/CreditManagement/FirstAnalyses/FirstAnalysesOverview";
/* LI > */

/* CRM Portal < */
import SmeList from 'views/crm/SmeList/SmeList';
import SmeOverview from 'views/crm/SmeOverview/index';
import SmeDetailView from 'views/crm/SmeOverview/SmeOverview';
import PersonDetailView from 'views/crm/SmeOverview/PersonOverview';
import StakeholderOverview from 'views/crm/SmeOverview/StakeholderOverview';
import CompanyStructureOverview from 'views/crm/SmeOverview/CompanyStructureOverview';
import CrmAdminDashboard from "views/crm/Dashboard/AdminDashboard";
import MemoOverview from 'views/crm/MemoOverview/index';
import SendSmsOverview from 'views/crm/SendSmsOverview/SendSmsOverview';
/* CRM Portal > */

/* LM Portal < */
import SmeListLM from "views/loanmanagement/SmeList/SmeList.jsx";
import Overview from "views/loanmanagement/Overview/Overview.jsx";
import SettingsView from "views/loanmanagement/Settings/index.jsx";
// import SingleLoanOverview from "views/loanmanagement/SingleLoanOverview";
// import SingleLoanOverview from "views/loanmanagement/SingleLoanOverview/LoanOverviewGateway";
import SingleLoanOverview from "views/loanmanagement/IntegratedSingleLoanOverview";
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
import AddOrChangeFlexLoans from 'components/loanmanagement/FlexLoans/AddOrChangeFlexLoans';
import WithdrawalOverview from 'components/loanmanagement/FlexLoans/WithdrawalOverview';
import Messages from 'views/loanmanagement/SingleLoanOverview/Messages';// TODO rename these comps specifically
import Transactions from 'views/loanmanagement/SingleLoanOverview/Transactions';// TODO rename these comps specifically
import ManualPayments from 'views/loanmanagement/SingleLoanOverview/ManualPayments';// TODO rename these comps specifically
import LoansGivenOverview from 'views/loanmanagement/LoanGivenOverview/LoanGivenOverview';
import MandateApprovalOverview from "views/loanmanagement/MandateApprovalOverview/MandateApprovalOverview";


import ReservedDashboardItem from 'views/common/DashboardView/ReservedDashboardItem';
const Components = {
    ComingSoon, CreditManagementCharts, BAIOverview, AdminDashboard, MyTaskList, SmeDetailView, PersonDetailView,/* Processes, */
    StartInstance, DebtFormOverview, BanksOverview, CategoryRules, LoanRequestOverview, StakeholderOverview, ParametersOverview,
    PlatformOverview, WorkflowManagement, ContractOverviewNew, BankTransactionTypeOverview, CompanyStructureOverview, WithdrawalOverview,
    SingleAccountOverview, ProcessDashboard, SmeList, SmeOverview, CrmAdminDashboard, MemoOverview, CreditManagementCategories,
    SmeListLM, Overview, SettingsView, SingleLoanOverview, DashboardPageLM, Notifications, AdminDashboardLM, AddOrChangeFlexLoans,
    ProvisionParameters, FlexLoanOverview, /* ChamberOfCommerce, */ LoanTemporaryStop, ProvisionOverview, CreditManagementInternalTypes,
    SpreadRiskOverview, BookPlannedIncome, MultipleLoanOverview, BankTransactionOverview, LoanLatePaymentOverview,
    SmeLoanTransactionsList, DirectDebitBatchDetails, SmeLoanRecoveryAppointment, LiquidityRequirementsOverview, ParameterDashboard,
    CustomerProcessOverview, StatusProcessOverview, Messages, Transactions,ManualPayments,ReservedDashboardItem, CheckTransactionOverview, 
    FirstAnalysesOverview, LoansGivenOverview, MandateApprovalOverview, SendSmsOverview
};

export const getComponentByWireFrame = (wireFrame) => {

    if (typeof Components[wireFrame] !== "undefined") {
        return React.createElement(Components[wireFrame], null);
    }

    return React.createElement(() => <div>The component has not been created yet.</div>, null);

};