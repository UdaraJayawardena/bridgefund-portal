import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';

import { getTasksList, getCamundaUsersForSelectMenu, getRolesForSelectMenu, handleTaskDataListLoading } from 'store/initiation/actions/ProcessDashboard.action';
import ENV from '../../../../config/env';

import style from "assets/jss/bridgefundPortal/views/pdMyTaskListStyle";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const systemUsers = ENV.SYSTEM_USERS;
class MyTasksListFilter extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedProcessStatus: '',
			selectedTaskStatus: 'ACTIVE',
			selectedRole: '',
			selectedUser: '',
			selectedUsers: [],
			selectedProcess: '',
			selectedContractId: '',
			selectedTask: '',
			selectedTaskList: [],
			legalName: '',
		};
	}

	componentDidMount() {

		this.props.handleTaskDataListLoading(true);
		const logedInRole = sessionStorage.getItem('role');
		this.props.getRolesForSelectMenu()
			.then(res => {
				const roleObj = res.find(role => role.name === logedInRole);
				this.setState({ selectedRole: roleObj.id });
			})
			.then(() => this.props.getCamundaUsersForSelectMenu()
				.then((res) => {
					this.setState({ selectedUsers: res });
					this.handleSearchedTaskDataList();
				}))
			.catch(err => {
				console.log("get users or roles error ", err);
				this.props.handleTaskDataListLoading(false);
			});
	}

	handleChange = (e) => {

		const { selectedTask, selectedRole } = this.state;
		const name = e.target.name;
		const value = e.target.value;

		if (name === 'selectedProcess') {
			// console.log("e.target.value ", e.target.value);
			if (selectedTask !== '') {
				this.setState({ selectedTaskList: value.userTasks, selectedProcess: value, selectedTask: '' }, () => this.handleSearchedTaskDataList());
			}
			else {
				this.setState({ selectedTaskList: value.userTasks, selectedProcess: value }, () => this.handleSearchedTaskDataList());
			}
		}
		if (name === 'selectedRole') {

			if (selectedRole !== '') {
				this.setState({ selectedUsers: this.getUsersForSelectedRole(value), selectedRole: value }, () => this.handleSearchedTaskDataList());
			}
			else {
				this.setState({ selectedRole: value, selectedUser: '', selectedUsers: this.props.users }, () => this.handleSearchedTaskDataList());
			}
		}
		else {
			this.setState({ [name]: value }, () => this.handleSearchedTaskDataList());
		}

	}

	getUsersForSelectedRole = (roleId) => {
		const roleName = this.props.roles.find(role => role.id === roleId);
		if (roleName && roleName.name)
			return this.props.users.filter(user => user.role.toUpperCase() === roleName.name.toUpperCase());
		return this.props.users;
	}

	cleanObject = (obj) => {
		// console.log("obj ", obj);
		for (const propName in obj) {
			if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
				delete obj[propName];
			}
		}

		return obj;
	}

	handleSearchedTaskDataList = () => {
		// console.log("in action call");
		const { pagination } = this.props;
		const { selectedProcessStatus, selectedTaskStatus, selectedRole, selectedUser, selectedProcess, selectedTask } = this.state;

		const reqObj = {
			// @ts-ignore
			processDefinitionKey: selectedProcess.key,
			taskDefinitionKey: selectedTask,
			taskHadCandidateGroup: selectedRole,
			taskHadCandidateUser: selectedUser,
			// taskHadCandidateUser: selectedUser,
			processState: selectedProcessStatus,
			taskState: selectedTaskStatus
		};

		this.props.getTasksList({ ...this.cleanObject(reqObj), ...{ ...pagination, page: 1 } });
	}

	handleCustomerSearchResult = (result) => {
		if (result && typeof result !== 'string') {
			// this.setState({ legalName: result.legalName });
			console.log(result);
		}
	};

	handleSearchChange = (name, value) => {
		this.setState({ [name]: value });
	}

	render() {

		const { classes, processStatusValues, taskStatusValues, roles, processList, isLoadingTaskDataList } = this.props;
		const { selectedProcessStatus, selectedTaskStatus, selectedRole, selectedUsers, selectedUser, selectedProcess, selectedTaskList, selectedTask } = this.state;
		// console.log("selectedRole in render ", selectedRole);

		return (

			<div>
				{/* ============ first row ====================== */}
				<GridContainer className={classes.flexContainer} >
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
							<InputLabel className={classes.inputLabel} id="role-select-label">{'Role'}</InputLabel>
							<Select
								labelId="role-select-label"
								id="role-select"
								name="selectedRole"
								value={selectedRole}
								onChange={this.handleChange}
								label="Role"
								// label="User / Role"
								fullWidth
								// disabled={isLoadingTaskDataList}
								className={classes.inputProp}
							>
								<MenuItem value="" className={classes.menuItem}>
									<em>All</em>
								</MenuItem>
								{roles && roles.map((role, index) => (
									<MenuItem key={index} value={role.id} className={classes.menuItem}>{role.name}</MenuItem>
								))}
							</Select>
						</FormControl>
					</GridItem>
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
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
							// disabled={isLoadingTaskDataList}
							>
								<MenuItem value="" className={classes.menuItem}>
									<em>All</em>
								</MenuItem>
								{processList && processList.map((process, index) => (
									<MenuItem key={index} value={process} className={classes.menuItem}>{process.name}</MenuItem>
								))}
							</Select>
						</FormControl>
					</GridItem>
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
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
							// disabled={isLoadingTaskDataList}
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
				</GridContainer >
				{/* ================ second row ========================= */}
				<GridContainer className={classes.flexContainer}>
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
							<InputLabel className={classes.inputLabel} id="user-select-label">{'User'}</InputLabel>
							<Select
								labelId="user-select-label"
								id="user-select"
								name="selectedUser"
								value={selectedUser}
								onChange={this.handleChange}
								label="User"
								fullWidth
								className={classes.inputProp}
							// disabled={isLoadingTaskDataList}
							>
								<MenuItem value="" className={classes.menuItem}>
									<em>All</em>
								</MenuItem>
								{selectedUsers && selectedUsers.map((user, index) => (
									<MenuItem className={classes.menuItem} key={index} value={user.username} disabled={systemUsers && systemUsers.includes(user.username)}>{`${user.firstname} ${user.lastname}`}</MenuItem>
								))}
							</Select>
						</FormControl>
					</GridItem>
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
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
							// disabled={isLoadingTaskDataList}
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
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.formControl}>
							<InputLabel className={classes.inputLabel} id="task-status-select-label">{'Status'}</InputLabel>
							<Select
								labelId="task-status-select-label"
								id="task-status-select"
								name="selectedTaskStatus"
								value={selectedTaskStatus}
								onChange={this.handleChange}
								label="Status"
								fullWidth
								className={classes.inputProp}
							// disabled={isLoadingTaskDataList}
							>
								<MenuItem value="" className={classes.menuItem}>
									<em>All</em>
								</MenuItem>
								{/* {taskStatusValues && taskStatusValues.map((status, index) => (
										<MenuItem key={index} value={status.key}>{status.value}</MenuItem>
									))} */}
								{[{ key: 'ACTIVE', value: 'Active' }, { key: 'COMPLETED', value: 'Completed' }].map((status, index) => (
									<MenuItem className={classes.menuItem} key={index} value={status.key}>{status.value}</MenuItem>
								))}
							</Select>
						</FormControl>
					</GridItem>
				</GridContainer>

			</div>
		);
	}
}

