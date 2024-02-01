import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import NewInterestPanelty from './NewInterestPenalty';
import CurrentInterestPanelty from './CurrentInterestPenalty';
import InterestPenalty from './InterestPenalty';
import { clearCalculatedDataOfLoanTransactions, clearSelectedLoan } from 'store/loanmanagement/actions/SmeLoans';
import { clearDirectDebits } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import moment from "moment";

const paneltyIndexStyles = {
  table: {
    width: "100%"
  },
  boldTableCell: {
    fontWeight: 500,
    border: '1px solid rgba(224,224,224,1)'
  },

  cellBorderStyle: {
    border: '1px solid rgba(224,224,224,1)'
  },
};
class InterestPaneltyOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locale: '',
      decimalSeparator: '',
      symbol: '',
      thousandSeparator: '',
    };
  }
  componentDidMount(){
    //this.getLocales();
  }
  componentWillUnmount() {
    if (this.props.origin === "ADMIN") {
      this.props.clearSelectedCustomer();
      this.props.clearSelectedLoan();
      this.props.clearDirectDebits();
      this.props.clearCalculatedDataOfLoanTransactions();
    }
  }
  render() {
    
    const { classes, penaltyTransaction , directdebits , locale, symbol, decimalSeparator, thousandSeparator } = this.props;
    
    const claimTransaction = directdebits && directdebits.length !== 0 ? directdebits.find(dd => (dd.type === 'claim')): {};
    
    const allPaidTransactions = directdebits && directdebits.length !== 0 ? directdebits.filter(item => (item.status === 'paid')): [];
    const allPaidSpecialDDTransactions = directdebits && directdebits.length !== 0 ? directdebits.filter(item => (item.description === 'Interest-Claim' && item.type === "special-dd")): [];

    const filteredTransactions =
    allPaidTransactions && allPaidTransactions.lenght !== 0 ? allPaidTransactions.filter(item =>
      moment(item.plannedDate).isBefore(claimTransaction.plannedDate)): [];
   
    const interestPaneltyCount = directdebits && directdebits.lenght !== 0 ? directdebits.filter(item=>item.type === 'interest-penalty').length : 0; 
 
    const totalCurrentAmount = filteredTransactions && filteredTransactions.lenght === 0 ? {} :filteredTransactions.reduce((n, {amount}) => n + amount, 0);
  
    const interestPanelty = directdebits && directdebits.lenght !== 0 ? directdebits.filter(item=>item.type === 'interest-penalty') : []; 

    const totalInterestPaneltyAmount = interestPanelty && interestPanelty.lenght === 0 ? 0 :interestPanelty.reduce((n, {amount}) => n + amount, 0);
    const positiveTotalInterestPaneltyAmount = totalInterestPaneltyAmount*-1;

    return (
      <Table id="interest-penalty-overview-table" className={classes.table} aria-label="simple table">
        <TableBody>
          <TableRow >
            <TableCell align="center" className={classes.boldTableCell} colSpan={11}>
              {'Stop/Change Interest Penalty Overview'}
            </TableCell>
          </TableRow>
          <InterestPenalty key="interest-penalty" contractId={penaltyTransaction.contractId} 
            locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator}/>
          <CurrentInterestPanelty key="current-interest-penalty" penaltyTransaction={penaltyTransaction}  selectedClaimTransaction= {claimTransaction} totalOutstandingOnClaimDate= {totalCurrentAmount} sumInterestPaneltyAmount= {positiveTotalInterestPaneltyAmount}
            locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator}/>
          <NewInterestPanelty key="new-interest-penalty" contractId={penaltyTransaction.contractId} totalOutstandingOnClaimDate= {totalCurrentAmount} paidSpecialDDTransactions= {allPaidSpecialDDTransactions} filteredTransactionsForClaimDate= {filteredTransactions} interestPaneltyCount={interestPaneltyCount} sumInterestPaneltyAmount= {positiveTotalInterestPaneltyAmount}
            locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator}/>
        </TableBody>
      </Table>
    );
  }
}

InterestPaneltyOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  penaltyTransaction: PropTypes.object.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  clearSelectedLoan: PropTypes.func.isRequired,
  clearDirectDebits: PropTypes.func.isRequired,
  clearCalculatedDataOfLoanTransactions: PropTypes.func.isRequired,
  origin: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    directdebits: state.smeLoanTransaction.directdebits,
    loan: state.lmglobal.selectedLoan,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    clearSelectedLoan: () => {
      dispatch(clearSelectedLoan());
    },
    clearDirectDebits: () => {
      dispatch(clearDirectDebits());
    },
    clearCalculatedDataOfLoanTransactions: () => {
      dispatch(clearCalculatedDataOfLoanTransactions());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(paneltyIndexStyles)(InterestPaneltyOverview));