import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import moment from 'moment';
import classnames from 'classnames';

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";

import Button from "components/loanmanagement/CustomButtons/Button";
import Loader from "components/loanmanagement/CustomLoader/Loader.jsx";
import TikkieMultipleUrlCard from "components/loanmanagement/TikkieMultipleUrlCard/TikkieMultipleUrlCard.jsx";
import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { redeemLoan } from 'store/loanmanagement/actions/SmeLoans';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';

import { smeLoanType } from "constants/loanmanagement/sme-loan";

import CurrentLoanData from './CurrentLoanData';

class RedeemLoan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalDiscount: 0,
      contractNo: 'SBF',
      startDate: moment().format('YYYY-MM-DD'),
      outstandingNormalDD: 0,
      missedNormalDD: 0,
      dailyAmountNormalDD: 0,
      outstandingAmountNormalDD: 0,
      outstandingSpecialDD: 0,
      missedSpecialDD: 0,
      dailyAmountSpecialDD: 0,
      outstandingAmountSpecialDD: 0,
      totalOutstandingAmount: 0,
      partialPaymentAmount: 0,
      discountOnInterest: 0,
      discountOnInitialFee: 0,
      standardTotalDiscount: 0,
      sentToBankDD: 0,
      sentToBankNormalDD: 0,
      sentToBankSpecialDD: 0,
      latestDate: null,
      smeLoanType: smeLoanType.FIXED,
      redeemResult: {
        isSuccess: false,
        // smeLoan: null,
        // parentSmeLoan: null,
      },
      tikkieRequestUrls: [],
      isShowTikkeRequestCopy: false,
      isShowWarning: false,
      isUrlCopied: false,
      isRedeemRequestSent: false,
      isLoading: false,
      expiryDate: null

    };
  }

  // componentWillUnmount() { }

  componentDidMount() {
    const systemDate = moment().format('YYYY-MM-DD');
    // if(this.props.simulations.systemDate != null){
    //   systemDate = moment(this.props.simulations.systemDate).format('YYYY-MM-DD');
    // }
    this.props.getNextWorkingDay(systemDate, 3)
      .then((result) => {
        this.setState({ expiryDate: result });
      });
  }

  handleNumberInput = (name, value) => {

    value = Number(value);
    if (value > 0) value = value * -1;
    this.setState({ [name]: value });
  };

  confirmRedeemLoan = () => {
    if (this.props.smeLoan.status !== 'outstanding') {
      this.props.displayNotification('This loan cannot early redeemed (loan status not outstanding).', 'warning');
    } else if (this.state.expiryDate == null) {
      this.props.displayNotification('This loan cannot early redeemed (expiry date of tikkie message cannot generate).', 'warning');
    }
    else {
      if (!this.state.isRedeemRequestSent) {
        this.setState({ isRedeemRequestSent: true, isLoading: true }, function () {
          const _state = {};
          const requestData = {
            smeLoan: {
              _id: this.props.smeLoan._id,
              contractId: this.props.smeLoan.contractId,
              country: this.props.smeLoan.country,
              currency: this.props.smeLoan.currency,
              contractIdExtension: this.props.smeLoan.contractIdExtension,
              type: this.props.smeLoan.type,
              status: this.props.smeLoan.status,
              closingPaymentAmount: Number(this.closingPaymentAmount.toFixed(2)),
              discountAmount: this.state.totalDiscount,
              expiryDate: this.state.expiryDate
            }
          };
          this.props.redeemLoan(requestData, this.props.smeLoan.language)
            .then(result => {
              const redeemResult = {
                isSuccess: true,
                smeLoan: result.smeLoan,
                // parentSmeLoan: result.parentSmeLoan,
              };

              Object.assign(_state, { tikkieRequestUrls: result.tikkieData === null ? [] : result.tikkieData, isShowTikkeRequestCopy: result.tikkieData === null ? false : true, isShowWarning: false, redeemResult, isRedeemRequestSent: false });
              if(result.tikkieData !== null) this.props.displayNotification('Tikkie payment request sent', 'success');
              if (result.tikkieData === null) {
                this.props.onClose();
              }

            })
            .catch(error => {
              console.error(error);
              _state.isRedeemRequestSent = false;
            })
            .finally(() => {
              _state.isLoading = false;
              this.setState(_state);
            });
        });
      }
    }



  };



  calculateFormDisplayData = (formData) => {

    const totalDiscount = formData.standardTotalDiscount;
    this.setState({ ...formData, totalDiscount });
  };

  get closingPaymentAmount() {
    return this.state.totalOutstandingAmount + this.state.partialPaymentAmount + this.state.totalDiscount;
  }

  render() {
    const { classes, locale, symbol, decimalSeparator, thousandSeparator } = this.props;
    return (
      <div>
        <Table id="redeem-loan-table">
          <TableBody id="redeem-loan-table-body">
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold, classes.alignCenter)} colSpan={5}>EARLY REDEMPTION</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
            </TableRow>
            {/* <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold, classes.alignCenter)} colSpan={5}>(Old) Parent Loan</TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
        <CurrentLoanData
          key="redeem-loan-content"
          saveCurrentLoanData={this.calculateFormDisplayData}
          smeLoanTransactions={this.props.smeLoanTransactions}
          smeLoan={this.props.smeLoan}
          parentState={this.state}
          closingPaymentAmount={this.closingPaymentAmount}
          handleNumberInput={this.handleNumberInput}
          usage='redeem'
          locale={locale}
          symbol={symbol}
          decimalSeparator={decimalSeparator}
          thousandSeparator={thousandSeparator}
        />
        <Table id="redeem-loan-action-table">
          <TableBody>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button id="redeem-loan-cancel-button" onClick={this.props.onClose}>CANCEL</Button>
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button id="redeem-loan-confirm-button" onClick={this.confirmRedeemLoan} disabled={this.state.isRedeemRequestSent}>CONFIRM</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TikkieMultipleUrlCard
          key="redeem-loan-tikkie-content"
          title={(this.state.tikkieRequestUrls.length > 1) ? 'Tikkie Request URLs' : 'Tikkie Request URL'}
          cancel='close'
          open={this.state.isShowTikkeRequestCopy}
          handleCancel={() => {
            this.setState({ isShowTikkeRequestCopy: false }, function () {
              this.props.onClose();
            });
          }}
          tikkieUrls={this.state.tikkieRequestUrls}
        />

        <Loader key="redeem-loan-loader" open={this.state.isLoading} />

      </div>
    );
  }
}

RedeemLoan.propTypes = {
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  redeemLoan: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  getNextWorkingDay: PropTypes.func.isRequired,
  simulations: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  decimalSeparator: PropTypes.string.isRequired,
  thousandSeparator: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  return {
    smeDetails: state.lmglobal.customerDetails,
    loan: state.lmglobal.selectedLoan,
    simulations: state.configurations.simulations,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    redeemLoan: (requestData, language) => {
      return dispatch(redeemLoan(requestData, language));
    },
    getNextWorkingDay: (startDate, noOfDaysAhead) => {
      return dispatch(getNextWorkingDate(startDate, noOfDaysAhead));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(RedeemLoan));
