import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import classnames from 'classnames';

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";

import { DDstatus, DDtype } from "constants/loanmanagement/sme-loan-repayment-direct-debits";

import moment from 'moment';

import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { getPreviousWorkingDate } from 'store/loanmanagement/actions/Holidays';

import Util from 'lib/loanmanagement/utility';

const currency = Util.multiCurrencyConverter();

class RefundLoanData extends Component {

  constructor(props) {
    super(props);

    this.state = {
      displayData: this.props.parentState,
      refundCost: null,
      calculatedAmount: null
    };
  }

  componentDidMount() {

    this.refundDisaplyData();
    this.calculateTotal();
    this.props.saveRefundLoanData(this.state.displayData);
    this.setWarningMessage();
  }

  refundDisaplyData = () => {

    const { smeLoanTransactions } = this.props;
    const { displayData } = this.state;

    for (const smeLoanTrans of smeLoanTransactions) {

      if (smeLoanTrans.type === DDtype.PARTIAL_PAYMENT) {
        displayData.partialPayment += smeLoanTrans.amount;
        displayData.transactionId = smeLoanTrans.id;
        displayData.transactionStatus = smeLoanTrans.status;
        displayData.transactionDescription = smeLoanTrans.description;
      }

      if (smeLoanTrans.type === DDtype.PARTIAL_PAYMENT_REFUND) {
        displayData.partialPaymentRefund += smeLoanTrans.amount;
        displayData.partialPaymentRefundTransactionId = smeLoanTrans.id;
      }

      switch (smeLoanTrans.status) {
        case DDstatus.PAID:
          this.preparePaidDispalyData(smeLoanTrans);
          break;

        case DDstatus.SENT_TO_BANK:
          this.prepareSendtoBankDispalyData(smeLoanTrans);
          break;
        default: break;
      }
    }
  }

  preparePaidDispalyData = (data) => {
    const { displayData } = this.state;

    switch (data.type) {
      case DDtype.REFINANCE_PAYMENT:
        displayData.refinanced += data.amount;
        break;
      case DDtype.PAY_OUT:
        displayData.payOut += data.amount;
        break;
      case DDtype.INITIAL_FEE:
        displayData.initialFee += data.amount;
        break;
      case DDtype.INTEREST_FEE:
        displayData.interest += data.amount;
        break;
      case DDtype.RECURRING_FEE:
        displayData.recurringFee += data.amount;
        break;
      case DDtype.OTHER_COST_FEE:
        displayData.otherCostFee += data.amount;
        break;
      case DDtype.NORMAL:
        displayData.receivedNormalDD += data.amount;
        break;
      case DDtype.SPECIAL:
        displayData.receivedSpecialDD += data.amount;
        break;
      case DDtype.DISCOUNT_PAYMENT:
        displayData.receivedDiscount += data.amount;
        break;
      case DDtype.CLOSING_PAYMENT:
        displayData.receivedClosingPayment += data.amount;
        break;
      case DDtype.CLAIM:
        displayData.claim += data.amount;
        break;
      case DDtype.INTEREST_PENALTY:
        displayData.interestPenalty += data.amount;
        break;
      case DDtype.WITHDRAWAL_FEE:
        displayData.interest += data.amount;
        break;
      default: break;
    }
  }

  prepareSendtoBankDispalyData = (data) => {
    const { displayData } = this.state;

    if (data.type === DDtype.NORMAL) {
      displayData.sentToBankPrinciplePart += data.principleAmountPart;
      displayData.sentToBankIntialFeePart += data.initialCostAmountPart;
      displayData.sentToBankInterest += data.interestAmountPart;
      displayData.sentToBankOtherCost += data.recurringCostAmountPart;
    }

  }

