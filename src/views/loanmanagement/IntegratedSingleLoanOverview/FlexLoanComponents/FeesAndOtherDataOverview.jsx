import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Tooltip, TextField, Typography } from '@material-ui/core';
// import moment from 'moment';
import withStyles from "@material-ui/core/styles/withStyles";
import Utility from "lib/loanmanagement/utility";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import moment from 'moment';

const multiCurrencyPercentage = Utility.multiCurrencyPercentage;

// bottom right section 
class FessAndOtherDataOverview extends Component {

    numberFormating = (number, suffix = '', prefix = '') => {
        try {
            if (!number || number === '') return 0;

            const value = number.toString();

            let output = value;

            const [integerValue, floatValues] = value.match(/\./g) ? value.split(/\./g) : [value, '00'];

            if (integerValue && integerValue.length > 3) {
                let placeholder = Array.from(integerValue).reverse().join('');
                placeholder = placeholder.match(/.{1,3}/g).join('.');
                placeholder = Array.from(placeholder).reverse().join('');

                output = `${placeholder},${floatValues}`;

            } else {
                output = `${integerValue},${floatValues}`;
            }

            return `${prefix}${output}${suffix}`;
        } catch {
            return `${prefix}${number}${suffix}`;
        }
    }

    render() {
        const { classes, loanData, locale } = this.props;
        return (
            <React.Fragment>
                {/* fees block */}
                <Grid item xs={6}>
                    <Typography variant="body1" gutterBottom className={classes.SectionTitleStyle}>{'Fees'}</Typography>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <Tooltip
                                placement="top-start"
                                title={
                                    <React.Fragment>
                                        <table className={classes.tooltipTable}>
                                            <thead>
                                                <tr>
                                                    <th className={classes.tooltipTableHeadCell}>Percentage</th>
                                                    <th className={classes.tooltipTableHeadCell}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    loanData && loanData.withdrawalCostPercentageHistory && loanData.withdrawalCostPercentageHistory.map(history => (
                                                        <tr key={`history._id`}>
                                                            <td className={classes.tooltipTableBodyCell}>{multiCurrencyPercentage(history.percentage ? history.percentage : 0, locale ? locale : 'nl-NL')}</td>
                                                            <td className={classes.tooltipTableBodyCell}>{history.createdAt ? moment(history.createdAt).format("DD-MM-YYYY") : ''}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </React.Fragment>
                                }
                            >
                                <TextField
                                    id="withdrawal-cost-percentage"
                                    label="Withdrawal Cost %"
                                    value={multiCurrencyPercentage(loanData && loanData.withdrawalCostPercentage ? loanData.withdrawalCostPercentage : 0, locale ? locale : 'nl-NL')}
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
                        <Grid item xs={12}>
                            <Tooltip
                                placement="top-start"
                                title={
                                    <React.Fragment>
                                        <table className={classes.tooltipTable}>
                                            <thead>
                                                <tr>
                                                    <th className={classes.tooltipTableHeadCell}>Percentage</th>
                                                    <th className={classes.tooltipTableHeadCell}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    loanData && loanData.recurringInterestCostPercentageHistory && loanData.recurringInterestCostPercentageHistory.map(history => (
                                                        <tr key={`history._id`}>
                                                            <td className={classes.tooltipTableBodyCell}>{multiCurrencyPercentage(history.percentage ? history.percentage : 0, locale ? locale : 'nl-NL')}</td>
                                                            <td className={classes.tooltipTableBodyCell}>{history.createdAt ? moment(history.createdAt).format("DD-MM-YYYY") : ''}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </React.Fragment>
                                }
                            >
                                <TextField
                                    id="recurring-interest-percentage-per-month"
                                    label="Recurring-Interest % Per Month"
                                    value={multiCurrencyPercentage(loanData && loanData.recurringInterestCostPercentage ? loanData.recurringInterestCostPercentage : 0, locale ? locale : 'nl-NL')}
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
                        <Grid item xs={12}>
                            <TextField
                                id="annual-percentage-rate"
                                label="Annual Percentage Rate"
                                value={multiCurrencyPercentage(loanData && loanData.interestAnnualPercentageRate ? loanData.interestAnnualPercentageRate : 0, locale ? locale : 'nl-NL')}
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
                                id="recurring-cost-collect-day"
                                label="Recurring Cost Collect Day"
                                value={loanData && loanData.recurringCostCollectDate ? loanData.recurringCostCollectDate : ''}
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
                {/* other contract data block */}
                <Grid item xs={6}>
                    <Typography variant="body1" gutterBottom className={classes.SectionTitleStyle}>{'Other Contract-Data'}</Typography>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <TextField
                                id="contrat-start-date"
                                label="Contract Start Date"
                                value={loanData && loanData.startDate ? moment(loanData.startDate).format("DD-MM-YYYY") : ''}
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
                                id="maturity-date"
                                label="Maturity Date"
                                value={loanData && loanData.maturityDate ? moment(loanData.maturityDate).format("DD-MM-YYYY") : ''}
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
                                id="duration-in-months"
                                label="Duration in Months"
                                value={loanData && loanData.numberOfMonths ? loanData.numberOfMonths : 0}
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
                                id="direct-debit-frequency"
                                label="Direct Debit Frequency"
                                value={loanData && loanData.directDebitFrequency ? Utility.styleStrings(loanData.directDebitFrequency, 'firstUpper') : ''}
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

            </React.Fragment>
        );
    }
}

FessAndOtherDataOverview.propTypes = {
    loanData: PropTypes.object,
    classes: PropTypes.object,
    locale: PropTypes.string
};

export default withStyles(customStyles)(FessAndOtherDataOverview);