/* cSpell:ignore smes */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button';

import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import { AddCircle, Publish } from '@material-ui/icons';

import MomentUtils from "@date-io/moment";

import { riskCategory } from "constants/loanmanagement/sme-loan";

import CustomSearch from 'components/loanmanagement/CustomAutoSuggest/CustomAutoSuggest';

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@material-ui/core';

import customStyles from 'assets/jss/material-dashboard-react/customStyles';

import { requestSmeLoan, getSmeLoanByQuery, addNewSmeFlexLoan, updateSmeFlexLoan } from "store/loanmanagement/actions/SmeLoans";

import { getContract } from "store/loanmanagement/actions/Contracts";

import { requestCustomerByVTigerIdPromise } from "store/loanmanagement/actions/Customers";

import { getSmeLoanTransactions } from "store/loanmanagement/actions/SmeLoanTransaction";

import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';

import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";

import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

import { displayNotification } from 'store/loanmanagement/actions/Notifier';

const valueRanges = {
  creditLimitAmount: { min: 5000, max: 100000, default: 5000 },
  withdrawalCostPercentage: { min: 1.00, max: 5.00, default: '1.00' },
  recurringInterestCostPercentage: { min: 0.50, max: 5.00, default: '0.50' },
  directDebitFrequency: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  numberOfMonths: { min: 3, max: 12, default: 6 },
  recurringCostCollectDate: { min: 6, max: 28, default: 15 },
};

const numberOfDirectDebits = {
  "3": { "daily": 65, "weekly": 13, "monthly": 3 },
  "4": { "daily": 87, "weekly": 18, "monthly": 4 },
  "5": { "daily": 109, "weekly": 22, "monthly": 5 },
  "6": { "daily": 130, "weekly": 26, "monthly": 6 },
  "7": { "daily": 152, "weekly": 30, "monthly": 7 },
  "8": { "daily": 174, "weekly": 35, "monthly": 8 },
  "9": { "daily": 195, "weekly": 39, "monthly": 9 },
  "10": { "daily": 217, "weekly": 44, "monthly": 10 },
  "11": { "daily": 239, "weekly": 48, "monthly": 11 },
  "12": { "daily": 260, "weekly": 52, "monthly": 12 }
};

const loanDetails = {
  startDate: null,
  isNewLoan: true,
  maturityDate: '9999-12-31',
  riskCategory: -1,
  currency: 'EUR',
  country: 'NL',
  language: 'nl',
  creditLimitAmount: valueRanges.creditLimitAmount.default,
  withdrawalCostPercentage: valueRanges.withdrawalCostPercentage.default,
  recurringInterestCostPercentage: valueRanges.recurringInterestCostPercentage.default,
  directDebitFrequency: 'weekly',
  numberOfMonths: valueRanges.numberOfMonths.default,
  recurringCostCollectDate: valueRanges.recurringCostCollectDate.default,
  status: 'outstanding',
  revisionDate: moment().add(6, 'months').format('YYYY-MM-DD'),
  //revisionDate: moment().add(6, 'months').subtract(14, 'd').format('YYYY-MM-DD'),

  validations: {
    contractId: true,
    maturityDate: true,
    riskCategory: true,
    currency: true,
    country: true,
    language: true,
    creditLimitAmount: true,
    withdrawalCostPercentage: true,
    recurringInterestCostPercentage: true,
    directDebitFrequency: true,
    numberOfMonths: true,
    recurringCostCollectDate: true,
    isContractExists: true
  },

  helperTexts: {
    contractId: 'Should start with "SBF"',
    maturityDate: '',
    riskCategory: true,
    currency: true,
    country: true,
    language: true,
    creditLimitAmount: 'Between 5.000 and 100.000',
    withdrawalCostPercentage: 'Between 1,00% and 5,00%',
    recurringInterestCostPercentage: 'Between 0,50% and 5,00%',
    // directDebitFrequency: '',
    numberOfMonths: 'Between 3 and 12',
    recurringCostCollectDate: 'Between 6th and 28th',
  }
};

class AddOrChangeFlexLoans extends Component {

  constructor(props) {
    super(props);

    const loanDetailsInitialData = JSON.parse(JSON.stringify(loanDetails));

    this.state = {
      selectedSme: null,
      smeLoan: null,
      contractId: null,
      ...loanDetailsInitialData,
      countries: [],
      currencies: [],
      languages: [],
      symbol: '€',
      thousandSeparator: '.',
      decimalSeparator: ',',
    };

    this.callFunctionAfterTimeOut = null;

  }

  componentDidMount() {
    this.getInitialData();

  }

