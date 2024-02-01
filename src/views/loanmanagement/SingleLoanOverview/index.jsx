/* eslint-disable no-nested-ternary */
// @ts-nocheck
import moment from "moment";
import PropTypes from "prop-types";
import Classnames from "classnames";
import { connect } from "react-redux";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { TERMS_MAPPING } from "store/loanmanagement/constants/Contracts";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";

import { Sync, Receipt, Pause, Payment, PersonOutline, TrendingDown, CalendarToday, Message, PlayCircleOutline } from "@material-ui/icons";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Drawer,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tooltip,
} from "@material-ui/core";

import Button from "components/loanmanagement/CustomButtons/Button.jsx";

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";

import GridItem from "components/loanmanagement/Grid/GridItem.jsx";
import GridContainer from "components/loanmanagement/Grid/GridContainer.jsx";

import Notifier from "components/loanmanagement/Notification/Notifier.jsx";

import CustomTabs from "components/loanmanagement/CustomTabs/CustomTabs1";

import Messages from "./Messages";
import SmeDetailView from "./SmeDetails";
import TransactionsView from "./Transactions";
import LoanBurnDown from "./LoanBurnDown";
import ManualPayments from "./ManualPayments";
import RefinaceLoan from "./RefinanceLoan";
import RedeemLoan from "./RedeemLoan";
import RefundLoan from "./RefundLoan";
import ClaimLoan from "./ClaimLoan";
import TransactionOverviewReport from "./TransactionOverviewReport";
import TemporaryLoanStop from "views/loanmanagement/LoanTemporaryStop/LoanTemporaryStop";
import LoanRecoveryAppointment from "views/loanmanagement/LoanRecoveryAppointment/SmeLoanRecoveryAppointment";
import GeneratePaymentRequest from 'views/loanmanagement/GeneratePaymentRequest/GeneratePaymentRequest';
import Util from "lib/loanmanagement/utility";

import { clearSelectedCustomer } from "store/loanmanagement/actions/HeaderNavigation";
import { clearDirectDebits, startLoanAction } from "store/loanmanagement/actions/SmeLoanTransaction";
import { getSingleLoanOverviewData, clearSelectedLoan, getCalculatedDataOfLoanTransactions, clearCalculatedDataOfLoanTransactions, showCancelSmeLoanModal, cancelLoan, generateTransactionOverview } from "store/loanmanagement/actions/SmeLoans";
import { retrieveEmailNotificationsBySme, clearSmeEmailNotifications, getMessagesListForLoanDashboard } from "store/loanmanagement/actions/Notifications";
import { showHideTemporaryLoanStop, setLoanStopHistoryOrigin } from "store/loanmanagement/actions/SmeLoanTemporaryLoanStop";
import { getSmeLoanHistoriesByContractId, clearSmeLoanHistories } from "store/loanmanagement/actions/SmeLoanHistory";
import { setMandateToEmandate } from "store/loanmanagement/actions/Mandates";
import { showGeneratePaymentRequest } from 'store/loanmanagement/actions/GeneratePaymentRequest';
import { displayNotification } from "store/loanmanagement/actions/Notifier";

const currency = Util.currencyConverter();
const ORIGIN = "SingleLoanOverview";

class SingleLoanOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contractId: "",
      isDisableStartLoanBtn: false,
      tikkieDrawerData: {},
      showRefinanceLoanDrawer: false,
      showRedeemLoanDrawer: false,
      showRefundLoanDrawer: false,
      isEnableLoanCancelButton: false,
      ShowClaimLoanDrawer: false,
      ShowTransactionOverViewDrawer: false,
      html: '',
      pdf: ''
    };
  }

  componentDidMount() {
    const { match, isDashboardContent, lmContractSysId } = this.props;
    const params = match ? match.params : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept
    const contractId = params && params.contractId ? params.contractId : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept

    this.setState({ contractId: contractId });

    if (contractId) {

      this.props.getCalculatedDataOfLoanTransactions(contractId);
      this.props.getLoanDetails(contractId);
      this.props.getSmeLoanHistoriesByContractId(contractId);// need to refactor to compdidmount in child comp

    }
  }

  componentDidUpdate(prevProps) {
    const { lmContractSysId, isDashboardContent } = this.props;
    const params = this.props.match ? this.props.match.params : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept

    const preContractId = prevProps.match ? prevProps.match.params.contractId : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept

    const contractId = params && params.contractId ? params.contractId : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept

    if (preContractId && contractId && preContractId !== contractId) {

      this.setState({ contractId: contractId });

      this.props.getCalculatedDataOfLoanTransactions(contractId);
      this.props.getLoanDetails(contractId);
      this.props.getSmeLoanHistoriesByContractId(contractId);
    }

  }
  isEnableStartButton = () => {
    // need to get from back end# DD looping
    const value = this.props.directdebits.find(directDebit =>
      (directDebit.ourReference === (directDebit.contractId + '-PROEFINCASSO') && (directDebit.status === 'paid' || directDebit.status === 'sent-to-bank')));

    const isStillPaused = this.props.directdebits.find(directDebit => directDebit.status === 'paused');

    return value && isStillPaused;
  }

  isEnableCancelButton = () => {
    const { directdebits } = this.props;
    // need to get from back end# DD looping
    const payOutTransaction = directdebits.find(t => t.type === 'pay-out' && t.status === 'open');
    // console.log('in paymnt order prep ',payOutTransaction);

    // enabling the loan cancel button
    return payOutTransaction ? true : false;
  }

  componentWillUnmount() {
    this.props.clearSelectedCustomer();
    this.props.clearSelectedLoan();
    this.props.clearSmeLoanHistories();
    this.props.clearDirectDebits();
    this.props.clearSmeEmailNotifications();
    this.props.clearCalculatedDataOfLoanTransactions();
  }

  goBack() {
    window.history.back();
  }

  toggleDrawer = (container, side, open) => () => {
    this.setState({
      [side]: open
    });
    switch (container) {
      case 'temporaryLoanStop':
        this.props.showHideTemporaryLoanStop();
        break;
      case 'generatePaymentRequest':
        this.props.showGeneratePaymentRequest();
        break;
      default:
        break;
    }
  };

  handleRefinanceScreen = (open) => {

    if (open && this.props.loan.type !== 'fixed-loan') {
      this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
      return;
    }
    this.setState({ showRefinanceLoanDrawer: !this.state.showRefinanceLoanDrawer });
  };

  handleRedeemScreen = (open) => {
    if (open && this.props.loan.type !== 'fixed-loan') {
      this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
      return;
    }
    this.setState({ showRedeemLoanDrawer: !this.state.showRedeemLoanDrawer });
  };

  handleRefundScreen = (open) => {
    if (open && this.props.loan.type !== 'fixed-loan') {
      this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
      return;
    }
    this.setState({ showRefundLoanDrawer: !this.state.showRefundLoanDrawer });
  };

  handleClaimScreen = (open) => {
    if (open && this.props.loan.type !== 'fixed-loan') {
      this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
      return;
    }
    this.setState({ ShowClaimLoanDrawer: !this.state.ShowClaimLoanDrawer });
  };

  handleTransactionOverview = (open) => {
    if (open && this.props.loan.type !== 'fixed-loan') {
      this.props.displayNotification('The overview is made for fixed-loans only', 'warning');
      return;
    }
    const smeLoan = this.props.loan;
    const requestData = {
      smeLoan: {
        contractId: smeLoan.contractId,
        principleAmount: smeLoan.principleAmount,
        totalMarginAmount: smeLoan.totalMarginAmount,
      }
    };
    this.props.generateTransactionOverview(requestData, (result, error) => {
      if (result.success) {
        const transactionResults = result.data.pdfData;
        this.setState({ html: transactionResults });
        this.setState({ pdf: `data:application/pdf;base64,${result.data.encodedPdf}` });
        this.setState({ ShowTransactionOverViewDrawer: true });
      }
      if (error) {
        this.props.displayNotification('Pdf can not View', 'warning');
      }
      if (error) {
        this.props.displayNotification('Pdf can not View', 'warning');
      }
    });
  };

  closeTransactionOverview = () => {
    this.setState({ ShowTransactionOverViewDrawer: false });
  }

  // downloadPDf(data, fileName) {
  //   const bitmap = new Buffer.from(data, 'base64');
  //   const file = fs.writeFileSync(fileName, bitmap);

  //   const url = window.URL.createObjectURL(new Blob([file]));
  //         const link = document.createElement('a');
  //         link.href = url;
  //         link.setAttribute('download', `sample-file.pdf`);

  //         document.body.appendChild(link);

  //         link.click();

  //         link.parentNode.removeChild(link);
  // }

  handleTemporaryLoanStop() {
    this.props.showHideTemporaryLoanStop();
    this.props.setLoanStopHistoryOrigin('CONTRACTS');
  }

  handleGeneratePaymentRequest() {

    this.setState({
      tikkieDrawerData: Util.preparePaymentRequest(this.props.loan, this.props.directdebits)
    }, () => this.props.showGeneratePaymentRequest());
  }

  handleCancelLoanRequest = () => {
    const loanData = {
      status: 'cancelled',
      contractId: this.state.contractId,
      loanId: this.props.loan._id
    };

    this.props.cancelLoan(loanData);
  }

  preparePaymentOrder = () => {
    const { smeDetails, directdebits, activeMandateByCustomer } = this.props;
    //need to get from back end #DD looping
    const payOutTransaction = directdebits.find(t => t.type === 'pay-out' && t.status === 'open');
    // console.log('in paymnt order prep ',payOutTransaction);

    // enabling the loan cancel button
    if (payOutTransaction) {
      this.setState({ isEnableLoanCancelButton: true });
    }

    if (payOutTransaction && activeMandateByCustomer !== null && JSON.stringify(activeMandateByCustomer) !== '{}') {
      return {
        domainId: "bridgefund",
        date: payOutTransaction.plannedDate,
        status: "to-be-processed",
        counterparty: smeDetails.company,
        counterpartyIbanNumber: activeMandateByCustomer.ibanNumber,
        counterpartyBankBic: activeMandateByCustomer.bicCode,
        description: payOutTransaction.description,
        amount: Math.abs(payOutTransaction.amount),
        paymentReference: "",
        e2eId: payOutTransaction.e2eId,
      };
    }
    return {};
  }

  getPartialOverdue = () => {
    const { loan, calculatedDataOfLoanTransactions } = this.props;

    if (loan.status === 'loan-normally-settled' || loan.status === 'loan-refinanced' || loan.status === 'loan-fully-redeemed') {
      return 0;
    }
    if (calculatedDataOfLoanTransactions.partialPaymentAmount) {
      return (calculatedDataOfLoanTransactions.partialPaymentAmount * -1);
    }
    return 0;
  }

  repaymentDetailsBlock = () => {

    const { loan } = this.props;
    const isLoanFound = loan._id !== undefined;

    const totalDDCount = isLoanFound ? loan.numberOfDirectDebitsFirstPeriod + loan.numberOfDirectDebitsSecondPeriod + loan.numberOfDirectDebitsThirdPeriod : 0;
    const totalDDAmount = isLoanFound ? (loan.directDebitAmountFirstPeriod * loan.numberOfDirectDebitsFirstPeriod
      + loan.directDebitAmountSecondPeriod * loan.numberOfDirectDebitsSecondPeriod
      + loan.directDebitAmountThirdPeriod * loan.numberOfDirectDebitsThirdPeriod) : 0;

    const rows = [
      {
        noOfDD: isLoanFound ? loan.numberOfDirectDebitsFirstPeriod : '',
        ddAmount: isLoanFound ? currency(loan.directDebitAmountFirstPeriod) : currency(0),
        total: isLoanFound ? currency(loan.numberOfDirectDebitsFirstPeriod * loan.directDebitAmountFirstPeriod) : currency(0),
        startDateLabel: 'Start-date-DD ',
        startDateValue: isLoanFound ? moment(loan.firstDirectDebitDate).format('DD-MM-YYYY') : ''
      },
      {
        noOfDD: isLoanFound ? loan.numberOfDirectDebitsSecondPeriod : '',
        ddAmount: isLoanFound ? currency(loan.directDebitAmountSecondPeriod) : currency(0),
        total: isLoanFound ? currency(loan.numberOfDirectDebitsSecondPeriod * loan.directDebitAmountSecondPeriod) : currency(0),
      },
      {
        noOfDD: isLoanFound ? loan.numberOfDirectDebitsThirdPeriod : '',
        ddAmount: isLoanFound ? currency(loan.directDebitAmountThirdPeriod) : currency(0),
        total: isLoanFound ? currency(loan.numberOfDirectDebitsThirdPeriod * loan.directDebitAmountThirdPeriod) : currency(0),
      },
      {
        noOfDD: totalDDCount,
        total: currency(totalDDAmount),
      },
    ];
    return rows;
  }

  loanFees = () => {

    const { loan, calculatedDataOfLoanTransactions } = this.props;
    const isLoanFound = loan._id !== undefined;

    const rows = [
      {
        name: "Principal",
        original: isLoanFound ? currency(calculatedDataOfLoanTransactions.principleAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingPrincipleAmount ? currency(calculatedDataOfLoanTransactions.outstandingPrincipleAmount) : currency(0),/* Column B */
      },
      {
        name: "Interest",
        original: isLoanFound ? currency(calculatedDataOfLoanTransactions.interestAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingInterestAmount ? currency(calculatedDataOfLoanTransactions.outstandingInterestAmount) : currency(0),/* Column B */
      },
      {
        name: "Initial Fee",
        original: isLoanFound ? currency(calculatedDataOfLoanTransactions.initialCostAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingInitialFee ? currency(calculatedDataOfLoanTransactions.outstandingInitialFee) : currency(0),/* Column B */
      },
      {
        name: "Recurring Fee",
        original: isLoanFound ? currency(calculatedDataOfLoanTransactions.recurringCostAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingRecurringFee ? currency(calculatedDataOfLoanTransactions.outstandingRecurringFee) : currency(0),/* Column B */
      },
      {
        name: "Contract Total",
        original: isLoanFound ? currency(calculatedDataOfLoanTransactions.totalLoanAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingTotalLoanAmount ? currency(calculatedDataOfLoanTransactions.outstandingTotalLoanAmount) : currency(0),/* Column B */
        overdue: calculatedDataOfLoanTransactions.totalOverdueAmount ? currency(calculatedDataOfLoanTransactions.totalOverdueAmount) : currency(0),/* Column C */
        overduePercentage: calculatedDataOfLoanTransactions.totalOverduePercentage ? Util.percentage(calculatedDataOfLoanTransactions.totalOverduePercentage) : Util.percentage(0)/* Column D */
      },
      {
        name: "Other Cost",
        original: isLoanFound && !isNaN(calculatedDataOfLoanTransactions.otherCostsAmount) ? currency(calculatedDataOfLoanTransactions.otherCostsAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.outstandingOtherCostAmount ? currency(calculatedDataOfLoanTransactions.outstandingOtherCostAmount) : currency(0),/* Column B */
        overdue: calculatedDataOfLoanTransactions.otherCostOverdueAmount ? currency(calculatedDataOfLoanTransactions.otherCostOverdueAmount) : currency(0),/* Column C */
      },
      {
        name: "Partial",
        overdue: currency(this.getPartialOverdue()),/* Column C */
      },
      {
        name: "Overall Total",
        original: calculatedDataOfLoanTransactions.overallTotalLoanAmount ? currency(calculatedDataOfLoanTransactions.overallTotalLoanAmount) : currency(0),/* Column A */
        outstanding: calculatedDataOfLoanTransactions.overallOutstandingTotalAmount ? currency(calculatedDataOfLoanTransactions.overallOutstandingTotalAmount) : currency(0),/* Column B */
        overdue: calculatedDataOfLoanTransactions.overallTotalOverdueAmount ? currency(calculatedDataOfLoanTransactions.overallTotalOverdueAmount + this.getPartialOverdue()) : currency(0),/* Column C */
        overduePercentage: calculatedDataOfLoanTransactions.overallTotalOverduePercentage ? Util.percentage(calculatedDataOfLoanTransactions.overallTotalOverduePercentage) : Util.percentage(0),/* Column D */
      },

    ];
    return rows;
  };

  loanInterest = () => {
    const { loan } = this.props;
    const isLoanFound = loan._id !== undefined;

    const rows = [
      { name: "Base Interest", value: isLoanFound ? Util.percentage(loan.interestPercentageBasePerMonth) : '' },
      { name: "Risk Surcharge", value: isLoanFound ? Util.percentage(loan.interestPercentageRiskSurchargePerMonth) : '' },
      { name: "% in Contract", value: isLoanFound ? Util.percentage(loan.interestPercentageTotal) : '' },
      { name: "APR", value: isLoanFound ? Util.percentage(loan.interestAnnualPercentageRate) : '' }
    ];

    return rows;
  };

  mapPlannedDirectDebitsToDuration = (plannedNumberOfDirectDebits, frequency) => {
    let duration = -1;

    Object.keys(TERMS_MAPPING).forEach((key) => {
      const item = TERMS_MAPPING[key];

      if (item[frequency] === plannedNumberOfDirectDebits) {
        duration = key;
      }
    });

    return duration;
  }

  otherInformation = () => {
    const { loan } = this.props;
    const isLoanFound = loan._id !== undefined;

    const rows = [];

    if (isLoanFound && loan.parentLoan)
      rows.push({ name: "Refinanced", value: <Link to={`/user/singleLoanOverview/${loan.parentLoan}`} >{loan.parentLoan + "[PARENT]"}</Link> });
    if (isLoanFound && loan.parentLoan && loan.childLoan)
      rows.push({
        name: "", value: <Link to={`/user/singleLoanOverview/${loan.childLoan}`} >{loan.childLoan + "[CHILD]"}</Link>
      });
    else if (isLoanFound && loan.childLoan)
      rows.push({
        name: "Refinanced", value: <Link to={`/user/singleLoanOverview/${loan.childLoan}`} >{loan.childLoan + "[CHILD]"}</Link>
      });
    if (!loan.childLoan && !loan.parentLoan)
      rows.push({ name: "Refinanced", value: "NO" });

    rows.push({ name: "Start Date", value: isLoanFound ? moment(loan.startDate).format('DD-MM-YYYY') : "" });
    rows.push({ name: "Maturity Date", value: isLoanFound ? moment(loan.maturityDate).format('DD-MM-YYYY') : "" });
    rows.push({
      name: "Duration", value: isLoanFound ?
        this.mapPlannedDirectDebitsToDuration(loan.plannedNumberOfDirectDebit, loan.directDebitFrequency) : ""
    });
    rows.push({ name: "Frequency", value: isLoanFound ? loan.directDebitFrequency : "" });
    rows.push({ name: "Planned DD", value: isLoanFound ? loan.plannedNumberOfDirectDebit : "" });

    return rows;
  };

  handleStartLoanButtonClick = () => {
    const { changeMandateToEmandate, configurations } = this.props;

    this.props.startLoanAction(this.state.contractId, this.props.loan.directDebitFrequency, this.preparePaymentOrder(), configurations.simulations.systemDate);

    const oneCentDD = this.props.directdebits.find(directDebit =>
      ((directDebit.ourReference === directDebit.contractId + '-PROEFINCASSO') && (directDebit.status === 'paid' || directDebit.status === 'sent-to-bank')));

    changeMandateToEmandate(oneCentDD.mandateId);

    this.setState({ isDisableStartLoanBtn: !this.state.isDisableStartLoanBtn });
  };

  render() {
    const { classes, loan, smeDetails, showTemporaryLoanStop, showGeneratePaymentRequestDrayer } = this.props;
    const isLoanFound = loan._id !== undefined;
    const isEnableStartButton = this.isEnableStartButton();
    const isEnableCancelButton = this.isEnableCancelButton();
    const isDisableButtonRow = ['loan-normally-settled', 'loan-fully-redeemed', 'loan-fully-refinanced'].includes(loan.status);

    const desiredDDs = new Set(["profit", "loss"]);
    const profitLostData = this.props.directdebits && this.props.directdebits.length === 0 ? [] : this.props.directdebits.filter(item => desiredDDs.has(item.type));

    const sumProfitLossAmount = profitLostData && profitLostData.length === 0 ? 0 : profitLostData.reduce((n, { amount }) => n + amount, 0);

    return (
      <div>
        <Notifier />

        {/* Heading */}
        <Card className={classes.card}>
          <CardHeader color="info" className={classes.cardHead}>
            <h3 id="slo-title" className={classes.cardTitleWhite}>Single Loan Overview</h3>
          </CardHeader>
        </Card>

        {/* Back Button */}
        <Button id="slo-back-button" color="white" className={classes.btnBack} onClick={() => this.goBack()}>
          {"<  BACK"}
        </Button>

        {/* enable loan Button */}

        {/* Loan Detail Tables */}
        <GridContainer className={classes.loanDetailContainer}>

          {/* Left Side */}
          <GridItem xs={12} sm={12} md={12} lg={6} className={classes.loanDetailLeftContainer}>
            <GridContainer>

              {/* Loan Status */}
              <GridItem

                className={classes.gridItem}
              >
                <Paper className={classes.tableContainer}>
                  <Table id="loan-status-table">
                    <TableHead id="loan-status-table-head">
                      <TableRow id="loan-status-table-header-row" className={classes.tableHeaderRow}>
                        <TableCell className={classes.tableHeaderCell}>
                          Contract ID
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          Type
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          Status
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          SME Name
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody id="loan-status-table-body">
                      <TableRow id="loan-status-table-data-row">
                        <TableCell id="loan-status-table-contract-id" className={classes.tableBodyCell}>{isLoanFound ? loan.contractId : ''}</TableCell>
                        <TableCell id="loan-status-table-loan-type" className={classes.tableBodyCell}>{isLoanFound ? loan.type : ''}</TableCell>
                        <Tooltip
                          id="loan-status-table-status-tooltip"
                          placement="bottom-start"
                          title={
                            <React.Fragment>
                              <table className={classes.tooltipTable}>
                                <thead>
                                  <tr>
                                    <th className={classes.tooltipTableHeadCell}>status</th>
                                    <th className={classes.tooltipTableHeadCell}>date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    loan.statusHistory?.map(history => (
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
                          <TableCell id="loan-status-table-loan-status" className={classes.tableBodyCell}>{isLoanFound ? loan.status : ''}</TableCell>
                        </Tooltip>
                        <TableCell id="loan-status-table-sme" className={classes.tableBodyCell}>{smeDetails.company}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </GridItem>

              {/* Loan Amounts */}
              <GridItem
                className={classes.gridItem}
              >
                <Paper className={classes.tableContainer}>
                  <Table id="loan-amounts-table" className={classes.loanFeeTable}>
                    <TableHead id="loan-amounts-table-head">
                      <TableRow id="loan-amounts-table-header-row" className={classes.tableHeaderRow}>
                        <TableCell className={classes.loanFeeHeaderCell} />
                        <TableCell className={classes.loanFeeHeaderCell}>
                          Original
                        </TableCell>
                        <TableCell className={classes.loanFeeHeaderCell}>
                          Outstanding
                        </TableCell>
                        <TableCell className={classes.loanFeeHeaderCell}>
                          Overdue
                        </TableCell>
                        <TableCell className={classes.loanFeeHeaderCell}>
                          {""}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody id="loan-amounts-table-body">
                      {this.loanFees().map((row, ky) => (
                        <TableRow id={ky} key={ky}>
                          <TableCell id={ky + '-' + row.name} className={classes.loanFeeBodyCell}>
                            {row.name}
                          </TableCell>
                          <TableCell id={row.name.replace(/\s/g, '') + "-original"} className={classes.loanFeeBodyCell}>
                            {row.original}
                          </TableCell>
                          <TableCell id={row.name.replace(/\s/g, '') + "-outstanding"} className={classes.loanFeeBodyCell}>
                            {row.outstanding}
                          </TableCell>
                          <TableCell id={row.name.replace(/\s/g, '') + "-overdue"} className={classes.loanFeeBodyCell}>
                            {row.overdue}
                          </TableCell>
                          <TableCell id={row.name.replace(/\s/g, '') + "-overduePercentage"} className={classes.loanFeeBodyCell}>
                            {row.overduePercentage}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </GridItem>
            </GridContainer>
          </GridItem>

          {/* Right Side */}
          <GridItem xs={12} sm={12} md={12} lg={6} className={classes.loanDetailRightContainer}>
            <GridContainer className={classes.rightTablesContainer}>

              {/* Interest Table */}
              <GridItem
                xs={12}
                sm={12}
                md={6}
                lg={6}
                className={classes.gridItem}
              >
                <Paper className={classes.verticalTableContainer} style={{ height: 'calc( 100% - 30px )' }}>
                  <Table id="loan-interest-table">
                    <TableBody id="loan-interest-table-body">
                      <TableRow id="loan-interest-table">
                        <TableCell className={Classnames(classes.verticalTableHeaderCell, classes.verticalTableCaption)} style={{ background: 'rgb(245,246,250)' }}>Interest</TableCell>
                        <TableCell style={{ borderBottom: 0 }}>&nbsp;</TableCell>
                      </TableRow>
                      {
                        this.loanInterest().map((row, ky) => (
                          <TableRow id={ky} key={ky}>
                            <TableCell id={ky + '-' + row.name} className={classes.verticalTableHeaderCell} style={{ background: 'rgb(245,246,250)', fontWeight: '400', lineHeight: '0.1' }}>{row.name}</TableCell>
                            <TableCell id={"value_" + row.name.replace(/\s/g, '')} style={{ borderBottom: 0, textAlign: "right", lineHeight: '0.1' }}>{row.value}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </Paper>
              </GridItem>

              {/* Other Information */}
              <GridItem
                xs={12}
                sm={12}
                md={6}
                lg={6}
                className={classes.gridItem}
              >
                <Paper className={classes.verticalTableContainer} style={{ height: 'calc( 100% - 30px )' }}>
                  <Table id="loan-other-information-table">
                    <TableBody id="loan-other-information-table-body">
                      {
                        this.otherInformation().map((row, ky) => (
                          <TableRow id={ky} key={ky}>
                            <TableCell id={ky + '-' + row.name} className={ky === 0 ? Classnames(classes.verticalTableHeaderCell, classes.verticalTableCaption) : classes.verticalTableHeaderCell} style={ky === 0 ? { background: 'rgb(245,246,250)' } : { background: 'rgb(245,246,250)', fontWeight: '400', lineHeight: '0.1' }}>{row.name}</TableCell>
                            <TableCell id={"value_" + row.name.replace(/\s/g, '')} style={{ borderBottom: 0, textAlign: "right", lineHeight: '0.1' }}>{row.value || '\u00a0'}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>

                  </Table>
                </Paper>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12} className={classes.gridItem}>
                <Paper className={classes.tableContainer}>
                  <Table id="loan-dd-info-table">
                    <TableHead id="loan-dd-info-table-head">
                      <TableRow id="loan-dd-info-table-header-row" className={classes.tableHeaderRow}>
                        <TableCell align="right" className={classes.tableHeaderCell}>
                          No-of-DD
                        </TableCell>
                        <TableCell align="right" className={classes.tableHeaderCell}>
                          DD-Amount
                        </TableCell>
                        <TableCell align="right" className={classes.tableHeaderCell}>
                          Totals
                        </TableCell>
                        <TableCell align="right" className={classes.tableHeaderCell}>
                          &nbsp;
                        </TableCell>
                        <TableCell align="right" className={classes.tableHeaderCell}>
                          &nbsp;
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody id="loan-dd-info-table-body">
                      {this.repaymentDetailsBlock().map((row, index) =>
                        <TableRow id={index} key={index}>
                          <TableCell id={"noOfDD_value-" + index} className={classes.tableBodyCell} style={{ lineHeight: 0.7 }} align="right">{row.noOfDD}</TableCell>
                          <TableCell id={"ddAmount_value-" + index} className={classes.tableBodyCell} style={{ lineHeight: 0.7 }} align="right">{row.ddAmount}</TableCell>
                          <TableCell id={"total_value-" + index} className={classes.tableBodyCell} style={{ lineHeight: 0.7 }} align="right">{row.total}</TableCell>
                          <TableCell id={index + '-' + row.startDateLabel} className={classes.tableBodyCell} style={{ lineHeight: 0.7 }} align="right">{row.startDateLabel}</TableCell>
                          <TableCell id={"startDate_value-" + index} className={classes.tableBodyCell} style={{ lineHeight: 0.7 }} align="right">{row.startDateValue}</TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </Paper>
              </GridItem>
            </GridContainer>
          </GridItem>
        </GridContainer>

        {/* Main Button Row */}
        <Card className={classes.card}>
          <CardBody>
            <GridContainer id="main-button-row" className={classes.middleButtonContainer}>

              {isEnableStartButton ?
                <GridItem>

                  <Button id="start-loan-button" color="success" className={classes.button}
                    onClick={this.handleStartLoanButtonClick}
                    disabled={this.state.isDisableStartLoanBtn}>
                    <PlayCircleOutline />&nbsp;
                    {'Start Loan'}
                  </Button>
                </GridItem>
                : false}
              <GridItem>
                <Button id="refinance-loan-button" disabled={isDisableButtonRow} color="success" className={classes.button}
                  onClick={() => this.handleRefinanceScreen(true)}
                >
                  <Sync className={classes.leftIcon} />
                  REFINANCE
                </Button>
              </GridItem>
              <GridItem>
                <Button id="redeem-loan-button" disabled={isDisableButtonRow} color="danger" className={classes.button}
                  onClick={() => this.handleRedeemScreen(true)}>
                  <Receipt className={classes.leftIcon} />
                  REDEEM
                </Button>
              </GridItem>
              <GridItem>
                <Button id="refund-loan-button" disabled={isDisableButtonRow} color="warning" className={classes.button}
                  onClick={() => this.handleRefundScreen(true)}>
                  <Sync className={classes.leftIcon} />
                  REFUND
                </Button>
              </GridItem>
              <GridItem>
                <Button id="claim-loan-button" disabled={isDisableButtonRow} color="primary" className={classes.button}
                  onClick={() => this.handleClaimScreen(true)}>
                  <Sync className={classes.leftIcon} />
                  CLAIM
                </Button>
              </GridItem>
              <GridItem>
                <Button id="pause-loan-button" disabled={isDisableButtonRow} color="info" className={classes.button}
                  onClick={() => this.handleTemporaryLoanStop()}
                >
                  <Pause className={classes.leftIcon} />
                  PAUSE
                </Button>
              </GridItem>
              <GridItem>
                <Button id="generate-payment-request-button" disabled={isDisableButtonRow} color="info" className={classes.button}
                  onClick={() => this.handleGeneratePaymentRequest()}
                >
                  <Payment className={classes.leftIcon} />
                  GENERATE PAYMENT REQUEST
                </Button>
              </GridItem>
              <GridItem>
                <Button id="transaction-overview-button" color="primary" className={classes.button}
                  onClick={() => this.handleTransactionOverview(true)}>
                  <Sync className={classes.leftIcon} />
                  TRANSACTION OVERVIEW
                </Button>
              </GridItem>
              {isEnableCancelButton ?
                <GridItem>
                  <Button id="cancel-loan-button" color="info" className={classes.button}
                    onClick={() => this.props.showCancelSmeLoanModal()}
                  >
                    <Payment className={classes.leftIcon} />
                    CANCEL LOAN
                  </Button>
                </GridItem>
                : false}
            </GridContainer>
          </CardBody>
        </Card>

        {/* TABS */}
        <GridContainer id="slo-tabs-container">
          <CustomTabs
            headerColor="info"
            tabs={[
              {
                tabName: "Transactions",
                tabIcon: Payment,
                tabContent: (
                  <TransactionsView key="transaction-overview-tab" />
                )
              },
              {
                tabName: "SME Details",
                tabIcon: PersonOutline,
                tabContent: (
                  <SmeDetailView key="sme-details-tab" />
                )
              },
              {
                tabName: "Loan Burn Down Sheet",
                tabIcon: TrendingDown,
                tabContent: (
                  <div>
                    <LoanBurnDown key="loan-burndown-sheet-tab" loan={this.props.loan} smeLoanHistories={this.props.smeLoanHistories} directdebits={this.props.directdebits} />
                  </div>
                )
              },
              {
                tabName: "Appointments",
                tabIcon: CalendarToday,
                tabContent: (
                  <div>
                    <LoanRecoveryAppointment key="loan-appointments-tab" origin={ORIGIN} loanId={loan._id} />
                  </div>
                )
              },
              {
                tabName: "Messages",
                tabIcon: Message,
                tabContent: (
                  <div>
                    <Messages key="loan-messages-tab" selectedContractId={this.props.loan.contractId} />
                  </div>
                )
              },
              {
                tabName: "Manual",
                tabIcon: Payment,
                tabContent: (
                  <div>
                    <ManualPayments key="loan-manual-tab" contractId={loan.contractId} />
                  </div>
                )
              }
            ]} />
        </GridContainer>

        {/* Drawers */}
        <Drawer
          id="tempory-loan-stop-drawer"
          anchor="bottom"
          open={showTemporaryLoanStop}
          onClose={this.toggleDrawer('temporaryLoanStop', 'bottom', false)}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <TemporaryLoanStop key="tempory-loan-stop-drawer-content" toggleDrawer={this.toggleDrawer('temporaryLoanStop', 'bottom', false)} selectedLoan={this.props.loan} />
          </div>
        </Drawer>

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
            {/* <TemporaryLoanStop toggleDrawer={this.toggleDrawer('temporaryLoanStop', 'bottom', false)} selectedLoan={this.props.loan} /> */}
          </div>
        </Drawer>

        <Dialog
          id="refinance-loan-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.showRefinanceLoanDrawer}
          onClose={() => this.handleRefinanceScreen(false)}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <RefinaceLoan
              key="refinance-loan-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              onClose={() => this.handleRefinanceScreen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Reddeem screen */}
        <Dialog
          id="redeem-loan-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.showRedeemLoanDrawer}
          onClose={() => this.handleRedeemScreen(false)}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <RedeemLoan
              key="redeem-loan-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              onClose={() => this.handleRedeemScreen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Refund screen */}
        <Dialog
          id="refund-loan-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.showRefundLoanDrawer}
          onClose={() => this.handleRefundScreen(false)}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <RefundLoan
              key="redeem-loan-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              smeDetails={this.props.smeDetails}
              totProfitLostAmount={sumProfitLossAmount}
              onClose={() => this.handleRefundScreen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Cancel Loan Confirm */}

        <Dialog id="cancel-loan-confirm-drawer" open={this.props.isOpenLoanCancelModel} onClose={this.props.showCancelSmeLoanModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure to cancel this loan</DialogTitle>
          <DialogActions>
            <Button id="cancel-loan-confirm-drawer-back-button" onClick={this.props.showCancelSmeLoanModal}>
              back
            </Button>
            <Button id="cancel-loan-confirm-drawer-confirm-button" onClick={this.handleCancelLoanRequest}>
              confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Claim Loan */}
        <Dialog
          id="claim-loan-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.ShowClaimLoanDrawer}
          onClose={() => this.handleClaimScreen(false)}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <ClaimLoan
              key="refund-loan-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              smeDetails={this.props.smeDetails}
              onClose={() => this.handleClaimScreen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* transaction overview */}
        <Dialog
          id="transaction-overview-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.ShowTransactionOverViewDrawer}
          onClose={() => this.closeTransactionOverview()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <TransactionOverviewReport
              key="transaction-overview-drawer-content"
              pdfData={this.state.html}
              smeLoan={this.props.loan}
              onClose={() => this.closeTransactionOverview()}
              decodedData={this.state.pdf}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}


SingleLoanOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
  smeDetails: PropTypes.object,
  loan: PropTypes.object,
  smeLoanHistories: PropTypes.array,
  directdebits: PropTypes.array,
  showTemporaryLoanStop: PropTypes.bool,
  showGeneratePaymentRequestDrayer: PropTypes.bool,
  startLoanAction: PropTypes.func.isRequired,
  showGeneratePaymentRequest: PropTypes.func.isRequired,
  changeMandateToEmandate: PropTypes.func.isRequired,
  showHideTemporaryLoanStop: PropTypes.func.isRequired,
  getLoanDetails: PropTypes.func.isRequired,
  getSmeLoanHistoriesByContractId: PropTypes.func.isRequired,
  setLoanStopHistoryOrigin: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  clearSelectedLoan: PropTypes.func.isRequired,
  clearSmeLoanHistories: PropTypes.func.isRequired,
  clearDirectDebits: PropTypes.func.isRequired,
  clearSmeEmailNotifications: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  activeMandateByCustomer: PropTypes.object.isRequired,
  clearCalculatedDataOfLoanTransactions: PropTypes.func.isRequired,
  getCalculatedDataOfLoanTransactions: PropTypes.func.isRequired,
  calculatedDataOfLoanTransactions: PropTypes.object.isRequired,
  isOpenLoanCancelModel: PropTypes.bool,
  cancelLoan: PropTypes.func,
  showCancelSmeLoanModal: PropTypes.func,
  generateTransactionOverview: PropTypes.func,
  configurations: PropTypes.object.isRequired,
  lmContractSysId: PropTypes.string,
  isDashboardContent: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    loan: state.lmglobal.selectedLoan,
    smeDetails: state.lmglobal.customerDetails,
    showTemporaryLoanStop: state.loanStopHistory.showTemporaryLoanStop,
    smeLoanHistories: state.smeLoanHistory.smeloanhistories,
    directdebits: state.smeLoanTransaction.directdebits,
    activeMandateByCustomer: state.mandates.activeMandateByCustomer,
    showGeneratePaymentRequestDrayer: state.generatepaymentrequest.showGeneratePaymentRequestDrayer,
    calculatedDataOfLoanTransactions: state.lmglobal.calculatedDataOfLoanTransactions,
    isOpenLoanCancelModel: state.smeLoans.isOpenLoanCancelModel,
    configurations: state.configurations,
    lmContractSysId: state.lmglobal.selectedLoan.contractId,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getLoanDetails: (contractId) => {
      dispatch(getSingleLoanOverviewData(contractId));
    },
    clearSelectedLoan: () => {
      dispatch(clearSelectedLoan());
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    showHideTemporaryLoanStop: () => {
      dispatch(showHideTemporaryLoanStop());
    },
    setLoanStopHistoryOrigin: (origin) => {
      dispatch(setLoanStopHistoryOrigin(origin));
    },
    getSmeLoanHistoriesByContractId: (contractId) => {
      dispatch(getSmeLoanHistoriesByContractId(contractId));
    },
    clearSmeLoanHistories: () => {
      dispatch(clearSmeLoanHistories());
    },
    getCalculatedDataOfLoanTransactions: (contractId) => {
      dispatch(getCalculatedDataOfLoanTransactions(contractId));
    },
    clearCalculatedDataOfLoanTransactions: () => {
      dispatch(clearCalculatedDataOfLoanTransactions());
    },
    clearDirectDebits: () => {
      dispatch(clearDirectDebits());
    },
    clearSmeEmailNotifications: () => {
      dispatch(clearSmeEmailNotifications());
    },
    retrieveEmailNotificationsBySme: (smeId) => {
      dispatch(retrieveEmailNotificationsBySme(smeId));
    },
    startLoanAction: (contractId, frequency, paymentOrderData, simulationDate) => {
      dispatch(startLoanAction(contractId, frequency, paymentOrderData, simulationDate));
    },
    changeMandateToEmandate: (mandateId) => {
      dispatch(setMandateToEmandate(mandateId));
    },
    showGeneratePaymentRequest: () => {
      dispatch(showGeneratePaymentRequest());
    },
    cancelLoan: (loanData) => {
      dispatch(cancelLoan(loanData));
    },
    showCancelSmeLoanModal: () => {
      dispatch(showCancelSmeLoanModal());
    },
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    generateTransactionOverview: (requestData, callback) => {
      dispatch(generateTransactionOverview(requestData, callback));
    },
    getMessagesListForLoanDashboard: (requestParams) => {
      dispatch(getMessagesListForLoanDashboard(requestParams));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SingleLoanOverview));
