import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from "assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles";
import { Paper, TableContainer, Table, TableRow, TableCell, TableBody } from '@material-ui/core';
import moment from 'moment';

class AnalysisOutcomeBlock extends Component {

    render() {
        const { classes, dataList } = this.props;
        const { riskProfileOrganizationIndicator, riskProfileOrganization, riskProfilePerson, riskProfilePersonIndicator, legalEntityIndicator,
            legalEntity, industry, lastBankFileDateIndicator, lastBankFileDate, numberOfBankAccounts, numberOfDaysInMainBankFile, numberOfDaysInMainBankFileIndicator
        } = dataList;

        return (
            <>

                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Risk profile organization</TableCell>
                                    <TableCell
                                        className={riskProfileOrganizationIndicator == 'green' ?
                                            classes.outcomeGreen : riskProfileOrganizationIndicator == 'orange' ?
                                                classes.outcomeOrange : riskProfileOrganizationIndicator == 'red' ?
                                                    classes.outcomeRed : classes.outcomePlain}

                                    > {riskProfileOrganization ? riskProfileOrganization : '-'} </TableCell>
                              
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Risk profile person</TableCell>
                                    <TableCell
                                        className={riskProfilePersonIndicator == 'green' ?
                                            classes.outcomeGreen : riskProfilePersonIndicator == 'orange' ?
                                                classes.outcomeOrange : riskProfilePersonIndicator == 'red' ?
                                                    classes.outcomeRed : classes.outcomePlain}
                                    > {riskProfilePerson ? riskProfilePerson : '-'}  </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Legal entity</TableCell>
                                    <TableCell
                                        className={legalEntityIndicator == 'green' ?
                                            classes.outcomeGreen : legalEntityIndicator == 'orange' ?
                                                classes.outcomeOrange : legalEntityIndicator == 'red' ?
                                                    classes.outcomeRed : classes.outcomePlain}
                                    > {legalEntity ? legalEntity : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Industry</TableCell>
                                    <TableCell className={classes.tableCell}> {industry ? industry : '-'}  </TableCell>
                                </TableRow>
                                <TableRow>
                                <TableCell className={classes.tableCell}>Number of bank accounts</TableCell>
                                    <TableCell
                                    > {numberOfBankAccounts ? numberOfBankAccounts : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Last bank file date</TableCell>
                                    <TableCell
                                        className={lastBankFileDateIndicator == 'green' ?
                                            classes.outcomeGreen : lastBankFileDateIndicator == 'orange' ?
                                                classes.outcomeOrange : lastBankFileDateIndicator == 'red' ?
                                                    classes.outcomeRed : classes.outcomePlain}
                                    > {lastBankFileDate ? moment(lastBankFileDate).format('DD-MM-YYYY') : '-'} </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Total days available in main bank account file</TableCell>
                                    <TableCell
                                        className={numberOfDaysInMainBankFileIndicator == 'green' ?
                                            classes.outcomeGreen : numberOfDaysInMainBankFileIndicator == 'orange' ?
                                                classes.outcomeOrange : numberOfDaysInMainBankFileIndicator == 'red' ?
                                                    classes.outcomeRed : classes.outcomePlain}
                                    > {numberOfDaysInMainBankFile ? numberOfDaysInMainBankFile : '-'}  </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                </TableContainer>
            </>
        );
    }
}

AnalysisOutcomeBlock.propTypes = {
    classes: PropTypes.object.isRequired,
    dataList: PropTypes.object,
};

const mapStateToProp = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(AnalysisOutcomeBlock));