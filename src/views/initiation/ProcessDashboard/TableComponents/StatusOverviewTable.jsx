import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import ReactJson from 'react-json-view';
import LoadingOverlay from 'react-loading-overlay';
import withStyles from '@material-ui/core/styles/withStyles';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography, TablePagination } from '@material-ui/core';
import SwapVertSharpIcon from '@mui/icons-material/SwapVertSharp';
import Tooltip from '@mui/material/Tooltip';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';

import { clearProcessDataList, getProcessDataList, getTasksList } from 'store/initiation/actions/ProcessDashboard.action';
import { displayNotification } from "store/initiation/actions/Notifier";
import { getCustomerDetails } from 'store/initiation/actions/BankAccount.action';
import { stableSort, getSorting, EURO } from 'lib/initiation/utility';
import Memo from '../Memo';
import ENV from '../../../../config/env';
import style from "assets/jss/bridgefundPortal/views/pdCustomerOverviewStyle";
import ChangeWorkflowStatusPopUp from 'views/initiation/CreditManagement/Charts/ChangeWorkflowStatusPopUp';


const ProcessUpdateTypes = {
	BACKWARD: 'BACKWARD',
	FORWARD: 'FORWARD',
	ERROR_BOUNDARY: 'ERROR_BOUNDARY',
};

