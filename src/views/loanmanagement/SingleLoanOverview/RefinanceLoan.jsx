import moment from 'moment';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import ENV from '../../../config/env';

import withStyles from '@material-ui/core/styles/withStyles';
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell, Select, MenuItem, TextField, InputAdornment } from '@material-ui/core';

import GridItem from 'components/loanmanagement/Grid/GridItem';
import Button from 'components/loanmanagement/CustomButtons/Button';
import Loader from 'components/loanmanagement/CustomLoader/Loader.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import CustomInput from 'components/loanmanagement/CustomInput/CustomInput';
import CustomDatePicker from 'components/loanmanagement/CustomDatePicker/CustomDatePicker';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';

import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { refinanceLoan, requestSmeLoan, selectLoan } from 'store/loanmanagement/actions/SmeLoans';
import { requestContraDetailsFromOppotunity, clearOppotunityDetails, storeBaseRate } from 'store/loanmanagement/actions/Contracts';

import Util from 'lib/loanmanagement/utility';
import { ENVIRONMENT } from "constants/loanmanagement/config";
import { DDtype } from 'constants/loanmanagement/sme-loan-repayment-direct-debits';
import { smeLoanStatus, smeLoanType, riskCategory, frequency } from 'constants/loanmanagement/sme-loan';

import CurrentLoanData from './CurrentLoanData';
import SplitPayout from 'views/loanmanagement/Overview/SplitPayout';
import SplitDirectDebit from 'views/loanmanagement/Overview/SplitDirectDebit';

import { setNavigationInDashboards } from "store/initiation/actions/login";

const PERCENTAGE = Util.percentage;
const isProduction = Util.getEnv() === ENVIRONMENT.PRODUCTION;

const currency = Util.multiCurrencyConverter();
const numberFormatChange = Util.numberFormatDutchToEnglish;
const baseRate = ENV.BASE_RATE;
const dateValidForOlderPrepayment = ENV.VALID_DATE_FOR_OLDER_PREPAYMENTS;

