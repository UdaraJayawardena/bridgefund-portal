import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import moment from 'moment';
import classnames from 'classnames';

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell, TextField, FormControl, Select, MenuItem } from "@material-ui/core";

import Button from "components/loanmanagement/CustomButtons/Button";

import { displayNotification } from "store/loanmanagement/actions/Notifier";

import { claimLoan, getPlatformParameters } from 'store/loanmanagement/actions/SmeLoans';

import CurrentLoanData from './CurrentLoanData';
import { smeLoanType } from 'constants/loanmanagement/sme-loan';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
import { DDtype } from "constants/loanmanagement/sme-loan-repayment-direct-debits";

import Util from 'lib/loanmanagement/utility';
const currency = Util.multiCurrencyConverter();

class ClaimLoan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalDiscount: 0,
      contractId: 'SBF',
      startDate: moment().format('YYYY-MM-DD'),
      outstandingNormalDD: 0,
      missedNormalDD: 0,
      outstandingAmountNormalDD: 0,
      outstandingSpecialDD: 0,
      missedSpecialDD: 0,
      outstandingAmountSpecialDD: 0,
      totalOutstandingAmount: 0,
      partialPaymentAmount: 0,
      discountOnInterest: 0,
      discountOnInitialFee: 0,
      standardTotalDiscount: 0,
      sentToBankDD: 0,
      latestDate: null,
      smeLoanType: smeLoanType.FIXED,
      claimAmount: 0,
      stopDirectDebitIndicator: 'n',
      contact: ''
    };
  }

  componentDidMount () {
    this.props.getPlatformParameters({ platformName: "BridgeFund BV"})
      .then((response) => {
        if(response.success){
          this.setState({contact : response.data && response.data[0].contactDetails});
        }

      })
      .catch(error => {
        console.error(error);
      });
  }

  confirmClaimLoan = () => {
    this.setState({ disabled: true });

    const smeLoanTransaction = this.props.smeLoanTransactions.find(tr => tr.type === DDtype.NORMAL);

    const requestData = {
      stopDirectDebitIndicator: this.state.stopDirectDebitIndicator,
      amount: this.state.claimAmount * -1,
      smeLoan: {
        _id: this.props.smeLoan._id,
        contractId: this.props.smeLoan.contractId,
        closingPaymentAmount: Number(this.closingPaymentAmount.toFixed(2)),
        claimAmount: Number(this.state.claimAmount),
        totalOutstandingAmount: Util.toFixed(this.state.totalOutstandingAmount),
        type: this.props.smeLoan.type,
        country: this.props.smeLoan.country ? this.props.smeLoan.country : 'NL',
        currency: this.props.smeLoan.currency ? this.props.smeLoan.currency : 'EUR',
        language: this.props.smeLoan.language ? this.props.smeLoan.language : 'nl'
      },
      mandate: {
        _id: smeLoanTransaction.mandate,
        mandateId: smeLoanTransaction.mandateId,
      },
      smeDetail: {
        id: this.props.smeDetails.id,
        email: this.props.smeDetails.email,
        firstName: this.props.smeDetails.firstName,
        lastName: this.props.smeDetails.lastName
      },
      contact: this.state.contact
    };
    this.props.claimLoan(requestData)
      .then(() => {
        this.props.onClose();
      })
      .catch(error => {
        console.error(error);
      });

  };

  calculateFormDisplayData = (formData) => {
    this.setState({ ...formData });
  };

  get closingPaymentAmount() {
    return this.state.totalOutstandingAmount + this.state.partialPaymentAmount;
  }

  get staticstandardClaimAmount() {
    return Number((this.closingPaymentAmount * 0.15).toFixed(2));
  }

  get standardClaimAmount() {
    const val = Number((this.closingPaymentAmount * 0.15)).toFixed(2);
    // eslint-disable-next-line no-nested-ternary
    return (this.state.claimAmount === 0) ? (isNaN(val) ? 0 : val) : this.state.claimAmount;
  }

  inputStandedClaimAmount = (val) => {
    this.setState({ claimAmount: val });
  }

  handleInputChange = (event) => {

    if (event.target) {
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  handleCustomInputChange = (name, value) => {

    this.setState({ [name]: value });
  };

  handleDropDownChanges = (event) => {
    this.setState({ stopDirectDebitIndicator : event.target.value});
  }

  render() {
    const { classes, locale, smeLoan, symbol, decimalSeparator, thousandSeparator} = this.props;

    return (
      <div>
        <Table id="claim-overview">
          <TableBody>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold, classes.alignCenter)} colSpan={5}>SME LOAN CLAIM OVERVIEW</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <CurrentLoanData
          key="claim-overview-content"
          saveCurrentLoanData={this.calculateFormDisplayData}
          smeLoanTransactions={this.props.smeLoanTransactions}
          smeLoan={this.props.smeLoan}
          parentState={this.state}
          handleNumberInput={this.handleInputChange}
          closingPaymentAmount={this.closingPaymentAmount}
          usage='claim'
          lastestWithdrawalOrder={this.props.lastWithdrawalOrder}
          locale={locale}
          symbol={symbol}
          decimalSeparator={decimalSeparator}
          thousandSeparator={thousandSeparator}
        />

        <Table id="claim-loan-table">
          <TableBody id="claim-loan-table-body">
            <TableRow>
              <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold, classes.alignCenter)} colSpan={5}>CLAIM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Claim</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <MultiCurrencyCustomFormatInput
                  type="text"
                  id="claimAmount"
                  name="claimAmount"
                  numberformat={this.standardClaimAmount}
                  className={classes.amountInput}
                  changeValue={(val) => { this.handleCustomInputChange('claimAmount', val); this.inputStandedClaimAmount(val); }}
                  formControlProps={{
                    fullWidth: true
                  }}
                  symbol={symbol}
                  decimalSeparator={decimalSeparator}
                  thousandSeparator={thousandSeparator}
                />
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>Stand Claim Amount (15%)</TableCell>
              <TableCell id="static-standard-claim-amount" className={classnames(classes.tableCellLessPadding)}>{currency(this.staticstandardClaimAmount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>Stop Direct-Debits y=Yes, n=No</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <FormControl className={classes.formControl}>
                  <Select
                    id="stop-direct-debit-indicator"
                    name="stopDirectDebitIndicator"
                    value={this.state.stopDirectDebitIndicator}
                    onChange={this.handleDropDownChanges}
                  >
                    <MenuItem key={`stop-direct-debit-indicator_Yes`} value={'y'}>Yes</MenuItem>
                    <MenuItem key={`stop-direct-debit-indicator_Np`} value={'n'}>No</MenuItem>
                  </Select>
            </FormControl>
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            </TableRow>
            <TableRow></TableRow>

            <TableRow></TableRow>
            <TableRow></TableRow>
            <TableRow></TableRow>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button id="claim-cancel-button" onClick={this.props.onClose} disabled={this.state.isLoading}>CANCEL</Button>
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button id="process-claim-button" disabled={this.state.disabled} onClick={this.confirmClaimLoan}>PROCESS CLAIM</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

ClaimLoan.propTypes = {
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  claimLoan: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  lastWithdrawalOrder: PropTypes.object,
  getPlatformParameters: PropTypes.func,
  locale: PropTypes.string,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    claimLoan: requestData => {
      return dispatch(claimLoan(requestData));
    },
    getPlatformParameters: (data) => dispatch(getPlatformParameters(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(ClaimLoan));
