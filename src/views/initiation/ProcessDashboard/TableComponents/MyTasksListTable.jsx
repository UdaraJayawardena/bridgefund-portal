// @ts-nocheck
import React, { Component } from 'react';
import qs from "querystring";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	Dialog, IconButton, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel,
	Typography, Link, TableContainer, TablePagination, Select, FormControl, Button
} from '@material-ui/core';
import SwapVertSharpIcon from '@mui/icons-material/SwapVertSharp';
import Tooltip from '@mui/material/Tooltip';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';

import { displayNotification } from "store/initiation/actions/Notifier";
import { clearTaskDataList, completeUserTask, getTasksList, setSelectedContractId } from 'store/initiation/actions/ProcessDashboard.action';
import { getSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { setImportedLoanRequestContractId } from 'store/crm/actions/SmeOverview.action';
import { selectLoan , getSingleLoanOverviewData} from 'store/loanmanagement/actions/SmeLoans';

import Memo from '../Memo';
import { createUrl, EURO } from 'lib/initiation/utility';
import ENV from '../../../../config/env';
import { getCustomerDetails } from 'store/initiation/actions/BankAccount.action';
import { getCustomerAddressContact } from 'store/crm/actions/SmeOverview.action';
import { setCustomerDetails } from 'store/initiation/actions/BankAccount.action';
import { changeCustomerDetails,  setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';

import style from "assets/jss/bridgefundPortal/views/pdMyTaskListStyle";
import LoadingOverlay from 'react-loading-overlay';
import ChangeWorkflowStatusPopUp from 'views/initiation/CreditManagement/Charts/ChangeWorkflowStatusPopUp';
import history from "./../../../../history";
import { setDashbordNavigationStatus } from 'store/initiation/actions/login';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const ProcessUpdateTypes = {
	BACKWARD: 'BACKWARD',
	FORWARD: 'FORWARD',
	ERROR_BOUNDARY: 'ERROR_BOUNDARY',
};

const BackwordAprovedProcesses = ["revision-flex-loan", "loan-initiation"];
const AuthorizedUserTypes = ["CSM", "IT developer", "Finance & Risk manager"];
class MyTasksListTable extends Component {
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
			order: "desc",
			orderBy: "startTime",
			isOpenChangeWorkflowStatusDialog: false,
			workflowData: {},
		};
	}

	// eslint-disable-next-line no-unused-vars
	handleRequestSort = (property, event) => {

		const { myTaskListQuery, pagination } = this.props;
		const orderBy = property;

		let order = "desc";
		if (this.state.orderBy === property && this.state.order === "desc") {
			order = "asc";
		}

		this.setState({ order, orderBy }, () => this.props.getTasksList({ ...myTaskListQuery, ...pagination, sortOrder: order, sortBy: orderBy, page: pagination.page + 1 }));
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

		if (customerSysId !== '-' && customerLegalName !== '-' && contractId !== '-') {

			this.setState({
				memoData: {
					customer: customerSysId,
					customerLegalName,
					contractId,
					processName: task.processInstance.processDefinitionName,
					processKey: task.processInstance.processDefinitionKey,
					taskKey: task.taskDefinitionKey,
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
							processName: task.processInstance.processDefinitionName,
							processKey: task.processInstance.processDefinitionKey,
							taskKey: task.taskDefinitionKey,
							taskName: task.name,
						}
					}, () => { this.handleMemoDialog(); });
				})
				.catch(e => console.log('error in get customer detail for memo ', e));
			return;
		}

		this.props.displayNotification('No customer or contractId exists to add memo !', 'warning');
	}

	handleMemoDialog = () => {
		this.setState({ isOpenMemoDialog: !this.state.isOpenMemoDialog });
	}

	handleEditTask = (originalTask, e) => {

		// const { myTaskListQuery, pagination } = this.props;
		const { value } = e.target;
		// const { id } = originalTask;

		// console.log('originalTask ', originalTask, 'status_value ', e.target.value);
		//to check if values are changed to COMPLETE to ACTIVE
		if (value === 'COMPLETED') {
			if (originalTask.taskDefinitionKey.includes("errorhandling_Activity")) {
				//Error_boundary handling section
				this.setWorkflowStatusChangeData(originalTask, ProcessUpdateTypes.ERROR_BOUNDARY);
			}
			else {
				// const reqObj = { id };
				// this.props.completeUserTask(reqObj)
				// 	.then(() => this.props.getTasksList({ ...myTaskListQuery, ...pagination }))
				// 	.catch(err => console.log('err in completeUserTask ', err));
				this.setWorkflowStatusChangeData(originalTask, ProcessUpdateTypes.FORWARD);
			}
		}
		else {
			this.props.displayNotification('Can not active a Task !', 'warning');
		}

	}

 handleModifyAction = ( event, originalTask ) => {
  event.stopPropagation();
  this.setWorkflowStatusChangeData(originalTask, ProcessUpdateTypes.BACKWARD);
 }

	getAssignee = (assignee) => {

		if (!assignee) return '-';

		const systemUsers = ENV.SYSTEM_USERS;

		if (systemUsers && systemUsers.includes(assignee)) return 'System';

		return assignee;
	}

	handleNavigate = (url, portalKey) => {
		return createUrl(this.getPortalURL(portalKey))(`${url}`);
	}

	getPortalURL = (url) => {

		// LI,LM.CRM
		if (url === 'CRM') return ENV.CRM_PORTAL_URL;
		if (url === 'LM') return ENV.LM_PORTAL_URL;
		// if(url==='LI') 
		return ENV.LI_PORTAL_URL;

	}

	handleChangePage = (event, page) => {
		const { pagination, myTaskListQuery } = this.props;
		this.props.getTasksList({ ...myTaskListQuery, ...{ ...pagination, page: page + 1 } });
		// console.log('page ', page);
	};

	handleChangeRowsPerPage = (e) => {
		const { pagination, myTaskListQuery } = this.props;
		this.props.getTasksList({ ...myTaskListQuery, ...{ ...pagination, perPage: +e.target.value, page: 1 } });
		// console.log('rowsPerPage ', e.target.value);
	}
	handleChangeItem = (data) => {
		//need to change this func after back end implemnting for navigating dashboards 
	}

	handleChangeWorkflowStatusDialog = () => {
		this.setState({ isOpenChangeWorkflowStatusDialog: !this.state.isOpenChangeWorkflowStatusDialog });
	}

	setWorkflowStatusChangeData = (task, statusChangeType) => {
		const workflowData = {
			process: task.processDefinitionKey,
			processId: task.processInstance.businessKey,
			selectedTaskIdList: [],
			statusChangeType: statusChangeType,
			// selectedTask: task.processDefinitionKey,
			tenantId: 'LI',
		};

		this.setState({ workflowData }, () => this.handleChangeWorkflowStatusDialog());
	}

	redirectToDashBoradItem = (wireframData , wireframeName , portalKey) => {
 
		const { customers } = this.props;
		if (portalKey === 'LI' && wireframData.contractId){
			const contractId = wireframData.contractId;
			this.props.setImportedLoanRequestContractId(contractId);
			this.props.getSmeLoanRequestDetails({contractId}).then(response => {
				this.props.getCustomerAddressContact(response.customerId)
					.then(response => {
						this.props.setCustomerDetails(response.customer);
					})
					.catch((err) => {
						this.props.displayNotification('Can not get customer Data!', 'warning');
						console.log(err);
					})
					.finally(() => {
						this.props.setNavigationInDashboards(wireframeName)
						.then(response => {
							if (response) {
								history.push(response);
							}
						});
					  });
			});
		}
		if (portalKey === 'LM' && wireframData.contractId){
			const contractId = wireframData.contractId;
			this.props.selectLoan({contractId});
			this.props.getLoanDetails(contractId)
            .then(res => {
				  
                const customer = customers.filter(c => c.company === res.sme.company );
                
                this.props.changeCustomerDetails(customer[0].sme);
				this.props.setHeaderDisplaySubData(` - ${customer[0].sme.company} - ${contractId}`);
				
            })
            .catch((err) => {
                console.log('error getCustomerdetailsByContractId ', err);
            }).finally(() => {
				this.props.setNavigationInDashboards(wireframeName)
				.then(response => {
				if (response) {
					history.push(response);
				}
			});
			  });
			
		}

	}

	getContractId = (process) => {
		return process.variableInstanceList.find(variable => variable.name === 'contractId') ?
			this.getVariableFromVariableList(process.variableInstanceList, 'contractId') :
			this.getVariableFromVariableList(process.variableInstanceList, 'smeLoanRequestContractId')
	}

	getContentForTaskColumn = (process) => {
		const { classes , isDashboardContent } = this.props;
		const contractId = (process.wireFrameData && process.wireFrameData.contractId) ? process.wireFrameData.contractId : this.getContractId(process);

		if (isDashboardContent) {
			return process.wireFrameName != '' ?
				<Link target="blank" className={classes.tabNavigationLink} 
					onClick={() => this.redirectToDashBoradItem(process.wireFrameData , process.wireFrameName , process.portalKey)}>
					{process.name}
				</Link>
				: 
				<p style={{color: "black" }} >{process.name}</p>;
		} 
			return process.wireFrameUrl ?
				<Link target="blank" href={this.handleNavigate(process.wireFrameUrl, process.portalKey)} >{process.name}</Link> //otherRoutes
				:
				<p style={{color: "black"}}>{process.name}</p>;
	}

	render() {
		const { classes, searchedTaskDataList, isLoadingTaskDataList, pagination, myTaskListQuery } = this.props;
		const { isOpenMemoDialog, memoData, orderBy, order, isOpenChangeWorkflowStatusDialog, workflowData } = this.state;
		return (
			<div >
				<Typography variant="subtitle1" className={classes.taskCount} gutterBottom>
					{'Number of Tasks : ' + pagination.totalCount}
				</Typography>
				<TableContainer className={classes.tableContainer}>
					<LoadingOverlay
						// @ts-ignore
						id="loader-overlay"
						active={isLoadingTaskDataList}
						spinner
						text='Loading Tasks...'>
						<Table className={classes.table} aria-label="simple table">
							<TableHead className={classes.tableHeadColor}>
								<TableRow >
									<TableCell className={classes.tableCell}>Customer</TableCell>
									<TableCell className={classes.tableCell}>Contract</TableCell>
									<TableCell className={classes.tableCell}>
										<TableSortLabel
											active={orderBy === 'taskDefinitionKey'}
											// @ts-ignore
											direction={order}
											onClick={this.handleRequestSort.bind(this, 'taskDefinitionKey')}>
											Process</TableSortLabel></TableCell>
									<TableCell className={classes.tableCell}>Status</TableCell>
									<TableCell className={classes.tableCell}>
										<TableSortLabel
											active={orderBy === 'taskName'}
											// @ts-ignore
											direction={order}
											onClick={this.handleRequestSort.bind(this, 'taskName')}>
											Task</TableSortLabel>
									</TableCell>
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
								{searchedTaskDataList.length === 0 ?

									<TableRow>
										<TableCell className={classes.tableCell} align="center" colSpan={13}>
											{'No Tasks to show'}
										</TableCell>
									</TableRow>

									:

									// stableSort(searchedTaskDataList,
									// 	getSorting(order, orderBy)).map((process, index) =>
									searchedTaskDataList.map((process, index) =>
										<TableRow key={index} >

											<TableCell className={classes.tableCell} >{
												this.getVariableFromVariableList(process.variableInstanceList, 'customerLegalName')
											}</TableCell>
											<TableCell className={classes.tableCell}>{
												process.variableInstanceList.find(variable => variable.name === 'contractId') ?
													this.getVariableFromVariableList(process.variableInstanceList, 'contractId') :
													this.getVariableFromVariableList(process.variableInstanceList, 'smeLoanRequestContractId')
											}</TableCell>
											<TableCell className={classes.tableCell}>{process.processInstance ? process.processInstance.processDefinitionName : '-'}</TableCell>{/* TODO need to add afilter */}
											<TableCell className={classes.tableCell}>{process.processInstance ? process.processInstance.state : '-'}</TableCell>
											{/* {process.wireFrameName ?
												<TableCell className={classes.tableCell}>
													<Link target="blank" href={this.redirectToFirstAnalysesOverview(this.getContractId(process))} >{process.name}</Link>
												</TableCell>
												:
													process.wireFrameUrl ?
														<TableCell className={classes.tableCell}>
															<Link target="blank" href={this.handleNavigate(process.wireFrameUrl, process.portalKey)} >{process.name}</Link>
														</TableCell>
														:
														<TableCell className={classes.tableCell}>{process.name}</TableCell>} */}
											{/* {this.getContentForTaskColumn(process)} */}
											<TableCell className={classes.tableCell}>{this.getContentForTaskColumn(process)}</TableCell>
											{process.stateEditable ?
												<TableCell className={classes.tableCell}>
													<FormControl size="small" variant="outlined">
														<Select
															id="standard-select-currency"
															value={process.state ? process.state : ''}
															onChange={(e) => this.handleEditTask(process, e)}
															variant="outlined"
															// fullWidth
															className={classes.inputProp}
														>
															<MenuItem className={classes.menuItem} value="" disabled>
																<em>None</em>
															</MenuItem>
															{[{ key: 'ACTIVE', value: 'Active' }, { key: 'COMPLETED', value: 'Completed' }].map((status, index) => (
																<MenuItem className={classes.menuItem} key={index} value={status.key}>{status.value}</MenuItem>
															))}
														</Select>
													</FormControl>
												</TableCell>
												:
												<TableCell className={classes.tableCell}>{process.state ? process.state : '-'}</TableCell>}
											<TableCell className={classes.tableCell}>
												<IconButton size="small" aria-label="memo-button" onClick={() => this.setMemoData(process)}>
													<EditTwoToneIcon />
												</IconButton>
											</TableCell>
											<TableCell className={classes.tableCell}>{moment(process.startTime).format('DD:MM:YYYY HH:mm:ss')}</TableCell>
											<TableCell className={classes.tableCell}>{moment(process.endTime).isValid() ? moment(process.endTime).format('DD:MM:YYYY HH:mm:ss') : '-'}</TableCell>
											<TableCell className={classes.tableCell}>{this.getAssignee(process.assignee)}</TableCell>
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
                  style={{ backgroundColor: "#ace1e6", color:"#fff" }} >
                  <SwapVertSharpIcon />
                 </IconButton>
              </Tooltip>
              }
              </TableCell>
										</TableRow>
									)}
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

				{/* ===================== change workflow status dialog stuff ================== */}

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
			</div>
		);
	}

	componentWillUnmount() {
		this.props.clearTaskDataList();
	}
}

