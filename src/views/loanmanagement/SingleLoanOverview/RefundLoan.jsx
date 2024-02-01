/* eslint-disable prefer-const */
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import moment from 'moment';
import classnames from 'classnames';

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell, Dialog, DialogContent, DialogActions, DialogContentText } from "@material-ui/core";

import Button from "components/loanmanagement/CustomButtons/Button";

import { displayNotification } from "store/loanmanagement/actions/Notifier";

import { refundLoan } from 'store/loanmanagement/actions/SmeLoans';

import RefundLoanData from './RefundLoanData';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
import { getWithdrwalsforSelectedLoan } from "store/loanmanagement/actions/FlexLoan.action";

class RefundLoan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sme: '',
      contract: '',
      refinanced: 0,
      payOut: 0,
      loan: 0,
      initialFee: 0,
      interest: 0,
      othercosts: 0,
      recurringFee: 0,
      otherCostFee: 0,
      totalToRecieve: 0,
      receivedNormalDD: 0,
      receivedSpecialDD: 0,
      receivedDiscount: 0,
      receivedClosingPayment: 0,
      receivedTotal: 0,
      sentToBankPrinciplePart: 0,
      sentToBankIntialFeePart: 0,
      sentToBankInterest: 0,
      sentToBankOtherCost: 0,
      sentToBankTotal: 0,
      summaryReceive: 0,
      summarySentToBank: 0,
      partialPayment: 0,
      refundCost: 0,
      transactionId: 0,
      date: moment().add(1, 'd').format('YYYY-MM-DD'),
      transactionStatus: '',
      transactionDescription: '',
      claim: 0,
      interestPenalty: 0,
      partialPaymentRefund: 0,
      totalPartialPayments: 0,
      partialPaymentRefundTransactionId: 0,
      disabled: false,
      clearBtnDisabled: false,
      openModal: false
    };
  }

  confirmRefundLoan = (data) => {

    if (data === 'refund' && this.state.refundCost < 0) { 
      this.props.displayNotification('Refund can only take place if partial amount is positive', 'warning'); this.setState({ disabled: false, clearBtnDisabled: false }); return; 
    }

    let des = 'Verrekening teveel betaalde interest/kosten inzake lening';
    
    let clearType;
    if (data === 'clear' && this.state.refundCost >= 0) {
      clearType = 'profit';
    }
    else if(data ==='clear' && this.state.refundCost  <= 0) {
      clearType = 'loss';
    }

    const requestData = {
      id: this.state.transactionId,
      status: this.state.transactionStatus,
      amount: Number((this.state.refundCost).toFixed(2)) * -1,
      selectedType: data === 'refund' ? data : clearType,
      smeLoan: {
        _id: this.props.smeLoan._id,
        contractId: this.props.smeLoan.contractId,
      },
      country: this.props.smeLoan.country,
      currency: this.props.smeLoan.currency,
      language: this.props.smeLoan.language,
      paymentOrder: {
        date: this.state.date,
        contractId: this.props.smeLoan.contractId,
        description: des + this.props.smeLoan.contractId,
        amount: Number((this.state.refundCost).toFixed(2)),
        paymentReference: this.props.smeLoan.contractId,
      }
    };
    this.props.refundLoan(requestData)
      .then(() => {
        this.setState({ disabled: true , clearBtnDisabled: true});
        this.props.onClose();
      })
      .catch(error => {
        this.setState({ disabled: false , clearBtnDisabled: false});
        console.error(error);
      });
     
  };

  clearLoan = () => {

    this.setState({
      disabled: true,
      clearBtnDisabled: true
    });

    let selectedType = 'clear';
    const calculatedAmount =Number((this.state.totalToRecieve).toFixed(2)) +
    Number((this.state.receivedTotal).toFixed(2)) +
    Number((this.state.sentToBankTotal).toFixed(2)) +
    Number((this.state.totalPartialPayments).toFixed(2))+
    Number(this.props.totProfitLostAmount.toFixed(2));
   
    if (this.state.refundCost > Number((calculatedAmount).toFixed(2))) { this.props.displayNotification('Refund amount must always be less than calculated amount', 'warning'); this.setState({ disabled: false, clearBtnDisabled: false }); return; }

    if (this.state.refundCost > 50 || this.state.refundCost < -50) { this.props.displayNotification('A profit or loss can only be taken in to account when amount is between -50 and +50 euro', 'warning'); this.setState({ disabled: false, clearBtnDisabled: false }); return; }
   
    this.confirmRefundLoan(selectedType);

   
  }

  refundLoan = () => {
   
    this.setState({
      disabled: true,
      clearBtnDisabled: true
    });

    let selectedType = 'refund';
    const calculatedAmount =Number((this.state.totalToRecieve).toFixed(2)) +
    Number((this.state.receivedTotal).toFixed(2)) +
    Number((this.state.sentToBankTotal).toFixed(2)) +
    Number((this.state.totalPartialPayments).toFixed(2))+
    Number(this.props.totProfitLostAmount.toFixed(2));
    
    if (this.state.refundCost > Number((calculatedAmount).toFixed(2))) { 
      this.props.displayNotification('Refund amount must always be less than calculated amount', 'warning'); this.setState({ disabled: false, clearBtnDisabled: false }); return; 
    }
   
    this.confirmRefundLoan(selectedType);
  }

  calculateFormDisplayData = (formData) => {
    this.setState({ ...formData });
  };

  displayModal =() => {
    this.setState({openModal: !this.state.openModal });
  };

  clearConfirmation =() =>{
    let selectedType = 'clear';
    this.confirmRefundLoan(selectedType);
  }
