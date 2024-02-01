import moment from 'moment';
import clx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import Styles from 'assets/jss/material-dashboard-react/views/SmeLoanTransactionEditorStyles';

import { Table, TableBody, TableRow, TableCell, Paper, TableHead, TableSortLabel, Button, IconButton, Tooltip, Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core';
import { Edit, Delete } from "@material-ui/icons";

import Card from 'components/loanmanagement/Card/Card.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem';
import Loader from 'components/loanmanagement/CustomLoader/Loader';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import CustomInput from 'components/loanmanagement/CustomInput/CustomInput';
import PartAmountsPopup from 'components/loanmanagement/PopupComponents/PartAmountsPopup';
import StatusHistoryPopup from 'components/loanmanagement/PopupComponents/StatusHistoryPopup';

import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { requestSmeLoan, clearLoans } from 'store/loanmanagement/actions/SmeLoans';
import { clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import { clearSmeMandates, requestSmeMandates } from 'store/loanmanagement/actions/SmeMandates';
import { clearDirectDebits, requestDirectDebits } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { getLocales } from "store/initiation/actions/Configuration.action";
import SmeLoanTransactionPopup from './SmeLoanTransactionEditPopup';
import util from 'lib/loanmanagement/utility';
import { getCustomerByVTigerId } from 'store/crm/actions/Customer.action';

const EURO = util.currencyConverter();
const CURRENCY = util.multiCurrencyConverter();
class SmeLoanTransactionsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      contractId: '',
      isEditTransaction: false,
      selectedSmeLoanTransaction: {},
      transactionPopupUsage: 'create',

      order: 'desc',
      orderBy: 'plannedDate',
      country: '',
      currency: 'EUR',
      symbol: '€',
      locale: 'nl-NL',
      decimalSeparator: ',',
      thousandSeparator: '.',
      isValidLocale: false
    };
  }

  componentWillUnmount() {
    this.resetState();
  }

  componentDidMount() {
    const { smeLoan } = this.props;
    this.getLoanDetails(smeLoan.contractId)
  }

  resetState = () => {
    this.props.clearLoans();
    this.props.clearDirectDebits();
    this.props.clearSmeMandates();
    this.props.clearSelectedCustomer();
  }

  handleChange = (name, value) => {
    if (name === 'contractId') value = value.toUpperCase()
    this.setState({ [name]: value })
  };

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  getLoanDetails = (contractId) => {
    this.setState({ isLoading: true });
    this.props.requestSmeLoan(contractId)
      .then((response) => {

        if (!response || !response._id) {
          return this.resetState();
        } else {
          const country = response.country;
          const currency = response.currency;
          this.setState({ country: country, currency: currency }, function () {
            this.getLocales();
          });
        }
        this.props.getCustomerByVTigerId(response.smeId);
        this.props.requestSmeMandates(response.smeId);
        this.props.requestDirectDebits(contractId)
      })
      .finally(() => {
        this.setState({ isLoading: false });

      })
  };
  getLocales = async () => {
    const { country } = this.state;
    let decimalSeparator = '.';
    let thousandSeparator = ',';
    this.props.getLocales({ countryCode: country })
      .then(res => {
        if (!res || res.length == 0) {
          this.setState({ isValidLocale: false });
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
        if (res[0].locale == 'nl-NL') {
          decimalSeparator = ',';
          thousandSeparator = '.';
        }
        this.setState({
          locale: res[0].locale,
          symbol: res[0].currencySymbol,
          decimalSeparator, thousandSeparator,
          isValidLocale: true
        });
      })
      .catch(err => { console.log('getLocales err ', err); });

  }

  editTransaction = (id) => {
    const selectedSmeLoanTransaction = this.props.smeLoanTransactions.find(tr => tr.id === id);
    this.setState({ isEditTransaction: true, selectedSmeLoanTransaction, transactionPopupUsage: 'update' });
  };

  addTransaction = () => {
    this.setState({ isEditTransaction: true, transactionPopupUsage: 'create' });
  }

  deleteTransaction = (id) => {
    const selectedSmeLoanTransaction = this.props.smeLoanTransactions.find(tr => tr.id === id);
    this.setState({ isEditTransaction: true, selectedSmeLoanTransaction, transactionPopupUsage: 'delete' });
  }

  render() {
    const { classes } = this.props;
    const { locale, currency } = this.state;
    return (
      <div>
        <Notifier />
        <Loader open={this.state.isLoading} />
        <Card><CardBody>
          <GridContainer><GridItem><Table><TableBody>
            <TableRow>
              <TableCell className={classes.noBorder}>Contract ID: </TableCell>
              <TableCell className={classes.noBorder}>
                <CustomInput
                  id='contract-id'
                  formControlProps={{
                    className: clx(classes.tableCellLessPadding, classes.zeroMargin),
                    fullWidth: true
                  }}
                  inputProps={{
                    name: 'contractId',
                    placeholder: 'SBF19882',
                    value: this.state.contractId,
                    onBlur: (e) => this.getLoanDetails(e.target.value),
                    onChange: (e) => this.handleChange('contractId', e.target.value),
                  }}
                />
              </TableCell>
              <TableCell className={classes.noBorder}>Name: </TableCell>
              <TableCell className={classes.noBorder}>{this.props.smeDetails?.company || ''}</TableCell>
              <TableCell className={classes.noBorder}>
                <Button variant="contained" color="primary"
                  className={classes.marginRight}
                  onClick={this.addTransaction}
                  disabled={this.props.smeLoan._id === null || this.props.smeLoan._id === undefined}>Add Transaction</Button>
              </TableCell>
            </TableRow>
          </TableBody></Table></GridItem></GridContainer>

          <Paper className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow className={classes.tableHeaderRow}>
                  <TableCell>Action</TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'ourReference'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'ourReference')}
                    >Our Reference</TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'plannedDate'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'plannedDate')}
                    >Planned Date</TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>Description</TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'type'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'type')}
                    >Type</TableSortLabel>
                  </TableCell>
                  <TableCell className={clx(classes.tableHeaderCellNumber, classes.headerSort)}>
                    <TableSortLabel
                      active={this.state.orderBy === 'amount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'amount')}
                    >Amount</TableSortLabel>
                  </TableCell>
                  <TableCell className={clx(classes.tableHeaderCellNumber, classes.headerSort)}>
                    <TableSortLabel
                      active={this.state.orderBy === 'newBalanceAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'newBalanceAmount')}
                    >New Balance</TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'status'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'status')}
                    >Status</TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'id'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'id')}
                    >ID</TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  util.getSortedSmeLoanTransactions(this.props.smeLoanTransactions, this.state.order, this.state.orderBy).map(tr => (
                    <TableRow key={tr._id}>
                      <TableCell className={classes.tableBodyCell}>
                        <IconButton className={classes.actionButton}
                          onClick={this.editTransaction.bind(this, tr.id)}
                        ><Edit /></IconButton>
                        <IconButton className={classes.actionButton}
                          onClick={this.deleteTransaction.bind(this, tr.id)}
                        ><Delete />
                        </IconButton>
                      </TableCell>
                      <TableCell className={classes.tableBodyCell}>{tr.ourReference}</TableCell>
                      <TableCell className={classes.tableBodyCell}>{moment(tr.plannedDate).format('DD-MM-YYYY')}</TableCell>
                      <TableCell className={classes.tableBodyCell}>{tr.description}</TableCell>
                      <TableCell className={classes.tableBodyCell}>{tr.type}</TableCell>
                      <Tooltip placement='bottom' disableFocusListener disableTouchListener
                        title={<PartAmountsPopup transaction={tr} locale={locale} currency={currency} />}
                      >
                        <TableCell className={clx(classes.tableBodyCellNumber, classes.bodySort)}>{CURRENCY(tr.amount, locale, currency)}</TableCell>
                      </Tooltip>
                      <TableCell className={clx(classes.tableBodyCellNumber, classes.bodySort)}>{CURRENCY(tr.newBalanceAmount, locale, currency)}</TableCell>
                      <Tooltip placement='bottom' disableFocusListener disableTouchListener
                        title={<StatusHistoryPopup statusHistory={tr.statusHistory} />}
                      >
                        <TableCell className={classes.tableBodyCell}>{tr.status}</TableCell>
                      </Tooltip>
                      <TableCell className={classes.tableBodyCell}>{tr.id}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </Paper>
        </CardBody></Card>

        <Dialog open={this.state.isEditTransaction} maxWidth='md'>
          <DialogActions className={classes.spaceBetween}>
            <DialogTitle id="alert-dialog-title">
              {`${this.state.transactionPopupUsage === 'create' ?
                'Create' : this.state.transactionPopupUsage === 'update' ?
                  'Edit' : this.state.transactionPopupUsage === 'delete' ?
                    'Please Confirm to delete the' : 'View'} Sme Loan Transaction`}
            </DialogTitle>
            <Button color="secondary" variant="outlined" onClick={() => this.setState({ isEditTransaction: false, selectedSmeLoanTransaction: {} })}>X</Button>
          </DialogActions>
          <DialogContent>
            <SmeLoanTransactionPopup
              smeLoan={this.props.smeLoan}
              smeDetails={this.props.smeDetails}
              smeMandates={this.props.smeMandates}
              usage={this.state.transactionPopupUsage}
              smeLoanTransactions={this.props.smeLoanTransactions}
              smeLoanTransaction={this.state.selectedSmeLoanTransaction}
              country={this.state.country}
              currency={this.state.currency}
              symbol={this.state.symbol}
              decimalSeparator={this.state.decimalSeparator}
              thousandSeparator={this.state.thousandSeparator}
              onClose={() => this.setState({ isEditTransaction: false, selectedSmeLoanTransaction: {} })}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

SmeLoanTransactionsList.propTypes = {
  smeLoan: PropTypes.object,
  classes: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  smeMandates: PropTypes.array.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  clearLoans: PropTypes.func.isRequired,
  requestSmeLoan: PropTypes.func.isRequired,
  clearSmeMandates: PropTypes.func.isRequired,
  clearDirectDebits: PropTypes.func.isRequired,
  requestSmeMandates: PropTypes.func.isRequired,
  requestDirectDebits: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  getCustomerByVTigerId: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  smeLoan: state.lmglobal.selectedLoan,
  smeDetails: state.lmglobal.customerDetails,
  smeMandates: state.smemandates.smeMandatesByCustomer,
  smeLoanTransactions: state.smeLoanTransaction.directdebits,
});

const mapDispatchToProps = (dispatch) => ({
  clearLoans: () => dispatch(clearLoans()),
  clearSmeMandates: () => dispatch(clearSmeMandates()),
  clearDirectDebits: () => dispatch(clearDirectDebits()),
  clearSelectedCustomer: () => dispatch(clearSelectedCustomer()),
  requestSmeMandates: (smeId) => dispatch(requestSmeMandates(smeId)),
  requestSmeLoan: (contractId) => dispatch(requestSmeLoan(contractId)),
  requestDirectDebits: (contractId) => dispatch(requestDirectDebits(contractId)),
  getCustomerByVTigerId: (smeId) => dispatch(getCustomerByVTigerId(smeId)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  getLocales: (requestBody) => dispatch(getLocales(requestBody)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(SmeLoanTransactionsList));
