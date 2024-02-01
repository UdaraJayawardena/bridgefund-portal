/* cSpell:ignore titel */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import CustomSearch from 'components/initiation/CustomInput/CustomSearch';

import { displayNotification } from 'store/initiation/actions/Notifier';

import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import IconButton from '@material-ui/core/IconButton';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';

import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { getBankAccounts, addOrUpdateBankAccounts, clearBankAccounts } from 'store/initiation/actions/BankAccount.action';

const initialState = {
  legalName: '',
  customerId: '',
  selectedCustomer: {},
  iban_number: '',
  currency: '',
  type: '',
  status: '',
  bankId: null,
  searchIban: '',
  isLoading: false,
  bank_full_name: '',
  selectedBank: {},
  bankAccountsList: [],
  dialogAction: null,
  validationError: false,
  openBankAccountModal: false,
  openDeleteBankAccountDialog: false,
  customerErors: false,
};

class SingleAccountOverview extends Component {

  constructor(props) {
    super(props);

    const initState = JSON.parse(JSON.stringify(initialState));

    this.state = {
      ...initState,
    };
  }

  componentWillUnmount() {
    this.props.clearBankAccounts();
  }

  getData = async (id) => {
    console.log(id);
    const getObject = {
      action: "get",
      smeLoanRequestId: "",
      customerId: this.state.customerId,
      ibanNumber: ''
    };
    this.props.getBankAccounts(getObject)
      .then(result => {
        this.setState({ bankAccountsList: result });
      })
      .catch(() => {
        this.props.displayNotification('Error occured in get bank accounts!', 'error');
      });
  };

  onSearch = (name, value) => {
    const _state = { [name]: value };
    if (name === 'bank_full_name' && value === '') _state.selectedBank = {};
    this.setState(_state);
  };

  onSearchCustomer = (name, value) => {
    const _state = { [name]: value };
    if (name === 'legalName' && value === '') _state.selectedCustomer = {};
    this.setState(_state);
  };

  handleOnBankSearchResult = (result) => {
    if (result && typeof result !== 'string') {
      this.setState({ bank_full_name: result.bank_full_name, bankId: result.id });
    }
  };

  handleCustomerSearchResult = (result) => {
    if (result && typeof result !== 'string') {
      this.setState({
        legalName: result.legalName, customerId: result.id
      }, () => {
        this.getData(result.id);
      });
    }

  };

  viewBankTransactionTypeDetails = (id, action) => {
    if (action === 'create') {
      this.clearData();
      this.setState({ openBankAccountModal: !this.state.openBankAccountModal, dialogAction: action });
    }

    else if (action === 'update') {
      const editObject = this.state.bankAccountsList.filter(item => item.perBankAccount.id === id)[0];
      this.setState({
        bankAccountId: editObject.perBankAccount.id,
        action: this.state.dialogAction,
        customer_id: editObject.customerId,
        bank_id: this.state.bankId,
        iban_number: editObject.perBankAccount.iban_number,
        currency: editObject.perBankAccount.currrency,
        type: editObject.perBankAccount.type,
        status: "active",
        old_bank_account_number: Number(this.state.old_bank_account_number),
      });
      this.setState({ openBankAccountModal: !this.state.openBankAccountModal, dialogAction: action });
    }

    else if (action == 'delete') {
      const editObject = this.state.bankAccountsList.filter(item => item.perBankAccount.id === id)[0];

      this.setState({
        bankAccountId: editObject.perBankAccount.id,
        action: this.state.dialogAction,
        customer_id: editObject.customerId,
        bank_id: this.state.bankId,
        iban_number: editObject.perBankAccount.iban_number,
        currency: editObject.perBankAccount.currrency,
        type: editObject.perBankAccount.type,
        status: "closed",
        old_bank_account_number: Number(this.state.old_bank_account_number)
      });

      this.setState((prevState) => {
        return {
          openDeleteBankAccountDialog: !prevState.openDeleteBankAccountDialog,
          dialogAction: action,
        };
      });
    } else {
      this.setState({ openDeleteBankAccountDialog: false, openBankAccountModal: false });
    }
  }

