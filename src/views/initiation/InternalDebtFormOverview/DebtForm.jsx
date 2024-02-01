/* cSpell: ignore Iban */
import React, { Component } from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import withStyles from '@material-ui/core/styles/withStyles';

import { Card, Button, Dialog, DialogContent, TableContainer, Table, TableHead, TableRow, Paper, TableBody, Typography, TextField, DialogActions, DialogTitle, DialogContentText, InputAdornment } from '@material-ui/core';
import CardBody from 'components/initiation/Card/CardBody';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';

import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import { importDebtsAndDebitorsCreditors, updateDebtAtThirdParty, updateDebitorsCreditors, imporRequestId } from 'store/initiation/actions/DebtFormOverview';
import { getFieldNameValues } from 'store/initiation/actions/Configuration.action';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { LoanTypes, CollateralIndicator, BankruptIndicator } from 'constants/initiation/debt-form';
import moment from 'moment';
import Notifier from 'components/initiation/Notification/Notifier';
import { displayNotification } from 'store/initiation/actions/Notifier';
import { currencyConverter } from "lib/initiation/utility";
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';
import CustomFormatInput from 'components/initiation/CustomFormatInput/CustomFormatInput';

import MuiTableCell from "@material-ui/core/TableCell";
import { AddCircle } from '@material-ui/icons';

const TableCell = withStyles({
  root: {
    borderBottom: "none",
    //padding: '5px'
  }
})(MuiTableCell);

const EURO = currencyConverter();

const PARTY_NAME_LOANS = 'party-names-loans';
const PART_NAME_LEASE_CONTRACT = 'party-names-lease-contracts';
const PARTY_NAME_PAYMENT_BACKLOG = 'party-names-payment-backlogs';
const TYPE_OF_LEASE_OBJECT = 'type-of-lease-objects';

const loanOptions = LoanTypes.filter((x) => x === 'loan' || x === 'current-account-credit' || x === 'personal-relationship' || x === 'supplier-credit' || x === 'mortgage' || x === 'other-loans');
const paymentBacklogOptions = LoanTypes.filter((x) => x === 'tax-payment-overdue' || x === 'debt-collector' || x === 'collection-agency' || x === 'government-payment-arrangement');

class DebtForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showAddItemDrower: false,
      showAddDebtorCreditor: false,
      requestId: "",
      requestContractId: this.props.isDashboardContent ? this.props.overviewData && this.props.overviewData.contractId : this.props.requestContractId,
      tableType: '',
      thirdPartyType: '',
      debtorCreditors: [],
      debtAtThirdParties: [],
      partyName: '',
      debtType: '',
      debtsAtThirdPartyId: '',
      otherPartyName: '',
      objectType: '',
      description: '',
      initialDebtAmount: 0,
      outstandingDebtAmount: 0,
      repaymentAmountPerMonth: '',
      debtEndDate: '',
      collateralIndicator: 'yes',
      id: '',
      dcPartyName: '',
      dcOutstandingInvoiceAmount: '',
      dctotalOutstanding: '',
      dcPartiesInvolved: '',
      dcDebtorsCreditorsList: {},
      deleteConfermation: false,
      selectedRow: '',
      selectedAction: '',
      deleteType: '',
      modalTitle: '',
      buttonDisabled: false,
      bankruptIndicator: 'no',
      bankruptCompanyName: '',
      editDisable: false,
      partyFields: [],
      objectTypes: []
    };
  }

  componentDidMount() {
    this.getRequestId();
  }

  getRequestId = async () => {
    this.setState({ buttonDisabled: true });
    return await this.props.imporRequestId({
      contractId: this.props.overviewData && this.props.overviewData.contractId
    })
      .then((response) => {
        if ('success' in response) {
          this.setState({ buttonDisabled: false });
          this.props.displayNotification(response.message, 'error');
        }
        this.setState({ requestId: response.id }, () => {
          this.getInitialDebtData();
        });
      })
      .catch((error) => {
        this.setState({ buttonDisabled: false });
        this.props.displayNotification("Debt at third party not found", 'error');
        throw Error(error);

      });

  }
  getInitialDebtData = () => {
    this.props.importDebtsAndDebitorsCreditors({
      requestId: this.state.requestId,
      requestContractId: this.props.overviewData && this.props.overviewData.contractId
    })
      .then((response) => {
        if ('success' in response) {
          this.setState({ buttonDisabled: false });
          this.props.displayNotification(response.message, 'error');
        }
        this.setState({ debtorCreditors: response.perDebtorCreditor, debtAtThirdParties: response.preDebtsAtThirdParty, buttonDisabled: false, bankruptIndicator: response.bankruptIndicator, bankruptCompanyName: response.bankruptCompanyName });
      })
      .catch((error) => {
        this.setState({ buttonDisabled: false });
        this.props.displayNotification("Debt at third party not found", 'error');
        throw Error(error);
      });
  }

  //debt at third party
  handleAddDebtatThirdParty = (type, option) => {
    this.clearState();
    this.handleModalTitle(type, option);
    this.handlePartyType(type);
    this.handleDebtType(type);
    this.handleObjectType(type);
    this.setState({ thirdPartyType: type, selectedAction: option, showAddItemDrower: !this.state.showAddItemDrower });
  }

  handleCollateralIndicator = () => {

    if (this.state.debtType === 'personal-relationship') {
      this.setState({ collateralIndicator: 'no' });
    }
    this.setState({ collateralIndicator: 'yes' });
  }

  handleSaveDebtAtThirdParty = () => {

    const requestObject = {
      action: this.state.selectedAction,
      smeLoanRequestId: this.state.requestId,
      contractId: this.state.requestContractId,
      bankruptIndicator: this.state.bankruptIndicator,
      bankruptCompanyName: this.state.bankruptCompanyName,
      partyName: this.state.partyName,
      otherPartyName: this.state.otherPartyName,
      debtType: this.state.debtType,
      typeOfObject: this.state.objectType,
      description: this.state.description,
      totalInitialDebtAmount: Number(this.state.initialDebtAmount),
      outstandingDebtAmount: Number(this.state.outstandingDebtAmount),
      repaymentAmountPerMonth: Number(this.state.repaymentAmountPerMonth),
      //debtEndDate: this.state.debtEndDate,
      collateralIndicator: this.state.collateralIndicator,
      id: this.state.selectedAction === "update" ? this.state.id : ''
    };

    this.props.updateDebtAtThirdParty({ debtAtThirdParty: requestObject })
      .then((response) => {
        if ('success' in response) {
          this.props.displayNotification('Error Adding Data', 'error');
        }
        else {
          this.getInitialDebtData();
          this.props.displayNotification('Debt At Third Party Added successfully', 'success');
          this.setState({ showAddItemDrower: false });
        }
      });
  }
  editDebtAtThirdParty = (action, id, type) => {

    const editObject = this.state.debtAtThirdParties.filter(item => item.id === id)[0];

    this.handleModalTitle(type, action);

    this.setState({
      debtsAtThirdPartyId: editObject.debtsAtThirdPartyId,
      partyName: editObject.partyName,
      otherPartyName: editObject.otherPartyName,
      debtType: editObject.debtType,
      objectType: editObject.typeOfObject,
      description: editObject.description,
      initialDebtAmount: editObject.totalInitialDebtAmount,
      outstandingDebtAmount: editObject.outstandingDebtAmount,
      repaymentAmountPerMonth: editObject.repaymentAmountPerMonth,
      debtEndDate: editObject.debtEndDate,
      id: id,
      editDisable: true,
      bankruptIndicator: this.state.bankruptIndicator,
      bankruptCompanyName: this.state.bankruptCompanyName,
      collateralIndicator: editObject.collateralIndicator
    });

    this.setState({ thirdPartyType: type, selectedAction: action, showAddItemDrower: !this.state.showAddItemDrower });

  }
  deleteDebtAtThirdParty = () => {

    const requestObject = {
      action: 'delete',
      id: this.state.selectedRow,

    };
    this.props.updateDebtAtThirdParty({ debtAtThirdParty: requestObject })
      .then(() => {
        this.getInitialDebtData();
      })
      .finally(() => {
        this.setState({ deleteConfermation: false });
      });

  };

  handlePartyType = (type) => {

    // eslint-disable-next-line no-nested-ternary
    const field = (type === 'loan') ? PARTY_NAME_LOANS : (type === 'lease-contract') ? PART_NAME_LEASE_CONTRACT : PARTY_NAME_PAYMENT_BACKLOG;

    //this.handleFieldNameValues(field);
    const reqObj = {
      fieldName: field,
      parentFieldName: "",
      parentFieldNameValue: "",
      activeIndicator: ""
    };

    this.props.getFieldNameValues(reqObj)
      .then((response) => {
        if (Array.isArray(response)) {
          if (response.length > 0) {

            const activeFields = response.filter(function (el) {
              return el.activeIndicator === 'YES';
            });
            const fields = activeFields.map(item => item.fieldNameValue);
            fields.push(fields.splice(fields.indexOf('Others'), 1).pop());
            this.setState({ partyFields: fields });
          }
        }

      });

  }

  handleDebtType = (type) => {

    if (type === 'loan' || type === 'payments_overdue') {
      this.setState({ debtType: '' });
    }
    else {
      // eslint-disable-next-line default-case
      switch (type) {
        case 'lease-contract': {
          return this.setState({ debtType: 'lease-contract' });
        }
        // case 'payments_overdue': {
        //   return this.setState({ debtType: 'payments_overdue' });
        // }
        case 'tax-payment-overdue': {
          return this.setState({ debtType: 'tax-payment' });
        }
      }
    }
  }
  handleObjectType = (type) => {
    if (type !== 'lease-contract') {
      this.setState({ objectType: '' });
    }

    const field = TYPE_OF_LEASE_OBJECT;

    const reqObj = {
      fieldName: field,
      parentFieldName: "",
      parentFieldNameValue: "",
      activeIndicator: ""
    };

    this.props.getFieldNameValues(reqObj)
      .then((response) => {
        if (Array.isArray(response)) {
          if (response.length > 0) {
            const activeFields = response.filter(function (el) {
              return el.activeIndicator === 'YES';
            });
            const objFields = activeFields.map(item => item.fieldNameValue);
            objFields.push(objFields.splice(objFields.indexOf('Others'), 1).pop());
            this.setState({ objectTypes: objFields });
          }
        }
      });


  }
  handleDatePickers = date => {

    if (moment(date).isValid()) {
      this.setState({ debtEndDate: date });
    }
  }


  //debitor creditor
  handleAddDebtorCreditor = (type, action) => {
    this.handleDebitorModalTitle(type, action);
    this.clearState();
    this.setState({ tableType: type, showAddDebtorCreditor: !this.state.showAddDebtorCreditor, selectedAction: action });

  }
  handleSaveDebtorAndCreditor = () => {

    // const isDebtorCreditorAvailable = this.state.debtorCreditors.some(item => (item.partyName === 'debtors-overview' && this.state.selectedAction === "create" && this.state.partyName === "debtors-overview")|| (item.partyName === 'creditors-overview' && this.state.selectedAction === "create" && this.state.partyName === "creditors-overview"));

    const filteredData = this.state.debtorCreditors.filter(item => item.partyName === this.state.dcPartyName);

    if (filteredData && filteredData.length !== 0 && this.state.selectedAction === "create") return this.props.displayNotification('Party type already exists', 'warning');
    if (this.state.tableType === "debitor" && this.state.dcPartyName === "creditors-overview") return this.props.displayNotification('Can only add debtors party types', 'warning');
    if (this.state.tableType === "creditor" && this.state.dcPartyName === "debtors-overview") return this.props.displayNotification('Can only add creditors party types', 'warning');

    const requestObject = {
      action: this.state.selectedAction,
      smeLoanRequestId: this.state.requestId,
      contractId: this.state.requestContractId,
      debitorCreditorIndicator: this.state.tableType,
      partyName: this.state.dcPartyName,
      outstandingInvoiceAmount: Number(this.state.dcOutstandingInvoiceAmount),
      totalOutstanding: Number(this.state.dctotalOutstanding),
      numberOfPartiesInvolved: Number(this.state.dcPartiesInvolved),
      id: this.state.selectedAction === "update" ? this.state.id : '',
      debtorsCreditorsList: this.state.dcDebtorsCreditorsList
    };
    this.props.updateDebitorsCreditors({ debtorCreditor: requestObject })
      .then((response) => {
        if ('success' in response) {
          this.props.displayNotification('Error Adding Data', 'error');
        }
        else {
          this.getInitialDebtData();
          this.props.displayNotification('Deibtor Creditor Added successfully', 'success');
          this.setState({ showAddDebtorCreditor: false });
        }
      });

  }

  editDebitorsCreditors = (action, id, type) => {
    this.handleDebitorModalTitle(type, action);
    const editObject = this.state.debtorCreditors.filter(item => item.id === id)[0];

    this.setState({
      debtsAtThirdPartyId: editObject.debtsAtThirdPartyId,
      dcPartyName: editObject.partyName,
      dcOutstandingInvoiceAmount: editObject.outstandingInvoiceAmount,
      dctotalOutstanding: editObject.totalOutstanding,
      dcPartiesInvolved: editObject.numberOfPartiesInvolved,
      dcDebtorsCreditorsList: editObject.debtorsCreditorsList,
      tableType: editObject.debitorCreditorIndicator,
      id: id
    });

    this.setState({ tableType: type, editDisable: true, showAddDebtorCreditor: !this.state.showAddDebtorCreditor, selectedAction: action });
  }

  deleteDebitorsCreditors = () => {

    const requestObject = {
      action: 'delete',
      id: this.state.selectedRow,

    };
    this.props.updateDebitorsCreditors({ debtorCreditor: requestObject })
      .then(() => {
        this.getInitialDebtData();
      })
      .finally(() => {
        this.setState({ deleteConfermation: false });
      });

    // this.getInitialDebtData();
  }

  handleProcessDataChanges = (event) => {
    console.log(event.target.value);
  }
  handleDeletePopup = (type, id) => {
    this.setState({ deleteConfermation: !this.state.deleteConfermation, selectedRow: id, deleteType: type });
  }

  handleModalTitle = (type, option) => {

    const action = option === 'create' ? 'Add' : 'Update';
    switch (type) {
      case 'loan': {
        return this.setState({ modalTitle: action + ' Loan' });
      }
      case 'lease-contract': {
        return this.setState({ modalTitle: action + ' Lease Contract' });
      }
      case 'payments_overdue': {
        return this.setState({ modalTitle: action + ' Payments Overdue' });
      }
      case 'tax-payment-overdue': {
        return this.setState({ modalTitle: action + ' Tax Payment Overdue' });
      }
    }

  }

  handleDebitorModalTitle = (type, option) => {

    const action = option === 'create' ? 'Add' : 'Update';

    if (type === 'debitor') {
      this.setState({ modalTitle: action + ' Debtor' });
    }
    else {
      this.setState({ modalTitle: action + ' Creditor' });
    }

  }

  clearState = () => {
    this.setState({
      partyName: '',
      debtType: '',
      debtsAtThirdPartyId: '',
      otherPartyName: '',
      objectType: '',
      description: '',
      initialDebtAmount: '',
      outstandingDebtAmount: '',
      repaymentAmountPerMonth: '',
      debtEndDate: '',
      collateralIndicator: 'yes',
      id: '',
      dcPartyName: '',
      dcOutstandingInvoiceAmount: '',
      dctotalOutstanding: '',
      dcPartiesInvolved: '',
      dcDebtorsCreditorsList: {},
      editDisable: false,
      partyFields: [],
      objectTypes: []
    });
  }

  handleCustomInputChange = (name, value) => {
    const _state = { [name]: value };

    this.setState(_state);
  };

  render() {
    const { classes, origin, customerLegalName } = this.props;

    const inputClasses = {
      classes: {
        input: classes.input,
        disabled: classes.disabled,
      }
    };

    // const partyTypeForTaxtPayment = partyFields && partyFields.length === 0 ? [] : partyFields.filter(name => name === "Belastingdienst");

    return (
      <div>
        <Notifier />
        {/* {origin === "ADMIN" ? <h3>Debt Overview</h3> : false} */}

        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.indicatorBox}>
            <TextField    
              label="Customer"
              fullWidth={true}
              variant="outlined"
              id="Customer"
              value={this.props.customer ? this.props.customer.legalName : ''}
              InputProps={{
                className: classes.inputProp,
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
              error={ this.state.bankruptIndicator === "yes" }
            />
          </GridItem>
          <GridItem className={classes.indicatorBox}>
            <TextField
              error={ this.state.bankruptIndicator === "yes" }
              label="Contract"
              fullWidth={true}
              variant="outlined"
              id="Contract"
              value={this.props.overviewData.contractId}
              InputProps={{
                className: classes.inputProp,
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
            />
          </GridItem>
            { this.state.bankruptIndicator == "yes" 
              ?  
              <GridItem className={classes.indicatorBox}  >
                <TextField
                  label="bankcruptcy"
                  variant="outlined"
                  fullWidth={true}
                  id="bankcruptcy"
                  style={{background: '#FFAEBC' , borderRadius: "4px"}}
                  value={this.state.bankruptIndicator}
                  InputProps={{
                    className: classes.inputProp,
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: classes.inputLabel
                  }}
                  error={this.state.bankruptIndicator === "yes"}
                />
              </GridItem>
              :
              <GridItem className={classes.indicatorBox} >
                <TextField
                  label="bankcruptcy"
                  variant="outlined"
                  fullWidth={true}
                  id="bankcruptcy"

                  value={this.state.bankruptIndicator}
                  InputProps={{
                    className: classes.inputProp,
                                    }}
                  InputLabelProps={{
                    shrink: true,
                    className: classes.inputLabel
                  }}
                  error={this.state.bankruptIndicator === "yes"}
                />
              </GridItem>
          }
            
          <GridItem className={classes.indicatorBox}>            
            <TextField
              label="Name Bankrupt Company"
              variant="outlined"
              fullWidth={true}
              id="bankruptCompany"
              value={this.state.bankruptCompanyName}
              InputProps={{
                className: classes.inputProp,
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
              error={ this.state.bankruptIndicator === "yes" }
            />
          </GridItem>
        </GridContainer>

        <GridContainer>

          <GridItem xs={12} sm={12} md={12} className={classes.sectionDevider}>
            <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Loans with Third Parties</Typography>
              <Button
                variant='contained'
                startIcon={<AddCircle />}
                className={`${classes.floatRight} ${classes.addIconButton}`}
                onClick={() => this.handleAddDebtatThirdParty('loan', 'create')}
              >Add New</Button>
            </div>
            <TableContainer component={Paper} >
              <Table className={classes.table} aria-label="simple table" >
                <TableHead className={classes.tableHeadColor}>
                  <TableRow >
                    <TableCell className={classes.tableCell}>Action</TableCell>
                    <TableCell className={classes.tableCell}>Type of Debt</TableCell>
                    <TableCell className={classes.tableCell}>Party-Name</TableCell>
                    <TableCell className={classes.tableCell} align="right">Initial Amount </TableCell>
                    <TableCell className={classes.tableCell} align="right">Outstanding </TableCell>
                    <TableCell className={classes.tableCell} align="right">Monthly Payment </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.debtAtThirdParties === undefined || this.state.debtAtThirdParties.length === 0 ? '' : this.state.debtAtThirdParties.map((row) => (
                    <React.Fragment key={row.id}>
                      { row.debtType === "loan" || row.debtType === "current-account-credit" || row.debtType === "personal-relationship" || row.debtType === "supplier-credit" || row.debtType === "mortgage" || row.debtType === "other-loans" ? 
                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell} style={{ display: 'flex' }}>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.editDebtAtThirdParty('update', row.id , 'loan')} /></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.handleDeletePopup('deleteThirdParty', row.id)} /></div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.debtType != null ? row.debtType : ""}</TableCell>
                        <TableCell className={classes.tableCell}>{row.partyName === "Others" ? row.otherPartyName : row.partyName}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.totalInitialDebtAmount != null ? EURO(row.totalInitialDebtAmount) : 0}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.outstandingDebtAmount != null ? EURO(row.outstandingDebtAmount) : 0}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.repaymentAmountPerMonth != null ? EURO(row.repaymentAmountPerMonth) : 0}</TableCell>
                      </TableRow> : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={12} className={classes.sectionDevider}>
            <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Lease-Contacts</Typography>
              <Button
                variant='contained'
                startIcon={<AddCircle />}
                className={`${classes.floatRight} ${classes.addIconButton}`}
                onClick={() => this.handleAddDebtatThirdParty('lease-contract', 'create')}
              >Add New</Button>
            </div>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead className={classes.tableHeadColor}>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Action</TableCell>
                    <TableCell className={classes.tableCell}>Party-Name</TableCell>
                    <TableCell className={classes.tableCell}>Type-of-Object</TableCell>
                    <TableCell className={classes.tableCell}>Description  </TableCell>
                    <TableCell className={classes.tableCell} align="right">Initial Amount </TableCell>
                    <TableCell className={classes.tableCell} align="right">Outstanding  </TableCell>
                    <TableCell className={classes.tableCell} align="right">Monthly-Payment </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.debtAtThirdParties === undefined || this.state.debtAtThirdParties.length === 0 ? '' : this.state.debtAtThirdParties.map((row) => (
                    <React.Fragment key={row.id}>
                      {row.debtType === "lease-contract" ? <TableRow key={row.id}>
                        <TableCell className={classes.tableCell} style={{ display: 'flex' }}>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.editDebtAtThirdParty('update', row.id, 'lease-contract')} /></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.handleDeletePopup('deleteThirdParty', row.id)} /></div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.partyName === "Others" ? row.otherPartyName : row.partyName}</TableCell>
                        <TableCell className={classes.tableCell}>{row.typeOfObject != null ? row.typeOfObject : ""}</TableCell>
                        <TableCell className={classes.tableCell}>{row.description != null ? row.description : ""}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.totalInitialDebtAmount != null ? EURO(row.totalInitialDebtAmount) : 0}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.outstandingDebtAmount != null ? EURO(row.outstandingDebtAmount) : 0}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.repaymentAmountPerMonth != null ? EURO(row.repaymentAmountPerMonth) : 0}</TableCell>
                      </TableRow> : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={12} className={classes.sectionDevider}>
            <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Pay Backlog or Arrangements</Typography>
              <Button
                variant='contained'
                startIcon={<AddCircle />}
                className={`${classes.floatRight} ${classes.addIconButton}`}
                onClick={() => this.handleAddDebtatThirdParty('payments_overdue', 'create')}
              >Add New</Button>
            </div>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead className={classes.tableHeadColor}>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Action</TableCell>
                    <TableCell className={classes.tableCell}>Type-of-Debt</TableCell>
                    <TableCell className={classes.tableCell}>Party-Name</TableCell>
                    <TableCell className={classes.tableCell} align="right">Initial Amount </TableCell>
                    <TableCell className={classes.tableCell} align="right">Outstanding </TableCell>
                    <TableCell className={classes.tableCell} align="right">Monthly-Payment </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.debtAtThirdParties === undefined || this.state.debtAtThirdParties.length === 0 ? '' : this.state.debtAtThirdParties.map((row) => (
                    <React.Fragment key={row.id}>
                      {row.debtType === "collection-agency" || row.debtType === "tax-payment-overdue" || row.debtType === "debt-collector" || row.debtType === "government-payment-arrangement" ? <TableRow key={row.id}>
                        <TableCell className={classes.tableCell} style={{ display: 'flex' }}>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.editDebtAtThirdParty('update', row.id, 'payments_overdue')} /></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.handleDeletePopup('deleteThirdParty', row.id)} /></div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.debtType != null ? row.debtType : ""}</TableCell>
                        <TableCell className={classes.tableCell}>{row.partyName === "Others" ? row.otherPartyName : row.partyName}</TableCell>
                        {/* <TableCell>{row.description != null ? row.description : ""}</TableCell> */}
                        <TableCell className={classes.tableCell} align="right">{row.totalInitialDebtAmount != null ? EURO(row.totalInitialDebtAmount) : ""}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.outstandingDebtAmount != null ? EURO(row.outstandingDebtAmount) : 0}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.repaymentAmountPerMonth != null ? EURO(row.repaymentAmountPerMonth) : 0}</TableCell>
                      </TableRow> : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={8} className={classes.sectionDevider}>
            <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Outstanding Debtors</Typography>
              <Button
                variant='contained'
                startIcon={<AddCircle />}
                className={`${classes.floatRight} ${classes.addIconButton}`}
                onClick={() => this.handleAddDebtorCreditor('debitor', 'create')}
              >Add New</Button>
            </div>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead className={classes.tableHeadColor}>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Action</TableCell>
                    <TableCell className={classes.tableCell}>Party-Name</TableCell>
                    <TableCell className={classes.tableCell} align="right">Outstanding </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => (
                    <React.Fragment key={row.id}>
                      {row.debitorCreditorIndicator === "debitor" ? <TableRow key={row.id}>
                        <TableCell className={classes.tableCell} style={{ display: 'flex' }}>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.editDebitorsCreditors('update', row.id, 'debitor')} /></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.handleDeletePopup('deleteDebitorCreditor', row.id)} /></div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.partyName != null ? row.partyName : ""}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.partyName === "debtors-overview" ? EURO(row.totalOutstanding) : EURO(row.outstandingInvoiceAmount)}</TableCell>
                      </TableRow> : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={8} className={classes.sectionDevider}>
            {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => row.partyName === "debtors-overview" ? <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Debtors List </Typography>
            </div> : '')}

            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableBody>

                  {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => row.partyName === "debtors-overview" ?
                    <React.Fragment key={row.id}>
                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Upload file</TableCell>
                        <TableCell className={classes.tableCell}>
                          <a href={row.debtorsCreditorsList != null ? row.debtorsCreditorsList.dataUrl : ''} download>{row.debtorsCreditorsList != null ? row.debtorsCreditorsList.fileName : ''}</a>
                        </TableCell>
                      </TableRow>

                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Total Outstanding Amount</TableCell>
                        <TableCell className={classes.tableCell}>{row.totalOutstanding != null ? EURO(row.totalOutstanding) : ""}</TableCell>
                      </TableRow>
                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Number of Debtors Involved</TableCell>
                        <TableCell className={classes.tableCell}>{row.numberOfPartiesInvolved != null ? row.numberOfPartiesInvolved : ""}</TableCell>
                      </TableRow>
                    </React.Fragment>
                    : '')}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={8} className={classes.sectionDevider}>
            <div className={classes.debtTableHeaders}>
              <Typography id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Outstanding Creditors </Typography>
              <Button
                variant='contained'
                startIcon={<AddCircle />}
                className={`${classes.floatRight} ${classes.addIconButton}`}
                onClick={() => this.handleAddDebtorCreditor('creditor', 'create')}
              >Add New</Button>
            </div>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead className={classes.tableHeadColor}>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Action</TableCell>
                    <TableCell className={classes.tableCell}>Party-Name </TableCell>
                    <TableCell className={classes.tableCell} align="right">Outstanding</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => (
                    <React.Fragment key={row.id}>
                      {row.debitorCreditorIndicator === "creditor" ? <TableRow key={row.id}>
                        <TableCell className={classes.tableCell} style={{ display: 'flex' }}>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.editDebitorsCreditors('update', row.id, 'creditor')} /></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.handleDeletePopup('deleteDebitorCreditor', row.id)} /></div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.partyName != null ? row.partyName : ""}</TableCell>
                        <TableCell className={classes.tableCell} align="right">{row.partyName === "creditors-overview" ? EURO(row.totalOutstanding) : EURO(row.outstandingInvoiceAmount)}</TableCell>
                      </TableRow> : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

          <GridItem xs={12} sm={12} md={8} className={classes.sectionDevider}>
            {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => row.partyName === "creditors-overview" ? <div className={classes.debtTableHeaders}>
              <Typography variant="h6" id="tableTitle" component="div" className={classes.debtTableHeaderLabel}>Creditors List </Typography>
            </div> : '')}

            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableBody>
                  {this.state.debtorCreditors === undefined || this.state.debtorCreditors.length === 0 ? '' : this.state.debtorCreditors.map((row) => row.partyName === "creditors-overview" ?
                    <React.Fragment key={row.id}>
                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Upload file</TableCell>

                        <TableCell className={classes.tableCell}>
                          <a href={row.debtorsCreditorsList != null ? row.debtorsCreditorsList.dataUrl : ''} download>{row.debtorsCreditorsList != null ? row.debtorsCreditorsList.fileName : ''}</a>
                        </TableCell>

                      </TableRow>

                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Total Outstanding Amount</TableCell>
                        <TableCell className={classes.tableCell}>{row.totalOutstanding != null ? EURO(row.totalOutstanding) : ""}</TableCell>
                      </TableRow>
                      <TableRow key={row.id}>
                        <TableCell className={classes.tableCell}>Number of Creditors Involved</TableCell>
                        <TableCell className={classes.tableCell}>{row.numberOfPartiesInvolved != null ? row.numberOfPartiesInvolved : ""}</TableCell>
                      </TableRow>
                    </React.Fragment>
                    : '')}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>

        </GridContainer>

        <Dialog
          fullWidth
          maxWidth={'lg'}
          open={this.state.showAddItemDrower}
          onClose={() => this.handleAddDebtatThirdParty()}
          style={{ margin: 0 }}
        >
          <DialogTitle id="add-debt-form-title">{this.state.modalTitle}</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table aria-label="Debt At Third Party table">
                <TableBody>
                  <TableRow>
                    <TableCell className={`${classes.width_20} ${classes.fontWeight_600}`}>Contract</TableCell>
                    <TableCell align="left">
                      <TextField
                        //variant="outlined"
                        fullWidth={true}
                        id="contractId"
                        onChange={(event) => this.handleProcessDataChanges(event)}
                        value={this.state.requestContractId}
                        disabled={true}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Debt Type</TableCell>
                    <TableCell align="left">
                      {this.state.thirdPartyType === 'loan' || this.state.thirdPartyType === 'payments_overdue' ? <Autocomplete
                        value={this.state.debtType}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            this.setState({ debtType: newValue, partyName: newValue === 'tax-payment-overdue' ? 'Belastingdienst' : '' }, () => this.handleCollateralIndicator());
                          }
                        }}
                        id="debtType"
                        options={this.state.thirdPartyType === 'loan' ? loanOptions : paymentBacklogOptions}
                        renderInput={(params) => (
                          <TextField {...params}
                          //variant="outlined"
                          />
                        )}
                      /> : <TextField
                        //variant="outlined"
                        fullWidth={true}
                        id="debtType"
                        onChange={(event) => this.handleProcessDataChanges(event)}
                        value={this.state.debtType}
                        InputProps={inputClasses} />}
                    </TableCell>

                    {this.state.debtType === 'lease-contract' ?
                      <TableCell className={classes.fontWeight_600}>Object Type</TableCell>
                      : null}

                    {this.state.debtType === 'lease-contract' ?
                      <TableCell align="left">
                        <Autocomplete
                          value={this.state.objectType}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              this.setState({ objectType: newValue });
                            }
                          }}
                          id="objectTypes"
                          options={this.state.objectTypes}
                          renderInput={(params) => (
                            <TextField {...params} />
                          )}
                        />
                      </TableCell> : null}


                  </TableRow>

                  {this.state.debtType === 'lease-contract' ?
                    <TableRow >
                      <TableCell className={classes.fontWeight_600}></TableCell>
                      <TableCell align="left">

                      </TableCell>
                      <TableCell className={classes.fontWeight_600}>Description</TableCell>
                      <TableCell align="left">
                        <TextField
                          fullWidth={true}
                          id="description"
                          defaultValue={this.state.description}
                          onChange={event => {
                            const { value } = event.target;
                            this.setState({ description: value });
                          }}
                          InputProps={inputClasses} />
                      </TableCell>
                    </TableRow> : null}

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Party Name</TableCell>
                    <TableCell align="left">
                      {this.state.debtType === 'tax-payment-overdue' ?
                        <TextField
                          fullWidth={true}
                          type="text"
                          id="partynames"
                          defaultValue={this.state.partyName}
                          inputProps={
                            { readOnly: true, }
                          } /> : <Autocomplete
                          value={this.state.partyName}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              this.setState({ partyName: newValue });
                            }
                          }}
                          id="partynames"
                          options={this.state.partyFields}
                          renderInput={(params) => (
                            <TextField {...params}
                            //variant="outlined" 
                            />
                          )}
                        />}
                    </TableCell>

                    {this.state.partyName === 'Others' ?
                      <TableCell className={classes.fontWeight_600}>Others</TableCell> : null}
                    {this.state.partyName === 'Others' ?
                      <TableCell align="left">
                        <TextField
                          //variant="outlined"
                          fullWidth={true}
                          id="partynames"
                          // label="Others"
                          defaultValue={this.state.otherPartyName}
                          onChange={event => {
                            const { value } = event.target;
                            this.setState({ otherPartyName: value });
                          }}
                          InputProps={inputClasses} />
                      </TableCell> : null}
                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Collateral</TableCell>
                    <TableCell align="left">
                      {this.state.partyName === 'personal-relationship' ? <TextField
                        fullWidth={true}
                        id="collateralIndicator"
                        defaultValue={this.state.collateralIndicator}
                        disabled={true}
                        InputProps={inputClasses} /> : <Autocomplete
                        value={this.state.collateralIndicator}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            this.setState({ collateralIndicator: newValue });
                          }
                        }}
                        id="collateralIndicator"
                        options={CollateralIndicator}
                        renderInput={(params) => (
                          <TextField {...params}
                          //variant="outlined"
                          />
                        )}
                      />}

                    </TableCell>

                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Initial Amount</TableCell>
                    <TableCell align="left">
                      <CustomFormatInput
                        type="text"
                        id="initialDebtAmount"
                        name="initialDebtAmount"
                        numberformat={this.state.initialDebtAmount}
                        className={classes.amountInput}
                        changeValue={(val) => this.handleCustomInputChange('initialDebtAmount', val)}
                        formControlProps={{
                          fullWidth: true
                        }}
                      />
                    </TableCell>

                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Outstanding</TableCell>
                    <TableCell align="left">
                      <CustomFormatInput
                        type="text"
                        id="outstandingDebtAmount"
                        name="outstandingDebtAmount"
                        numberformat={this.state.outstandingDebtAmount}
                        className={classes.amountInput}
                        changeValue={(val) => this.handleCustomInputChange('outstandingDebtAmount', val)}
                        formControlProps={{
                          fullWidth: true
                        }}
                      />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Monthly-Payment</TableCell>
                    <TableCell align="left">
                      <CustomFormatInput
                        type="text"
                        id="repaymentAmountPerMonth"
                        name="repaymentAmountPerMonth"
                        numberformat={this.state.repaymentAmountPerMonth}
                        className={classes.amountInput}
                        changeValue={(val) => this.handleCustomInputChange('repaymentAmountPerMonth', val)}
                        formControlProps={{
                          fullWidth: true
                        }}
                      />
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ showAddItemDrower: false }); }} className={classes.popupCloseButton}>Cancel</Button>
            {
              <Button onClick={this.handleSaveDebtAtThirdParty} className={classes.popupAddButton}>{this.state.selectedAction === 'create' ? 'Create' : 'Update'}</Button>
            }
          </DialogActions>
        </Dialog>

        <Dialog
          fullWidth
          maxWidth={'lg'}
          open={this.state.showAddDebtorCreditor}
          onClose={() => this.handleAddDebtorCreditor()}
          style={{ margin: 0 }}
        >
          <DialogTitle id="add-debt-form-title">{this.state.modalTitle}</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table aria-label="Debtor-Creditor table">
                <TableBody>

                  <TableRow>
                    <TableCell className={classes.fontWeight_600}>Party Name</TableCell>
                    <TableCell align="left">
                      <TextField
                        fullWidth={true}
                        id="dcpartyName"
                        defaultValue={this.state.dcPartyName}
                        onChange={event => {
                          const { value } = event.target;
                          this.setState({ dcPartyName: value });
                        }}
                        InputProps={inputClasses} />
                    </TableCell>

                    {this.state.dcPartyName === "creditors-overview" || this.state.dcPartyName === "debtors-overview" ? <TableCell>&nbsp;</TableCell> : <TableCell className={classes.fontWeight_600}>Amount</TableCell>}
                    {this.state.dcPartyName === "creditors-overview" || this.state.dcPartyName === "debtors-overview" ? <TableCell>&nbsp;</TableCell> : <TableCell align="left">

                      <CustomFormatInput
                        type="text"
                        id="outstandingInvoiceAmount"
                        name="outstandingInvoiceAmount"
                        numberformat={this.state.dcOutstandingInvoiceAmount}
                        className={classes.amountInput}
                        changeValue={(val) => this.handleCustomInputChange('dcOutstandingInvoiceAmount', val)}
                        formControlProps={{
                          fullWidth: true
                        }}
                      />
                    </TableCell>}
                  </TableRow>

                  {this.state.dcPartyName === 'debtors-overview' || this.state.dcPartyName === 'creditors-overview' ?
                    <TableRow >
                      <TableCell className={classes.fontWeight_600}>Upload List</TableCell>
                      <TableCell align="left">

                        <CustomInputBox
                          id='debtor-creditor-list'
                          label='Upload File'
                          placeholder='Choose File'
                          type='file'
                          name='document'
                          fieldName='debtorCreditorList'
                          value={this.state.dcDebtorsCreditorsList}
                          onChange={(name, value) => this.setState({ dcDebtorsCreditorsList: value })}
                        />
                      </TableCell>

                    </TableRow> : null}

                  {this.state.dcPartyName === 'debtors-overview' || this.state.dcPartyName === 'creditors-overview' ?
                    <TableRow >
                      <TableCell className={classes.fontWeight_600}>No-of-Parties</TableCell>
                      <TableCell align="left">

                        <TextField
                          fullWidth={true}
                          type="text"
                          id="numberOfPartiesInvolved"
                          defaultValue={this.state.dcPartiesInvolved}
                          onChange={event => {
                            const { value } = event.target;
                            this.setState({ dcPartiesInvolved: value });
                          }}
                          InputProps={inputClasses} />
                      </TableCell>
                      <TableCell className={classes.fontWeight_600}>Total-Amount</TableCell>
                      <TableCell align="left">
                        <CustomFormatInput
                          type="text"
                          id="totalOutstanding"
                          name="totalOutstanding"
                          numberformat={this.state.dctotalOutstanding}
                          className={classes.amountInput}
                          changeValue={(val) => this.handleCustomInputChange('dctotalOutstanding', val)}
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </TableCell>
                    </TableRow> : null}

                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ showAddDebtorCreditor: false }); }} className={classes.popupCloseButton}>Close</Button>
            {
              <Button onClick={this.handleSaveDebtorAndCreditor} className={classes.popupAddButton}>{this.state.selectedAction === 'create' ? 'Create' : 'Update'}</Button>
            }
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.deleteConfermation}
          onClose={() => this.setState({ deleteConfermation: !this.state.deleteConfermation })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You are going to delete a line from the debt-form. Are you sure?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ deleteConfermation: false })} color="primary">
              No
          </Button>
            <Button onClick={this.state.deleteType === 'deleteThirdParty' ? this.deleteDebtAtThirdParty : this.deleteDebitorsCreditors} color="primary" autoFocus>
              Yes
          </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

