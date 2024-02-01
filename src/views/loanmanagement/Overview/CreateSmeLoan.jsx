import moment from 'moment';
import clx from 'classnames';
import { cloneDeep } from 'lodash';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import Style from "assets/jss/material-dashboard-react/views/createSmeLoanStyles";

import Card from 'components/loanmanagement/Card/Card';
import CardBody from 'components/loanmanagement/Card/CardBody';
import GridItem from 'components/loanmanagement/Grid/GridItem';
import CardFooter from 'components/loanmanagement/Card/CardFooter';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import CustomInput from "components/loanmanagement/CustomInput/CustomInput";
import CustomDatePicker from 'components/loanmanagement/CustomDatePicker/CustomDatePicker';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

import {
  Select, MenuItem, TableRow, TableCell, TableBody, Table, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, 
  InputAdornment
} from '@material-ui/core';

import SplitDirectDebit from './SplitDirectDebit';
import SplitPayout from './SplitPayout';

import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { requestSmeLoan, addNewSmeLoan, createNewSmeLoanBusy, checkOutstandingFixedLoans, selectLoan } from "store/loanmanagement/actions/SmeLoans";
import { requestContraDetailsFromOppotunity, clearOppotunityDetails, getContract, storeBaseRate } from "store/loanmanagement/actions/Contracts";
import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

