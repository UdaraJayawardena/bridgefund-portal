import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from 'assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
// import CustomFormatInput from 'components/initiation/CustomFormatInput/CustomFormatInput';
import HighRiskBlock from './HighRiskBlock';
import ParameterValuesBlock from './ParameterValuesBlock';
import {
    Paper, TableContainer, Table, TableRow, TableCell,
    Button, TextField, Dialog
} from '@material-ui/core';
import { displayNotification } from "store/initiation/actions/Notifier";
import { completeFirstAnalyses } from "store/initiation/actions/loanRequest.action";
import { getSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { getFieldNameValues } from 'store/initiation/actions/Configuration.action';
import { getProcessList } from 'store/loanmanagement/actions/FlexLoan.action';
import Memo from '../../ProcessDashboard/Memo';
import { EURO } from 'lib/initiation/utility';
const MANUAL_FIRST_ANALYSES_DONE = 'manual-first-analyses-done';
const LI_PROCESS_DEFINITION_KEY = "loan-initiation";
const PROCESS_ACTIVE = 'ACTIVE';
class FirstAnalysesOverview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            memoData: {
                customer: '',
                processName: '',
                processKey: '',
                taskKey: '',
                taskName: '',
            },
            isOpenMemoDialog: false,
            decisionColor: '',
            reason: '',
            reasonForDifferentChoice: [],
            awardedLoanAmount: 0,
            isFirstAnalysesActive: true
        };
    }

    componentDidMount() {
        const { smeLoanRequest } = this.props;
        const firstAnalysesIndicator = smeLoanRequest.firstAnalysesIndicator;

        this.checkDecisionBox(firstAnalysesIndicator);
        this.getReasonForDifferentChoice();
        this.getAwardedAmount();
        this.checkActiveProcess();
    }

    setMemoData = () => {
        const { customer, smeLoanRequest } = this.props;

        if (customer && smeLoanRequest) {
            this.setState({
                memoData: {
                    customer: customer._id,
                    customerLegalName: customer.legalName,
                    contractId: smeLoanRequest.contractId,
                    processName: '(Main) Loan Initiation',
                    processKey: 'loan-initiation',
                    taskKey: 'first-analyses',
                    taskName: 'First Analyses',
                }
            }, () => { this.handleMemoDialog(); });
            return;
        }
        this.props.displayNotification('No customer or contractId exists to add memo !', 'warning');
    };

    handleMemoDialog = () => {
        this.setState({ isOpenMemoDialog: !this.state.isOpenMemoDialog });
    }

    handleDecisionInputChange = (value) => {
        this.setState({ decisionColor: value });
    }

    handleReasonInputChange = (value) => {
        this.setState({ reason: value });
    }

    checkDecisionBox = (firstAnalysesIndicator) => {
        if (firstAnalysesIndicator !== 'orange') {
            this.setState({
                decisionColor: firstAnalysesIndicator
            });
        }
    }

    getReasonForDifferentChoice = () => {
        const reqObj = {
            fieldName: 'reason-for-different-choice',
            activeIndicator: 'YES'
        };
        this.props.getFieldNameValues(reqObj)
            .then((response) => {
                if (Array.isArray(response)) {
                    if (response.length > 0) {
                        const fields = response.map(item => item.fieldNameValue);
                        this.setState({ reasonForDifferentChoice: fields });
                    }
                }
            });
    }

    checkActiveProcess = () => {
        const { smeLoanRequest } = this.props;

        this.props.getProcessList(smeLoanRequest.contractId, LI_PROCESS_DEFINITION_KEY, PROCESS_ACTIVE)
            .then(response => {
                const selectedActiveProcess = response && response.data.records.length === 0 ? {} : response.data.records[0];
                let activeActivity = selectedActiveProcess && Object.keys(selectedActiveProcess).length === 0 ? [] :
                    (selectedActiveProcess ? selectedActiveProcess.activityInstanceList.filter(item => item.state === PROCESS_ACTIVE && item.activityId === 'first-analyses') : []);
                this.setState({ isFirstAnalysesActive: activeActivity.length === 0 ? true : false });
            });
    };

    getTurnOverAmount = () => {
        const { smeLoanRequest } = this.props;
        const turnOverAmount = smeLoanRequest.turnOverOnYearlyBase ? smeLoanRequest.turnOverOnYearlyBase * (15 / 100) : 0;
        return turnOverAmount;
    };

    getAwardedAmount = () => {
        const { smeLoanRequest } = this.props;
        const minValue = Math.min(this.getTurnOverAmount(), smeLoanRequest.desiredPrincipleAmount ? smeLoanRequest.desiredPrincipleAmount : 0, smeLoanRequest.calculatedExpectedLoanAmount ? smeLoanRequest.calculatedExpectedLoanAmount : 0);
        this.setState({ awardedLoanAmount: minValue });
    };
    processDecision = () => {
        const { smeLoanRequest } = this.props;
        const { decisionColor, reason, explanation, awardedLoanAmount } = this.state;

        const requestData = {
            contractId: smeLoanRequest.contractId,
            firstAnalysesIndicator: decisionColor,
            automatedFirstAnalysesIndicator: smeLoanRequest.firstAnalysesIndicator,
            reasonForDifferentChoice: reason,
            explanationDifferentChoice: explanation,
            awardedAmount: awardedLoanAmount,
            status: MANUAL_FIRST_ANALYSES_DONE
        };

        if (!requestData.contractId) return this.props.displayNotification('Contract is not selected', 'warning');
        if (!decisionColor) return this.props.displayNotification('Please select the decision!', 'warning');

        this.props.completeFirstAnalyses(requestData)
            .finally(() => {
                const requestObj = {
                    contractId: smeLoanRequest.contractId,
                };
                this.props.getSmeLoanRequestDetails(requestObj)
                    .then(response => {
                        const firstAnalysesIndicator = response.firstAnalysesIndicator;
                        this.checkDecisionBox(firstAnalysesIndicator);
                        this.checkActiveProcess();
                    });
                this.props.displayNotification('Decision made successfully', 'success');
            });
    }

    handleCustomInputChange = (name, value) => {
        this.setState({ [name]: value });
    };

    render() {
        const { classes } = this.props;
        const { isOpenMemoDialog, memoData } = this.state;
        const { smeLoanRequest } = this.props;

        return (
            <div>
                <GridContainer>
                    <GridItem align="right" xs={12} sm={12} lg={12}>
                        <Button
                            style={{ marginTop: '25px', }}
                            variant='contained'
                            className={classes.addIconButton}
                            onClick={() => this.setMemoData()}
                        >Add Memo
                        </Button>
                    </GridItem>
                </GridContainer>
                <GridContainer>
                    <GridItem xs={6} sm={6} lg={6}>
                        <HighRiskBlock />
                    </GridItem>
                    <GridItem xs={6} sm={6} lg={6} className={classes.parameterTableContainer}>
                        <ParameterValuesBlock />
                    </GridItem>
                </GridContainer>

                <GridContainer>
                    <GridItem xs={8} sm={8} lg={8}>
                        <TableContainer component={Paper} className={classes.tableContainer}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Desired Amount</TableCell>
                                    <TableCell className={classes.tableCell}>{smeLoanRequest.desiredPrincipleAmount ? EURO(smeLoanRequest.desiredPrincipleAmount) : '-'}</TableCell>
                                    <TableCell className={classes.tableCell}>Calculated-Expected-Amount</TableCell>
                                    <TableCell className={classes.tableCell}>{smeLoanRequest.calculatedExpectedLoanAmount ? EURO(smeLoanRequest.calculatedExpectedLoanAmount) : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.tableCell}>Automated First Analyses Score</TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth={true}
                                            variant="outlined"
                                            id="automatedFirstAnalysesScore"
                                            InputProps={{
                                                className: smeLoanRequest.firstAnalysesIndicator == 'green' ?
                                                    classes.firstAnalysesScoreGreen : smeLoanRequest.firstAnalysesIndicator == 'orange' ?
                                                        classes.firstAnalysesScoreOrange : smeLoanRequest.firstAnalysesIndicator == 'red' ?
                                                            classes.firstAnalysesScoreRed : classes.decisionPlain
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                                className: classes.inputLabel
                                            }}
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell className={classes.tableCell}>15% Turn-Over-Amount</TableCell>
                                    <TableCell className={classes.tableCell}>{EURO(this.getTurnOverAmount().toFixed(2))}</TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </GridItem>
                </GridContainer>
                {/* ==================== memo dialog stuff =============== */}

                < Dialog
                    open={isOpenMemoDialog}
                    onClose={this.handleMemoDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                >
                    <Memo memoData={memoData} handleMemoDialog={this.handleMemoDialog} />
                </Dialog >
            </div >
        );
    }
}

FirstAnalysesOverview.propTypes = {
    classes: PropTypes.object.isRequired,
    customer: PropTypes.object,
    smeLoanRequest: PropTypes.object,
    displayNotification: PropTypes.func,
    completeFirstAnalyses: PropTypes.func,
    getFieldNameValues: PropTypes.func,
    getProcessList: PropTypes.func,
};

const mapStateToProp = (state) => ({
    customer: state.lmglobal.selectedCustomer,
    smeLoanRequest: state.lmglobal.overviewData,
});

const mapDispatchToProps = (dispatch) => ({
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    completeFirstAnalyses: (body) => (dispatch(completeFirstAnalyses(body))),
    getSmeLoanRequestDetails: (contractId) => dispatch(getSmeLoanRequestDetails(contractId)),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getProcessList: (processInstanceBusinessKey, processDefinitionKey, processState) => dispatch(getProcessList(processInstanceBusinessKey, processDefinitionKey, processState)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(FirstAnalysesOverview));