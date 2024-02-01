import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from "assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles";
import {
    Paper,TableContainer, Table, TableRow,
    TableCell, TableBody
} from '@material-ui/core';
import { EURO } from 'lib/initiation/utility';

class AnalysisAccountBlock extends Component {

    render() {
        const { classes, dataList } = this.props;
        const { incomeAmount, incomeAmountOnYearlyBase, revenueAmount, revenueAmountIndicator, calculatedExpectedLoanAmount, revenueAmountOnYearlyBase, expectedSuccessDDIndicator, expectedSuccessDDPercentage } = dataList;

        return (
            <>
                <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Incoming transactions all bank accounts (actual)</TableCell>
                                    <TableCell className={classes.tableCell}> {incomeAmount ? EURO(incomeAmount) : '-'} </TableCell>
                              
                                </TableRow>
                                <TableRow>
                                <TableCell className={classes.tableCell}>Incoming transactions all bank accounts (extrapolated to 365 days)</TableCell>
                                    <TableCell className={classes.tableCell}> {incomeAmountOnYearlyBase ? EURO(incomeAmountOnYearlyBase) : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Revenue all bank accounts (actual) </TableCell>
                                    <TableCell className={classes.tableCell}> {revenueAmount ? EURO(revenueAmount) : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                <TableCell className={classes.tableCell}>Revenue all bank accounts (extrapolated to 365 days)</TableCell>
                                    <TableCell className={revenueAmountIndicator == 'green' ?
                                        classes.AnalysesAccountGreen : revenueAmountIndicator == 'orange' ?
                                            classes.AnalysesAccountOrange : revenueAmountIndicator == 'red' ?
                                                classes.AnalysesAccountRed : classes.AnalysesAccountPlain}> {revenueAmountOnYearlyBase ? EURO(revenueAmountOnYearlyBase) : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Expected direct debit success rate main bank account</TableCell>
                                    <TableCell className={expectedSuccessDDIndicator == 'green' ?
                                        classes.AnalysesAccountGreen : expectedSuccessDDIndicator == 'orange' ?
                                            classes.AnalysesAccountOrange : expectedSuccessDDIndicator == 'red' ?
                                                classes.AnalysesAccountRed : classes.AnalysesAccountPlain}> {expectedSuccessDDPercentage ? expectedSuccessDDPercentage : '0'}% </TableCell>
                                </TableRow>
                            <TableRow>
                                    <TableCell className={classes.tableCell}>Automatically calculated awarded amount</TableCell>
                                <TableCell className={classes.tableCell}> {calculatedExpectedLoanAmount ? EURO(calculatedExpectedLoanAmount) : '-'} </TableCell>
                            </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
               
            </>
        );
    }
}

AnalysisAccountBlock.propTypes = {
    classes: PropTypes.object.isRequired,
    dataList: PropTypes.object,
};

const mapStateToProp = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(AnalysisAccountBlock));