  calculateTotal = () => {
    const { displayData } = this.state;
    const { smeLoan, totalProfitLostAmount } = this.props;
    
    let sumWithdrawalAmount;
    if (smeLoan.type === 'flex-loan') {
      sumWithdrawalAmount = this.props.totalWithdrawalAmount && this.props.totalWithdrawalAmount.length === 0 ? 0 : this.props.totalWithdrawalAmount.reduce((n, { withdrawalAmount }) => n + withdrawalAmount, 0);
    }
    else {
      sumWithdrawalAmount = 0;
    }
   

    displayData.othercosts = Number((displayData.recurringFee).toFixed(2)) + Number((displayData.otherCostFee).toFixed(2));

    displayData.loan = Number((displayData.payOut).toFixed(2)) + Number((displayData.refinanced).toFixed(2));

    smeLoan.type === 'fixed-loan' ? 
    displayData.totalToRecieve = Number((displayData.loan).toFixed(2)) +
      Number((displayData.initialFee).toFixed(2)) +
      Number((displayData.interest).toFixed(2)) +
      Number((displayData.othercosts).toFixed(2)) +
      Number((displayData.claim).toFixed(2)) +
      Number((displayData.interestPenalty).toFixed(2)): 
      displayData.totalToRecieve = (sumWithdrawalAmount*-1) +
      Number((0).toFixed(2)) +
      Number((displayData.interest).toFixed(2)) + +
      Number((displayData.othercosts).toFixed(2)) +
      Number((displayData.claim).toFixed(2)) +
      Number((displayData.interestPenalty).toFixed(2));


    displayData.receivedTotal = Number((displayData.receivedNormalDD).toFixed(2)) +
      Number((displayData.receivedSpecialDD).toFixed(2)) +
      Number((displayData.receivedDiscount).toFixed(2)) +
      Number((displayData.receivedClosingPayment).toFixed(2));

    displayData.sentToBankTotal = Number((displayData.sentToBankPrinciplePart).toFixed(2)) +
      Number((displayData.sentToBankIntialFeePart).toFixed(2)) +
      Number((displayData.sentToBankInterest).toFixed(2)) +
      Number((displayData.sentToBankOtherCost).toFixed(2));

    displayData.totalPartialPayments = Number((displayData.partialPayment).toFixed(2)) + Number((displayData.partialPaymentRefund).toFixed(2));

    //displayData
    displayData.refundCost = Number((displayData.totalToRecieve).toFixed(2)) +
      Number((displayData.receivedTotal).toFixed(2)) +
      Number((displayData.sentToBankTotal).toFixed(2)) +
      Number((displayData.totalPartialPayments).toFixed(2))+
      Number(totalProfitLostAmount.toFixed(2));

      this.setState({refundCost: displayData.refundCost, calculatedAmount: displayData.refundCost});
  }

  // set warning message (accroding to Refund-SME-Loan-Partial-Payment-Amount V2.7)
  setWarningMessage = () => {
    const { smeLoan, smeLoanTransactions } = this.props;
    if(smeLoan.type === 'flex-loan'){
      // since this is flex loan should give message
      this.props.displayNotification(`Don't do a refund as long as the final recurring fee is not paid!!!`, 'warning-stay');

    }else{

      const discountTransaction = smeLoanTransactions.find(st => st.type === DDtype.DISCOUNT_PAYMENT);

      if(discountTransaction){
        // this means discount-payment transaction available so need to check transaction date <  4 working ago (system-date)
        const currentDate = moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
        let defaultDate;
        this.props.getPreviousWorkingDate(currentDate, 4)
        .then(result => {
          defaultDate = result;
          if(defaultDate && discountTransaction.transactionDate){
            // this means date that checking and discount transaction transaction date both available.
            const dateCheck = moment(defaultDate).isBefore(discountTransaction.transactionDate);
            if(dateCheck){
              this.props.displayNotification(`Be careful; a discount is given less than 4 working days ago!!!!`, 'warning-stay');
            }
          }

        }).catch(err => {
          console.log(err);
        });
      }

    }
    
  }

