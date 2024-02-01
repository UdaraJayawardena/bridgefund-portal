import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from 'assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles';
import {
    Paper, Grid, Typography, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody
} from '@material-ui/core';
import { NODECIMALEURO } from 'lib/initiation/utility';
import { getPlatformParameters } from 'store/initiation/actions/PlatformParameters.action';

const PARAMETER_NAME = 'BridgeFund BV';

class ParameterValuesBlock extends Component {

    constructor(props) {
        super(props);

        this.state = {
            platformParameter: {}
        };
    }

    componentDidMount() {
        this.getPlatformParameter();
    }

    getPlatformParameter = () => {
        const searchQuery = { platformName: PARAMETER_NAME };
        this.props.getPlatformParameters(searchQuery)
            .then(result => {
                this.setState({ platformParameter: result[0] });
            })
            .catch(() => {
                this.props.displayNotification('Error occured in get platform parameter!', 'error');
            });
    }

    render() {
        const { classes } = this.props;
        const { platformParameter } = this.state;

        return (
            <>
                <Paper variant="outlined" className={classes.highRiskContainer} >
                    <Grid container justify="space-between">
                        <Grid item>
                            <Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>Parameter Values</Typography>
                        </Grid>
                    </Grid>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow>
                                    <TableCell className={classes.parameterGreen} >Green</TableCell>
                                    <TableCell className={classes.parameterOrange}>Orange</TableCell>
                                    <TableCell className={classes.parameterRed}>Red</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>{platformParameter.maxNumberOfWorkingDaysBankFile}</TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
                                    <TableCell className={classes.tableCell}></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>{platformParameter.minimalNumberOfDaysInBankFile}</TableCell>
                                    <TableCell className={classes.tableCell}>{platformParameter.minimalNumberOfDaysInBankFile / 2}</TableCell>
                                    <TableCell className={classes.tableCell}>Lower Values</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>{NODECIMALEURO(platformParameter.minimalTurnOverAmount)}</TableCell>
                                    <TableCell className={classes.tableCell}>{NODECIMALEURO(platformParameter.minimalTurnOverAmount / 2)}</TableCell>
                                    <TableCell className={classes.tableCell}>Lower Values</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>{platformParameter.higherBalancePercentage}%</TableCell>
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
    getPlatformParameters: PropTypes.func.isRequired,
};

const mapStateToProp = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
    getPlatformParameters: (requestQuery) => dispatch(getPlatformParameters(requestQuery)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(ParameterValuesBlock));