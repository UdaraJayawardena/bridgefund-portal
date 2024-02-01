import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import {
    KeyboardDatePicker,
    MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { getProcessDataList } from 'store/initiation/actions/ProcessDashboard.action';
import { getSmeLoanRequests, searchCustomer } from 'store/initiation/actions/BankAccount.action';

import style from "assets/jss/bridgefundPortal/views/pdCustomerOverviewStyle";
class StatusOverviewFilter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedProcessStatus: '',
            // selectedTaskStatus: 'ACTIVE',
            selectedStartDate: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            selectedEndDate: moment().format('YYYY-MM-DD'),
            selectedProcess: '',
            selectedTask: '',
            selectedTaskList: [],
        };
    }

    componentDidMount() {
        this.handleSearchedProcessDataList();
    }

    handleChange = (e) => {
        const { selectedTask } = this.state;
        if (e.target.name === 'selectedProcess') {

            if (selectedTask !== '') { // TODO
                this.setState({ selectedTaskList: e.target.value.userTasks, selectedProcess: e.target.value, selectedTask: '' }, () => this.handleSearchedProcessDataList());
            }
            else {// TODO
                this.setState({ selectedTaskList: e.target.value.userTasks, selectedProcess: e.target.value }, () => this.handleSearchedProcessDataList());
            }
        }
        else {
            this.setState({ [e.target.name]: e.target.value }, () => this.handleSearchedProcessDataList());
        }

    }

    cleanObject = (obj) => {
        for (const propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
                delete obj[propName];
            }
        }
        return obj;
    }

    handleSearchedProcessDataList = () => {
        const { pagination } = this.props;
        const { selectedProcessStatus, selectedTask, selectedProcess,
            selectedEndDate, selectedStartDate } = this.state;

        const reqObj = {
            // @ts-ignore
            processDefinitionKey: selectedProcess.key,
            taskDefinitionKey: selectedTask,
            processState: selectedProcessStatus,
            startedAfter: selectedProcessStatus === '' || selectedProcessStatus === 'COMPLETED' ? moment(selectedStartDate).format("YYYY-MM-DDTHH:mm:ss.SSSZZ") : '',
            startedBefore: selectedProcessStatus === '' || selectedProcessStatus === 'COMPLETED' ? moment(selectedEndDate).add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format("YYYY-MM-DDTHH:mm:ss.SSSZZ") : '',
        };
        this.props.getProcessDataList({ ...this.cleanObject(reqObj), ...{ ...pagination, page: 1 } });
        // console.log('reqObj ', reqObj);
    }

    handleDatePickers = event => {
        const value = moment(event.target.value).format('YYYY-MM-DD');
        if (moment(value).isValid()) {
            this.setState({ [event.target.name]: value }, () => this.handleSearchedProcessDataList());
        }
    };

    render() {

        const { classes, processStatusValues, processList, isLoadingProcessDataList, } = this.props;
        const { selectedProcessStatus, selectedProcess, selectedTaskList,
            selectedStartDate, selectedTask, selectedEndDate } = this.state;
        // console.log("state in render ", this.state);

        return (
            <div className={classes.container}>

                <GridContainer className={classes.flexContainer}>
                    <GridItem className={classes.smallBox}>
                        <FormControl variant="outlined" className={classes.searchBox}>
                            {selectedProcessStatus === '' || selectedProcessStatus === 'COMPLETED' ?
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        disableToolbar
                                        id="process-start-date"
                                        name="selectedStartDate"
                                        autoOk
                                        variant="inline"
                                        label="Period (Start Date) "
                                        format="DD-MM-YYYY"
                                        value={selectedStartDate}
                                        InputAdornmentProps={{ position: "start" }}
                                        onChange={date => this.handleDatePickers({ target: { value: date, name: 'selectedStartDate' } })}
                                        inputVariant="outlined"
                                        InputProps={{
                                            className: classes.inputProp
                                          }}
                                          InputLabelProps={{
                                            shrink: true,
                                            className: classes.inputLabel
                                          }}
                                    />
                                </MuiPickersUtilsProvider>
                                :
                                <TextField
                                    disabled
                                    id="outlined-disabled"
                                    label="Period (Start Date) "
                                    defaultValue="N/A"
                                    variant="outlined"
                                    className={classes.inputProp}
                                    InputProps={{
                                        className: classes.inputProp
                                      }}
                                      InputLabelProps={{
                                        shrink: true,
                                        className: classes.inputLabel
                                      }}
                                />}
                        </FormControl>
                    </GridItem>
                    <GridItem className={classes.smallBox}>
                        <FormControl size="small" variant="outlined" className={classes.searchBox}>
                            <InputLabel className={classes.inputLabel} id="process-select-label">{'Process'}</InputLabel>
                            <Select
                                labelId="process-select-label"
                                id="process-select"
                                name="selectedProcess"
                                value={selectedProcess}
                                onChange={this.handleChange}
                                label="Process"
                                fullWidth
                                className={classes.inputProp}
                                // disabled={isLoadingProcessDataList}
                            >
                                <MenuItem value="" className={classes.menuItem}>
                                    <em>All</em>
                                </MenuItem>
                                {processList && processList.map((process, index) => (
                                    <MenuItem className={classes.menuItem} key={index} value={process}>{process.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem className={classes.smallBox}>
                        <FormControl size="small" variant="outlined" className={classes.searchBox}>
                            <InputLabel className={classes.inputLabel} id="process-status-select-label">{'Status'}</InputLabel>
                            <Select
                                labelId="process-status-select-label"
                                id="process-status-select"
                                name="selectedProcessStatus"
                                value={selectedProcessStatus}
                                onChange={this.handleChange}
                                label="Status"
                                fullWidth
                                className={classes.inputProp}
                                // disabled={isLoadingProcessDataList}
                            >
                                <MenuItem value="" className={classes.menuItem}>
                                    <em>All</em>
                                </MenuItem>
                                {processStatusValues && processStatusValues.map((status, index) => (
                                    <MenuItem className={classes.menuItem} key={index} value={status.key}>{status.value}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </GridItem>
                </GridContainer>
                {/* ================ second row ========================= */}
                <GridContainer className={classes.flexContainer}>
                    <GridItem className={classes.smallBox}>
                        <FormControl size="small" variant="outlined" className={classes.searchBox}>
                            {selectedProcessStatus === '' || selectedProcessStatus === 'COMPLETED' ?
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        disableToolbar
                                        id="process-end-date"
                                        name="selectedEndDate"
                                        autoOk
                                        variant="inline"
                                        label="Period (End Date) "
                                        format="DD-MM-YYYY"
                                        value={selectedEndDate}
                                        InputAdornmentProps={{ position: "start" }}
                                        onChange={date => this.handleDatePickers({ target: { value: date, name: 'selectedEndDate' } })}
                                        inputVariant="outlined"
                                        InputProps={{
                                            className: classes.inputProp
                                          }}
                                          InputLabelProps={{
                                            shrink: true,
                                            className: classes.inputLabel
                                          }}
                                    />
                                </MuiPickersUtilsProvider> :
                                <TextField
                                    disabled
                                    id="outlined-disabled"
                                    label="Period (End Date) "
                                    defaultValue="N/A"
                                    variant="outlined"
                                    className={classes.inputProp}
                                    InputProps={{
                                        className: classes.inputProp
                                      }}
                                      InputLabelProps={{
                                        shrink: true,
                                        className: classes.inputLabel
                                      }}
                                />}
                        </FormControl>
                    </GridItem>
                    <GridItem className={classes.smallBox}>
                        <FormControl size="small" variant="outlined" className={classes.searchBox}>
                            <InputLabel className={classes.inputLabel} id="task-select-label">{'Task'}</InputLabel>
                            <Select
                                labelId="task-select-label"
                                id="task-select"
                                name="selectedTask"
                                value={selectedTask}
                                onChange={this.handleChange}
                                label="Task"
                                fullWidth
                                className={classes.inputProp}
                                // disabled={isLoadingProcessDataList}
                            >
                                <MenuItem value="" className={classes.menuItem}>
                                    <em>All</em>
                                </MenuItem>
                                {selectedTaskList && selectedTaskList.map((task, index) =>
                                    <MenuItem className={classes.menuItem} key={index} value={task.id}>{task.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </GridItem>
                    {/* <GridItem className={classes.smallBox}>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel id="task-status-select-label">{'Status'}</InputLabel>
                            <Select
                                labelId="task-status-select-label"
                                id="task-status-select"
                                name="selectedTaskStatus"
                                value={selectedTaskStatus}
                                onChange={this.handleChange}
                                label="Status"
                                fullWidth
                                // disabled={isLoadingProcessDataList}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                // {taskStatusValues && taskStatusValues.map((status, index) => (
								//		<MenuItem key={index} value={status.key}>{status.value}</MenuItem>
								//	))} 
                                {[{ key: 'ACTIVE', value: 'Active' }, { key: 'COMPLETED', value: 'Completed' }].map((status, index) => (
                                    <MenuItem key={index} value={status.key}>{status.value}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </GridItem> */}
                </GridContainer>
            </div>
        );
    }

}

StatusOverviewFilter.propTypes = {
    classes: PropTypes.object.isRequired,
    tabName: PropTypes.string.isRequired,
    processStatusValues: PropTypes.array,
    taskStatusValues: PropTypes.array,
    roles: PropTypes.array,
    processList: PropTypes.array,
    getProcessList: PropTypes.func,
    getProcessDataList: PropTypes.func,
    getSmeLoanRequests: PropTypes.func,
    searchCustomer: PropTypes.func,
    isLoadingProcessDataList: PropTypes.bool,
    pagination: PropTypes.object,
};


const mapStateToProp = (state) => ({
    processStatusValues: state.processDashboard.processStatusValues,
    taskStatusValues: state.processDashboard.taskStatusValues,
    roles: state.processDashboard.roles,
    processList: state.processDashboard.processList,
    isLoadingProcessDataList: state.processDashboard.isLoadingProcessDataList,
    pagination: state.processDashboard.processDataListPagination,
});

const mapDispatchToProps = (dispatch) => ({
    getProcessDataList: (requestQuery) => dispatch(getProcessDataList(requestQuery)),
    getSmeLoanRequests: (requestQuery) => dispatch(getSmeLoanRequests(requestQuery)),
    searchCustomer: (key, value, criteria, customerId, options) => dispatch(searchCustomer(key, value, criteria, customerId, options)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(StatusOverviewFilter));