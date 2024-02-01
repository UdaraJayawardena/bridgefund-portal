import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import withStyles from "@material-ui/core/styles/withStyles";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import GridItem from 'components/loanmanagement/Grid/GridItem';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from 'components/loanmanagement/CustomButtons/Button';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
import { ENVIRONMENT } from "constants/loanmanagement/config";
import Utility from "lib/loanmanagement/utility";

const CURRENCY = Utility.multiCurrencyConverter();
const isProduction = Utility.getEnv() === ENVIRONMENT.PRODUCTION;

class FlexLoanChangeCreditLimitPopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newCreditLimit: 0,
            newAvailableBalance: 0,
        };
    }

    changeCreditLimit = () => {

        const { smeLoan, } = this.props;
        const { newCreditLimit } = this.state;
        const revisionDate = moment(this.getDate()).add(6, 'months').format('YYYY-MM-DD');

        const reqData = {
            contractId: smeLoan.contractId,
            loanId: smeLoan._id,
            data: { creditLimitAmount: newCreditLimit, revisionDate: revisionDate }
        };

        this.props.updateFlexLoan(reqData)
            .then(res => {
                this.setState({ newCreditLimit: 0, newAvailableBalance: 0 });
                this.props.refreshLoanData(smeLoan.contractId);
                this.props.onClosePopUp();
            })
            .catch(() => {
                this.setState({ newCreditLimit: 0, newAvailableBalance: 0 });
                this.props.onClosePopUp();
            }
            );
    }


    getDate = () => {
        if (!isProduction) return moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
        return moment().format('YYYY-MM-DD');
    }

    getPartialAmount = () => {
        if (this.props.smeLoan.status === 'loan-normally-settled')
            return 0;
        return this.props.overviewData.partialOutstandingAmount;
    }

    handleNewBalanceValue = (value) => {

        const { smeLoan, overviewData } = this.props;
        const newLimit = Number(value);
        const available = smeLoan.creditLimitAmount - (overviewData.loanOutstandingAmount + overviewData.otherCostOutstandingAmount + this.getPartialAmount());
        const newAvailable = available + (newLimit - smeLoan.creditLimitAmount);

        this.setState({ newCreditLimit: newLimit, newAvailableBalance: newAvailable });
    }

    render() {

        const { newCreditLimit, newAvailableBalance } = this.state;
        const { smeLoan, overviewData, classes, open, locale, symbol, decimalSeparator, thousandSeparator } = this.props;

        return (
            <>
                <Dialog
                    open={open}
                    aria-labelledby="change-credit-limit"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth={'sm'}
                >
                    <DialogTitle id="alert-dialog-title">Credit Limit</DialogTitle>
                    <DialogContent>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}></GridItem>

                            <GridItem xs={12} sm={12} md={6}>
                                <TextField
                                    id="currentCreditLimit"
                                    label="Current Credit Limit"
                                    value={CURRENCY(smeLoan.creditLimitAmount || 0, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                                    InputProps={{
                                        readOnly: false,
                                    }}
                                    variant="outlined"
                                    fullWidth
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <TextField
                                    id="availableBalance"
                                    label="Available Balance"
                                    value={CURRENCY((smeLoan.creditLimitAmount - (overviewData.loanOutstandingAmount + overviewData.otherCostOutstandingAmount + this.getPartialAmount())) || 0, locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                                    InputProps={{
                                        readOnly: false,
                                    }}
                                    variant="outlined"
                                    fullWidth
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6} className={classes.creditLimitSecondRow}>
                                <MultiCurrencyCustomFormatInput
                                    className={classes.textField}
                                    type="text"
                                    labelText="New Credit Limit"
                                    id="newCreditLimit"
                                    name="newCreditLimit"
                                    numberformat={newCreditLimit.toFixed(2)}
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    symbol={symbol ? symbol : '€'}
                                    decimalSeparator={decimalSeparator ? decimalSeparator : ','}
                                    thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
                                    changeValue={this.handleNewBalanceValue}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6} className={classes.creditLimitSecondRow}>
                                <TextField
                                    id="newBalance"
                                    name="newBalance"
                                    label="New available"
                                    fullWidth={true}
                                    value={CURRENCY(newAvailableBalance.toFixed(2), locale ? locale : 'nl-NL', smeLoan.currency ? smeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                />
                            </GridItem>
                        </GridContainer>
                    </DialogContent>
                    <DialogActions>
                        {this.state.loading && <CircularProgress size={22} />}
                        <Button onClick={this.props.onClosePopUp} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.changeCreditLimit} color="info">
                            Process
                        </Button>
                    </DialogActions>
                </Dialog>

            </>
        );
    }
}

FlexLoanChangeCreditLimitPopUp.propTypes = {
    locale: PropTypes.string,
    symbol: PropTypes.string,
    decimalSeparator: PropTypes.string,
    thousandSeparator: PropTypes.string
}

export default withStyles(customStyles)(FlexLoanChangeCreditLimitPopUp);