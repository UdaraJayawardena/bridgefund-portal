import React, { Component } from "react";
import { connect } from "react-redux";
import moment from 'moment';
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import { TextField, TableRow, TableCell } from '@material-ui/core';
import Util from "lib/loanmanagement/utility";
import { changeInterestPenaltyDescription } from 'store/loanmanagement/actions/InterestPenalty';

const currency = Util.multiCurrencyConverter();
const paneltyStyles = {
  table: {
    width: "100%"
  },
  boldTableCell: {
    fontWeight: 500,
    border: '1px solid rgba(224,224,224,1)',
    padding: '8px!important',
  },

  cellBorderStyle: {
    border: '1px solid rgba(224,224,224,1)',
    padding: '8px!important',
  },
};
class CurrentInterestPenalty extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  componentDidMount() {
    this.props.changeInterestPenaltyDescription(this.props.penaltyTransaction.description);
  }
  render() {
    const { classes, penaltyTransaction, penaltyDescription, selectedClaimTransaction , totalOutstandingOnClaimDate, sumInterestPaneltyAmount , loan,
      locale, symbol, decimalSeparator, thousandSeparator } = this.props;
    
    return (
      <React.Fragment>
        <TableRow>
          <TableCell align="center" className={classes.boldTableCell} colSpan={11}>{'Current Interest Penalty'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.cellBorderStyle}>{'Claim-date'}</TableCell>
          <TableCell className={classes.cellBorderStyle} style={{minWidth:'80px'}}>{ Object.keys(selectedClaimTransaction).length === 0 ? '' :moment(selectedClaimTransaction.plannedDate).format('DD-MM-YYYY')}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.cellBorderStyle}>{'Outstanding-amount on claim-date'}</TableCell>
          <TableCell className={classes.cellBorderStyle} align="right">{currency(totalOutstandingOnClaimDate ,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.cellBorderStyle} colSpan={11}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.cellBorderStyle}>{'Term-number'}</TableCell>
          <TableCell className={classes.cellBorderStyle}>{penaltyTransaction.termNumber}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.cellBorderStyle}>{'Description'}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={6}>
          <TextField style={{ width: '100%' }} id="penalty-description" name="penaltyDescription" value={penaltyDescription} onChange={(event) => { this.props.changeInterestPenaltyDescription(event.target.value) }} />
          </TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={4}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.boldTableCell}>{'Current Interest-Penalty'}</TableCell>
          <TableCell className={classes.cellBorderStyle} align="right">{currency(sumInterestPaneltyAmount,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

CurrentInterestPenalty.propTypes = {
  classes: PropTypes.object.isRequired,
  penaltyTransaction: PropTypes.object.isRequired,
  outstandingAmountOnClaimDate: PropTypes.number.isRequired,
  penaltyDescription: PropTypes.string.isRequired,
  changeInterestPenaltyDescription: PropTypes.func.isRequired,
  selectedClaimTransaction: PropTypes.object.isRequired,
  totalOutstandingOnClaimDate: PropTypes.number.isRequired,
  sumInterestPaneltyAmount: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  const loanData = state.lmglobal.calculatedDataOfLoanTransactions;
  return {
    outstandingAmountOnClaimDate: loanData.outstandingPrincipleAmount + loanData.outstandingOtherCostAmount,
    penaltyDescription: state.interestPenalty.penaltyDescription,
    loan: state.lmglobal.selectedLoan,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeInterestPenaltyDescription: (description) => {
      dispatch(changeInterestPenaltyDescription(description));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(paneltyStyles)(CurrentInterestPenalty));