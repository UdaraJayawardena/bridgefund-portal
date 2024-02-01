/* eslint-disable no-nested-ternary */
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
// import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";
import {
  // Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import {
  getWithdrwalsforSelectedLoan,
  clearWithdrwalsforSelectedLoan
} from "store/loanmanagement/actions/FlexLoan.action";
import { getLocales } from "store/initiation/actions/Configuration.action";
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import Utility from "lib/loanmanagement/utility";

const CURRENCY = Utility.multiCurrencyConverter();

const styles = (/* theme */) => ({

});

class WithdrawalOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "id",
      currency: "EUR",
      country: "NL"
    };
  }

  componentDidMount() {
    const { lmContractSysId, isDashboardContent } = this.props;
    const urlContractId = (document.location.origin + document.location.pathname).split('flexLoanOverview/')[1];
    const contractId = (isDashboardContent ) ? lmContractSysId : (urlContractId ? urlContractId : this.props.contractId);
    if (contractId)
      // console.log("contractId ",contractId);
      this.props.getWithdrwalsforSelectedLoan(contractId);
    this.getLocales();
  }

  getLocales = async () => {
    const { country, currency } = this.props.selectedLoan;

    if (country && currency) {
      this.props.getLocales({countryCode: country, currencyCode: currency})
			.then(res => {
        if (!res || res.length === 0) return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        
				this.setState({ 
          currency: res[0].currencyCode, 
          locale: res[0].locale
        });
			})
			.catch(err => { console.log('getLocales err ', err); });    
    }
  }

  componentWillUnmount() {
    this.props.clearWithdrwalsforSelectedLoan();
  }

  render() {

    const { /* classes, */ withdrawals } = this.props;
    const { locale, currency } = this.state;

    return (
      <div>
        <Table aria-label="simple table">
          <TableHead style={{ background: '#eeeeee' }}>
            <TableRow >
              <TableCell style={{ borderTopLeftRadius: '10px' }}>Date</TableCell>
              <TableCell align="right">Old-Outstanding-Amount</TableCell>
              <TableCell align="right">Withdrawal-Amount</TableCell>
              <TableCell align="right">New-Outstanding</TableCell>
              <TableCell align="right">Interest-Only-Limit</TableCell>
              <TableCell align="right">Base-Amount-for-DD</TableCell>
              <TableCell align="right">No-of-DD</TableCell>
              <TableCell style={{ borderTopRightRadius: '10px' }} align="right">New-DD-Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.length === 0 ?

              <TableRow>
                <TableCell align="center" colSpan={8}>
                  {'No withdrawals to show'}
                </TableCell>
              </TableRow>

              :

              Utility.stableSort(withdrawals, Utility.getSorting(this.state.order, this.state.orderBy)).map((withdrawal, index) =>
                <TableRow key={index} >
                  <TableCell>{moment(withdrawal.date).format("DD-MM-YYYY")}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.outstandingAmount.toFixed(2), locale, currency)}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.withdrawalAmount.toFixed(2), locale, currency)}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.newOutstandingAmount.toFixed(2), locale, currency)}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.interestOnlyLimitAmount.toFixed(2), locale, currency)}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.baseForDdAmount.toFixed(2), locale, currency)}</TableCell>
                  <TableCell align="right">{withdrawal.plannedNumberOfDirectDebits}</TableCell>
                  <TableCell align="right">{CURRENCY(withdrawal.newDirectDebitAmount.toFixed(2), locale, currency)}</TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
    );
  }

}


WithdrawalOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  contractId: PropTypes.string,
  withdrawals: PropTypes.array,
  getWithdrwalsforSelectedLoan: PropTypes.func.isRequired,
  clearWithdrwalsforSelectedLoan: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  lmContractSysId: PropTypes.string,
  selectedLoan: PropTypes.object,
  displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    withdrawals: state.lmglobal.flexLoanWithdrawals,
    isDashboardContent: state.user.isDashboardContent,
    lmContractSysId: state.lmglobal.selectedLoan.contractId,
    selectedLoan: state.lmglobal.selectedLoan
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getWithdrwalsforSelectedLoan: contractId => {
      dispatch(getWithdrwalsforSelectedLoan(contractId));
    },
    clearWithdrwalsforSelectedLoan: () => (dispatch(clearWithdrwalsforSelectedLoan())),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WithdrawalOverview));