MyTasksListTable.propTypes = {
	classes: PropTypes.object.isRequired,
	searchedTaskDataList: PropTypes.array.isRequired,
	customers: PropTypes.array,
	clearTaskDataList: PropTypes.func,
	completeUserTask: PropTypes.func,
	getTasksList: PropTypes.func,
	displayNotification: PropTypes.func,
	getCustomerDetails: PropTypes.func,
	isLoadingTaskDataList: PropTypes.bool,
	pagination: PropTypes.object,
	getSmeLoanRequestDetails: PropTypes.func,
	setNavigationInDashboards: PropTypes.func,
	getCustomerAddressContact: PropTypes.func,
	setCustomerDetails: PropTypes.func,
	isDashboardContent: PropTypes.bool,
	getSmeLoanByLoanId : PropTypes.func,
	smeLoans:PropTypes.array,
	setImportedLoanRequestContractId: PropTypes.func, 
	selectLoan : PropTypes.func,
	getLoanDetails:PropTypes.func,
	setHeaderDisplaySubData: PropTypes.func,
	setDashbordNavigationStatus: PropTypes.func,
};

const mapStateToProp = (state) => ({
	searchedTaskDataList: state.processDashboard.searchedTaskDataList,
	myTaskListQuery: state.processDashboard.myTaskListQuery,
	isLoadingTaskDataList: state.processDashboard.isLoadingTaskDataList,
	pagination: state.processDashboard.myTaskListPagination,
	isDashboardContent: state.user.isDashboardContent,
	selectedDashboardItems: state.user.selectedDashboardItems,
	smeLoans: state.lmglobal.smeLoans,
	customers: state.lmglobal.customers,
});

