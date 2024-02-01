/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import { Grid, Dialog } from '@material-ui/core';
import moment from 'moment';
import Button from 'components/loanmanagement/CustomButtons/Button';
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';
import { AddCircle, PlayCircleOutline } from '@material-ui/icons';
import { approveRevision, getFlexLoanLatestWithdrawalOrder, getProcessList, getWithdrwalsforSelectedLoan, startRevison, updateFlexLoan, getGetCustomerLoans } from 'store/loanmanagement/actions/FlexLoan.action';
import FlexLoanWithdrawalPopUp from './PopupComponents/FlexLoanWithdrawalPopUp';
import StartFlexLoanPopUp from './PopupComponents/StartFlexLoanPopUp';
import { setMandateToEmandate } from 'store/loanmanagement/actions/Mandates';
import FlexLoanClaimPopUp from './PopupComponents/FlexLoanClaimPopUp';
import FlexLoanRefundPopUp from './PopupComponents/FlexLoanRefundPopUp';
import { isUserHasPermission } from 'lib/loanmanagement/userPermission';
import Utility from "lib/loanmanagement/utility";
import { showGeneratePaymentRequest } from 'store/loanmanagement/actions/GeneratePaymentRequest';
import FlexLoanGeneratePaymentRequestPopUp from './PopupComponents/FlexLoanGeneratePaymentRequestPopUp';
import FlexLoanStartRevisionPopUp from './PopupComponents/FlexLoanStartRevisionPopUp';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
// eslint-disable-next-line no-duplicate-imports
import { getLogedInUseRole } from 'lib/loanmanagement/userPermission';
import { approveRevisionStep, approveRevisionRoles, smeLoanStatus } from "constants/loanmanagement/sme-loan";
import FlexLoanChangeCreditLimitPopUp from './PopupComponents/FlexLoanChangeCreditLimitPopUp';
import FlexLoanStartStopInterestPaneltyPopUp from './PopupComponents/FlexLoanStartStopInterestPaneltyPopUp';
import { getPlatformParameters, startStopSmeLoanInterestPenalty } from 'store/loanmanagement/actions/SmeLoans';
import ChangeWorkflowStatusPopUp from '../../../initiation/CreditManagement/Charts/ChangeWorkflowStatusPopUp';
import { ENVIRONMENT } from "constants/loanmanagement/config";
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const PROCESS_DEFINITION_KEY = "revision-flex-loan";
const SEND_ANNOUNCEMENT = "Activity_18yuhu0";
const APPROVE_FLEX_LOAN_REVISION_01 = "approve-flex-loan-revision-01";
const isProduction = Utility.getEnv() === ENVIRONMENT.PRODUCTION;
const PROCESS_ACTIVE = 'ACTIVE';