changeRefundCost =(event) => {
  if (event.target) {
    this.setState({ [event.target.name]: event.target.value });
  } else {
    this.setState({ refundCost: Number(event) });
  }
}

  render() {
    
    const { classes, locale, symbol, decimalSeparator, thousandSeparator } = this.props;
    return (
      <div>
        <Table id="refund-loan-table">
          <TableBody id="refund-loan-table-body">
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.noBorder, classes.bold, classes.alignCenter)} colSpan={5}>REFUND OF PARTIAL PAYMENT</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <RefundLoanData
          key="refund-loan-content"
          saveRefundLoanData={this.calculateFormDisplayData}
          smeLoanTransactions={this.props.smeLoanTransactions}
          smeLoan={this.props.smeLoan}
          smeDetails={this.props.smeDetails}
          parentState={this.state}
          //refundAmount={this.state.refundCost}
          totalWithdrawalAmount={this.props.totWithdrawalAmount}
          totalProfitLostAmount= {this.props.totProfitLostAmount}
          locale={locale}
        />
        <Table id="refund-cost-table">
          <TableBody id="refund-loan-table-body">
         <TableRow>
        <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>To Refund</TableCell>
            <TableCell id="refund-loan-content-refund-cost-in-total" className={classnames(classes.tableCellLessPadding)}>
                <MultiCurrencyCustomFormatInput
                      className={classes.textField}
                      type="text"
                      id="interestOnlyLimit"
                      name="interestOnlyLimit"
                      numberformat={this.state.refundCost.toFixed(2)}
                      formControlProps={{
                        fullWidth: false
                      }}
                      changeValue={(event) => this.changeRefundCost(event)}
                      symbol={symbol}
                      decimalSeparator={decimalSeparator}
                      thousandSeparator={thousandSeparator}
                    />
              </TableCell>
              </TableRow>
              </TableBody>
              </Table>
        <Table id="refund-loan-action-table">
          <TableBody>
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button id="refund-loan-cancel-button" onClick={this.props.onClose}>CANCEL</Button>
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button disabled= {this.state.disabled} id="refund-loan-confirm-button" onClick={ this.refundLoan}>CONFIRM</Button>
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <Button disabled= {this.state.clearBtnDisabled} id="refund-loan-clear-loan-button" onClick={this.clearLoan}>CLEAR LOAN</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/* <Dialog id="refund-loan-clear-notification" open={this.state.openModal} aria-labelledby="delete-bank-transaction-types" aria-describedby="alert-dialog-description" onClose={this.clearConfirmation} >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'A profit or loss can only be taken in to account when amount is between -50 and +50 euro'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button id="refund-loan-clear-loan-ok-button" onClick={this.clearConfirmation}>
              OK
          </Button>
          </DialogActions>
        </Dialog> */}
      </div>
    );
  }
}

RefundLoan.propTypes = {
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  refundLoan: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  lastWithdrawalOrder:  PropTypes.object,
  totWithdrawalAmount:  PropTypes.array,
  totProfitLostAmount: PropTypes.number,
  locale: PropTypes.string,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    //withdrawals: state.lmglobal.flexLoanWithdrawals,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    refundLoan: requestData => {
      return dispatch(refundLoan(requestData));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(RefundLoan));