  processData = () => {
    const valiedIban = this.state.iban_number.replace(/\D/g, '');

    if (valiedIban.length > 10) {

      const bankNumber = valiedIban.slice(-4);

      this.setState({ old_bank_account_number: Number(bankNumber) });

      const getObject = {
        action: "get",
        smeLoanRequestId: "",
        customerId: this.state.customerId,
        ibanNumber: ''
      };
      if (this.state.dialogAction === 'create') {

        const requestObject = {
          action: this.state.dialogAction,
          customer_id: this.state.customerId,
          bank_id: this.state.bankId,
          iban_number: this.state.iban_number,
          currrency: this.state.currency,
          type: this.state.type,
          status: "active",
          old_bank_account_number: Number(bankNumber)
        };

        this.props.addOrUpdateBankAccounts({ bankAccountObj: requestObject })
          .then((response) => {
            if ('success' in response) {
              this.props.displayNotification('Error Adding Data', 'error');
            }
            else {
              this.getData(this.state.customerId);
              this.props.displayNotification('Bank Account Added successfully', 'success');
              this.setState({ openBankAccountModal: false });
            }
          });
      }
      else if (this.state.dialogAction === 'update') {
        const requestObject = {
          id: this.state.bankAccountId,
          action: this.state.dialogAction,
          customer_id: this.state.customerId,
          bank_id: this.state.bankId,
          iban_number: this.state.iban_number,
          currrency: this.state.currency,
          type: this.state.type,
          status: "active",
          old_bank_account_number: Number(this.state.old_bank_account_number)
        };
        this.props.addOrUpdateBankAccounts({ bankAccountObj: requestObject })
          .then((response) => {
            if ('success' in response) {
              this.props.displayNotification('Error Adding Data', 'error');
            }
            else {
              this.getData(this.state.customerId);
              this.props.displayNotification('Bank Account Updated successfully', 'success');
              this.setState({ openBankAccountModal: false });
            }
          });
      }
      else if (this.state.dialogAction === 'delete') {
        const requestObject = {
          id: this.state.bankAccountId,
          action: this.state.dialogAction,
          customer_id: this.state.customerId,
          bank_id: this.state.bankId,
          iban_number: this.state.iban_number,
          currrency: this.state.currency,
          type: this.state.type,
          status: this.state.status,
          old_bank_account_number: Number(this.state.old_bank_account_number)
        };
        this.props.addOrUpdateBankAccounts({ bankAccountObj: requestObject })
          .then((response) => {
            if ('success' in response) {
              this.props.displayNotification('Error Deleting Data', 'error');
            }
            else {
              this.props.getBankAccounts(getObject);
              this.props.displayNotification('Bank Account Updated successfully', 'success');
              this.setState({ openDeleteBankAccountDialog: false });
            }
          });
      }
    }
    else {
      this.props.displayNotification('IBAN Number should contain more than 10 digits ', 'warning'); return;
    }

  }

  searchData = (iban) => {
    const getObject = {
      action: "get",
      smeLoanRequestId: "",
      customerId: "",
      ibanNumber: iban
    };
    this.props.getBankAccounts(getObject).then((response) => {
      if ('success' in response) {
        this.props.displayNotification('Error Adding Data', 'error');
      }
      else {
        this.setState({ bankAccountsList: response });
      }
    });
  }

  clearData = () => {
    this.setState({
      iban_number: '',
      currency: '',
      type: '',
      status: '',
    });
  }

  isAllDataFilled = () => {
    const { iban_number, currency, type } = this.state;

    let isAllDataFilled = true;

    if (!iban_number || !currency || !type) isAllDataFilled = false;

    return isAllDataFilled;
  }

