// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import Classnames from "classnames";
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";

import GridItem from "components/loanmanagement/Grid/GridItem";
import Button from "components/loanmanagement/CustomButtons/Button.jsx";
import GridContainer from "components/loanmanagement/Grid/GridContainer";

import Util from "lib/loanmanagement/utility";
import { DDstatus } from "constants/loanmanagement/sme-loan-repayment-direct-debits";

import { reactivateSmeLoanTransactions } from 'store/loanmanagement/actions/SmeLoanTransaction';

const STATUS = [DDstatus.FREQUENTLY_REJECTED, DDstatus.FREQUENTLY_FAILED];

export class TransactionsOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      allTransactions: this.props.transactions ? this.props.transactions : null,
      filteredTransactions: [],
      markedTransactions: [],
      reactivatedTransactions: [],
      reactivatedCount: -1,
      selectAllTransactions: false,

      isLoading: false,
      order: "desc",
      orderBy: "plannedDate",
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    let { filteredTransactions } = this.state;

    filteredTransactions = this.state.allTransactions.filter((trans) => (trans && STATUS.includes(trans.status) && trans.termNumber < 99000));

    this.setState({ filteredTransactions });
  }

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  getRowClass = (status, statusHistory) => {
    const { classes } = this.props;
    const rowClass = Classnames({
      [classes["directDebitRow_Green"]]: status === DDstatus.PAID,
      [classes["directDebitRow_Orange"]]: status !== DDstatus.PAID,
      [classes["directDebitRow_Blue"]]: statusHistory
        .find(history => history.status === 'manually-settled') !== undefined
    });
    return rowClass;
  }

  getCellClass = (status) => {
    const { classes } = this.props;
    const cellClass = Classnames({
      [classes.directdebitRowCell]: true,
      [classes["whiteFont"]]: status === DDstatus.PAID,
      [classes["blackFont"]]: status !== DDstatus.PAID,
    });
    return cellClass;
  }

  markTransactions = (transId) => {
    // eslint-disable-next-line prefer-const
    let { markedTransactions, filteredTransactions } = this.state;

    if (markedTransactions.includes(transId)) {
      markedTransactions.splice((markedTransactions.indexOf(transId)), 1);

    } else {
      markedTransactions.push(transId);

    }

    this.setState({ markedTransactions, selectAllTransactions: (markedTransactions.length === filteredTransactions.length) });
  }

  markAllTransactions = () => {
    // eslint-disable-next-line prefer-const
    let { markedTransactions, filteredTransactions, selectAllTransactions } = this.state;

    markedTransactions = [];

    if (!selectAllTransactions) filteredTransactions.map((trans) => markedTransactions.push(trans._id));

    this.setState({ markedTransactions, selectAllTransactions: !selectAllTransactions });

  }

  handleReactivate = (reactivateType) => {

    this.setState({ isLoading: true, reactivatedCount: -1 }, () => {

      // eslint-disable-next-line prefer-const
      let { reactivatedCount, reactivatedTransactions, markedTransactions } = this.state;

      this.props.reactivateTransactions(this.props.loanId, markedTransactions, this.props.transactionsFrequency,reactivateType, this.props.country)
        .then((response => {

          reactivatedCount = response.length;

          for (const trans of response) {
            reactivatedTransactions.push(trans._id);

            if (trans && markedTransactions.includes(trans._id)) {
              markedTransactions.splice(markedTransactions.indexOf(trans._id), 1);
            }
          }

        }))
        .finally(() => {
          this.setState({
            reactivatedCount,
            isLoading: false,
            selectAllTransactions: false,
            reactivatedTransactions,
            markedTransactions,
          });
        });

    });


  };

  render() {

    const { classes, locale, currency } = this.props;
    const { filteredTransactions, markedTransactions, isLoading, reactivatedTransactions } = this.state;

    let actionDisabled = !!(markedTransactions.length === 0);
    if (isLoading) actionDisabled = true;

    return (
      <div>
        <Paper className={classes.tableContainer} style={{ padding: '0px 15px 15px 15px', marginTop: '15px' }}>
          <div className={classes.infoLabel}>{
            this.state.reactivatedCount > -1 ?
              `Number of transactions reactivated : ${this.state.reactivatedCount}`
              : ''
          }</div>
          <Table stickyHeader id="Transaction_overview_table">
            <TableHead>
              <TableRow className={classes.tableHeaderRow}>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel>
                    Select
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'termNumber'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'termNumber')}>
                    Our Reference
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'plannedDate'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'plannedDate')}>
                    Planned Date
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'transactionDate'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'transactionDate')}>
                    Transaction Date
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel>
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'type'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'type')}>
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'amount'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'amount')}>
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'newBalanceAmount'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'newBalanceAmount')}>
                    New Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'status'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'status')}>
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'id'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody id="Transaction_overview_tableBody">
              {
                getSortedList(filteredTransactions, this.state.order, this.state.orderBy)
                  .map(transaction => {

                    if (reactivatedTransactions.includes(transaction._id)) return null;

                    return (
                      <TableRow id={"transaction_overview_tableRow-" + transaction._id} key={transaction._id} className={this.getRowClass(transaction.status, transaction.statusHistory) + " transaction_overview_tableRow"}>
                        <TableCell className={this.getCellClass(transaction.status)}>
                          <Checkbox
                            id={"select_transaction-" + transaction._id}
                            checked={!!(markedTransactions.includes(transaction._id))}
                            color="primary"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                            onChange={() => this.markTransactions(transaction._id)}
                            value={transaction._id}
                          />
                        </TableCell>
                        <TableCell id={transaction._id + "-ourReference"} className={this.getCellClass(transaction.status)}>{transaction.ourReference} A</TableCell>
                        <TableCell id={transaction._id + "-plannedDate"} className={this.getCellClass(transaction.status)}>{moment(transaction.plannedDate).format("DD-MM-YYYY")}</TableCell>
                        <TableCell id={transaction._id + "-transactionDate"} className={this.getCellClass(transaction.status)}>{(transaction.transactionDate) ? moment(transaction.transactionDate).format("DD-MM-YYYY") : ''}</TableCell>
                        <TableCell id={transaction._id + "-description"} className={this.getCellClass(transaction.status)}>{transaction.description}</TableCell>
                        <TableCell id={transaction._id + "-type"} className={this.getCellClass(transaction.status)}>{transaction.type}</TableCell>
                        <TableCell id={transaction._id + "-amount"} className={this.getCellClass(transaction.status)}>{Util.multiCurrencyConverter()(transaction.amount, locale, currency)}</TableCell>
                        <TableCell id={transaction._id + "-newBalance"} className={this.getCellClass(transaction.status)}>{transaction.newBalanceAmount ? Util.multiCurrencyConverter()(transaction.newBalanceAmount, locale, currency) : '-'}</TableCell>
                        <TableCell id={transaction._id + "-status"} className={this.getCellClass(transaction.status)}>{transaction.status}</TableCell>
                        <TableCell id={transaction._id + "-transaction_id"} className={this.getCellClass(transaction.status)}>{transaction.id}</TableCell>
                      </TableRow>
                    );
                  })
              }
            </TableBody>
          </Table>
        </Paper>
        <GridContainer>
          <GridItem xs={12} sm={4} md={4} lg={4} >
            <FormControlLabel
              control={
                <Checkbox
                  id={"selectAll_transactions"}
                  checked={this.state.selectAllTransactions}
                  color="primary"
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                  onChange={() => this.markAllTransactions()}
                />
              }
              label={"Select all " + (this.state.selectAllTransactions ? (`{ ${filteredTransactions.length} transaction(s) selected }`) : "")}
              style={{ color: '#000' }}
            />
          </GridItem>
          {/* <GridItem xs={12} sm={6} md={3} lg={3} /> */}
          <GridItem xs={12} sm={8} md={8} lg={8} style={{ textAlign: 'right' }}>
            <Button id={"close_transaction_overView"} /* className={classes.smallButton} */ onClick={this.props.onClose}>Cancel</Button>
            <Button disabled={actionDisabled} onClick={()=>this.handleReactivate('re_plan_at_the_end')}
              color="success" id={"confirm_selected_transactions_for_end"} /* className={classes.smallButton} */>RE - PLAN AT THE END</Button>
            <Button disabled={actionDisabled} onClick={()=>this.handleReactivate('re_plan_from_tomorrow')}
              color="success" id={"confirm_selected_transactions_from_tommorow"} /* className={classes.smallButton} */>RE - PLAN FROM TOMORROW</Button>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}