const ProcessUpdateTypes = {
	BACKWARD: 'BACKWARD'
};
class FlexLoanButtonSection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showStartFlexLoanDrawer: false,
            showWithdrawalPopup: false,
            showClaimLoanDrawer: false,
            showRefundLoanDrawer: false,
            showStartRevisionDrawer: false,
            totalwithdrawals: [],
            lastWithdrawalOrder: {},
            showApproveRevisionDrawer: false,
            taskId: '',
            approvedActivity: {},
            isApprovedRevisionStageTwo: false,
            isRevisonFinalConfirmation: false,
            revisionAction: "",
            activeActivity: {},
            showChangeCreditLimitDrawer: false,
            showStartStopInterestPaneltyDrawer: false,
            interestPenaltyIndicator: '',
            sendMessage: 'no',
            contact: '',
            workflowData: {},
            isOpenChangeWorkflowStatusDialog: false,
            contractIdValue: '',
            loanWithdrawalData: {},
            numberOfDatesForRevision: 0
        };
    }

    componentDidMount() {
        const { loanData , lmContractSysId } = this.props;
        if(lmContractSysId){
            this.setState({ contractIdValue: lmContractSysId });
        }
        //get all withdrawals
        this.props.getWithdrwalsforSelectedLoan(loanData.contractId)
            .then(response => {
                this.setState({ totalwithdrawals: response });
            });
        // get last withdrawal data
        this.props.getFlexLoanLatestWithdrawalOrder(loanData.contractId)
            .then((lastWithdrawalOrder) => this.setState({ lastWithdrawalOrder }))
            .catch((error) => { throw Error(error); });

        this.getProcessDataList(loanData.contractId, PROCESS_DEFINITION_KEY);

        this.props.getPlatformParameters({ country: loanData.country ? loanData.country : 'NL'})
            .then((response) => {
                if (response.success) {
                    this.setState({ contact: response.data && response.data[0].contactDetailsAssetManager });
                    this.setState({ numberOfDatesForRevision: response.data[0].numberOfDatesForRevision});
                }

            })
            .catch(error => {
                console.error(error);
            });

            
    }

    isEnableStartFlexLoanButton = () => {

        const value = this.props.directdebits && this.props.directdebits.find(dd =>
        (dd.ourReference === (dd.contractId + '-PROEFINCASSO')
            && (dd.type === 'special-dd') && (dd.status === 'paid' || dd.status === 'sent-to-bank')));

        if (value && this.props.activeMandateByCustomer && this.props.activeMandateByCustomer.eMandate === false)
            return true;
        return false;
    }

    handleStartFlexLoanConfimation = () => {

        const { loanData } = this.props;
        const reqData = {
            contractId: loanData.contractId,
            loanId: loanData._id,
            data: { status: 'outstanding' }
        };
        this.props.updateFlexLoan(reqData)
            .then(res => {
                // console.log('res start ', res);
                if (res && res.success) {
                    this.props.setMandateToEmandate(this.props.activeMandateByCustomer.mandateId)
                        .then(() => {
                            this.setState({ showStartFlexLoanDrawer: false });
                            // this.props.requestMandates(loanData.smeId);
                            this.props.refreshLoanData(loanData.contractId);
                        });
                } else {
                    this.setState({ showStartFlexLoanDrawer: false });
                }
            })
            .catch(er => {
                console.log('error in start loan ', er);
                this.setState({ showStartFlexLoanDrawer: false });
            }
            );
    }

    handleClaimScreen = () => {
        this.setState({ showClaimLoanDrawer: !this.state.showClaimLoanDrawer });
    }

    handleRefundScreen = () => {
        this.setState({ showRefundLoanDrawer: !this.state.showRefundLoanDrawer });
    }

    handleWithdrawalPopupScreen = () => {
     this.setState({ showWithdrawalPopup: !this.state.showWithdrawalPopup });
 }

    handleGeneratePaymentRequest = () => {
        const { loanData, directdebits, } = this.props;
        const { lastWithdrawalOrder, } = this.state;

        this.setState({
            tikkieDrawerData: Utility.preparePaymentRequest(loanData, directdebits, lastWithdrawalOrder)
        }, () => this.props.showGeneratePaymentRequest());

    }

    handleWithdrawalPopup = () => {

     const contractId = this.props.loanData.contractId;
     const smeId = this.props.smeDetails.id;

     this.props.getGetCustomerLoans( smeId, contractId)

     .then(response => {

      const statusHistoryArr = response.statusHistory;

       if(statusHistoryArr.length>1){   

        statusHistoryArr.sort((a, b) =>  +new Date(b.createdAt) - +new Date(a.createdAt)); 
       }
      
       if( response && response.type === "flex-loan" && statusHistoryArr[0].status !== "loan-normally-setlled" ){
             this.setState({ loanWithdrawalData: response });
             this.handleWithdrawalPopupScreen();

            } else {

             this.props.displayNotification('Customer has no Flex-Loan outstanding', 'error');

            } 
        });

    }

    handleChangeWorkflowStatusDialog = () => {
		this.setState({ isOpenChangeWorkflowStatusDialog: !this.state.isOpenChangeWorkflowStatusDialog });
	}

    getDate = () => {
        if (!isProduction) return moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
        return moment().format('YYYY-MM-DD');
    }

    handleProcessSelection = (process) => {

        if(!process) return;
        const { loanData } = this.props;
        const { numberOfDatesForRevision } = this.state;
        const reqData = {
            contractId: loanData.contractId,
            loanId: loanData._id,
            data: { status: 'in-revision' }
        };
        if (process === SEND_ANNOUNCEMENT) {
            reqData.data.revisionDate = moment(this.getDate()).add(numberOfDatesForRevision, 'days').format('YYYY-MM-DD');
        }
        this.props.updateFlexLoan(reqData)
            .then(res => {
                if (res && res.success) {
                    this.props.refreshLoanData(loanData.contractId);
                }
            })
            .catch(er => {
                console.log('error in change loan status ', er);
            }
            );
    };

    handleOpenStartRevisionConfimation = () => {
        const { loanData } = this.props;
        const { numberOfDatesForRevision } = this.state;
        this.props.getProcessList(loanData.contractId, PROCESS_DEFINITION_KEY, PROCESS_ACTIVE)
            .then(response => {
                const selectedActiveProcess = response && response.data.records.length === 0 ? {} : response.data.records[0];
                let activeActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] : (selectedActiveProcess ? selectedActiveProcess.activityInstanceList.filter(item => item.state === "ACTIVE") : []);
                activeActivity = activeActivity && activeActivity.length === 0 ? {} : activeActivity[0];
                if (Object.keys(activeActivity).length == 0) {
                    this.setState({ showStartRevisionDrawer: !this.state.showStartRevisionDrawer });
                } else {
                    const workflowData = {
                        process: PROCESS_DEFINITION_KEY,
                        processId: loanData.contractId,
                        selectedTaskIdList: [SEND_ANNOUNCEMENT, APPROVE_FLEX_LOAN_REVISION_01],
                        statusChangeType: ProcessUpdateTypes.BACKWARD,
                        tenantId: 'LI',
                        variables: {
                            'Activity_18yuhu0': {
                                'status': { 'type': 'String', 'value': 'in-revision' },
                                'revisionDate':  { 'type': 'String', 'value': moment(this.getDate()).add(numberOfDatesForRevision, 'days').format('YYYY-MM-DD') },
                                'messageType':  { 'type': 'Integer', 'value': 1 }
                            },
                            'approve-flex-loan-revision-01': {
                                'status': { 'type': 'String', 'value': 'in-revision' }
                            }
                        }
                    };
                    this.setState({ workflowData }, () => this.handleChangeWorkflowStatusDialog());
                }
            });
    }

    handleStartRevisionConfimation = () => {

        const { loanData, smeDetails } = this.props;

        const smeLoanStartRevisionObj = {
            "key": "start-revision-flex-loan",
            "businessKey": loanData && loanData.contractId,
            "variables": {
                "loanId": { "value": loanData && loanData._id, "type": "String" },
                "contractId": { "value": loanData && loanData.contractId, "type": "String" },
                "customerId": { "value": smeDetails && smeDetails.id, "type": "String" },
                "revisionDate": { "value":loanData.revisionDate , "type": "String" },
                "status": { "value": "in-revision", "type": "String" },
                "messageType": { "value": 1, "type": "Integer" },
                "creditLimitAmount": { "value": loanData && loanData.creditLimitAmount, "type": "Double" }
            }
        };

        this.props.startRevison(smeLoanStartRevisionObj)
            .then((response) => {
                if (response.success) {
                    this.props.displayNotification('Revision started successfully', 'success');
                    this.setState({ showStartRevisionDrawer: !this.state.showStartRevisionDrawer });
                }
            })
            .catch((err) => {
                this.props.displayNotification('Revision started Error', 'error');
            });
    }

    handleApproveRevisionConfimation = () => {
        const { activeActivity, revisionAction } = this.state;

        const isApproved = revisionAction === "approved" ? true : false;

        // eslint-disable-next-line no-nested-ternary
        const variableType = activeActivity.activityId === approveRevisionStep.REVISION_ONE ?
            { "isApprovedRiskManager1": { "value": isApproved, "type": "Boolean" } } :
            activeActivity.activityId === approveRevisionStep.REVISION_TWO ?
                { "isApprovedRiskManager2": { "value": isApproved, "type": "Boolean" } } :
                { "isApprovedRiskSupervisor": { "value": isApproved, "type": "Boolean" } };

        const reqObj = {
            "businessKey": this.state.contractIdValue,
            "taskDefinitionKey": activeActivity.activityId,
            "processDefinitionKey": PROCESS_DEFINITION_KEY,
            "variables": variableType
        };
        
        this.props.approveRevision(reqObj)
            .then((response) => {
                if (response.success) {
                    this.getProcessDataList(this.state.contractIdValue, PROCESS_DEFINITION_KEY);

                    revisionAction === "approved" ?
                        this.props.displayNotification('Revision approved successfully', 'success') :
                        this.props.displayNotification('Revision disapproved successfully', 'success');

                    this.setState({ showApproveRevisionDrawer: false, isRevisonFinalConfirmation: false });
                }
            })
            .catch((err) => {
                this.props.displayNotification('Revision approved Error', 'error');
            });

    }

    handleOpenApproveRevisionConfimation = () => {
        const { activeActivity, approvedActivity } = this.state;

        const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;

        const revisionOneAssignee = approvedActivity && Object.keys(approvedActivity).length === 0 ? "" : approvedActivity;
        const user = sessionStorage.getItem('user');

        this.setState({
            taskId: activeActivity && Object.keys(activeActivity).length === 0 ? '' : activeActivity.id,
            showApproveRevisionDrawer: !this.state.showApproveRevisionDrawer,
            isApprovedRevisionStageTwo: (approveRevisionStep.REVISION_TWO === activityId && revisionOneAssignee.assignee === user) ? true : false,
            isRevisonFinalConfirmation: false
        });

    }

    getProcessDataList = (contractId, PROCESS_DEFINITION_KEY) => {
        this.props.getProcessList(contractId, PROCESS_DEFINITION_KEY, PROCESS_ACTIVE)
            .then(response => {
                const selectedActiveProcess = response && response.data.records.length === 0 ? {} : response.data.records[0];
                const activeActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] : (selectedActiveProcess ? selectedActiveProcess.activityInstanceList.filter(item => item.state === "ACTIVE") : []);
                const approvedActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] : (selectedActiveProcess ? selectedActiveProcess.activityInstanceList.filter(item => item.activityId === approveRevisionStep.REVISION_ONE) : []);

                this.setState({
                    activeActivity: activeActivity && activeActivity.length === 0 ? {} : activeActivity[0],
                    approvedActivity: approvedActivity && approvedActivity.length === 0 ? {} : approvedActivity[0]
                });
            });
    }

    handleFinalConfimation = (action) => {
        this.setState({ isRevisonFinalConfirmation: true, showApproveRevisionDrawer: false, revisionAction: action });
    }

    enableApproveDisApproveRevision = () => {

        const { activeActivity } = this.state;

        const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;

        const userRole = getLogedInUseRole();

        //check the user role if Credit Analyst or Risk Supervisor
        let isActivate = false;

        if (isUserHasPermission('LM-approve-dis-approve-revision-button', 'Edit')) {
            switch (userRole) {
                case approveRevisionRoles.CREDIT_ANALYST:
                    isActivate = this.checkStepOneAndTwo(activityId);
                    break;

                case approveRevisionRoles.RISK_SUPERVISOR:
                    isActivate = this.checkStepForSupervisor(activityId);
                    break;
                default: break;
            }
        }
        return isActivate;
    }


    checkStepOneAndTwo = (activityId) => {

        if (approveRevisionStep.REVISION_ONE === activityId) {
            return true;
        }

        if (approveRevisionStep.REVISION_TWO === activityId) {
            return true;
        }

        return false;
    }

    checkStepForSupervisor = (activityId) => {

        if (approveRevisionStep.REVISION_ONE === activityId) {
            return true;
        }

        if (approveRevisionStep.REVISION_TWO === activityId) {
            return true;
        }

        if (approveRevisionStep.REVISION_THREE === activityId) {
            return true;
        }

        return false;
    }


    toggleDrawer = (container, side, open) => () => {
        this.setState({
            [side]: open
        });
        switch (container) {
            case 'generatePaymentRequest':
                this.props.showGeneratePaymentRequest();
                break;
            default:
                break;
        }
    };

    handleChangeCreditLimit = () => {
        this.setState({ showChangeCreditLimitDrawer: !this.state.showChangeCreditLimitDrawer });
    }

    handleStartStopInterestPanelty = (open) => {
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
            language: this.props.loanData.language
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
                this.props.displayNotification('Interest panelty start/stop Error', 'error');
            });

    }

    emailStateCallback = (childState) => {
        this.setState({
            sendMessage: childState.sendMessage,
        });
    }

    render() {
        const { classes, loanData, refreshLoanData, smeDetails, directdebits, showGeneratePaymentRequestDrayer, configurations, updateFlexLoan, overviewData, locale, symbol, decimalSeparator, thousandSeparator } = this.props;
        const { showStartFlexLoanDrawer, showClaimLoanDrawer, showRefundLoanDrawer,
            totalwithdrawals, lastWithdrawalOrder, tikkieDrawerData, showStartRevisionDrawer,
            showApproveRevisionDrawer, isApprovedRevisionStageTwo, revisionAction, isRevisonFinalConfirmation, taskId, activeActivity,
            showChangeCreditLimitDrawer, showStartStopInterestPaneltyDrawer, isOpenChangeWorkflowStatusDialog, workflowData, loanWithdrawalData } = this.state;
        const activityId = activeActivity && Object.keys(activeActivity).length === 0 ? "" : activeActivity.activityId;
        const interestPenaltyIndicator = this.props.loanData && this.props.loanData.interestPenaltyIndicator;
        const newLoanData = {...loanWithdrawalData, ...loanData };
        return (
            <div>
                <Grid container>
                    {this.isEnableStartFlexLoanButton() ?
                        <Grid item >
                            <Button className={classes.customActionButton_Blue} style={{ backgroundColor: "#64d402" }} startIcon={<PlayCircleOutline />} variant="contained" onClick={() => this.setState({ showStartFlexLoanDrawer: true })}  > start loan </Button>
                        </Grid>
                        : false}
                    <Grid item >
                        <Button className={classes.customActionButton_Blue} style={{ backgroundColor: "#de4c4c" }} startIcon={<AddCircle />} variant="contained" onClick={this.handleWithdrawalPopup} disabled={Object.keys(loanData).length === 0 ? true : false} > Withdrawal </Button>
                    </Grid>

                    <Grid item >
                        <Button disabled={Object.keys(loanData).length === 0 ? true : false} onClick={() => { this.handleRefundScreen(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#ff9800" }} startIcon={<AddCircle />} variant="contained"> Refund </Button>
                    </Grid>
                    {loanData.country === 'NL' ?
                    <Grid item>
                        <Button className={classes.customActionButton_Blue} style={{ backgroundColor: "#24c4d8" }} startIcon={<AddCircle />} variant="contained" onClick={this.handleGeneratePaymentRequest}>  Generate Payment Request </Button>
                    </Grid>
                    : false}
                    <Grid item >
                        <Button disabled={Object.keys(loanData).length === 0 ? true : false} onClick={this.handleClaimScreen} className={classes.customActionButton_Blue} style={{ backgroundColor: "#9c27b0" }} startIcon={<AddCircle />} variant="contained"> Claim </Button>
                    </Grid>
                    <Grid item >
                        {isUserHasPermission('LM-approve-dis-approve-revision-button', 'Edit') ?
                            <Button disabled={(Object.keys(loanData).length === 0 || loanData.status !== 'revision-disapproved') ? true : false} onClick={() => { this.handleOpenStartRevisionConfimation(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#A0522D" }} startIcon={<AddCircle />} variant="contained"> START REVISION </Button>
                            : false
                        }
                    </Grid>

                    <Grid item >
                        {this.enableApproveDisApproveRevision() ?
                            <Button disabled={Object.keys(loanData).length === 0 ? true : false} onClick={() => { this.handleOpenApproveRevisionConfimation(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#006400" }} startIcon={<AddCircle />} variant="contained"> {approveRevisionStep.REVISION_THREE === activityId ? 'Supervisor (DIS)APPROVE REVISION' : '(DIS)APPROVE REVISION'} </Button>
                            : false
                        }
                    </Grid>
                    <Grid item >
                        {isUserHasPermission('LM-change-credit-limit-button', 'Edit') ?
                            <Button disabled={Object.keys(loanData).length === 0 ? true : false} onClick={() => { this.handleChangeCreditLimit(); }} className={classes.customActionButton_Blue} style={{ backgroundColor: "#c92c61" }} startIcon={<AddCircle />} variant="contained"> Change Limit </Button>
                            : false
                        }
                    </Grid>
                    
                    {loanData.dailyInterestPenaltyAmount !== 0 ?
                        <Grid item >
                            <Button disabled={Object.keys(loanData).length === 0 ? true : false} onClick={this.handleStartStopInterestPanelty} className={classes.customActionButton_Blue} style={{ backgroundColor: "#4cde68" }} startIcon={<AddCircle />} variant="contained"> Start/Stop Interest-Penalty </Button>
                        </Grid>
                        : null}
                </Grid>

                {/* ============================================ PopUps Section  =================================*/}

                {/* start loan popup */}
                <StartFlexLoanPopUp
                    open={showStartFlexLoanDrawer}
                    onClosePopUP={() => this.setState({ showStartFlexLoanDrawer: false })}
                    onConfirmPopUp={this.handleStartFlexLoanConfimation} />

                {/* withdrawal popup */}
                {
                    this.state.showWithdrawalPopup ?
                        <FlexLoanWithdrawalPopUp
                            onClosePopUp={this.handleWithdrawalPopupScreen}
                            loanData={ newLoanData }
                            refreshLoanData={refreshLoanData}
                            smeDetails={smeDetails}
                            locale={locale}
                            symbol={symbol}
                            decimalSeparator={decimalSeparator}
                            thousandSeparator={thousandSeparator}
                        />
                        : false
                }

                {/* refund popup */}

                <FlexLoanRefundPopUp
                    open={showRefundLoanDrawer}
                    onClosePopUp={this.handleRefundScreen}
                    smeLoan={loanData}
                    directdebits={directdebits}
                    smeDetails={smeDetails}
                    lastWithdrawalOrder={lastWithdrawalOrder}
                    totalwithdrawals={totalwithdrawals}
                />

                {/* generate payment request popup */}

                <FlexLoanGeneratePaymentRequestPopUp
                    open={showGeneratePaymentRequestDrayer}
                    onClosePopUp={() => this.toggleDrawer('generatePaymentRequest', 'bottom', false)}
                    tikkieDrawerData={tikkieDrawerData}
                />

                {/* claim popUp */}

                <FlexLoanClaimPopUp
                    open={showClaimLoanDrawer}
                    onClosePopUp={this.handleClaimScreen}
                    smeLoan={loanData}
                    smeLoanTransactions={directdebits}
                    smeDetails={smeDetails}
                    lastWithdrawalOrder={lastWithdrawalOrder}
                />

                {/* revision popup */}
                <FlexLoanStartRevisionPopUp
                    isOpenRevision={showStartRevisionDrawer}
                    onCloseRevision={() => this.setState({ showStartRevisionDrawer: false })}
                    onConfirmRevision={() => this.handleStartRevisionConfimation()}
                    isOpenRevisionTypeConfirmation={showApproveRevisionDrawer}
                    isApprovedRevisionStageTwo={isApprovedRevisionStageTwo}
                    onCloseRevisionTypeConfirmation={() => this.setState({ showApproveRevisionDrawer: false })}
                    onConfirmRevisionTypeConfirmation={(action) => this.handleFinalConfimation(action)}
                    revisionAction={revisionAction}
                    isOpenRevisonFinalConfirmation={isRevisonFinalConfirmation}
                    onConfirmRevisonFinalConfirmation={() => this.handleApproveRevisionConfimation()}
                    onCloseRevisonFinalConfirmation={() => this.setState({ showApproveRevisionDrawer: true, isRevisonFinalConfirmation: false })}
                    taskId={taskId} />

                {/* change credit limit popup */}
                <FlexLoanChangeCreditLimitPopUp
                    open={showChangeCreditLimitDrawer}
                    configurations={configurations}
                    onClosePopUp={this.handleChangeCreditLimit}
                    smeLoan={loanData}
                    updateFlexLoan={updateFlexLoan}
                    refreshLoanData={refreshLoanData}
                    overviewData={overviewData}
                    locale={locale}
                    symbol={symbol}
                    decimalSeparator={decimalSeparator}
                    thousandSeparator={thousandSeparator}
                />

                {/* Start/Stop interest panelty popup */}
                <FlexLoanStartStopInterestPaneltyPopUp
                    open={showStartStopInterestPaneltyDrawer}
                    handleStartStopInterestPaneltyScreen={this.handleStartStopInterestPanelty}
                    indicaterStatus={interestPenaltyIndicator}
                    changeInterestPaneltyStatus={this.changeInterestPaneltyState}
                    toCallBack={(childState) => this.emailStateCallback(childState)}
                />

                {/* Change workflow status popup */}
                < Dialog
					open={isOpenChangeWorkflowStatusDialog}
					onClose={this.handleChangeWorkflowStatusDialog}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					fullWidth
				>
                    <ChangeWorkflowStatusPopUp workflowData={workflowData} 
                    handleProcessSelectionFromParent={this.handleProcessSelection}
                    handleChangeWorkflowStatusDialog={this.handleChangeWorkflowStatusDialog} 
                    />
                </Dialog>
            </div>
        );
    }
}

FlexLoanButtonSection.propTypes = {
    classes: PropTypes.object,
    directdebits: PropTypes.array,
    loanData: PropTypes.object,
    overviewData: PropTypes.object,
    activeMandateByCustomer: PropTypes.object,
    refreshLoanData: PropTypes.func,
    updateFlexLoan: PropTypes.func,
    setMandateToEmandate: PropTypes.func,
    smeDetails: PropTypes.object,
    getWithdrwalsforSelectedLoan: PropTypes.func,
    lastWithdrawalOrder: PropTypes.object,
    showGeneratePaymentRequest: PropTypes.func,
    showGeneratePaymentRequestDrayer: PropTypes.bool,
    displayNotification: PropTypes.func,
    startRevison: PropTypes.func,
    approveRevision: PropTypes.func,
    getProcessList: PropTypes.func,
    configurations: PropTypes.object,
    selectedLoan: PropTypes.object,
    locale: PropTypes.string,
    symbol: PropTypes.string,
    decimalSeparator: PropTypes.string,
    thousandSeparator: PropTypes.string
};

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
        updateFlexLoan: (requestBody) => dispatch(updateFlexLoan(requestBody)),
        setMandateToEmandate: bindActions(dispatch, setMandateToEmandate),
        getWithdrwalsforSelectedLoan: contractId => dispatch(getWithdrwalsforSelectedLoan(contractId)),
        getFlexLoanLatestWithdrawalOrder: contractId => dispatch(getFlexLoanLatestWithdrawalOrder(contractId)),
        showGeneratePaymentRequest: () => dispatch(showGeneratePaymentRequest()),
        displayNotification: (msg, type) => dispatch(displayNotification(msg, type)),
        startRevison: (requestBody) => dispatch(startRevison(requestBody)),
        approveRevision: (requestBody) => dispatch(approveRevision(requestBody)),
        getProcessList: (processInstanceBusinessKey, processDefinitionKey, processState) => dispatch(getProcessList(processInstanceBusinessKey, processDefinitionKey, processState)),
        startStopSmeLoanInterestPenalty: (requestBody) => dispatch(startStopSmeLoanInterestPenalty(requestBody)),
        getPlatformParameters: (data) => dispatch(getPlatformParameters(data)),
        getGetCustomerLoans: (customerId, contractId) => dispatch(getGetCustomerLoans(customerId, contractId))
    };
};

const mapStateToProps = (state) => ({
    configurations: state.configurations,
    // smeLoans: state.lmglobal.smeLoans,
    // overview: state.flexLoanOverview.overview,
    // flexLoanContratIds: state.flexLoanOverview.flexLoanContratIds,
    // loan: state.lmglobal.selectedLoan,
    directdebits: state.smeLoanTransaction.directdebits,
    activeMandateByCustomer: state.mandates.activeMandateByCustomer,
    showGeneratePaymentRequestDrayer: state.generatepaymentrequest.showGeneratePaymentRequestDrayer,
    lmContractSysId: state.lmglobal.selectedLoan.contractId,
    // isDashboardContent: state.user.isDashboardContent,
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(FlexLoanButtonSection));