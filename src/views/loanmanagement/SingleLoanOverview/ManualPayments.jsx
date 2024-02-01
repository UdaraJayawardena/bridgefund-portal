import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import { setHoveredDirectDebitListByTransactionId, clearHoveredDDList, getManuallySettledBankTransactionsByContractId } from "store/loanmanagement/actions/BankTransactions";
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
  Popover
} from "@material-ui/core";

import Util from "lib/loanmanagement/utility";
// import { th } from 'date-fns/locale';

class DirectDebit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "transactionDate",
      anchorElement: null,
      hoveredTransactionId: null
    };
  }

  componentDidMount() {
    const { contractId, lmContractSysId, isDashboardContent, } = this.props;

    if (isDashboardContent && lmContractSysId) {
      this.props.getManuallySettledBankTransactionsByContractId(lmContractSysId);
    }
    if (contractId) {
      this.props.getManuallySettledBankTransactionsByContractId(contractId);
    }
  }

  // eslint-disable-next-line no-unused-vars
  handleRequestSort = (property, event) => {
    const orderBy = property;
    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  handlePopoverOpen = (transactionId, currentTarget) => {
    // console.log('mouse entered ', currentTarget, ' id ', transactionId);
    this.setState({ anchorElement: currentTarget, hoveredTransactionId: transactionId });
    this.props.getDDByHoveredTransaction(transactionId);
  };

  handlePopoverClose = () => {
    // console.log('mouse removed ', currentTarget, ' id ', transactionId);
    this.setState({ anchorElement: null, hoveredTransactionId: null });
    this.props.clearHoveredDDList();
  }

  getUniqueBankTransactions = (bankTransactions) => {
    return bankTransactions.filter((transaction, pos, arr) => {
      return arr.map(transaction => transaction.transactionNumber).indexOf(transaction.transactionNumber) === pos;
    });
  }

  render() {
    const { classes, bankTransactions, hoveredDDListBytransaction } = this.props;

    // console.log('props in render ', this.props);
    return (
      <div>
        <Paper className={classes.tableContainer}>
          {bankTransactions.length === 0 ?
            <h4>No Manually settled transactions</h4>
            :
            <Table id="manual-payment-table">
              <TableHead id="manual-payment-table-head">
                <TableRow id="manual-payment-table-header-row" className={classes.tableHeaderRow}>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'statementIbanNumber'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'statementIbanNumber')}>
                      Statement Iban Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'transactionDate'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'transactionDate')}>
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'transactionNumber'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'transactionNumber')}>
                      Transaction Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'counterpartyIbanNumber'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'counterpartyIbanNumber')}>
                      Counterparty Iban Number
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
                    Description
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    Reason Code
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    Return Reason
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
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  Util.stableSort(this.getUniqueBankTransactions(bankTransactions),
                    Util.getSorting(this.state.order, this.state.orderBy))
                    .map(bankTransaction => (
                      <TableRow id={bankTransaction._id} key={bankTransaction._id}>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.statementIbanNumber}>{bankTransaction.statementIbanNumber}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.transactionDate}>{moment(bankTransaction.transactionDate).format("DD-MM-YYYY")}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.transactionNumber}>{bankTransaction.transactionNumber}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.counterpartyIbanNumber}>{bankTransaction.counterpartyIbanNumber ? bankTransaction.counterpartyIbanNumber : '-'}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.amount}>{Util.currencyConverter()(bankTransaction.amount)}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.description}>{bankTransaction.description}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.reasonCode}>{bankTransaction.reasonCode ? bankTransaction.reasonCode : '-'}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.returnReason}>{bankTransaction.returnReason}</TableCell>
                        <TableCell id={bankTransaction._id + '-' + bankTransaction.status} onMouseEnter={(event) => { this.handlePopoverOpen(bankTransaction._id, event.currentTarget); }} onMouseLeave={this.handlePopoverClose}>
                          {bankTransaction.status}
                          <Popover style={{ pointerEvents: 'none' }}
                            id="status-popover"
                            open={this.state.hoveredTransactionId === bankTransaction._id}
                            anchorEl={this.state.anchorElement}
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                            transformOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                          ><React.Fragment>
                              <table id="popover-table" className={classes.popOverTable}>
                                <thead>
                                  <tr>
                                    <th className={classes.popOverTableBodyCell}>Our Reference</th>
                                    <th className={classes.popOverTableBodyCell}>Planned Date</th>
                                    <th className={classes.popOverTableBodyCell}>Description</th>
                                    <th className={classes.popOverTableBodyCell}>Amount</th>
                                    <th className={classes.popOverTableBodyCell}>status</th>
                                  </tr>
                                </thead>
                                <tbody id="popover-table-body">
                                  {
                                    hoveredDDListBytransaction.map(directDebit => (
                                      <tr id={directDebit._id} key={directDebit._id}>
                                        <td id={directDebit._id + '_' + directDebit.ourReference} className={classes.popOverTableBodyCell}>{directDebit.ourReference}</td>
                                        <td id={directDebit._id + '_' + directDebit.plannedDate} className={classes.popOverTableBodyCell}>{moment(directDebit.plannedDate).format("DD-MM-YYYY")}</td>
                                        <td id={directDebit._id + '_' + directDebit.description} className={classes.popOverTableBodyCell}>{directDebit.description}</td>
                                        <td id={directDebit._id + '_' + directDebit.amount} className={classes.popOverTableBodyCell}>{Util.currencyConverter()(directDebit.amount)}</td>
                                        <td id={directDebit._id + '_' + directDebit.status} className={classes.popOverTableBodyCell}>{directDebit.status}</td>
                                      </tr>
                                    ))
                                  }
                                </tbody>
                              </table>
                            </React.Fragment>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          }
        </Paper>
      </div>
    );
  }
}

DirectDebit.propTypes = {
  contractId: PropTypes.string,
  classes: PropTypes.object.isRequired,
  getManuallySettledBankTransactionsByContractId: PropTypes.func,
  getDDByHoveredTransaction: PropTypes.func,
  clearHoveredDDList: PropTypes.func,
  bankTransactions: PropTypes.array,
  hoveredDDListBytransaction: PropTypes.array,
  lmContractSysId: PropTypes.string,
  isDashboardContent: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    bankTransactions: state.bankTransactions.bankTransactions,
    hoveredDDListBytransaction: state.bankTransactions.hoverdDirectDebits,
    lmContractSysId: state.lmglobal.selectedLoan.contractId,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getDDByHoveredTransaction: (transactionId) => {
      dispatch(setHoveredDirectDebitListByTransactionId(transactionId));
    },
    clearHoveredDDList: () => {
      dispatch(clearHoveredDDList());
    },
    getManuallySettledBankTransactionsByContractId: (contractId) => {
      dispatch(getManuallySettledBankTransactionsByContractId(contractId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(DirectDebit));
