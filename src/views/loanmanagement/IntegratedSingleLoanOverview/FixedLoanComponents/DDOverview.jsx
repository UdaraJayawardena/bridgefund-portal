import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import { Grid, TableHead, TableRow, TableCell, TableBody, Table, TableContainer, Paper } from '@material-ui/core';
import Utility from "lib/loanmanagement/utility";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import moment from 'moment';
const CURRENCY = Utility.multiCurrencyConverter();

// bottom right section 
class DDOverview extends Component {

    repaymentDetailsBlock = () => {

        const { loanData, locale } = this.props;
        const isLoanFound = loanData._id !== undefined;

        const totalDDCount = isLoanFound ? loanData.numberOfDirectDebitsFirstPeriod + loanData.numberOfDirectDebitsSecondPeriod + loanData.numberOfDirectDebitsThirdPeriod : 0;
        const totalDDAmount = isLoanFound ? (loanData.directDebitAmountFirstPeriod * loanData.numberOfDirectDebitsFirstPeriod
            + loanData.directDebitAmountSecondPeriod * loanData.numberOfDirectDebitsSecondPeriod
            + loanData.directDebitAmountThirdPeriod * loanData.numberOfDirectDebitsThirdPeriod) : 0;

        return {
            noOfDD: totalDDCount,
            total: CURRENCY(totalDDAmount, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR'),
        };
    }

    render() {
        const { classes, loanData, locale } = this.props;
        return (
            <React.Fragment>
                <Grid item xs={12} >
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow >
                                    <TableCell className={classes.tableCell} align="right" >{'No-of-DD'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{'DD-Amount'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{'Totals'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={classes.tableCell} align="right" >{loanData.numberOfDirectDebitsFirstPeriod ? loanData.numberOfDirectDebitsFirstPeriod : ''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(loanData.directDebitAmountFirstPeriod ? loanData.directDebitAmountFirstPeriod : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY((loanData.numberOfDirectDebitsFirstPeriod * loanData.directDebitAmountFirstPeriod) || 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{'Start-date-DD '}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.firstDirectDebitDate ? moment(loanData.firstDirectDebitDate).format('DD-MM-YYYY') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} align="right" >{loanData.numberOfDirectDebitsSecondPeriod ? loanData.numberOfDirectDebitsSecondPeriod : ''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(loanData.directDebitAmountSecondPeriod || 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY((loanData.numberOfDirectDebitsSecondPeriod * loanData.directDebitAmountSecondPeriod) || 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} align="right" >{loanData.numberOfDirectDebitsThirdPeriod ? loanData.numberOfDirectDebitsThirdPeriod : ''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY(loanData.directDebitAmountThirdPeriod || 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{CURRENCY((loanData.numberOfDirectDebitsThirdPeriod * loanData.directDebitAmountThirdPeriod) || 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell} align="right" >{this.repaymentDetailsBlock().noOfDD}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{this.repaymentDetailsBlock().total}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </React.Fragment>
        );
    }
}

DDOverview.propTypes = {
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    classes: PropTypes.object,
    locale: PropTypes.string
};

export default withStyles(customStyles)(DDOverview);