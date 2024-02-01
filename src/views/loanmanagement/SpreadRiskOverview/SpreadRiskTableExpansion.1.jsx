import moment from 'moment';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";

import {
  Drawer, Table, TableBody, TableCell, TableHead, TableRow, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Tab, TableFooter
} from '@material-ui/core';

import { requestMultipleOverviewData } from "store/loanmanagement/actions/Reports";

import MultipleLoanOverview from '../MultipleLoanOverview/MultipleLoanOverview';

import Utility from 'lib/loanmanagement/utility';
import { ExpandMore } from '@material-ui/icons';

const currency = Utility.currencyConverter();

class SpreadRiskTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMultipleLoanOverview: false,
      filterValue: '',
      multipleLoanOverviewProps: {}

    };
  }

  componentDidMount() {
  }

  openMultipleLoanOverview = (row) => {
    this.props.filterType === 'SBI_NAME' ?
      this.setState({ filterValue: { sbiName: row.name, sbiCode: row.sbiCode } }) :
      this.setState({ filterValue: row.name });
    this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview });
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
              <TableCell className={classes.tableHeaderCell} style={{ width: '25%' }}> </TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>Outstanding Loan</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>% of Porfolio</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>No-of-Loans</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>Over Due</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>% Over Due</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '5%' }}> </TableCell>
            </TableRow>
          </TableHead>
        </Table>
        {
          this.props.tableData.map((row, index) => (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                <Table>
                  <TableBody>
                    <TableRow onClick={() => this.openMultipleLoanOverview(row)} >
                      <TableCell className={classes.tableBodyCell} style={{ width: '25%' }}>{row.name}</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '14%' }}>{currency(calcTotalOutstanding(row.outstandingLoan))}</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '14%' }}>{(calcTotalPortfolio(row.percentagePortfolio)).toFixed(2)} %</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '14%' }}>{calclTotalLoans(row.noOfLoans)}</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '14%' }}>{currency(calcTotalOverdue(row.overdue))}</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '14%' }}>{(row.percentageOverdue).toFixed(2)} %</TableCell>
                      <TableCell className={classes.tableBodyCellNumber} style={{ width: '5%' }}> </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <MultipleLoanOverview
                  filterType={this.props.filterType}
                  filterValue={
                    this.props.filterType === 'SBI_NAME' ?
                      { sbiName: row.name, sbiCode: row.sbiCode }
                      :
                      row.name
                  }
                  // toggleDrawer={() => { this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview }) }}
                  origin='SPREAD_RISK'
                  overviewDate={this.props.overviewDate}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))
        }
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell className={classes.tableHeaderCell} style={{ width: '25%' }}>Total</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>{currency(totalOutstanding)}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>{totalPortfolio.toFixed(2)} %</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>{totalNoOfLoans}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}>{currency(totalOverdue)}</TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '14%' }}></TableCell>
              <TableCell className={classes.tableHeaderCellNumber} style={{ width: '5%' }}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* <Drawer
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
        </Drawer> */}
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