DebtForm.propTypes = {
  classes: PropTypes.object.isRequired,
  debtFormData: PropTypes.array,
  importDebtsAndDebitorsCreditors: PropTypes.func,
  updateDebtAtThirdParty: PropTypes.func,
  updateDebitorsCreditors: PropTypes.func,
  displayNotification: PropTypes.func,
  imporRequestId: PropTypes.func,
  origin: PropTypes.string,
  requestContractId: PropTypes.string,
  getFieldNameValues: PropTypes.func,
  customerLegalName: PropTypes.object,
  overviewData: PropTypes.object,
  isDashboardContent: PropTypes.bool,
};

DebtForm.defaultProps = {
  origin: "ADMIN",
};

const mapStateToProps = (state) => {
  return {
    debtFormData: state.debtForm.debtFormData,
    customer: state.lmglobal.selectedCustomer,
    overviewData: state.lmglobal.overviewData,
    isDashboardContent: state.user.isDashboardContent
  };
};

const mapDispatchToProps = (dispatch) => ({
  importDebtsAndDebitorsCreditors: (requestData) => dispatch(importDebtsAndDebitorsCreditors(requestData)),
  updateDebtAtThirdParty: (requestBody) => dispatch(updateDebtAtThirdParty(requestBody)),
  updateDebitorsCreditors: (requestBody) => dispatch(updateDebitorsCreditors(requestBody)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  imporRequestId: (requestData) => dispatch(imporRequestId(requestData)),
  getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(DebtForm));