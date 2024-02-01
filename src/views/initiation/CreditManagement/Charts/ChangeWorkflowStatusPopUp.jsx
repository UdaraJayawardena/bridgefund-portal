import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Button, DialogActions, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, TableContainer, Paper, CircularProgress } from '@material-ui/core';
import style from 'assets/jss/bridgefundPortal/views/crmChartsStyle';
import { displayNotification } from "store/initiation/actions/Notifier";
import { changeProcessStepBackwardOrForward, getProcessDefinitionsSequenceFlow } from 'store/initiation/actions/CreditRiskOverview.action';

const ProcessUpdateTypes = {
    BACKWARD: 'BACKWARD',
    FORWARD: 'FORWARD',
    ERROR_BOUNDARY: 'ERROR_BOUNDARY',
};
class ChangeWorkflowStatusPopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedTask: this.props.workflowData.selectedTask ? this.props.workflowData.selectedTask : '',
            selectedTaskIdList: [],
            processDetails: null,
            isLoadingUpdateProcess: false,
            variables: {}
        };
    }
    componentDidMount() {
        //need to get all the related tasks according to the process-id unless task list is not provided
        const { workflowData } = this.props;
        const reqObj = {
            processInstanceBusinessKey: workflowData.processId,
            processDefinitionKey: workflowData.process.toLowerCase(),
            sequenceType: workflowData.statusChangeType,
            tenantId: workflowData.tenantId
        };


        this.props.getProcessDefinitionsSequenceFlow(reqObj)
            .then(res => {

                this.setState({ processDetails: res });// to set the task Data

                if (this.props.workflowData.selectedTaskIdList.length === 0) {

                    this.setState({
                        selectedTaskIdList: res.sequenceFlow,
                    });

                    if (res.sequenceFlow && res.sequenceFlow.length === 1)
                        this.setState({ selectedTask: res.sequenceFlow[0].id });
                }
                if (this.props.workflowData.selectedTaskIdList.length > 0) {

                    this.setState({
                        selectedTaskIdList: res.sequenceFlow.filter(task => {
                            return this.props.workflowData.selectedTaskIdList.includes(task.id);
                        })
                    });

                    if (res.sequenceFlow && res.sequenceFlow.length === 1)
                        this.setState({ selectedTask: res.sequenceFlow[0].id });
                }
            })
            .catch(e => console.log('err getProcessDefinitionsSequenceFlow ', e));
    }

    handleChange = (e) => {
        const { workflowData } = this.props;
        const variables = workflowData.variables;
        const value = e.target.value

        if(variables && value in variables) this.setState({ variables: variables[value] });
        this.setState({ [e.target.name]: value });
    }

    handleChangeWorkflowStatus = () => {
        const { selectedTask, processDetails, selectedTaskIdList, variables } = this.state;
        const { workflowData, handleRefreshOriginData, handleProcessSelectionFromParent } = this.props;

        if (selectedTask === null || selectedTask === undefined || selectedTask === '') {
            this.props.displayNotification('No Task Selected To Change !', 'warning');
            return;
        }
        if (processDetails === null || selectedTask === undefined) {
            this.props.displayNotification('Active Process Instance Not Found !', 'warning');
            return;
        }
        if (selectedTaskIdList.length === 0) {
            this.props.displayNotification('Active Process Instance Not Found !', 'warning');
            return;
        }

        this.setState({ isLoadingUpdateProcess: true });
        const requestBody = {
            "processInstanceId": processDetails.activeProcessInstance.id,
            "sequenceType": workflowData.statusChangeType,
            "activeActivityId": processDetails.activeActivityInstance.activityId,
            "newActiveActivityId": selectedTask,
        };

        if (Object.keys(variables).length > 0) requestBody.variables = variables;
        this.props.changeProcessStepBackwardOrForward(requestBody)
            .then(res => {
                if (res === 'ok') {
                    this.setState({ isLoadingUpdateProcess: false });
                    this.props.displayNotification('Process Status Updated Successfully !', 'success');
                    this.props.handleChangeWorkflowStatusDialog();
                    if (handleProcessSelectionFromParent) {
                        handleProcessSelectionFromParent(selectedTask);
                    }
                    if (handleRefreshOriginData) {
                        handleRefreshOriginData();
                    }
                }
            })
            .catch(e => {
                this.setState({ isLoadingUpdateProcess: false });
                console.log('err changeProcessStepBackwardOrForward ', e);
            });
    }

    componentWillUnmount() {
        const state = {
            selectedTask: '',
            selectedTaskIdList: [],
            processDetails: null,
            isLoadingUpdateProcess: false,
        };
        this.setState(state);
    }

    getSetProcessLabel = (statusChangeType) => {
        if (statusChangeType === ProcessUpdateTypes.BACKWARD) return 'Set Process Back To ';
        if (statusChangeType === ProcessUpdateTypes.FORWARD) return 'Set Process Forward To ';
        if (statusChangeType === ProcessUpdateTypes.ERROR_BOUNDARY) return 'Set Process Next To ';
        return 'Change Process Step to ';
    }

    render() {
        const { classes, workflowData } = this.props;
        const { selectedTask, selectedTaskIdList, isLoadingUpdateProcess } = this.state;
        // console.log('popUp state in render ', this.state);
        return (
            <>
                <DialogContent>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead className={classes.tableHeadColor}>
                                <TableRow >
                                    <TableCell className={classes.tableCell} colSpan={2} align="center"><b>Change Workflow Status</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow >
                                    <TableCell className={`${classes.tableCell} ${classes.rightBorderCell}`} align="left">{'Process ID'}</TableCell>
                                    <TableCell className={classes.tableCell} align="left">
                                        <TextField
                                            InputProps={{
                                                className: classes.autoSuggestTextStyle,
                                                readOnly: true
                                            }}
                                            InputLabelProps={{
                                                className: classes.autoSuggestTextLabelStyle,
                                                shrink: true,
                                            }}
                                            id="process-id"
                                            value={workflowData.processId || ''}
                                            fullWidth
                                            disabled
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell className={`${classes.tableCell} ${classes.rightBorderCell}`} align="left">{'Process'}</TableCell>
                                    <TableCell className={classes.tableCell} align="left">
                                        <TextField
                                            InputProps={{
                                                className: classes.autoSuggestTextStyle,
                                                readOnly: true
                                            }}
                                            InputLabelProps={{
                                                className: classes.autoSuggestTextLabelStyle,
                                                shrink: true,
                                            }}
                                            id="process"
                                            value={workflowData.process || ''}
                                            fullWidth
                                            disabled
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={`${classes.tableCell} ${classes.rightBorderCell}`} align="left">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="left">&nbsp;</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={`${classes.tableCell} ${classes.rightBorderCell}`} align="left" >
                                        {this.getSetProcessLabel(workflowData.statusChangeType)}
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="left">
                                        <TextField
                                            InputProps={{
                                                className: classes.autoSuggestTextStyle,
                                            }}
                                            InputLabelProps={{
                                                className: classes.autoSuggestTextLabelStyle,
                                                shrink: true,
                                            }}
                                            id="select-task"
                                            select
                                            fullWidth
                                            name="selectedTask"
                                            value={selectedTask}
                                            onChange={this.handleChange}
                                            disabled={selectedTaskIdList && selectedTaskIdList.length === 1}>
                                            <MenuItem className={classes.menuItem} value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {selectedTaskIdList && selectedTaskIdList.map((task, index) =>
                                                <MenuItem className={classes.menuItem} key={index} value={task.id}>{task.name}</MenuItem>
                                            )}
                                        </TextField>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell className={`${classes.tableCell} ${classes.rightBorderCell}`} align="left">&nbsp;</TableCell>
                                    <TableCell className={classes.tableCell} align="left">&nbsp;</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button disabled={isLoadingUpdateProcess} variant='contained' onClick={this.props.handleChangeWorkflowStatusDialog} className={classes.defaultIconButton}>
                        Back
                    </Button>
                    <Button disabled={isLoadingUpdateProcess} variant='contained' onClick={this.handleChangeWorkflowStatus} className={classes.addIconButton}>
                        {isLoadingUpdateProcess ? <CircularProgress style={{ color: 'white' }} size={15} thickness={3} /> : 'Process'}
                    </Button>
                </DialogActions>
            </>
        );
    }

}

ChangeWorkflowStatusPopUp.propTypes = {
    classes: PropTypes.object.isRequired,
    workflowData: PropTypes.object,
    getProcessDefinitionsSequenceFlow: PropTypes.func,
    displayNotification: PropTypes.func,
    handleChangeWorkflowStatusDialog: PropTypes.func,
    changeProcessStepBackwardOrForward: PropTypes.func,
    handleRefreshOriginData: PropTypes.func,
    handleProcessSelectionFromParent: PropTypes.func
};

ChangeWorkflowStatusPopUp.defaultProps = {
    workflowData: { selectedTaskIdList: [] },
};

const mapStateToProp = (/* state */) => ({

});

const mapDispatchToProps = (dispatch) => ({
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    getProcessDefinitionsSequenceFlow: (requestQuery) => dispatch(getProcessDefinitionsSequenceFlow(requestQuery)),
    changeProcessStepBackwardOrForward: (requestBody) => dispatch(changeProcessStepBackwardOrForward(requestBody)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(ChangeWorkflowStatusPopUp));