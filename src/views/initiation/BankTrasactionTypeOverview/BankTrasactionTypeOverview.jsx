/* cSpell:ignore titel */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import CustomSearch from 'components/initiation/CustomInput/CustomSearch';

import { displayNotification } from 'store/initiation/actions/Notifier';
import { getbankTransactionTypes, addOrUpdateBankTransactionType } from 'store/initiation/actions/BankTransactionTypes.actions';

import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

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
// import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const basicBankTransactionType = {
  "id": null,
  "bank_id": null,
  "bank_transaction_type": "",
  "internal_transaction_type": -1,
  "credit_sub_category_value": "",
  "credit_detail_category_value": "",
  "debet_sub_category_value": "",
  "debet_detail_category_value": ""
};

const initialState = {
  bankId: null,
  isLoading: false,
  bank_full_name: '',
  selectedBank: {},
  selectedBankTransactionType: null,
  bankTransactionTypes: [],
  dialogAction: null,
  validationError: false,
  openBankTransactionTypeDialog: false,
  openDeleteBankTransactionTypeDialog: false,
  bankTransactionTypeDataForProcess: JSON.parse(JSON.stringify(basicBankTransactionType))
};

class BankTransactionTypeOverview extends Component {

    constructor(props) {
        super(props);

      this.state = JSON.parse(JSON.stringify(initialState));
    }

    getData = async (bankId) => {

      if (bankId === '' || bankId === null || bankId === undefined) return;

      this.props.getbankTransactionTypes(bankId)
        .then(result => {
          this.setState({ bankTransactionTypes: result});
        })
        .catch(() => {
          this.props.displayNotification('Error occured in get bank transaction types!', 'error');
        });
    };

    onSearch = (name, value) => {
      const _state = { [name]: value};
      if (name === 'bank_full_name' && value === '') _state.selectedBank = {}; _state.bankTransactionTypes = []; _state.bankId = null;
      this.setState(_state);
    };

    handleOnBankSearchResult = (result) => {
      if (result && typeof result !== 'string') {
        this.setState({ bankId: result.id });
        this.getData(result.id);
      }
    };

    viewBankTransactionTypeDetails = (bankTransactionTypeId = null, action = null) => {

    if (action === 'create' || action === 'update' || action === 'view') {

      this.setState((prevState) => {
        return {
          openBankTransactionTypeDialog: !prevState.openBankTransactionTypeDialog,
          selectedBankTransactionType: bankTransactionTypeId,
          dialogAction: action,
        };
      }, () => {

        const { bankTransactionTypes, selectedBankTransactionType } = this.state;

        let { bankTransactionTypeDataForProcess } = this.state;

        if (this.state.openBankTransactionTypeDialog && selectedBankTransactionType) {
          const temp = bankTransactionTypes.find((data) => data.id === selectedBankTransactionType);
          bankTransactionTypeDataForProcess = temp ? JSON.parse(JSON.stringify(temp)) : JSON.parse(JSON.stringify(basicBankTransactionType));

        } else bankTransactionTypeDataForProcess = JSON.parse(JSON.stringify(basicBankTransactionType));

        this.setState({ bankTransactionTypeDataForProcess });

      });
    } else if (action === 'delete') {

      this.setState((prevState) => {
        return {
          openDeleteBankTransactionTypeDialog: !prevState.openDeleteBankTransactionTypeDialog,
          selectedBankTransactionType: bankTransactionTypeId,
          dialogAction: action,
        };
      });
    } else {
      this.setState({ openDeleteBankTransactionTypeDialog : false, openBankTransactionTypeDialog: false });
    }
  }

  handleProcessDataChanges = (event, name) => {

    const { bankTransactionTypeDataForProcess } = this.state;

    let { validationError } = this.state;

    if (name in bankTransactionTypeDataForProcess && event.target.value !== -1) bankTransactionTypeDataForProcess[name] = event.target.value;

    if (name === 'internal_transaction_type' && event.target.value !== -1) validationError = false;

    this.setState({ bankTransactionTypeDataForProcess, validationError });

  }

