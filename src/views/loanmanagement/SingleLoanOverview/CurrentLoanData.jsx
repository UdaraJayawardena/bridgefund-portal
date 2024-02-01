/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
// import moment from 'moment';
import classnames from 'classnames';
import ENV from '../../../config/env';

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";

import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

import { DDstatus, DDtype, /* getLatestPaidDD, */ getCountOfPaidNormalDD } from "constants/loanmanagement/sme-loan-repayment-direct-debits";

import { getDurationInMonths, getActualMonth } from 'constants/loanmanagement/sme-loan';

import { ENVIRONMENT } from "constants/loanmanagement/config";

import Util from 'lib/loanmanagement/utility';
import moment from "moment";

const currency = Util.multiCurrencyConverter();
const dateValidForOlderPrepayment = ENV.VALID_DATE_FOR_OLDER_PREPAYMENTS;

const isProduction = Util.getEnv() === ENVIRONMENT.PRODUCTION;
class CurrentLoanData extends Component {

  componentDidMount() {

    const formData = this.calculateFormDisplayData();
    this.props.saveCurrentLoanData(formData);
  }

  calculateFormDisplayData = () => {

    const { smeLoanTransactions, smeLoan , usage , loan} = this.props;
    let outstandingNormalDD = 0;
    let missedNormalDD = 0;
    let outstandingSpecialDD = 0;
    let missedSpecialDD = 0;
    let sentToBankDD = 0;
    let sentToBankNormalDD = 0;
    let sentToBankSpecialDD = 0;
    let partialPaymentAmount = 0;
    let outstandingAmountNormalDD = 0;
    let outstandingAmountSpecialDD = 0;
    let latestDate = null;


    for (const smeLoanTransaction of smeLoanTransactions) {

      const { type, status, plannedDate, amount } = smeLoanTransaction;

      if (status === DDstatus.SENT_TO_BANK) sentToBankDD++;
      if (type === DDtype.NORMAL && status === DDstatus.SENT_TO_BANK) sentToBankNormalDD++;
      if (type === DDtype.SPECIAL && status === DDstatus.SENT_TO_BANK) sentToBankSpecialDD++;
      if (type === DDtype.NORMAL && status === DDstatus.OPEN) outstandingNormalDD++;
      if (type === DDtype.SPECIAL && status === DDstatus.OPEN) outstandingSpecialDD++;
      if (type === DDtype.NORMAL && status !== DDstatus.PAID) outstandingAmountNormalDD = Number((outstandingAmountNormalDD + amount).toFixed(2));
      if (type === DDtype.SPECIAL && status !== DDstatus.PAID) outstandingAmountSpecialDD = Number((outstandingAmountSpecialDD + amount).toFixed(2));

      if (
        type === DDtype.NORMAL &&
        (
          status === DDstatus.FAILED || status === DDstatus.FREQUENTLY_FAILED || status === DDstatus.REJECTED ||
          status === DDstatus.FREQUENTLY_REJECTED || status === DDstatus.MANDATE_WITHDRAWN || status === DDstatus.PAUSED
        )
      ) missedNormalDD++;

      if (
        type === DDtype.SPECIAL &&
        (
          status === DDstatus.FAILED || status === DDstatus.FREQUENTLY_FAILED || status === DDstatus.REJECTED ||
          status === DDstatus.FREQUENTLY_REJECTED || status === DDstatus.MANDATE_WITHDRAWN || status === DDstatus.PAUSED
        )
      ) missedSpecialDD++;

      if (type === DDtype.NORMAL && status === DDstatus.SENT_TO_BANK) {

        latestDate = new Date(latestDate).getTime() > new Date(plannedDate).getTime() ? latestDate : plannedDate;
      }

      if (type === DDtype.PARTIAL_PAYMENT) partialPaymentAmount = Number((partialPaymentAmount + amount).toFixed(2));
      if (type === DDtype.PARTIAL_PAYMENT_REFUND) partialPaymentAmount = Number((partialPaymentAmount + amount).toFixed(2));
    }

    let totalOutstandingAmount = 0;
    if(usage === 'redeem'){
      outstandingAmountNormalDD = outstandingAmountNormalDD + loan.directDebitAmountFirstPeriod;
      totalOutstandingAmount = outstandingAmountNormalDD + outstandingAmountSpecialDD ;
      sentToBankNormalDD = sentToBankNormalDD + 1;
    }else{
      totalOutstandingAmount = outstandingAmountNormalDD + outstandingAmountSpecialDD;
    }
    // const totalNormalOutstandingDD = outstandingNormalDD + missedNormalDD; // for discount calculation

    /// discount calculation
    let discountOnInterest = 0;
    let discountOnInitialFee = 0;

    // const latestPaidDDTermNumber = getLatestPaidDD(smeLoanTransactions);
    const countOfPaidNormalDD = getCountOfPaidNormalDD(smeLoanTransactions);
    const durationINMonths = getDurationInMonths(smeLoan.directDebitFrequency, smeLoan.plannedNumberOfDirectDebit);
    let actualMonth = 0;
    let correctedMonth = 0;
    let monthsInTotal = durationINMonths;
    // if (latestPaidDDTermNumber !== null) {
    //   actualMonth = getActualMonth(smeLoan.directDebitFrequency, latestPaidDDTermNumber.termNumber);
    // }

    if (countOfPaidNormalDD !== 0) {
      actualMonth = getActualMonth(smeLoan.directDebitFrequency, countOfPaidNormalDD);
    }

    if (actualMonth <= 6) {
      correctedMonth = 6;
    } else {
      correctedMonth = actualMonth;
    }

    const discountMonth = durationINMonths - correctedMonth;
    discountOnInterest = 0; //Number((discountMonth * smeLoan.interestAmount / durationINMonths).toFixed(2)) * -1;

    let today = new Date();
    if(!isProduction){
      today = this.props.simulations.systemDate;
    }

    const loanContractualDate = moment(smeLoan.createdAt).format('YYYY-MM-DD');
    const formattedLoanContractualDate = moment(smeLoan.createdAt, 'YYYY-MM-DD');
    const refinancePerform = moment(today, 'YYYY-MM-DD');

    // months are considering from the start
    formattedLoanContractualDate.startOf("month");
    refinancePerform.startOf("month");
    
    if(moment(loanContractualDate).isBefore(dateValidForOlderPrepayment)){
      discountOnInitialFee = Number(((durationINMonths - actualMonth) * smeLoan.initialCostAmount / durationINMonths).toFixed(2)) * -1; 
    }else{
      const monthDiff = Number(refinancePerform.diff(formattedLoanContractualDate, 'months')+1);

      if(monthDiff < 12 && durationINMonths > 12){
        monthsInTotal = 12;
      }

      const monthsForDiscount = Number(monthsInTotal - monthDiff); 
    
      if(monthsForDiscount > 0 && monthsForDiscount < 12 && monthDiff < 12){
        discountOnInitialFee = Number(((monthsForDiscount) * (smeLoan.initialCostAmount / durationINMonths)).toFixed(2)) * -1;
      }else{
        discountOnInitialFee = 0
      }
      
    }

    const standardTotalDiscount = discountOnInterest + discountOnInitialFee;

    // let systemDate = moment().format('YYYY-MM-DD');
    // if(this.props.simulations.systemDate != null){
    //   systemDate = moment(this.props.simulations.systemDate).format('YYYY-MM-DD');
    // }
    // if (moment(systemDate, 'YYYY-MM-DD').diff(moment(smeLoan.startDate, 'YYYY-MM-DD'), 'M') >= 6) {
    //   discountOnInterest = Number(((totalNormalOutstandingDD / smeLoan.plannedNumberOfDirectDebit) * smeLoan.interestAmount).toFixed(2)) * -1;
    // }

    // const discountOnInitialFee = Number(((totalNormalOutstandingDD / smeLoan.plannedNumberOfDirectDebit) * smeLoan.initialCostAmount).toFixed(2)) * -1;
    // const standardTotalDiscount = discountOnInterest + discountOnInitialFee;

    partialPaymentAmount = partialPaymentAmount * -1; /* Need to show as a negative number */



    return {
      outstandingNormalDD,
      missedNormalDD,
      outstandingAmountNormalDD,
      outstandingSpecialDD,
      missedSpecialDD,
      outstandingAmountSpecialDD,
      totalOutstandingAmount,
      partialPaymentAmount,
      discountOnInterest,
      discountOnInitialFee,
      standardTotalDiscount,
      sentToBankDD,
      sentToBankNormalDD,
      sentToBankSpecialDD,
      latestDate,
    };
  };

