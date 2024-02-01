import clx from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from "moment";
import ReactJson from 'react-json-view';
import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import Notifier from 'components/initiation/Notification/Notifier';
import { Button, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';

import { AddCircle, Announcement, OpenInNew } from '@material-ui/icons';
import CustomInput from 'components/initiation/CustomInput/CustomInput';
import { startLoanInitiation } from 'store/initiation/actions/loanRequest.action';
import { searchProcess } from 'store/initiation/actions/workflowManagement.action';
import Card from 'components/initiation/Card/Card';
import CardBody from 'components/initiation/Card/CardBody';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import { displayNotification } from 'store/initiation/actions/Notifier';
import LoanHistoryTable from 'views/initiation/HistoryTable/SelectionTable';

//import StepperLabelIcons from "components/SteperLabelIcons/StepperLabelIcons";

import utilFunctions from "lib/initiation/utilFunctions";

// import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';

import CircularProgress from '@material-ui/core/CircularProgress';
import StepperLabelIcons from 'components/initiation/SteperLabelIcons/StepperLabelIcons';
import { isUserHasPermission } from 'lib/initiation/userPermission';
import { smeLoanType } from 'constants/initiation/sme-loan';
import { el } from 'date-fns/locale';
import { setNavigationInDashboards } from 'store/initiation/actions/login';
import history from "./../../../history";
import { setImportedLoanRequestContractId } from 'store/crm/actions/SmeOverview.action';

/* ***END*** */

const Process_State = {
  'ACTIVE': 'ACTIVE',
  'COMPLETED': 'COMPLETED',
  'INTERNALLY_TERMINATED': 'INTERNALLY_TERMINATED',
  'EXTERNALLY_TERMINATED': 'EXTERNALLY_TERMINATED',
};

const Process_State_map = {
  'ACTIVE': 'Active',
  'COMPLETED': 'Completed',
  'INTERNALLY_TERMINATED': 'Terminated',
  'EXTERNALLY_TERMINATED': 'Terminated',
};

const ActivityList_State = {
  'ACTIVE': 'ACTIVE',
  'COMPLETED': 'COMPLETED',
  'ERROR': 'ERROR',
};

// const ActivityList_State_map = {
//   'ACTIVE': 'Active',
//   'COMPLETED': 'Completed',
//   'ERROR': 'Error',
// };

const Activity_types = {
  'START_EVENT': 'startEvent',
  'SERVICE_TASK': 'serviceTask',
  'CALL_ACTIVITY': 'callActivity',
  'USER_TASK': 'userTask',
  'END_EVENT': 'endEvent',
  'TERMINATE_END_EVENT': 'terminateEndEvent',
};

const Activity_names = {
  'APPROVE_SME_LOAN_REQUEST': 'view-sme-loan-request-form',
  'REVIEW_CONTRACT': 'review-contract',
  'APPROVE_CONTRACT_BEFORE': 'ING0102-get-user-response-before-approve',
  'APPROVE_CONTRACT_AFTER': 'ING0102-get-user-response-after-approve',
};


const initialState = {
  isSuccess: false,
  expandedPanel: { name: 'Active', expanded: true },
  errorLog: null,
  initiationHistoryData: null,
  selectedCallActivity: {},
};

class StartInstance extends React.Component {

  constructor(props) {
    super(props);

    const initialValues = JSON.parse(JSON.stringify(initialState));

    this.state = {
      contractId: "",
      isLoading: false,
      openErrorLogDialog: false,
      loanType: '',
      ...initialValues
    };

    this.repeatedlyCheckInitiationDataInterval = null;

  }

  componentWillUnmount () {
    this.clearIntervalCall();
  }


  handleCustomInputChange = (name, value) => {

    const _state = { [name]: value };

    this.setState(_state);
  }

  clearIntervalCall = () => {
    if (this.repeatedlyCheckInitiationDataInterval) clearInterval(this.repeatedlyCheckInitiationDataInterval);
  }

  isAnyActiveProcessExist = (checkManualProcess = false) => {
    let isExist = false;

    if (this.state.initiationHistoryData && this.state.initiationHistoryData.length > 0) {

      for (const processItem of this.state.initiationHistoryData) {
        if (processItem && processItem.state === Process_State.COMPLETED) isExist = true;
        if (processItem && processItem.state === Process_State.ACTIVE) {
          isExist = true;

          if (checkManualProcess && processItem.activityInstanceList && processItem.activityInstanceList.length > 0) {
            if (processItem.activityInstanceList[processItem.activityInstanceList.length - 1].activityType === 'userTask') isExist = false;
          }
        }
      }

    }

    return isExist;
  }

  repeatedlyCheckInitiationData = () => {
    this.clearIntervalCall();

    this.repeatedlyCheckInitiationDataInterval = setInterval(() => {
      this.checkInitiationProcessHistory()
        .then(result => {
          if (result && result.length > 0) {
            this.setState({ initiationHistoryData: result }, () => {
              if (!this.isAnyActiveProcessExist(true)) this.clearIntervalCall();
            });
          }
        })
        .catch(() => {/*  */ });
    }, 1000);
  }

  startLoanInitiation = () => {

    const initialValues = JSON.parse(JSON.stringify(initialState));

    this.setState(initialValues, () => {

      const requestData = {
        "key": "contract-management",
        "businessKey": this.state.contractId,
        "variables": {
          "contractId": {
            "value": this.state.contractId,
            "type": "String"
          },
          "loanType": {
            "value": this.state.loanType,
            "type": "String"
          }
        }
      };

      this.props.startLoanInitiation(requestData)
        .finally(() => {
          this.props.displayNotification('LoanInitiation started successfully', 'success');
          this.setState({ isSuccess: true, isLoading: false }, () => {
            this.repeatedlyCheckInitiationData();
          });
        });

    });

  }

  checkInitiationProcessHistory = async (data) => {

    try {

      const requestData = data ? data : {
        processInstanceBusinessKey: this.state.contractId,
        processDefinitionKey: 'contract-management'
      };

      const result = await this.props.searchProcess(requestData);

      return result;

    } catch (error) {
      throw Error(error);
    }

  }

  initiationProcess = () => {

    if ( (this.state.contractId && this.state.contractId !== "") && (this.state.loanType && this.state.loanType !== "") ) {

    // if ( this.state.contractId && this.state.contractId !== "") {
      this.props.setImportedLoanRequestContractId(this.state.contractId)
      this.setState({ isLoading: true }, () => {

        this.checkInitiationProcessHistory()
          .then(result => {
            if (!result || result.length === 0) this.startLoanInitiation();
            else {
              this.setState({ initiationHistoryData: result }, () => {
                if (this.isAnyActiveProcessExist()) {
                  this.setState({ isLoading: false }, () => { this.repeatedlyCheckInitiationData(); });
                } else this.startLoanInitiation();
              });
            }
          })
          .catch(() => {/*  */ });

      });



    }

  }

  handleExpandAction = (name) => {

    const { expandedPanel: expandedPanel } = this.state;

    expandedPanel.expanded = (expandedPanel.name === name) ? !expandedPanel.expanded : true;
    expandedPanel.name = name;

    this.setState({ expandedPanel: expandedPanel });
  }

  handleErrorLogDialog = () => {
    this.setState((prevState) => {
      return {
        errorLog: null,
        openErrorLogDialog: !prevState.openErrorLogDialog,
      };
    });
  }

  displayErrorList = (activityProcessInstanceId, activityType, processItemId, type) => {

    if (activityProcessInstanceId) {

      if (activityType && activityType === Activity_types.CALL_ACTIVITY) {

        const { selectedCallActivity } = this.state;

        const requestData = { 'processInstanceId': activityProcessInstanceId };

        this.checkInitiationProcessHistory(requestData)
          .then(result => { selectedCallActivity[processItemId] = result; })
          .catch(() => { selectedCallActivity[processItemId] = []; })
          .finally(() => { this.setState({ selectedCallActivity }); });

      } else {

        let dataObject = null;

        const { selectedCallActivity, initiationHistoryData } = this.state;

        if (type === 'main') {

          for (const processItem of initiationHistoryData) {
            if (processItem && processItem.id === processItemId) {

              for (const activityInstance of processItem.activityInstanceList) {
                if (activityInstance.id === activityProcessInstanceId) dataObject = activityInstance;
              }

            }
          }

        } else {

          for (const activityInstance of selectedCallActivity[processItemId][0].activityInstanceList) {
            if (activityInstance.id === activityProcessInstanceId) dataObject = activityInstance;
          }

        }

        this.setState((prevState) => {
          return {
            errorLog: dataObject,
            openErrorLogDialog: dataObject ? !prevState.openErrorLogDialog : false,
          };
        });

      }

    }

  }

  getRedirection = (activityName) => {
    if (activityName) {
      const { classes } = this.props;

        let redirectionUrl = null;//otherRoutes

        let redirectDashBordItem = null;

        if (activityName.match(Activity_names.APPROVE_SME_LOAN_REQUEST)){
          redirectDashBordItem = 'LoanRequestOverview';
          redirectionUrl = `/user/smeLoanRequestOverview?contractId=${this.state.contractId}`;
        }  
        if (activityName === Activity_names.REVIEW_CONTRACT){
          redirectDashBordItem = 'ContractOverviewNew'
          redirectionUrl = `/user/contract-overview?ContractId=${this.state.contractId}`;
        }

        if (activityName === Activity_names.APPROVE_CONTRACT_BEFORE){
          // redirectDashBordItem = 'LoanRequestOverview';
          // redirectionUrl = `/user/smeLoanRequestOverview?ContractId=${this.state.contractId}`;
          redirectDashBordItem = 'ContractOverviewNew'
          redirectionUrl = `/user/contract-overview?ContractId=${this.state.contractId}`;
        } 

        if (activityName === Activity_names.APPROVE_CONTRACT_AFTER){
          redirectDashBordItem = 'ContractOverviewNew'
          redirectionUrl = `/user/contract-overview?ContractId=${this.state.contractId}`;
        } 

        if (redirectionUrl && redirectDashBordItem) return (
        <div className={classes.errorViewIcon} onClick={() => { this.getRoute(redirectionUrl , redirectDashBordItem) }} ><OpenInNew /></div>);      
    }
    return null;
  }

  getRoute(redirectionUrl , redirectDashBordItem){
    const { isDashboardContent } = this.props;
    if(isDashboardContent){
      this.props.setNavigationInDashboards(redirectDashBordItem)
      .then(res => {
        if (res) {
          history.push(res);
          }
      });
      return;
    }else{
      window.location.replace(redirectionUrl);//otherRoutes
    }
   }
  _generateStepperView = (processItem, processItemId, isSubFlow = false, type) => {

    try {

      const { classes } = this.props;
      /* Sort data into descending order */
      let activityInstanceList = [];

      if (processItem.activityInstanceList && processItem.activityInstanceList.length > 0) {
        activityInstanceList = processItem.activityInstanceList.sort((one, two) => {
          if (moment(one.startTime).isBefore(moment(two.startTime))) return -1;
          if (moment(one.startTime).isAfter(moment(two.startTime))) return 1;
          return 0;
        });
      }

      const stepperClass = isSubFlow ? `${classes.activeSectionBody} ${classes.borderRadius_5}` : classes.borderRadius_5;

      return (
        <Stepper activeStep={processItem.activityInstanceList.length - 1} orientation="vertical" className={stepperClass}>

          {
            activityInstanceList.map((activity) => {

              const stepProps = {};
              const labelProps = {
                error: (activity.state === ActivityList_State.ERROR)
              };

              const activityIdentifier = activity.calledProcessInstanceId ? activity.calledProcessInstanceId : activity.id;

              return (
                <Step key={activity.id} {...stepProps}>
                  <StepLabel icon={<StepperLabelIcons type={activity.activityType} status={activity.state.toLowerCase()} />} {...labelProps}>
                    <div className={classes.floatLeft} >{activity.activityName}</div>
                    {(activity.state === ActivityList_State.ERROR) ?
                      <div className={classes.errorViewIcon}
                        onClick={() => this.displayErrorList(activityIdentifier, activity.activityType, processItemId, type)} ><Announcement /></div>
                      : null}
                  </StepLabel>
                  <StepContent>
                    <div className={classes.activityStatus}>{utilFunctions.textFormatter(activity.state)}</div>
                    {
                      (activity.state === ActivityList_State.ACTIVE && activity.activityType !== Activity_types.USER_TASK) ?
                        <div className={classes.activityStatusLoader}><CircularProgress size={20} /></div>
                        : null
                    }
                    {
                      (activity.state === ActivityList_State.ACTIVE && activity.activityType === Activity_types.USER_TASK) ?
                        this.getRedirection(activity.activityId) : null
                    }
                  </StepContent>
                </Step>
              );
            })
          }
        </Stepper>
      );

    } catch (error) {
      console.log(error);
      return null;
    }

  }

  showInitiationHistoryData = () => {

    try {

      const { classes } = this.props;

      const output = [];

      if (this.state.initiationHistoryData) {

        const { selectedCallActivity } = this.state;

        let initiationHistoryData = JSON.parse(JSON.stringify(this.state.initiationHistoryData));

        /* Sort data into descending order */
        initiationHistoryData = initiationHistoryData.sort((one, two) => {
          if (moment(one.startTime).isBefore(moment(two.startTime))) return 1;
          if (moment(one.startTime).isAfter(moment(two.startTime))) return -1;
          return 0;
        });

        let processCounter = 0;

        for (const processItem of initiationHistoryData) {

          if (processItem) {

            ++processCounter;

            const sections = [];

            const activityInstanceList = [];

            const id = (processItem.state === Process_State.ACTIVE || processCounter === 1) ? Process_State_map.ACTIVE : `${processItem.state}_${processItem.id}`;

            const isExpanded = (this.state.expandedPanel.name === id) && (this.state.expandedPanel.expanded);

            const processStatusClassName = `processStatus_${processItem.state}`;

            const processStatusClasses = `${classes.statusLabel} ${classes.marginLeft_30} ${classes[processStatusClassName]}`;

            const startTime = moment(processItem.startTime).format('DD-MM-YYYY  HH:mm');

            const endTime = moment(processItem.endTime).format('DD-MM-YYYY  HH:mm');

            let processStatus = processItem.state.replace('_', ' ');
            processStatus = utilFunctions.textFormatter(processStatus, 'firstUpperAll');

            /* Stepper view for activities */
            if (isExpanded && processItem && processItem.activityInstanceList && processItem.activityInstanceList.length > 0) {
              activityInstanceList.push(this._generateStepperView(processItem, processItem.id, true, 'main'));
            }

            /* CallActivities */
            const expandedCallActivity = [];

            if (isExpanded && selectedCallActivity && selectedCallActivity[processItem.id] && selectedCallActivity[processItem.id].length > 0) {
              for (const subActivity of selectedCallActivity[processItem.id]) {

                const callActivities = [];
                callActivities.push(this._generateStepperView(subActivity, processItem.id, false, 'callActivity'));

                expandedCallActivity.push(
                  <div className={classes.subFlowWrapper}>
                    <div className={classes.subActivitiesHeader}>{subActivity.processDefinitionName}</div>
                    <div>{callActivities}</div>
                  </div>
                );
              }
            }

            const actionDetailsSectionStyles = `${classes.displayBlock} ${isExpanded ? classes.activeSectionBody : ''}`;

            sections.push(
              <Accordion expanded={isExpanded} id={id} onChange={() => this.handleExpandAction(id)} className={isExpanded ? classes.activeSectionBody : ''}>

                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id={`${id}_summary`} className={isExpanded ? classes.activeSectionHeader : ''} >
                  <Typography className={classes.heading}>{processItem.processDefinitionName}</Typography>
                  <div className={classes.processStatusWrapper}>
                    <div className={processStatusClasses}>{processStatus}</div>
                  </div>
                  <div className={classes.labels}><div className={classes.timeLabel}>Start Time : </div>{startTime}</div>
                  {
                    processCounter === 1 ?
                      <div className={classes.latestAttempt}>Latest Attempt</div>
                      : null
                  }
                </AccordionSummary>

                <AccordionDetails className={actionDetailsSectionStyles}>
                  <div className={classes.labelsWrapper}>
                    <div className={classes.labels}>Start Time : {startTime}</div>
                    {
                      moment(endTime).isValid() ? <div className={classes.labels}>End Time : {endTime}</div> : null
                    }
                  </div>
                  <div className={classes.labelsWrapper}>
                    <GridContainer className={classes.batchSelectionContainer}>
                      <GridItem xs={12} sm={5} md={5} lg={5}>
                        {activityInstanceList}
                      </GridItem>
                      <GridItem xs={12} sm={6} md={6} lg={6}>
                        {expandedCallActivity}
                      </GridItem>
                    </GridContainer>
                  </div>
                </AccordionDetails>

              </Accordion>
            );

            output.push(sections);

          }

        }

      }

      return output;

    } catch (error) {
      console.log(error);
      return [];
    }

  }

  render () {

    const { classes } = this.props;

    const { openErrorLogDialog, errorLog, isLoading } = this.state;

    let historyData = [];
    historyData = this.showInitiationHistoryData();

    return (
      <>
        <Notifier />
        <h3>Import Loan Request</h3>

        <Card>
          <CardBody>
            <GridContainer className={classes.batchSelectionContainer}>
              <GridItem xs={12} sm={6} md={3} lg={3}>
                <CustomInput
                  id='contract-id'
                  formControlProps={{
                    className: clx(classes.zeroMargin)
                  }}
                  inputProps={{
                    name: 'contractId',
                    value: this.state.contractId,
                    onChange: (e) => this.handleCustomInputChange('contractId', e.target.value),
                  }}
                />
              </GridItem>

              <GridItem xs={12} sm={6} md={3} lg={3} style={{ marginTop: "20px" }}>
                  {/* <span className={clx(classes.tableCell, classes.bold)}>Type</span>
                  <span className={clx(classes.tableCell, classes.marginLeft)}> */}
                  <FormControl variant="outlined" style={{ width: '60%' }}>
                    <InputLabel id="loanType">Loan Type</InputLabel>
                    <Select
                      labelId="loanType"
                      id="loanType"
                      value={this.state.loanType}
                      inputProps={{
                        name: "type",
                        id: "type"
                      }}
                      onChange={(e) => this.handleCustomInputChange('loanType', e.target.value)}
                      label="Loan Type"
                    >
                      {Object.keys(smeLoanType).map((key, index) => (
                        <MenuItem key={index} value={smeLoanType[key]}>{key}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                {/* </span> */}
              </GridItem>

              <GridItem xs={12} sm={6} md={3} lg={3} style={{ marginTop: "40px" }}>
                {(isUserHasPermission("Import loan request", ["Add", "Edit"])) ?
                  <Button
                    variant='contained'
                    startIcon={<AddCircle />}
                    className={classes.blueIconButton}
                    onClick={this.initiationProcess}
                    disabled={isLoading}
                  >Start</Button>
                  : null
                }
              </GridItem>

            </GridContainer>

            {this.state.isSuccess ? <LoanHistoryTable /> : null}

            {historyData}

          </CardBody>
        </Card>

        <Dialog open={openErrorLogDialog} onClose={this.handleErrorLogDialog} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-details">
          <DialogTitle id="bank-details-title">Error Logs</DialogTitle>
          <DialogContent>
            {
              errorLog ?
                <ReactJson
                  displayDataTypes={false}
                  enableClipboard={false}
                  src={errorLog.logList[0]} />
                : null
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleErrorLogDialog} className={classes.popupCloseButton}>Close</Button>
          </DialogActions>
        </Dialog>

      </>
    );
  }
}

StartInstance.propTypes = {
  classes: PropTypes.object.isRequired,
  startLoanInitiation: PropTypes.func,
  searchProcess: PropTypes.func,
  displayNotification: PropTypes.func,
  isDashboardContent: PropTypes.bool,
  setNavigationInDashboards: PropTypes.func,
  setImportedLoanRequestContractId: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    isDashboardContent: state.user.isDashboardContent,
    importedLoanRequestContractId: state.lmglobal.importedLoanRequestContractId
  };
};
const mapDispatchToProps = (dispatch) => ({
  startLoanInitiation: (requestBody) => dispatch(startLoanInitiation(requestBody)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  searchProcess: (requestQuery) => dispatch(searchProcess(requestQuery)),
  setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
  setImportedLoanRequestContractId: (id) => dispatch(setImportedLoanRequestContractId(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(StartInstance));

/***************/