MyTasksListFilter.propTypes = {
	classes: PropTypes.object.isRequired,
	processStatusValues: PropTypes.array,
	taskStatusValues: PropTypes.array,
	roles: PropTypes.array,
	users: PropTypes.array,
	processList: PropTypes.array,
	getRolesForSelectMenu: PropTypes.func,
	getCamundaUsersForSelectMenu: PropTypes.func,
	getTasksList: PropTypes.func,
	isLoadingTaskDataList: PropTypes.bool,
	handleTaskDataListLoading: PropTypes.func,
	pagination: PropTypes.object,
};


const mapStateToProp = (state) => ({
	processStatusValues: state.processDashboard.processStatusValues,
	taskStatusValues: state.processDashboard.taskStatusValues,
	roles: state.processDashboard.roles,
	users: state.processDashboard.users,
	processList: state.processDashboard.processList,
	isLoadingTaskDataList: state.processDashboard.isLoadingTaskDataList,
	pagination: state.processDashboard.myTaskListPagination,
});

const mapDispatchToProps = (dispatch) => ({
	getTasksList: (requestQuery) => dispatch(getTasksList(requestQuery)),
	getRolesForSelectMenu: () => dispatch(getRolesForSelectMenu()),
	getCamundaUsersForSelectMenu: () => dispatch(getCamundaUsersForSelectMenu()),
	handleTaskDataListLoading: (isLoading) => dispatch(handleTaskDataListLoading(isLoading)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(MyTasksListFilter));