  processData = () => {

    let { bankTransactionTypeDataForProcess, openBankTransactionTypeDialog, selectedBankTransactionType, 
          openDeleteBankTransactionTypeDialog, dialogAction } = this.state;

    const { bankId } = this.state;


    if ((!bankTransactionTypeDataForProcess.internal_transaction_type || bankTransactionTypeDataForProcess.internal_transaction_type === -1) && dialogAction !== 'delete' ) {

      this.setState({ validationError: true});
    } else {

      const params = {
        bankTransactionType: {
          action: this.state.dialogAction,
          bank_id: bankId,
          id: selectedBankTransactionType
        }
      };
  
      if (this.state.dialogAction !== 'delete') {
        params.bankTransactionType = { 
          ...bankTransactionTypeDataForProcess, 
          ...params.bankTransactionType
        };
      }
  
      let reloadData = false;
  
      this.props.addOrUpdateBankTransactionType(params)
        .then(() => {
          bankTransactionTypeDataForProcess = JSON.parse(JSON.stringify(basicBankTransactionType));
          openBankTransactionTypeDialog = false;
          openDeleteBankTransactionTypeDialog= false;
          selectedBankTransactionType = null;
          dialogAction = null;
          
          reloadData = true;
        })
        .finally(() => {
          this.setState({ bankTransactionTypeDataForProcess, openBankTransactionTypeDialog, openDeleteBankTransactionTypeDialog, 
                          selectedBankTransactionType, dialogAction },
            () => { if (reloadData) this.getData(bankId); });
        });
    }
  }
  
