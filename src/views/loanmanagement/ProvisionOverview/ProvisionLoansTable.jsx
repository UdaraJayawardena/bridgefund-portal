// @ts-nocheck
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import withStyles from "@material-ui/core/styles/withStyles";
// import styles from 'assets/jss/material-dashboard-react/components/tasksStyle.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Button
} from "@material-ui/core";

import Util from "lib/loanmanagement/utility";
import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { changeCustomerDetails } from "store/loanmanagement/actions/HeaderNavigation";
import { selectLoan } from 'store/loanmanagement/actions/SmeLoans';
import { clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';

const CURRENCY = Util.multiCurrencyConverter();
const currencyPercentage = Util.multiCurrencyPercentage;

const styles = {
  head: {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    paddingTop: 0,
    paddingBottom: 0,
  }
};

class ProvisionLoansTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "contractId",
    };
  }

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  redirectToSMEO= (sme) => { 
    this.props.changeCustomerDetails(sme);
    this.props.setNavigationInDashboards('Overview')
    .then(res => {
      if (res) {
        history.push(res);
        }
    });
  }

  redirectToSLO= (contractId) => {
    this.props.clearSelectedCustomer();
    this.props.selectLoan({contractId});
    this.props.setNavigationInDashboards('SingleLoanOverview')
    .then(res => {
      if (res) {
        history.push(res);
        }
    });
  }

  getLinkOrButttonForSME  = (sme) => {
    const { isDashboardContent } = this.props;
    return isDashboardContent ?
      <Button size="small" color="primary" onClick={() => this.redirectToSMEO(sme)}>{sme.company}</Button>
      :
      <Link to={`/user/smeProfile/${sme.id}`}>{sme.company}</Link>;
  }

  getLinkOrButttonForLoan = (loan) => {
    const { isDashboardContent } = this.props;
    return isDashboardContent ?
      <Button size="small" color="primary" onClick={() => this.redirectToSLO(loan.contractId)}>{loan.contractId}</Button>
      :
      <Link to={`/user/${loan.smeLoanType === 'fixed-loan' ? 'singleLoanOverview' : 'flexLoanOverview'}/${loan.contractId}`} 
          onClick={() => console.log('Heading to /')}>
        {loan.contractId}
      </Link>;
  }

  render() {
    const { classes, defaultLoans, locale, currencyCode } = this.props;

    return (

      <Table stickyHeader style={{ width: '100%' }}>
        <TableHead >
          <TableRow>
            <TableCell className={classes.head}>
              <TableSortLabel
                active={this.state.orderBy === 'contractId'}
                // @ts-ignore
                direction={this.state.order}
                onClick={this.handleRequestSort.bind(this, 'contractId')}>
                ContractId
              </TableSortLabel>
            </TableCell>
            <TableCell className={classes.head}>
              SME Name
            </TableCell>
            <TableCell className={classes.head} align="right">
              <TableSortLabel
                active={this.state.orderBy === 'overallTotalLoanAmount'}
                // @ts-ignore
                direction={this.state.order}
                onClick={this.handleRequestSort.bind(this, 'overallTotalLoanAmount')}>
                Total Loan
                  </TableSortLabel>
            </TableCell>
            <TableCell className={classes.head} align="right">
              <TableSortLabel
                active={this.state.orderBy === 'overallOutstandingTotalAmount'}
                // @ts-ignore
                direction={this.state.order}
                onClick={this.handleRequestSort.bind(this, 'overallOutstandingTotalAmount')}>
                Outstanding
                  </TableSortLabel>
            </TableCell>
            <TableCell className={classes.head} align="right">
              <TableSortLabel
                active={this.state.orderBy === 'totalOverdueAmount'}
                // @ts-ignore
                direction={this.state.order}
                onClick={this.handleRequestSort.bind(this, 'totalOverdueAmount')}>
                Overdue
                  </TableSortLabel>
            </TableCell>
            <TableCell className={classes.head} align="right">
              % Overdue
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            Util.stableSort(defaultLoans, Util.getSorting(this.state.order, this.state.orderBy))
              .map((loan, index) => (
                <TableRow key={index}>
                  <TableCell className={classes.cell}> 
                      {this.getLinkOrButttonForLoan(loan)}
                  </TableCell>
                  <TableCell className={classes.cell}> 
                      {this.getLinkOrButttonForSME(loan.sme)}
                  </TableCell>
                  <TableCell align="right">{CURRENCY(loan.overallTotalLoanAmount, locale, currencyCode)}</TableCell>
                  <TableCell align="right">{CURRENCY(loan.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                  <TableCell align="right">{CURRENCY(loan.totalOverdueAmount, locale, currencyCode)}</TableCell>
                  <TableCell align="right">{currencyPercentage(((loan.totalOverdueAmount / loan.overallTotalLoanAmount) * 100).toFixed(2), locale)}</TableCell>
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
    );
  }
}

ProvisionLoansTable.propTypes = {
  classes: PropTypes.object.isRequired,
  defaultLoans: PropTypes.array,
  rtlActive: PropTypes.bool,
  setNavigationInDashboards: PropTypes.func,
  changeCustomerDetails: PropTypes.func,
  isDashboardContent: PropTypes.bool,
  selectLoan:PropTypes.func,
  clearSelectedCustomer: PropTypes.func.isRequired,
  locale: PropTypes.string,
  currencyCode: PropTypes.string
};

const mapStateToProps = state =>{
  return {
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    changeCustomerDetails: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(ProvisionLoansTable));