  render() {
    const { classes, smeLoan, smeDetails, totalProfitLostAmount,  locale } = this.props;

    let totWithdrawalAmount;
    if (smeLoan.type === 'flex-loan') {
      const sumWithdrawalAmount = this.props.totalWithdrawalAmount && this.props.totalWithdrawalAmount.length === 0 ? 0 : this.props.totalWithdrawalAmount.reduce((n, { withdrawalAmount }) => n + withdrawalAmount, 0);
      totWithdrawalAmount = sumWithdrawalAmount === 0 ? 0 : (sumWithdrawalAmount * -1);
    }
    else {
      totWithdrawalAmount = 0;
    }

    const parentState = this.state.displayData;

    return (
      <Table id="refund-loan-content-table">
        <TableBody id="refund-loan-content-table-body">
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>SME</TableCell>
            <TableCell id="refund-loan-content-sme" className={classnames(classes.tableCellLessPadding)}>{smeDetails.company}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Contract</TableCell>
            <TableCell id="refund-loan-contract-id" className={classnames(classes.tableCellLessPadding)}>{smeLoan.contractId}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>To Recieve</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Amount</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Received</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Amount</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Loan</TableCell>
            <TableCell id="refund-loan-content-loan" className={classnames(classes.tableCellLessPadding)}>{smeLoan.type ==='fixed-loan' ?currency(parentState.loan, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR'): currency(totWithdrawalAmount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Normal-dd</TableCell>
            <TableCell id="refund-loan-content-received-normal-dd" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.receivedNormalDD, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Initial Fee</TableCell>
            <TableCell id="refund-loan-content-initial-fee" className={classnames(classes.tableCellLessPadding)}>{smeLoan.type ==='fixed-loan' ?currency(parentState.initialFee, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR'): ''}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Special-dd</TableCell>
            <TableCell id="refund-loan-content-received-special-dd" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.receivedSpecialDD, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Interest</TableCell>
            <TableCell id="refund-loan-content-interest" className={classnames(classes.tableCellLessPadding)}>{smeLoan.type ==='fixed-loan' ? currency(parentState.interest, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR'): currency(parentState.interest, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Discount</TableCell>
            <TableCell id="refund-loan-content-received-discount" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.receivedDiscount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Other Costs</TableCell>
             <TableCell id="refund-loan-content-other-costs" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.othercosts, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Closing Payment</TableCell>
            <TableCell id="refund-loan-content-received-closing-payment" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.receivedClosingPayment, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Claim</TableCell>
            <TableCell id="refund-loan-content-claim" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.claim, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Interest-Penalty</TableCell>
            <TableCell id="refund-loan-content-interest-penalty" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.interestPenalty, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Total</TableCell>
            <TableCell id="refund-loan-content-total-to-receive" className={classnames(classes.tableCellLessPadding, classes.bold)}>{currency(parentState.totalToRecieve, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Total</TableCell>
            <TableCell id="refund-loan-content-received-total" className={classnames(classes.tableCellLessPadding, classes.bold)}>{currency(parentState.receivedTotal, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Direct Debits &apos;Sent-to-Bank&apos;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Summary</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Principle-part</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-principle-part" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.sentToBankPrinciplePart, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Balance &apos;to receive/received&apos;</TableCell>
            <TableCell id="refund-loan-content-balance-to-reveive-or-received" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.totalToRecieve + parentState.receivedTotal, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Initial-fee-part</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-initial-fee-part" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.sentToBankIntialFeePart, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Sent-to-Bank</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-total" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.sentToBankTotal, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Interest</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-interest" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.sentToBankInterest, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Partial Payment</TableCell>
            <TableCell id="refund-loan-content-total-partial-payment" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.totalPartialPayments, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Other-Costs</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-other-cost" className={classnames(classes.tableCellLessPadding, classes.bold)}>{currency(parentState.sentToBankOtherCost, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Profit / Loss</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>{currency(totalProfitLostAmount, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Total</TableCell>
            <TableCell id="refund-loan-content-sent-to-bank-total-in-total" className={classnames(classes.tableCellLessPadding)}>{currency(parentState.sentToBankTotal, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Refund Total</TableCell>
            <TableCell id="refund-loan-content-refund-cost-in-total" className={classnames(classes.tableCellLessPadding)}>
            {currency(parentState.refundCost, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}

RefundLoanData.propTypes = {
  usage: PropTypes.string,
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  smeDetails: PropTypes.object.isRequired,
  parentState: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  saveRefundLoanData: PropTypes.func.isRequired,
  refundAmount: PropTypes.number,
  totalWithdrawalAmount: PropTypes.array.isRequired,
  totalProfitLostAmount: PropTypes.number,
  displayNotification: PropTypes.func.isRequired,
  configurations: PropTypes.object.isRequired,
  getPreviousWorkingDate : PropTypes.func.isRequired,
  locale: PropTypes.string
};


const mapStateToProps = (state) => {
  return {
    configurations: state.configurations,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    getPreviousWorkingDate: (startDay, numberOfDays) => {
      return dispatch(getPreviousWorkingDate(startDay, numberOfDays));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(RefundLoanData));
