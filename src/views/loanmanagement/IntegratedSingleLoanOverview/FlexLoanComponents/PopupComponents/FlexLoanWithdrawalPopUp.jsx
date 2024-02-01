import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField, OutlinedInput, InputAdornment } from '@material-ui/core';
import Button from 'components/loanmanagement/CustomButtons/Button';
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import { AddCircle, RemoveCircle } from '@material-ui/icons';
import { smeLoanStatus, approveRevisionStep, approveRevisionRoles } from "constants/loanmanagement/sme-loan";
import Utility from "lib/loanmanagement/utility";
import { ENVIRONMENT } from "constants/loanmanagement/config";
import GridItem from 'components/loanmanagement/Grid/GridItem';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
import MomentUtils from '@date-io/moment';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { clearFlexLoanOverviewData, createSmeFlexLoanWithdrawal, getFlexLoanLatestWithdrawalOrder, getFlexLoanOutstandingAmount, getFlexLoanOverviewData, getWithdrwalsforSelectedLoan, addFlexLoanWithdrawal } from 'store/loanmanagement/actions/FlexLoan.action';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { checkFailedSmeLoanTransactions } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";

const PROCESS_DEFINITION_KEY = "revision-flex-loan";

const CURRENCY = Utility.multiCurrencyConverter();

const isProduction = Utility.getEnv() === ENVIRONMENT.PRODUCTION;
const initialWithdrawalState = {
    outstandingAmount: 0,
    currentDdAmount: 0,
    withdrawalAmount: 0,
    withdrawalCosts: 0,
    payout: 0,
    newOutstandingAmount: 0,
    interestOnlyLimit: 0,
    baseForDdCalculation: 0,
    newDdAmount: 0,
    startDate: null,
    instantPayment: 0,
    toSme: 0,
    thirdParties: [0],
    thirdPartyPayments: [{ toSme: 0, thirdParty: 0 }],
    errors: {
        startDate: null,
        newOutstandingAmount: null,
    }
};

class FlexLoanWithdrawalPopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedSmeLoan: this.props.loanData,
            selectedSme: this.props.smeDetails,
            withdrawalPopup: false,
            loading: false,
            openWithdrawalPossiblePopup: false,
            withdrawal: JSON.parse(JSON.stringify(initialWithdrawalState)),
            withdrawalButtonDisable: true,
            checkWithdrawalPossible: false,
            nextWorkingDate: null,
            lastWithdrawalOrder: { newDirectDebitAmount: null },
            disableWithdrawal: false,
            withdrawalConfirmation: false,
            withdrawalMessage: '',
            disableWithdrawalConfirmedButton : true
        };
    }

    componentDidMount() {

        this.handleWithdrawalPopup();
    }


    extractContractId = () => {
        const { selectedSmeLoan } = this.state;
        this.props.refreshLoanData(selectedSmeLoan.contractId);

        this.props.getWithdrwalsforSelectedLoan(selectedSmeLoan.contractId)
            .then(response => {
                this.setState({ totalwithdrawals: response });
            });
    }

    getDate = () => {
        if (!isProduction) return moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD'); // 
        return moment().format('YYYY-MM-DD');
    }

    getFlexLoanOutstandingAmount = (contractId) => {
        return this.props.getFlexLoanOutstandingAmount(contractId)// 
            .then((outstandingAmount) => outstandingAmount)
            .catch((error) => { throw Error(error); });
    }

    getFlexLoanLatestWithdrawalOrder = (contractId) => {
        return this.props.getFlexLoanLatestWithdrawalOrder(contractId)// TODO_props
            .then((withdrawalOrder) => withdrawalOrder)
            .catch((error) => { throw Error(error); });
    }

    handleWithdrawalPopup = () => {

        const { selectedSmeLoan } = this.state;

        const numberOfDaysToAdd = this.getDaysByFrequency(selectedSmeLoan.directDebitFrequency);

        this.setState((prevState) => ({ withdrawalPopup: !prevState.withdrawalPopup, loading: !prevState.loading, openWithdrawalPossiblePopup: false }), async (contractId = selectedSmeLoan.contractId) => {
            if (this.state.withdrawalPopup) {

                this.props.getNextWorkingDate(moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD'), numberOfDaysToAdd, selectedSmeLoan.country ? selectedSmeLoan.country : 'NL')
                    .then(async (nextWorkingDate) => {
                        const { withdrawal, selectedSmeLoan } = this.state;
                        let { lastWithdrawalOrder } = this.state;
                        withdrawal.startDate = nextWorkingDate;
                        selectedSmeLoan.outstandingAmount = await this.getFlexLoanOutstandingAmount(contractId);
                        withdrawal.outstandingAmount = selectedSmeLoan.outstandingAmount;
                        if (selectedSmeLoan && selectedSmeLoan.outstandingAmount) withdrawal.newOutstandingAmount = selectedSmeLoan.outstandingAmount;
                        if (selectedSmeLoan && selectedSmeLoan.contractId) {
                            const latest = await this.getFlexLoanLatestWithdrawalOrder(selectedSmeLoan.contractId);
                            if (latest) lastWithdrawalOrder = latest;
                        }
                        if (selectedSmeLoan) withdrawal.currentDdAmount = selectedSmeLoan.directDebitAmountFirstPeriod;
                        this.setState({ withdrawal, nextWorkingDate, lastWithdrawalOrder, disableWithdrawal: false, loading: false });
                    })
                    .catch(() => { this.setState({ disableWithdrawal: true, loading: false }); });

            } else {
                this.setState({ withdrawal: JSON.parse(JSON.stringify(initialWithdrawalState)), loading: false }, () => { this.extractContractId(); });
            }
        });
    }

    handleWithdrawalAmountChanges = (value, fieldName) => {
        const { withdrawal, selectedSmeLoan } = this.state;
        withdrawal[fieldName] = Number(value);
        withdrawal['withdrawalCosts'] = Number(value) * (Number(selectedSmeLoan.withdrawalCostPercentage) / 100);
        withdrawal['payout'] = Number(value) - withdrawal['withdrawalCosts'];
        withdrawal['newOutstandingAmount'] = (Number(value) * -1) + selectedSmeLoan.outstandingAmount;
        this.setState({withdrawalButtonDisable : (Number(value)>0 ? false : true)});

        // withdrawal.errors.newOutstandingAmount = ((withdrawal['newOutstandingAmount'] * -1) > Number(this.state.selectedSmeLoan.creditLimitAmount)) ?
        //     'New outstanding amount bigger than credit-limit; change withdrawal-amount' : null;

        this.setState({ withdrawal });
    }

    handleInterestOnlyLimitChanges = (value, fieldName) => {
        const { withdrawal } = this.state;
        // const { target: { name, value } } = event;
        const max = Number(this.state.selectedSmeLoan.creditLimitAmount) * 0.1;
        withdrawal[fieldName] = (Number(value) > max) ? max : Number(value);
        // withdrawal[name] = Number(value);
        this.setState({ withdrawal });
    }

    getBaseForDdCalculation = () => {
        //sum (new-outstanding-amount - interest-only-limit-amount)
        return (this.getNewOutStandingAmount()) - Number(this.state.withdrawal.interestOnlyLimit);
    }

    getNewDdAmount = () => {
        //base-for-dd-calculation / sme-loan.planned-number-of-direct-debit
        const baseForDdCalculation = this.getBaseForDdCalculation();
        const newDdAmount = (baseForDdCalculation === 0) ? baseForDdCalculation :
            (baseForDdCalculation / Number(this.state.selectedSmeLoan.plannedNumberOfDirectDebit));

        return newDdAmount;
    }

    getSentToBankAmount = () => {

        const sentToBankTransactions = this.props.directdebits.filter(transaction => transaction.status === 'sent-to-bank')
            .reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);

        return sentToBankTransactions;
    }

    getBaseForNewAmount = () => {
        const { outstandingAmount } = this.props.loanData;
        const baseForNewAmount = (-1 * (outstandingAmount ? outstandingAmount : 0)) - this.getSentToBankAmount();
        return baseForNewAmount;
    }

    getNewOutStandingAmount = () => {
        const newOutStandingAmount = this.getBaseForNewAmount() + this.state.withdrawal.withdrawalAmount;
        return newOutStandingAmount;
    }

    handleAmountChanges = (event) => {
        const { withdrawal } = this.state;
        const { target: { name, value } } = event;
        withdrawal[name] = Number(value);
        this.setState({ withdrawal });
    }

    handleThirdPartyValuesChanges = (value, fieldName) => {
    // handleThirdPartyValuesChanges = (event) => {
        // const { target: { name, value } } = event;
        const fieldDetails = fieldName.split('_');
        const { withdrawal } = this.state;
        withdrawal[fieldDetails[0]][fieldDetails[1]] = Number(value);
        this.setState({ withdrawal });
    }

    handleDropDownChanges = (event) => {
        const { withdrawal } = this.state;
        withdrawal.instantPayment = Number(event.target.value);
        if (Number(withdrawal.instantPayment) === 0) withdrawal.thirdParties = [0];
        this.setState({ withdrawal });
    }

    addThirdPartySection = () => {
        const { withdrawal } = this.state;
        withdrawal.thirdParties.push(0);
        this.setState({ withdrawal });
    }

    removeThirdPartySection = (index) => {
        const { withdrawal } = this.state;
        withdrawal.thirdParties.splice(index, 1);
        this.setState({ withdrawal });
    }

    handleWithdrawalStartDateChanges = (event) => {
        const date =  event.target.value;
        const { selectedSmeLoan } = this.state;
        if (moment(date).isSameOrAfter(moment(this.state.nextWorkingDate))) {

            this.props.getNextWorkingDate(moment(date).subtract(1, 'day').format('YYYY-MM-DD'), 1, selectedSmeLoan.country ? selectedSmeLoan.country : 'NL')
                .then((nextWorkingDate) => {

                    const { withdrawal } = this.state;
                    withdrawal.startDate = nextWorkingDate;
                    this.setState({ withdrawal });

                })
                .catch(() => { this.setState({ disableWithdrawal: true }); });

        }
    }

    isAnyError = () => {

        const { withdrawal } = this.state;

        let isAnyError = false;
        let errorMessage = null;

        for (const item in withdrawal.errors) {
            if (withdrawal.errors[item]) {
                isAnyError = true;
                errorMessage = withdrawal.errors[item];
            }
        }

        return [isAnyError, errorMessage];

    }

    getAmountToSme = () => {
        return Number(this.state.withdrawal.payout) - Number(this.state.withdrawal.thirdParties.reduce((accumulator, currentValue) => (accumulator + currentValue), 0));
    }

    checkWithdrawalPossible = () => {

        if (this.state.checkWithdrawalPossible) return this.setState({ openWithdrawalPossiblePopup: true });
        return this.placeTheWithdrawal();
    };

    //step 03
    handleWithdrawalConfirmationWindow = () => {

       const { withdrawal, selectedSmeLoan } = this.state;

       const addWithdrawalData = {
          validateOnlyIndicator: true,
          customerId: selectedSmeLoan.customerId,
          contractId: selectedSmeLoan.contractId,
          contractIdExtension: selectedSmeLoan.contractIdExtension,
          withdrawalAmount: withdrawal.withdrawalAmount,
          interestOnlyLimitAmount: withdrawal.interestOnlyLimit,
          startDateNewDdAmount: withdrawal.startDate,
          withdrawalCosts: withdrawal.withdrawalCosts,
          startNewWorkflowIndicator: true,
          initiator: "csm",
        //   systemDate: this.props.simulations.systemDate || moment().format('YYYY-MM-DD')
          systemDate: moment(this.props.simulations.systemDate).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD')
       };

       this.props.addFlexLoanWithdrawal(addWithdrawalData)
      .then(response => { 
       
       this.setState((prevState) => ({ withdrawalConfirmation: !prevState.withdrawalConfirmation, withdrawalButtonDisable:true }));
       const code = response ? response.returnCode : '';

       switch( code ) {

         case 200:
          this.setState({ withdrawalMessage : 'All validations are met. Please Confirm', disableWithdrawalConfirmedButton : false });
          break;

         case 201:
           this.setState({ withdrawalMessage : 'This is customers first withdrawal!. Please Confirm', disableWithdrawalConfirmedButton : false });
           break;

         case 400:
           this.setState({ withdrawalMessage : 'System Error. Ask IT-support to come and make Jira issue!!' });
           break;

         case 401:
           this.setState({ withdrawalMessage : 'Loan NORMALLY-SETTLED. Apply for new loan first.' });
           break;

         case 402:
           this.setState({ withdrawalMessage : 'Mandate not approved. Withdrawal impossible.' });
           break;

         case 403:
           this.setState({ withdrawalMessage : 'Revision-date past. Loan must be revision first. Withdrawal impossible.' });
           break;
 
         case 404:
           this.setState({ withdrawalMessage : 'Loan IN REVISION. Please contact RISK-team to ask for approval.', disableWithdrawalConfirmedButton : false });
           break;
         
         case 405:
           this.setState({ withdrawalMessage : 'Revision-disapproved. Withdrawal not possible anymore.' });
           break;
  
         case 406:
           this.setState({ withdrawalMessage : 'Customer has a backlog. Withdrawal impossible.' });
           break;
         
         case 407:
          this.setState({ withdrawalMessage : 'Customer has a backlog with his Fixed-Loan; Withdrawal impossible' });
          break;
 
         case 408:
           this.setState({ withdrawalMessage : 'New outstanding amount bigger than Credit-Limit. Change withdrawal-amount' });
           break;
            
         case 409:
           this.setState({ withdrawalMessage : 'Interest-only-amount too high. Change amount.' });
           break;
  
         case 410:
           this.setState({ withdrawalMessage : 'PSD2 consent not found. Withdrawal not possible.' });
           break;

         case 499:
           this.setState({ withdrawalMessage : 'Something when wrong with Pin-Code; call IT-support' });
           break;
         
         default:
           this.setState({ withdrawalMessage : 'Something went wrong; call IT-support' });           
       }

      });
    }
    
    // step 04
    confirmAddingWithdrawal = () => {

     const { withdrawal, selectedSmeLoan } = this.state;
         const addWithdrawalData = {
          validateOnlyIndicator: false,
          customerId: selectedSmeLoan.customerId,
          contractId: selectedSmeLoan.contractId,
          contractIdExtension: selectedSmeLoan.contractIdExtension,
          withdrawalAmount: withdrawal.withdrawalAmount,
          interestOnlyLimitAmount: withdrawal.interestOnlyLimit,
          startDateNewDDAmount: withdrawal.startDate,
          startNewWorkflowIndicator: false,
          initiator: "csm",
          instantPaymentIndicator: withdrawal.instantPayment,
          toSmeAmount: withdrawal.toSme,
          toThirdPartyPayments: withdrawal.thirdParties,
          systemDate: this.props.simulations.systemDate || moment().format('YYYY-MM-DD')
         };
         
          this.props.addFlexLoanWithdrawal(addWithdrawalData, selectedSmeLoan.contractId, selectedSmeLoan.contractIdExtention)
           .then(response => {
     
            this.setState({withdrawalConfirmation: false, disableWithdrawalConfirmedButton : true});
            const code = response ? response.returnCode : '';
     
            switch( code ) {
     
              case 200: case 201: case 404:
               this.props.displayNotification('Withdrawal Request processed successfully; bank-transfer created', 'success' );
               this.handleWithdrawalPopup();
               this.props.onClosePopUp();
               break;
     
              case 411:
               this.props.displayNotification('Instant-Payment amounts total not equal to pay-out-amount; please change', 'warning');
                break;
              
              default:
               this.props.displayNotification('System Error. Ask IT-support to come and make Jira issue!!', 'warning');   
            }
     
           });

    }

    closeConfirmationWindow = () => {
     this.setState({withdrawalConfirmation: false, disableWithdrawalConfirmedButton : true});
    }

    placeTheWithdrawal = () => {
        const { withdrawal, selectedSmeLoan, selectedSme } = this.state;

        const toSmeAmount = this.getAmountToSme();

        const toThirdPartyAmount = withdrawal.thirdParties.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        if (withdrawal.withdrawalAmount !== toSmeAmount + toThirdPartyAmount + withdrawal.withdrawalCosts) return this.props.displayNotification('Pay-outs + withdrawal-cost must be equal to withdrwal-amount; please change amounts', 'warning');

        const smeName = selectedSme.company ? selectedSme.company : (`${selectedSme.firstName} ${selectedSme.lastName}`);

        const requestObject = {
            loanId: selectedSmeLoan._id,
            contractId: selectedSmeLoan.contractId,
            smeId: selectedSmeLoan.smeId,
            instantPayment: !!(withdrawal.instantPayment),
            smeName,
            smeFlexLoanWithdrawal: {
                outstandingAmount: this.getBaseForNewAmount(),
                withdrawalAmount: withdrawal.withdrawalAmount,
                newOutstandingAmount: withdrawal.newOutstandingAmount,
                interestOnlyLimit: withdrawal.interestOnlyLimit,
                baseForDdCalculation: this.getBaseForDdCalculation(),
                // baseForDdCalculation: withdrawal.baseForDdCalculation,
                plannedNumberOfDirectDebit: selectedSmeLoan.plannedNumberOfDirectDebit,
                newDdAmount: this.getNewDdAmount(),
                // newDdAmount: withdrawal.newDdAmount,

                withdrawalCosts: withdrawal.withdrawalCosts,
                startDate: withdrawal.startDate,
                directDebitFrequency: selectedSmeLoan.directDebitFrequency,
                instantPayment: !!(withdrawal.instantPayment),
                thirdParties: withdrawal.thirdParties,
                payout: withdrawal.payout,
                toSme: toSmeAmount,
                // smeName,
            }
        };

        this.setState({ loading: true }, () => {

            return this.props.createSmeFlexLoanWithdrawal(requestObject)
                .then(() => {
                    // console.log(response);
                    this.handleWithdrawalPopup();
                })
                .catch(() => {
                    this.setState({ loading: false, openWithdrawalPossiblePopup: false });
                });

        });
    }


    closeWithdrawalPossiblePopup = () => {

        return this.setState({ openWithdrawalPossiblePopup: false });
    }


    getDaysByFrequency = (frequency) => {
        if(frequency){
            let daysToAdd = 0;
            switch(frequency){
                case "daily": 
                    daysToAdd = 2;
                    break;
                case "weekly":
                    daysToAdd = 5;
                    break;  
                case "monthly":
                    daysToAdd = 20;
                    break;    
                default:
                    daysToAdd = 5;
              }

            return daysToAdd;    
        }

    }

    render() {

        const { classes, locale, symbol, decimalSeparator, thousandSeparator } = this.props;
        const { withdrawal, lastWithdrawalOrder, openWithdrawalPossiblePopup, selectedSmeLoan, selectedSme, withdrawalConfirmation } = this.state;
        const currentDdAmount = (lastWithdrawalOrder.newDirectDebitAmount) ? lastWithdrawalOrder.newDirectDebitAmount : 0;
        let disableWithdrawalButton = true;

        const outstandingAmount = selectedSmeLoan ? selectedSmeLoan.loanOutstandingAmount - selectedSmeLoan.partialPaymentOutstandingAmount - selectedSmeLoan.otherCostOverdueAmount : 0;
        // const newOutstandingAmount = customerLoans

        if (selectedSme && selectedSmeLoan) disableWithdrawalButton = !(Object.keys(selectedSme).length > 0 && Object.keys(selectedSmeLoan).length > 0);

        const [isAnyError, errorMessage] = this.isAnyError();

        if (!disableWithdrawalButton && isAnyError) disableWithdrawalButton = isAnyError;

        if (!disableWithdrawalButton) disableWithdrawalButton = this.state.loading;

        if (!disableWithdrawalButton) disableWithdrawalButton = this.state.withdrawalButtonDisable;

        return (

            <>
                <Dialog
                    open={this.state.withdrawalPopup}
                    onClose={this.props.onClosePopUp}
                    aria-labelledby="flex-loan-withdrawal"
                    aria-describedby="flex-loan-withdrawal"
                    fullWidth={true}
                    maxWidth={'md'}
                >
                    <DialogTitle id="flex-loan-withdrawal-title" style={{ margin: '0 3%' }}>Add Withdrawal</DialogTitle>
                    {
                        this.state.withdrawalPopupError ?
                            <GridItem>
                                {this.state.withdrawalPopupError ? <p style={{ color: "red" }}><li>{this.state.withdrawalPopupError}</li></p> : false}
                            </GridItem> : null
                    }
                    <DialogContent style={{ margin: '0 3%' }}>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}></GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="outstandingAmount"
                                    name="outstandingAmount"
                                    label="Outstanding Amount"
                                    fullWidth={true}
                                    // value={selectedSmeLoan.outstandingAmount ? currencyConvertor(-1 * selectedSmeLoan.outstandingAmount.toFixed(2)) : currencyConvertor(0)}
                                    value={ CURRENCY(outstandingAmount, locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="currentDdAmount"
                                    name="currentDdAmount"
                                    label="Current DD Amount"
                                    fullWidth={true}
                                    // value={currencyConvertor(currentDdAmount.toFixed(2))}
                                    value={selectedSmeLoan ? CURRENCY(selectedSmeLoan.currentDirectDebitAmount.toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR') : CURRENCY(0,  locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR') }
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4}></GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="sentToBankAmount"
                                    name="sentToBankAmount"
                                    label="Sent To Bank Amount"
                                    fullWidth={true}
                                    value={selectedSmeLoan ? CURRENCY(selectedSmeLoan.sentToBankAmount.toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR') : CURRENCY(0, locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={8}></GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="baseForNewAmount"
                                    name="baseForNewAmount"
                                    label="Base For New Amount"
                                    fullWidth={true}
                                    value={CURRENCY(this.getBaseForNewAmount().toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={8}></GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <MultiCurrencyCustomFormatInput
                                    className={classes.textField}
                                    type="text"
                                    labelText="Withdrawal Amount"
                                    id="withdrawalAmount"
                                    name="withdrawalAmount"
                                    numberformat={withdrawal.withdrawalAmount.toFixed(2)}
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    symbol={symbol ? symbol : '€'}
                                    decimalSeparator={decimalSeparator ? decimalSeparator : ','}
                                    thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
                                    changeValue={this.handleWithdrawalAmountChanges}
                                />
                                {/* <TextField 
                                   className={classes.textField}
                                   type="text"
                                   label="Withdrawal Amount" 
                                   id="withdrawalAmount" 
                                   name="withdrawalAmount"
                                   size="small"
                                   defaultValue="0,00"
                                   onChange={this.handleWithdrawalAmountChanges}
                                   fullWidth
                                   InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        €
                                      </InputAdornment>
                                    ),
                                   }}
                                   variant="outlined" /> */}
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="withdrawalCosts"
                                    name="withdrawalCosts"
                                    label="Withdrawal Costs"
                                    fullWidth={true}
                                    value={CURRENCY(withdrawal.withdrawalCosts.toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="payout"
                                    name="payout"
                                    label="Pay Out"
                                    fullWidth={true}
                                    value={CURRENCY(withdrawal.payout.toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <TextField
                                    id="newOutstandingAmount"
                                    name="newOutstandingAmount"
                                    label="New Outstanding Amount"
                                    fullWidth={true}
                                    value={CURRENCY(this.getNewOutStandingAmount(), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={8}> </GridItem>

                            <GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}>
                                <MultiCurrencyCustomFormatInput
                                    className={classes.textField}
                                    type="text"
                                    labelText="Interest Only Limit"
                                    id="interestOnlyLimit"
                                    name="interestOnlyLimit"
                                    numberformat={withdrawal.interestOnlyLimit.toFixed(2)}
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    symbol={symbol ? symbol : '€'}
                                    decimalSeparator={decimalSeparator ? decimalSeparator : ','}
                                    thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
                                    changeValue={this.handleInterestOnlyLimitChanges}
                                />
                                {/* <TextField 
                                   className={classes.textField}
                                   type="text"
                                   name="interestOnlyLimit"
                                   onChange={this.handleInterestOnlyLimitChanges}
                                   id="interestOnlyLimit" 
                                   label="Interest Only Limit" 
                                   size="small"
                                   value={withdrawal.interestOnlyLimit.toFixed(2)}
                                   InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        {symbol}
                                      </InputAdornment>
                                    ),
                                   }}
                                   fullWidth
                                   variant="outlined" /> */}
                            </GridItem>

                            <GridItem xs={12} sm={12} md={8}> </GridItem>

                            <GridItem xs={12} sm={12} md={4}>
                                <TextField
                                    id="baseForDdCalculation"
                                    name="baseForDdCalculation"
                                    label="Base For DD Calculation"
                                    fullWidth={true}
                                    value={CURRENCY(this.getBaseForDdCalculation().toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4}>
                                {/* <CustomFormatInput
                                    className={classes.textField}
                                    type="text"
                                    labelText="New DD Amount"
                                    id="newDdAmount"
                                    name="newDdAmount"
                                    numberformat={this.getNewDdAmount().toFixed(2)}
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    changeValue={this.handleAmountChanges}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                /> */}
                                   <TextField
                                    id="newDdAmount"
                                    name="newDdAmount"
                                    label="New DD Amount"
                                    fullWidth={true}
                                    value={CURRENCY(this.getNewDdAmount().toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} >
                                {/* <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        disableToolbar
                                        id="withdrawal-start-date"
                                        name="startDate"
                                        autoOk
                                        variant="inline"
                                        label="Start Date"
                                        format="DD-MM-YYYY"
                                        fullWidth={true}
                                        value={withdrawal.startDate}
                                        InputAdornmentProps={{ position: "start" }}
                                        onChange={date => this.handleWithdrawalStartDateChanges(date)} 
                                    />
                                </MuiPickersUtilsProvider> */}
                                <TextField
                                   id="withdrawal-start-date"
                                   label="Start Date"
                                   name="startDate"
                                   type="date"
                                   value={withdrawal.startDate}
                                   // sx={{ width: 220 }}
                                   InputLabelProps={{
                                     shrink: true,
                                   }}
                                   size="small"
                                   fullWidth
                                   variant="outlined"
                                   onChange={this.handleWithdrawalStartDateChanges}
                                 />
                            </GridItem>

                            <GridItem xs={null} sm={null} md={2}> </GridItem>
                            <GridItem xs={null} sm={null} md={2}> </GridItem>

                            <GridItem xs={12} sm={12} md={12} >
                                {
                                    errorMessage ?
                                        <span style={{ color: 'red' }} >* {errorMessage}</span> : ''
                                }
                            </GridItem>

                            <GridItem xs={12} sm={12} md={12} style={{ margin: '1% 0' }}> </GridItem>

                            {/* Label section */}
                            {/* <GridItem xs={12} sm={12} md={12} ><h5><span style={{ fontWeight: 500 }}>Third Party Payments</span></h5></GridItem> */}

                            <GridItem xs={12} sm={12} md={4} >
                                {/* <FormControl className={classes.formControl} fullWidth={true}>
                                    <InputLabel htmlFor="risk-category">Instant Payment</InputLabel>
                                    <Select
                                        value={withdrawal.instantPayment}
                                        onChange={this.handleDropDownChanges}
                                        id="instantPayment"
                                        inputProps={{
                                            name: 'instantPayment',
                                            id: 'instantPayment',
                                        }}
                                        className={classes.selectEmpty}
                                        // variant="outlined"
                                    >
                                        <MenuItem key={`instantPayment_Yes`} value={1}>Yes</MenuItem>
                                        <MenuItem key={`instantPayment_Np`} value={0}>No</MenuItem>
                                    </Select>
                                </FormControl> */}
                                <TextField
                                    value={withdrawal.instantPayment }
                                    onChange={this.handleDropDownChanges}
                                    select // tell TextField to render select
                                    label="Instant Payment"
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                  >
                                    <MenuItem value={1} key="instantPayment_Yes">
                                       Yes
                                    </MenuItem>
                                    <MenuItem value={0} key="instantPayment_Np">
                                       No
                                    </MenuItem>
                                 </TextField>
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4}>
                                <TextField
                                    id="toSme"
                                    name="toSme"
                                    label="To SME"
                                    fullWidth={true}
                                    value={CURRENCY(this.getAmountToSme().toFixed(2), locale ? locale : 'nl-NL', selectedSmeLoan.currency ? selectedSmeLoan.currency : 'EUR')}
                                    className={classes.textField}
                                    disabled={true}
                                    InputLabelProps={{ shrink: true, }}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </GridItem>

                            <GridItem xs={12} sm={12} md={4} key={'thirdParties_0'} style={{'display': 'flex', 'justifyContent': 'spaceBetween'}}>
                                <MultiCurrencyCustomFormatInput
                                    className={classes.textField}
                                    type="text"
                                    labelText="To Third-Party"
                                    id={'thirdParties_0'}
                                    name={'thirdParties_0'}
                                    numberformat={withdrawal.thirdParties[0].toFixed(2)}
                                    // formControlProps={{
                                    //     fullWidth: true
                                    // }}
                                    // width='50%'
                                    display= 'inline'
                                    symbol={symbol ? symbol : '€'}
                                    decimalSeparator={decimalSeparator ? decimalSeparator : ','}
                                    thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
                                    changeValue={this.handleThirdPartyValuesChanges}
                                    readOnly={(withdrawal.instantPayment === 0)}
                                />
                                {/* <div style={{width: 205}}>
                                 <TextField 
                                    className={classes.textField}
                                    type="text"
                                    name="thirdParties_0"
                                    onChange={this.handleThirdPartyValuesChanges}
                                    id="thirdParties_0" 
                                    label="To Third-Party" 
                                    size="small"
                                    defaultValue="0"
                                    fullWidth
                                    InputProps={{
                                     startAdornment: (
                                       <InputAdornment position="start">
                                         {symbol}
                                       </InputAdornment>
                                     ),
                                    }}
                                    variant="outlined" />
                                </div> */}
                                <Button style={{float:'right', width:'10px', marginTop:-1}} className={classes.customAddButton_Blue} disabled={(withdrawal.instantPayment === 0)} onClick={this.addThirdPartySection} startIcon={<AddCircle />}></Button>
                            </GridItem>

                            {/* <GridItem xs={null} sm={null} md={2} key={'add_0'}>
                                <Button className={classes.customAddButton_Blue} disabled={(withdrawal.instantPayment === 0)} onClick={this.addThirdPartySection} startIcon={<AddCircle />}></Button>
                            </GridItem> */}

                            <GridItem xs={null} sm={null} md={4}> </GridItem>

                            {
                                withdrawal.thirdParties.map((thirdParty, index) => {

                                    const output = [];

                                    if (index > 0) {

                                        output.push([].map((i) => (<GridItem xs={null} sm={null} md={4} key={`empty_${i}`}> </GridItem>)));

                                        output.push(
                                            <GridItem xs={12} sm={12} md={4} key={`thirdParties_${index}`} style={{'display': 'flex', 'justifyContent': 'spaceBetween'}}>
                                             <div style={{width: 205}}>
                                                <MultiCurrencyCustomFormatInput
                                                    className={classes.textField}
                                                    type="text"
                                                    labelText="To Third-Party"
                                                    id={`thirdParties_${index}`}
                                                    name={`thirdParties_${index}`}
                                                    numberformat={thirdParty.toFixed(2)}
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    symbol={symbol ? symbol : '€'}
                                                    decimalSeparator={decimalSeparator ? decimalSeparator : ','}
                                                    thousandSeparator={thousandSeparator ? thousandSeparator : '.'}
                                                    changeValue={this.handleThirdPartyValuesChanges}
                                                    readOnly={(this.state.withdrawal.instantPayment === 0)}
                                                />
                                                </div>
                                                {/* <div style={{width: 205}}>
                                                 <TextField 
                                                    className={classes.textField}
                                                    type="text"
                                                    name={`thirdParties_${index}`}
                                                    onChange={this.handleThirdPartyValuesChanges}
                                                    id={`thirdParties_${index}`}
                                                    label="To Third-Party" 
                                                    size="small"
                                                    defaultValue="0"
                                                    fullWidth
                                                    InputProps={{
                                                     startAdornment: (
                                                       <InputAdornment position="start">
                                                         {symbol}
                                                       </InputAdornment>
                                                     ),
                                                    }}
                                                    variant="outlined" />
                                                </div> */}
                                                <Button style={{float:'right', width:'10px', marginTop:-1}} className={classes.customAddButton_Blue} disabled={(withdrawal.instantPayment === 0)} onClick={() => this.removeThirdPartySection(index)} startIcon={<RemoveCircle />}></Button>
                                            </GridItem>
                                        );

                                        // output.push(
                                        //     <GridItem xs={12} sm={12} md={4} key={`thirdPartyPayments_${index}_thirdParty`}>
                                        //         {/* <Button className={classes.customRemoveButton_Blue} onClick={() => this.removeThirdPartySection(index)} startIcon={<RemoveCircle />}></Button> */}
                                        //         <Button style={{float:'right'}} className={classes.customAddButton_Blue} disabled={(withdrawal.instantPayment === 0)} onClick={() => this.removeThirdPartySection(index)} startIcon={<RemoveCircle />}></Button>
                                        //     </GridItem>
                                        // );

                                        // output.push(<GridItem xs={12} sm={12} md={4} style={{ margin: '1% 0' }}> </GridItem>);

                                    }

                                    return output;

                                })
                            }


                        </GridContainer>
                    </DialogContent>
                    <DialogActions style={{ margin: '1% 4%' }}>
                        <Button color="white" onClick={this.props.onClosePopUp} style={{borderRadius:30, height: 45, width: 160, fontSize: 13, border: 'black'}} variant="outlined">
                            Cancel
                        </Button>
                        {/* <Button onClick={this.checkWithdrawalPossible} disabled={disableWithdrawalButton} color="info" style={{borderRadius:30, height: 45, width: 160, fontSize: 13}} autoFocus> */}
                        <Button onClick={this.handleWithdrawalConfirmationWindow} disabled={disableWithdrawalButton} color="info" style={{borderRadius:30, height: 45, width: 160, fontSize: 13}} autoFocus>
                        Add Withdrawal
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openWithdrawalPossiblePopup} aria-labelledby="confirm-add-flex-loan" aria-describedby="alert-dialog-description" >
                    <DialogTitle id="alert-dialog-title">This loan is in the revision period</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">{'Are you sure you want to make a withdrawal?'}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {this.state.loading && <CircularProgress size={22} />}
                        <Button onClick={this.closeWithdrawalPossiblePopup} className={classes.popupCloseButton} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.placeTheWithdrawal} className={classes.popupAddButton} color="primary" >
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Add withdrawal Confirmation window */}
                <Dialog
                  open={withdrawalConfirmation}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {"Add withdrawal validation results"}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      {this.state.withdrawalMessage}.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.closeConfirmationWindow} color="white" style={{borderRadius:30, height: 40, width: 130, fontSize: 13, border: 'black'}}>cancel</Button>
                    <Button onClick={this.confirmAddingWithdrawal} color="info" disabled={this.state.disableWithdrawalConfirmedButton} style={{borderRadius:30, height: 40, width: 130, fontSize: 13}} autoFocus>
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
            </>

        );
    }
}
FlexLoanWithdrawalPopUp.propTypes = {
    classes: PropTypes.object,
    directdebits: PropTypes.array,
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    activeMandateByCustomer: PropTypes.object,
    refreshLoanData: PropTypes.func,
    smeDetails: PropTypes.object,
    getNextWorkingDate: PropTypes.func,
    displayNotification: PropTypes.func.isRequired,
    checkFailedSmeLoanTransactions: PropTypes.func,
    customerLoans: PropTypes.array,
    // inversConsentsForSme: PropTypes.array,
    getSimulationDate: PropTypes.func,
    simulations: PropTypes.object.isRequired,
    locale: PropTypes.string,
    symbol: PropTypes.string,
    decimalSeparator: PropTypes.string,
    thousandSeparator: PropTypes.string
};

const mapStateToProps = (state) => ({
    configurations: state.configurations,
    // smeLoans: state.lmglobal.smeLoans,
    // overview: state.lmglobal.flexLoanOverview,
    // flexLoanContratIds: state.flexLoanOverview.flexLoanContratIds,
    // loan: state.lmglobal.selectedLoan,
    directdebits: state.smeLoanTransaction.directdebits,
    activeMandateByCustomer: state.mandates.activeMandateByCustomer,
    // showGeneratePaymentRequestDrayer: state.generatepaymentrequest.showGeneratePaymentRequestDrayer,
    // lmContractSysId: state.lmglobal.selectedLoan.contractId,
    // isDashboardContent: state.user.isDashboardContent,
    customerLoans: state.lmglobal.smeLoans,
    // inversConsentsForSme: state.lmglobal.inversConsentsForSme,
    simulations: state.config.simulations,

});

const bindActions = (dispatch, actionMethod) => {
    return (params) =>
        new Promise((resolve, reject) =>
            dispatch(actionMethod(params))
                .then(response => resolve(response))
                .catch(error => reject(error))
        );
};

const mapDispatchToProps = dispatch => {
    return {
        getNextWorkingDate: (expiryDate, noOfDaysAhead, country) => (dispatch(getNextWorkingDate(expiryDate, noOfDaysAhead, country))),
        getWithdrwalsforSelectedLoan: contractId => dispatch(getWithdrwalsforSelectedLoan(contractId)),
        createSmeFlexLoanWithdrawal: bindActions(dispatch, createSmeFlexLoanWithdrawal),
        getFlexLoanOutstandingAmount: bindActions(dispatch, getFlexLoanOutstandingAmount),
        getFlexLoanLatestWithdrawalOrder: bindActions(dispatch, getFlexLoanLatestWithdrawalOrder),
        clearFlexLoanOverviewData: () => { dispatch(clearFlexLoanOverviewData()); },
        getFlexLoanOverviewData: (contractId) => { dispatch(getFlexLoanOverviewData(contractId)); },
        displayNotification: (message, type) => dispatch(displayNotification(message, type)),
        checkFailedSmeLoanTransactions: (contractIds) => dispatch(checkFailedSmeLoanTransactions(contractIds)),
        addFlexLoanWithdrawal: (withdrawalData) => dispatch(addFlexLoanWithdrawal(withdrawalData)),
        getSimulationDate: () => (dispatch(getSimulationDate())),

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(FlexLoanWithdrawalPopUp));