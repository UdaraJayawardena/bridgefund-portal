/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput.jsx';

import GeneratePaymentRequest from 'views/loanmanagement/GeneratePaymentRequest/GeneratePaymentRequest';

import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import { AddCircle, RemoveCircle, PlayCircleOutline } from '@material-ui/icons';

import Autocomplete from "@material-ui/lab/Autocomplete";

import { ENVIRONMENT } from "constants/loanmanagement/config";
import { smeLoanStatus, approveRevisionStep, approveRevisionRoles } from "constants/loanmanagement/sme-loan";
import { DDstatus } from 'constants/loanmanagement/sme-loan-repayment-direct-debits'

import {
  TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, DialogContentText, FormControl, InputLabel, Select, MenuItem, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Tooltip,
  Drawer, CircularProgress, RadioGroup, FormControlLabel, Radio
} from "@material-ui/core";

import MomentUtils from "@date-io/moment";

import Utility from "lib/loanmanagement/utility";
import { getLogedInUseRole } from 'lib/loanmanagement/userPermission';

import { requestSmeLoan, startStopSmeLoanInterestPenalty, getPlatformParameters } from "store/loanmanagement/actions/SmeLoans";
import { requestCustomerByVTigerIdPromise } from "store/loanmanagement/actions/Customers";
import { showGeneratePaymentRequest } from 'store/loanmanagement/actions/GeneratePaymentRequest';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';

import {
  createSmeFlexLoanWithdrawal,
  getFlexLoanOutstandingAmount,
  getFlexLoanLatestWithdrawalOrder,
  clearFlexLoanOverviewData,
  getFlexLoanOverviewData,
  startRevison,
  approveRevision,
  getUserTasks,
  getWithdrwalsforSelectedLoan,
  clearWithdrwalsforSelectedLoan,
  getProcessList,
  updateFlexLoan
} from "store/loanmanagement/actions/FlexLoan.action";

import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import ClaimLoan from '../../../views/loanmanagement/SingleLoanOverview/ClaimLoan';
import RefundLoan from '../../../views/loanmanagement/SingleLoanOverview/RefundLoan';
import { isUserHasPermission } from 'lib/loanmanagement/userPermission';
import { requestMandates, setMandateToEmandate } from 'store/loanmanagement/actions/Mandates';
import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

// import LoanOverview from './LoanOverview';

const PROCESS_DEFINITION_KEY = "revision-flex-loan";
const ACTIVE = 'ACTIVE';

const currencyConvertor = Utility.currencyConverter();

const isProduction = Utility.getEnv() === ENVIRONMENT.PRODUCTION;

// eslint-disable-next-line no-unused-vars
const valueRanges = {
  creditLimitAmount: { min: 5000, max: 100000 },
  withdrawalCostPercentage: { min: 1.00, max: 5.00 },
  recurringInterestCostPercentage: { min: 0.50, max: 2.00 },
  directDebitFrequency: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  numberOfMonths: { min: 3, max: 12 },
  recurringCostCollectDate: { min: 6, max: 28 },
};

const initialWithdrawalState = {
  outstandingAmount: 0,
  currentDdAmount: 0,
  withdrawalAmount: 0,
  withdrawalCosts: 0,
  payout: 0,
  newOutstandingAmount: 0,
  interestOnlyLimit: 0,
  baseForDdCalculation: 0,
  newDdAmount: 0,
  startDate: null,
  instantPayment: 0,
  toSme: 0,
  thirdParties: [0],
  thirdPartyPayments: [{ toSme: 0, thirdParty: 0 }],
  errors: {
    startDate: null,
    newOutstandingAmount: null,
  }
};
const customStyles = (theme) => ({

  bottomPaper: {
    //height: 500,
    borderRadius: "10px",
  },
  topPaper: {
    height: 80,
    borderRadius: "10px",
    display: "flex"
  },
  textInput: {
    padding: '10px'
  },
  customActionButton_Blue: {
    backgroundColor: "#24c4d8",
    borderRadius: "15px",
    height: "30px",
    padding: '6px 30px',
    margin: '10px 20px 10px 20px'
  },
  boxMargin: {
    padding: theme.spacing(1),
  },
  marginStyle: {
    padding: theme.spacing(1)
  },
  borderRightCell: {
    borderRight: '1px solid rgba(224, 224, 224, 1)'
  },
  borderLeftRightCell: {
    borderLeft: '1px solid rgba(224, 224, 224, 1)',
    borderRight: '1px solid rgba(224, 224, 224, 1)'
  },
  tooltipTable: {
    border: '1px solid white',
    borderCollapse: 'collapse'
  },
  tooltipTableHeadCell: {
    border: '1px solid white',
    fontSize: '12pt',
    fontWeight: 'bold',
    padding: theme.spacing(1),
    textAlign: 'center'
  },
  tooltipTableBodyCell: {
    border: '1px solid white',
    fontSize: '10pt',
    padding: theme.spacing(1),
  },
  creditLimitSecondRow: {
    marginTop: '30px'
  },
});

class SingleFlexLoanOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedSmeLoan: {},
      selectedSme: {},
      tikkieDrawerData: {},
      withdrawal: JSON.parse(JSON.stringify(initialWithdrawalState)),
      lastWithdrawalOrder: { newDirectDebitAmount: null },
      nextWorkingDate: null,
      disableWithdrawal: false,
      loading: false,
      error: false,
      errorMessage: '',
      withdrawalPopup: false,
      outstandingAmount: 0,
      contractIdValue: this.props.isDashboardContent ? this.props.lmContractSysId : ((document.location.origin + document.location.pathname).split('FlexLoanOverview/')[1]
        ?
        (document.location.origin + document.location.pathname).split('FlexLoanOverview/')[1]
        : this.props.contractId),
      contractIdInputValue: (document.location.origin + document.location.pathname).split('FlexLoanOverview/')[1]
        ?
        (document.location.origin + document.location.pathname).split('FlexLoanOverview/')[1]
        : this.props.contractId,
      ShowClaimLoanDrawer: false,
      ShowRefundLoanDrawer: false,
      withdrawalPopupError: '',
      withdrawalButtonDisable: false,
      checkWithdrawalPossible: false,
      openWithdrawalPossiblePopup: false,
      showStartRevisionDrawer: false,
      showApproveRevisionDrawer: false,
      ShowChangeCreditLimitDrawer: false,
      taskId: '',
      totalwithdrawals: [],
      totalProfitLossAmount: 0,
      processList: [],
      activeActivity: {},
      approvedActivity: {},
      isApprovedRevisionStageTwo: false,
      isRevisonFinalConfirmation: false,
      showStartFlexLoanDrawer: false,
      revisionAction: "",
      newCreditLimit: 0,
      newAvailableBalance: 0,
      showStartStopInterestPaneltyDrawer: false,
      interestPenaltyIndicator: '',
      sendMessage: 'no',
      contact: '',
      numberOfDatesForRevision: 0
    };

  }

  componentDidMount() {
    this.extractContractId();

    this.props.getPlatformParameters({ platformName: "BridgeFund BV" })
      .then((response) => {
        if (response.success) {
          this.setState({ contact: response.data && response.data[0].contactDetails });
          this.setState({ numberOfDatesForRevision: response.data[0].numberOfDatesForRevision});
        }

      })
      .catch(error => {
        console.error(error);
      });
  }

  extractContractId = () => {
    const { lmContractSysId, isDashboardContent } = this.props;
    const urlContractId = (document.location.origin + document.location.pathname).split('FlexLoanOverview/')[1];
    const contractId = isDashboardContent ? lmContractSysId : (urlContractId ? urlContractId : this.props.contractId);
    if (contractId)
      this.getOverviewData(contractId);

    this.props.getWithdrwalsforSelectedLoan(contractId)
      .then(response => {
        this.setState({ totalwithdrawals: response });
      });
  }

  getOverviewData = async (contract_id = null) => {
    const { lmContractSysId, isDashboardContent } = this.props;
    const contractId = isDashboardContent ? lmContractSysId : (contract_id ? contract_id : this.props.contractId);
    this.props.getFlexLoanOverviewData(contractId);

    this.getProcessDataList(contractId, PROCESS_DEFINITION_KEY);

    try {

      let { lastWithdrawalOrder, selectedSme, selectedSmeLoan } = this.state;

      const { withdrawal } = this.state;

      // if (contractId && this.props.smeLoans) selectedSmeLoan = this.props.smeLoans.find((smeLoan) => smeLoan.contractId === contractId);

      // if (!selectedSmeLoan && contractId) selectedSmeLoan = await this.getSelectedSmeLoan(contractId);

      if (contractId) selectedSmeLoan = await this.getSelectedSmeLoan(contractId);

      if (selectedSmeLoan && selectedSmeLoan.smeId) {
        selectedSme = await this.getSelectedSme(selectedSmeLoan.smeId);
        this.props.requestMandates(selectedSmeLoan.smeId);
      }

      if (selectedSmeLoan && contractId) selectedSmeLoan.outstandingAmount = await this.getFlexLoanOutstandingAmount(contractId);

      if (selectedSmeLoan && selectedSmeLoan.outstandingAmount) withdrawal.newOutstandingAmount = selectedSmeLoan.outstandingAmount;

      if (selectedSmeLoan && contractId) {
        const latest = await this.getFlexLoanLatestWithdrawalOrder(contractId);
        if (latest) lastWithdrawalOrder = latest;
      }

      if (selectedSmeLoan) withdrawal.currentDdAmount = selectedSmeLoan.directDebitAmountFirstPeriod;

      this.setState({ selectedSme, selectedSmeLoan, withdrawal, lastWithdrawalOrder });

    } catch (error) {
      console.log(error);
    }

  }

  getSelectedSmeLoan = (contractId) => {
    return this.props.requestSmeLoan(contractId)
      .then((smeLoan) => smeLoan)
      .catch((error) => { throw Error(error); });
  }

  getSelectedSme = (smeId) => {
    return this.props.requestSmeByIdPromise(smeId)
      .then((sme) => sme)
      .catch((error) => { throw Error(error); });
  }

  getFlexLoanOutstandingAmount = (contractId) => {
    return this.props.getFlexLoanOutstandingAmount(contractId)
      .then((outstandingAmount) => outstandingAmount)
      .catch((error) => { throw Error(error); });
  }

  getFlexLoanLatestWithdrawalOrder = (contractId) => {
    return this.props.getFlexLoanLatestWithdrawalOrder(contractId)
      .then((withdrawalOrder) => withdrawalOrder)
      .catch((error) => { throw Error(error); });
  }

  handleWithdrawalPopup = () => {

    const selectedSmeLoan = this.state.selectedSmeLoan;
    // const { inversConsentsForSme } = this.props;

    this.setState((prevState) => ({ withdrawalPopup: !prevState.withdrawalPopup, loading: !prevState.loading, openWithdrawalPossiblePopup: false }), (contractId = selectedSmeLoan.contractId) => {
      if (this.state.withdrawalPopup) {

        const backlogTransactions = this.props.directdebits.filter(transaction => transaction.type === 'normal-dd' && (transaction.status === 'failed'
          || transaction.status === 'frequently-failed' || transaction.status === 'rejected' || transaction.status === 'frequently-rejected'));

        let validationError = '';

        let withdrawalButtonDisable = false;

        let checkWithdrawalPossible = false;

        if (selectedSmeLoan.status === smeLoanStatus.LOAN_NORMALLY_SETTLED || selectedSmeLoan.status === smeLoanStatus.PAUSED) {

          validationError = 'Loan settled OR mandate not approved. Withdrawal not possible';

          withdrawalButtonDisable = true;

        } else if (backlogTransactions.length > 1) {

          validationError = 'Customer has a backlog; withdrawal impossible';

          withdrawalButtonDisable = true;

        } else if (selectedSmeLoan.status === 'in-revision' || selectedSmeLoan.status === 'revision-disapproved') {

          if (moment(this.getDate()).isAfter(moment(selectedSmeLoan.revisionDate).format('YYYY-MM-DD'))) {

            validationError = 'Withdrawal impossible; loan must be revisioned';

            withdrawalButtonDisable = true;
          } else {

            checkWithdrawalPossible = true;

            validationError = 'Customer is in Revision Period. So, be ALERT';
          }
        }
        // else if (inversConsentsForSme.find(ic => ic.status === 'expired')) {

        //   withdrawalButtonDisable = true;

        //   validationError = 'PSD2 Consent expired. Withdrawal not possible';

        // }

        this.setState({ withdrawalPopupError: validationError, withdrawalButtonDisable: withdrawalButtonDisable, checkWithdrawalPossible: checkWithdrawalPossible });

        this.props.getNextWorkingDate(moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD'), 5)
          .then(async (nextWorkingDate) => {
            const { withdrawal, selectedSmeLoan } = this.state;
            let { lastWithdrawalOrder } = this.state;

            withdrawal.startDate = nextWorkingDate;

            selectedSmeLoan.outstandingAmount = await this.getFlexLoanOutstandingAmount(contractId);

            withdrawal.outstandingAmount = selectedSmeLoan.outstandingAmount;

            // if( selectedSmeLoan.outstandingAmount && selectedSmeLoan.outstandingAmount > 0 ) selectedSmeLoan.outstandingAmount *= -1;

            if (selectedSmeLoan && this.props.contractId) {
              const latest = await this.getFlexLoanLatestWithdrawalOrder(this.props.contractId);
              if (latest) lastWithdrawalOrder = latest;
            }

            this.setState({ withdrawal, selectedSmeLoan, nextWorkingDate, lastWithdrawalOrder, disableWithdrawal: false, loading: false });
          })
          .catch(() => { this.setState({ disableWithdrawal: true, loading: false }); });

      } else {
        this.setState({ withdrawal: JSON.parse(JSON.stringify(initialWithdrawalState)), loading: false }, () => { this.extractContractId(); });
      }
    });
  }

  getDate = () => {
    if (!isProduction) return moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
    return moment().format('YYYY-MM-DD');
  }

  handleGeneratePaymentRequest = () => {

    this.setState({
      tikkieDrawerData: Utility.preparePaymentRequest(this.state.selectedSmeLoan, this.props.directdebits, this.state.lastWithdrawalOrder)
    }, () => this.props.showGeneratePaymentRequest());

  }

  toggleDrawer = (container, side, open) => () => {
    this.setState({
      [side]: open
    });
    switch (container) {
      case 'generatePaymentRequest':
        this.props.showGeneratePaymentRequest();
        break;
      default:
        break;
    }
  };

  placeTheWithdrawal = () => {
    const { withdrawal, selectedSmeLoan, selectedSme } = this.state;

    const toSmeAmount = this.getAmountToSme();

    const toThirdPartyAmount = withdrawal.thirdParties.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (withdrawal.withdrawalAmount !== toSmeAmount + toThirdPartyAmount + withdrawal.withdrawalCosts) return this.props.displayNotification('Pay-outs + withdrawal-cost must be equal to withdrwal-amount; please change amounts', 'warning');

    const smeName = selectedSme.company ? selectedSme.company : (`${selectedSme.firstName} ${selectedSme.lastName}`);

    const requestObject = {
      loanId: selectedSmeLoan._id,
      contractId: selectedSmeLoan.contractId,
      smeId: selectedSmeLoan.smeId,
      instantPayment: !!(withdrawal.instantPayment),
      smeName,
      smeFlexLoanWithdrawal: {
        outstandingAmount: this.getBaseForNewAmount(),
        withdrawalAmount: withdrawal.withdrawalAmount,
        newOutstandingAmount: withdrawal.newOutstandingAmount,
        interestOnlyLimit: withdrawal.interestOnlyLimit,
        baseForDdCalculation: this.getBaseForDdCalculation(),
        // baseForDdCalculation: withdrawal.baseForDdCalculation,
        plannedNumberOfDirectDebit: selectedSmeLoan.plannedNumberOfDirectDebit,
        newDdAmount: this.getNewDdAmount(),
        // newDdAmount: withdrawal.newDdAmount,

        withdrawalCosts: withdrawal.withdrawalCosts,
        startDate: withdrawal.startDate,
        directDebitFrequency: selectedSmeLoan.directDebitFrequency,
        instantPayment: !!(withdrawal.instantPayment),
        thirdParties: withdrawal.thirdParties,
        payout: withdrawal.payout,
        toSme: toSmeAmount,
        // smeName,
      }
    };

    this.setState({ loading: true }, () => {

      return this.props.createSmeFlexLoanWithdrawal(requestObject)
        .then(() => {
          // console.log(response);
          this.handleWithdrawalPopup();
        })
        .catch(() => {
          this.setState({ loading: false, openWithdrawalPossiblePopup: false });
        });

    });
  }

  checkWithdrawalPossible = () => {

    if (this.state.checkWithdrawalPossible) return this.setState({ openWithdrawalPossiblePopup: true });
    return this.placeTheWithdrawal();
  };

  closeWithdrawalPossiblePopup = () => {

    return this.setState({ openWithdrawalPossiblePopup: false });
  }

  getAmountToSme = () => {
    return Number(this.state.withdrawal.payout) - Number(this.state.withdrawal.thirdParties.reduce((accumulator, currentValue) => (accumulator + currentValue), 0));
  }

  getBaseForDdCalculation = () => {
    //sum (new-outstanding-amount - interest-only-limit-amount)
    return (Number(this.state.withdrawal.newOutstandingAmount) * -1) - Number(this.state.withdrawal.interestOnlyLimit);
  }

  getNewDdAmount = () => {
    //base-for-dd-calculation / sme-loan.planned-number-of-direct-debit
    const baseForDdCalculation = this.getBaseForDdCalculation();
    const newDdAmount = (baseForDdCalculation === 0) ? baseForDdCalculation :
      (baseForDdCalculation / Number(this.state.selectedSmeLoan.plannedNumberOfDirectDebit));

    return newDdAmount;
  }

  getSentToBankAmount = () => {

    const sentToBankTransactions = this.props.directdebits.filter(transaction => transaction.status === 'sent-to-bank')
      .reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);

    return sentToBankTransactions;
  }

  getBaseForNewAmount = () => {

    const baseForNewAmount = (-1 * (this.state.selectedSmeLoan.outstandingAmount ? this.state.selectedSmeLoan.outstandingAmount : 0)) - this.getSentToBankAmount();

    return baseForNewAmount;
  }

  getNewOutStandingAmount = () => {

    const newOutStandingAmount = this.getBaseForNewAmount() + this.state.withdrawal.withdrawalAmount;

    return newOutStandingAmount;
  }

  handleWithdrawalAmountChanges = (value, fieldName) => {
    const { withdrawal, selectedSmeLoan } = this.state;
    withdrawal[fieldName] = Number(value);
    withdrawal['withdrawalCosts'] = Number(value) * (Number(selectedSmeLoan.withdrawalCostPercentage) / 100);
    withdrawal['payout'] = Number(value) - withdrawal['withdrawalCosts'];
    withdrawal['newOutstandingAmount'] = (Number(value) * -1) + selectedSmeLoan.outstandingAmount;

    withdrawal.errors.newOutstandingAmount = ((withdrawal['newOutstandingAmount'] * -1) > Number(this.state.selectedSmeLoan.creditLimitAmount)) ?
      'New outstanding amount bigger than credit-limit; change withdrawal-amount' : null;

    this.setState({ withdrawal });
  }

  handleInterestOnlyLimitChanges = (value, fieldName) => {
    const { withdrawal } = this.state;
    const max = Number(this.state.selectedSmeLoan.creditLimitAmount) * 0.1;
    withdrawal[fieldName] = (Number(value) > max) ? max : Number(value);
    this.setState({ withdrawal });
  }

  // handleNewDdAmountChanges = (value, fieldName) => {
  //   const { withdrawal } = this.state;
  //   withdrawal[fieldName] = Number(value);
  //   this.setState({ withdrawal });
  // }

  handleAmountChanges = (value, fieldName) => {
    const { withdrawal } = this.state;
    withdrawal[fieldName] = Number(value);
    this.setState({ withdrawal });
  }

  handleThirdPartyValuesChanges = (value, fieldName) => {
    const fieldDetails = fieldName.split('_');
    const { withdrawal } = this.state;
    withdrawal[fieldDetails[0]][fieldDetails[1]] = Number(value);
    this.setState({ withdrawal });
  }

  handleDropDownChanges = (event) => {
    const { withdrawal } = this.state;
    withdrawal.instantPayment = Number(event.target.value);
    if (Number(withdrawal.instantPayment) === 0) withdrawal.thirdParties = [0];
    this.setState({ withdrawal });
  }

  addThirdPartySection = () => {
    const { withdrawal } = this.state;
    withdrawal.thirdParties.push(0);
    this.setState({ withdrawal });
  }

  removeThirdPartySection = (index) => {
    const { withdrawal } = this.state;
    withdrawal.thirdParties.splice(index, 1);
    this.setState({ withdrawal });
  }

  handleWithdrawalStartDateChanges = (date) => {
    if (moment(date).isSameOrAfter(moment(this.state.nextWorkingDate))) {

      this.props.getNextWorkingDate(moment(date).subtract(1, 'day').format('YYYY-MM-DD'), 1)
        .then((nextWorkingDate) => {

          const { withdrawal } = this.state;
          withdrawal.startDate = nextWorkingDate;
          this.setState({ withdrawal });

        })
        .catch(() => { this.setState({ disableWithdrawal: true }); });

    }
  }

  isAnyError = () => {

    const { withdrawal } = this.state;

    let isAnyError = false;
    let errorMessage = null;

    for (const item in withdrawal.errors) {
      if (withdrawal.errors[item]) {
        isAnyError = true;
        errorMessage = withdrawal.errors[item];
      }
    }

    return [isAnyError, errorMessage];

  }

  numberFormating = (number, suffix = '', prefix = '') => {
    try {
      if (!number || number === '') return 0;

      const value = number.toString();

      let output = value;

      const [integerValue, floatValues] = value.match(/\./g) ? value.split(/\./g) : [value, '00'];

      if (integerValue && integerValue.length > 3) {
        let placeholder = Array.from(integerValue).reverse().join('');
        placeholder = placeholder.match(/.{1,3}/g).join('.');
        placeholder = Array.from(placeholder).reverse().join('');

        output = `${placeholder},${floatValues}`;

      } else {
        output = `${integerValue},${floatValues}`;
      }

      return `${prefix}${output}${suffix}`;
    } catch {
      return `${prefix}${number}${suffix}`;
    }
  }

  getPartialAmount = () => {
    if (this.state.selectedSmeLoan.status === 'loan-normally-settled')
      return 0;
    return this.props.overview.partialOutstandingAmount;
  }

  setContractIdInUrl = (id) => {

    let URL = (document.location.origin + document.location.pathname).split('FlexLoanOverview')[0] + 'FlexLoanOverview';
    // console.log("URL ", URL);
    if (id)
      URL = URL + '/' + id;
    window.history.pushState({ path: URL }, "", URL);
  };

  handleClaimLoanScreen = () => {
    this.handleClaimScreen();
  }

  handleClaimScreen = () => {
    this.setState({ ShowClaimLoanDrawer: !this.state.ShowClaimLoanDrawer });


  }

  handleRefundLoanScreen = () => {
    this.handleRefundScreen();
  }

  handleRefundScreen = () => {
    this.setState({ ShowRefundLoanDrawer: !this.state.ShowRefundLoanDrawer });
  }

  handleOpenStartRevisionConfimation = () => {
    this.setState({ showStartRevisionDrawer: !this.state.showStartRevisionDrawer });
  }

  handleChangeCreditLimit = () => {
    this.setState({ ShowChangeCreditLimitDrawer: !this.state.ShowChangeCreditLimitDrawer });
  }

  handleStartRevisionConfimation = () => {
    const { numberOfDatesForRevision } = this.state;
    const smeLoanStartRevisionObj = {
      "key": "start-revision-flex-loan",
      "businessKey": this.state.selectedSmeLoan && this.state.selectedSmeLoan.contractId,
      "variables": {
        "loanId": { "value": this.state.selectedSmeLoan && this.state.selectedSmeLoan._id, "type": "String" },
        "contractId": { "value": this.state.selectedSmeLoan && this.state.selectedSmeLoan.contractId, "type": "String" },
        "customerId": { "value": this.state.selectedSme && this.state.selectedSme.id, "type": "String" },
        "revisionDate": { "value": moment(this.getDate()).add(numberOfDatesForRevision, 'days').format('YYYY-MM-DD') , "type": "String" },
        "status": { "value": "in-revision", "type": "String" },
        "messageType": { "value": 1, "type": "Integer" },
        "creditLimitAmount": { "value": this.state.selectedSmeLoan && this.state.selectedSmeLoan.creditLimitAmount, "type": "Double" }
      }
    };

    this.props.startRevison(smeLoanStartRevisionObj)
      .then((response) => {
        if (response.success) {
          this.props.displayNotification('Revision started successfully', 'success');
          this.setState({ showStartRevisionDrawer: !this.state.showStartRevisionDrawer });
        }
      })
      .catch((err) => {
        this.props.displayNotification('Revision started Error', 'error');
      });
  }

  handleApproveRevisionConfimation = () => {
    const { activeActivity, revisionAction } = this.state;

    const isApproved = revisionAction === "approved" ? true : false;

    // eslint-disable-next-line no-nested-ternary
    const variableType = activeActivity.activityId === approveRevisionStep.REVISION_ONE ?
      { "isApprovedRiskManager1": { "value": isApproved, "type": "Boolean" } } :
      activeActivity.activityId === approveRevisionStep.REVISION_TWO ?
        { "isApprovedRiskManager2": { "value": isApproved, "type": "Boolean" } } :
        { "isApprovedRiskSupervisor": { "value": isApproved, "type": "Boolean" } };

    const reqObj = {
      "businessKey": this.state.contractIdValue,
      "taskDefinitionKey": activeActivity.activityId,
      "processDefinitionKey": PROCESS_DEFINITION_KEY,
      "variables": variableType
    };
    this.props.approveRevision(reqObj)
      .then((response) => {
        if (response.success) {
          this.getProcessDataList(this.state.contractIdValue, PROCESS_DEFINITION_KEY);

          revisionAction === "approved" ?
            this.props.displayNotification('Revision approved successfully', 'success') :
            this.props.displayNotification('Revision disapproved successfully', 'success');

          this.setState({ showApproveRevisionDrawer: false, isRevisonFinalConfirmation: false });
        }
      })
      .catch((err) => {
        this.props.displayNotification('Revision approved Error', 'error');
      });

  }

  handleOpenApproveRevisionConfimation = () => {
    const { activeActivity, approvedActivity } = this.state;

    const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;

    const revisionOneAssignee = approvedActivity && Object.keys(approvedActivity).length === 0 ? "" : approvedActivity;
    const user = sessionStorage.getItem('user');

    this.setState({
      taskId: activeActivity && Object.keys(activeActivity).length === 0 ? '' : activeActivity.id,
      showApproveRevisionDrawer: !this.state.showApproveRevisionDrawer,
      isApprovedRevisionStageTwo: (approveRevisionStep.REVISION_TWO === activityId && revisionOneAssignee.assignee === user) ? true : false,
      isRevisonFinalConfirmation: false
    });

  }

  isEnableStartFlexLoanButton = () => {
    // console.log('in isEnableStartFlexLoanButton ', this.props.activeMandateByCustomer);
    const value = this.props.directdebits.find(dd =>
    (dd.ourReference === (dd.contractId + '-PROEFINCASSO')
      && (dd.type === 'special-dd') && (dd.status === 'paid' || dd.status === 'sent-to-bank')));

    if (value && this.props.activeMandateByCustomer.eMandate === false)
      return true;
    return false;
  }

  enableApproveDisApproveRevision = () => {

    const { activeActivity } = this.state;

    const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;

    const userRole = getLogedInUseRole();

    //check the user role if Credit Analyst or Risk Supervisor
    let isActivate = false;

    if (isUserHasPermission('LM-approve-dis-approve-revision-button', 'Edit')) {

      switch (userRole) {
        case approveRevisionRoles.CREDIT_ANALYST:
          isActivate = this.checkStepOneAndTwo(activityId);
          break;

        case approveRevisionRoles.RISK_SUPERVISOR:
          isActivate = this.checkStepForSupervisor(activityId);
          break;
        default: break;
      }
    }
    return isActivate;
  }

  checkStepOneAndTwo = (activityId) => {

    if (approveRevisionStep.REVISION_ONE === activityId) {
      return true;
    }

    if (approveRevisionStep.REVISION_TWO === activityId) {
      return true;
    }

    return false;
  }

  checkStepForSupervisor = (activityId) => {

    if (approveRevisionStep.REVISION_ONE === activityId) {
      return true;
    }

    if (approveRevisionStep.REVISION_TWO === activityId) {
      return true;
    }

    if (approveRevisionStep.REVISION_THREE === activityId) {
      return true;
    }

    return false;
  }

  getProcessDataList = (contractId, PROCESS_DEFINITION_KEY) => {
    this.props.getProcessList(contractId, PROCESS_DEFINITION_KEY, ACTIVE)
      .then(response => {
        const selectedActiveProcess = response && response.data.records.length === 0 ? {} : response.data.records[0];
        const activeActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] : selectedActiveProcess.activityInstanceList.filter(item => item.state === "ACTIVE");
        const approvedActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] : selectedActiveProcess.activityInstanceList.filter(item => item.activityId === approveRevisionStep.REVISION_ONE);

        this.setState({
          activeActivity: activeActivity && activeActivity.length === 0 ? {} : activeActivity[0],
          approvedActivity: approvedActivity && approvedActivity.length === 0 ? {} : approvedActivity[0]
        });
      });
  }

  handleFinalConfimation = (action) => {
    this.setState({ isRevisonFinalConfirmation: true, showApproveRevisionDrawer: false, revisionAction: action });
  }

  handleStartFlexLoanConfimation = () => {

    const { selectedSmeLoan } = this.state;
    const reqData = {
      contractId: selectedSmeLoan.contractId,
      loanId: selectedSmeLoan._id,
      data: { status: 'outstanding' }
    };
    this.props.updateFlexLoan(reqData)
      .then(res => {
        // console.log('res start ', res);
        if (res && res.success) {
          this.props.setMandateToEmandate(this.props.activeMandateByCustomer.mandateId)
            .then(() => {
              this.setState({ showStartFlexLoanDrawer: false });
              // this.props.requestMandates(selectedSmeLoan.smeId);
              this.getOverviewData(selectedSmeLoan.contractId);
            });
        } else {
          this.setState({ showStartFlexLoanDrawer: false });
        }
      })
      .catch(er => {
        console.log('error in start loan ', er);
        this.setState({ showStartFlexLoanDrawer: false });
      }
      );
  }

  handleNewBalanceValue = (value) => {

    const { selectedSmeLoan } = this.state;
    const { overview } = this.props;

    const newLimit = Number(value);
    const available = selectedSmeLoan.creditLimitAmount - (overview.loanOutstandingAmount + overview.otherCostOutstandingAmount + this.getPartialAmount());
    const newAvailable = available + (newLimit - selectedSmeLoan.creditLimitAmount);

    this.setState({ newCreditLimit: newLimit, newAvailableBalance: newAvailable });
  }

  closeChangeLimitPopup = () => {

    return this.setState({ ShowChangeCreditLimitDrawer: false });
  }

  changeCreditLimit = () => {

    const { selectedSmeLoan, newCreditLimit } = this.state;
    const revisionDate = moment(this.getDate()).add(6, 'months').format('YYYY-MM-DD');

    const reqData = {
      contractId: selectedSmeLoan.contractId,
      loanId: selectedSmeLoan._id,
      data: { creditLimitAmount: newCreditLimit, revisionDate: revisionDate }
    };

    this.props.updateFlexLoan(reqData)
      .then(res => {
        this.setState({ ShowChangeCreditLimitDrawer: false, newCreditLimit: 0, newAvailableBalance: 0 });
        this.getOverviewData(selectedSmeLoan.contractId);
      })
      .catch(() => {
        this.setState({ ShowChangeCreditLimitDrawer: false, newCreditLimit: 0, newAvailableBalance: 0 });
      }
      );
  }

  handleInterestPaneltyStatusDrawer = (open) => {
    const interestPenaltyIndicator = this.props.loan && this.props.loan.interestPenaltyIndicator;
    this.setState({ showStartStopInterestPaneltyDrawer: !this.state.showStartStopInterestPaneltyDrawer, interestPenaltyIndicator: interestPenaltyIndicator, sendMessage: 'no' });
  }

  handleSendEmail = (val) => {
    this.setState({ sendMessage: val });
  }

  changeInterestPaneltyState = () => {

    const loanData = {
      contractId: this.props.loan.contractId,
      loanId: this.props.loan._id,
      data: { interestPenaltyIndicator: (this.state.interestPenaltyIndicator === 'stopped' || this.state.interestPenaltyIndicator === 'not-applicable') ? 'active' : 'stopped' },
      dailyInterestPenaltyAmount: this.props.loan.dailyInterestPenaltyAmount,
      sendMessage: this.state.sendMessage,
      smeDetail: {
        id: this.props.smeDetails.id,
        email: this.props.smeDetails.email,
        firstName: this.props.smeDetails.firstName,
        lastName: this.props.smeDetails.lastName
      },
      contact: this.state.contact
    };

    this.props.startStopSmeLoanInterestPenalty(loanData)
      .then(() => {

        if (this.state.interestPenaltyIndicator === 'stopped') {
          this.props.displayNotification('Interest Penalty started !', 'success');
        }
        else {
          this.props.displayNotification('Interest Penalty stopped !', 'success');
        }

        this.setState({ showStartStopInterestPaneltyDrawer: false, sendMessage: 'no' });
        this.getOverviewData(this.state.selectedSmeLoan.contractId);
      })
      .catch((err) => {
        this.props.displayNotification('Interest panelty start/stop Error', 'error');
      });

  }

  render() {
    const { classes, overview, flexLoanContratIds, showGeneratePaymentRequestDrayer, directdebits, loan } = this.props;

    const desiredDDs = new Set(["profit", "loss"]);
    const profitLostData = directdebits && directdebits.length === 0 ? [] : directdebits.filter(item => desiredDDs.has(item.type));

    const sumProfitLossAmount = profitLostData && profitLostData.length === 0 ? 0 : profitLostData.reduce((n, { amount }) => n + amount, 0);

    let { selectedSme, selectedSmeLoan } = this.state;

    const { withdrawal, lastWithdrawalOrder, openWithdrawalPossiblePopup, activeActivity, newCreditLimit, newAvailableBalance } = this.state;

    let disableWithdrawalButton = true;

    if (selectedSme && selectedSmeLoan) disableWithdrawalButton = !(Object.keys(selectedSme).length > 0 && Object.keys(selectedSmeLoan).length > 0);

    const [isAnyError, errorMessage] = this.isAnyError();

    if (!disableWithdrawalButton && isAnyError) disableWithdrawalButton = isAnyError;

    if (!disableWithdrawalButton) disableWithdrawalButton = this.state.loading;

    if (!disableWithdrawalButton) disableWithdrawalButton = this.state.withdrawalButtonDisable;

    if (!selectedSme) selectedSme = { company: '' };

    if (!selectedSmeLoan) selectedSmeLoan = { contractId: '' };

    let totalEarningAmount = overview.totalEarningAmount ? overview.totalEarningAmount : 0;
    totalEarningAmount = (totalEarningAmount < 0) ? (-1 * totalEarningAmount) : totalEarningAmount;

    //newDirectDebitAmount
    const currentDdAmount = (lastWithdrawalOrder.newDirectDebitAmount) ? lastWithdrawalOrder.newDirectDebitAmount : 0;

    const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;

    const interestPenaltyIndicator = loan && loan.interestPenaltyIndicator;
    return (
      <div>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {/* top left box */}
            <Paper className={classes.topPaper} >
              <Grid container spacing={1} className={classes.boxMargin} >
                <Grid item xs={5}>
                  <TextField
                    id="sme-name"
                    label="Sme Name"
                    value={selectedSme.company ? selectedSme.company : ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="type"
                    label="Type"
                    value={selectedSmeLoan.type || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    // freeSolo
                    value={this.state.contractIdValue}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        this.setState({ contractIdValue: newValue });
                        this.getOverviewData(newValue);
                        this.setContractIdInUrl(newValue);
                        if (this.props.handleContractIdChange) this.props.handleContractIdChange(newValue);
                      }
                      // console.log("newValue ", newValue);
                    }}
                    inputValue={this.state.contractIdInputValue}
                    onInputChange={(event, newInputValue) => {
                      this.setState({ contractIdInputValue: newInputValue });
                      // console.log("newInputValue ", newInputValue);
                    }}
                    id="contract-id"
                    options={flexLoanContratIds}
                    renderInput={(params) => (
                      <TextField {...params} label="Contract-Id" variant="outlined" />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            {/* top right box */}
            <Paper className={classes.topPaper} >
              <Grid container spacing={1} className={classes.boxMargin}>
                <Grid item xs={4} >
                  <TextField
                    id="risk-category"
                    label="Risk Category"
                    value={selectedSmeLoan.riskCategory || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4} >
                  <Tooltip
                    id="loan-status-table-status-tooltip"
                    placement="bottom-start"
                    title={
                      <React.Fragment>
                        <table className={classes.tooltipTable}>
                          <thead>
                            <tr>
                              <th className={classes.tooltipTableHeadCell}>Status</th>
                              <th className={classes.tooltipTableHeadCell}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              selectedSmeLoan.statusHistory?.map(history => (
                                <tr key={history._id} id={history._id}>
                                  <td id={history._id + '-' + history.status} className={classes.tooltipTableBodyCell}>{history.status}</td>
                                  <td id={history._id + '-' + history.createdAt} className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </React.Fragment>
                    }
                  >
                    <TextField
                      id="status "
                      label="Status"
                      value={selectedSmeLoan.status || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={4} >
                  <TextField
                    id="revision-date"
                    label="Revision Date"
                    value={moment(selectedSmeLoan.revisionDate).format("DD-MM-YYYY") || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            {/* bottom lefft box */}
            <Paper className={classes.bottomPaper} >
              <Grid container spacing={1} className={classes.boxMargin}>
                {/* financial status block */}
                <Grid item xs={8} >
                  <Typography variant="body1" gutterBottom className={classes.marginStyle}>{'Financial Status'}</Typography>
                  <Table aria-label="simple table">
                    <TableHead style={{ background: '#eeeeee' }}>
                      <TableRow >
                        <TableCell className={classes.borderRightCell} style={{ borderTopLeftRadius: '10px' }}>{''}</TableCell>
                        <TableCell align="right">Outstanding</TableCell>
                        <TableCell style={{ borderTopRightRadius: '10px' }} align="right">Overdue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow >
                        <TableCell className={classes.borderLeftRightCell} >{'Loan'}</TableCell>
                        <TableCell align="right">{currencyConvertor(overview.loanOutstandingAmount - overview.otherCostOutstandingAmount)}</TableCell>
                        <TableCell className={classes.borderRightCell} align="right">{currencyConvertor(overview.loanOverdueAmount)}</TableCell>
                      </TableRow>
                      <TableRow >
                        <TableCell className={classes.borderLeftRightCell} >{'Other Cost'}</TableCell>
                        <TableCell align="right">{currencyConvertor(overview.otherCostOutstandingAmount)}</TableCell>
                        <TableCell className={classes.borderRightCell} align="right">{currencyConvertor(overview.otherCostOverdueAmount)}</TableCell>
                      </TableRow>
                      <TableRow >
                        <TableCell className={classes.borderLeftRightCell} >{'Partial'}</TableCell>
                        <TableCell align="right">{currencyConvertor(-1 * this.getPartialAmount())}</TableCell>
                        <TableCell className={classes.borderRightCell} align="right">{currencyConvertor(-1 * this.getPartialAmount())}</TableCell>
                      </TableRow>
                      <TableRow >
                        <TableCell className={classes.borderLeftRightCell} >{'Overall Total'}</TableCell>
                        <TableCell align="right">{currencyConvertor(overview.loanOutstandingAmount - this.getPartialAmount())}</TableCell>
                        <TableCell className={classes.borderRightCell} align="right">{currencyConvertor(overview.overallTotalOverdueAmount - this.getPartialAmount())}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                {/* total eranings blok */}
                <Grid item xs={4} >
                  <Typography variant="body1" gutterBottom className={classes.marginStyle}>{'Total Cost'}</Typography>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <TextField
                        id="withdrawal-cost"
                        label="Withdrawal Costs"
                        value={currencyConvertor(Math.abs(overview.withdrawalCostAmount) || 0)}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="recurring-interest"
                        label="Recurring-Interest"
                        value={currencyConvertor(Math.abs(overview.recurringInterestAmount) || 0)}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="total"
                        label="Total"
                        value={currencyConvertor(Math.abs(totalEarningAmount) || 0)}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {/* middle section and button display bloks */}
              <Grid container spacing={1} className={classes.boxMargin}>
                <Grid item xs={6} >
                  <Tooltip
                    placement="top-start"
                    title={
                      <React.Fragment>
                        <table className={classes.tooltipTable}>
                          <thead>
                            <tr>
                              <th className={classes.tooltipTableHeadCell}>Amount</th>
                              <th className={classes.tooltipTableHeadCell}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              selectedSmeLoan.creditLimitAmountHistory?.map(history => (
                                <tr key={history._id}>
                                  <td className={classes.tooltipTableBodyCell}>{currencyConvertor(history.amount)}</td>
                                  <td className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </React.Fragment>
                    }
                  >
                    <TextField
                      id="credit-limit"
                      label="Credit Limit"
                      value={currencyConvertor(selectedSmeLoan.creditLimitAmount || 0)}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="available-balance"
                    label="Available Balance"
                    value={currencyConvertor((selectedSmeLoan.creditLimitAmount - ((overview.loanOutstandingAmount + overview.otherCostOutstandingAmount) - this.getPartialAmount())) || 0)}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            {/* bottom right box */}
            <Paper className={classes.bottomPaper} >
              <Grid container spacing={1} className={classes.boxMargin}>
                {/* fees block */}
                <Grid item xs={6}>
                  <Typography variant="body1" gutterBottom className={classes.marginStyle}>{'Fees'}</Typography>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <Tooltip
                        placement="top-start"
                        title={
                          <React.Fragment>
                            <table className={classes.tooltipTable}>
                              <thead>
                                <tr>
                                  <th className={classes.tooltipTableHeadCell}>Percentage</th>
                                  <th className={classes.tooltipTableHeadCell}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  selectedSmeLoan.withdrawalCostPercentageHistory?.map(history => (
                                    <tr key={history._id}>
                                      <td className={classes.tooltipTableBodyCell}>{this.numberFormating(history.percentage, ' %')}</td>
                                      <td className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                    </tr>
                                  ))
                                }
                              </tbody>
                            </table>
                          </React.Fragment>
                        }
                      >
                        <TextField
                          id="withdrawal-cost-percentage"
                          label="Withdrawal Cost %"
                          value={this.numberFormating(selectedSmeLoan.withdrawalCostPercentage, ' %')}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                          fullWidth
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip
                        placement="top-start"
                        title={
                          <React.Fragment>
                            <table className={classes.tooltipTable}>
                              <thead>
                                <tr>
                                  <th className={classes.tooltipTableHeadCell}>Percentage</th>
                                  <th className={classes.tooltipTableHeadCell}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  selectedSmeLoan.recurringInterestCostPercentageHistory?.map(history => (
                                    <tr key={history._id}>
                                      <td className={classes.tooltipTableBodyCell}>{this.numberFormating(history.percentage, ' %')}</td>
                                      <td className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                    </tr>
                                  ))
                                }
                              </tbody>
                            </table>
                          </React.Fragment>
                        }
                      >
                        <TextField
                          id="recurring-interest-percentage-per-month"
                          label="Recurring-Interest % Per Month"
                          value={this.numberFormating(selectedSmeLoan.recurringInterestCostPercentage, ' %')}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                          fullWidth
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="annual-percentage-rate"
                        label="Annual Percentage Rate"
                        value={this.numberFormating(selectedSmeLoan.interestAnnualPercentageRate, ' %')}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="recurring-cost-collect-day"
                        label="Recurring Cost Collect Day"
                        value={selectedSmeLoan.recurringCostCollectDate ? selectedSmeLoan.recurringCostCollectDate : ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                {/* other contract data block */}
                <Grid item xs={6}>
                  <Typography variant="body1" gutterBottom className={classes.marginStyle}>{'Other Contract-Data'}</Typography>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <TextField
                        id="contrat-start-date"
                        label="Contract Start Date"
                        value={selectedSmeLoan.startDate ? moment(selectedSmeLoan.startDate).format("DD-MM-YYYY") : ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="maturity-date"
                        label="Maturity Date"
                        value={selectedSmeLoan.maturityDate ? moment(selectedSmeLoan.maturityDate).format("DD-MM-YYYY") : ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="duration-in-months"
                        label="Duration in Months"
                        value={selectedSmeLoan.numberOfMonths || 0}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="direct-debit-frequency"
                        label="Direct Debit Frequency"
                        value={Utility.styleStrings(selectedSmeLoan.directDebitFrequency, 'firstUpper')}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>

              </Grid>
            </Paper>
          </Grid>
          <Grid container spacing={2} className={classes.boxMargin}>
            <Grid item xs={12} >
              <Grid container>
                {this.isEnableStartFlexLoanButton() ?
                  <Grid item >
                    <Button className={classes.customActionButton_Blue} style={{ backgroundColor: "#64d402" }} startIcon={<PlayCircleOutline />} variant="contained" onClick={() => this.setState({ showStartFlexLoanDrawer: true })}  > start loan </Button>
                  </Grid>
                  : false}
                <Grid item >
                  <Button className={classes.customActionButton_Blue} style={{ backgroundColor: "#de4c4c" }} startIcon={<AddCircle />} variant="contained" onClick={this.handleWithdrawalPopup} disabled={Object.keys(this.state.selectedSmeLoan).length === 0 ? true : false} > Withdrawal </Button>
                </Grid>
                <Grid item >
                  <Button disabled={Object.keys(this.state.selectedSmeLoan).length === 0 ? true : false} onClick={() => { this.handleRefundScreen(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#ff9800" }} startIcon={<AddCircle />} variant="contained"> Refund </Button>
                </Grid>
                <Grid item>
                  <Button className={classes.customActionButton_Blue} startIcon={<AddCircle />} variant="contained" onClick={this.handleGeneratePaymentRequest}>  Generate Payment Request </Button>
                </Grid>
                <Grid item >
                  <Button disabled={Object.keys(this.state.selectedSmeLoan).length === 0 ? true : false} onClick={() => { this.handleClaimLoanScreen(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#9c27b0" }} startIcon={<AddCircle />} variant="contained"> Claim </Button>
                </Grid>
                <Grid item >
                  {isUserHasPermission('LM-approve-dis-approve-revision-button', 'Edit') ?
                    <Button disabled={(Object.keys(this.state.selectedSmeLoan).length === 0 || this.state.selectedSmeLoan.status !== 'revision-disapproved') ? true : false} onClick={() => { this.handleOpenStartRevisionConfimation(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#A0522D" }} startIcon={<AddCircle />} variant="contained"> START REVISION </Button>
                    : null
                  }
                </Grid>
                <Grid item >
                  {this.enableApproveDisApproveRevision() ?

                    <Button disabled={Object.keys(this.state.selectedSmeLoan).length === 0 ? true : false} onClick={() => { this.handleOpenApproveRevisionConfimation(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#006400" }} startIcon={<AddCircle />} variant="contained"> {approveRevisionStep.REVISION_THREE === activityId ? 'Supervisor (DIS)APPROVE REVISION' : '(DIS)APPROVE REVISION'} </Button>
                    : null
                  }
                </Grid>
                <Grid item >
                  {isUserHasPermission('LM-change-credit-limit-button', 'Edit') ?

                    <Button disabled={Object.keys(this.state.selectedSmeLoan).length === 0 ? true : false} onClick={() => { this.handleChangeCreditLimit(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#c92c61" }} startIcon={<AddCircle />} variant="contained"> Change Limit </Button>
                    : null
                  }
                </Grid>

                {
                  loan.dailyInterestPenaltyAmount !== 0 ?
                    <Grid item >
                      <Button disabled={Object.keys(loan).length === 0 ? true : false} onClick={() => this.handleInterestPaneltyStatusDrawer()} className={classes.customActionButton_Blue} style={{ backgroundColor: "#4cde68" }} startIcon={<AddCircle />} variant="contained"> Start/Stop Interest-Penalty </Button>
                    </Grid>
                    : null
                }

              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Drawer
          id="generate-payment-request-drawer"
          anchor="bottom"
          open={showGeneratePaymentRequestDrayer}
          onClose={this.toggleDrawer('generatePaymentRequest', 'bottom', false)}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <GeneratePaymentRequest key="generate-payment-request-drawer-content" tikkieData={this.state.tikkieDrawerData} />
          </div>
        </Drawer>
        {
          this.state.withdrawalPopup ?
            <Dialog
              open={this.state.withdrawalPopup}
              onClose={this.handleWithdrawalPopup}
              aria-labelledby="flex-loan-withdrawal"
              aria-describedby="flex-loan-withdrawal"
              fullWidth={true}
              maxWidth={'lg'}
            >
              <DialogTitle id="flex-loan-withdrawal-title">Withdrawal</DialogTitle>
              {
                this.state.withdrawalPopupError ?
                  <GridItem>
                    {this.state.withdrawalPopupError ? <p style={{ color: "red" }}><li>{this.state.withdrawalPopupError}</li></p> : false}
                  </GridItem> : null
              }
              <DialogContent>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}></GridItem>

                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      id="outstandingAmount"
                      name="outstandingAmount"
                      label="Outstanding Amount"
                      fullWidth={true}
                      value={currencyConvertor(-1 * selectedSmeLoan.outstandingAmount.toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      id="currentDdAmount"
                      name="currentDdAmount"
                      label="Current DD Amount"
                      fullWidth={true}
                      value={currencyConvertor(currentDdAmount.toFixed(2))}
                      // value={currencyConvertor(withdrawal.currentDdAmount.toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6}></GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <TextField
                      id="sentToBankAmount"
                      name="sentToBankAmount"
                      label="Sent To Bank Amount"
                      fullWidth={true}
                      value={currencyConvertor(this.getSentToBankAmount().toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={9}></GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <TextField
                      id="baseForNewAmount"
                      name="baseForNewAmount"
                      label="Base For New Amount"
                      fullWidth={true}
                      value={currencyConvertor(this.getBaseForNewAmount().toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={9}></GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <CustomFormatInput
                      className={classes.textField}
                      type="text"
                      labelText="Withdrawal Amount"
                      id="withdrawalAmount"
                      name="withdrawalAmount"
                      numberformat={withdrawal.withdrawalAmount.toFixed(2)}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleWithdrawalAmountChanges}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <TextField
                      id="withdrawalCosts"
                      name="withdrawalCosts"
                      label="Withdrawal Costs"
                      fullWidth={true}
                      value={currencyConvertor(withdrawal.withdrawalCosts.toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <TextField
                      id="payout"
                      name="payout"
                      label="Pay Out"
                      fullWidth={true}
                      value={currencyConvertor(withdrawal.payout.toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3}></GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <TextField
                      id="newOutstandingAmount"
                      name="newOutstandingAmount"
                      label="New Outstanding Amount"
                      fullWidth={true}
                      value={currencyConvertor(this.getNewOutStandingAmount())}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={9}> </GridItem>

                  <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }}>
                    <CustomFormatInput
                      className={classes.textField}
                      type="text"
                      labelText="Interest Only Limit"
                      id="interestOnlyLimit"
                      name="interestOnlyLimit"
                      numberformat={withdrawal.interestOnlyLimit.toFixed(2)}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleInterestOnlyLimitChanges}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={9}> </GridItem>

                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      id="baseForDdCalculation"
                      name="baseForDdCalculation"
                      label="Base For DD Calculation"
                      fullWidth={true}
                      value={currencyConvertor(this.getBaseForDdCalculation().toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3}>
                    <CustomFormatInput
                      className={classes.textField}
                      type="text"
                      labelText="New DD Amount"
                      id="newDdAmount"
                      name="newDdAmount"
                      numberformat={this.getNewDdAmount().toFixed(2)}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleAmountChanges}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3} >
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardDatePicker
                        disableToolbar
                        id="withdrawal-start-date"
                        name="startDate"
                        autoOk
                        variant="inline"
                        label="Start Date"
                        format="DD-MM-YYYY"
                        fullWidth={true}
                        value={withdrawal.startDate}
                        InputAdornmentProps={{ position: "start" }}
                        onChange={date => this.handleWithdrawalStartDateChanges(date)}
                      />
                    </MuiPickersUtilsProvider>
                  </GridItem>

                  <GridItem xs={null} sm={null} md={2}> </GridItem>
                  <GridItem xs={null} sm={null} md={2}> </GridItem>

                  <GridItem xs={12} sm={12} md={12} >
                    {
                      errorMessage ?
                        <span style={{ color: 'red' }} >* {errorMessage}</span> : ''
                    }
                  </GridItem>

                  <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem>

                  {/* Label section */}
                  {/* <GridItem xs={12} sm={12} md={12} ><h5><span style={{ fontWeight: 500 }}>Third Party Payments</span></h5></GridItem> */}

                  <GridItem xs={12} sm={12} md={3} >
                    <FormControl className={classes.formControl} fullWidth={true}>
                      <InputLabel htmlFor="risk-category">Instant Payment</InputLabel>
                      <Select
                        value={withdrawal.instantPayment}
                        onChange={this.handleDropDownChanges}
                        id="instantPayment"
                        inputProps={{
                          name: 'instantPayment',
                          id: 'instantPayment',
                        }}
                        className={classes.selectEmpty}
                      >
                        <MenuItem key={`instantPayment_Yes`} value={1}>Yes</MenuItem>
                        <MenuItem key={`instantPayment_Np`} value={0}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      id="toSme"
                      name="toSme"
                      label="To SME"
                      fullWidth={true}
                      value={currencyConvertor(this.getAmountToSme().toFixed(2))}
                      className={classes.textField}
                      disabled={true}
                      InputLabelProps={{ shrink: true, }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={3} key={'thirdParties_0'}>
                    <CustomFormatInput
                      className={classes.textField}
                      type="text"
                      labelText="To Third-Party"
                      id={'thirdParties_0'}
                      name={'thirdParties_0'}
                      numberformat={withdrawal.thirdParties[0].toFixed(2)}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleThirdPartyValuesChanges}
                      readOnly={(withdrawal.instantPayment === 0)}
                    />
                  </GridItem>

                  <GridItem xs={null} sm={null} md={2} key={'add_0'}>
                    <Button className={classes.customAddButton_Blue} disabled={(withdrawal.instantPayment === 0)} onClick={this.addThirdPartySection} startIcon={<AddCircle />}></Button>
                  </GridItem>

                  <GridItem xs={null} sm={null} md={1}> </GridItem>

                  {
                    withdrawal.thirdParties.map((thirdParty, index) => {

                      const output = [];

                      if (index > 0) {

                        output.push([1, 2].map((i) => (<GridItem xs={null} sm={null} md={3} key={`empty_${i}`}> </GridItem>)));

                        output.push(
                          <GridItem xs={12} sm={12} md={3} key={`thirdParties_${index}`}>
                            <CustomFormatInput
                              className={classes.textField}
                              type="text"
                              labelText="To Third-Party"
                              id={`thirdParties_${index}`}
                              name={`thirdParties_${index}`}
                              numberformat={thirdParty.toFixed(2)}
                              formControlProps={{
                                fullWidth: true
                              }}
                              changeValue={this.handleThirdPartyValuesChanges}
                              readOnly={(this.state.withdrawal.instantPayment === 0)}
                            />
                          </GridItem>
                        );

                        output.push(
                          <GridItem xs={12} sm={12} md={2} key={`thirdPartyPayments_${index}_thirdParty`}>
                            <Button className={classes.customRemoveButton_Blue} onClick={() => this.removeThirdPartySection(index)} startIcon={<RemoveCircle />}></Button>
                          </GridItem>
                        );

                        output.push(<GridItem xs={12} sm={12} md={1} style={{ margin: '1% 0' }}> </GridItem>);

                      }

                      return output;

                    })
                  }


                </GridContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleWithdrawalPopup} color="primary">
                  Cancel
                </Button>
                <Button onClick={this.checkWithdrawalPossible} disabled={disableWithdrawalButton} color="info" autoFocus>
                  Process
                </Button>
              </DialogActions>
            </Dialog>

            : null
        }

        <Dialog open={openWithdrawalPossiblePopup} aria-labelledby="confirm-add-flex-loan" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">This loan is in the revision period</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are you sure you want to make a withdrawal?'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            {this.state.loading && <CircularProgress size={22} />}
            <Button onClick={this.closeWithdrawalPossiblePopup} className={classes.popupCloseButton} color="primary">
              Cancel
            </Button>
            <Button onClick={this.placeTheWithdrawal} className={classes.popupAddButton} color="primary" >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          id="show-claim-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.ShowClaimLoanDrawer}
          onClose={() => this.handleClaimScreen()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <ClaimLoan
              key="show-claim-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              smeDetails={this.props.smeDetails}
              lastWithdrawalOrder={this.state.lastWithdrawalOrder}
              onClose={() => this.handleClaimScreen()}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          id="show-refund-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.ShowRefundLoanDrawer}
          onClose={() => this.handleRefundScreen()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <RefundLoan
              key="redeem-loan-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              smeDetails={this.props.smeDetails}
              //lastWithdrawalOrder={this.state.lastWithdrawalOrder}
              totWithdrawalAmount={this.state.totalwithdrawals}
              totProfitLostAmount={sumProfitLossAmount}
              onClose={() => this.handleRefundScreen()}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          id="approve-revision-confirm-dialog"
          open={this.state.showStartRevisionDrawer}
          //onClose={() => this.handleActiveLoanStopCountDialogLaunch(false)}
          aria-labelledby="alert-dialog-start-revision-confirm-dialog"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-start-revision-confirmation">
            {"Are you sure you want this loan to be revisioned?"}
          </DialogTitle>
          <DialogActions>
            <Button id="start-revision-confirm-dialog-cancel-button" onClick={() => this.setState({ showStartRevisionDrawer: false })} color="danger">
              No
            </Button>
            <Button id="start-revision-confirm-dialog-ok-button" onClick={() => this.handleStartRevisionConfimation()} color="info" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          id="approve-revision-confirm-dialog"
          open={this.state.showApproveRevisionDrawer}
          //onClose={() => this.handleActiveLoanStopCountDialogLaunch(false)}
          aria-labelledby="alert-dialog-start-revision-confirm-dialog"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-approve-revision-confirmation">
            {this.state.isApprovedRevisionStageTwo ? "You already approved / disapproved this revision; ask you colleague to do the approval" : "Are you sure you want this loan to be approved?"}
          </DialogTitle>

          <DialogActions>
            <Button id="approve-revision-confirm-dialog-cancel-button" onClick={() => this.setState({ showApproveRevisionDrawer: false })} color="danger">
              Cancel
            </Button>
            <Button disabled={this.state.taskId === '' || this.state.isApprovedRevisionStageTwo ? true : false} id="approve-revision-confirm-dialog-ok-button" onClick={() => this.handleFinalConfimation('approved')} color={this.state.taskId === '' || this.state.isApprovedRevisionStageTwo ? "secondary" : "info"} autoFocus>
              APPROVE
            </Button>
            <Button disabled={this.state.taskId === '' || this.state.isApprovedRevisionStageTwo ? true : false} id="disapprove-revision-confirm-dialog-ok-button" onClick={() => this.handleFinalConfimation('disApproved')} color={this.state.taskId === '' || this.state.isApprovedRevisionStageTwo ? "secondary" : "info"} autoFocus>
              DISAPPROVE
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          id="start-flex-loan-confirm-dialog"
          open={this.state.showStartFlexLoanDrawer}
          //onClose={() => this.handleActiveLoanStopCountDialogLaunch(false)}
          aria-labelledby="alert-dialog-start-flex-loan-confirm-dialog"
          aria-describedby="alert-start-flex-loan-confirm-dialog-description"
        >
          <DialogTitle id="alert-dialog-start-flex-loan-confirmation">
            {"Are you sure to start this loan?"}
          </DialogTitle>
          <DialogActions>
            <Button id="start-flex-loan-confirm-dialog-cancel-button" onClick={() => this.setState({ showStartFlexLoanDrawer: false })} color="danger">
              No
            </Button>
            <Button id="start-flex-loan-confirm-dialog-ok-button" onClick={() => this.handleStartFlexLoanConfimation()} color="info" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmationDialog title={this.state.revisionAction === "approved" ? 'Are you sure you want this loan to be approved?' : 'Are you sure you want this loan to be disapproved?'}
          cancel='NO'
          ok='YES'
          open={this.state.isRevisonFinalConfirmation}
          handleOk={() => this.handleApproveRevisionConfimation()}
          handleCancel={() => this.setState({ showApproveRevisionDrawer: true, isRevisonFinalConfirmation: false })} />

        <Dialog
          open={this.state.ShowChangeCreditLimitDrawer}
          aria-labelledby="change-credit-limit"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth={'sm'}
        >
          <DialogTitle id="alert-dialog-title">Credit Limit</DialogTitle>
          <DialogContent>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}></GridItem>

              <GridItem xs={12} sm={12} md={6}>
                <TextField
                  id="currentCreditLimit"
                  label="Current Credit Limit"
                  value={currencyConvertor(selectedSmeLoan.creditLimitAmount || 0)}
                  InputProps={{
                    readOnly: false,
                  }}
                  variant="outlined"
                  fullWidth
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <TextField
                  id="availableBalance"
                  label="Available Balance"
                  value={currencyConvertor((selectedSmeLoan.creditLimitAmount - (overview.loanOutstandingAmount + overview.otherCostOutstandingAmount + this.getPartialAmount())) || 0)}
                  InputProps={{
                    readOnly: false,
                  }}
                  variant="outlined"
                  fullWidth
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6} className={classes.creditLimitSecondRow}>
                <CustomFormatInput
                  className={classes.textField}
                  type="text"
                  labelText="New Credit Limit"
                  id="newCreditLimit"
                  name="newCreditLimit"
                  numberformat={newCreditLimit.toFixed(2)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  changeValue={this.handleNewBalanceValue}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6} className={classes.creditLimitSecondRow}>
                <TextField
                  id="newBalance"
                  name="newBalance"
                  label="New available"
                  fullWidth={true}
                  value={currencyConvertor(newAvailableBalance.toFixed(2))}
                  className={classes.textField}
                  disabled={true}
                  InputLabelProps={{ shrink: true, }}
                />
              </GridItem>
            </GridContainer>
          </DialogContent>
          <DialogActions>
            {this.state.loading && <CircularProgress size={22} />}
            <Button onClick={this.closeChangeLimitPopup} className={classes.popupCloseButton} color="primary">
              Cancel
            </Button>
            <Button onClick={this.changeCreditLimit} className={classes.popupAddButton} color="info" >
              Process
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          id="start-stop-loan-confirm-drawer"
          open={this.state.showStartStopInterestPaneltyDrawer}
          aria-labelledby="form-dialog-title">
          {(interestPenaltyIndicator === 'not-applicable' || interestPenaltyIndicator === 'stopped') ?
            <DialogTitle id="form-dialog-title">Do you want to START Interest penalty?</DialogTitle> :
            <DialogTitle id="form-dialog-title">Do you want to STOP Interest penalty?</DialogTitle>}
          {interestPenaltyIndicator === 'active' ? null :
            <DialogContent >
              <DialogContentText>Do you want to notify via an email ?</DialogContentText>
              <RadioGroup aria-label="chartType" name="chartType" row value={this.state.sendMessage} onChange={(e) => this.handleSendEmail(e.target.value)}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" labelPlacement="end" />
                <FormControlLabel value="no" control={<Radio />} label="No" labelPlacement="end" />
              </RadioGroup>
            </DialogContent>
          }
          <DialogActions>
            <Button id="start-stop-loan-confirm-drawer-back-button" onClick={this.handleInterestPaneltyStatusDrawer}>
              CANCEL
            </Button>
            {(interestPenaltyIndicator === 'not-applicable' || interestPenaltyIndicator === 'stopped') ?
              <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={this.changeInterestPaneltyState}>
                START
              </Button> :
              <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={this.changeInterestPaneltyState}>
                STOP
              </Button>
            }
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  componentWillUnmount() {
    this.props.clearFlexLoanOverviewData();
    this.props.clearWithdrwalsforSelectedLoan();
    this.setState({ activeActivity: {}, approvedActivity: {} });
  }
}

SingleFlexLoanOverview.propTypes = {
  classes: PropTypes.object,
  configurations: PropTypes.object.isRequired,
  smeLoans: PropTypes.array.isRequired,
  overview: PropTypes.object.isRequired,
  contractId: PropTypes.string,
  requestSmeLoan: PropTypes.func.isRequired,
  requestMandates: PropTypes.func,
  requestSmeByIdPromise: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  showGeneratePaymentRequestDrayer: PropTypes.bool,
  showGeneratePaymentRequest: PropTypes.func.isRequired,
  createSmeFlexLoanWithdrawal: PropTypes.func.isRequired,
  getFlexLoanOutstandingAmount: PropTypes.func.isRequired,
  getFlexLoanLatestWithdrawalOrder: PropTypes.func.isRequired,
  clearFlexLoanOverviewData: PropTypes.func,
  getFlexLoanOverviewData: PropTypes.func,
  flexLoanContratIds: PropTypes.array,
  smeDetails: PropTypes.object,
  loan: PropTypes.object,
  directdebits: PropTypes.array,
  displayNotification: PropTypes.func.isRequired,
  startRevison: PropTypes.func,
  approveRevision: PropTypes.func,
  getUserTasks: PropTypes.func,
  getProcessList: PropTypes.func,
  getWithdrwalsforSelectedLoan: PropTypes.func.isRequired,
  clearWithdrwalsforSelectedLoan: PropTypes.func.isRequired,
  updateFlexLoan: PropTypes.func,
  setMandateToEmandate: PropTypes.func,
  handleContractIdChange: PropTypes.func,
  activeMandateByCustomer: PropTypes.object,
  lmContractSysId: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  // inversConsentsForSme: PropTypes.array,
};

const mapStateToProps = (state) => ({
  configurations: state.configurations,
  smeLoans: state.lmglobal.smeLoans,
  overview: state.lmglobal.flexLoanOverview,
  flexLoanContratIds: state.flexLoanOverview.flexLoanContratIds,
  loan: state.lmglobal.selectedLoan,
  directdebits: state.smeLoanTransaction.directdebits,
  smeDetails: state.lmglobal.customerDetails,
  activeMandateByCustomer: state.mandates.activeMandateByCustomer,
  showGeneratePaymentRequestDrayer: state.generatepaymentrequest.showGeneratePaymentRequestDrayer,
  lmContractSysId: state.lmglobal.selectedLoan.contractId,
  isDashboardContent: state.user.isDashboardContent,
  // inversConsentsForSme: state.lmglobal.inversConsentsForSme,
});

const bindActions = (dispatch, actionMethod) => {
  return (params) =>
    new Promise((resolve, reject) =>
      dispatch(actionMethod(params))
        .then(response => resolve(response))
        .catch(error => reject(error))
    );
};

const mapDispatchToProps = dispatch => {
  return {
    requestSmeLoan: bindActions(dispatch, requestSmeLoan),
    requestMandates: bindActions(dispatch, requestMandates),
    requestSmeByIdPromise: bindActions(dispatch, requestCustomerByVTigerIdPromise),
    // getNextWorkingDate: bindActions(dispatch, getNextWorkingDate),
    showGeneratePaymentRequest: () => { dispatch(showGeneratePaymentRequest()); },
    getNextWorkingDate: (expiryDate, noOfDaysAhead) => (dispatch(getNextWorkingDate(expiryDate, noOfDaysAhead))),
    createSmeFlexLoanWithdrawal: bindActions(dispatch, createSmeFlexLoanWithdrawal),
    getFlexLoanOutstandingAmount: bindActions(dispatch, getFlexLoanOutstandingAmount),
    getFlexLoanLatestWithdrawalOrder: bindActions(dispatch, getFlexLoanLatestWithdrawalOrder),
    clearFlexLoanOverviewData: () => { dispatch(clearFlexLoanOverviewData()); },
    getFlexLoanOverviewData: (contractId) => { dispatch(getFlexLoanOverviewData(contractId)); },
    getWithdrwalsforSelectedLoan: contractId => {
      return dispatch(getWithdrwalsforSelectedLoan(contractId));
    },
    clearWithdrwalsforSelectedLoan: () => (dispatch(clearWithdrwalsforSelectedLoan())),
    displayNotification: (msg, type) => { dispatch(displayNotification(msg, type)); },
    startRevison: (requestBody) => dispatch(startRevison(requestBody)),
    updateFlexLoan: (requestBody) => dispatch(updateFlexLoan(requestBody)),
    approveRevision: (requestBody) => dispatch(approveRevision(requestBody)),
    getUserTasks: (processDefinitionKey, contractId, taskDefinitionKey) => dispatch(getUserTasks(processDefinitionKey, contractId, taskDefinitionKey)),
    getProcessList: (processInstanceBusinessKey, processDefinitionKey, processState) => dispatch(getProcessList(processInstanceBusinessKey, processDefinitionKey, processState)),
    setMandateToEmandate: bindActions(dispatch, setMandateToEmandate),
    startStopSmeLoanInterestPenalty: (requestBody) => dispatch(startStopSmeLoanInterestPenalty(requestBody)),
    getPlatformParameters: (data) => dispatch(getPlatformParameters(data)),
  };
};

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(SingleFlexLoanOverview));