import moment from 'moment';
import clx from 'classnames';
import { cloneDeep } from 'lodash';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import Style from "assets/jss/material-dashboard-react/views/requestSmeLoanStyles";

import Card from 'components/initiation/Card/Card';
import CardBody from 'components/initiation/Card/CardBody';
import GridItem from 'components/initiation/Grid/GridItem';
import Button from 'components/initiation/CustomButtons/Button.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { Select, MenuItem, TableRow, TableCell, TableBody, Table, TextField, CircularProgress } from '@material-ui/core';

import SplitDirectDebit from './SplitDirectDebit';
import { displayNotification } from 'store/initiation/actions/Notifier';

// import { currencyConverter, percentage, getEnv, toFixed } from "lib/initiation/utility";
import { currencyConverter, percentage, toFixed } from "lib/initiation/utility";

import { smeLoanType, riskCategory, frequency, getPlannedDDCount, getDurationInMonths } from "constants/initiation/sme-loan";
// import { ENVIRONMENT } from "constants/config";
import CustomInput from 'components/initiation/CustomInput/CustomInput';
import CustomFormatInput from 'components/initiation/CustomFormatInput/CustomFormatInput';
import CustomDatePicker from 'components/initiation/CustomDatePicker/CustomDatePicker';
import { processLoanRequest, importLoanRequest } from 'store/initiation/actions/loanRequest.action';
import { getNextWorkingDate } from 'store/initiation/actions/Holidays';

import { isUserHasPermission } from 'lib/initiation/userPermission';
import { setNavigationInDashboards } from 'store/initiation/actions/login';
import history from "./../../../history";

const EURO = currencyConverter();
const PERCENTAGE = percentage;
// const isProduction = getEnv() === ENVIRONMENT.PRODUCTION;
const TASK_DEFINITION_KEY = "view-sme-loan-request-form";

const APPROVE_CONTRACT = 'ING0102-get-user-response-before-approve';

class LoanRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loanType: smeLoanType.FIXED,
      riskCategory: riskCategory.A,
      legalName: '',
      requestType: '',
      startDate: moment().format('YYYY-MM-DD'),
      interestPecentagebasePerMonth: 0.5,
      splitDdPeriod: {
        "1": { amount: 0, noOfDD: 0, total: 0 },
        "2": { amount: 0, noOfDD: 0, total: 0 },
        "3": { amount: 0, noOfDD: 0, total: 0 },
        ddStartDate: moment().format('YYYY-MM-DD'),
        total: 0,
        totalNoOfDD: 0,
      },
      splitPayout: {
        first: 0,
        others: []
      },
      iban: '',
      principalAmount: 0,
      interestAmount: 0,
      initialCostAmount: 0,
      directDebitFrequency: '',
      plannedNumberOfDirectDebit: 0,
      plannedNumberOfDirectDebitMonth: 0,
      refinancedLoan: '',
      refinancedIndicator: 'No',
      isError: false,
      isRefinanced: 0,
      isLoadingFixedLoanRequest: false,
      isChangeContract: false
    };
  }

  componentDidMount () {

    const systemDate = this.props.simulations.systemDate || moment().format('YYYY-MM-DD');
    this.props.getNextWorkingDate(systemDate, 2)
      .then((result) => {
        const splitDdPeriod = cloneDeep(this.state.splitDdPeriod);
        splitDdPeriod.ddStartDate = result;

        this.setState({ splitDdPeriod, startDate: systemDate });

        const errors = this.props.selectedLoanRequest.variables.errorLog.value;

        if (errors != null) {
          this.setState({ isError: true });
        }

        this.getDisplayData();
      });
  }

  getDisplayData () {

    const selectedLoanRequest = this.props.selectedLoanRequest.variables.opportunity.value;
    const selectedOrganization = this.props.selectedLoanRequest.variables.organization.value;
    
    if (this.props.selectedLoanRequest.variables.smeLoanRequest && this.props.selectedLoanRequest.variables.smeLoanRequestProposal) {

      const smeLoanRequest = this.props.selectedLoanRequest.variables.smeLoanRequest.value;
      const smeLoanRequestProposal = this.props.selectedLoanRequest.variables.smeLoanRequestProposal.value;
      const totalFirstPeriod = Number((Number(smeLoanRequestProposal.directDebitAmountForFirstPeriod) * Number(smeLoanRequestProposal.numberOfDirectDebitsFirstPeriod)).toFixed(2));
      const totalSecondPeriod = Number((Number(smeLoanRequestProposal.directDebitAmountForSecondPeriod) * Number(smeLoanRequestProposal.numberOfDirectDebitsSecondPeriod)).toFixed(2));
      const totalThirdPeriod = Number((Number(smeLoanRequestProposal.directDebitAmountForThirdPeriod) * Number(smeLoanRequestProposal.numberOfDirectDebitsThirdPeriod)).toFixed(2));

      const splitDdPeriod = {
        '1': { amount: smeLoanRequestProposal.directDebitAmountForFirstPeriod, noOfDD: smeLoanRequestProposal.numberOfDirectDebitsFirstPeriod, total: totalFirstPeriod},
        '2': { amount: smeLoanRequestProposal.directDebitAmountForSecondPeriod, noOfDD: smeLoanRequestProposal.numberOfDirectDebitsSecondPeriod, total: totalSecondPeriod},
        '3': { amount: smeLoanRequestProposal.directDebitAmountForThirdPeriod, noOfDD: smeLoanRequestProposal.numberOfDirectDebitsThirdPeriod, total: totalThirdPeriod},
        ddStartDate: smeLoanRequestProposal.firstDirectDebitDate,
        total: Number((totalFirstPeriod + totalSecondPeriod + totalThirdPeriod).toFixed(2))
      };

      this.setState({
        principalAmount: smeLoanRequestProposal.principleAmount,
        interestAmount: smeLoanRequestProposal.interestAmount,
        initialCostAmount: smeLoanRequestProposal.initialFeeAmount,
        directDebitFrequency: smeLoanRequestProposal.directDebitFrequency,
        plannedNumberOfDirectDebit: smeLoanRequestProposal.plannedNumberOfDirectDebits,
        plannedNumberOfDirectDebitMonth: smeLoanRequestProposal.plannedNumberOfDirectDebitMonth,
        riskCategory: smeLoanRequest.riskCategory,
        requestType: smeLoanRequest.requestType,
        refinancedLoan: smeLoanRequest.idRefinancedLoan,
        isChangeContract: true,
        splitDdPeriod: splitDdPeriod,
        iban: smeLoanRequest.iban ? smeLoanRequest.iban : selectedOrganization.cf_potentials_ibannumber
      });

    } else {

      const plannedNumberOfDirectDebit = isNaN(Number(selectedLoanRequest.terms)) ? 0 : Number(selectedLoanRequest.terms);
      this.setState({
        principalAmount: isNaN(Number(selectedLoanRequest.amount)) ? 0 : Number(selectedLoanRequest.amount),
        interestAmount: isNaN(Number(selectedLoanRequest.interest)) ? 0 : Number(selectedLoanRequest.interest),
        initialCostAmount: isNaN(Number(selectedLoanRequest.fees)) ? 0 : Number(selectedLoanRequest.fees),
        directDebitFrequency: selectedLoanRequest.frequency,
        plannedNumberOfDirectDebit: plannedNumberOfDirectDebit,
        plannedNumberOfDirectDebitMonth: selectedLoanRequest.durationInMonths != null ? Number(selectedLoanRequest.durationInMonths) : getDurationInMonths(selectedLoanRequest.frequency, plannedNumberOfDirectDebit),
        riskCategory: selectedLoanRequest.riskCategory,
        requestType: selectedLoanRequest.loanType,
        // legalName: selectedOrganization != null ? selectedOrganization.accountname : '',
        refinancedLoan: selectedOrganization != null ? selectedOrganization.refinancedLoan : '',
        iban: selectedLoanRequest != null ? selectedLoanRequest.cf_potentials_ibannumber : ''
      });
    }

    this.setState({legalName: selectedOrganization != null ? selectedOrganization.accountname : ''});
  }

  updateSplitDD = value => {
    this.setState({ splitDdPeriod: value });
  }

  updateSplitPayout = value => {
    this.setState({ splitPayout: value });
  };

  handleCustomInputChange = (name, value) => {
    const _state = { [name]: value };

    if (name === 'plannedNumberOfDirectDebitMonth') {
      _state.plannedNumberOfDirectDebit = getPlannedDDCount(this.state.directDebitFrequency, value);
    }

    if (name === 'plannedNumberOfDirectDebitMonth' || name === 'principalAmount' || name === 'initialCostAmount' || name === 'interestAmount') {
      _state.isChangeContract = false;
    }

    this.setState(_state);
  };

  handleRefinanceState = (name, value) => {
    this.setState({
      isRefinanced: value,
      refinancedLoan: value === 0 ? '' : this.state.refinancedLoan,
    });
  };

  handleRefinanceContractName = (event) => {
    this.setState({ refinancedLoan: event.target.value });
  };

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

  
  createSmeLoanRequest = () => {
    if (this.state.isRefinanced === 1 && (this.state.refinancedLoan === undefined || this.state.refinancedLoan === null)) {
      this.props.displayNotification('Please fill Refinanced Contract Id', 'warning');
      return;
    }
    const loanRequest = this.props.selectedLoanRequest.variables;

    const selectedopportunity = loanRequest.opportunity.value;
    const selectedPerson = loanRequest.updatePerson.value;
    const selectedCustomer = loanRequest.updateCustomer.value;

    if (!moment(this.state.startDate).isValid()) {
      this.props.displayNotification('Loan start date not available', 'warning');
      return;
    }
    else if (!moment(this.state.splitDdPeriod.ddStartDate).isValid()) {
      this.props.displayNotification('Fisrt direct debit date not available', 'warning');
      return;
    }
    const smeLoanRequestObj = {
      action: 'update',
      contractId: selectedopportunity != null ? selectedopportunity.potentialNo : '',
      contractIdExtension: 0,
      customerId: selectedCustomer != null ? selectedCustomer.id : '',
      requestType: this.state.requestType,
      platform: 'Bridgefund',
      idRefinancedLoan: this.state.refinancedLoan,
      loanType: this.state.loanType,
      commercialLabel: selectedopportunity != null ? selectedopportunity.cf_potentials_loantype : '',
      status: 'received-from-customer',
      purposeIndicator: selectedopportunity != null ? selectedopportunity.cf_potentials_spendinggoal : '',
      smeRemarkOnPurpose: selectedopportunity != null ? selectedopportunity.cf_potentials_otherspendinggoal : '',
      internalRemarkOnPurpose: '',
      desiredPrincipleAmount: toFixed(this.state.principalAmount),
      desiredDurationInMonths: Number(selectedopportunity != null ? selectedopportunity.durationInMonths : ''),
      desiredStartDate: '',
      desiredDirectDebitFrequency: selectedopportunity != null ? selectedopportunity.cf_potentials_loanpaymentschedule : '',
      desiredLoanDate: selectedopportunity != null ? selectedopportunity.cf_potentials_loanneededwithin : '',
      riskCategory: this.state.riskCategory,
      riskCategoryIindicator: 'green',
      primaryCustomerSuccessManager: selectedopportunity != null ? selectedopportunity.cf_potentials_customersuccesmanager : '',
      primaryStakeholderWithinSme: selectedPerson != null ? selectedPerson.id : '',
      iban: this.state.iban,
      applicationId: selectedopportunity != null ? selectedopportunity.cf_potentials_applicationid : '',
    };

    const smeLoanRequestProposalObj = {
      action: 'create',
      sequenceNumber: 1,
      requestType: this.state.requestType,
      loanType: this.state.loanType,
      status: 'approved-by-customer',
      expiryDate: '',
      principleAmount: this.state.principalAmount,
      initialFeeAmount: this.state.initialCostAmount,
      interestAmount: this.state.interestAmount,
      recurringCostAmountPerMonth: '0',
      totalLoanAmount: this.totalLoanAmount,
      totalMarginAmount: selectedopportunity != null ? selectedopportunity.cf_potentials_margin : '',
      plannedNumberOfDirectDebitMonth: Number(this.state.plannedNumberOfDirectDebitMonth),
      directDebitFrequency: this.state.directDebitFrequency,
      plannedNumberOfDirectDebits: Number(this.state.plannedNumberOfDirectDebit),
      firstDirectDebitDate: this.state.splitDdPeriod.ddStartDate,
      numberOfDirectDebitsFirstPeriod: Number(this.state.splitDdPeriod["1"].noOfDD),
      directDebitAmountForFirstPeriod: Number(this.state.splitDdPeriod["1"].amount),
      numberOfDirectDebitsSecondPeriod: Number(this.state.splitDdPeriod["2"].noOfDD),
      directDebitAmountForSecondPeriod: Number(this.state.splitDdPeriod["2"].amount),
      numberOfDirectDebitsThirdPeriod: Number(this.state.splitDdPeriod["3"].noOfDD),
      directDebitAmountForThirdPeriod: Number(this.state.splitDdPeriod["3"].amount),
      maturityDate: '',
      interestPercentageBasePerMonth: this.state.interestPecentagebasePerMonth,
      interestPercentageRiskSurchargePerMonth: selectedopportunity != null ? selectedopportunity.surcharge : '',
      interestPercentageTotal: selectedopportunity != null ? selectedopportunity.totalInterest : '',
      interestAnnualPercentageRate: '',
      approvedBy1: selectedopportunity != null ? selectedopportunity.cf_potentials_creditriskmanager : '',
      approvedBy2: ''
    };

    const smeLoanCreateRequestObj = {
      id: this.props.selectedLoanRequest.id,
      variables: {
        smeLoanRequest: {
          type: "Json",
          value: JSON.stringify(smeLoanRequestObj)
        },
        smeLoanRequestProposal: {
          type: "Json",
          value: JSON.stringify(smeLoanRequestProposalObj)
        },
        loanType: {
          type: "String",
          value: this.state.loanType
        }
      },
      withVariablesInReturn: false
    };

    this.setState({ isLoadingFixedLoanRequest: true});

    this.props.processLoanRequest(smeLoanCreateRequestObj)
      .then((response) => {
        if (response === 'ok') {
          this.props.displayNotification('Sent loan Request successfully', 'success');
          this.props.importLoanRequest(TASK_DEFINITION_KEY)
            .then(() => {
              this.checkIfContractCreated();
            });
            
          // this.props.onClose();
        }
      });
  };

  checkIfContractCreated = () => {

    let callCount = 0;

    const contractId = this.props.selectedLoanRequest.variables.opportunity.value.potentialNo;

    const intervalIdentifier = setInterval(() => {
      this.props.importLoanRequest(TASK_DEFINITION_KEY, contractId)
        .then(result => {
          if (result && result.length === 0) {
            this.props.importLoanRequest(APPROVE_CONTRACT, contractId)
              .then(result => {
                if (result && result.length > 0) {
                  clearInterval(intervalIdentifier);
                  const { isDashboardContent } = this.props;
                  if(isDashboardContent){
                    this.props.setNavigationInDashboards('ContractOverviewNew')
                    .then(res => {
                      if (res) {
                        history.push(res);
                        }
                    });
                  }else{
                    this.setContractOverviewUrl(contractId); //otherRoutes
                  }
                  this.setState({ isLoadingFixedLoanRequest: false});
                  this.props.onClose();
                }
              });
            }
            if (++ callCount === 10) {
              clearInterval(intervalIdentifier);
              this.setState({ isLoadingFixedLoanRequest: false});
              this.props.onClose();
         }     
        })
        .catch(() => {
        clearInterval(intervalIdentifier);
        this.setState({ isLoadingFixedLoanRequest: false});
        this.props.onClose();});
    }, 1000);
  };

  setContractOverviewUrl = (id) => {

    const URL = `${document.location.origin}/user/contract-overview?ContractId=${id}`; //otherRoutes
      window.location.replace(URL);
  };

  get totalLoanAmount () {
    return Number((Number(this.state.principalAmount) + Number(this.state.interestAmount) + Number(this.state.initialCostAmount)).toFixed(2));
  }

  get standardDdAmount () {
    const val = Number((this.totalLoanAmount / Number(this.state.plannedNumberOfDirectDebit)).toFixed(2));
    return isNaN(val) ? 0 : val;
  }

  render () {
    const { classes } = this.props;

    const selectedopportunity = this.props.selectedLoanRequest.variables.opportunity.value;
    const errors = this.props.selectedLoanRequest.variables.errorLog.value;

    const items = (!errors || (Array.isArray(errors) && errors.length === 0)) ? '' : errors.map((item) =>
      <li key={item.id}>{item}</li>
    );

    
    return (
      <div>
        { items ?  <GridItem className={classes.block}>
          {this.state.isError ? <p className={classes.errorContainer}>{items}</p> : false}
        </GridItem> : null }
            {/* Top Line */}
            <GridContainer className={classes.gridContainer}>
              {/* Contract ID */}
              <GridItem className={classes.gridItem} xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Contract ID</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <CustomInput
                    id='contract-id'
                    formControlProps={{
                      className: clx(classes.zeroMargin)
                    }}
                    inputProps={{
                      name: 'contractId',
                      value: selectedopportunity.potentialNo,
                      readOnly: true,
                    }}
                  />
                </span>
              </GridItem>
              {/* SME Loan Type */}
              <GridItem style={{ margin: '20px 0 0 0', padding: '0'}}  xs={12} sm={6} md={4} lg={4}>
                <span className={clx( classes.bold)}>Type</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
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
              <GridItem style={{ margin: '20px 0 0 0' , padding: '0' }} xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Risk Category</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
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
              {/* Legal Name */}
              <GridItem className={classes.gridItem} xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Legal-Name</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <CustomInput
                      id='legal-name'
                      formControlProps={{
                        className: clx(classes.zeroMargin)
                      }}
                      inputProps={{
                        name: 'legalName',
                        value: this.state.legalName,
                        readOnly: true,
                      }}
                  />
                </span>
              </GridItem>
              {/* Request Type */}
              <GridItem className={classes.gridItem} xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Request-Type</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <CustomInput
                      id='request-type'
                      formControlProps={{
                        className: clx(classes.zeroMargin)
                      }}
                      inputProps={{
                        name: 'requestType',
                        value: this.state.requestType,
                        readOnly: true,
                      }}
                  />
                </span>
              </GridItem>
              <GridItem className={classes.gridItem} xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Iban Number</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <CustomInput
                      id='iban-number'
                      formControlProps={{
                        className: clx(classes.zeroMargin)
                      }}
                      inputProps={{
                        name: 'ibanNumber',
                        value: this.state.iban,
                        onChange: (e) => this.handleCustomInputChange('iban', e.target.value),
                      }}
                  />
                </span>
              </GridItem>
            </GridContainer>
            {/* Second Line */}
            <GridContainer style={{ paddingRight: '15px'  }} className={classes.gridContainer}>
              {/* Amount Block */}
              <GridItem xs={12} sm={12} md={4} lg={4} className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Principal Amount</TableCell>
                    {/* <TableCell className={clx(classes.tableCell)}>{isProduction ? EURO(this.state.principalAmount) : */}
                    <TableCell className={clx(classes.tableCell)}>{ 
                      (
                        <CustomFormatInput
                          type="text"
                          id="principalAmount"
                          name="principalAmount"
                          numberformat={this.state.principalAmount}
                          className={classes.amountInput}
                          changeValue={(val) => this.handleCustomInputChange('principalAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Initial Fee</TableCell>
                    {/* <TableCell className={clx(classes.tableCell)}>{isProduction ? EURO(this.state.initialCostAmount) : */}
                    <TableCell className={clx(classes.tableCell)}>{ 
                      (
                        <CustomFormatInput
                          type="text"
                          id="initialCostAmount"
                          name="initialCostAmount"
                          numberformat={this.state.initialCostAmount}
                          className={classes.amountInput}
                          changeValue={(val) => this.handleCustomInputChange('initialCostAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Interest Fee</TableCell>
                    {/* <TableCell className={clx(classes.tableCell)}>{isProduction ? EURO(this.state.interestAmount) : */}
                    <TableCell className={clx(classes.tableCell)}>{ 
                      (
                        <CustomFormatInput
                          type="text"
                          id="interestAmount"
                          name="interestAmount"
                          numberformat={this.state.interestAmount}
                          className={classes.amountInput}
                          changeValue={(val) => this.handleCustomInputChange('interestAmount', val)}
                        />
                      )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell, classes.bold)}>Total</TableCell>
                    <TableCell className={clx(classes.tableCell, classes.bold)}>{EURO(this.totalLoanAmount)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Interest Block */}
              <GridItem xs={12} sm={12} md={3} lg={3} className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Interest % Base</TableCell>
                    <TableCell className={clx(classes.tableCell)}>{PERCENTAGE(this.state.interestPecentagebasePerMonth)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Interest % Surcharge</TableCell>
                    <TableCell className={clx(classes.tableCell)}>{PERCENTAGE(selectedopportunity.surcharge)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell, classes.bold)}>Interest % Total</TableCell>
                    <TableCell className={clx(classes.tableCell, classes.bold)}>{PERCENTAGE(selectedopportunity.totalInterest)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Dates Block */}
              <GridItem xs={12} sm={12} md={4} lg={4}  className={classes.block}>
                <Table><TableBody><TableRow>
                  <TableCell className={clx(classes.tableCell, classes.bold)}>Start Date Loan</TableCell>
                  <TableCell className={clx(classes.tableCell)}><CustomDatePicker label="" name="startDate" value={this.state.startDate} onChange={this.handleDatePicker} /></TableCell>
                </TableRow></TableBody></Table>
              </GridItem>
            </GridContainer>
            {/* Third Line */}
            <GridContainer className={classes.gridContainer}>
              {/* Frequency Block */}
              <GridItem xs={12} sm={12} md={3} lg={4}  className={classes.block}>
                <Table><TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Frequency</TableCell>
                    {/* <TableCell className={clx(classes.tableCell)}>{isProduction ? this.state.directDebitFrequency : */}
                    <TableCell className={clx(classes.tableCell)}>{ 
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
                    <TableCell className={clx(classes.tableCell)}>Duration</TableCell>
                    <TableCell className={clx(classes.tableCell)}>
                      {/* {selectedopportunity.durationInMonths} */}
                      <TextField
                        type="number"
                        inputProps={{
                          min: 0,
                          max: 24
                        }}
                        id="durationInMonths"
                        name="plannedNumberOfDirectDebitMonth"
                        className={classes.numberInput}
                        value={this.state.plannedNumberOfDirectDebitMonth}
                        onChange={(e) => this.handleCustomInputChange('plannedNumberOfDirectDebitMonth', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>No of DD</TableCell>
                    <TableCell className={clx(classes.tableCell)}>{
                      this.state.plannedNumberOfDirectDebit
                    }</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableCell)}>Standard DD Amount</TableCell>
                    <TableCell className={clx(classes.tableCell)}>{EURO(this.standardDdAmount)}</TableCell>
                  </TableRow>
                </TableBody></Table>
              </GridItem>
              {/* Split Direct Debit Block */}
              <GridItem xs={12} sm={12} md={8} lg={7}  className={classes.block}>
                <SplitDirectDebit
                  splitDdPeriod={this.state.splitDdPeriod}
                  plannedNoOfDD={Number(this.state.plannedNumberOfDirectDebit)}
                  totalLoanAmount={this.totalLoanAmount}
                  isChangeContract={this.state.isChangeContract}
                  onChange={this.updateSplitDD}
                  displayNotification={this.props.displayNotification}
                  handleDatePicker={this.handleDatePicker}
                />
              </GridItem>
            </GridContainer>
            <GridContainer className={classes.gridContainer}>
              <GridItem xs={12} sm={6} md={4} lg={4}>
                <span className={clx(classes.tableCell, classes.bold)}>Refinance</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <Select
                    labelId="refinancedType"
                    id="refinanced-type"
                    value={this.state.isRefinanced}
                    onChange={(e) => this.handleRefinanceState('refinancedType', e.target.value)}
                  >
                    <MenuItem value={1}>Yes</MenuItem>
                    <MenuItem value={0}>No</MenuItem>
                  </Select>
                </span>
              </GridItem>
              <GridItem style={{ margin: '0 0 0 15px'  }} xs={12} sm={6} md={7} lg={7}>
                <span className={clx(classes.tableCell, classes.bold)}>Refinanced-Contract</span>
                <span className={clx(classes.tableCell, classes.marginLeft)}>
                  <TextField
                    InputProps={{
                      readOnly: this.state.isRefinanced === 1 ? false : true,
                    }}
                    id="refinanced-contract"
                    onChange={this.handleRefinanceContractName}
                    className={classes.margin_5}
                    value={this.state.refinancedLoan} />
                </span>
              </GridItem>
            </GridContainer>

        <div style={{ margin : '15 0 0 0' }} className={classes.requestButton} >
        {this.state.isLoadingFixedLoanRequest && <CircularProgress size={22}/>}
          <Button className={classes.gridItem} color="danger" size="sm" disabled={this.state.isLoadingFixedLoanRequest} onClick={this.props.onClose} >Cancel</Button>
          {(isUserHasPermission("Loan request overview", ["Add", "Edit"])) ?
            <Button  style={{ margin : '0 0 0 15px' }} className={classes.gridItem} color="info" size="sm" 
            disabled={this.state.isLoadingFixedLoanRequest} onClick={this.createSmeLoanRequest}>Process</Button>
            // <Button  style={{ margin : '0 0 0 15px' }} className={classes.gridItem} color="info" size="sm" 
            // disabled={this.state.isLoadingFixedLoanRequest} onClick={this.redirectToContractOverview}>Process</Button>
            :
            null
          }
        </div>
      </div>
    );
  }
}

LoanRequest.propTypes = {
  classes: PropTypes.object,
  smeId: PropTypes.string,
  toggleDrawer: PropTypes.func,
  getNextWorkingDate: PropTypes.func,
  displayNotification: PropTypes.func,
  onClose: PropTypes.func,
  loanRequestList: PropTypes.array,
  selectedLoanRequest: PropTypes.object,
  processLoanRequest: PropTypes.func,
  simulations: PropTypes.object.isRequired,
  importLoanRequest: PropTypes.func,
  importedLoanRequestContractId: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  setNavigationInDashboards: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    isDashboardContent: state.user.isDashboardContent,
    loanRequestList: state.loanRequest.loanRequestList,
    simulations: state.config.simulations,
    importedLoanRequestContractId: state.lmglobal.importedLoanRequestContractId
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLoanRequest: (requestObj) => dispatch(processLoanRequest(requestObj)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    getNextWorkingDate: (startDate, noOfDaysAhead) => (dispatch(getNextWorkingDate(startDate, noOfDaysAhead))),
    importLoanRequest: (key, contractId) => dispatch(importLoanRequest(key, contractId)),
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(LoanRequest));
