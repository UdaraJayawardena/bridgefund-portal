// @ts-nocheck
import moment from 'moment';
import clx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { cloneDeep } from 'lodash';

import withStyles from '@material-ui/core/styles/withStyles';
import Styles from 'assets/jss/material-dashboard-react/views/SmeLoanTransactionEditorStyles';

import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@material-ui/core';

import GridItem from 'components/loanmanagement/Grid/GridItem';
import Loader from 'components/loanmanagement/CustomLoader/Loader';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import CustomInput from 'components/loanmanagement/CustomInput/CustomInput';
import CustomDatePicker from 'components/loanmanagement/CustomDatePicker/CustomDatePicker';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';

import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { createOrUpdateSmeLoanTransaction } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { getFieldNameValues} from "store/initiation/actions/Configuration.action";
import util from 'lib/loanmanagement/utility';
import { DDtype, DDstatus } from 'constants/loanmanagement/sme-loan-repayment-direct-debits';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

// const EURO = util.currencyConverter();
const TOFIXED = util.toFixed;

const initialSmeLoanTransaction = {
  /* keys used in this page */
  id: '',
  mandateId: '',
  ourReference: '',
  termNumber: '',
  type: '',
  status: '',
  description: '',
  amount: 0,
  principleAmountPart: 0,
  initialCostAmountPart: 0,
  interestAmountPart: 0,
  recurringCostAmountPart: 0,
  plannedDate: null,
  transactionDate: null,
  /* rest of the keys in the transaction object */
  _id: '',
  loanId: '',
  contractId: '',
  smeLoanType: '',
  mandate: '',
  country: '',
  currency: '',
  // statusHistory: '',
  directDebitCounter: 0,
  externalReferenceId: '',
  e2eId: '',
  batchId: [],
  newBalanceAmount: 0,
  glIndicator: 'N',


};

class SmeLoanTransactionPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      contractId: '',
      smeLoanTransaction: cloneDeep(initialSmeLoanTransaction),
      minOpenTrPlannedDate: moment().add(2, 'd').format('YYYY-MM-DD'),
      selectedManadate: {},
      sumOf: {
        principalAmountPart: 0,
        initialCostAmountPart: 0,
        interestAmountPart: 0,
        recurringCostAmountPart: 0,
      },
      countries: [],
      currencies: [],
      newBatchId:''
    };
  }

  componentDidMount() {

    const { smeLoanTransaction, usage } = this.props;
    const initialSmeLoanTransactionCopy = cloneDeep(initialSmeLoanTransaction);
    const _state = {};
    _state.sumOf = this.getSumOfAmounts();
    if (smeLoanTransaction._id) {
      Object.assign(initialSmeLoanTransactionCopy, smeLoanTransaction);
      _state.smeLoanTransaction = initialSmeLoanTransactionCopy;
      _state.selectedManadate = this.getSelectedMandate(smeLoanTransaction.mandateId);
    }
    else if (usage === 'view' || usage === 'update') {
      return this.props.displayNotification('Sme Loan Transaction not found to View or Update', 'warning');
    }

    this.props.getNextWorkingDate(moment().format('YYYY-MM-DD'), 2)
      .then((response) => {
        _state.minOpenTrPlannedDate = response;
      })
      .finally(() => {
        this.setState(_state);
      });
    this.getFieldNameValues();

  }


  getFieldNameValues = () => {

    const requestObjs = [{
      fieldName: 'country'
    }, {
      fieldName: 'currency'
    }];

    for (let i = 0; i < requestObjs.length; i++) {
      this.props.getFieldNameValues(requestObjs[i])
        .then((response) => {
          if (Array.isArray(response)) {
            if (response.length > 0) {
              const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
                .map(fieldNameValue => fieldNameValue.fieldNameValue);
              if (requestObjs[i].fieldName == 'country') this.setState({ countries: fieldNameValues });
              if (requestObjs[i].fieldName == 'currency') this.setState({ currencies: fieldNameValues });

            }
          }

        });
    }
  }


  handleChange = (name, value) => {
    const smeLoanTransaction = this.state.smeLoanTransaction;
    const _state = {};

    if (name === 'plannedDate') smeLoanTransaction.transactionDate = value;
    else if (name === 'mandateId') {
      _state.selectedManadate = this.getSelectedMandate(value);
    }
    else if (
      (name === 'amount' || name === 'principleAmountPart' || name === 'initialCostAmountPart' || name === 'interestAmountPart' || name === 'recurringCostAmountPart') &&
      util.isNullOrEmpty(value) === false
    ) {
      value = TOFIXED(value);
    }
    else if (name === 'termNumber') {
      value = Number(value);
    }

    smeLoanTransaction[name] = value;
    _state.smeLoanTransaction = smeLoanTransaction;

    this.setState(_state);
  };

  getSelectedMandate = (id) => this.props.smeMandates.find(m => m.mandateId === id);

  getSumOfAmounts = () => {
    const { smeLoanTransactions, smeLoanTransaction } = this.props;

    let principalAmountPart = 0;
    let initialCostAmountPart = 0;
    let interestAmountPart = 0;
    let recurringCostAmountPart = 0;
    for (const tr of smeLoanTransactions) {
      if (smeLoanTransaction && smeLoanTransaction.id && tr.id === smeLoanTransaction.id) continue;

      principalAmountPart += TOFIXED(tr.principleAmountPart);
      initialCostAmountPart += TOFIXED(tr.initialCostAmountPart);
      interestAmountPart += TOFIXED(tr.interestAmountPart);
      recurringCostAmountPart += TOFIXED(tr.recurringCostAmountPart);
    }

    return {
      principalAmountPart: TOFIXED(principalAmountPart),
      initialCostAmountPart: TOFIXED(initialCostAmountPart),
      interestAmountPart: TOFIXED(interestAmountPart),
      recurringCostAmountPart: TOFIXED(recurringCostAmountPart),
    };
  }

  validateTransaction = () => {

    // const { smeLoan } = this.props;
    const { smeLoanTransaction, minOpenTrPlannedDate } = this.state;
    // const currentSumOfPrincipalAmountPart = TOFIXED(sumOf.principalAmountPart + Number(smeLoanTransaction.principleAmountPart));
    // const currentSumOfInitialCostAmountPart = TOFIXED(sumOf.initialCostAmountPart + Number(smeLoanTransaction.initialCostAmountPart));
    // const currentSumOfInterestAmountPart = TOFIXED(sumOf.interestAmountPart + Number(smeLoanTransaction.interestAmountPart));
    // const currentSumOfRecurringCostAmountPart = TOFIXED(sumOf.recurringCostAmountPart + Number(smeLoanTransaction.recurringCostAmountPart));
    let warning = '';

    if (util.isNullOrEmpty(smeLoanTransaction.plannedDate)) warning = 'Please fill the planned date!';
    else if (
      smeLoanTransaction.status === DDstatus.OPEN &&
      moment(smeLoanTransaction.plannedDate).isBefore(moment(minOpenTrPlannedDate)) &&
      (smeLoanTransaction.type === DDtype.NORMAL || smeLoanTransaction.type === DDtype.SPECIAL)
    ) {
      warning = 'The planned date must be 2 working days from today!';
    }

    else if (util.isNullOrEmpty(smeLoanTransaction.description)) warning = 'Please fill the description!';
    else if (util.isNullOrEmpty(smeLoanTransaction.type)) warning = 'Please fill the type!';
    else if (util.isNullOrEmpty(smeLoanTransaction.amount) || smeLoanTransaction.amount === 0) warning = 'Please fill the amount!';
    else if (
      smeLoanTransaction.amount > 0 &&
      (smeLoanTransaction.type === DDtype.PAY_OUT || smeLoanTransaction.type === DDtype.INITIAL_FEE || smeLoanTransaction.type === DDtype.INTEREST_FEE || smeLoanTransaction.type === DDtype.RECURRING_FEE || smeLoanTransaction.type === DDtype.OTHER_COST_FEE || smeLoanTransaction.type === DDtype.CLAIM || smeLoanTransaction.type === DDtype.REFINANCE_PAYMENT || smeLoanTransaction.type === DDtype.PARTIAL_PAYMENT_REFUND || smeLoanTransaction.type === DDtype.INTEREST_PENALTY)
    ) warning = 'Amount must be negative!';
    else if (
      smeLoanTransaction.amount < 0 &&
      (smeLoanTransaction.type === DDtype.NORMAL || smeLoanTransaction.type === DDtype.SPECIAL || smeLoanTransaction.type === DDtype.PARTIAL_PAYMENT || smeLoanTransaction.type === DDtype.DISCOUNT_PAYMENT || smeLoanTransaction.type === DDtype.CLOSING_PAYMENT)
    ) warning = 'Amount must be positive!';
    else if (util.isNullOrEmpty(smeLoanTransaction.status)) warning = 'Please fill the status!';
    else if (
      (smeLoanTransaction.type !== DDtype.NORMAL && smeLoanTransaction.type !== DDtype.SPECIAL) &&
      (smeLoanTransaction.status === DDstatus.FAILED || smeLoanTransaction.status === DDstatus.FREQUENTLY_FAILED || smeLoanTransaction.status === DDstatus.REJECTED || smeLoanTransaction.status === DDstatus.FREQUENTLY_REJECTED || smeLoanTransaction.status === DDstatus.PAUSED || smeLoanTransaction.status === DDstatus.MANDATE_WITHDRAWN)
    ) warning = `Invalid status for type "${smeLoanTransaction.type}"`;
    else if (
      (smeLoanTransaction.type === DDtype.NORMAL || smeLoanTransaction.type === DDtype.SPECIAL) &&
      util.isNullOrEmpty(smeLoanTransaction.mandateId)
    ) warning = 'Please fill the mandate!';
    else if (
      (smeLoanTransaction.type === DDtype.NORMAL || smeLoanTransaction.type === DDtype.SPECIAL) &&
      smeLoanTransaction.mandateId &&
      this.state.selectedManadate.status !== 'active'
    ) warning = 'Please select the active mandate!';
    else if (
      (smeLoanTransaction.type === DDtype.NORMAL || smeLoanTransaction.type === DDtype.SPECIAL) &&
      smeLoanTransaction.status === DDstatus.OPEN &&
      util.isNullOrEmpty(smeLoanTransaction.termNumber)
    ) warning = 'Please fill the term number!';
    else if (
      smeLoanTransaction.type === DDtype.NORMAL &&
      util.isNullOrEmpty(smeLoanTransaction.principleAmountPart || 0)
    ) warning = 'Please fill the principal amount part!';
    // else if (
    //   smeLoanTransaction.type === DDtype.NORMAL &&
    //   currentSumOfPrincipalAmountPart !== smeLoan.principleAmount
    // ) {
    //   const diff = smeLoan.principleAmount - currentSumOfPrincipalAmountPart;
    //   warning = `sum of principal amount part is ${diff > 0 ? 'less' : 'greater'} than sme loan principal amount by ${EURO(Math.abs(diff))}`;
    // }
    else if (
      smeLoanTransaction.type === DDtype.NORMAL &&
      util.isNullOrEmpty(smeLoanTransaction.interestAmountPart || 0)
    ) warning = 'Please fill the interest amount part!';
    // else if (
    //   smeLoanTransaction.type === DDtype.NORMAL &&
    //   currentSumOfInterestAmountPart !== smeLoan.interestAmount
    // ) {
    //   const diff = smeLoan.interestAmount - currentSumOfInterestAmountPart;
    //   warning = `sum of interest amount part is ${diff > 0 ? 'less' : 'greater'} than sme loan interest amount by ${EURO(Math.abs(diff))}`;
    // }
    else if (
      smeLoanTransaction.type === DDtype.NORMAL &&
      util.isNullOrEmpty(smeLoanTransaction.initialCostAmountPart || 0)
    ) warning = 'Please fill the initial cost amount part!';
    // else if (
    //   smeLoanTransaction.type === DDtype.NORMAL &&
    //   currentSumOfInitialCostAmountPart !== smeLoan.initialCostAmount
    // ) {
    //   const diff = smeLoan.initialCostAmount - currentSumOfInitialCostAmountPart;
    //   warning = `sum of initial cost amount part is ${diff > 0 ? 'less' : 'greater'} than sme loan initial cost amount by ${EURO(Math.abs(diff))}`;
    // }
    else if (
      smeLoanTransaction.type === DDtype.NORMAL &&
      util.isNullOrEmpty(smeLoanTransaction.recurringCostAmountPart || 0)
    ) warning = 'Please fill the recurring cost amount part!';
    // else if (
    //   smeLoanTransaction.type === DDtype.NORMAL &&
    //   currentSumOfRecurringCostAmountPart !== smeLoan.recurringCostAmount
    // ) {
    //   const diff = smeLoan.recurringCostAmount - currentSumOfRecurringCostAmountPart;
    //   warning = `sum of recurring cost amount part is ${diff > 0 ? 'less' : 'greater'} than sme loan recurring cost amount by ${EURO(Math.abs(diff))}`;
    // }
    else return true;

    this.props.displayNotification(warning, 'warning');
    return false;
  };

  createTransaction = () => {
    if (!this.validateTransaction()) return;
    const { smeLoan, country, currency } = this.props;
    const { smeLoanTransaction, selectedManadate } = this.state;

    smeLoanTransaction.loanId = smeLoan._id;
    smeLoanTransaction.contractId = smeLoan.contractId;
    smeLoanTransaction.smeLoanType = smeLoan.type;
    smeLoanTransaction.mandate = selectedManadate._id;
    smeLoanTransaction.externalReferenceId = smeLoan.contractId + '-' + smeLoan.contractIdExtension;
    smeLoanTransaction.country = country;
    smeLoanTransaction.currency = currency;

    if (smeLoanTransaction.type !== DDtype.NORMAL) delete smeLoanTransaction.termNumber;
    console.log(smeLoanTransaction)
    this.setState({ isLoading: true });
    this.props.createOrUpdateSmeLoanTransaction(smeLoanTransaction, 'create')
      .then(() => {
        this.props.displayNotification('Sme Loan Transaction successfully created', 'success');
        this.props.onClose();
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  updateTransaction = () => {
    if (!this.validateTransaction()) return;

    const originalSmeLoanTransaction = this.props.smeLoanTransaction;
    const selectedManadate = this.state.selectedManadate;
    const updatedSmeLoanTransaction = this.state.smeLoanTransaction;

    // updatedSmeLoanTransaction.mandate = selectedManadate._id;
    
    const valuesToUpdate = {};
    for (const key of Object.keys(updatedSmeLoanTransaction)) {
      if (
        !(util.isNullOrEmpty(updatedSmeLoanTransaction[key]) && util.isNullOrEmpty(originalSmeLoanTransaction[key])) &&
        (updatedSmeLoanTransaction[key] !== originalSmeLoanTransaction[key])
      ) valuesToUpdate[key] = updatedSmeLoanTransaction[key];
    }

    if (Object.keys(valuesToUpdate).length === 0) return this.props.displayNotification('No values to update', 'warning');

    if ('mandateId' in valuesToUpdate) {
      if (!util.isNullOrEmpty(valuesToUpdate['mandateId'])) {
        valuesToUpdate.mandate = selectedManadate._id;
      }
    }

    valuesToUpdate._id = originalSmeLoanTransaction._id;
    valuesToUpdate.id = originalSmeLoanTransaction.id;

    this.setState({ isLoading: true });
    this.props.createOrUpdateSmeLoanTransaction(valuesToUpdate, 'update')
      .then(() => {
        this.props.displayNotification('Sme Loan Transaction successfully updated', 'success');
        this.props.onClose();
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  deleteTransaction = () => {
    const originalSmeLoanTransaction = this.props.smeLoanTransaction;
    const valuesToUpdate = {};
    valuesToUpdate._id = originalSmeLoanTransaction._id;
    valuesToUpdate.id = originalSmeLoanTransaction.id;
    valuesToUpdate.status = 'deleted';

    this.setState({ isLoading: true });
    this.props.createOrUpdateSmeLoanTransaction(valuesToUpdate, 'update')
      .then(() => {
        this.props.displayNotification('Sme Loan Transaction successfully updated', 'success');
        this.props.onClose();
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  handleChangeBatchId = (value) => {
    this.setState({newBatchId:value});
  }

  addBatchId = () => {
    const _state = {};
    const newBatchId = this.state.newBatchId;
    const smeLoanTransaction = this.state.smeLoanTransaction;
    const array = [...smeLoanTransaction.batchId];
    
    const index = array.indexOf(newBatchId);
    if (index > -1) {
      this.props.displayNotification('Batch Id already availble.', 'warning');
    }else if(newBatchId == ''){
      this.props.displayNotification('New batch Id cannot be empty value.', 'warning');
    }else{
      array.push(newBatchId);
      smeLoanTransaction['batchId'] = array;
      _state.smeLoanTransaction = smeLoanTransaction;
      _state.newBatchId = '';
      this.setState(_state);
    }

   

  }

  removeBatchId = (batchId) => {
    const _state = {};
    const smeLoanTransaction = this.state.smeLoanTransaction;
    const array = [...smeLoanTransaction.batchId];
    const index = smeLoanTransaction.batchId.indexOf(batchId);
    if (index > -1) {
      array.splice(index, 1); 
    }
    smeLoanTransaction['batchId'] = array;
    _state.smeLoanTransaction = smeLoanTransaction;
    this.setState(_state);
  }

  render() {
    const { classes, usage, country, currency, symbol, decimalSeparator, thousandSeparator } = this.props;
    const isReadOnly = usage === 'view' || usage === 'delete';
    const { countries, currencies } = this.state;

    
    return (
      <div>
        <Loader open={this.state.isLoading} />
        {/* First Row */}
        <GridContainer>
          {/* Contract ID */}
          <GridItem>
            <CustomInput
              id='contract-id'
              labelText='Contract ID'
              className={classes.inputFields}
              formControlProps={{
                className: clx(classes.tableCellLessPadding, classes.zeroMargin),
                fullWidth: true
              }}
              inputProps={{
                name: 'contractId',
                value: this.props.smeLoan.contractId,
                readOnly: true
              }}
            />
          </GridItem>
          {/* Company Name */}
          <GridItem>
            <CustomInput
              id='sme-company-name'
              labelText='Name'
              className={classes.inputFields}
              formControlProps={{
                className: clx(classes.tableCellLessPadding, classes.zeroMargin),
                fullWidth: true
              }}
              inputProps={{
                name: 'sme-company-name',
                value: this.props.smeDetails.company,
                readOnly: true
              }}
            />
          </GridItem>
          {/* Country */}
          <GridItem>
            <FormControl fullWidth>
              <InputLabel htmlFor="mandate-selcetor">Country</InputLabel>
              <Select
                value={country}

                inputProps={{
                  readOnly: true
                }}
                className={classes.inputFields}
              >
                <MenuItem value="">
                  <em>Select a country</em>
                </MenuItem>
                {countries?.map((country, index) =>
                  <MenuItem key={index} value={country}>{country}</MenuItem>
                )}
              </Select>
            </FormControl>
          </GridItem>
          {/* Currency */}
          <GridItem>
            <FormControl fullWidth>
              <InputLabel htmlFor="mandate-selcetor">Currency</InputLabel>
              <Select
                value={currency}

                inputProps={{

                  readOnly: true
                }}
                className={classes.inputFields}
              >
                <MenuItem value=""  >
                  <em>Select a Currency</em>
                </MenuItem>
                {currencies?.map((currency, index) =>
                  <MenuItem key={index} value={currency}>{currency}</MenuItem>
                )}
              </Select>
            </FormControl>
          </GridItem>

        </GridContainer>
        {/* Second Row */}
        <GridContainer>
          {/* Mandate ID */}
          <GridItem>
            <FormControl fullWidth>
              <InputLabel htmlFor="mandate-selcetor">Mandate</InputLabel>
              <Select
                value={this.state.smeLoanTransaction.mandateId}
                onChange={(e) => this.handleChange('mandateId', e.target.value)}
                inputProps={{
                  name: 'mandateId',
                  id: 'mandate-selector',
                  readOnly: isReadOnly
                }}
                className={classes.inputFields}
              >
                <MenuItem value="">
                  <em>Empty</em>
                </MenuItem>
                {this.props.smeMandates.map(mandate =>
                  <MenuItem key={mandate._id} value={mandate.mandateId}>{mandate.mandateId + (mandate.status === 'active' ? ' (Active)' : '')}</MenuItem>
                )}
              </Select>
            </FormControl>
          </GridItem>
          {/* Our Reference */}
          <GridItem>
            <CustomInput
              id='our-reference'
              labelText='Our Reference'
              className={classes.inputFields}
              formControlProps={{
                className: clx(classes.tableCellLessPadding, classes.zeroMargin),
                fullWidth: true
              }}
              inputProps={{
                name: 'ourReference',
                value: this.state.smeLoanTransaction.ourReference,
                readOnly: isReadOnly,
                onChange: (e) => this.handleChange('ourReference', e.target.value)
              }}
            />
          </GridItem>
          {/* Term Number */}
          <GridItem>
            <TextField
              label="Term Number"
              type="number"
              id="term-number"
              name="termNumber"
              className={classes.inputFields}
              value={this.state.smeLoanTransaction.termNumber}
              onChange={(e) => this.handleChange('termNumber', e.target.value)}
              inputProps={{
                readOnly: isReadOnly
              }}
            />
          </GridItem>
          {/* Type */}
          <GridItem>
            <FormControl fullWidth>
              <InputLabel htmlFor="type-selcetor">Type</InputLabel>
              <Select
                value={this.state.smeLoanTransaction.type}
                onChange={(e) => this.handleChange('type', e.target.value)}
                inputProps={{
                  name: 'type',
                  id: 'type-selector',
                  readOnly: isReadOnly
                }}
                className={classes.inputFields}
              >
                <MenuItem value=""><em>Please Select a Type</em></MenuItem>
                {(usage === 'create') ?
                  Object.keys(DDtype).map(key => (!(DDtype[key] === 'normal-dd' || DDtype[key] === 'special-dd')) ?
                    <MenuItem key={key} value={DDtype[key]}>{DDtype[key]}</MenuItem>
                    : null
                  )
                  :
                  Object.keys(DDtype).map(key =>
                    <MenuItem key={key} value={DDtype[key]}>{DDtype[key]}</MenuItem>
                  )
                }

              </Select>
            </FormControl>
          </GridItem>

        </GridContainer>
        {/* Third Row - Description*/}
        <GridContainer>
          {/* status */}
          <GridItem xs={3} sm={3} md={3}><FormControl fullWidth>
            <InputLabel htmlFor="status-selcetor">Status</InputLabel>
            <Select
              value={this.state.smeLoanTransaction.status}
              onChange={(e) => this.handleChange('status', e.target.value)}
              inputProps={{
                name: 'status',
                id: 'status-selector',
                readOnly: isReadOnly
              }}
              className={classes.inputFields}
            >
              <MenuItem value=""><em>Please Select a Status</em></MenuItem>
              {Object.keys(DDstatus).map(key =>
                <MenuItem key={key} value={DDstatus[key]}>{DDstatus[key]}</MenuItem>
              )}
            </Select>
          </FormControl></GridItem>
          {/* Description */}
          <GridItem xs={9} sm={9} md={9}>
            <CustomInput
              id='description'
              labelText='Description'
              className={classes.inputFields}
              formControlProps={{
                className: clx(classes.tableCellLessPadding, classes.zeroMargin),
                fullWidth: true
              }}
              inputProps={{
                name: 'description',
                value: this.state.smeLoanTransaction.description,
                readOnly: isReadOnly,
                onChange: (e) => this.handleChange('description', e.target.value)
              }}
            />
          </GridItem>
        </GridContainer>
        {/* Fourth Row - Amount fields */}
        <GridContainer>
          {/* Amount */}
          <GridItem>
            <MultiCurrencyCustomFormatInput
              labelText='Amount'
              type="text"
              id="amount"
              name="amount"
              numberformat={this.state.smeLoanTransaction.amount}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('amount', val)}
              readOnly={isReadOnly}
              symbol={symbol ? symbol : '€'}
              decimalSeparator={decimalSeparator ? decimalSeparator : ','}
              thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
            />
          </GridItem>
          {/* Principle Amount Part */}
          <GridItem>
            <MultiCurrencyCustomFormatInput
              labelText='Principal Amount Part'
              type="text"
              id="principal-amount-part"
              name="principleAmountPart"
              numberformat={this.state.smeLoanTransaction.principleAmountPart || 0}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('principleAmountPart', val)}
              readOnly={isReadOnly}
              symbol={symbol ? symbol : '€'}
              decimalSeparator={decimalSeparator ? decimalSeparator : ','}
              thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
            />

            {/* <CustomFormatInput
              labelText='Principal Amount Part'
              type="text"
              id="principal-amount-part"
              name="principleAmountPart"
              numberformat={this.state.smeLoanTransaction.principleAmountPart || 0}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('principleAmountPart', val)}
              readOnly={isReadOnly}
            /> */}
          </GridItem>
          {/* Initial Cost Amount Part */}
          <GridItem>
            <MultiCurrencyCustomFormatInput
              labelText='Initial Cost Amount Part'
              type="text"
              id="initial-cost-amount-part"
              name="initialCostAmountPart"
              numberformat={this.state.smeLoanTransaction.initialCostAmountPart || 0}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('initialCostAmountPart', val)}
              readOnly={isReadOnly}
              symbol={symbol ? symbol : '€'}
              decimalSeparator={decimalSeparator ? decimalSeparator : ','}
              thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
            />
          </GridItem>
          {/* Interest Amount Part */}
          <GridItem>
            <MultiCurrencyCustomFormatInput
              labelText='Interest Amount Part'
              type="text"
              id="interest-amount-part"
              name="interestAmountPart"
              numberformat={this.state.smeLoanTransaction.interestAmountPart || 0}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('interestAmountPart', val)}
              readOnly={isReadOnly}
              symbol={symbol ? symbol : '€'}
              decimalSeparator={decimalSeparator ? decimalSeparator : ','}
              thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
            />
          </GridItem>
          {/* Reccurring Amount Cost Part */}
          <GridItem>
            <MultiCurrencyCustomFormatInput
              labelText='Recurring Cost Amount Part'
              type="text"
              id="recurring-cost-amount-part"
              name="recurringCostAmountPart"
              numberformat={this.state.smeLoanTransaction.recurringCostAmountPart || 0}
              className={classes.inputFields}
              changeValue={(val) => this.handleChange('recurringCostAmountPart', val)}
              readOnly={isReadOnly}
              symbol={symbol ? symbol : '€'}
              decimalSeparator={decimalSeparator ? decimalSeparator : ','}
              thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
            />
          </GridItem>
        </GridContainer>
        {/* Fifth Row - Date fields */}
        <GridContainer>
          <GridItem>
            <CustomDatePicker
              label="Planned Date"
              name="plannedDate"
              value={this.state.smeLoanTransaction.plannedDate}
              onChange={this.handleChange}
              hideSideButtons
              checkHoliday
            />
          </GridItem>
          <GridItem>
            <CustomDatePicker
              label="Transaction Date"
              name="transactionDate"
              value={this.state.smeLoanTransaction.transactionDate}
              // readOnly={true}
              onChange={this.handleChange}
              hideSideButtons
            />
          </GridItem>
        </GridContainer>
        {/* sixth Row - BatchId list and filed */}
        <GridContainer>
          <GridItem xs={12}>
            <p style={{fontWeight: 'bold'}}>Batch Id details</p>
          </GridItem>
          <GridItem xs={4}>
              <CustomInputBox
                     id={`add new batch Id`}
                     label="new batch id"
                     name='newBatchId'
                     value={this.state.newBatchId}
                     placeholder='new batch id'
                     onChange={(name, value) => this.handleChangeBatchId(value)}
                   />
          </GridItem>
          <GridItem>
              <Button variant='contained' color='primary' style={{ float: 'right' }} onClick={()=>this.addBatchId()}>Add new batch Id</Button>
          </GridItem>  
          <GridItem xs={8}>
          {this.state.smeLoanTransaction.batchId.map((batchId, index)=>{
             return( 
                  <CustomInputBox
                  id={`batchId-${batchId}-${index}`}
                  value={batchId}
                  placeholder='batchId'
                  onRemove={() => this.removeBatchId(batchId)}
                />
               )
          })}
          </GridItem>
 
        </GridContainer>
        {/* Footer Actions */}
        <GridContainer style={{ display: 'block' }}>
          {usage === 'update' && <Button variant='contained' color='primary' style={{ float: 'right' }} onClick={this.updateTransaction}>Update Transaction</Button>}
          {usage === 'create' && <Button variant='contained' color='primary' style={{ float: 'right' }} onClick={this.createTransaction}>Create Transaction</Button>}
          {usage === 'delete' && <Button variant='contained' color='primary' style={{ float: 'right' }} onClick={this.deleteTransaction}>Delete Transaction</Button>}
        </GridContainer>
      </div>
    );
  }
}

SmeLoanTransactionPopup.defaultProps = {
  usage: 'create',
  smeLoanTransaction: {}
};

SmeLoanTransactionPopup.propTypes = {
  smeLoanTransaction: PropTypes.object,
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  smeMandates: PropTypes.array.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  usage: PropTypes.oneOf(['create', 'update', 'view', 'delete']),
  onClose: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  createOrUpdateSmeLoanTransaction: PropTypes.func.isRequired,
  getFieldNameValues: PropTypes.func,
  country: PropTypes.string,
  currency: PropTypes.string,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  getNextWorkingDate: (startDate, noOfDaysAhead) => dispatch(getNextWorkingDate(startDate, noOfDaysAhead)),
  createOrUpdateSmeLoanTransaction: (smeLoanTransaction, processType) => dispatch(createOrUpdateSmeLoanTransaction(smeLoanTransaction, processType)),
  getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(SmeLoanTransactionPopup));