class RefinanceLoan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalDiscount: 0,
      contractId: 'SBF',
      startDate: moment().format('YYYY-MM-DD'),
      outstandingNormalDD: 0,
      missedNormalDD: 0,
      outstandingAmountNormalDD: 0,
      outstandingSpecialDD: 0,
      missedSpecialDD: 0,
      outstandingAmountSpecialDD: 0,
      totalOutstandingAmount: 0,
      partialPaymentAmount: 0,
      discountOnInterest: 0,
      discountOnInitialFee: 0,
      standardTotalDiscount: 0,
      sentToBankDD: 0,
      sentToBankNormalDD: 0,
      sentToBankSpecialDD: 0,
      latestDate: null,
      smeLoanType: smeLoanType.FIXED,
      refinanceResult: {
        isSuccess: false,
        smeLoan: null,
        parentSmeLoan: null,
      },
      splitDdPeriod: {
        "1": { amount: 0, noOfDD: 0, total: 0 },
        "2": { amount: 0, noOfDD: 0, total: 0 },
        "3": { amount: 0, noOfDD: 0, total: 0 },
        ddStartDate: moment().format('YYYY-MM-DD'),
        total: 0,
        totalNoOfDD: 0,
      },
      isLoading: false,
      splitPayout: {
        isInstantPayment: 0,
        first: 0,
        others: []
      },
      baseInterest: baseRate,
      oldLoan: false
    };
  }

  componentDidMount() {
    this.loadInitialDates(0);
    this.storeBaseRate(baseRate);
  }

  componentDidUpdate(prevProps, prevState) {
      if (prevProps.opportunity.frequency !== this.props.opportunity.frequency) {
      let daysToAdd = 2;
      if(this.props.opportunity.frequency === 'weekly'){
        daysToAdd = 5;
      }  else if(this.props.opportunity.frequency === 'monthly'){
        daysToAdd = 20;
      }
      this.loadInitialDates(daysToAdd);

      if(!this.props.opportunity.frequency && prevProps.opportunity.frequency)
      this.loadInitialDates(0);
    }
  }
  loadInitialDates(daysToAdd){
    const systemDate = this.props.simulations.systemDate || moment().format('YYYY-MM-DD');
    const country = this.props.smeLoan.country;

    this.props.getNextWorkingDay(systemDate, daysToAdd, country )
      .then((result) => {
        const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
        splitDdPeriod.ddStartDate = result;

        this.setState({ startDate: systemDate, splitDdPeriod });
      });
  }

  componentWillUnmount() {

    this.props.clearOppotunityDetails();
  }

  handleNumberInput = (name, value) => {

    value = Number(value);
    if (value > 0) value = value * -1;
    this.setState({ [name]: value });
  };

  handleCustomInputChange = (name, value) => {

    if (name === 'contractId' && !value.match(/^SBF/)) value = 'SBF';
    if (name === 'contractId') value = value.trim();
   
    this.setState({ [name]: value });
  };

  hadleDateChange = (name, value) => {

    const _state = {};

    if (!moment(value).isValid()) return;

    value = moment(value).format('YYYY-MM-DD');

    if (name === 'ddStartDate' && moment(value).isBefore(moment(this.state.startDate))) {
      return;
    }

    this.setState({ isLoading: true });
    this.props.getNextWorkingDay(moment(value).subtract(1, 'day').format('YYYY-MM-DD'), 1 , this.props.smeLoan.country)
      .then((result) => {
        if (name === 'ddStartDate') {

          const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
          splitDdPeriod.ddStartDate = result;
          _state.splitDdPeriod = splitDdPeriod;
        }
        else if (name === 'startDate' && moment(this.state.splitDdPeriod.ddStartDate).isBefore(moment(result))) {

          const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
          splitDdPeriod.ddStartDate = result;
          _state.splitDdPeriod = splitDdPeriod;
          _state.startDate = result;
        }
        else {

          _state[name] = result;
        }
      })
      .finally(() => {
        _state.isLoading = false;
        this.setState(_state);
      });
  };

  getLoanDetails = (potentialId) => {

    /* Testable Potential Numbers */
    /* 'SBF6830', 'SBF6834', 'SBF6856', 'SBF6880', 'SBF6886' */
    if (potentialId === '' || potentialId === 'SBF') {
      this.props.clearOppotunityDetails();
      return;
    }

    this.setState({ isLoading: true });
    this.props.requestSmeLoan(potentialId, false)
      .then(response => {
        if (response && response.loanId) {
          this.props.displayNotification('Duplicate contract number!', 'warning');
          this.setState({ contractId: 'SBF' });
          return '';
        }
        const splittedId = potentialId.split('SBF-');
        potentialId = splittedId.length === 1 ? splittedId[0] : 'SBF' + splittedId[1];
        this.setState({ potentialId: potentialId });
        this.props.requestOpportunityDetails(potentialId, false);
      }).finally(() => {
        this.setState({ isLoading: false });
      });
  };

  updateSplitDD = value => {
    this.setState({ splitDdPeriod: value });
  };

  updateSplitPayout = value => {
    this.setState({ splitPayout: value });
  };

  confirmRefinaceLoan = () => {
    
    const { smeLoan, locale } = this.props;
    const language = locale.split('-');
    const smeId = this.props.smeDetails?.id;
    const smeLoanTransaction = this.props.smeLoanTransactions.find(tr => tr.type === DDtype.NORMAL);
    const instantPayment = Boolean(this.state.splitPayout.isInstantPayment);

    /* create the payout split array */
    let payoutAmount = [this.state.splitPayout.first];
    if (instantPayment && this.state.splitPayout.others) {
      payoutAmount = payoutAmount.concat(this.state.splitPayout.others.filter(amount => Number(amount) !== 0));
    }

    if (!this.props.opportunity) return this.props.displayNotification('Opportunity not found!', 'warning');
    if (!this.props.opportunity.amount) return this.props.displayNotification('Principal amount not found!', 'warning');
    if (!this.props.smeLoan._id) return this.props.displayNotification('Parent loan _id not found!', 'warning');
    if (!smeLoanTransaction.mandate) return this.props.displayNotification('Mandate _id not found!', 'warning');
    if (!smeId || smeId === '') return this.props.displayNotification('SME Id not found!', 'warning');
    if (!smeLoanTransaction) return this.props.displayNotification('No direct debits found for the loan', 'warning');
    if (Util.toFixed(this.additionalLoanRequestAmount) < 0) return this.props.displayNotification('Additional loan amount is negative. Check loan in V-Tiger', 'warning');
    if (Util.toFixed(payoutAmount.reduce((a, cv) => { return a + Number(cv); }, 0)) !== Util.toFixed(this.additionalLoanRequestAmount))
      return this.props.displayNotification('Sum of payout splits should equal to the To SME amount!', 'warning');
    if (!moment(this.state.startDate).isSameOrAfter(this.props.simulations.systemDate)) return this.props.displayNotification('Start date should be equal to system date or later date!', 'warning');

    const requestData = {
      smeLoan: {
        contractId: this.state.contractId,
        country: smeLoan.country,
        currency : smeLoan.currency,
        language : smeLoan.language,
        contractIdExtension: 0,
        type: this.state.smeLoanType,
        smeId: this.props.smeDetails?.id,
        status: smeLoanStatus.OUTSTANDING,
        startDate: this.state.startDate,
        principleAmount: Util.toFixed(this.props.opportunity.amount),
        interestAmount: Util.toFixed(this.props.opportunity.interest),
        initialCostAmount: Util.toFixed(this.props.opportunity.fees),
        recurringCostAmount: 0,
        interestPercentageBasePerMonth: Number(this.state.baseInterest),
        interestPercentageRiskSurchargePerMonth: Util.toFixed(this.props.opportunity.surcharge),
        numberOfMonths: this.props.opportunity.durationInMonths,
        interestPercentageTotal: Util.toFixed(this.props.opportunity.totalInterest) /* (1 + this.props.opportunity.surcharge) * this.props.opportunity.durationInMonths */,
        riskCategory: this.props.opportunity.riskCategory,
        directDebitFrequency: this.props.opportunity.frequency,
        plannedNumberOfDirectDebit: this.props.opportunity.terms,
        idRefinancedLoan: this.props.smeLoan._id,
        firstDirectDebitDate: this.state.splitDdPeriod.ddStartDate,
        numberOfDirectDebitsFirstPeriod: Number(this.state.splitDdPeriod["1"].noOfDD),
        directDebitAmountFirstPeriod: Util.toFixed(this.state.splitDdPeriod["1"].amount),
        numberOfDirectDebitsSecondPeriod: Number(this.state.splitDdPeriod["2"].noOfDD),
        directDebitAmountSecondPeriod: Util.toFixed(this.state.splitDdPeriod["2"].amount),
        numberOfDirectDebitsThirdPeriod: Number(this.state.splitDdPeriod["3"].noOfDD),
        directDebitAmountThirdPeriod: Util.toFixed(this.state.splitDdPeriod["3"].amount),
      },
      parentSmeLoan: {
        loanId: this.props.smeLoan._id,
        contractId: this.props.smeLoan.contractId,
        closingPaymentAmount: Util.toFixed(this.closingPaymentAmount),
        discountAmount: Util.toFixed(this.state.totalDiscount),
      },
      mandate: {
        _id: smeLoanTransaction.mandate,
        mandateId: smeLoanTransaction.mandateId,
        eMandate: true
      },
      instantPayment: instantPayment,
      payOutAmount: payoutAmount,
    };

    this.setState({ isLoading: true });
    this.props.refinanceLoan(requestData , language[0])
      .then(result => {
        
        const refinanceResult = {
          isSuccess: true,
          smeLoan: result.smeLoan,
          parentSmeLoan: result.parentSmeLoan,
        };
        this.setState({ refinanceResult });
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  calculateFormDisplayData = (formData) => {

    const totalDiscount = formData.standardTotalDiscount;

    this.setState({ ...formData, totalDiscount });
  };

  get closingPaymentAmount() {
    return this.state.totalOutstandingAmount + this.state.partialPaymentAmount + this.state.totalDiscount;
  }

  get additionalLoanRequestAmount() {
    return this.props.opportunity.amount - this.closingPaymentAmount;
  }

  get totalLoanAmount() {
    return (this.props.opportunity.amount) + this.props.opportunity.interest + this.props.opportunity.fees;
  }

  get standardDdAmount() {
    const val = Number((this.totalLoanAmount / this.props.opportunity.terms).toFixed(2));
    return isNaN(val) ? 0 : val;
  }

  redirectToChildSLO = () => {
    const { isDashboardContent } = this.props;
    const contract = this.state.refinanceResult.smeLoan;

    if (isDashboardContent) {
      this.props.selectLoan(contract);
      this.props.refreshLoanData(contract.contractId);
      this.props.onClose();
    }
    else {
      window.open('/user/singleLoanOverview/' + this.state.refinanceResult.smeLoan.contractId, "_self");
    }

  }

  redirectToParentSLO = () => {
    const { isDashboardContent } = this.props;
    const contract = this.props.smeLoan;

    if (isDashboardContent) {
      this.props.refreshLoanData(contract.contractId);
      this.props.onClose();
    }
    else {
      window.open('/user/singleLoanOverview/' + this.props.smeLoan.contractId, "_self");
    }

  }

  numberFormating = (number, withDecimals = true, thousandSeparator = '', decimalSeparator = '') => {
    try {

      if (!number || number === '') return '';
      const value = number.toString();
      let output = value;

      const [integerValue, floatValues] = value.match(/\./g) ? value.split(/\./g) : [value, ''];
 
      if (integerValue && integerValue.length > 3) {
        let placeholder = Array.from(integerValue).reverse().join('');
        placeholder = placeholder.match(/.{1,3}/g).join(thousandSeparator);
        placeholder = Array.from(placeholder).reverse().join('');

        output = placeholder;

      } else {
        output = integerValue;
      }

      if (withDecimals && value.match(/\./g)) output = `${output}${decimalSeparator}${floatValues}`;

      return output;

    } catch {
      return number;
    }
  }

  handlePercentageChanges = (event, name) => {
    let value = event.target.value;
    if (value && value !== '') {
      value = numberFormatChange(value);
    } 

    this.setState({ [name]: value});

    if(name === 'baseInterest'){
      this.storeBaseRate(value);
      //Requesting opertunity details for recalculate total interest with mutable base rate
      this.props.requestOpportunityDetails(this.state.potentialId, true)
      
    }
  }

  storeBaseRate = (rate) => {
    if(rate){
      //storing base rate in redux store due to the mutable base rate field
      this.props.storeBaseRate(rate)

    }else{
      this.props.displayNotification('Default base rate is required!', 'error');
    }
  }


  render() {
    const { classes , locale, symbol, decimalSeparator, thousandSeparator , smeLoan} = this.props;
    return (
      <div>
        <Table id="refinance-loan-table">
          <TableBody id="refinance-loan-table-body">
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold, classes.alignCenter)} colSpan={5}>REFINANCE</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold, classes.alignCenter)} colSpan={5}>(Old) Parent Loan</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/* PARENT LOAN */}
        <CurrentLoanData
          key="refinance-loan-content"
          saveCurrentLoanData={this.calculateFormDisplayData}
          smeLoanTransactions={this.props.smeLoanTransactions}
          smeLoan={this.props.smeLoan}
          parentState={this.state}
          closingPaymentAmount={this.closingPaymentAmount}
          handleNumberInput={this.handleNumberInput}
          usage='refinance'
          locale={locale}
          symbol={symbol}
          decimalSeparator={decimalSeparator}
          thousandSeparator={thousandSeparator}
        />

        {/* CHILD LOAN */}
        <GridContainer className={classes.newLoanHeadingBlock}>
          <GridItem className={classnames(classes.tableCellLessPadding, classes.bold)}>(New) Child Loan</GridItem>
        </GridContainer>
        {/* Top Line */}
        <GridContainer className={classes.gridContainer}>
          {/* Contract ID */}
          <GridItem xs={12} sm={12} md={4} lg={4}>
            <span className={classnames(classes.tableCellLessPadding, classes.bold)}>Contract ID</span>
            <span className={classnames(classes.tableCellLessPadding, classes.marginLeft)}>
              <CustomInput
                id='contract-id'
                formControlProps={{
                  className: classnames(classes.zeroMargin)
                }}
                inputProps={{
                  name: 'contractId',
                  value: this.state.contractId.trim(),
                  onBlur: (e) => this.getLoanDetails(e.target.value.trim()),
                  onChange: (e) => this.handleCustomInputChange('contractId', e.target.value.trim()),
                }}
              />
            </span>
          </GridItem>
          {/* SME Loan Type */}
          <GridItem xs={12} sm={12} md={4} lg={4}>
            {/* REMOVED FOR SM-758 */}
            {/* <span className={classnames(classes.tableCellLessPadding, classes.bold)}>Type</span>
            <span className={classnames(classes.tableCellLessPadding, classes.marginLeft)}>
              <Select
                value={this.state.smeLoanType}
                inputProps={{
                  name: "type",
                  id: "type-select"
                }}
                readOnly
              // onChange={(e) => this.handleCustomInputChange('loanType', e.target.value)}
              >
                {Object.keys(smeLoanType).map((key, index) => (
                  <MenuItem id={index + '-' + key} key={index} value={smeLoanType[key]}>{key}</MenuItem>
                ))}
              </Select>
            </span> */}
          </GridItem>
          {/* SME Loan Risk Category */}
          <GridItem xs={12} sm={12} md={4} lg={4}>
            {/* REMOVED FOR SM-758 */}
            {/* <span className={classnames(classes.tableCellLessPadding, classes.bold)}>Risk Category</span>
            <span className={classnames(classes.tableCellLessPadding, classes.marginLeft)}>
              <Select
                value={this.props.opportunity.riskCategory}
                inputProps={{
                  name: "riskCategory",
                  id: "risk-category-select"
                }}
                readOnly
              // onChange={(e) => this.handleCustomInputChange('riskCategory', e.target.value)}
              >
                {Object.keys(riskCategory).map((key, index) => (
                  <MenuItem id={index + '-' + key} key={index} value={riskCategory[key]}>{key}</MenuItem>
                ))}
              </Select>
            </span> */}
          </GridItem>
        </GridContainer>
        {/* Second Line */}
        <GridContainer className={classes.gridContainer}>
          {/* Amount Block */}
          <GridItem className={classes.block}>
            <Table id="refinance-amount-table"><TableBody id="refinance-amount-table-body">
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Closing Payment</TableCell>
                  <TableCell id="refinance-amount-table-closing-payment-amount" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                    {currency(this.closingPaymentAmount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')} 
                  </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Additional Loan Request</TableCell>
                <TableCell id="refinance-amount-table-additional-loan-request-amount" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                  {currency(this.additionalLoanRequestAmount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}                 
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>New Principal Amount</TableCell>
                <TableCell id="refinance-amount-table-opportunity-amount" className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>
                  {isProduction ? currency(this.props.opportunity.amount , locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')
                    :
                  (
                    <MultiCurrencyCustomFormatInput
                      type="text"
                      id="new-principal-amount"
                      name="newPrincipalAmount"
                      numberformat={this.props.opportunity.amount}
                      className={classes.amountInput}
                      // changeValue={(val) => this.handleCustomInputChange('initialCostAmount', val)}
                      readOnly
                      symbol={symbol}
                      decimalSeparator={decimalSeparator}
                      thousandSeparator={thousandSeparator}
                    />
                  )}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Initial Fee</TableCell>
                <TableCell id="refinance-amount-table-opportunity-fees" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                  {currency(this.props.opportunity.fees , locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Interest Fee</TableCell>
                <TableCell id="refinance-amount-table-opportunity-interest" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                    {currency(this.props.opportunity.interest , locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                  </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>Total New Loan Amount</TableCell>
                <TableCell id="refinance-amount-table-total-loan-amount" className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>
                  {currency(this.totalLoanAmount , locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                </TableCell>
              </TableRow>
            </TableBody></Table>
          </GridItem>
          {/* Interest Block */}
          <GridItem className={classes.block}>
            <Table id="refinance-interest-table"><TableBody id="refinance-interest-table-body">
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Interest % Base</TableCell>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                  <TextField
                      name="baseInterest"
                      id="baseInterest"
                      value={this.numberFormating(this.state.baseInterest, true, '', decimalSeparator)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      onChange={(event) => this.handlePercentageChanges(event, 'baseInterest')}
                      className={classes.percentageInput}
                          
                    />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Interest % Surcharge</TableCell>
                <TableCell id="refinance-interest-table-opportunity-surcharge" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>{PERCENTAGE(this.props.opportunity.surcharge)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>Interest % Total</TableCell>
                <TableCell id="refinance-interest-table-opportunity-total-interest" className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>{PERCENTAGE(this.props.opportunity.totalInterest)}</TableCell>
              </TableRow>
            </TableBody></Table>
          </GridItem>
          {/* Dates Block */}
          <GridItem className={classes.block}>
            <Table id="refinance-date-table"><TableBody id="refinance-date-table-body"><TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold)}>Start Loan Date</TableCell>
              <TableCell id="refinance-date-table-start-date" className={classnames(classes.tableCellLessPadding, classes.noBorder)}><CustomDatePicker label="" name="startDate" value={this.state.startDate} onChange={this.hadleDateChange} /></TableCell>
            </TableRow></TableBody></Table>
          </GridItem>
        </GridContainer>
        {/* Third Line */}
        <GridContainer className={classes.gridContainer}>
          {/* Frequency Block */}
          <GridItem className={classes.block}>
            <Table id="refinance-frequency-table"><TableBody id="refinance-frequency-table-body">
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Frequency</TableCell>
                <TableCell id="refinance-frequency-table-opportunity-frequency" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>{isProduction ? this.props.opportunity.frequency :
                  (
                    <Select
                      value={this.props.opportunity.frequency}
                      inputProps={{
                        name: "directDebitFrequency",
                        id: "directDebitFrequency"
                      }}
                      // onChange={(e) => this.handleCustomInputChange('directDebitFrequency', e.target.value)}
                      readOnly
                    >
                      {Object.keys(frequency).map((key, index) => (
                        <MenuItem id={index + '-' + key} key={index} value={frequency[key]}>{key}</MenuItem>
                      ))}
                    </Select>
                  )}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Duration</TableCell>
                <TableCell id="refinance-frequency-table-opportunity-duration-in-months" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>{this.props.opportunity.durationInMonths}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>No of DD</TableCell>
                <TableCell id="refinance-frequency-table-opportunity-terms" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>{isProduction ? this.props.opportunity.terms :
                  (
                    <TextField
                      type="number"
                      id="plannedNumberOfDirectDebit"
                      name="plannedNumberOfDirectDebit"
                      className={classes.numberInput}
                      value={this.props.opportunity.terms}
                    // onChange={(e) => this.handleCustomInputChange('plannedNumberOfDirectDebit', e.target.value)}
                    />
                  )}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder)}>Standard DD Amount</TableCell>
                <TableCell id="refinance-frequency-table-standard-dd-amount" className={classnames(classes.tableCellLessPadding, classes.noBorder)}>
                  {currency(this.standardDdAmount , locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                </TableCell>
              </TableRow>
            </TableBody></Table>
          </GridItem>
          {/* Split Direct Debit Block */}
          <GridItem className={classes.block}>
            <SplitDirectDebit
              key="refinance-dd-split"
              splitDdPeriod={this.state.splitDdPeriod}
              plannedNoOfDD={Number(this.props.opportunity.terms)}
              totalLoanAmount={this.totalLoanAmount}
              onChange={this.updateSplitDD}
              symbol={symbol}
              decimalSeparator={decimalSeparator}
              thousandSeparator={thousandSeparator}
              locale={locale}
              currency={smeLoan.currency}
              displayNotification={this.props.displayNotification}
              handleDatePicker={this.hadleDateChange}
            />
          </GridItem>
        </GridContainer>
        {/* Split Pay out Block */}
        <GridContainer>
          <GridItem className={classes.block}>
            <SplitPayout
              key="refinance-split-payout"
              principalAmount={Util.toFixed(this.additionalLoanRequestAmount)}
              splitPayout={this.state.splitPayout}
              symbol={symbol}
              decimalSeparator={decimalSeparator}
              thousandSeparator={thousandSeparator}
              onChange={this.updateSplitPayout}
              displayNotification={this.props.displayNotification}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.footer}>
          <Button color='danger' id="refinance-cancel-button" onClick={this.props.onClose} disabled={this.state.isLoading}>CANCEL</Button>
          <Button color='success' id="refinance-confirm-button" onClick={this.confirmRefinaceLoan} disabled={this.state.isLoading} className={classes.marginLeft}>CONFIRM</Button>
        </GridContainer>

        <ConfirmationDialog
          key="refinance-confirm-dialog"
          title='Select an SME loan to view'
          ok='New SME Loan'
          cancel='Refinanced SME Loan'
          open={this.state.refinanceResult.isSuccess}
          handleOk={this.redirectToChildSLO}
          handleCancel={() => { this.redirectToParentSLO(); }}
          dialogContent={(
            <TableBody id="refinance-confirm-dialog-content">
              <TableRow><TableCell>Parent/Refinanced Loan</TableCell><TableCell id="refinance-confirm-dialog-parent-sme-loan">{this.state.refinanceResult.parentSmeLoan?.contractId}</TableCell></TableRow>
              <TableRow><TableCell>Child/New Loan</TableCell><TableCell id="refinance-confirm-dialog-sme-loan">{this.state.refinanceResult.smeLoan?.contractId}</TableCell></TableRow>
            </TableBody>)}
        />

        <Loader key="refinance-confirm-dialog-loader" open={this.state.isLoading} />

      </div>
    );
  }
}

RefinanceLoan.propTypes = {
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  opportunity: PropTypes.object.isRequired,
  simulations: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  refinanceLoan: PropTypes.func.isRequired,
  requestSmeLoan: PropTypes.func.isRequired,
  getNextWorkingDay: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  clearOppotunityDetails: PropTypes.func.isRequired,
  requestOpportunityDetails: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  selectedDashboardItems: PropTypes.array,
  setNavigationInDashboards: PropTypes.func,
  refreshLoanData: PropTypes.func,
  selectLoan: PropTypes.func.isRequired,
  storeBaseRate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {

    simulations: state.configurations.simulations,
    opportunity: state.contracts.oppotunityDetails,
    smeDetails: state.lmglobal.customerDetails,
    isDashboardContent: state.user.isDashboardContent,
    selectedDashboardItems: state.user.selectedDashboardItems,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {

    requestOpportunityDetails: (opportunityId, baseRateChange) => {
      return dispatch(requestContraDetailsFromOppotunity(opportunityId, baseRateChange));
    },
    clearOppotunityDetails: () => {
      dispatch(clearOppotunityDetails());
    },
    getNextWorkingDay: (startDate, noOfDaysAhead , country) => {
      return dispatch(getNextWorkingDate(startDate, noOfDaysAhead , country));
    },
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    refinanceLoan: (opportunityId  , language) => (dispatch(refinanceLoan(opportunityId  , language))),
    requestSmeLoan: (contractId, shouldUpdateRedux) => (dispatch(requestSmeLoan(contractId, shouldUpdateRedux))),
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    storeBaseRate: (rate) => dispatch(storeBaseRate(rate))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(RefinanceLoan));
