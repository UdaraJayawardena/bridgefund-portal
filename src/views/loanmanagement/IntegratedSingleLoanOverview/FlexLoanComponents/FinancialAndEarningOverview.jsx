import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import withStyles from "@material-ui/core/styles/withStyles";
import { Table, Typography, Grid, TableHead, TableRow, TableCell, TableBody, TextField, Tooltip, Paper, TableContainer } from '@material-ui/core';
import Utility from "lib/loanmanagement/utility";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
const CURRENCY = Utility.multiCurrencyConverter();

//bottom left section
class FinancialAndEarningOverview extends Component {

    getPartialAmount = () => {
        const { loanData, overviewData } = this.props;

        if (loanData && loanData.status) {
            return overviewData.partialOutstandingAmount || 0;
        }
        return 0;
    }

    getAvailableBalance = () => {
        const { loanData, overviewData } = this.props;

        if (loanData && overviewData)
            return (loanData.creditLimitAmount - ((overviewData.loanOutstandingAmount + overviewData.otherCostOutstandingAmount) - this.getPartialAmount())) || 0;
        return 0;
    }

    render() {
        const { classes, overviewData, loanData, locale } = this.props;

        return (
            <React.Fragment>
                <Grid item xs={8} >
                    <Typography variant="body1" gutterBottom className={classes.SectionTitleStyle}>{'Financial Status'}</Typography>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow >
                                    <TableCell className={classes.tableCell}>{''}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">Outstanding</TableCell>
                                    <TableCell className={classes.tableCell} align="right">Overdue</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{'Loan'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData && overviewData.loanOutstandingAmount ? overviewData.loanOutstandingAmount - (overviewData && overviewData.otherCostOutstandingAmount ? overviewData.otherCostOutstandingAmount : 0) : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData && overviewData.loanOverdueAmount ? overviewData.loanOverdueAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{'Other Cost'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData && overviewData.otherCostOutstandingAmount ? overviewData.otherCostOutstandingAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData && overviewData.otherCostOverdueAmount ? overviewData.otherCostOverdueAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{'Partial'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(-1 * this.getPartialAmount(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(-1 * this.getPartialAmount(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{'Overall Total'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData.loanOutstandingAmount - this.getPartialAmount(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="right">
                                        {CURRENCY(overviewData.overallTotalOverdueAmount - this.getPartialAmount(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={4} >
                    <Typography variant="body1" gutterBottom className={classes.SectionTitleStyle}>{'Total Cost'}</Typography>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <TextField
                                id="withdrawal-cost"
                                label="Withdrawal Costs"
                                value={CURRENCY(Math.abs(overviewData && overviewData.withdrawalCostAmount ? overviewData.withdrawalCostAmount : 0), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                InputProps={{
                                    className: classes.autoSuggestTextStyle,
                                    readOnly: true
                                }}
                                InputLabelProps={{
                                    className: classes.autoSuggestTextLabelStyle,
                                    shrink: true
                                }}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="recurring-interest"
                                label="Recurring-Interest"
                                value={CURRENCY(Math.abs(overviewData && overviewData.recurringInterestAmount ? overviewData.recurringInterestAmount : 0), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                InputProps={{
                                    className: classes.autoSuggestTextStyle,
                                    readOnly: true
                                }}
                                InputLabelProps={{
                                    className: classes.autoSuggestTextLabelStyle,
                                    shrink: true
                                }}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="total"
                                label="Total"
                                value={CURRENCY(Math.abs(overviewData && overviewData.totalEarningAmount ? overviewData.totalEarningAmount : 0), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                                InputProps={{
                                    className: classes.autoSuggestTextStyle,
                                    readOnly: true
                                }}
                                InputLabelProps={{
                                    className: classes.autoSuggestTextLabelStyle,
                                    shrink: true
                                }}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {/* <Grid container spacing={1} className={classes.boxMargin}> */}
                <Grid item xs={4} >
                    <Tooltip
                        placement="top-start"
                        title={
                            <React.Fragment>
                                <table className={classes.tooltipTable}>
                                    <thead>
                                        <tr>
                                            <th className={classes.tooltipTableHeadCell}>Amount</th>
                                            <th className={classes.tooltipTableHeadCell}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            loanData && loanData.creditLimitAmountHistory && loanData.creditLimitAmountHistory.map(history => (
                                                <tr key={`history._id`}>
                                                    <td className={classes.tooltipTableBodyCell}>{CURRENCY(history && history.amount ? history.amount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}</td>
                                                    <td className={classes.tooltipTableBodyCell}>{history && history.createdAt ? moment(history.createdAt).format("DD-MM-YYYY") : ''}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </React.Fragment>
                        }
                    >
                        <TextField
                            id="credit-limit"
                            label="Credit Limit"
                            value={CURRENCY(loanData && loanData.creditLimitAmount ? loanData.creditLimitAmount : 0, locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                            InputProps={{
                                className: classes.autoSuggestTextStyle,
                                readOnly: true
                            }}
                            InputLabelProps={{
                                className: classes.autoSuggestTextLabelStyle,
                                shrink: true
                            }}
                            variant="outlined"
                            fullWidth
                        />
                    </Tooltip>
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        id="available-balance"
                        label="Available Balance"
                        value={CURRENCY(this.getAvailableBalance(), locale ? locale : 'nl-NL', loanData.currency ? loanData.currency : 'EUR')}
                        InputProps={{
                            className: classes.autoSuggestTextStyle,
                            readOnly: true
                        }}
                        InputLabelProps={{
                            className: classes.autoSuggestTextLabelStyle,
                            shrink: true
                        }}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
                {/* </Grid> */}
            </React.Fragment >);
    }
}

FinancialAndEarningOverview.propTypes = {
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    classes: PropTypes.object,
    locale: PropTypes.string
};

export default withStyles(customStyles)(FinancialAndEarningOverview);