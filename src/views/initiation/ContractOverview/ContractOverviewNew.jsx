import React from 'react';
import clx from 'classnames';
import qs from "querystring";
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import parse from 'html-react-parser';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/ContractOverview';

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';

import GridItem from 'components/initiation/Grid/GridItem';
import Notifier from 'components/initiation/Notification/Notifier';
import GridContainer from 'components/initiation/Grid/GridContainer';
import CustomSearch from 'components/initiation/CustomInput/CustomSearch';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';

import { displayNotification } from 'store/initiation/actions/Notifier';
import { searchProcess } from 'store/initiation/actions/workflowManagement.action';
import { completeUserTask, getUserTaskFromWorkflow } from 'store/initiation/actions/Camunda.action';
import { getContract, downloadUnsignedContract, regenerateContract } from 'store/initiation/actions/Contracts.action';
import { getCustomerDetails, requestLendingOpportunity, generateOrganizationViewUrl } from 'store/crm/actions/Customer.action';

import EditContract from './EditContract';
import LogViewTable from 'views/initiation/HistoryTable/LogsViewTable';

import ENV from '../../../config/env';
import { isUserHasPermission } from 'lib/initiation/userPermission';
import { isNullOrEmpty, updateQueryStringParameter } from 'lib/initiation/utility';
import Loader from 'components/loanmanagement/CustomLoader/Loader';

import { CustomerLegalForm } from '../../../constants/crm/Customer';

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const processDefinitionKey = 'contract-management';
const currentStates = { APPROVE_CONTRACT: 'approve-contract', UPLOAD_CONTRACT: 'upload-contract', COMPLETED: 'completed' };
const decisionTaskId = 'get-user-response';

const initialState = {
  contractId: '',
  selectedContract: {},
  isEditing: false,
  updatingFileds: [],
  isRegenerating: false,
  isSentToStiply: false,
  isUploading: false,
  reviewTask: null,
  currentState: currentStates.APPROVE_CONTRACT,
  viewError: false,
  logs: [],
  errors: [],
  processInstanceId: null,
  openEditContract: false,
  isLoading: true,
  downloadConfirmationPopup: false,
  downloadConfirmationContent: '',
  isLoadingContract: false,
  isLoadingOrganizationUrl: false
};

class ContractOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = JSON.parse(JSON.stringify(initialState));
  }

  _resetToDefault = (keepContract) => {
    const _state = JSON.parse(JSON.stringify(initialState));
    if (keepContract) {
      delete _state.contractId;
      delete _state.selectedContract;
    }
    this.setState(_state);
  }

  componentDidMount() {
    const { isDashboardContent, importedLoanRequestContractId } = this.props;
    
    if(isDashboardContent){
      const ContractId = importedLoanRequestContractId;
      this.getData(ContractId);
    }else{
      const params = qs.parse(this.props.location?.search.slice(1));
      const ContractId = params.ContractId ? params.ContractId : null;
      this.getData(ContractId);
    }
  }

  setContractIdInUrl = (id) => {

    let URL = document.location.origin + document.location.pathname;
    if (id)
      URL = updateQueryStringParameter(
        document.location.href,
        "ContractId",
        id
      );
    window.history.pushState({ path: URL }, "", URL);
  };

  onSearch = (name, value) => {
    const _state = { [name]: value, isEditing: false };
    if (name === 'contractId' && value === '') _state.selectedContract = {};
    this.setContractIdInUrl();
    this.setState(_state);
  };

  _decideCurrentState = (task) => {
    let currentState = currentStates.COMPLETED;
    if (task) {
      currentState = task.taskDefinitionKey.match(/before/) !== null ? currentStates.APPROVE_CONTRACT : currentStates.UPLOAD_CONTRACT;
    }
    return currentState;
  };

  getData = (contractId) => {
    
    this.setState({ isLoadingContract: true });
    if (contractId === '' || contractId === null || contractId === undefined){
      this.setState({ isLoading: false, isLoadingContract: false });
      return;
    } 

    Promise.all([
      this.props.getContract(contractId, JSON.stringify({ status: 1, html: 1, contractId: 1, specialClause: 1, customerId: 1, pdfDocument: 1, smeLoanRequestProposalId: 1 })),
      this.props.getUserTaskFromWorkflow({ processDefinitionKey, processInstanceBusinessKey: contractId, taskDefinitionKeyLike: decisionTaskId })
    ])
      .then(result => {
        if (!result[0].html) {
          this.props.displayNotification('Contract HTML not available!', 'warning');
        }
        const task = result[1].length > 0 ? result[1][0] : null;
        let errLogs = [];
        if (task && task.variables.errorLog) {
          const errors = JSON.parse(task.variables.errorLog.value);
          if (errors.length > 0) {
            errLogs = errors;
            this.props.displayNotification('Please check for errors', 'error');
          }
        }
        const currentState = this._decideCurrentState(task);
        const processInstanceId = task && task.processInstanceId;
        this.setState({ 'selectedContract': result[0], contractId, reviewTask: task, currentState, errors: errLogs, processInstanceId });
        this.setState({ isLoading: false });
        this.setState({ isLoadingContract: false });
      })
      .catch(( err) => {  
        this.setState({ isLoading: false });
        this.setState({ isLoadingContract: false });
      });
  };

  handleOnContractSearchResult = (result) => {
    if (result && typeof result !== 'string') {
      this.setContractIdInUrl(result.contractId);
      this.getData(result.contractId);
    }
  }

  closeDownloadPopup = async () => {
    this.setState({ downloadConfirmationPopup: false });
  }

  checkCompleteContract = async () => {
    if (this.state.selectedContract){
      const response = await this.props.getCustomerDetails(this.state.selectedContract.customerId);
      const checkNumberOfPerson = `Vennoot 2`;
      const errorTag = `<span style="background-color: yellow;">`;
      if(response.customer && 
        response.customer.legalForm === CustomerLegalForm.VOF && !this.state.selectedContract.html.includes(checkNumberOfPerson)) {
          this.setState({ downloadConfirmationContent:'This company is a VOF, however only one person has been added to the Customer-Dashboard. VOFs require at least two Persons to be added and shown on the contract. Are you sure you want to continue?', downloadConfirmationPopup: true });
      } else if (this.state.selectedContract.html.includes(errorTag)) {
        this.setState({ downloadConfirmationContent:'Some fields are missing in the contract. Are you sure you want to download this contract?', downloadConfirmationPopup: true });
      } else {
        this.sendToStiply();
      }
    }
  }

  sendToStiply = async () => {

    this.setState({ downloadConfirmationPopup: false });
    const contractId = this.state.selectedContract.contractId;
    const pdf = await this.props.downloadUnsignedContract(contractId).catch(() => {/*  */ });

    if (!pdf) return;

    const element = document.createElement('a');
    element.setAttribute('href', pdf.dataUrl);
    element.setAttribute('download', pdf.fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    this.reviewContract('receive-and-edit-contract', 'isSentToStiply');
  };

  completeTask = async (taskId, variables) => {

    return await this.props.completeUserTask({
      id: taskId,
      withVaraiblesInReturn: true,
      variables: variables
    })
      .catch(() => { return 'error'; });
  };

  reviewContract = async (action, buttonIdentifier) => {

    const contract = cloneDeep(this.state.selectedContract);
    const task = this.state.reviewTask;

    this.setState({ [buttonIdentifier]: true });
    const taskCompletionResponse = await this.completeTask(
      task.id,
      {
        reviewAction: {
          type: 'String',
          value: action
        }
      }
    );

    if (taskCompletionResponse === 'error') action = 'error';

    switch (action) {
      case 'regenerate-contract':
        this.regenerate(contract, buttonIdentifier);
        break;
      case 'receive-and-edit-contract':
        this.updateTask(contract, buttonIdentifier, action);
        break;
      case 'change-crm':
        this.updateTask(contract, buttonIdentifier, action);
        break;
      case 'upload-signed-document': {
        this.updateTask(contract, buttonIdentifier, action);
        break;
      }
      case 'edit-contract': {
        this.setState({ [buttonIdentifier]: false });
        const URL = `${document.location.origin}/user/smeLoanRequestOverview?contractId=${this.state.selectedContract.contractId}`;
        window.location.replace(URL);
        break;
      }
      default:
        return this.setState({ [buttonIdentifier]: false });
    }
  };

  regenerate = (contract, buttonIdentifier) => {

    let newTask = null;

    const interval = setInterval(async () => {
      const response = await this.props.getUserTaskFromWorkflow({ processDefinitionKey, processInstanceBusinessKey: contract.contractId, taskDefinitionKeyLike: decisionTaskId });
      newTask = response.length > 0 ? response[0] : null;
      if (newTask !== null) updateContractAndTask();
    }, 2000);

    const updateContractAndTask = () => {
      clearInterval(interval);
      this.setState({ [buttonIdentifier]: false });
      this.getData(contract.contractId);
    };
  };

  updateTask = (contract, buttonIdentifier, action, shouldCallGetData, checkIfCompleted) => {

    let taskDefinitionKey = decisionTaskId;
    let newTask = null;
    const interval = setInterval(async () => {

      if (action === 'receive-and-edit-contract') taskDefinitionKey = 'approve-contract';
      if (action === 'upload-signed-document') taskDefinitionKey = 'upload-signed-document';
      if (action === 'add-special-clause') taskDefinitionKey = 'add-special-clause';
      if (action === 'change-crm') taskDefinitionKey = 'change-crm';

      const requests = [
        this.props.getUserTaskFromWorkflow({ processDefinitionKey, processInstanceBusinessKey: contract.contractId, taskDefinitionKeyLike: taskDefinitionKey })
      ];

      if (checkIfCompleted) {
        requests.push(this.props.searchProcess({ processInstanceBusinessKey: contract.contractId, processDefinitionKey, processInstanceId: this.state.processInstanceId }));
      }

      const response = await Promise.all(requests).catch((/* err */) => { /* console.error(err); */ });
      const userTaskResponse = response && response[0];
      const processInstanceResponse = response && response.length > 1 ? response[1][0] : { state: 'ACTIVE' };

      newTask = userTaskResponse.length > 0 ? userTaskResponse[0] : null;
      const isCompleted = ['COMPLETED', 'INTERNALLY_TERMINATED'].includes(processInstanceResponse.state);

      if (newTask && action === 'receive-and-edit-contract') {
        clearInterval(interval);
        const compTskRes = await this.completeTask(
          newTask.id,
          this._createCamundaVariables({
            contract: { contractId: contract.contractId, status: 'contract-approved' },
            isUpdateContract: true,
            isGenerateContract: false
          }));

        if (compTskRes === 'error') {
          const currentState = this._decideCurrentState(newTask);
          this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, isEditing: false, currentState });
        }
        else {
          this.updateTask(contract, buttonIdentifier, null, true);
        }
      }
      else if (newTask && action === 'add-special-clause') {
        clearInterval(interval);
        const compTskRes = await this.completeTask(newTask.id);
        if (compTskRes === 'error') {
          const currentState = this._decideCurrentState(newTask);
          this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, currentState });
          this.props.displayNotification('Task Completion error occured!', 'error');
        }
        else {
          this.updateTask(contract, buttonIdentifier, null, true);
        }
      }
      else if (newTask && action === 'change-crm') {
        clearInterval(interval);
        const compTskRes = await this.completeTask(newTask.id);
        if (compTskRes === 'error') {
          const currentState = this._decideCurrentState(newTask);
          this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, currentState });
          this.props.displayNotification('Task Completion error occured!', 'error');
        }
        else {
          this.updateTask(contract, buttonIdentifier);
        }
      }
      else if (newTask && action === 'upload-signed-document') {
        clearInterval(interval);
        const compTskRes = await this.completeTask(newTask.id);

        if (compTskRes === 'error') {
          const currentState = this._decideCurrentState(newTask);
          this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, currentState });
        } else {

          this.updateTask(contract, buttonIdentifier, null, true, true);
        }
      }
      else if (newTask !== null) {
        clearInterval(interval);

        if (shouldCallGetData) {
          this._resetToDefault(true);
          this.getData(contract.contractId);
        }
        const currentState = this._decideCurrentState(newTask);
        this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, currentState });
      }
      else if (isCompleted) {
        clearInterval(interval);

        if (shouldCallGetData) {
          this._resetToDefault(true);
          this.getData(contract.contractId);
        } else {
          const currentState = this._decideCurrentState(newTask);
          this.setState({ 'reviewTask': newTask, [buttonIdentifier]: false, currentState });
        }
      }
      else if (response === undefined) {
        clearInterval(interval);
        this.props.displayNotification('Error occured. Please Try again!', 'error');
        this._resetToDefault(true);
        this.getData(contract.contractId);
      }
    }, 2000);
  }

  onCancelEdit = () => {
    this.setState({ isEditing: false, isUploading: false });
  };

  downloadSignedPdf = () => {

    const pdf = this.state.selectedContract.pdfDocument;

    const element = document.createElement('a');
    element.setAttribute('href', pdf.dataUrl);
    element.setAttribute('download', pdf.fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  _disableButton = (btn) => {
    const isLoading = this.state.isRegenerating || this.state.isSentToStiply || this.state.currentState === currentStates.COMPLETED;
    let shouldDisable = isLoading;

    switch (btn) {
      case 'special-clause':
        shouldDisable = isLoading || this.state.currentState === currentStates.UPLOAD_CONTRACT;
        break;
      case 'send-to-stiply':
        shouldDisable = isLoading || this.state.currentState === currentStates.UPLOAD_CONTRACT;
        break;
      case 'connect-signed-doc':
        shouldDisable = isLoading || this.state.currentState === currentStates.APPROVE_CONTRACT;
        break;
      default:
        break;
    }

    return shouldDisable;
  }

  _createCamundaVariables = (object) => {
    const variable = {};

    if (object.contract.pdfDocument && Object.keys(object.contract.pdfDocument).length > 0) {
      variable['contractPdfDocument'] = {
        type: 'File',
        value: object.contract.pdfDocument.dataUrl.split('base64,')[1],
        valueInfo: {
          mimetype: object.contract.pdfDocument.type,
          filename: object.contract.pdfDocument.fileName,
          encoding: 'Base64',
        }
      };

      const docProperties = object.contract.pdfDocument;
      delete docProperties.dataUrl;

      variable['contractPdfDocumentProperties'] = {
        type: 'Json',
        value: JSON.stringify(docProperties)
      };

      delete object.contract.pdfDocument;
    }
    if (object.contract) {
      variable['contract'] = { type: 'Json', value: JSON.stringify(object.contract) };
    }
    if (object.isUpdateContract) {
      variable['isUpdateContract'] = { type: 'Boolean', value: object.isUpdateContract };
    }
    if (object.isGenerateContract) {
      variable['isGenerateContract'] = { type: 'Boolean', value: object.isGenerateContract };
    }
    if (object.reviewAction) {
      variable['reviewAction'] = { type: 'String', value: object.reviewAction };
    }
    return variable;
  }
  updateAndRegenerateContract = async (updateContractObj, isUpdateContract, isGenerateContract) => {

    const contract = cloneDeep(this.state.selectedContract);
    const task = this.state.reviewTask;
    const action = updateContractObj.specialClause ? 'add-special-clause' : 'upload-signed-document';
    const buttonIdentifier = action === 'upload-signed-document' ? 'isUploading' : null;

    const camundaVariables = this._createCamundaVariables({ contract: updateContractObj, isUpdateContract, isGenerateContract, reviewAction: action });

    const taskCompletionResponse = await this.completeTask(
      task.id,
      camundaVariables
    );

    if (taskCompletionResponse === 'error') {
      this.setState({ isEditing: false });
      return this.props.displayNotification('error occuered', 'error');
    }


    this.setState({ temporaryChanges: updateContractObj });

    this.updateTask(contract, buttonIdentifier, action);
  }

  viewError = async () => {
    const requestData = {
      processInstanceBusinessKey: this.state.contractId,
      processDefinitionKey: 'contract-management'
    };
    const logs = await this.props.searchProcess(requestData);

    this.setState({ viewError: true, logs });
  }

  isOriginFormTabsPath = () => { // DashboardTabConcept
    const url = window.location.pathname;
    const splitArray = url.split('/');
    const dashboardName = splitArray[splitArray.length - 1];
    if (dashboardName === 'Contract-Dashboard') return true;
    return false;
  }
  
  goToSpecificOrganization = async () => {

    this.setState({ isLoadingOrganizationUrl: true });
    try {
    
         const leandingResponse = await this.props.requestLendingOpportunity(this.state.selectedContract.contractId);
         const organizationId = leandingResponse.crmOrganizationRef;
        
         const organizationUrl = await this.props.generateOrganizationViewUrl(organizationId);
         if (organizationUrl) {
          const url = organizationUrl.url;
          window.open(url, '_blank');
          this.setState({ isLoadingOrganizationUrl: false });
      } else {
          throw new Error('Related account not found');
      }
     
    } catch (error) {
        console.error('goToSpecificOrganization error', error);
        throw new Error('Unexpected error occurred! Please try again.');
    }
};

  render() {
    const { classes } = this.props;
    const { downloadConfirmationContent, downloadConfirmationPopup } = this.state;
    const shouldDisplay = (!isNullOrEmpty(this.state.selectedContract.contractId));

    return (
      <div>
      <Loader open={this.state.isLoading} />

        <Notifier />
        {/* // DashboardTabConcept */}
        {!this.isOriginFormTabsPath() ? <div className={classes.header}>
          <Typography variant='h4' className={classes.headerTitle}>Contract Overview</Typography>
        </div> : false}
        {/* // DashboardTabConcept */}
        <div className={classes.content}>

          <GridContainer className={classes.flexContainer} >
            <GridItem className={classes.smallBox}>
              <CustomSearch
                placeholder="Search Contract Id"
                label="Contract Id"
                asyncSearchType="contract"
                name="contractId"
                value={this.state.contractId}
                onChange={this.onSearch}
                onSearchResult={this.handleOnContractSearchResult}
                SearchOptions={{
                  regexOption: 'i'
                }}
              />
            </GridItem>
            <GridItem className={classes.smallBox}>
              {shouldDisplay && <CustomInputBox
                label="Status"
                value={this.state.selectedContract?.status}
                readOnly
              />}
            </GridItem>
          </GridContainer>

          {shouldDisplay && <GridContainer>
            <GridItem className={classes.contractHTMLView}>{parse(this.state.selectedContract.html || '')}</GridItem>
            <GridItem className={classes.contractHtmlOptions}>
              {this.state.errors.length > 0 &&
                <Button
                  className={clx(classes.button, classes.errorBtn)}
                  onClick={this.viewError}
                >View Error</Button>
              }
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && 
                <Button
                  disabled={this._disableButton('change-crm') || this.state.isLoadingOrganizationUrl || this.state.isLoadingContract}
                  className={clx(classes.button, classes.buttonUpdateCRM)}
                  onClick={() => this.goToSpecificOrganization()}
                >Edit Organization {(this.state.isLoadingOrganizationUrl) && (<CircularProgress className={classes.buttonLoader} size={20} />)}</Button>}
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && <Link
                to={{
                  pathname: `${ENV.CRM_PORTAL_URL}/user/customerOverview`,
                  search: qs.stringify({
                    customerId: this.state.selectedContract.customerId,
                    source:'contractOverview'
                  })
                }}
                rel="noopener noreferrer"
                target='_blank'
              >
                <Button
                  disabled={this._disableButton('change-stakeholders') || this.state.isLoadingContract}
                  className={clx(classes.button, classes.buttonUpdateStakeholders)}
                >Edit Stakeholders</Button>
                </Link>} 
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && <Button
                disabled={this._disableButton('edit-contract') || this.state.isLoadingContract}
                className={clx(classes.button, classes.buttonEditContract)}
                // onClick={() => this.setState({ openEditContract: true })}
                onClick={() => this.reviewContract('edit-contract', 'btn-edit-contract')}
              >Edit Contract Details {this.state['btn-edit-contract'] && <CircularProgress className={classes.buttonLoader} size={20} />}</Button>}
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && <Button
                disabled={this._disableButton('special-clause') || this.state.isLoadingContract}
                className={clx(classes.button, classes.buttonEdit)}
                onClick={() => this.setState({ 'isEditing': !this.state.isEditing, 'updatingFileds': ['specialClause'] })}
              >Edit Special Clause</Button>}
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && <Button
                disabled={this._disableButton('regenerate') || this.state.isLoadingContract}
                className={clx(classes.button, classes.buttonRegenerate)}
                onClick={() => this.reviewContract('regenerate-contract', 'isRegenerating')}
              >Regenerate {(this.state.isRegenerating || this.state.isLoadingContract) && (<CircularProgress className={classes.buttonLoader} size={20} />)}</Button>}
              {(isUserHasPermission("Contract overview", ["Add", "Edit"])) && <Button
                disabled={this._disableButton('send-to-stiply') || this.state.isLoadingContract}
                className={clx(classes.button, classes.buttonSendToStiply)}
                onClick={this.checkCompleteContract}
              >Download {this.state.isSentToStiply && <CircularProgress className={classes.buttonLoader} size={20} />}</Button>}
              {isUserHasPermission("Contract overview", ["Add", "Edit"]) && this.state.reviewTask !== null && (
                <Button
                  disabled={this._disableButton('connect-signed-doc') || this.state.isLoadingContract}
                  className={clx(classes.button, classes.buttonUploadSignedDoc)}
                  onClick={() => this.setState({ 'isEditing': !this.state.isEditing, 'updatingFileds': ['pdfDocument'], 'isUploading': true })}
                >Connect Signed Contract {this.state.isUploading && <CircularProgress className={classes.buttonLoader} size={20} />}</Button>
              )}
              {isUserHasPermission("Contract overview", ["Add", "Edit"]) && this.state.selectedContract && this.state.selectedContract.pdfDocument && this.state.selectedContract.pdfDocument.dataUrl && (
                <Button
                  className={clx(classes.button, classes.buttonUploadSignedDoc)}
                  onClick={this.downloadSignedPdf}
                >Download Signed PDF</Button>
              )}
            </GridItem>
          </GridContainer>}
          {/* {shouldDisplay && <GridContainer>
          </GridContainer>} */}
        </div>

        <Dialog
          open={this.state.isEditing}
          maxWidth={'lg'}
          onClose={() => this.setState({ 'isEditing': false })}
        >
          <DialogContent>
            <EditContract
              contract={this.state.selectedContract}
              cancel={this.onCancelEdit}
              updatingFileds={this.state.updatingFileds}
              updateSpecialclause={this.updateAndRegenerateContract}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={this.state.viewError}
          maxWidth={'lg'}
          onClose={() => this.setState({ 'viewError': false, logs: [] })}
        >
          <DialogContent>
            <LogViewTable
              tableHeaderColor="gray"
              logViewData={this.state.logs}
              selectedId={this.state.contractId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ 'viewError': false, logs: [] })} className={classes.popupCloseButton}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          id="contract-download-dialog"
          open={downloadConfirmationPopup}
          aria-labelledby="alert-dialog-contract-download-confirm-dialog"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-contract-download-confirmation">
            {downloadConfirmationContent}
          </DialogTitle>
          <DialogActions>
            <Button variant='contained' id="cancel-download" onClick={this.closeDownloadPopup}>
              Cancel
            </Button>
            <Button variant='contained' color='secondary' id="download-contract" onClick={this.sendToStiply} >
              Continue download
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );

  }
}


ContractOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  history: PropTypes.array.isRequired,
  getContract: PropTypes.func.isRequired,
  searchProcess: PropTypes.func.isRequired,
  completeUserTask: PropTypes.func.isRequired,
  getCustomerDetails: PropTypes.func.isRequired,
  requestLendingOpportunity: PropTypes.func.isRequired,
  generateOrganizationViewUrl: PropTypes.func.isRequired,
  regenerateContract: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  getUserTaskFromWorkflow: PropTypes.func.isRequired,
  downloadUnsignedContract: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    isDashboardContent: state.user.isDashboardContent,
    importedLoanRequestContractId: state.lmglobal.importedLoanRequestContractId
  };
};

const mapDispatchToProps = (dispatch) => ({
  completeUserTask: (data) => dispatch(completeUserTask(data)),
  searchProcess: (requestQuery) => dispatch(searchProcess(requestQuery)),
  getCustomerDetails: (customerId) => dispatch(getCustomerDetails(customerId)),
  requestLendingOpportunity: (contractId) => dispatch(requestLendingOpportunity(contractId)),
  generateOrganizationViewUrl: (organizationId) => dispatch(generateOrganizationViewUrl(organizationId)),
  getContract: (contractId, fields) => dispatch(getContract({ contractId, fields })),
  downloadUnsignedContract: (contract) => dispatch(downloadUnsignedContract(contract)),
  displayNotification: (message, warning) => dispatch(displayNotification(message, warning)),
  regenerateContract: (smeLoanRequestProposalId) => dispatch(regenerateContract(smeLoanRequestProposalId)),
  getUserTaskFromWorkflow: (params) => dispatch(getUserTaskFromWorkflow(params)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(ContractOverview));