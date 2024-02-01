import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@material-ui/core';
import Utility from "lib/loanmanagement/utility";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import { connect } from "react-redux";
const CURRENCY = Utility.multiCurrencyConverter();
const multiCurrencyPercentage = Utility.multiCurrencyPercentage;


// bottom left section 
class AmountOverview extends Component {

    getPartialOverdue = () => {
        const { loanData, overviewData } = this.props;

        if (loanData && (loanData.status === 'loan-normally-settled' || loanData.status === 'loan-refinanced' || loanData.status === 'loan-fully-redeemed')) {
            return 0;
        }
        if (overviewData && overviewData.partialPaymentAmount) {
            return (overviewData.partialPaymentAmount * -1);
        }
        return 0;
    }

    getPartialOutstanding = () => {
        const { loanData, smeLoanTransactions , overviewData } = this.props;

        let sumOfPartialPayments = 0;
       
        if(loanData.status === 'loan-normally-settled' || loanData.status === 'loan-refinanced' || loanData.status === 'loan-fully-redeemed') {
            return 0;
        }
        
            // for (const smeLoanTransaction of smeLoanTransactions) {
            //     const { amount } = smeLoanTransaction;
            //     if (smeLoanTransaction.type === 'partial-payment' || smeLoanTransaction.type === 'partial-payment-refund'){
            //         sumOfPartialPayments = Number((sumOfPartialPayments + amount).toFixed(2));
            //     }
            // }
            // return  (sumOfPartialPayments * -1 );
            
            if (overviewData && overviewData.partialPaymentAmount) {
                return (overviewData.partialPaymentAmount * -1);
            }
            return 0;
        
    }

    getOverallTotalOverdueAmount = () => {
        const { overviewData } = this.props;
        return (overviewData.overallTotalOverdueAmount ? overviewData.overallTotalOverdueAmount : 0) + this.getPartialOverdue();
    }

    render() {
        const { classes, overviewData, locale, loanData } = this.props;
        return (
            <React.Fragment>
                <Grid item xs={12} >
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">Original</TableCell>
                                    <TableCell className={classes.tableCell} align="right">Outstanding</TableCell>
                                    <TableCell className={classes.tableCell} align="right">Overdue</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Principal'}</TableCell>
                                    {/* Original */} <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.principleAmount ? overviewData.principleAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    {/* Outstanding */} <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingPrincipleAmount ? overviewData.outstandingPrincipleAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    {/* Overdue */} <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                    {/* overduePercentage */} <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Interest'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.interestAmount ? overviewData.interestAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingInterestAmount ? overviewData.outstandingInterestAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Initial Fee'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.initialCostAmount ? overviewData.initialCostAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingInitialFee ? overviewData.outstandingInitialFee : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Recurring Fee'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.recurringCostAmount ? overviewData.recurringCostAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingRecurringFee ? overviewData.outstandingRecurringFee : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Contract Total'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.totalLoanAmount ? overviewData.totalLoanAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingTotalLoanAmount ? overviewData.outstandingTotalLoanAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.totalOverdueAmount ? overviewData.totalOverdueAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{multiCurrencyPercentage(overviewData.totalOverduePercentage ? overviewData.totalOverduePercentage : 0, locale ? locale : 'nl-NL')}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Other Cost'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.otherCostsAmount ? overviewData.otherCostsAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.outstandingOtherCostAmount ? overviewData.outstandingOtherCostAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.otherCostOverdueAmount ? overviewData.otherCostOverdueAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Partial'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(this.getPartialOutstanding(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(this.getPartialOverdue(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} >{'Overall Total'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.overallTotalLoanAmount ? overviewData.overallTotalLoanAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(overviewData.overallOutstandingTotalAmount ? overviewData.overallOutstandingTotalAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(this.getOverallTotalOverdueAmount(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{multiCurrencyPercentage(overviewData.overallTotalOverduePercentage ? overviewData.overallTotalOverduePercentage : 0, locale ? locale : 'nl-NL')}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </React.Fragment>
        );
    }
}

AmountOverview.propTypes = {
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    classes: PropTypes.object,
    smeLoanTransactions: PropTypes.array,
    locale: PropTypes.string
};


const mapStateToProps = (state) => {
    return {
      smeLoanTransactions: state.smeLoanTransaction.directdebits,
    };
  };

  export default connect(
    mapStateToProps
  )(withStyles(customStyles)(AmountOverview));

