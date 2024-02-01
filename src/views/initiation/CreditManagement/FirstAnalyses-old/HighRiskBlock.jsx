import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from "assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles";
import { EURO, percentage } from 'lib/initiation/utility';
import {
    Paper, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody
} from '@material-ui/core';

class HighRiskBlock extends Component {

    render() {
        const { classes, customer, smeLoanRequest } = this.props;

        return (
            <>
                <Paper variant="outlined" className={classes.highRiskContainer} >
                    {/* <Grid container justify="space-between">
                        <Grid item>
                            <Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>High Risk</Typography>
                        </Grid>
                    </Grid> */}
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>High Risk</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Risk profile</TableCell>
                                    <TableCell className={smeLoanRequest.customerHighRiskIndicator == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.customerHighRiskIndicator == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.customerHighRiskIndicator == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>Customer
                                    </TableCell>
                                    <TableCell className={smeLoanRequest.customerHighRiskIndicator == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.customerHighRiskIndicator == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.customerHighRiskIndicator == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>Person
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Legal-Form</TableCell>
                                    <TableCell className={smeLoanRequest.legalFormIndicator == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.legalFormIndicator == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.legalFormIndicator == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>{customer && customer.legalForm?customer.legalForm :''}
                                                </TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>No-of-Bank-Accounts</TableCell>
                                    <TableCell className={smeLoanRequest.bankFileIndicator1 == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.bankFileIndicator1 == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.bankFileIndicator1 == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>{smeLoanRequest.numberOfBankAccounts}
                                    </TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Bank-File (actual/days)</TableCell>
                                    <TableCell className={smeLoanRequest.bankFileIndicator2 == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.bankFileIndicator2 == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.bankFileIndicator2 == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>
                                                    {smeLoanRequest.bankFileIndicator2 === 'green' ? 'yes' : 
                                                        (smeLoanRequest.bankFileIndicator2 === 'orange' 
                                                        || smeLoanRequest.bankFileIndicator2 === 'red') ? 'no' : '-'}
                                    </TableCell>
                                    <TableCell className={smeLoanRequest.bankFileIndicator3 == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.bankFileIndicator3 == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.bankFileIndicator3 == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>{smeLoanRequest.numberOfDaysInBankFile}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Turn-Over (yearly-base)</TableCell>
                                    <TableCell className={smeLoanRequest.turnOverIndicator == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.turnOverIndicator == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.turnOverIndicator == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>{smeLoanRequest.turnOverOnYearlyBase ? EURO(smeLoanRequest.turnOverOnYearlyBase) : '-'}
                                    </TableCell>
                                    <TableCell className={classes.tableCell}>{smeLoanRequest.turnOver ? EURO(smeLoanRequest.turnOver) : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Expected-Success-DD</TableCell>
                                    <TableCell className={smeLoanRequest.expectedSuccessDDIndicator == 'green' ?
                                        classes.highRiskGreen : smeLoanRequest.expectedSuccessDDIndicator == 'orange' ?
                                            classes.highRiskOrange : smeLoanRequest.expectedSuccessDDIndicator == 'red' ?
                                                classes.highRiskRed : classes.highRiskPlain}>{smeLoanRequest.expectedSuccessDDPercentage ? percentage(smeLoanRequest.expectedSuccessDDPercentage) : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </>
        );
    }
}

HighRiskBlock.propTypes = {
    classes: PropTypes.object.isRequired,
    customer: PropTypes.object,
    smeLoanRequest: PropTypes.object
};

const mapStateToProp = (state) => ({
    customer: state.lmglobal.selectedCustomer,
    smeLoanRequest: state.lmglobal.overviewData,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(HighRiskBlock));