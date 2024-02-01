/* cSpell:ignore smes */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";

import GridContainer from 'components/initiation/Grid/GridContainer.jsx';
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import Button from 'components/initiation/CustomButtons/Button';

import { getSimulationDate } from 'store/initiation/actions/Configuration.action';
import { processLoanRequest, importLoanRequest } from 'store/initiation/actions/loanRequest.action';
import { displayNotification } from 'store/initiation/actions/Notifier';

import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import MomentUtils from "@date-io/moment";

import { riskCategory } from "constants/initiation/sme-loan";

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, CircularProgress } from '@material-ui/core';

import customStyles from 'assets/jss/material-dashboard-react/customStyles';

import { getNextWorkingDate } from 'store/initiation/actions/Holidays';

const valueRanges = {
  creditLimitAmount: { min: 5000, max: 100000, default: 0 },
  withdrawalCostPercentage: { min: 1.00, max: 5.00, default: '' },
  recurringInterestCostPercentage: { min: 0.50, max: 5.00, default: '' },
  directDebitFrequency: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  numberOfMonths: { min: 3, max: 12, default: 6 },
  recurringCostCollectDate: { min: 6, max: 28, default: 6 },
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

const TASK_DEFINITION_KEY = 'view-sme-loan-request-form';

const APPROVE_CONTRACT = 'ING0102-get-user-response-before-approve';

const loanDetails = {
  startDate: null,
  isNewLoan: true,
  maturityDate: '9999-12-31',
  riskCategory: -1,
  creditLimitAmount: valueRanges.creditLimitAmount.default,
  withdrawalCostPercentage: valueRanges.withdrawalCostPercentage.default,
  recurringInterestCostPercentage: valueRanges.recurringInterestCostPercentage.default,
  directDebitFrequency: 'weekly',
  numberOfMonths: valueRanges.numberOfMonths.default,
  recurringCostCollectDate: valueRanges.recurringCostCollectDate.default,
  status: 'outstanding',
  iban: '',

  validations: {
    contractId: true,
    maturityDate: true,
    riskCategory: true,
    creditLimitAmount: true,
    withdrawalCostPercentage: true,
    recurringInterestCostPercentage: true,
    directDebitFrequency: true,
    numberOfMonths: true,
    recurringCostCollectDate: true,
  },

  helperTexts: {
    contractId: 'Should start with "SBF"',
    maturityDate: '',
    riskCategory: true,
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
      selectedSme: {},
      contractId: null,
      loanType: '',
      isError: false,
      isLoadingFlexLoanRequest: false,
      ...loanDetailsInitialData,
    };

    this.callFunctionAfterTimeOut = null;

  }

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = async () => {
    let { contractId, selectedSme, loanType } = this.state;

    const errors = this.props.selectedLoanRequest.variables.errorLog.value;

        if (errors && errors.length > 0) {
          this.setState({ isError: true });
        }

    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      await this.props.getSimulationDate()
          .then((result) => {
            this.setState({ startDate: result.systemDate });
          });
    } else {
      this.setState({ startDate: moment().format('DD-MM-YYYY')});
    }

    if (this.props.selectedLoanRequest.variables.smeLoanRequest && this.props.selectedLoanRequest.variables.smeLoanRequestProposal) {

      const smeLoanRequest = this.props.selectedLoanRequest.variables.smeLoanRequest.value;

      const smeLoanRequestProposal = this.props.selectedLoanRequest.variables.smeLoanRequestProposal.value;

      this.setState({
        withdrawalCostPercentage: smeLoanRequestProposal.withdrawalCostPercentage,
        directDebitFrequency: smeLoanRequestProposal.directDebitFrequency,
        riskCategory: smeLoanRequest.riskCategory,
        recurringInterestCostPercentage: smeLoanRequestProposal.recurringInterestPercentage ? smeLoanRequestProposal.recurringInterestPercentage : 0,
        numberOfMonths: smeLoanRequestProposal.plannedNumberOfDirectDebitMonth,
        creditLimitAmount: smeLoanRequestProposal.creditLimitAmount,
        recurringCostCollectDate: smeLoanRequestProposal.recurringCostCollectionDay,
        maturityDate: smeLoanRequestProposal.maturityDate,
        iban: smeLoanRequest.iban ? smeLoanRequest.iban : this.props.selectedLoanRequest.variables.opportunity.value.cf_potentials_ibannumber
      });
    } else {
      this.setState({
        riskCategory: this.props.selectedLoanRequest.variables.opportunity.value.riskCategory,
        iban: this.props.selectedLoanRequest.variables.opportunity.value.cf_potentials_ibannumber,
        numberOfMonths: this.props.selectedLoanRequest.variables.opportunity.value.cf_potentials_creditlineduration,
        directDebitFrequency: this.props.selectedLoanRequest.variables.opportunity.value.frequency,
        creditLimitAmount: this.props.selectedLoanRequest.variables.opportunity.value.cf_potentials_creditlinequotationamount_currency_value,
        recurringInterestCostPercentage: this.props.selectedLoanRequest.variables.opportunity.value.recuringInterest ? this.props.selectedLoanRequest.variables.opportunity.value.recuringInterest : 0,  //recuringInterest: Math.round(100 * (1 + Number(loan.cf_potentials_interestincrement))) / 100,
        withdrawalCostPercentage: this.props.selectedLoanRequest.variables.opportunity.value.cf_potentials_creditlinewithdrawalfee,
      });
    }

    if (this.props.selectedLoanRequest.variables.contractId.value) contractId = this.props.selectedLoanRequest.variables.contractId.value;
    if (this.props.selectedLoanRequest.variables.updateCustomer.value) selectedSme = this.props.selectedLoanRequest.variables.updateCustomer.value;
    if (this.props.selectedLoanRequest.variables.loanType.value) loanType = this.props.selectedLoanRequest.variables.loanType.value;
    if (this.props.selectedLoanRequest.variables.updatePerson.value) selectedSme.personId = this.props.selectedLoanRequest.variables.updatePerson.value;

    this.setState({ contractId, selectedSme, loanType });
  }

  addFlexLoanRequest = () => {
    
    if (!this.isAnyValidationError() && this.isAllDataFilled()) {

      const smeLoanRequestObj = {
        action: 'update',
        contractId: this.state.contractId,
        contractIdExtension: 0,
        customerId: this.state.selectedSme.id,
        requestType: 'new',
        platform: 'BridgeFund BV',
        loanType: this.state.loanType,
        commercialLabel: 'BridgeFund BV',
        status: 'proposal-approved-by-customer',
        riskCategory: this.state.riskCategory,
        riskCategoryIindicator: 'green',
        primaryCustomerSuccessManager: this.state.selectedSme.primaryCustomerSuccessManager,
        primaryStakeholderWithinSme: this.state.selectedSme.personId.id,
        iban: this.state.iban
      };

      const smeLoanRequestProposalObj = {
        action: 'create',
        sequenceNumber: 1,
        requestType: 'new',
        loanType: this.state.loanType,
        status: 'approved-by-customer',
        recurringCostAmountPerMonth: '0',
        creditLimitAmount: this.state.creditLimitAmount,
        withdrawalCostPercentage: this.state.withdrawalCostPercentage,
        recurringInterestPercentage: this.state.recurringInterestCostPercentage,
        recurringCostCollectionDay: this.state.recurringCostCollectDate,
        plannedNumberOfDirectDebitMonth: this.state.numberOfMonths,
        directDebitFrequency: this.state.directDebitFrequency,
        plannedNumberOfDirectDebits: Number(this.calculateNumberOfDirectDebits()),
        maturityDate: this.state.maturityDate,
        interestAnnualPercentageRate: Number(this.calculateAnnualPercentageRate())
      };

      const smeFlexLoanCreateRequestObj = {
        id: this.props.selectedLoanRequest.id,
        variables: {
          smeLoanRequest: {
            type: "Json",
            value: JSON.stringify(smeLoanRequestObj)
          },
          smeLoanRequestProposal: {
            type: "Json",
            value: JSON.stringify(smeLoanRequestProposalObj)
          }
        },
        withVariablesInReturn: false
      };

      this.setState({ isLoadingFlexLoanRequest: true});

      this.props.processLoanRequest(smeFlexLoanCreateRequestObj)
      .then((response) => {
        if (response === 'ok') {
          this.props.displayNotification('Sent loan Request successfully', 'success');
          this.props.importLoanRequest(TASK_DEFINITION_KEY)
            .then(() => {
              this.checkIfContractCreated();
            });
        }

      });

    } else {
      if (!this.isAllDataFilled()) {

        const { validations } = this.state;

        validations.riskCategory = !(Number(this.state.riskCategory) === -1);
        
        validations.contractId = !!(this.state.contractId);

        validations.creditLimitAmount = !!(this.state.creditLimitAmount);

        validations.withdrawalCostPercentage = !!(this.state.withdrawalCostPercentage);

        // validations.recurringInterestCostPercentage = !!(this.state.recurringInterestCostPercentage);

        this.setState({ validations });

      }
    }

  }

  checkIfContractCreated = () => {

    let callCount = 0;

    const intervalIdentifier = setInterval(() => {
      this.props.importLoanRequest(TASK_DEFINITION_KEY, this.state.contractId)
        .then(result => {
          if (result && result.length === 0) {
            this.props.importLoanRequest(APPROVE_CONTRACT, this.state.contractId)
              .then(result => {
                if (result && result.length > 0) {
                  clearInterval(intervalIdentifier);
                  this.setContractOverviewUrl(this.state.contractId);
                  this.setState({ isLoadingFlexLoanRequest: false});
                  this.props.onClose();
                }
              });
            }
            if (++ callCount === 10) {
              clearInterval(intervalIdentifier);
              this.setState({ isLoadingFlexLoanRequest: false});
              this.props.onClose();
         }     
        })
        .catch(() => {
        clearInterval(intervalIdentifier);
        this.setState({ isLoadingFlexLoanRequest: false});
        this.props.onClose();});
    }, 1000);
  };

  setContractOverviewUrl = (id) => {

    const URL = `${document.location.origin}/user/contract-overview?ContractId=${id}`;
      window.location.replace(URL);
  };

  isAnyValidationError = () => {
    const { validations } = this.state;
    let anyValidationError = false;

    for (const property in validations) {
      if (!validations[property]) anyValidationError = true;
    }

    return anyValidationError;
  }

  isAllDataFilled = () => {
    const { selectedSme, contractId, startDate, maturityDate, riskCategory, withdrawalCostPercentage, creditLimitAmount } = this.state;
    let isAllDataFilled = true;

    if (!selectedSme || !contractId || !startDate || !maturityDate || !withdrawalCostPercentage || !creditLimitAmount) isAllDataFilled = false;

    if (Number(riskCategory) === -1) isAllDataFilled = false;

    return isAllDataFilled;
  }

  handleDatePickers = (date, propertyName) => {
    if (propertyName in this.state) this.setState({ [propertyName]: date }, () => {

      if (this.callFunctionAfterTimeOut) clearTimeout(this.callFunctionAfterTimeOut);

      // if (propertyName === 'maturityDate') this.callFunctionAfterTimeOut = setTimeout(() => { this.maturityDateValidation(); }, 1000);
      if (propertyName === 'startDate') this.callFunctionAfterTimeOut = setTimeout(() => { this.startDateValidation(); }, 1000);
    });
  }

  handleDropDownChanges = (event, name) => {
    if (event.target.value) this.setState({ [name]: event.target.value }, () => {

      const { validations } = this.state;

      validations.riskCategory = !(Number(this.state.riskCategory) === -1);

      this.setState({ validations });

    });
  }

  handleOnChanges = (event, name) => {
    if (name in this.state) this.setState({ [name]: event.target.value.toUpperCase() });
  }
  numberFormating = (number, suffix = '', prefix = '', withDecimals = true) => {
    try {
      if (!number || number === '') return '';

      const value = number.toString();

      let output = value;

      const [integerValue, floatValues] = value.match(/\./g) ? value.split(/\./g) : [value, ''];

      if (integerValue && integerValue.length > 3) {
        let placeholder = Array.from(integerValue).reverse().join('');
        placeholder = placeholder.match(/.{1,3}/g).join('.');
        placeholder = Array.from(placeholder).reverse().join('');

        output = placeholder;

      } else {
        output = integerValue;
      }

      if (withDecimals && value.match(/\./g)) output = `${output},${floatValues}`;

      return `${prefix}${output}${suffix}`;

    } catch {
      return `${prefix}${number}${suffix}`;
    }
  }

  numberFormatDutchToEnglish = (value) => {
    if (value && value !== '') {
      // eslint-disable-next-line no-useless-escape
      value = value.match(/[(\d)+(\.|\,)+]+/g)[0].toString();
      value = value.replace('.', '');
      value = value.replace(',', '.');
    }

    return value;
  }

  handleNumberChanges = (event, name) => {
    let value = event.target.value;

    const limits = valueRanges[name];

    const { validations } = this.state;

    if (value && value !== '') {

      value = this.numberFormatDutchToEnglish(value);
      const IntegerValueProperties = ['recurringCostCollectDate', 'numberOfMonths'];

      value = IntegerValueProperties.includes(name) ? Math.floor(value) : value;

      validations[name] = ((Number(value) >= limits.min) && (Number(value) <= limits.max));

    } else validations[name] = false;

    this.setState({ [name]: value, validations });
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

  render() {

    const { classes } = this.props;

    let { selectedSme } = this.state;

    if (!selectedSme) selectedSme = { company: '', };

    const errors = this.props.selectedLoanRequest.variables.errorLog.value;

    const items = (!errors || (Array.isArray(errors) && errors.length === 0)) ? '' : errors.map((item) =>
      <li key={item.id}>{item}</li>
    );

    return (
      <div>
        {
          this.state.isError ?
          <GridItem className={classes.block}>
          {this.state.isError ? <p style={{ color: "red" }}>{items}</p> : false}
        </GridItem> : null
        }
        <GridContainer>
          {/* Empty line */}
          <GridItem xs={12} sm={12} md={12}></GridItem>

          {/* First section */}
          <GridItem xs={12} sm={12} md={3}>
            {
                <TextField
                  id="smeName"
                  name="smeName"
                  label="Company Name"
                  fullWidth={true}
                  value={selectedSme.legalName}
                  className={classes.textField}
                  disabled={true}
                  InputLabelProps={{ shrink: true, }}
                />
            }
          </GridItem>

          <GridItem xs={12} sm={12} md={9}></GridItem>

          <GridItem xs={12} sm={12} md={3} style={{ margin: '1% 0' }} >
            <TextField
              id="contractId"
              name="contractId"
              label="Contract ID"
              fullWidth={true}
              value={this.state.contractId ? this.state.contractId : ''}
              className={classes.textField}
              onChange={(event) => this.handleOnChanges(event, 'contractId')}
              disabled={true}
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
              id="iban"
              name="iban"
              label="Iban Number"
              fullWidth={true}
              onChange={(event) => this.handleOnChanges(event, 'iban')}
              value={this.state.iban ? this.state.iban : ''}
              className={classes.textField}
              // disabled={true}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} ></GridItem>

          {/* <GridItem xs={12} sm={12} md={12} >
            {!relationshipValidation ? <div style={{ marginTop: '1%', color: 'red', fontWeight: 500 }}>{relationshipMessage}</div> : ''}
          </GridItem>

          <GridItem xs={12} sm={12} md={12} >
            {!this.state.validations.maturityDate ? <div style={{ marginTop: '1%', color: 'red', fontWeight: 500 }}>{this.state.helperTexts.maturityDate}</div> : ''}
          </GridItem> */}

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
              />
            </MuiPickersUtilsProvider>
          </GridItem>

          <GridItem xs={12} sm={12} md={3} >
            <TextField
              id="withdrawalCostPercentage"
              name="withdrawalCostPercentage"
              label="Withdrawal Cost"
              fullWidth={true}
              value={this.numberFormating(this.state.withdrawalCostPercentage)}
              className={classes.textField}
              InputLabelProps={{ shrink: true, }}
              onChange={(event) => this.handleNumberChanges(event, 'withdrawalCostPercentage')}
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
              value={this.state.recurringInterestCostPercentage}
              className={classes.textField}
              // InputLabelProps={{ shrink: true, }}
              // onChange={(event) => this.handleNumberChanges(event, 'recurringInterestCostPercentage')}
              error={!this.state.validations.recurringInterestCostPercentage}
              // helperText={this.state.helperTexts.recurringInterestCostPercentage}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              disabled={true}
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
              error={!this.state.validations.numberOfMonths}
              helperText={this.state.helperTexts.numberOfMonths}
            />
          </GridItem>

          <GridItem xs={null} sm={null} md={3} style={{ margin: '1% 0' }} ></GridItem>

          <GridItem xs={null} sm={null} md={3} style={{ margin: '1% 0' }} ></GridItem>

          <GridItem xs={12} sm={12} md={3} >
            <TextField
              id="annualPercentageRate"
              name="annualPercentageRate"
              label="Annual Percentage Rate"
              fullWidth={true}
              value={this.numberFormating(this.calculateAnnualPercentageRate())}
              className={classes.textField}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
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
              value={this.numberFormating(this.state.creditLimitAmount, '', '', false)}
              className={classes.textField}
              InputLabelProps={{ shrink: true, }}
              onChange={(event) => this.handleNumberChanges(event, 'creditLimitAmount')}
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
                error={!this.state.validations.maturityDate}
              />
            </MuiPickersUtilsProvider>
          </GridItem>

          <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem>

          {/* Empty line */}
          {/* <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem> */}

           <GridItem xs={12} sm={12} md={8}> </GridItem>
           <GridItem xs={12} sm={12} md={2}></GridItem> 
          <div style={{ float: 'right' }}>
            {this.state.isLoadingFlexLoanRequest && <CircularProgress size={22}/>}
            <Button color="danger" size="sm" onClick={this.props.onClose} disabled={this.state.isLoadingFlexLoanRequest}>Cancel</Button>
            <Button color="info" size="sm" onClick={this.addFlexLoanRequest} disabled={this.state.isLoadingFlexLoanRequest}>Process</Button>
          </div>

        </GridContainer>
      </div>
    );
  }
}


AddOrChangeFlexLoans.propTypes = {
  classes: PropTypes.object,
  configurations: PropTypes.object,
  contractId: PropTypes.string,
  customerId: PropTypes.string,
  getNextWorkingDate: PropTypes.func.isRequired,
  simulations: PropTypes.object.isRequired,
  selectedLoanRequest: PropTypes.object,
  getSimulationDate: PropTypes.func.isRequired,
  processLoanRequest: PropTypes.func,
  displayNotification: PropTypes.func,
  importLoanRequest: PropTypes.func,
  onClose: PropTypes.func,
};

const mapStateToProps = (state) => ({
  configurations: state.configurations,
  simulations: state.config.simulations,
});


const mapDispatchToProps = dispatch => {
  return {
    getSimulationDate: () => { return dispatch(getSimulationDate()); },
    getNextWorkingDate: (expiryDate, noOfDaysAhead) => (dispatch(getNextWorkingDate(expiryDate, noOfDaysAhead))),
    processLoanRequest: (requestObj) => dispatch(processLoanRequest(requestObj)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    importLoanRequest: (key, contractId) => dispatch(importLoanRequest(key, contractId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(AddOrChangeFlexLoans));