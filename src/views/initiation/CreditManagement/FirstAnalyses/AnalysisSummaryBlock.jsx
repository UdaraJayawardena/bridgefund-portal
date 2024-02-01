import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from "assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles";
import {
    Paper, Grid, TableContainer, Table, TableRow,
    TableCell, TableBody, TableHead
} from '@material-ui/core';
import { EURO } from 'lib/initiation/utility';
import moment from 'moment';

class AnalysisSummary extends Component {
    render() {
        const {
            classes,
            dataList,
        } = this.props;
        const { dateOfAutomatedAnalysis, desiredPrincipleAmount, revenueAmountPercentage, firstAnalysisOutcome, firstAnalysisOutcomeIndicator } = dataList;

        return (
            <>
                <Paper variant="outlined" className={classes.highRiskContainer}>
                    <Grid container>

                    </Grid>
                    <TableContainer
                        component={Paper}
                        className={classes.tableContainer}
                    >
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.transactionContainerTitle} > Analysis Summary </TableCell>
                                    <TableCell className={classes.parameterPlan} > { }</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>
                                        Date of automated analysis
                                    </TableCell>
                                    <TableCell className={classes.tableCell}>
                                        {dateOfAutomatedAnalysis ? moment(dateOfAutomatedAnalysis).format('DD-MM-YYYY') : '-'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>
                                        Desired amount
                                    </TableCell>
                                    <TableCell className={classes.tableCell}>
                                        {desiredPrincipleAmount
                                            ? EURO(desiredPrincipleAmount)
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>
                                        15% of revenue all bank accounts (actual)
                                    </TableCell>
                                    <TableCell className={classes.tableCell}>
                                        {revenueAmountPercentage ? EURO(revenueAmountPercentage) : '-'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>
                                        Outcome Automated First Analysis
                                    </TableCell>

                                    <TableCell
                                        className={
                                            firstAnalysisOutcomeIndicator == "green"
                                                ? classes.analysisSummaryGreen
                                                : firstAnalysisOutcomeIndicator == "orange"
                                                    ? classes.analysisSummaryOrange
                                                    : firstAnalysisOutcomeIndicator == "red"
                                                        ? classes.analysisSummaryRed
                                                        : classes.analysisSummaryPlain
                                        }
                                    >

                                        {firstAnalysisOutcome
                                            ? firstAnalysisOutcome.toLowerCase().split('_').join(' ').replace(/^./, firstAnalysisOutcome[0].toUpperCase())
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </>
        );
    }
}

AnalysisSummary.propTypes = {
    classes: PropTypes.object.isRequired,
    dataList: PropTypes.object,
};

const mapStateToProp = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(AnalysisSummary));