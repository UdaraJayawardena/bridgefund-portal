import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from 'assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles';
import {
    Paper, Grid, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody
} from '@material-ui/core';
import { NODECIMALEURO } from 'lib/initiation/utility';

class ParameterValuesBlock extends Component {

    render() {
        const { classes, dataList } = this.props;
        const { maxNumberOfWorkingDaysBankFile, minimalNumberOfDaysInBankFile, minimalTurnOverAmount, higherBalancePercentage } = dataList;

        return (
            <>
                <Paper variant="outlined" className={classes.highRiskContainer} >
                    <Grid container>

                    </Grid>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.transactionContainerTitle} > Scoring model </TableCell>
                                    <TableCell className={classes.parameterGreen} >Green</TableCell>
                                    <TableCell className={classes.parameterOrange}>Orange</TableCell>
                                    <TableCell className={classes.parameterRed}>Red</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            <TableRow>
                                    <TableCell className={classes.tableCell} > Total days available in main bank account file </TableCell>
                                    <TableCell className={classes.tableCell}>{minimalNumberOfDaysInBankFile ? `> ${minimalNumberOfDaysInBankFile} days` : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>{minimalNumberOfDaysInBankFile ? `> ${minimalNumberOfDaysInBankFile / 2} days` : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>{minimalNumberOfDaysInBankFile ? `< ${minimalNumberOfDaysInBankFile / 2} days` : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell} > Last bank file date </TableCell>
                                    <TableCell className={classes.tableCell}>{maxNumberOfWorkingDaysBankFile ? `< ${maxNumberOfWorkingDaysBankFile} days` : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>{maxNumberOfWorkingDaysBankFile ? `> ${maxNumberOfWorkingDaysBankFile} days` : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>

                                </TableRow>
                                
                               
                                <TableRow>
                                    <TableCell className={classes.tableCell} > Revenue all bank accounts </TableCell>
                                    <TableCell className={classes.tableCell}>{minimalTurnOverAmount ? NODECIMALEURO(minimalTurnOverAmount) : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>{minimalTurnOverAmount ? NODECIMALEURO(minimalTurnOverAmount / 2) : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>{minimalTurnOverAmount ? `> ${NODECIMALEURO(minimalTurnOverAmount / 2)}` : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell} > Expected direct debit success rate main bank account </TableCell>
                                    <TableCell className={classes.tableCell}>{higherBalancePercentage ? higherBalancePercentage : 0}%</TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
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

ParameterValuesBlock.propTypes = {
    classes: PropTypes.object.isRequired,
    dataList: PropTypes.object,
};

const mapStateToProp = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(ParameterValuesBlock));