const BackwordAprovedProcesses = ["revision-flex-loan", "loan-initiation"];
const AuthorizedUserTypes = ["CSM", "IT developer", "Finance & Risk manager"];
class StatusOverviewTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenMemoDialog: false,
            memoData: {
                customer: '',
                processName: '',
                processKey: '',
                taskKey: '',
                taskName: '',
            },
            expandedProcessIndex: null,
            openErrorLogDialog: false,
            errorLog: null,
            order: "desc",
            orderBy: "startTime",
            workflowData: {},
            isOpenChangeWorkflowStatusDialog: false,
        };
    }

    handleRequestSort = (property, event) => {
        const { pagination, processDataListQuery } = this.props;
        const orderBy = property;
        let order = "desc";
        if (this.state.orderBy === property && this.state.order === "desc") {
            order = "asc";
        }

        this.setState({ order, orderBy }, () => this.props.getProcessDataList({ ...processDataListQuery, ...pagination, sortOrder: order, sortBy: orderBy, page: pagination.page + 1 }));
    };

    getVariableFromVariableList = (varList, varName) => {
        const v = varList.find(v => v.name === varName);
        if (v) {
            if (v.type === 'String') return v.value;

            if (v.type === 'Integer' || v.type === 'Double') return EURO(v.value);
        }
        return '-';
    }

    setMemoData = (task) => {

        let customerSysId = this.getVariableFromVariableList(task.variableInstanceList, 'customerSysId');
        const customerLegalName = this.getVariableFromVariableList(task.variableInstanceList, 'customerLegalName');
        const contractId = task.variableInstanceList.find(variable => variable.name === 'contractId') ?
            this.getVariableFromVariableList(task.variableInstanceList, 'contractId') :
            this.getVariableFromVariableList(task.variableInstanceList, 'smeLoanRequestContractId');
        // console.log({ customerSysId, customerLegalName, contractId });

        if (customerSysId !== '-' && customerLegalName !== '-' && contractId !== '-') {

            this.setState({
                memoData: {
                    customer: customerSysId,
                    customerLegalName,
                    contractId,
                    processName: task.processDefinitionName,
                    processKey: task.processDefinitionKey,
                    taskKey: task.taskDefinitionKey ? task.taskDefinitionKey : '',
                    taskName: task.name,
                }
            }, () => { this.handleMemoDialog(); });
            return;
        }
        if (customerSysId === '-' && customerLegalName !== '-' && contractId !== '-') {

            this.props.getCustomerDetails({ legalName: customerLegalName })
                .then(res => {

                    // console.log('res ', res);
                    customerSysId = res.customer._id;

                    this.setState({
                        memoData: {
                            customer: customerSysId,
                            customerLegalName,
                            contractId,
                            processName: task.processDefinitionName,
                            processKey: task.processDefinitionKey,
                            taskKey: task.taskDefinitionKey ? task.taskDefinitionKey : '',
                            taskName: task.name,
                        }
                    }, () => { this.handleMemoDialog(); });
                })
                .catch(e => console.log('error in get customer detail for memo ', e));
            return;
        }

        this.props.displayNotification('No customer or contractId exists to add memo !', 'warning');
    }

    handleProcessRowExpanding = (index) => {
        const { expandedProcessIndex } = this.state;
        if (expandedProcessIndex === index) {
            this.setState({ expandedProcessIndex: null });
        } else {
            this.setState({ expandedProcessIndex: index });
        }

    }

    handleMemoDialog = () => {
        this.setState({ isOpenMemoDialog: !this.state.isOpenMemoDialog });
    }

    handleErrorLogDialog = () => {
        this.setState((prevState) => {
            return {
                openErrorLogDialog: !prevState.openErrorLogDialog,
            };
        });
    }

    setErrorLogDialogData = (errorLogs) => {
        // console.log({ errorLogs });
        this.setState({ errorLog: errorLogs }, () => this.handleErrorLogDialog());
    }

    getAssignee = (assignee) => {

        if (!assignee) return '-';

        const systemUsers = ENV.SYSTEM_USERS;

        if (systemUsers && systemUsers.includes(assignee)) return 'System';

        return assignee;
    }

    handleChangePage = (event, page) => {
        const { pagination, processDataListQuery } = this.props;
        this.props.getProcessDataList({ ...processDataListQuery, ...{ ...pagination, page: page + 1 } });
        // console.log('page ', page);
    };

    handleChangeRowsPerPage = (e) => {
        const { pagination, processDataListQuery } = this.props;
        this.props.getProcessDataList({ ...processDataListQuery, ...{ ...pagination, perPage: +e.target.value, page: 1 } });
        // console.log('rowsPerPage ', e.target.value);
    }

    handleModifyAction = ( event, originalTask ) => {

     event.stopPropagation();
     this.setWorkflowStatusChangeData(originalTask, ProcessUpdateTypes.BACKWARD);
    }

    setWorkflowStatusChangeData = (task, statusChangeType) => {
     const workflowData = {
      process: task.processDefinitionKey,
      processId: task.businessKey,
      selectedTaskIdList: [],
      statusChangeType: statusChangeType,
      tenantId: 'LI',
     };
   
     this.setState({ workflowData }, () => this.handleChangeWorkflowStatusDialog());
    }

    handleChangeWorkflowStatusDialog = () => {
     this.setState({ isOpenChangeWorkflowStatusDialog: !this.state.isOpenChangeWorkflowStatusDialog });
    }

    render() {
        const { classes, searchedProcessDataList, isLoadingProcessDataList, pagination, myTaskListQuery } = this.props;
        const { isOpenMemoDialog, memoData, expandedProcessIndex, openErrorLogDialog, errorLog, order, orderBy,
          isOpenChangeWorkflowStatusDialog, workflowData } = this.state;
        return (
            <>

                <GridContainer>
                    <GridItem md={12}>
                        <Typography variant="subtitle1" className={classes.taskCount} gutterBottom>
                            {'Number of Tasks : ' + pagination.totalCount}
                        </Typography>

                        <TableContainer component={Paper} className={classes.tableContainer}>
                            <LoadingOverlay
                                // @ts-ignore
                                id="loader-overlay"
                                active={isLoadingProcessDataList}
                                spinner
                                text='Loading Processes...'>
                                <Table className={classes.table} aria-label="simple table">
                                    <TableHead className={classes.tableHeadColor}>
                                        <TableRow >
                                            <TableCell className={classes.tableCell}>Customer</TableCell>
                                            <TableCell className={classes.tableCell}>Contract</TableCell>
                                            <TableCell className={classes.tableCell}>Process</TableCell>
                                            <TableCell className={classes.tableCell}>Status</TableCell>
                                            <TableCell className={classes.tableCell}>Task</TableCell>
                                            <TableCell className={classes.tableCell}>Status</TableCell>
                                            <TableCell className={classes.tableCell}>Memo</TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <TableSortLabel
                                                    active={orderBy === 'startTime'}
                                                    // @ts-ignore
                                                    direction={order}
                                                    onClick={this.handleRequestSort.bind(this, 'startTime')}>
                                                    Started</TableSortLabel>
                                            </TableCell>
                                            <TableCell className={classes.tableCell}>Ended</TableCell>
                                            <TableCell className={classes.tableCell}>User</TableCell>
                                            <TableCell className={classes.tableCell}>Parameter-3</TableCell>
                                            <TableCell className={classes.tableCell}>Parameter-4</TableCell>
                                            <TableCell className={classes.tableCell}>Parameter-5</TableCell>
                                            <TableCell className={classes.tableCell}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {searchedProcessDataList.length === 0 ?

                                            <TableRow>
                                                <TableCell className={classes.tableCell} align="center" colSpan={13}>
                                                    {'No Processes to show'}
                                                </TableCell>
                                            </TableRow>

                                            :

                                            searchedProcessDataList.map((process, index) =>
                                                <React.Fragment>
                                                    <TableRow key={index} onClick={(e) => { this.handleProcessRowExpanding(index); }}
                                                        className={index === expandedProcessIndex ? classes.selectedRow : classes.clickableRow}>
                                                        <TableCell className={classes.tableCell} >{
                                                            this.getVariableFromVariableList(process.variableInstanceList, 'customerLegalName')
                                                        }</TableCell>
                                                        <TableCell className={classes.tableCell} >{
                                                            process.variableInstanceList.find(variable => variable.name === 'contractId') ?
                                                                this.getVariableFromVariableList(process.variableInstanceList, 'contractId') :
                                                                this.getVariableFromVariableList(process.variableInstanceList, 'smeLoanRequestContractId')
                                                        }</TableCell>
                                                        <TableCell className={classes.tableCell} >{process.processDefinitionKey}</TableCell>
                                                        <TableCell className={classes.tableCell} >{process.state}</TableCell>
                                                        <TableCell className={classes.tableCell} >&nbsp;</TableCell>
                                                        <TableCell className={classes.tableCell} >&nbsp;</TableCell>
                                                        <TableCell className={classes.tableCell} >
                                                            <IconButton size="small" aria-label="memo-button" onClick={(e) => {
                                                                e.stopPropagation();
                                                                this.setMemoData(process);
                                                            }}>
                                                                <EditTwoToneIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell className={classes.tableCell} >{moment(process.startTime).format('DD:MM:YYYY HH:mm:ss')}</TableCell>
                                                        <TableCell className={classes.tableCell} >{moment(process.endTime).isValid() ? moment(process.endTime).format('DD:MM:YYYY HH:mm:ss') : '-'}</TableCell>
                                                        <TableCell className={classes.tableCell} >{process.startUserId ? this.getAssignee(process.startUserId) : '-'}</TableCell>
                                                        <TableCell className={classes.tableCell}>{this.getVariableFromVariableList(process.variableInstanceList, 'customerLegalForm')}</TableCell>
                                                        <TableCell className={classes.tableCell}>{this.getVariableFromVariableList(process.variableInstanceList, 'loanType')}</TableCell>
                                                        <TableCell className={classes.tableCell}>{this.getVariableFromVariableList(process.variableInstanceList, 'loanAmount')}</TableCell>
                                                        <TableCell className={classes.tableCell} >
                                                         {
                                                          (process.processDefinitionKey === "revision-flex-loan" || 
                                                          process.processDefinitionKey === "loan-initiation") && process.state === "ACTIVE" ?
                                                           <Tooltip title="Modify">
                                                             <IconButton size="small" onClick={(event) => this.handleModifyAction( event, process )}
                                                               style={{ backgroundColor: "#24c4d8", color:"#fff" }} >
                                                               <SwapVertSharpIcon />
                                                              </IconButton>
                                                           </Tooltip> :
                                                           <Tooltip title="Modify">
                                                           <IconButton size="small" disabled="true"
                                                             style={{ backgroundColor: "#a2e3e8", color:"#fff" }} >
                                                             <SwapVertSharpIcon />
                                                            </IconButton>
                                                         </Tooltip>
                                                         }
                                                         </TableCell>
                                                    </TableRow>
                                                    {expandedProcessIndex === index ?
                                                        process.activityInstanceList && process.activityInstanceList.map((task, taskIndex) =>

                                                            <TableRow key={taskIndex} >
                                                                <TableCell className={classes.tableCell} >{
                                                                    this.getVariableFromVariableList(process.variableInstanceList, 'smeLoanRequestContractId')
                                                                }</TableCell>
                                                                <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                                                <TableCell className={classes.tableCell} component="th" scope="row">	&nbsp;</TableCell>
                                                                <TableCell className={classes.tableCell} >{process.state}</TableCell>
                                                                <TableCell className={classes.tableCell}>{task.activityName}</TableCell>
                                                                <TableCell className={classes.tableCell}>{task.state === 'ERROR' ?
                                                                    <Chip variant="outlined" label="View Error" onClick={() => this.setErrorLogDialogData(task.logList)} color="secondary" size="small" />
                                                                    : task.state}</TableCell>
                                                                <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                                                <TableCell className={classes.tableCell}>{moment(task.startTime).isValid() ? moment(task.startTime).format('DD:MM:YYYY HH:mm:ss') : '-'}</TableCell>
                                                                <TableCell className={classes.tableCell}>{moment(task.endTime).isValid() ? moment(task.endTime).format('DD:MM:YYYY HH:mm:ss') : '-'}</TableCell>
                                                                <TableCell className={classes.tableCell}>{task.assignee ? this.getAssignee(task.assignee) : '-'}</TableCell>
                                                                <TableCell className={classes.tableCell}>{'-'}</TableCell>
                                                                <TableCell className={classes.tableCell}>{'-'}</TableCell>
                                                                <TableCell className={classes.tableCell}>{'-'}</TableCell>
                                                                <TableCell className={classes.tableCell}></TableCell>
                                                            </TableRow>

                                                        )
                                                        :
                                                        false
                                                    }
                                                </React.Fragment>)
                                        }
                                    </TableBody>
                                </Table>
                            </LoadingOverlay>
                        </TableContainer>
                        <TablePagination
                            id="table-pagination-bottom"
                            rowsPerPageOptions={[5, 10, 25, 100]}
                            component="div"
                            count={pagination.totalCount}
                            rowsPerPage={pagination.perPage}
                            page={pagination.page}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        />
                    </GridItem>
                </GridContainer>

                {/* ==================== memo dialog stuff =============== */}

                <Dialog
                    open={isOpenMemoDialog}
                    onClose={this.handleMemoDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                >
                    <Memo memoData={memoData} handleMemoDialog={this.handleMemoDialog} />
                </Dialog>

                {/* ============= error log view dialog ================= */}

                <Dialog open={openErrorLogDialog} onClose={this.handleErrorLogDialog} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-details">
                    <DialogTitle id="bank-details-title">Error Logs</DialogTitle>
                    <DialogContent>
                        {
                            errorLog ?
                                <ReactJson
                                    displayDataTypes={false}
                                    enableClipboard={false}
                                    src={errorLog} />
                                : null
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleErrorLogDialog} >Close</Button>
                    </DialogActions>
                </Dialog>
                < Dialog
                   open={isOpenChangeWorkflowStatusDialog}
                   onClose={this.handleChangeWorkflowStatusDialog}
                   aria-labelledby="alert-dialog-title"
                   aria-describedby="alert-dialog-description"
                   fullWidth
                  >
                   <ChangeWorkflowStatusPopUp
                    workflowData={workflowData}
                    handleChangeWorkflowStatusDialog={this.handleChangeWorkflowStatusDialog}
                    handleRefreshOriginData={() => this.props.getTasksList({ ...myTaskListQuery, ...pagination })} 
                    />
                 </Dialog >
            </>
        );
    }

    componentWillUnmount() {
        this.props.clearProcessDataList();
    }
}

StatusOverviewTable.propTypes = {
    classes: PropTypes.object.isRequired,
    searchedProcessDataList: PropTypes.array.isRequired,
    clearProcessDataList: PropTypes.func,
    getCustomerDetails: PropTypes.func,
    displayNotification: PropTypes.func,
    isLoadingProcessDataList: PropTypes.bool,
    getProcessDataList: PropTypes.func,
    getTasksList: PropTypes.func,
};

const mapStateToProp = (state) => ({
    searchedProcessDataList: state.processDashboard.searchedProcessDataList,
    isLoadingProcessDataList: state.processDashboard.isLoadingProcessDataList,
    processDataListQuery: state.processDashboard.processDataListQuery,
    pagination: state.processDashboard.processDataListPagination,
});

const mapDispatchToProps = (dispatch) => ({
    getCustomerDetails: (requestQuery) => dispatch(getCustomerDetails(requestQuery)),
    clearProcessDataList: () => dispatch(clearProcessDataList()),
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    getProcessDataList: (requestQuery) => dispatch(getProcessDataList(requestQuery)),
    getTasksList: (requestQuery) => dispatch(getTasksList(requestQuery)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(StatusOverviewTable));