const mapDispatchToProps = (dispatch) => ({
	displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
	clearTaskDataList: () => dispatch(clearTaskDataList()),
	completeUserTask: (updatedObj) => dispatch(completeUserTask(updatedObj)),
	getCustomerDetails: (requestQuery) => dispatch(getCustomerDetails(requestQuery)),
	getTasksList: (requestQuery) => dispatch(getTasksList(requestQuery)),
	setSelectedContractId: (contractId) => dispatch(setSelectedContractId(contractId)),
	getSmeLoanRequestDetails: (contractId) => dispatch(getSmeLoanRequestDetails(contractId)),
	setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
	getCustomerAddressContact: (customerId) => dispatch(getCustomerAddressContact(customerId)),
	setCustomerDetails: (customer) => dispatch(setCustomerDetails(customer)),
	setImportedLoanRequestContractId: (id) => dispatch(setImportedLoanRequestContractId(id)),
	selectLoan: (loan) => {
		dispatch(selectLoan(loan));
	  },
	changeCustomerDetails: (data) => dispatch(changeCustomerDetails(data)),
	getLoanDetails: (contractId) => dispatch(getSingleLoanOverviewData(contractId)),
	setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
	setDashbordNavigationStatus: (status) => dispatch(setDashbordNavigationStatus(status)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(MyTasksListTable));