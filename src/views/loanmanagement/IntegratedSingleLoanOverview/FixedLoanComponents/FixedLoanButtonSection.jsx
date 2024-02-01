import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import { Grid } from '@material-ui/core';
import { Sync, Receipt, Pause, Payment, PlayCircleOutline } from "@material-ui/icons";
import Button from "components/loanmanagement/CustomButtons/Button.jsx";
import { startLoanAction } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { setMandateToEmandate } from 'store/loanmanagement/actions/Mandates';
import Util from "lib/loanmanagement/utility";
import FixedLoanTempLoanStopDrawer from './PopUpComponents/FixedLoanTempLoanStopDrawer';
import { setLoanStopHistoryOrigin, showHideTemporaryLoanStop } from 'store/loanmanagement/actions/SmeLoanTemporaryLoanStop';
import FixedLoanRefinancePopUp from './PopUpComponents/FixedLoanRefinancePopUp';
import FixedLoanRedeemPopUp from './PopUpComponents/FixedLoanRedeemPopUp';
import FixedLoanRefundPopUp from './PopUpComponents/FixedLoanRefundPopUp';
import FixedLoanClaimPopUp from './PopUpComponents/FixedLoanClaimPopUp';
import { showGeneratePaymentRequest } from 'store/loanmanagement/actions/GeneratePaymentRequest';
import FixedLoanGeneratePaymentOrderDrawer from './PopUpComponents/FixedLoanGeneratePaymentOrderDrawer';
import FixedLoanTransactionOverviewPopUp from './PopUpComponents/FixedLoanTransactionOverviewPopUp';
import { cancelLoan, generateTransactionOverview, getPlatformParameters, showCancelSmeLoanModal, startStopSmeLoanInterestPenalty } from 'store/loanmanagement/actions/SmeLoans';
import FixedLoanCancelLoanPopUp from './PopUpComponents/FixedLoanCancelLoanPopUp';
import FixedLoanStartStopInterestPaneltyPopUp from './PopUpComponents/FixedLoanStartStopInterestPaneltyPopUp';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
class FixedLoanButtonSection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDisableStartLoanBtn: false,
            isEnableLoanCancelButton: false,
            showRefinanceLoanDrawer: false,
            showRedeemLoanDrawer: false,
            showRefundLoanDrawer: false,
            showClaimLoanDrawer: false,
            showTransactionOverViewDrawer: false,
            html: '',
            pdf: '',
            tikkieDrawerData: {},
            showStartStopInterestPaneltyDrawer: false,
            interestPenaltyIndicator: '',
            sendMessage: 'no',
            contact: ''
        };
    }

    componentDidMount () {

        const { loanData } = this.props;
        this.props.getPlatformParameters({ country: loanData.country ? loanData.country : 'NL'})
          .then((response) => {
            if(response.success){
              this.setState({contact : response.data && response.data[0].contactDetailsAssetManager});
            }
    
          })
          .catch(error => {
            console.error(error);
          });
      }

    isEnableStartButton = () => {
        // need to get from back end# DD looping
        const value = this.props.directdebits.find(directDebit =>
            (directDebit.ourReference === (directDebit.contractId + '-PROEFINCASSO') && (directDebit.status === 'paid' || directDebit.status === 'sent-to-bank')));

        const isStillPaused = this.props.directdebits.find(directDebit => directDebit.status === 'paused');

        return value && isStillPaused;
    }

    handleStartLoanButtonClick = () => {
        const { changeMandateToEmandate, configurations, loanData } = this.props;

        this.props.startLoanAction(loanData.contractId, loanData.directDebitFrequency, this.preparePaymentOrder(), configurations.simulations.systemDate);

        const oneCentDD = this.props.directdebits.find(directDebit =>
            ((directDebit.ourReference === directDebit.contractId + '-PROEFINCASSO') && (directDebit.status === 'paid' || directDebit.status === 'sent-to-bank')));

        changeMandateToEmandate(oneCentDD.mandateId);

        this.setState({ isDisableStartLoanBtn: !this.state.isDisableStartLoanBtn });
    };

    preparePaymentOrder = () => {
        const { smeDetails, directdebits, activeMandateByCustomer, loanData } = this.props;
        //need to get from back end #DD looping
        const payOutTransaction = directdebits.find(t => t.type === 'pay-out' && t.status === 'open');

        // enabling the loan cancel button
        if (payOutTransaction) {
            this.setState({ isEnableLoanCancelButton: true });
        }

        if (payOutTransaction && activeMandateByCustomer !== null && JSON.stringify(activeMandateByCustomer) !== '{}') {
            return {
                domainId: "bridgefund",
                date: payOutTransaction.plannedDate,
                country: loanData.country ? loanData.country : '',
                currency: loanData.currency ? loanData.currency : '',
                status: "to-be-processed",
                counterparty: smeDetails.company,
                counterpartyIbanNumber: activeMandateByCustomer.ibanNumber,
                counterpartyBankBic: activeMandateByCustomer.bicCode,
                description: payOutTransaction.description,
                amount: Math.abs(payOutTransaction.amount),
                paymentReference: "",
                e2eId: payOutTransaction.e2eId,
            };
        }
        return {};
    }

    handleRefinanceScreen = (open) => {

        if (open && this.props.loanData.type !== 'fixed-loan') {
            this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
            return;
        }
        this.setState({ showRefinanceLoanDrawer: !this.state.showRefinanceLoanDrawer });
    };

    handleRedeemScreen = (open) => {
        if (open && this.props.loanData.type !== 'fixed-loan') {
            this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
            return;
        }
        this.setState({ showRedeemLoanDrawer: !this.state.showRedeemLoanDrawer });
    };

    handleRefundScreen = (open) => {
        if (open && this.props.loanData.type !== 'fixed-loan') {
            this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
            return;
        }
        this.setState({ showRefundLoanDrawer: !this.state.showRefundLoanDrawer });
    };

    handleClaimScreen = (open) => {
        if (open && this.props.loanData.type !== 'fixed-loan') {
            this.props.displayNotification('Loan must be a fixed-term loan, further processing is stopped', 'warning');
            return;
        }
        this.setState({ showClaimLoanDrawer: !this.state.showClaimLoanDrawer });
    };

    handleTransactionOverview = (open) => {
        if (open && this.props.loanData.type !== 'fixed-loan') {
            this.props.displayNotification('The overview is made for fixed-loans only', 'warning');
            return;
        }
        const smeLoan = this.props.loanData;
        const requestData = {
            smeLoan: {
                contractId: smeLoan.contractId,
                principleAmount: smeLoan.principleAmount,
                totalMarginAmount: smeLoan.totalMarginAmount,
            }
        };
        this.props.generateTransactionOverview(requestData, (result, error) => {
            if (result.success) {
                const transactionResults = result.data.pdfData;
                this.setState({ html: transactionResults });
                this.setState({ pdf: `data:application/pdf;base64,${result.data.encodedPdf}` });
                this.setState({ showTransactionOverViewDrawer: true });
            }
            if (error) {
                this.props.displayNotification('Pdf can not View', 'warning');
            }
            if (error) {
                this.props.displayNotification('Pdf can not View', 'warning');
            }
        });
    };

    closeTransactionOverview = () => {
        this.setState({ showTransactionOverViewDrawer: false });
    }

    handleTemporaryLoanStop() {
        this.props.showHideTemporaryLoanStop();
        this.props.setLoanStopHistoryOrigin('CONTRACTS');
    }

    handleGeneratePaymentRequest() {

        this.setState({
            tikkieDrawerData: Util.preparePaymentRequest(this.props.loanData, this.props.directdebits)
        }, () => this.props.showGeneratePaymentRequest());
    }

    handleCancelLoanRequest = () => {
        const loanData = {
            status: 'cancelled',
            contractId: this.props.loanData.contractId,
            loanId: this.props.loanData._id
        };

        this.props.cancelLoan(loanData);
    }

    toggleDrawer = (container, side, open) => () => {
        this.setState({
            [side]: open
        });
        switch (container) {
            case 'temporaryLoanStop':
                this.props.showHideTemporaryLoanStop();
                break;
            case 'generatePaymentRequest':
                this.props.showGeneratePaymentRequest();
                break;
            default:
                break;
        }
    };

    isEnableCancelButton = () => {
        const { directdebits } = this.props;
        // need to get from back end# DD looping
        const payOutTransaction = directdebits.find(t => t.type === 'pay-out' && t.status === 'open');
        // console.log('in paymnt order prep ',payOutTransaction);

        // enabling the loan cancel button
        return payOutTransaction ? true : false;
    }

    handleStartStopInterestPanelty = () => {  
        const interestPenaltyIndicator =  this.props.loanData && this.props.loanData.interestPenaltyIndicator;     
        this.setState({ showStartStopInterestPaneltyDrawer: !this.state.showStartStopInterestPaneltyDrawer, interestPenaltyIndicator: interestPenaltyIndicator });
    }

    changeInterestPaneltyState = () => {
    
        const loanData = {
            contractId: this.props.loanData.contractId,
            loanId: this.props.loanData._id,
            data: { interestPenaltyIndicator: (this.state.interestPenaltyIndicator === 'stopped' || this.state.interestPenaltyIndicator === 'not-applicable') ? 'active' : 'stopped' },
            dailyInterestPenaltyAmount: this.props.loanData.dailyInterestPenaltyAmount,
            sendMessage: this.state.sendMessage,
            smeDetail: {
                id: this.props.smeDetails.id,
                email: this.props.smeDetails.email,
                firstName: this.props.smeDetails.firstName,
                lastName: this.props.smeDetails.lastName
              },
            contact: this.state.contact,
            language: this.props.loanData.language,
            currencySymbol : this.props.symbol ? this.props.symbol : '€'
        };

        this.props.startStopSmeLoanInterestPenalty(loanData)
        .then(() => {
                if (this.state.interestPenaltyIndicator === 'stopped') {
                    this.props.displayNotification('Interest Penalty started !', 'success');
                }
                else {
                    this.props.displayNotification('Interest Penalty stopped !', 'success');
                }
            this.setState({ showStartStopInterestPaneltyDrawer: false });
            this.props.refreshLoanData(loanData.contractId);
        })
        .catch((err) => {
            console.error(err);
            //  this.props.displayNotification('Interest panelty start/stop Error', 'error');
        });   
    }

    emailStateCallback = (childState) => {
        this.setState({
            sendMessage: childState.sendMessage,
        });
    }

    render() {
        const { classes, loanData, showTemporaryLoanStop, directdebits, smeDetails, showGeneratePaymentRequestDrayer,
            isOpenLoanCancelModel, showCancelSmeLoanModal,refreshLoanData, locale, symbol, decimalSeparator, thousandSeparator } = this.props;

        const { isDisableStartLoanBtn, showRefinanceLoanDrawer, showRedeemLoanDrawer, showRefundLoanDrawer, showClaimLoanDrawer,
            tikkieDrawerData, showTransactionOverViewDrawer, pdf, html, showStartStopInterestPaneltyDrawer } = this.state;

        const isEnableStartButton = this.isEnableStartButton();
        const isDisableButtonRow = ['loan-normally-settled', 'loan-fully-redeemed', 'loan-fully-refinanced'].includes(loanData.status);
        const isEnableCancelButton = this.isEnableCancelButton();
       
        const interestPenaltyIndicator =  this.props.loanData && this.props.loanData.interestPenaltyIndicator;
        return (
            <div>
                <Grid container spacing={3}>

                    {isEnableStartButton ?
                        <Grid item>

                            <Button id="start-loan-button" color="success" className={classes.button}
                                onClick={this.handleStartLoanButtonClick}
                                disabled={isDisableStartLoanBtn}>
                                <PlayCircleOutline />&nbsp;
                                {'Start Loan'}
                            </Button>
                        </Grid>
                        : false}
                    <Grid item>
                        <Button id="refinance-loan-button" disabled={isDisableButtonRow} color="success" className={classes.button}
                            onClick={() => this.handleRefinanceScreen(true)}
                        >
                            <Sync className={classes.leftIcon} />
                            REFINANCE
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button id="redeem-loan-button" disabled={isDisableButtonRow} color="danger" className={classes.button}
                            onClick={() => this.handleRedeemScreen(true)}>
                            <Receipt className={classes.leftIcon} />
                            REDEEM
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button id="refund-loan-button" disabled={isDisableButtonRow} color="warning" className={classes.button}
                            onClick={() => this.handleRefundScreen(true)}>
                            <Sync className={classes.leftIcon} />
                            REFUND
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button id="claim-loan-button" disabled={isDisableButtonRow} color="primary" className={classes.button}
                            onClick={() => this.handleClaimScreen(true)}>
                            <Sync className={classes.leftIcon} />
                            CLAIM
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button id="pause-loan-button" disabled={isDisableButtonRow} color="info" className={classes.button}
                            onClick={() => this.handleTemporaryLoanStop()}
                        >
                            <Pause className={classes.leftIcon} />
                            PAUSE
                        </Button>
                    </Grid>

                    { this.props.loanData.country === 'NL' ?
                        <Grid item>
                                <Button id="generate-payment-request-button" disabled={isDisableButtonRow || this.props.loanData.country !== 'NL'} color="info" className={classes.button}
                                onClick={() => this.handleGeneratePaymentRequest()}
                            >
                                <Payment className={classes.leftIcon} />
                                GENERATE PAYMENT REQUEST
                            </Button>
                        </Grid>
                    : false
                    }

                    <Grid item>
                        <Button id="transaction-overview-button" color="primary" className={classes.button}
                            onClick={() => this.handleTransactionOverview(true)}>
                            <Sync className={classes.leftIcon} />
                            TRANSACTION OVERVIEW
                        </Button>
                    </Grid>

                    {isEnableCancelButton ?
                        <Grid item>
                            <Button id="cancel-loan-button" color="info" className={classes.button}
                                onClick={() => this.props.showCancelSmeLoanModal()}
                            >
                                <Payment className={classes.leftIcon} />
                                CANCEL LOAN
                            </Button>
                        </Grid>
                        : false}

                    {loanData.dailyInterestPenaltyAmount !== 0 ?
                        <Grid item>
                            <Button id="start-stop-interest-panelty-button" style={{ backgroundColor: "#4cde68" }} className={classes.button} disabled={isDisableButtonRow}
                                onClick={() => this.handleStartStopInterestPanelty()}>
                                <Sync className={classes.leftIcon} />
                                Start/Stop Interest-Penalty
                            </Button>
                        </Grid>
                        : null}
                    
                </Grid>

                {/* ============================================ PopUps Section  =================================*/}

                {/* refinance popup */}
                <FixedLoanRefinancePopUp open={showRefinanceLoanDrawer} smeLoan={loanData} directdebits={directdebits} handleRefinanceScreen={this.handleRefinanceScreen} refreshLoanData={refreshLoanData} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator}/>

                {/* redeem popup */}
                <FixedLoanRedeemPopUp open={showRedeemLoanDrawer} smeLoan={loanData} directdebits={directdebits} handleRedeemScreen={this.handleRedeemScreen} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} />

                {/* refund popup */}
                <FixedLoanRefundPopUp open={showRefundLoanDrawer} smeLoan={loanData} smeLoanTransactions={directdebits} handleRefundScreen={this.handleRefundScreen} smeDetails={smeDetails} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} />

                {/* claim popup */}
                <FixedLoanClaimPopUp open={showClaimLoanDrawer} smeLoan={loanData} smeLoanTransactions={directdebits} handleClaimScreen={this.handleClaimScreen} smeDetails={smeDetails} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} />

                {/* temp loan stop popup */}
                <FixedLoanTempLoanStopDrawer open={showTemporaryLoanStop} toggleDrawer={this.toggleDrawer} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} />

                {/* generate payment request popup */}
                <FixedLoanGeneratePaymentOrderDrawer open={showGeneratePaymentRequestDrayer} toggleDrawer={this.toggleDrawer} tikkieDrawerData={tikkieDrawerData} />

                {/* transaction overview popup */}
                <FixedLoanTransactionOverviewPopUp open={showTransactionOverViewDrawer} closeTransactionOverview={this.closeTransactionOverview} html={html} pdf={pdf} smeLoan={loanData} />

                {/* cancel loan popup */}
                <FixedLoanCancelLoanPopUp isOpenLoanCancelModel={isOpenLoanCancelModel} showCancelSmeLoanModal={showCancelSmeLoanModal} handleCancelLoanRequest={this.handleCancelLoanRequest} />

                 {/* Start/Stop interest panelty popup */}
                 <FixedLoanStartStopInterestPaneltyPopUp open={showStartStopInterestPaneltyDrawer} handleStartStopInterestPaneltyScreen={this.handleStartStopInterestPanelty} indicaterStatus={interestPenaltyIndicator} changeInterestPaneltyStatus={this.changeInterestPaneltyState} toCallBack={(childState) => this.emailStateCallback(childState)}/>

            </div>
        );
    }
}

