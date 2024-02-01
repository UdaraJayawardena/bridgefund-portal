import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import moment from 'moment';
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { getSingleLoanOverviewData } from 'store/loanmanagement/actions/SmeLoans';
import Util from "lib/loanmanagement/utility";
import { TERMS_MAPPING } from "store/loanmanagement/constants/Contracts";
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
class InterestPenalty extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.getSingleLoanOverviewData(this.props.contractId);
  }

  mapPlannedDirectDebitsToDuration = (plannedNumberOfDirectDebits, frequency) => {
    let duration = -1;

    Object.keys(TERMS_MAPPING).forEach((key) => {
      const item = TERMS_MAPPING[key];

      if (item[frequency] === plannedNumberOfDirectDebits) {
        // @ts-ignore
        duration = key;
      }
    });

    return duration;
  }

  getPartialOverdue = () => {
    const { locale , loan, calculatedDataOfLoanTransactions } = this.props;

    if (loan.status === 'loan-normally-settled' || loan.status === 'loan-refinanced' || loan.status === 'loan-fully-redeemed') {
      return currency(0 , locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR');
    }
    if (calculatedDataOfLoanTransactions.partialPaymentAmount) {
      return currency(calculatedDataOfLoanTransactions.partialPaymentAmount * -1 , locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR');
    }
    return currency(0 ,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR');
  }

  render() {
    const { classes, loan, calculatedDataOfLoanTransactions, smeDetails } = this.props;
    return (
      <React.Fragment>
        <TableRow>
          <TableCell className={classes.boldTableCell}>{'Contact-Id.'}</TableCell>
          <TableCell className={classes.cellBorderStyle}>{loan.contractId}</TableCell>
          <TableCell className={classes.boldTableCell}>{'Status'}</TableCell>
          <TableCell className={classes.cellBorderStyle}>{loan.status}</TableCell>
          <TableCell className={classes.boldTableCell} colSpan={2}>{'SME-name'}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={4}>{smeDetails.company}</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
        
        </TableRow>
        <TableRow>
        <TableCell className={classes.cellBorderStyle} colSpan={11}>&nbsp;</TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

InterestPenalty.propTypes = {
  classes: PropTypes.object.isRequired,
  calculatedDataOfLoanTransactions: PropTypes.object,
  contractId: PropTypes.string,
  loan: PropTypes.object.isRequired,
  getSingleLoanOverviewData: PropTypes.func.isRequired,
  smeDetails: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    calculatedDataOfLoanTransactions: state.lmglobal.calculatedDataOfLoanTransactions,
    loan: state.lmglobal.selectedLoan,
    smeDetails: state.lmglobal.customerDetails,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSingleLoanOverviewData: (contractId) => {
      dispatch(getSingleLoanOverviewData(contractId));
    },
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(paneltyStyles)(InterestPenalty));