  render() {

    const { classes, bankAccounts } = this.props;

    const { openBankAccountModal, openDeleteBankAccountDialog } = this.state;

    const disableInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

    const anyFieldMissing = this.isAllDataFilled();
    const disableActionButton = !anyFieldMissing;

    return (
      <div>
        <Notifier />
        <h1>Single Account Overview</h1>

        <div>
          <Paper>
            <div className={classes.tableHeaders}>
              <Typography variant='h6' id='tableTitle' component='div' className={classes.tableHeaderLabel}>Single Account Overview</Typography>
              <Button disabled={this.state.bank_full_name != '' && this.state.legalName != '' ? false : true} className={`${classes.floatRight} ${classes.addButton}`} onClick={() => this.viewBankTransactionTypeDetails(null, 'create')}>Add Account</Button>
            </div>
            <GridContainer className={classes.flexContainer}>
              <GridItem className={classes.smallBox}>
                <CustomSearch
                  placeholder="Search Banks"
                  label="Bank Name"
                  asyncSearchType="bank"
                  name="bank_full_name"
                  value={this.state.bank_full_name}
                  onChange={this.onSearch}
                  onSearchResult={this.handleOnBankSearchResult}
                  SearchOptions={{
                    regexOption: 'i'
                  }}
                />
              </GridItem>
              <GridItem className={classes.smallBox}>
                <CustomSearch
                  placeholder="Search Customer"
                  label="Customer Name"
                  asyncSearchType="customer"
                  name="legalName"
                  value={this.state.legalName}
                  onChange={this.onSearchCustomer}
                  onSearchResult={this.handleCustomerSearchResult}
                  SearchOptions={{
                    regexOption: 'i'
                  }}
                />
              </GridItem>
              <GridItem className={classes.smallBox}>
                <TextField
                  // style={{
                  //   paddingTop: '30px'
                  // }}
                  id="search-by-iban"
                  label="*Search by Iban"
                  value={this.state.searchIban}
                  onChange={event => {
                    const { value } = event.target;
                    this.setState({
                      searchIban: value
                    }, () => {

                      this.searchData(this.state.searchIban);
                    });

                  }}
                  InputProps={{
                    className: classes.inputProp
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: classes.inputLabel
                  }}
                />
              </GridItem>
            </GridContainer>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.width_15}>Action</TableCell>
                    <TableCell align="center">Customer Id</TableCell>
                    <TableCell align="center">IBAN Number</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Currency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bankAccounts.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell >
                        <div className={classes.actionButtons}>
                          <IconButton aria-label="delete" disabled={row.perBankAccount.status === 'closed' ? true : false} className={classes.cursorPointer} onClick={() => this.viewBankTransactionTypeDetails(row.perBankAccount.id, 'update')}>
                            <EditIcon />
                          </IconButton>
                        </div>
                        <div className={classes.actionButtons}>
                          <IconButton aria-label="delete" disabled={row.perBankAccount.status === 'closed' ? true : false} className={classes.cursorPointer} onClick={() => this.viewBankTransactionTypeDetails(row.perBankAccount.id, 'delete')} >
                            <DeleteForeverIcon />
                          </IconButton>

                        </div>
                      </TableCell>
                      <TableCell align="center">{row.customerId}</TableCell>
                      <TableCell align="center">{row.perBankAccount.iban_number}</TableCell>
                      <TableCell align="center">{row.perBankAccount.status}</TableCell>
                      <TableCell align="center">{row.perBankAccount.type}</TableCell>
                      <TableCell align="center">{row.perBankAccount.currrency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>

        <Dialog open={openBankAccountModal} onClose={this.viewBankTransactionTypeDetails} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-transaction-types">
          <DialogTitle id="bank-transaction-type-title">Single Account</DialogTitle>
          <DialogContent>
            <TextField id="customer"
              className={classes.margin_5}
              label="Customer"
              variant="outlined"
              value={this.state.legalName}
              disabled={this.state.dialogAction === 'update' ? true : false} />

            <TextField
              id="Bank"
              className={classes.margin_5}
              label="bank"
              variant="outlined"
              value={this.state.bank_full_name}
              disabled={this.state.dialogAction === 'update' ? true : false} />

            <TextField
              id="ibanNo"
              className={classes.margin_5}
              label="IBAN-NO"
              placeholder='NL77 KNAB 0202 1234 12'
              variant="outlined"
              value={this.state.iban_number}
              onChange={event => {
                const { value } = event.target;
                this.setState({ iban_number: value });
              }}
              disabled={this.state.dialogAction === 'update' ? true : false}
            />
            <TextField
              id="currency"
              className={classes.margin_5}
              label="Currency"
              variant="outlined"
              value={this.state.currency}
              onChange={event => {
                const { value } = event.target;
                this.setState({ currency: value });
              }}
            />

            {
              !disableInputs ?
                <FormControl variant="outlined" className={`${classes.margin_5} ${classes.width_25}`} error={this.state.validationError}>
                  <InputLabel id="accountType">Account Type</InputLabel>
                  <Select
                    labelId="accountType"
                    id="accountType"
                    value={this.state.type}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        this.setState({ type: event.target.value });
                      }
                    }}
                    label="AccountType"
                  >
                    <MenuItem value={-1}>Select</MenuItem>
                    <MenuItem value={'checking'}>Checking Account</MenuItem>
                    <MenuItem value={'savings'}>Savings Account</MenuItem>
                  </Select>
                </FormControl>
                :
                <TextField id="internalTransactionType"
                  className={classes.margin_5}
                  label="Internal Transaction Type"
                  variant="outlined"
                  value={this.state.type}
                  onChange={event => {
                    const { value } = event.target;
                    this.setState({ type: value });
                  }}
                />
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewBankTransactionTypeDetails} className={classes.popupCloseButton}>Close</Button>
            {
              !disableInputs ?
                <Button disabled={disableActionButton} onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                : null
            }
          </DialogActions>
        </Dialog>
        <Dialog open={openDeleteBankAccountDialog} aria-labelledby="delete-bank-transaction-types" aria-describedby="alert-dialog-description" onClose={this.viewBankTransactionTypeDetails} >
          <DialogTitle id="alert-dialog-title">Delete Bank Account</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are you sure you want to delete this bank account?'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewBankTransactionTypeDetails} className={classes.popupCloseButton} color="primary">
              Cancel
          </Button>
            <Button onClick={this.processData} className={classes.popupAddButton} color="primary" >
              Delete
          </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

SingleAccountOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  displayNotification: PropTypes.func.isRequired,
  addOrUpdateBankAccounts: PropTypes.func,
  getBankAccounts: PropTypes.func,
  bankAccounts: PropTypes.array,
  clearBankAccounts: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    bankAccounts: state.bankAccount.bankAccounts
  };
};

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, warning) => dispatch(displayNotification(message, warning)),
  getBankAccounts: (data) => dispatch(getBankAccounts(data)),
  addOrUpdateBankAccounts: (data) => dispatch(addOrUpdateBankAccounts(data)),
  clearBankAccounts: () => (dispatch(clearBankAccounts())),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(SingleAccountOverview));