  render() {
    const { classes, smeLoan, parentState, closingPaymentAmount, usage, lastestWithdrawalOrder , loan, locale, symbol, decimalSeparator, thousandSeparator} = this.props;
    const flexLoanWithdrawalOutstanding = lastestWithdrawalOrder && lastestWithdrawalOrder.newOutstandingAmount != null ? lastestWithdrawalOrder.newOutstandingAmount : 0;

    return (
      <Table id="current-loan-data-table">
        <TableBody id="current-loan-data-table-body">
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Principal Amount</TableCell>
            <TableCell id="current-loan-data-principle-amount" className={classnames(classes.tableCellLessPadding)}>
              {smeLoan.type === 'flex-loan' ? currency(flexLoanWithdrawalOutstanding, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR') : 
              currency(smeLoan.principleAmount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          <TableRow></TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Outstanding Normal DD</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Outstanding Special DD</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Number of Outstanding DD</TableCell>
            <TableCell id="current-loan-data-outstanding-normal-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.outstandingNormalDD}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Number of Outstanding DD</TableCell>
            <TableCell id="current-loan-data-outstanding-special-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.outstandingSpecialDD}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Missed DD</TableCell>
            <TableCell id="current-loan-data-missed-normal-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.missedNormalDD}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Missed DD</TableCell>
            <TableCell id="current-loan-data-missed-special-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.missedSpecialDD}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>DD &apos;sent to bank&apos;</TableCell>
            <TableCell id="current-loan-data-sent-to-bank-normal-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.sentToBankNormalDD}</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>DD &apos;sent to bank&apos;</TableCell>
            <TableCell id="current-loan-data-sent-to-bank-special-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.sentToBankSpecialDD}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Outstanding Amount</TableCell>
            <TableCell id="current-loan-data-outstanding-amount-normal-dd" className={classnames(classes.tableCellLessPadding, classes.bold)}>
              {               
               currency(parentState.outstandingAmountNormalDD, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Outstanding Amount</TableCell>
            <TableCell id="current-loan-data-outstanding-amount-special-dd" className={classnames(classes.tableCellLessPadding, classes.bold)}>
              {
                currency(parentState.outstandingAmountSpecialDD, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.noBorder)} colSpan={5}></TableCell>
          </TableRow>

          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Total Outstanding</TableCell>
            <TableCell id="current-loan-data-total-outstanding-amount" className={classnames(classes.tableCellLessPadding, classes.bold)}>
              {
                currency(parentState.totalOutstandingAmount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>{usage === 'claim' ? 'Direct Debits NOT included!' : 'Discount On Interest'}</TableCell>
            <TableCell id="current-loan-data-discount-on-interest" className={classnames(classes.tableCellLessPadding)}>
              {
                usage === 'claim' ? '' : currency(parentState.discountOnInterest, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding)}>Partial Payment</TableCell>
            <TableCell id="current-loan-data-partial-payment-amount" className={classnames(classes.tableCellLessPadding)}>
              {
                currency(parentState.partialPaymentAmount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>{usage === 'claim' ? '' : 'Discount On Fees'}</TableCell>
            <TableCell id="current-loan-data-discount-on-initial-fee" className={classnames(classes.tableCellLessPadding)}> 
              {
                usage === 'claim' ? '' : currency(parentState.discountOnInitialFee, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              } 
            </TableCell>
          </TableRow>
          {usage === 'claim' ? null :
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>Discount</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <MultiCurrencyCustomFormatInput
                  type='text'
                  id='totalDiscount'
                  name='totalDiscount'
                  numberformat={parentState.totalDiscount.toFixed(2)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  changeValue={(val) => this.props.handleNumberInput('totalDiscount', val)}
                  symbol={symbol}
                  decimalSeparator={decimalSeparator}
                  thousandSeparator={thousandSeparator}
                />
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Standard Total Discount</TableCell>
              <TableCell id="current-loan-data-discount-standard-total-discount" className={classnames(classes.tableCellLessPadding, classes.bold)}>
                {
                  currency(parentState.standardTotalDiscount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
                }
              </TableCell>
            </TableRow>
          }
          {usage === 'claim' ? null :
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>Total Discount</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>
                <MultiCurrencyCustomFormatInput
                  type='text'
                  id='totalDiscount'
                  name='totalDiscount'
                  numberformat={parentState.totalDiscount.toFixed(2)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  changeValue={(val) => this.props.handleNumberInput('totalDiscount', val)}
                  symbol={symbol}
                  decimalSeparator={decimalSeparator}
                  thousandSeparator={thousandSeparator}
                />
              </TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Standard Total Discount</TableCell>
              <TableCell id="current-loan-datatotal-discount-standard-total-discount" className={classnames(classes.tableCellLessPadding, classes.bold)}>
                {
                  currency(parentState.standardTotalDiscount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
                }
              </TableCell>
            </TableRow>
          }
          <TableRow>
            <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>
              {usage === 'refinance' ? 'To be Refinanced' : 'To be Paid'} / Closing Payment
            </TableCell>
            <TableCell id="current-loan-data-closing-payment-amount" className={classnames(classes.tableCellLessPadding, classes.bold)}>
              {
               currency(closingPaymentAmount, locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')
              }
            </TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
          </TableRow>
          {usage === 'refinance' ?
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding, classes.bold)}>Direct Debits Not Included!</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
            </TableRow>
            :
            null
          }
          {usage === 'refinance' ?
            <TableRow>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}>&nbsp;</TableCell>
              <TableCell className={classnames(classes.tableCellLessPadding)}> Number of DD status &apos;sent-to-bank&apos;</TableCell>
              <TableCell id="current-loan-data-sent-to-bank-dd" className={classnames(classes.tableCellLessPadding)}>{parentState.sentToBankDD}</TableCell>
            </TableRow>
            :
            null
          }
        </TableBody>
      </Table>
    );
  }
}

CurrentLoanData.propTypes = {
  usage: PropTypes.string,
  closingPaymentAmount: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  parentState: PropTypes.object.isRequired,
  smeLoanTransactions: PropTypes.array.isRequired,
  handleNumberInput: PropTypes.func.isRequired,
  saveCurrentLoanData: PropTypes.func.isRequired,
  simulations: PropTypes.object.isRequired,
  lastestWithdrawalOrder: PropTypes.object,
  loan: PropTypes.object,
  locale: PropTypes.string,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    simulations: state.configurations.simulations,
    loan: state.lmglobal.selectedLoan,
  };
};

export default connect(
  mapStateToProps
)(withStyles(Styles)(CurrentLoanData));