    render() {

      const { classes } = this.props;

      const { bankTransactionTypes, openBankTransactionTypeDialog, openDeleteBankTransactionTypeDialog, bankTransactionTypeDataForProcess } = this.state;

      const disableInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

      const internalTransactionType = bankTransactionTypeDataForProcess.internal_transaction_type ? bankTransactionTypeDataForProcess.internal_transaction_type : -1;

    return (
        <div>
          <Notifier />
          {/* <h1>Bank Transaction type Overview</h1> */}

          <div>
            <Paper>
              <div className={classes.tableHeaders}>
                <Typography variant='h6' id='tableTitle' component='div' className={classes.tableHeaderLabel}>Bank Transaction Type Overview</Typography>
                <Button className={`${classes.floatRight} ${classes.addButton}`} onClick={() => this.viewBankTransactionTypeDetails(null, 'create')}>Add Transaction Type</Button>
              </div>
              <div className={classes.searchBoxPosition}>
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
              </div>
              <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.width_15}>Action</TableCell>
                    <TableCell align="center">Bank Transaction Type</TableCell>
                    <TableCell align="center">Internal Transaction Type</TableCell>
                    <TableCell align="center">Credit sub Category</TableCell>
                    <TableCell align="center">Credit Detailed Category</TableCell>
                    <TableCell align="center">Debit Sub Category</TableCell>
                    <TableCell align="center">Debit Detailed Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bankTransactionTypes.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell >
                          <div className={classes.actionButtons}><VisibilityIcon className={classes.cursorPointer} onClick={() => this.viewBankTransactionTypeDetails(row.id, 'view')} /></div>
                          <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.viewBankTransactionTypeDetails(row.id, 'update')}/></div>
                          <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.viewBankTransactionTypeDetails(row.id, 'delete')}/></div>
                        </TableCell>
                        <TableCell align="center">{row.bank_transaction_type}</TableCell>
                        <TableCell align="center">{row.internal_transaction_type}</TableCell>
                        <TableCell align="center">{row.credit_sub_category_value}</TableCell>
                        <TableCell align="center">{row.credit_detail_category_value}</TableCell>
                        <TableCell align="center">{row.debet_sub_category_value}</TableCell>
                        <TableCell align="center">{row.debet_detail_category_value}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            </Paper>
          </div>

          <Dialog open={openBankTransactionTypeDialog} onClose={this.viewBankTransactionTypeDetails} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-transaction-types">
            <DialogTitle id="bank-transaction-type-title">Bank Transaction Type</DialogTitle>
            <DialogContent>
              <TextField id="bankTransactionType" onChange={(event) => this.handleProcessDataChanges(event, 'bank_transaction_type')} className={classes.margin_5} label="Bank Transaction Type" variant="outlined" value={bankTransactionTypeDataForProcess.bank_transaction_type || ''} disabled={this.state.dialogAction === 'update' || this.state.dialogAction === 'view'} />
              {
              !disableInputs ?
                <FormControl variant="outlined" className={`${classes.margin_5} ${classes.width_25}`} error={this.state.validationError}>
                  <InputLabel id="internalTransactionType-label">Internal Transaction Type</InputLabel>
                  <Select
                    labelId="internalTransactionType"
                    id="internalTransactionType"
                    value={internalTransactionType}
                    onChange={(event) => this.handleProcessDataChanges(event, 'internal_transaction_type')}
                    label="Internal Transaction Type"
                  >
                    <MenuItem value={-1}>Select</MenuItem>
                    <MenuItem value={'Int Trans'}>Int Trans</MenuItem>
                    <MenuItem value={'Ext Trans'}>Ext Trans</MenuItem>
                    <MenuItem value={'Ext Trans Prio'}>Ext Trans Prio</MenuItem>
                    <MenuItem value={'Ext Trans Inter'}>Ext Trans Inter</MenuItem>
                    <MenuItem value={'Ext Trans Inter Prio'}>Ext Trans Inter Prio</MenuItem>
                    <MenuItem value={'Cash'}>Cash</MenuItem>
                    <MenuItem value={'Cash Eur Bills'}>Cash Eur Bills</MenuItem>
                    <MenuItem value={'Cash Inter'}>Cash Inter</MenuItem>
                    <MenuItem value={'PoS'}>PoS</MenuItem>
                    <MenuItem value={'PoS Inter'}>PoS Inter</MenuItem>
                    <MenuItem value={'DD'}>DD</MenuItem>
                    <MenuItem value={'DD Rev'}>DD Rev</MenuItem>
                  </Select>
                </FormControl>
                :
                <TextField id="internalTransactionType" onChange={(event) => this.handleProcessDataChanges(event, 'internal_transaction_type')} className={classes.margin_5} label="Internal Transaction Type" variant="outlined" value={bankTransactionTypeDataForProcess.internal_transaction_type} disabled={disableInputs} />
              }
              {/* <TextField id="internalTransactionType" onChange={(event) => this.handleProcessDataChanges(event, 'internal_transaction_type')} className={classes.margin_5} label="Internal Transaction Type" variant="outlined" value={bankTransactionTypeDataForProcess.internal_transaction_type || ''} disabled={disableInputs} /> */}
              <TextField id="creditSubCategoryValue" onChange={(event) => this.handleProcessDataChanges(event, 'credit_sub_category_value')} className={classes.margin_5} label="Credit Sub Category" variant="outlined" value={bankTransactionTypeDataForProcess.credit_sub_category_value || ''} disabled={disableInputs} />
              <TextField id="creditDetailCategoryValue" onChange={(event) => this.handleProcessDataChanges(event, 'credit_detail_category_value')} className={classes.margin_5} label="Credit Detail Category" variant="outlined" value={bankTransactionTypeDataForProcess.credit_detail_category_value || ''} disabled={disableInputs} />
              <TextField id="debetSubCategoryValue" onChange={(event) => this.handleProcessDataChanges(event, 'debet_sub_category_value')} className={classes.margin_5} label="Debet Sub Category" variant="outlined" value={bankTransactionTypeDataForProcess.debet_sub_category_value || ''} disabled={disableInputs} />
              <TextField id="debetDetailCategoryValue" onChange={(event) => this.handleProcessDataChanges(event, 'debet_detail_category_value')} className={classes.margin_5} label="Debet Detail Category" variant="outlined" value={bankTransactionTypeDataForProcess.debet_detail_category_value || ''} disabled={disableInputs} />
            </DialogContent>
            <DialogActions>
            <Button onClick={this.viewBankTransactionTypeDetails} className={classes.popupCloseButton}>Close</Button>
            {
              !disableInputs ?
                <Button onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                : null
            }
          </DialogActions>
          </Dialog>
          <Dialog open={openDeleteBankTransactionTypeDialog} aria-labelledby="delete-bank-transaction-types" aria-describedby="alert-dialog-description" onClose={this.viewBankTransactionTypeDetails} >
          <DialogTitle id="alert-dialog-title">Delete Bank Transaction Type</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are you sure you want to delete this bank transaction type?'}</DialogContentText>
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

BankTransactionTypeOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  getbankTransactionTypes: PropTypes.func, 
  displayNotification: PropTypes.func.isRequired,
  addOrUpdateBankTransactionType: PropTypes.func
};

const mapStateToProps = () => {
    return {
    };
  };
  
  const mapDispatchToProps = (dispatch) => ({
    displayNotification: (message, warning) => dispatch(displayNotification(message, warning)),
    getbankTransactionTypes: (bankId) => dispatch(getbankTransactionTypes(bankId)),
    addOrUpdateBankTransactionType: (bankTransactionType) => dispatch(addOrUpdateBankTransactionType(bankTransactionType)),
  });

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(BankTransactionTypeOverview));