FixedLoanButtonSection.propTypes = {
    classes: PropTypes.object,
    directdebits: PropTypes.array,
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    activeMandateByCustomer: PropTypes.object,
    refreshLoanData: PropTypes.func,
    smeDetails: PropTypes.object,
    startLoanAction: PropTypes.func,
    changeMandateToEmandate: PropTypes.func,
    showHideTemporaryLoanStop: PropTypes.func,
    setLoanStopHistoryOrigin: PropTypes.func,
    showTemporaryLoanStop: PropTypes.bool,
    showGeneratePaymentRequest: PropTypes.func,
    generateTransactionOverview: PropTypes.func,
    isOpenLoanCancelModel: PropTypes.bool,
    cancelLoan: PropTypes.func,
    showCancelSmeLoanModal: PropTypes.func,
    locale: PropTypes.string,
    symbol: PropTypes.string,
    decimalSeparator: PropTypes.string,
    thousandSeparator: PropTypes.string
};
const mapDispatchToProps = dispatch => {
    return {
        startLoanAction: (contractId, frequency, paymentOrderData, simulationDate) => {
            dispatch(startLoanAction(contractId, frequency, paymentOrderData, simulationDate));
        },
        changeMandateToEmandate: (mandateId) => {
            dispatch(setMandateToEmandate(mandateId));
        },
        showHideTemporaryLoanStop: () => {
            dispatch(showHideTemporaryLoanStop());
        },
        setLoanStopHistoryOrigin: (origin) => {
            dispatch(setLoanStopHistoryOrigin(origin));
        },
        showGeneratePaymentRequest: () => {
            dispatch(showGeneratePaymentRequest());
        },
        generateTransactionOverview: (requestData, callback) => {
            dispatch(generateTransactionOverview(requestData, callback));
        },
        cancelLoan: (loanData) => {
            dispatch(cancelLoan(loanData));
        },
        showCancelSmeLoanModal: () => {
            dispatch(showCancelSmeLoanModal());
        },
        startStopSmeLoanInterestPenalty: (requestBody) => dispatch(startStopSmeLoanInterestPenalty(requestBody)),
        displayNotification: (msg, type) => dispatch(displayNotification(msg, type)),
        getPlatformParameters: (data) => dispatch(getPlatformParameters(data)),
    };
};

const mapStateToProps = (state) => ({
    configurations: state.configurations,
    // smeLoans: state.lmglobal.smeLoans,
    // overview: state.lmglobal.flexLoanOverview,
    // flexLoanContratIds: state.flexLoanOverview.flexLoanContratIds,
    isOpenLoanCancelModel: state.smeLoans.isOpenLoanCancelModel,
    directdebits: state.smeLoanTransaction.directdebits,
    smeDetails: state.lmglobal.customerDetails,
    activeMandateByCustomer: state.mandates.activeMandateByCustomer,
    showTemporaryLoanStop: state.loanStopHistory.showTemporaryLoanStop,
    showGeneratePaymentRequestDrayer: state.generatepaymentrequest.showGeneratePaymentRequestDrayer,
    // lmContractSysId: state.lmglobal.selectedLoan.contractId,
    // isDashboardContent: state.user.isDashboardContent,
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(FixedLoanButtonSection));