  setRevisionDate = () => {
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      this.props.getSimulationDate()
        .then(res => {
          this.setState({ 
            revisionDate: moment(res.systemDate).add(6, 'months').format('YYYY-MM-DD'),
            systemDate : res.systemDate
          });
        }).catch((err) => {

          this.props.displayNotification('Get Simulation Date Error', 'error');
        });
    }
    else {
      this.setState({ 
        revisionDate: moment().add(6, 'months').format('YYYY-MM-DD'),
        systemDate : moment().format('YYYY-MM-DD') 
      });
    }
  }

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
        if (!res || res.length === 0) {
          const { validations } = this.state;

          validations.currency = (Number(this.state.currency) === -1);

          validations.country = (Number(this.state.country) === -1);

          this.setState({ validations });
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
        this.setState({
          symbol: res[0].currencySymbol,
          currency: res[0].currencyCode,
        });
      })
      .catch(err => { console.log('getLocales err ', err); });
  }

  resetState = () => {
    const loanDetailsInitialData = JSON.parse(JSON.stringify(loanDetails));
    this.setState({ ...loanDetailsInitialData });
  }

  getInitialData = async () => {
    const { lmContractSysId, isDashboardContent, lmContractType } = this.props;
    let { contractId, selectedSme, startDate, status } = this.state;
    this.setRevisionDate();
    this.getFieldNameValues();
    //revisionDate = moment(this.props.configurations.simulations.systemDate).add(6, 'months');

    if (this.props.contractId && this.props.smeLoans) contractId = this.props.contractId;

    if (isDashboardContent && lmContractSysId && lmContractType === 'flex-loan') contractId = lmContractSysId;

    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {

      startDate = this.props.configurations.simulations.systemDate;
    } else {

      startDate = moment().format('YYYY-MM-DD');
    }

    const eMandate = this.props.smeMandate.eMandate;

    if (!eMandate) status = 'paused';

    // const selectedSme = await this.getSelectedSme(this.props.customerId);
    if (this.props.customerId) selectedSme = await this.getSelectedSme(this.props.customerId);

    this.setState({ contractId, startDate, selectedSme, status }, () => {
      if (this.props.contractId || (isDashboardContent && lmContractSysId && lmContractType === 'flex-loan')) this.handleOnBlur();
    });
  }

  saveNewSmeLoan = () => {

    if (!this.isAnyValidationError() && this.isAllDataFilled()) {

      const durationInMonths = this.state.numberOfMonths;
      const firstRevisionDate = this.calculateRevisionDate(durationInMonths);

      const smeLoan = {
        contractId: this.state.contractId,
        smeId: this.state.selectedSme.id,
        startDate: this.state.startDate,
        maturityDate: this.state.maturityDate,
        riskCategory: this.state.riskCategory,
        directDebitFrequency: this.state.directDebitFrequency,
        creditLimitAmount: Number(this.state.creditLimitAmount),
        withdrawalCostPercentage: Number(this.state.withdrawalCostPercentage),
        recurringInterestCostPercentage: Number(this.state.recurringInterestCostPercentage),
        numberOfMonths: Number(this.state.numberOfMonths),
        recurringCostCollectDate: Number(this.state.recurringCostCollectDate),
        interestAnnualPercentageRate: Number(this.calculateAnnualPercentageRate()),
        plannedNumberOfDirectDebit: Number(this.calculateNumberOfDirectDebits()),
        type: 'flex-loan',
        status: this.state.status,
        country: this.state.country,
        currency: this.state.currency,
        language: this.state.language,
        revisionDate: firstRevisionDate,
        eMandate: this.props.smeMandate.eMandate,
        mandate: this.props.smeMandate._id
      };

      this.props.addNewSmeFlexLoan(smeLoan, {})
        .then(() => {
          if (this.props.toggleDrawer) {
            setTimeout(() => {
              this.props.toggleDrawer();
            }, 1000);
          } else {
            this.setState({ isNewLoan: false });
          }
        });

    } else {

      if (!this.isAllDataFilled()) {

        const { validations } = this.state;

        validations.riskCategory = !(Number(this.state.riskCategory) === -1);

        validations.currency = !(Number(this.state.currency) === -1);

        validations.country = !(Number(this.state.country) === -1);

        validations.language = !(Number(this.state.language) === -1);

        validations.contractId = !!(this.state.contractId);

        this.setState({ validations });

      }
    }

  }

  updateLoan = () => {

    if (!this.isAnyValidationError() && this.isAllDataFilled() && this.state.smeLoan) {

      const state = JSON.parse(JSON.stringify(this.state));

      const loanData = {};

      const dateValues = ['startDate', 'maturityDate', 'revisionDate'];

      for (const property of dateValues) {
        if ((property in state.smeLoan) && (property in state) && !moment(state.smeLoan[property]).isSame(moment(state[property]))) loanData[property] = state[property];
      }

      const stringValues = ['riskCategory', 'directDebitFrequency', 'status'];

      for (const property of stringValues) {
        if ((property in state.smeLoan) && (property in state) && state.smeLoan[property] !== state[property]) loanData[property] = state[property];
      }

      const numberValues = ['creditLimitAmount', 'withdrawalCostPercentage', 'recurringInterestCostPercentage', 'numberOfMonths', 'recurringCostCollectDate'];

      for (const property of numberValues) {
        if ((property in state.smeLoan) && (property in state) && Number(state.smeLoan[property]) !== Number(state[property])) loanData[property] = Number(state[property]);
      }

      if (Number(state.smeLoan.interestAnnualPercentageRate) !== Number(this.calculateAnnualPercentageRate())) loanData['interestAnnualPercentageRate'] = Number(this.calculateAnnualPercentageRate());

      if (Number(state.smeLoan.plannedNumberOfDirectDebit) !== Number(this.calculateNumberOfDirectDebits())) loanData['plannedNumberOfDirectDebit'] = Number(this.calculateNumberOfDirectDebits());

      if (Object.keys(loanData).length > 0) {

        const loanId = state.smeLoan._id;
        const contractId = state.smeLoan.contractId;

        this.props.updateSmeFlexLoan({ loanData, loanId, contractId })
          .then(() => {
            if (this.props.toggleDrawer) {
              setTimeout(() => {
                this.props.toggleDrawer();
              }, 1000);
            }
          });

      }

    }
  }

  isAnyValidationError = () => {
    const { validations } = this.state;
    let anyValidationError = false;

    for (const property in validations) {
      if (!validations[property]) anyValidationError = true;
    }

    return anyValidationError;
  }

  isAllDataFilled = () => {
    const { selectedSme, contractId, startDate, maturityDate, riskCategory, revisionDate, currency, country, language } = this.state;
    let isAllDataFilled = true;

    if (!selectedSme || !contractId || !startDate || !maturityDate || !revisionDate) isAllDataFilled = false;

    if (Number(riskCategory) === -1 || Number(currency) === -1
      || Number(country) === -1 || Number(language) === -1) isAllDataFilled = false;

    return isAllDataFilled;
  }

  onSearchResult = sme => {
    if (sme) this.setState({ selectedSme: sme }, () => { this.mapExistingLoan(); });
  }

  handleDatePickers = (date, propertyName) => {
    if (propertyName in this.state) this.setState({ [propertyName]: date }, () => {

      if (this.callFunctionAfterTimeOut) clearTimeout(this.callFunctionAfterTimeOut);

      if (propertyName === 'maturityDate') this.callFunctionAfterTimeOut = setTimeout(() => { this.maturityDateValidation(); }, 1000);
      if (propertyName === 'startDate') this.callFunctionAfterTimeOut = setTimeout(() => { this.startDateValidation(); }, 1000);
      //if (propertyName === 'revisionDate') this.callFunctionAfterTimeOut = setTimeout(() => { this.revisionDateValidation(); }, 1000);
      if (propertyName === 'revisionDate') this.setState({ revisionDate: date });
    });
  }

  handleDropDownChanges = (event, name) => {
    if (event.target.value) this.setState({ [name]: event.target.value }, () => {

      const { validations } = this.state;

      let thousandSeparator = '.';
      let decimalSeparator = ',';

      validations.riskCategory = !(Number(this.state.riskCategory) === -1);

      validations.currency = !(Number(this.state.currency) === -1);

      validations.country = !(Number(this.state.country) === -1);

      validations.language = !(Number(this.state.language) === -1);

      if (this.state.country !== 'NL') {
        thousandSeparator = ',';
        decimalSeparator = '.';
      }

      if (this.state.country !== -1 && this.state.currency !== -1) this.getLocales();

      this.setState({ validations, thousandSeparator, decimalSeparator });

    });
  }

  handleOnChanges = (event, name) => {
    if (name in this.state) this.setState({ [name]: event.target.value.toUpperCase().trim() });
  }

  numberFormating = (number, suffix = '', prefix = '', withDecimals = true, thousandSeparator = '', decimalSeparator = '') => {
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

      return `${prefix} ${output}${suffix}`;

    } catch {
      return `${prefix} ${number}${suffix}`;
    }
  }

  numberFormatDutchToEnglish = (value, name) => {
    if (value && value !== '') {
      // eslint-disable-next-line no-useless-escape
      value = value.match(/[(\d)+(\.|\,)+]+/g)[0].toString();
      if (name === 'creditLimitAmount') {
        value = value.replace('.', '');
        value = value.replace(',', '');
        return value;
      }
      // value = value.replace('.', '');
      value = value.replace(',', '.');
    }
    return value;
  }

  handleNumberChanges = (event, name) => {
    let value = event.target.value;

    const limits = valueRanges[name];

    const { validations, isNewLoan } = this.state;

    if (value && value !== '') {

      value = this.numberFormatDutchToEnglish(value, name);
      const IntegerValueProperties = ['recurringCostCollectDate', 'numberOfMonths'];

      value = IntegerValueProperties.includes(name) ? Math.floor(value) : value;

      validations[name] = ((Number(value) >= limits.min) && (Number(value) <= limits.max));

    } else validations[name] = false;

    this.setState({ [name]: value, validations });

    if (name === 'numberOfMonths' && isNewLoan) {
      const calcluatedRevisiondate = this.calculateRevisionDate(value);
      this.setState({ revisionDate: calcluatedRevisiondate });
      //this.setState({ revisionDate: moment(this.props.configurations.simulations.systemDate).add(value, 'months').format('YYYY-MM-DD') });
    }

  }

  startDateValidation = () => {

    if (moment(this.state.startDate).isValid() && moment(this.state.startDate).subtract(1, 'day').isValid()) {

      this.props.getNextWorkingDate(moment(this.state.startDate).subtract(1, 'day').format('YYYY-MM-DD'), 1)
        .then(async (nextWorkingDate) => {
          if (!moment(this.state.startDate).isSame(nextWorkingDate)) {
            this.setState({ startDate: nextWorkingDate });
          }
        });

    }

  }

  // revisionDateValidation = () => {

  //   if (moment(this.state.revisionDate).isValid()) {
  //     const systemDate = moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
  //     this.props.getNextWorkingDate(moment(systemDate).add(6, 'months').format('YYYY-MM-DD'), 180)
  //       .then(async (nextWorkingDate) => {
  //         if (!moment(this.state.revisionDate).isSame(nextWorkingDate)) {
  //           this.setState({ revisionDate: nextWorkingDate });
  //         }
  //       });

  //   }
  // }

  maturityDateValidation = () => {

    const { smeLoan, helperTexts, validations } = this.state;

    if (smeLoan && moment(this.state.maturityDate).isValid()) {

      const systemDate = moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
      const startDate = moment(smeLoan.startDate).format('YYYY-MM-DD');

      if (moment(startDate).diff(systemDate, 'months', true) >= 1) {

        const filters = {
          plannedDate: JSON.stringify({ $lte: moment(this.props.configurations.simulations.systemDate) }),
          status: 'paid',
          contractId: this.state.contractId,
          fields: JSON.stringify({
            newBalanceAmount: 1,
            transactionDate: 1,
            plannedDate: 1,
          }),
          sorting: JSON.stringify({
            plannedDate: -1,
          })
        };

        this.props.getSmeLoanTransactions(filters)
          .then((transactions) => {
            if (transactions[0]) {

              if (!(transactions[0].newBalanceAmount === 0 && moment(transactions[0].transactionDate).diff(systemDate, 'months', true) >= 1)) {
                validations.maturityDate = false;
                helperTexts.maturityDate = 'maturity-date must lay at least 1 month after the new-balance-amount was set to 0';
              } else {
                validations.maturityDate = true;
                helperTexts.maturityDate = '';
              }

              this.setState({ validations, helperTexts });
            }
          });

      }

    }


  }

  mapExistingLoan = async () => {
    const [relationshipValidation] = this.checkLoanAndSmeRelationship();

    const state = this.state;

    const loanDetailsInitialData = JSON.parse(JSON.stringify(loanDetails));

    loanDetailsInitialData.revisionDate = moment(this.props.configurations.simulations.systemDate).add(6, 'months').format("YYYY-MM-DD");

    let updates = { ...state, ...loanDetailsInitialData };

    updates.thousandSeparator = '.';
    updates.decimalSeparator = ',';

    if (state.smeLoan) {
      this.setState({ country: state.smeLoan.country, currency: state.smeLoan.currency }, () => {

        if (this.state.country !== 'NL') {
          updates.thousandSeparator = ',';
          updates.decimalSeparator = '.';
        }
        this.getLocales();
      });
    }

    if (state.smeLoan && state.selectedSme) {
      updates = { ...updates, ...state.smeLoan, isNewLoan: relationshipValidation, };

    } else {

      if (!state.selectedSme) {

        const selectedSme = await this.getSelectedSme(state.smeLoan.smeId);

        if (selectedSme) updates = { ...updates, ...state.smeLoan, isNewLoan: false, selectedSme };

      }

    }

    this.setState(updates);

  }

  getSelectedSme = (smeId) => {
    return this.props.requestSmeByIdPromise(smeId)
      .then((sme) => sme)
      .catch((error) => { throw Error(error); });
  }

  handleOnBlur = () => {
    const { validations, helperTexts } = this.state;

    validations.contractId = (this.state.contractId && this.state.contractId.trim().length > 3) && (this.state.contractId.trim().substring(0, 3) === "SBF");

    if (!validations.contractId && this.state.contractId && this.state.contractId.trim().length < 5) helperTexts.contractId = "Incorrect entry.";

    this.setState({ validations, helperTexts }, () => {
      if (validations.contractId && this.state.contractId.trim().length > 4) {
        const query = {
          fields: {
            startDate: 1,
            maturityDate: 1,
            type: 1,
            smeId: 1,
            riskCategory: 1,
            directDebitFrequency: 1,
            numberOfMonths: 1,
            withdrawalCostPercentage: 1,
            creditLimitAmount: 1,
            recurringCostCollectDate: 1,
            recurringInterestCostPercentage: 1,
            withdrawalCostPercentagePercentage: 1,
            status: 1,
          },
          condition: { contractId: this.state.contractId.trim() },
        };

        return this.props.getSmeLoanByQuery(query.condition, query.fields)
          .then((response) => {
            if (response) this.setState({ smeLoan: response, isNewLoan: true }, () => { this.mapExistingLoan(); });
            else {

              /** validate if contract exists or not */
              this.props.getContract(this.state.contractId, 'FLEX')
                .then(response => {
                  const responseMessage = response;
                  let isContractExists = false;

                  if (responseMessage === 'CONTRACT-NOT-EXISTS') {
                    isContractExists = false;
                  } else if ((responseMessage === 'CONTRACT-EXISTS')) {
                    isContractExists = true;
                  }

                  const loanDetailsInitialData = JSON.parse(JSON.stringify(loanDetails));
                  loanDetailsInitialData.startDate = this.props.configurations.simulations.systemDate;
                  loanDetailsInitialData.revisionDate = moment(this.props.configurations.simulations.systemDate).add(6, 'months').format("YYYY-MM-DD");
                  loanDetailsInitialData.validations.isContractExists = isContractExists;
                  if (!this.props.smeMandate.eMandate) loanDetailsInitialData.status = 'paused';

                  this.setState({ isNewLoan: true, smeLoan: null, ...loanDetailsInitialData, symbol: '€', thousandSeparator: '.', decimalSeparator: ',' });
                });


            }
          })
          .catch(error => console.log(error));
      }
    });
  }

  calculateAnnualPercentageRate = () => {
    /* Algorithom : ( 12 * recurringInterest% ) + withdrawalCostPercentage% */
    const annualPercentageRate = (12 * (Number(this.state.recurringInterestCostPercentage)) + (Number(this.state.withdrawalCostPercentage)));
    // const annualPercentageRate = (12 * (Number(this.state.recurringInterestCostPercentage) / 100) + (Number(this.state.withdrawalCostPercentage) / 100));
    return annualPercentageRate.toFixed(2);
  }

  calculateNumberOfDirectDebits = () => {
    if (numberOfDirectDebits[this.state.numberOfMonths] && numberOfDirectDebits[this.state.numberOfMonths][this.state.directDebitFrequency]) return numberOfDirectDebits[this.state.numberOfMonths][this.state.directDebitFrequency];
    return 0;
  }

  checkLoanAndSmeRelationship = () => {

    let relationshipMessage = "";
    let relationshipValidation = true;

    if (this.state.smeLoan && this.state.selectedSme) {
      relationshipMessage = (this.state.smeLoan.smeId !== this.state.selectedSme.id) ? "*This loan does not belongs to this SME!" : "";
      relationshipValidation = (this.state.smeLoan.smeId === this.state.selectedSme.id);
    }

    return [relationshipValidation, relationshipMessage];
  }

  componentWillUnmount() {
    this.setState({
      selectedSme: null,
      smeLoan: null,
      contractId: null,
      ...loanDetails,
    });
  }

  helperText = (text) => {
    const { decimalSeparator, thousandSeparator } = this.state;
    let value = '';

    if (decimalSeparator === ',') value = text.replace('', '');

    if (thousandSeparator === '.') value = text.replace('', '');

    return value;
  }

  calculateRevisionDate = (durationInMonths) => {

    const currentDate = this.state.systemDate;
    const calculatedDate = moment(currentDate).add(durationInMonths, 'months').format('YYYY-MM-DD');
    return calculatedDate;
  }

  render() {

    const { classes } = this.props;

    const [relationshipValidation, relationshipMessage] = this.checkLoanAndSmeRelationship();

    const anyValidationError = this.isAnyValidationError();
    const anyFieldMissing = this.isAllDataFilled();

    const disableActionButton = anyValidationError || !anyFieldMissing || !relationshipValidation;

    const actionType = (this.state.smeLoan && this.state.selectedSme) ? 'update' : 'create';

    const disableMaturityDate = this.state.isNewLoan;

    let { selectedSme } = this.state;

    const { countries, currencies, languages } = this.state;

    if (!selectedSme) selectedSme = { company: '', };

    return (
      <div>
        <GridContainer>

          {/* Empty line */}
          <GridItem xs={12} sm={12} md={12}></GridItem>

          {/* First section */}
          <GridItem xs={12} sm={12} md={3}>
            {
              this.props.toggleDrawer || actionType === 'update' ?
                <TextField
                  id="smeName"
                  name="smeName"
                  label="Company Name"
                  fullWidth={true}
                  value={selectedSme.company}
                  className={classes.textField}
                  disabled={true}
                  InputLabelProps={{ shrink: true, }}
                />
                :
                <CustomSearch
                  id="sme-search"
                  name="SMESearch"
                  label={this.state.selectedSme?.company || "Search Company"}
                  entity="customers"
                  sugg_field="legalName"
                  onResult={this.onSearchResult.bind(this)}
                  value={this.state.selectedSme?.company || ''}
                />
            }
          </GridItem>

          {
            actionType === 'update' ?
              <GridItem xs={12} sm={12} md={3}  >
                <FormControl fullWidth size="small" variant="outlined" >
                  <InputLabel className={classes.inputLabel} id="country-label">Country</InputLabel>
                  <Select
                    labelId="dd-country-label"
                    value={this.state.country}
                    onChange={(event) => this.handleDropDownChanges(event, 'country')}
                    id="country"
                    variant="outlined"
                    name="country"
                    label="Country"
                    disabled={true}
                    className={classes.inputProp}
                    error={!this.state.validations.country}
                  >
                    <MenuItem className={classes.menuItem} value={-1}>Select</MenuItem>
                    {countries.map((country, index) =>
                      <MenuItem key={index} value={country}>{country}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
              :
              <GridItem xs={12} sm={12} md={3}  >
                <FormControl fullWidth size="small" variant="outlined" >
                  <InputLabel className={classes.inputLabel} id="country-label">Country</InputLabel>
                  <Select
                    labelId="dd-country-label"
                    value={this.state.country}
                    onChange={(event) => this.handleDropDownChanges(event, 'country')}
                    id="country"
                    variant="outlined"
                    name="country"
                    label="Country"
                    disabled={!relationshipValidation}
                    className={classes.inputProp}
                    error={!this.state.validations.country}
                  >
                    <MenuItem className={classes.menuItem} value={-1}>Select</MenuItem>
                    {countries.map((country, index) =>
                      <MenuItem key={index} value={country}>{country}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
          }

          {
            actionType === 'update' ?
              <GridItem xs={12} sm={12} md={3}  >
                <FormControl fullWidth size="small" variant="outlined" >
                  <InputLabel className={classes.inputLabel} id="language-label">Language</InputLabel>
                  <Select
                    labelId="dd-language-label"
                    value={this.state.language}
                    onChange={(event) => this.handleDropDownChanges(event, 'language')}
                    id="language"
                    variant="outlined"
                    name="language"
                    label="Language"
                    disabled={true}
                    className={classes.inputProp}
                    error={!this.state.validations.language}
                  >
                    <MenuItem className={classes.menuItem} value={-1}>Select</MenuItem>
                    {languages.map((language, index) =>
                      <MenuItem key={index} value={language}>{language}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
              :
              <GridItem xs={12} sm={12} md={3}  >
                <FormControl fullWidth size="small" variant="outlined" >
                  <InputLabel className={classes.inputLabel} id="language-label">Language</InputLabel>
                  <Select
                    labelId="dd-language-label"
                    value={this.state.language}
                    onChange={(event) => this.handleDropDownChanges(event, 'language')}
                    id="language"
                    variant="outlined"
                    name="language"
                    label="Language"
                    disabled={!relationshipValidation}
                    className={classes.inputProp}
                    error={!this.state.validations.language}
                  >
                    <MenuItem className={classes.menuItem} value={-1}>Select</MenuItem>
                    {languages.map((language, index) =>
                      <MenuItem key={index} value={language}>{language}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
          }

          <GridItem xs={12} sm={12} md={3}></GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }} >
            <TextField
              id="contractId"
              name="contractId"
              label="Contract ID"
              fullWidth={true}
              value={this.state.contractId ? this.state.contractId.trim() : ''}
              className={classes.textField}
              onChange={(event) => this.handleOnChanges(event, 'contractId')}
              inputProps={{
                onBlur: (e) => {
                  this.handleOnBlur();
                },
              }}
              error={!this.state.validations.contractId}
              helperText={this.state.helperTexts.contractId}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} style={{ margin: '1% 0' }} >
            <TextField
              id="loanType"
              name="loanType"
              label="Loan Type"
              fullWidth={true}
              value={"Flex Loan"}
              className={classes.textField}
              disabled={true}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} style={{ margin: '1% 0' }} >
            <TextField
              id="status"
              name="status"
              label="status"
              fullWidth={true}
              value={this.state.status}
              className={classes.textField}
              disabled={true}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={6} ></GridItem>


          <GridItem xs={12} sm={12} md={12} >
            {!relationshipValidation ? <div style={{ marginTop: '1%', color: 'red', fontWeight: 500 }}>{relationshipMessage}</div> : ''}
          </GridItem>

          <GridItem xs={12} sm={12} md={12} >
            {!this.state.validations.maturityDate ? <div style={{ marginTop: '1%', color: 'red', fontWeight: 500 }}>{this.state.helperTexts.maturityDate}</div> : ''}
          </GridItem>
          <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }} >
            {
              actionType === 'update' ?

                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    id="revision-date"
                    name="revisionDate"
                    autoOk
                    variant="inline"
                    label="Revision Date "
                    format="DD-MM-YYYY"
                    fullWidth={true}
                    value={this.state.revisionDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleDatePickers(date, 'revisionDate')}
                    disabled={true}
                  />
                </MuiPickersUtilsProvider>
                :
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    id="revision-date"
                    name="revisionDate"
                    autoOk
                    variant="inline"
                    label="Revision Date "
                    format="DD-MM-YYYY"
                    fullWidth={true}
                    value={this.state.revisionDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleDatePickers(date, 'revisionDate')}
                    disabled={!relationshipValidation || !this.state.isNewLoan}
                  />
                </MuiPickersUtilsProvider>
            }
          </GridItem>
          {/* Label section */}
          <GridItem xs={12} sm={12} md={12} ><h4><span style={{ fontWeight: 500 }}>Flex Loan Conditions</span></h4></GridItem>

          {/* Conditions section */}
          <GridItem xs={12} sm={12} md={3} >
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                disableToolbar
                id="loan-start-date"
                name="startDate"
                autoOk
                variant="inline"
                label="Contract Start Date "
                format="DD-MM-YYYY"
                fullWidth={true}
                value={this.state.startDate}
                InputAdornmentProps={{ position: "start" }}
                onChange={date => this.handleDatePickers(date, 'startDate')}
                disabled={!relationshipValidation || !this.state.isNewLoan}
              />
            </MuiPickersUtilsProvider>
          </GridItem>

          <GridItem xs={12} sm={12} md={3} >
            <TextField
              id="withdrawalCostPercentage"
              name="withdrawalCostPercentage"
              label="Withdrawal Cost"
              fullWidth={true}
              className={classes.textField}
              InputLabelProps={{ shrink: true, }}
              value={this.numberFormating(this.state.withdrawalCostPercentage, '', '', true, '', this.state.decimalSeparator)}
              // className={classes.textField}
              onChange={(event) => this.handleNumberChanges(event, 'withdrawalCostPercentage')}
              disabled={!relationshipValidation}
              error={!this.state.validations.withdrawalCostPercentage}
              helperText={this.state.helperTexts.withdrawalCostPercentage}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </GridItem>

          <GridItem xs={12} sm={12} md={3} >
            <FormControl className={classes.formControl} fullWidth={true}>
              <InputLabel htmlFor="risk-category">Direct Debit Frequency</InputLabel>
              <Select
                value={this.state.directDebitFrequency}
                onChange={(event) => this.handleDropDownChanges(event, 'directDebitFrequency')}
                id="directDebitFrequency"
                inputProps={{
                  name: 'directDebitFrequency',
                  id: 'directDebitFrequency',
                }}
                className={classes.selectEmpty}
                disabled={!relationshipValidation}
              >
                {
                  Object.keys(valueRanges.directDebitFrequency).map((frequency, index) =>
                    (<MenuItem key={`${index}_${frequency}`} value={frequency}>{valueRanges.directDebitFrequency[frequency]}</MenuItem>))
                }
              </Select>
            </FormControl>
          </GridItem>

          <GridItem xs={null} sm={null} md={3} ></GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <FormControl className={classes.formControl} fullWidth={true}>
              <InputLabel htmlFor="risk-category">Risk Category</InputLabel>
              <Select
                value={this.state.riskCategory}
                onChange={(event) => this.handleDropDownChanges(event, 'riskCategory')}
                id="riskCategory"
                inputProps={{
                  name: 'riskCategory',
                  id: 'riskCategory',
                }}
                className={classes.selectEmpty}
                disabled={!relationshipValidation}
                error={!this.state.validations.riskCategory}
              >
                <MenuItem value={-1}>Select</MenuItem>
                {
                  Object.keys(riskCategory).map((category, index) => (<MenuItem key={`${index}_${category}`} value={category}>{category.toUpperCase()}</MenuItem>))
                }
              </Select>
            </FormControl>
          </GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <TextField
              id="recurringInterestCostPercentage"
              name="recurringInterestCostPercentage"
              label="Recurring Interest Per Month"
              fullWidth={true}
              className={classes.textField}
              InputLabelProps={{ shrink: true, }}
              value={this.numberFormating(this.state.recurringInterestCostPercentage, '', '', true, '', this.state.decimalSeparator)}
              // className={classes.textField}
              onChange={(event) => this.handleNumberChanges(event, 'recurringInterestCostPercentage')}
              disabled={!relationshipValidation}
              error={!this.state.validations.recurringInterestCostPercentage}
              helperText={this.state.helperTexts.recurringInterestCostPercentage}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <TextField
              id="numberOfMonths"
              name="numberOfMonths"
              label="Duration in Months"
              type="number"
              fullWidth={true}
              value={this.state.numberOfMonths}
              className={classes.textField}
              inputProps={{ min: valueRanges.numberOfMonths.min, max: valueRanges.numberOfMonths.max }}
              InputLabelProps={{ shrink: true, }}
              onChange={(event) => this.handleNumberChanges(event, 'numberOfMonths')}
              disabled={!relationshipValidation}
              error={!this.state.validations.numberOfMonths}
              helperText={this.state.helperTexts.numberOfMonths}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} style={{ margin: '1% 0' }} ></GridItem>

          {
            actionType === 'update' ?
              <GridItem xs={12} sm={12} md={3}></GridItem>
              :
              <GridItem xs={12} sm={12} md={3} >
                <FormControl fullWidth size="small" variant="outlined" >
                  <InputLabel className={classes.inputLabel} id="currency-label">Currency</InputLabel>
                  <Select
                    labelId="currency-label"
                    value={this.state.currency}
                    onChange={(event) => this.handleDropDownChanges(event, 'currency')}
                    id="currency"
                    variant="outlined"
                    name="currency"
                    label="Currency"
                    disabled={true}
                    className={classes.inputProp}
                    error={!this.state.validations.currency}
                  >
                    <MenuItem className={classes.menuItem} value={-1}>Select</MenuItem>
                    {currencies.map((currency, index) =>
                      <MenuItem key={index} value={currency}>{currency}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
          }

          <GridItem xs={12} sm={12} md={3} >
            <TextField
              id="annualPercentageRate"
              name="annualPercentageRate"
              label="Annual Percentage Rate"
              fullWidth={true}
              className={classes.textField}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              value={this.numberFormating(this.calculateAnnualPercentageRate(), '', '', true, '', this.state.decimalSeparator)}
              // className={classes.textField}
              disabled={true}
            />
          </GridItem>

          <GridItem xs={12} sm={12} md={3} >
            <TextField
              id="numberOfDirectDebits"
              name="numberOfDirectDebits"
              label="Number Of Direct Debits"
              fullWidth={true}
              value={this.calculateNumberOfDirectDebits()}
              className={classes.textField}
              disabled={true}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} ></GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <TextField
              id="creditLimitAmount"
              name="creditLimitAmount"
              label="Credit Limit"
              fullWidth={true}
              value={this.numberFormating(this.state.creditLimitAmount, '', this.state.symbol, false, this.state.thousandSeparator)}
              // className={classes.textField}
              onChange={(event) => this.handleNumberChanges(event, 'creditLimitAmount')}
              disabled={!relationshipValidation || actionType !== 'create'}
              error={!this.state.validations.creditLimitAmount}
              helperText={this.state.helperTexts.creditLimitAmount}
            />
          </GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <TextField
              id="recurringCostCollectDate"
              name="recurringCostCollectDate"
              label="Recurring Cost Collect Day"
              type="number"
              fullWidth={true}
              value={this.state.recurringCostCollectDate}
              className={classes.textField}
              inputProps={{ min: valueRanges.recurringCostCollectDate.min, max: valueRanges.recurringCostCollectDate.max }}
              InputLabelProps={{ shrink: true, }}
              onChange={(event) => this.handleNumberChanges(event, 'recurringCostCollectDate')}
              disabled={!relationshipValidation}
              error={!this.state.validations.recurringCostCollectDate}
              helperText={this.state.helperTexts.recurringCostCollectDate}
            />
          </GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1.25% 0 1% 0' }} >
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                disableToolbar
                id="loan-end-date"
                name="maturityDate"
                autoOk
                variant="inline"
                label="Maturity Date "
                format="DD-MM-YYYY"
                maxDate="9999-12-31"
                fullWidth={true}
                value={this.state.maturityDate}
                InputAdornmentProps={{ position: "start" }}
                onChange={date => this.handleDatePickers(date, 'maturityDate')}
                disabled={!relationshipValidation || disableMaturityDate}
                error={!this.state.validations.maturityDate}
              />
            </MuiPickersUtilsProvider>
          </GridItem>

          <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem>

          {/* Empty line */}
          <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem>

          <GridItem xs={12} sm={12} md={8}> </GridItem>
          <GridItem xs={12} sm={12} md={2}>
            {
              this.props.toggleDrawer ?
                <Button className={classes.customRemoveButton_Blue_large} onClick={this.props.toggleDrawer}>Close</Button>
                : null
            }
          </GridItem>
          <GridItem xs={12} sm={12} md={2}>
            {
              actionType === 'create' ?
                <Button className={!this.props.toggleDrawer ? classes.customActionButton_Blue : classes.customActionButton_Blue_large} disabled={anyValidationError} onClick={this.saveNewSmeLoan} startIcon={<AddCircle />} variant="contained">Add</Button> :
                // <Button className={!this.props.toggleDrawer ? classes.customActionButton_Blue : classes.customActionButton_Blue_large} disabled={disableActionButton} onClick={this.saveNewSmeLoan}><AddCircle />Add</Button> :
                <Button className={!this.props.toggleDrawer ? classes.customActionButton_Blue : classes.customActionButton_Blue_large} disabled={disableActionButton} onClick={this.updateLoan} startIcon={<Publish />} variant="contained">Update</Button>
            }
          </GridItem>

        </GridContainer>
      </div>
    );
  }
}


AddOrChangeFlexLoans.propTypes = {
  classes: PropTypes.object,
  configurations: PropTypes.object.isRequired,
  contractId: PropTypes.string,
  customerId: PropTypes.string,
  requestSmeLoan: PropTypes.func.isRequired,
  getSmeLoanByQuery: PropTypes.func.isRequired,
  addNewSmeFlexLoan: PropTypes.func.isRequired,
  updateSmeFlexLoan: PropTypes.func.isRequired,
  toggleDrawer: PropTypes.func,
  requestSmeByIdPromise: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  getSmeLoanTransactions: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  smeLoans: PropTypes.array.isRequired,
  getContract: PropTypes.func.isRequired,
  getSimulationDate: PropTypes.func,
  lmContractType: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  lmContractSysId: PropTypes.string,
};

const mapStateToProps = (state) => ({
  configurations: state.configurations,
  smeLoans: state.lmglobal.smeLoans,
  smeMandate: state.mandates.selectedMandateFullObject,
  lmContractType: state.lmglobal.selectedLoan.type,
  isDashboardContent: state.user.isDashboardContent,
  lmContractSysId: state.lmglobal.selectedLoan.contractId,
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
    getSmeLoanByQuery: bindActions(dispatch, getSmeLoanByQuery),
    addNewSmeFlexLoan: bindActions(dispatch, addNewSmeFlexLoan),
    updateSmeFlexLoan: bindActions(dispatch, updateSmeFlexLoan),
    requestSmeByIdPromise: bindActions(dispatch, requestCustomerByVTigerIdPromise),
    getSmeLoanTransactions: bindActions(dispatch, getSmeLoanTransactions),
    getNextWorkingDate: (expiryDate, noOfDaysAhead) => (dispatch(getNextWorkingDate(expiryDate, noOfDaysAhead))),
    getSimulationDate: () => (dispatch(getSimulationDate())),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    getContract: (contractId, type) => (dispatch(getContract(contractId, type))),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(AddOrChangeFlexLoans));