const getSortedList = (list, order, orderBy) => {

  const sortedList = list;

  if (orderBy === 'plannedDate' && order === 'asc') {
    sortedList.sort(function (a, b) {
      let diff = new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
      if (diff === 0) {
        diff = Number(a.id.split('TR')[1]) - Number(b.id.split('TR')[1]);
      }
      return diff;
    });
  }

  if (orderBy === 'plannedDate' && order === 'desc') {
    sortedList.sort(function (a, b) {
      let diff = new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime();
      if (diff === 0) {
        diff = Number(b.id.split('TR')[1]) - Number(a.id.split('TR')[1]);
      }
      return diff;
    });
  }

  if (orderBy !== 'plannedDate' && order === 'asc') {
    sortedList.sort(function (a, b) {
      return -desc(a, b, orderBy);
    });
  }

  if (orderBy !== 'plannedDate' && order === 'desc') {
    sortedList.sort(function (a, b) {
      return desc(a, b, orderBy);
    });
  }

  return sortedList;
};

const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

TransactionsOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  loanId: PropTypes.string.isRequired,
  transactionsFrequency: PropTypes.string.isRequired,
  transactions: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  reactivateTransactions: PropTypes.func.isRequired,
  country: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired
};

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state) => ({

});

const mapDispatchToProps = (dispatch) => ({
  reactivateTransactions: (loanId, transactionsList, transactionsFrequency,reactivateType, country) => dispatch(reactivateSmeLoanTransactions(loanId, transactionsList, transactionsFrequency,reactivateType, country)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TransactionsOverview));
