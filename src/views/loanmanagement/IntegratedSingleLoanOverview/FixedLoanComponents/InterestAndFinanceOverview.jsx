import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import withStyles from "@material-ui/core/styles/withStyles";
import { Link } from 'react-router-dom';
import { Grid, TableHead, TableRow, TableCell, TableBody, Table, Paper, TableContainer, Button, } from '@material-ui/core';
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import Utility from "lib/loanmanagement/utility";
import { TERMS_MAPPING } from "store/loanmanagement/constants/Contracts";
import history from "./../../../../history";
const multiCurrencyPercentage = Utility.multiCurrencyPercentage;


class InterestAndFinanceOverview extends Component {

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

    getLinkOrButttonForParentLoan = () => {
        const { isDashboardContent, loanData } = this.props;
        return isDashboardContent ?
            <Button size="small" color="primary" onClick={() => this.redirectToSLO(loanData.parentLoan)}>{loanData.parentLoan + " [PARENT]"}</Button>
            :
            <Link to={`/user/singleLoanOverview/${loanData.parentLoan}`} >{loanData.parentLoan + " [PARENT]"}</Link>;
    }

    getLinkOrButttonForChildLoan = () => {
        const { isDashboardContent, loanData } = this.props;
        return isDashboardContent ?
            <Button size="small" color="primary" onClick={() => this.redirectToSLO(loanData.childLoan)}>{loanData.childLoan + " [CHILD]"}</Button>
            :
            <Link to={`/user/singleLoanOverview/${loanData.childLoan}`} >{loanData.childLoan + " [CHILD]"}</Link>;
    }

    redirectToSLO = (contractId) => {
        this.props.selectLoan({ contractId });
        this.props.setNavigationInDashboards('SingleLoanOverview')
            .then(res => {
                if (res) {
                    history.push(res);
                }
            });

    }

    getRefinancedRowData = () => {

        const { loanData, classes } = this.props;
        const isLoanFound = loanData._id !== undefined;
        //<Button color="primary">Primary</Button>
        if (isLoanFound && loanData.parentLoan)
            return (
                <TableRow>
                    <TableCell className={classes.tableCell}  >{'Refinanced'}</TableCell>
                    <TableCell className={classes.tableCell} align="right">
                        {/* <Link to={`/user/singleLoanOverview/${loanData.parentLoan}`} >{loanData.parentLoan + " [PARENT]"}</Link> */}
                        {this.getLinkOrButttonForParentLoan()}
                    </TableCell>
                </TableRow>
            );
        if (isLoanFound && loanData.parentLoan && loanData.childLoan)
            return (
                <TableRow>
                    <TableCell className={classes.tableCell}  >{''}</TableCell>
                    <TableCell className={classes.tableCell} align="right">
                        {/* <Link to={`/user/singleLoanOverview/${loanData.childLoan}`} >{loanData.childLoan + " [CHILD]"}</Link> */}
                        {this.getLinkOrButttonForChildLoan()}
                    </TableCell>
                </TableRow>
            );
        if (isLoanFound && loanData.childLoan)

            return (
                <TableRow>
                    <TableCell className={classes.tableCell}  >{'Refinanced'}</TableCell>
                    <TableCell className={classes.tableCell} align="right">
                        {/* <Link to={`/user/singleLoanOverview/${loanData.childLoan}`} >{loanData.childLoan + " [CHILD]"}</Link> */}
                        {this.getLinkOrButttonForChildLoan()}
                    </TableCell>
                </TableRow>
            );
        return (
            <TableRow>
                <TableCell className={classes.tableCell}  >{'Refinanced'}</TableCell>
                <TableCell className={classes.tableCell} align="right">{'NO'}</TableCell>
            </TableRow>
        );

    }

    render() {
        const { classes, loanData, locale } = this.props;
        return (
            <React.Fragment>
                {/* Interest Block */}
                <Grid item xs={6} >
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow >
                                    <TableCell className={classes.tableCell}  >{'Interest'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">&nbsp;</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Base Interest'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.interestPercentageBasePerMonth ? multiCurrencyPercentage(loanData.interestPercentageBasePerMonth, locale ? locale : 'nl-NL') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Risk Surcharge'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.interestPercentageRiskSurchargePerMonth ? multiCurrencyPercentage(loanData.interestPercentageRiskSurchargePerMonth, locale ? locale : 'nl-NL') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'% In Contract'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.interestPercentageTotal ? multiCurrencyPercentage(loanData.interestPercentageTotal, locale ? locale : 'nl-NL') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'APR'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.interestAnnualPercentageRate ? multiCurrencyPercentage(loanData.interestAnnualPercentageRate, locale ? locale : 'nl-NL') : ''}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                {/* Refinance Block */}
                <Grid item xs={6} >
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                {this.getRefinancedRowData()}
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Start Date'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.startDate ? moment(loanData.startDate).format('DD-MM-YYYY') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Maturity Date'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.maturityDate ? moment(loanData.maturityDate).format('DD-MM-YYYY') : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Duration'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{this.mapPlannedDirectDebitsToDuration(loanData.plannedNumberOfDirectDebit, loanData.directDebitFrequency) || ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Frequency'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.directDebitFrequency ? loanData.directDebitFrequency : ''}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={classes.tableCell}   >{'Planned DD'}</TableCell>
                                    <TableCell className={classes.tableCell} align="right">{loanData.plannedNumberOfDirectDebit ? loanData.plannedNumberOfDirectDebit : ''}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </React.Fragment>
        );
    }
}

InterestAndFinanceOverview.propTypes = {
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    classes: PropTypes.object,
    isDashboardContent: PropTypes.bool,
    refreshLoanData: PropTypes.func,
    selectedDashboardItems: PropTypes.array,
    setNavigationInDashboards: PropTypes.func,
    selectLoan: PropTypes.func,
    locale: PropTypes.string
};

export default withStyles(customStyles)(InterestAndFinanceOverview);