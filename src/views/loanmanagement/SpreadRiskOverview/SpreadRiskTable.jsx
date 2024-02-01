import moment from 'moment';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";

import {
  Drawer, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel
} from '@material-ui/core';

import { requestMultipleOverviewData } from "store/loanmanagement/actions/Reports";

import MultipleLoanOverview from '../MultipleLoanOverview/MultipleLoanOverview';

import Utility from 'lib/loanmanagement/utility';

const currency = Utility.currencyConverter();

class SpreadRiskTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMultipleLoanOverview: false,
      filterValue: '',
      multipleLoanOverviewProps: {},

      order: 'asc',
      orderBy: 'overdue',
    };
  }


  handleRequestSort = (property, event) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  componentDidMount() {
  }

  openMultipleLoanOverview = (row) => {
    this.props.filterType === 'SBI_NAME' ?
      this.setState({ filterValue: { sbiName: row.name, sbiCode: row.sbiCode } }) :
      this.setState({ filterValue: row.name });
    this.setState({ showMultipleLoanOverview: true });
  }

  render() {
    const {
      classes,
    } = this.props;

    let totalOutstanding = 0;
    const calcTotalOutstanding = (value) => {
      totalOutstanding += value;
      return value;
    }

    let totalNoOfLoans = 0;
    const calclTotalLoans = value => {
      totalNoOfLoans += value;
      return value;
    }

    let totalOverdue = 0;
    const calcTotalOverdue = (value) => {
      totalOverdue += value;
      return value;
    }

    let totalPortfolio = 0
    const calcTotalPortfolio = value => {
      totalPortfolio += value;
      return value;
    }

    let totalPercentageOverdue = 0
    const calcTotalpercentageOverdue = value => {
      totalPercentageOverdue += value;
      return value;
    }

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeaderCell}>
                <TableSortLabel
                  active={this.state.orderBy === 'name'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'name')}
                >
                  •
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>
                <TableSortLabel
                  active={this.state.orderBy === 'outstandingLoan'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'outstandingLoan')}
                >
                  Outstanding Loan
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>
                <TableSortLabel
                  active={this.state.orderBy === 'percentagePortfolio'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'percentagePortfolio')}
                >
                  % of Porfolio
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>
                <TableSortLabel
                  active={this.state.orderBy === 'noOfLoans'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'noOfLoans')}
                >
                  No-of-Loans
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>
                <TableSortLabel
                  active={this.state.orderBy === 'overdue'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'overdue')}
                >
                  Over Due
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>
                <TableSortLabel
                  active={this.state.orderBy === 'percentageOverdue'}
                  direction={this.state.order}
                  onClick={this.handleRequestSort.bind(this, 'percentageOverdue')}
                >
                  % Over Due
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Utility.stableSort(this.props.tableData, Utility.getSorting(this.state.order, this.state.orderBy))
                .map((row, index) => (
                  <TableRow key={index}
                    onClick={() => this.openMultipleLoanOverview(row)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell className={classes.tableBodyCell}>{row.name}</TableCell>
                    <TableCell className={classes.tableBodyCellNumber}>{currency(calcTotalOutstanding(row.outstandingLoan))}</TableCell>
                    <TableCell className={classes.tableBodyCellNumber}>{(calcTotalPortfolio(row.percentagePortfolio)).toFixed(2)} %</TableCell>
                    <TableCell className={classes.tableBodyCellNumber}>{calclTotalLoans(row.noOfLoans)}</TableCell>
                    <TableCell className={classes.tableBodyCellNumber}>{currency(calcTotalOverdue(row.overdue))}</TableCell>
                    <TableCell className={classes.tableBodyCellNumber}>{(row.percentageOverdue).toFixed(2)} %</TableCell>
                  </TableRow>
                ))
            }
            <TableRow>
              <TableCell className={classes.tableHeaderCell}>Total</TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>{currency(totalOutstanding)}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>{totalPortfolio.toFixed(2)} %</TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>{totalNoOfLoans}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber}>{currency(totalOverdue)}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber}></TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Drawer
          anchor="bottom"
          open={this.state.showMultipleLoanOverview}
          onClose={() => { this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview }) }}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <MultipleLoanOverview
              filterType={this.props.filterType}
              filterValue={this.state.filterValue}
              toggleDrawer={() => { this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview }) }}
              origin='SPREAD_RISK'
              overviewDate={this.props.overviewDate}
            />
          </div>
        </Drawer>
      </div>
    );
  }
}

SpreadRiskTable.propTypes = {
  tableData: PropTypes.array.isRequired,
  overviewDate: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {

  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestMultipleOverviewData: (SBI_Code, date) => {
      dispatch(requestMultipleOverviewData(SBI_Code, date));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SpreadRiskTable));