import util from "lib/loanmanagement/utility";
import { smeLoanType, riskCategory, smeLoanStatus, frequency } from "constants/loanmanagement/sme-loan";
import { ENVIRONMENT } from "constants/loanmanagement/config";
import { clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import { setNavigationInDashboards } from "store/initiation/actions/login";
import history from "./../../../history";
import ENV from '../../../config/env';

const CURRENCY = util.multiCurrencyConverter();
const PERCENTAGE = util.multiCurrencyPercentage;
const numberFormatChange = util.numberFormatDutchToEnglish;
const isProduction = util.getEnv() === ENVIRONMENT.PRODUCTION;
const interestBase = ENV.BASE_RATE;

class AddContracts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contractId: 'SBF',
      loanType: smeLoanType.FIXED,
      riskCategory: riskCategory.A,
      startDate: moment().format('YYYY-MM-DD'),
      interestPecentagebasePerMonth: interestBase,
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
      principalAmount: 0,
      interestAmount: 0,
      initialCostAmount: 0,
      directDebitFrequency: '',
      plannedNumberOfDirectDebit: 0,
      hasLoansPopUpOpen: false,
      country: 'NL',
      currency: 'EUR',
      currencySelection: 'EUR',
      language: 'nl',
      locale: 'nl-NL',
      countries: [],
      currencies: [],
      languages: [],
      symbol: '€',
      decimalSeparator: ',',
      thousandSeparator: '.',
      isValidLocale: true
    };
  }

  componentDidMount() {
    const daysToAdd = this.getDaysByFrequency();
    this.handleDdStartDate(daysToAdd);
    this.getFieldNameValues();
    this.storeBaseRate(interestBase);
  }

  componentDidUpdate(prevProps) {
    
    const { opportunity } = this.props;
    if (prevProps.opportunity.potentialNo !== opportunity.potentialNo) {
      this.setState({
        principalAmount: isNaN(Number(opportunity.amount)) ? 0 : Number(opportunity.amount),
        interestAmount: isNaN(Number(opportunity.interest)) ? 0 : Number(opportunity.interest),
        initialCostAmount: isNaN(Number(opportunity.fees)) ? 0 : Number(opportunity.fees),
        directDebitFrequency: opportunity.frequency,
        plannedNumberOfDirectDebit: isNaN(Number(opportunity.terms)) ? 0 : Number(opportunity.terms),
        riskCategory: opportunity.riskCategory
      });

      // if not dd frequency value ddStartDate to system date
      if (!opportunity.frequency) this.handleDdStartDate(0);
      
    }
  }

  componentWillUnmount() {
    this.props.clearOppotunityDetails();
  }

  updateSplitDD = value => {
    this.setState({ splitDdPeriod: value });
  }

  updateSplitPayout = value => {
    this.setState({ splitPayout: value });
  };

  handleCustomInputChange = (name, value) => {

    this.setState({ [name]: value }, () => {
      if (name==='directDebitFrequency') {
        const daysToAdd = this.getDaysByFrequency();
        this.handleDdStartDate(daysToAdd);
      }
    });
  };


  // get days ahead according to dd frequency
  getDaysByFrequency = () => {
    const frequency = this.state.directDebitFrequency;
        let daysToAdd = 0;
        if(frequency==="daily"){
          daysToAdd = 2;
        } else if (frequency==="weekly"){
          daysToAdd = 5;
        } else if (frequency==="monthly"){
          daysToAdd = 20;
        } else {
          daysToAdd = 0;
        }
        return daysToAdd;    

  }


  // handle the ddStartDate
  handleDdStartDate = (daysToAhead) => {
    const systemDate = this.props.simulations.systemDate || moment().format('YYYY-MM-DD');
    this.props.getNextWorkingDate(systemDate, daysToAhead)
      .then((result) => {
              const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
              splitDdPeriod.ddStartDate = result;
              
              this.setState({ splitDdPeriod, startDate: systemDate });
        });
  }


  handleDatePicker = (name, value) => {
    const _state = {};

    if (!moment(value).isValid()) {
      if (name === 'startDate') this.setState({ startDate: null });
      else {
        const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
        splitDdPeriod.ddStartDate = null;
        this.setState({ splitDdPeriod: splitDdPeriod });
      }
      return;
    }

    value = moment(value).format('YYYY-MM-DD');

    if (name === 'ddStartDate' && moment(value).isBefore(moment(this.state.startDate))) {
      return;
    }

    this.props.getNextWorkingDate(moment(value).subtract(1, 'day').format('YYYY-MM-DD'), 1)
      .then((result) => {
        if (name === 'ddStartDate') {

          const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
          splitDdPeriod.ddStartDate = result;
          _state.splitDdPeriod = splitDdPeriod;

          if (this.state.startDate === null) _state.startDate = result;
        }
        else if (name === 'startDate' && moment(this.state.splitDdPeriod.ddStartDate).isBefore(moment(result))) {

          const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
          splitDdPeriod.ddStartDate = result;
          _state.splitDdPeriod = splitDdPeriod;
          _state.startDate = result;
        }
        else if (name === 'startDate' && this.state.splitDdPeriod.ddStartDate === null) {
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
        this.setState(_state);
      });
  };

  getFieldNameValues = () => {

    const requestObjs = [{
      fieldName: 'country',
      stateName: 'countries'
    }, {
      fieldName: 'currency',
      stateName: 'currencies'
    }, {
      fieldName: 'language',
      stateName: 'languages'
    }];

    for (let i = 0; i < requestObjs.length; i++) {
      this.props.getFieldNameValues(requestObjs[i])
        .then((response) => {
          if (Array.isArray(response)) {
            if (response.length > 0) {
              const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
                .map(fieldNameValue => fieldNameValue.fieldNameValue);
              const setFieldName = {};
              setFieldName[requestObjs[i].stateName] = fieldNameValues;
              this.setState(setFieldName);
            }
          }
        });
    }
  }

  getLocales = async () => {
    const { country } = this.state;

    this.props.getLocales({ countryCode: country })
      .then(res => {
        if (!res || res.length === 0) return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        const selectedLocale = res[0];

        this.setState({
          locale: selectedLocale.locale,
          symbol: selectedLocale.currencySymbol,
          currency: selectedLocale.currencyCode,
          currencySelection: selectedLocale.currencyCode,
          decimalSeparator: selectedLocale.decimalSeparator,
          thousandSeparator: selectedLocale.thousandSeparator,
          isValidLocale: true
        });
      })
      .catch(err => { console.log('getLocales err ', err); });
  }

  checkLocales = (name, value) => {

    this.setState(() => ({ [name]: value }), () => {
      if (this.state.country) this.getLocales();
    });
  }

  getLoanDetails = (potentialId) => {

    if (potentialId === '' || potentialId === 'SBF') {
      this.props.clearOppotunityDetails();
      return;
    }

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
        this.props.requestOpportunityDetails(potentialId, false)
        .then(()=>{
          const daysToAdd = this.getDaysByFrequency();
          this.handleDdStartDate(daysToAdd);
        });
      });
  };

  createSmeLoan = async () => {

    this.setState({ isLoading: true });
    const { smeId, smeMandate, opportunity, isDashboardContent } = this.props;
    const { locale } = this.state;
    const instantPayment = Boolean(this.state.splitPayout.isInstantPayment);

    const systemDate = this.props.simulations.systemDate || moment().format('YYYY-MM-DD');

    /* create the payout split array */
    let payoutAmount = [this.state.splitPayout.first];
    if (instantPayment && this.state.splitPayout.others) {
      payoutAmount = payoutAmount.concat(this.state.splitPayout.others.filter(amount => Number(amount) !== 0));
    }

    if (util.isNullOrEmpty(this.state.contractId) || this.state.contractId.trim() === 'SBF') {
      this.props.displayNotification('Please fill contract number', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (util.isNullOrEmpty(smeMandate.mandateId)) {
      this.props.displayNotification('Selected Mandate is noat available', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (util.isNullOrEmpty(smeId)) {
      this.props.displayNotification('SME details are not available', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (util.isNullOrEmpty(opportunity.potentialNo)) {
      this.props.displayNotification('Opportunity details not available', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (!moment(this.state.startDate).isValid()) {
      this.props.displayNotification('Loan start date not available', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (!moment(systemDate).isSameOrBefore(this.state.startDate)) {
      this.props.displayNotification('Invalid loan start date selected', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (!moment(this.state.splitDdPeriod.ddStartDate).isValid()) {
      this.props.displayNotification('Fisrt direct debit date not available', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (!moment(this.state.startDate).isSameOrBefore(this.state.splitDdPeriod.ddStartDate)) {
      this.props.displayNotification('Direct debit start date should be greater than loan start date', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (util.toFixed(payoutAmount.reduce((a, cv) => { return a + Number(cv); }, 0)) !== util.toFixed(this.state.principalAmount)) {
      this.props.displayNotification('Sum of payout splits should equal to the principal amount!', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (!this.state.isValidLocale) {
      this.props.displayNotification('Country and currency doesnt fit', 'warning');
      this.setState({ isLoading: false });
      return;
    }
    else if (this.state.interestPecentagebasePerMonth === '') {
      this.props.displayNotification('Base Rate Cannot be Empty', 'warning');
      this.setState({ isLoading: false });
      return;
    }

    const createSmeLoanObj = {
      contractId: this.state.contractId,
      contractIdExtension: 0,
      country: this.state.country,
      currency: this.state.currency,
      language: this.state.language,
      type: this.state.loanType,
      smeId: smeId,
      status: smeLoanStatus.OUTSTANDING,
      startDate: this.state.startDate,
      principleAmount: util.toFixed(this.state.principalAmount),
      interestAmount: util.toFixed(this.state.interestAmount),
      initialCostAmount: util.toFixed(this.state.initialCostAmount),
      recurringCostAmount: 0,
      interestPercentageTotal: opportunity.totalInterest,
      interestPercentageBasePerMonth: Number(this.state.interestPecentagebasePerMonth),
      interestPercentageRiskSurchargePerMonth: opportunity.surcharge,
      numberOfMonths: Number(opportunity.durationInMonths),
      riskCategory: this.state.riskCategory,
      directDebitFrequency: this.state.directDebitFrequency,
      plannedNumberOfDirectDebit: Number(this.state.plannedNumberOfDirectDebit),
      firstDirectDebitDate: this.state.splitDdPeriod.ddStartDate,
      numberOfDirectDebitsFirstPeriod: Number(this.state.splitDdPeriod["1"].noOfDD),
      directDebitAmountFirstPeriod: Number(this.state.splitDdPeriod["1"].amount),
      numberOfDirectDebitsSecondPeriod: Number(this.state.splitDdPeriod["2"].noOfDD),
      directDebitAmountSecondPeriod: Number(this.state.splitDdPeriod["2"].amount),
      numberOfDirectDebitsThirdPeriod: Number(this.state.splitDdPeriod["3"].noOfDD),
      directDebitAmountThirdPeriod: Number(this.state.splitDdPeriod["3"].amount),
    };

    const otherValuesInRequest = {
      instantPayment: instantPayment,
      payOutAmount: payoutAmount,
    };

    const language = locale.split('-');

    this.props.SavingNewContractBusy();
    this.props.addNewSmeLoan(createSmeLoanObj, smeMandate, otherValuesInRequest, language[0])
      .then((response) => {

        if (response !== null) {
          if (isDashboardContent) {
            this.props.clearSelectedCustomer();
            const contractId = response.contractId;
            const country = response.country;
            const currency = response.currency;
            this.props.selectLoan({ contractId, country, currency });
            this.props.toggleDrawer();// close the popup menu

            this.props.setNavigationInDashboards('SingleLoanOverview')
              .then(res => {
                if (res) {
                  history.push(res);
                }
              });
          } else {
            this.props.toggleDrawer(); //OtherRoutes
            window.open('/user/singleLoanOverview/' + response.contractId, "_self");
          }

        }
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  checkHasOutstandingLoans = () => {

    this.props.checkOutstandingFixedLoans(this.props.smeId)
      .then(result => {
        if (!result) return this.setState({ hasLoansPopUpOpen: true });
        return this.createSmeLoan();
      })
      .catch(() => {
        this.props.displayNotification('Error occured in check outstanding fixed loans!', 'error');
      });
  };

  closeCheckOutstandingPopup = () => {

    return this.setState({ hasLoansPopUpOpen: false });
  }

  get totalLoanAmount() {
    return Number((Number(this.state.principalAmount) + Number(this.state.interestAmount) + Number(this.state.initialCostAmount)).toFixed(2));
  }

  get standardDdAmount() {
    const val = Number((this.totalLoanAmount / Number(this.state.plannedNumberOfDirectDebit)).toFixed(2));
    return isNaN(val) ? 0 : val;
  }

  /** check if contract exists or not */
  getContract = (contractId, type) => {
    this.props.getContract(contractId, type)
      .then(response => {
        const responseMessage = response;
        if (responseMessage === 'CONTRACT-NOT-EXISTS') {
          this.setState({
            isLoading: true
          });
        } else {
          this.setState({
            isLoading: false
          });
        }
      });
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

  handleNumberChanges = (event, name) => {
    let value = event.target.value;
    if (value && value !== '') {
      value = numberFormatChange(value);
    } 

    this.setState({ [name]: value});
    if(name === 'interestPecentagebasePerMonth'){
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
    const { classes, opportunity } = this.props;

    const { hasLoansPopUpOpen, countries, currencies, languages, locale, currency, interestPecentagebasePerMonth } = this.state;

    return (
      <div>
        <Card>
          <CardBody>
            {/* Top Line */}
            <GridContainer className={classes.gridContainer}>
              {/* Contract ID */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="contract-id-label" className={clx(classes.tableCell, classes.bold)}>Contract ID</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <CustomInput
                    id='contract-id'
                    formControlProps={{
                      className: clx(classes.zeroMargin)
                    }}
                    inputProps={{
                      name: 'contractId',
                      value: this.state.contractId.trim(),
                      onBlur: (e) => {
                        this.getContract(e.target.value.trim(), 'FIX');
                        this.getLoanDetails(e.target.value.trim());
                      },
                      onChange: (e) => this.handleCustomInputChange('contractId', e.target.value.trim()),
                    }}
                  />
                </span>
              </GridItem>
              {/* SME Loan Type */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="loan-type-label" className={clx(classes.tableCell, classes.bold)}>Type</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    id="loan-type"
                    name="loan-type"
                    value={this.state.loanType}
                    inputProps={{
                      name: "type",
                      id: "type"
                    }}
                    onChange={(e) => this.handleCustomInputChange('loanType', e.target.value)}
                  >
                    {Object.keys(smeLoanType).map((key, index) => (
                      <MenuItem key={index} value={smeLoanType[key]}>{key}</MenuItem>
                    ))}
                  </Select>
                </span>
              </GridItem>
              {/* SME Loan Risk Category */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="risk-category-label" className={clx(classes.tableCell, classes.bold)}>Risk Category</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    id="risk-category"
                    name="risk-category"
                    value={this.state.riskCategory}
                    inputProps={{
                      name: "riskCategory",
                      id: "risk-category"
                    }}
                    onChange={(e) => this.handleCustomInputChange('riskCategory', e.target.value)}
                  >
                    {Object.keys(riskCategory).map((key, index) => (
                      <MenuItem key={index} value={riskCategory[key]}>{key}</MenuItem>
                    ))}
                  </Select>
                </span>
              </GridItem>
            </GridContainer>
            <GridContainer className={classes.gridContainer}>
              {/* Country */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="country-label" className={clx(classes.tableCell, classes.bold)}>Country</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    id="country"
                    name="country"
                    value={this.state.country}
                    inputProps={{
                      name: "country",
                      id: "country"
                    }}
                    onChange={(e) => this.checkLocales('country', e.target.value)}
                  >
                    {countries.map((country, index) =>
                      <MenuItem key={index} value={country}>{country}</MenuItem>
                    )}
                  </Select>
                </span>
              </GridItem>
              {/* Currency */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="currency-label" className={clx(classes.tableCell, classes.bold)}>Currency</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    id="currencySelection"
                    name="currencySelection"
                    value={this.state.currencySelection}
                    disabled={true}
                    inputProps={{
                      name: "currencySelection",
                      id: "currencySelection"
                    }}
                  >
                    {currencies.map((currency, index) =>
                      <MenuItem key={index} value={currency}>{currency}</MenuItem>
                    )}
                  </Select>
                </span>
              </GridItem>
              {/* Language */}
              <GridItem xs={12} sm={12} md={4} lg={4}>
                <span id="language-label" className={clx(classes.tableCell, classes.bold)}>Language</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    id="language"
                    name="language"
                    value={this.state.language}
                    inputProps={{
                      name: "language",
                      id: "language"
                    }}
                    onChange={(e) => this.handleCustomInputChange('language', e.target.value)}
                  >
                    {languages.map((language, index) =>
                      <MenuItem key={index} value={language}>{language}</MenuItem>
                    )}
                  </Select>
                </span>
              </GridItem>
            </GridContainer>
            {/* Second Line */}
            <GridContainer className={classes.gridContainer}>
              {/* Amount Block */}
              <GridItem className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell id="principal-amount-label" className={clx(classes.tableCell)}>Principal Amount</TableCell>
                    <TableCell id="principal-amount-value" className={clx(classes.tableCell)}>{isProduction ? CURRENCY(this.state.principalAmount, locale, currency) :
                      (
                        <MultiCurrencyCustomFormatInput
                          type="text"
                          id="principalAmount"
                          name="principalAmount"
                          numberformat={this.state.principalAmount}
                          className={classes.amountInput}
                          symbol={this.state.symbol}
                          decimalSeparator={this.state.decimalSeparator}
                          thousandSeparator={this.state.thousandSeparator}
                          changeValue={(val) => this.handleCustomInputChange('principalAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="interest-label" className={clx(classes.tableCell)}>Interest</TableCell>
                    <TableCell id="interest-value" className={clx(classes.tableCell)}>{isProduction ? CURRENCY(this.state.interestAmount, locale, currency) :
                      (
                        <MultiCurrencyCustomFormatInput
                          type="text"
                          id="interestAmount"
                          name="interestAmount"
                          numberformat={this.state.interestAmount}
                          className={classes.amountInput}
                          symbol={this.state.symbol}
                          decimalSeparator={this.state.decimalSeparator}
                          thousandSeparator={this.state.thousandSeparator}
                          changeValue={(val) => this.handleCustomInputChange('interestAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="fees-label" className={clx(classes.tableCell)}>Fees</TableCell>
                    <TableCell id="fees-value" className={clx(classes.tableCell)}>{isProduction ? CURRENCY(this.state.initialCostAmount, locale, currency) :
                      (
                        <MultiCurrencyCustomFormatInput
                          type="text"
                          id="initialCostAmount"
                          name="initialCostAmount"
                          numberformat={this.state.initialCostAmount}
                          className={classes.amountInput}
                          symbol={this.state.symbol}
                          decimalSeparator={this.state.decimalSeparator}
                          thousandSeparator={this.state.thousandSeparator}
                          changeValue={(val) => this.handleCustomInputChange('initialCostAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="total-label" className={clx(classes.tableCell, classes.bold)}>Total</TableCell>
                    <TableCell id="total-value" className={clx(classes.tableCell, classes.bold)}>{CURRENCY(this.totalLoanAmount, locale, currency)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Interest Block */}
              <GridItem className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell id="interest-base-label" className={clx(classes.tableCell)}>Interest % Base</TableCell>
                    <TableCell id="interest-base-value" className={clx(classes.tableCell)}>
                      <TextField
                          name="interestPecentagebasePerMonth"
                          id="interestPecentagebasePerMonth"
                          value={this.numberFormating(interestPecentagebasePerMonth, true, '', this.state.decimalSeparator)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          onChange={(event) => this.handleNumberChanges(event, 'interestPecentagebasePerMonth')}
                          className={classes.percentageInput}
                          
                      />
                      </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="interest-surcharge-label" className={clx(classes.tableCell)}>Interest % Surcharge</TableCell>
                    <TableCell id="interest-surcharge-value" className={clx(classes.tableCell)}>{PERCENTAGE(opportunity.surcharge, locale)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="interest-total-label" className={clx(classes.tableCell, classes.bold)}>Interest % Total</TableCell>
                    <TableCell id="interest-total-value" className={clx(classes.tableCell, classes.bold)}>{PERCENTAGE(opportunity.totalInterest, locale)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Dates Block */}
              <GridItem className={classes.block}>
                <Table><TableBody><TableRow>
                  <TableCell id="start-loan-date-label" className={clx(classes.tableCell, classes.bold)}>Start Loan Date</TableCell>
                  <TableCell id="start-loan-date-value" className={clx(classes.tableCell)}><CustomDatePicker label="" name="startDate" value={this.state.startDate} onChange={this.handleDatePicker} /></TableCell>
                </TableRow></TableBody></Table>
              </GridItem>
            </GridContainer>
            {/* Third Line */}
            <GridContainer className={classes.gridContainer}>
              {/* Frequency Block */}
              <GridItem className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell id="frequency-label" className={clx(classes.tableCell)}>Frequency</TableCell>
                    <TableCell id="frequency-value" className={clx(classes.tableCell)}>{isProduction ? this.state.directDebitFrequency :
                      (
                        <Select
                          value={this.state.directDebitFrequency}
                          inputProps={{
                            name: "directDebitFrequency",
                            id: "directDebitFrequency"
                          }}
                          onChange={(e) => this.handleCustomInputChange('directDebitFrequency', e.target.value)}
                        >
                          {Object.keys(frequency).map((key, index) => (
                            <MenuItem key={index} value={frequency[key]}>{key}</MenuItem>
                          ))}
                        </Select>
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="duration-label" className={clx(classes.tableCell)}>Duration</TableCell>
                    <TableCell id="duration-value" className={clx(classes.tableCell)}>{opportunity.durationInMonths}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="number-of-dd-label" className={clx(classes.tableCell)}>No of DD</TableCell>
                    <TableCell id="number-of-dd-value" className={clx(classes.tableCell)}>{isProduction ? this.state.plannedNumberOfDirectDebit :
                      (
                        <TextField
                          type="number"
                          id="plannedNumberOfDirectDebit"
                          name="plannedNumberOfDirectDebit"
                          className={classes.numberInput}
                          value={this.state.plannedNumberOfDirectDebit}
                          onChange={(e) => this.handleCustomInputChange('plannedNumberOfDirectDebit', e.target.value)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell id="standard-dd-amount-label" className={clx(classes.tableCell)}>Standard DD Amount</TableCell>
                    <TableCell id="standard-dd-amount-value" className={clx(classes.tableCell)}>{CURRENCY(this.standardDdAmount, locale, currency)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Split Direct Debit Block */}
              <GridItem className={classes.block}>
                <SplitDirectDebit
                  key="split-dd-component"
                  splitDdPeriod={this.state.splitDdPeriod}
                  plannedNoOfDD={Number(this.state.plannedNumberOfDirectDebit)}
                  totalLoanAmount={this.totalLoanAmount}
                  onChange={this.updateSplitDD}
                  symbol={this.state.symbol}
                  decimalSeparator={this.state.decimalSeparator}
                  thousandSeparator={this.state.thousandSeparator}
                  locale={this.state.locale}
                  currency={this.state.currency}
                  displayNotification={this.props.displayNotification}
                  handleDatePicker={this.handleDatePicker}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem className={classes.block}>
                <SplitPayout
                  key="split-payout-component"
                  principalAmount={util.toFixed(this.state.principalAmount)}
                  splitPayout={this.state.splitPayout}
                  symbol={this.state.symbol}
                  decimalSeparator={this.state.decimalSeparator}
                  thousandSeparator={this.state.thousandSeparator}
                  onChange={this.updateSplitPayout}
                  displayNotification={this.props.displayNotification}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button id="cancel-button" name="cancel-button" color="danger" size="sm" onClick={this.props.toggleDrawer} disabled={this.state.isLoading}>Cancel</Button>
            <Button id="create-sme-loan-button" name="create-sme-loan-button" color="info" size="sm" onClick={this.checkHasOutstandingLoans} disabled={this.state.isLoading}>Create SME Loan</Button>
          </CardFooter>
        </Card>
        <Dialog open={hasLoansPopUpOpen} aria-labelledby="confirm-add-loan" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">There is still a fixed-loan outstanding</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are you sure you want to add an additional fixed-loan?'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeCheckOutstandingPopup} className={classes.popupCloseButton} color="primary">
              Cancel
            </Button>
            <Button onClick={this.createSmeLoan} className={classes.popupAddButton} color="primary" >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AddContracts.propTypes = {
  classes: PropTypes.object.isRequired,
  smeMandate: PropTypes.object.isRequired,
  opportunity: PropTypes.object.isRequired,
  simulations: PropTypes.object.isRequired,
  smeId: PropTypes.string.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  addNewSmeLoan: PropTypes.func.isRequired,
  requestSmeLoan: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  SavingNewContractBusy: PropTypes.func.isRequired,
  clearOppotunityDetails: PropTypes.func.isRequired,
  requestOpportunityDetails: PropTypes.func.isRequired,
  checkOutstandingFixedLoans: PropTypes.func.isRequired,
  getContractContract: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  setNavigationInDashboards: PropTypes.func,
  selectLoan: PropTypes.func,
  clearSelectedCustomer: PropTypes.func.isRequired,
  getFieldNameValues: PropTypes.func,
  getLocales: PropTypes.func,
  storeBaseRate: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    simulations: state.configurations.simulations,
    opportunity: state.contracts.oppotunityDetails,
    smeId: state.lmglobal.customerDetails.id,
    smeMandate: state.mandates.selectedMandateFullObject,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    SavingNewContractBusy: () => dispatch(createNewSmeLoanBusy()),
    clearOppotunityDetails: () => dispatch(clearOppotunityDetails()),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    requestOpportunityDetails: (potentialId, isBaseRateChange) => dispatch(requestContraDetailsFromOppotunity(potentialId, isBaseRateChange)),
    addNewSmeLoan: (createSmeLoanObj, smeMandate, otherValues, language) => dispatch(addNewSmeLoan(createSmeLoanObj, smeMandate, otherValues, language)),
    getNextWorkingDate: (startDate, noOfDaysAhead) => (dispatch(getNextWorkingDate(startDate, noOfDaysAhead))),
    requestSmeLoan: (contractId, shouldUpdateRedux) => (dispatch(requestSmeLoan(contractId, shouldUpdateRedux))),
    checkOutstandingFixedLoans: (smeId) => (dispatch(checkOutstandingFixedLoans(smeId))),
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    getContract: (contractId, type) => (dispatch(getContract(contractId, type))),
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
    storeBaseRate: (rate) => dispatch(storeBaseRate(rate))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(AddContracts));
