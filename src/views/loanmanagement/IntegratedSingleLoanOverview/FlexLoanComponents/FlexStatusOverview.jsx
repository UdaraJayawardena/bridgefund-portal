import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Grid, TextField, Tooltip } from '@material-ui/core';
import withStyles from "@material-ui/core/styles/withStyles";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';

// Top right section 
class FlexStatusOverview extends Component {
    render() {

        const { classes, loanData } = this.props;

        return (
            <React.Fragment>
                <Grid item xs={4} >
                    <TextField
                        InputProps={{
                            className: classes.autoSuggestTextStyle,
                            readOnly: true
                        }}
                        InputLabelProps={{
                            className: classes.autoSuggestTextLabelStyle,
                            shrink: true
                        }}
                        id="risk-category"
                        label="Risk Category"
                        value={loanData && loanData.riskCategory ? loanData.riskCategory : ''}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={4} >
                    <Tooltip
                        id="loan-status-table-status-tooltip"
                        placement="bottom-start"
                        title={
                            <React.Fragment>
                                <table className={classes.tooltipTable}>
                                    <thead>
                                        <tr>
                                            <th className={classes.tooltipTableHeadCell}>status</th>
                                            <th className={classes.tooltipTableHeadCell}>date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            loanData.statusHistory?.map(history => (
                                                <tr key={history._id} id={history._id}>
                                                    <td id={history._id + '-' + history.status} className={classes.tooltipTableBodyCell}>{history.status}</td>
                                                    <td id={history._id + '-' + history.createdAt} className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </React.Fragment>
                        }
                    >
                        <TextField
                            id="status "
                            label="Status"
                            value={loanData && loanData.status ? loanData.status : ''}
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
                <Grid item xs={4} >
                    <TextField
                        id="revision-date"
                        label="Revision Date"
                        value={loanData && loanData.revisionDate ? moment(loanData.revisionDate).format("DD-MM-YYYY") : ''}
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
            </React.Fragment>
        );
    }
}

FlexStatusOverview.propTypes = {
    loanData: PropTypes.object,
};

export default withStyles(customStyles)(FlexStatusOverview);