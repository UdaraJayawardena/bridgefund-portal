import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import CustomSearch from 'components/initiation/CustomInput/CustomSearch';
import { getProcessDataList } from 'store/initiation/actions/ProcessDashboard.action';
import { getSmeLoanRequests, searchCustomer } from 'store/initiation/actions/BankAccount.action';
import Autocomplete from '@material-ui/lab/Autocomplete';

import style from "assets/jss/bridgefundPortal/views/pdCustomerOverviewStyle";
import { getCustomerAddressContact, setSelectedCustomerId } from 'store/crm/actions/SmeOverview.action';
import { setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
class CustomerOverviewFilter extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedProcessStatus: '',
			selectedProcess: '',
			selectedContractId: '',
			legalName: this.props.isDashboardContent && this.props.selectedCustomer && this.props.selectedCustomer.legalName ? this.props.selectedCustomer.legalName : '',
			contractIdList: [],
			allCustomers: [],
		};
	}

	componentDidMount() {
		this.handleSearchedProcessDataList();
		this.setAllCustomers();

		if (this.props.selectedCustomer && this.props.selectedCustomer.id && this.props.isDashboardContent) {
			this.setSmeRequestIdsForDropdown({ customerId: this.props.selectedCustomer.id });
		}
	}

	setAllCustomers = () => {
		this.props.searchCustomer(null, null, null, null, 'i')
			.then(res => {
				// console.log('res ', res);
				this.setState({ allCustomers: res });
			})
			.catch(err => console.log("err in get all customers ", err));
	}

	setSmeRequestIdsForDropdown = (customerSysId = null) => {
		this.props.getSmeLoanRequests(customerSysId)
			.then(res => {
				this.setState({ contractIdList: res });
			})
			.catch(err => console.log('error in setSmeRequestIdsForDropdown ', err));
	}

	handleChange = (e) => {
		const { selectedTask } = this.state;
		if (e.target.name === 'selectedProcess') {

			if (selectedTask !== '') {
				this.setState({ selectedTaskList: e.target.value.userTasks, selectedProcess: e.target.value, selectedTask: '' }, () => this.handleSearchedProcessDataList());
			}
			else {
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
		const { selectedProcessStatus, legalName, selectedProcess, selectedContractId } = this.state;

		const reqObj = {
			// @ts-ignore
			processDefinitionKey: selectedProcess.key,
			processInstanceBusinessKey: selectedContractId,
			processState: selectedProcessStatus,
			variables: legalName ? `customerLegalName_eq_${legalName}` : ''
		};
		this.props.getProcessDataList({ ...this.cleanObject(reqObj), ...{ ...pagination, page: 1 } });
	}

	handleCustomerSearchResult = (result) => {

		if (result && typeof result !== 'string') {
			this.setState({ legalName: result.legalName }, () => this.handleSearchedProcessDataList());
			this.props.setHeaderDisplaySubData(` - ${result.legalName}`);

			this.setSmeRequestIdsForDropdown({ customerId: result.id });
			if (this.props.isDashboardContent) {
				this.props.setSelectedCustomerId(result.id);
			}

			this.props.getCustomerAddressContact(result.id);
		}
	};

	handleSearchChange = (name, value) => {
		this.setState({ [name]: value });
	}

	onSearch = (name, value) => {
		this.setState({ selectedContractId: value });
		if (name === 'requestId' && value === '') {
			this.setState({ selectedContractId: value }, () => this.handleSearchedProcessDataList());
		};
	};

	handleOnContractSearchResult = (result) => {
		if (result && typeof result !== 'string') {
			console.log('result ', result);
			this.setState({ selectedContractId: result.requestId }, () => this.handleSearchedProcessDataList());
		}
	}

	render() {

		const { classes, processStatusValues, processList, } = this.props;
		const { selectedProcessStatus, legalName, allCustomers, selectedProcess, contractIdList, selectedContractId } = this.state;
		// console.log("selectedCustomer in render ", selectedCustomer);

		return (
			<div className={classes.container}>

				<GridContainer className={classes.flexContainer}>
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.searchBox}>
							<Autocomplete
								getOptionDisabled={(option) =>
									!legalName && selectedContractId ? true : false
								}
								className={classes.inputProp}
								value={legalName}
								ListboxProps={{
									className: classes.autoSuggestListStyle,
									shrink: true,
								}}
								onChange={(event, newValue) => {
									if (newValue) {
										this.setState({ legalName: newValue });
										this.handleCustomerSearchResult(allCustomers.find(c => c.legalName === newValue));
										// console.log('newValue ', newValue);
									}
									else {
										this.setState({ legalName: '' }, () => this.setSmeRequestIdsForDropdown());
									}
								}}

								onInputChange={(event, newInputValue) => {
									this.setState({ legalNameInput: newInputValue });
								}}
								id='customer-search'
								options={allCustomers.map(c =>
									c.legalName
								)}
								renderInput={(params) => (
									<TextField {...params}

										label={'Customer *'}
										variant="outlined"
										InputProps={{
											...params.InputProps,
											className: classes.inputProp,
										}}
										InputLabelProps={{
											className: classes.inputLabel,
											shrink: true
										}}
									/>
								)}
							// disabled={isLoadingProcessDataList}
							// disabled={isLoadingProcessDataList}

							/>
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
								<MenuItem className={classes.menuItem} value="">
									<em>All</em>
								</MenuItem>
								{processList && processList.map((process, index) => (
									<MenuItem className={classes.menuItem} key={index} value={process}>{process.name}</MenuItem>
								))}
							</Select>
						</FormControl>
					</GridItem>
					{legalName ?
						<GridItem className={classes.smallBox}>
							<FormControl size="small" variant="outlined" className={classes.searchBox}>
								<InputLabel className={classes.inputLabel} id="contract-select-label">{'Contract'}</InputLabel>
								<Select
									labelId="contract-select-label"
									id="contract-select"
									label="Contract"
									name="selectedContractId"
									value={selectedContractId}
									onChange={this.handleChange}
									fullWidth
									className={classes.inputProp}
								// disabled={isLoadingProcessDataList}
								>
									<MenuItem className={classes.menuItem} value="">
										<em>All</em>
									</MenuItem>
									{contractIdList && contractIdList.map((contract, index) => (
										<MenuItem className={classes.menuItem} key={index} value={contract.contractId}>{contract.contractId}</MenuItem>
									))}
								</Select>
							</FormControl>
						</GridItem>
						:
						<GridItem style={{ paddingRight: '20px', width: '25%', }}>
							<CustomSearch
								label="Contract"
								asyncSearchType="requestId"
								name="requestId"
								value={selectedContractId}
								onChange={this.onSearch}
								onSearchResult={this.handleOnContractSearchResult}
								SearchOptions={{
									regexOption: 'i'
								}}
							/>
						</GridItem>
					}
					<GridItem className={classes.smallBox}>
						<FormControl size="small" variant="outlined" className={classes.searchBox}>
							<InputLabel className={classes.inputLabel} id="process-status-select-label">{'Status'}</InputLabel>
							<Select
								className={classes.inputProp}
								labelId="process-status-select-label"
								id="process-status-select"
								name="selectedProcessStatus"
								value={selectedProcessStatus}
								onChange={this.handleChange}
								label="Status"
								fullWidth
							// disabled={isLoadingProcessDataList}
							>
								<MenuItem className={classes.menuItem} value="">
									<em>All</em>
								</MenuItem>
								{processStatusValues && processStatusValues.map((status, index) => (
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

CustomerOverviewFilter.propTypes = {
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
	selectedCustomer: PropTypes.object,
	isDashboardContent: PropTypes.bool,
	pagination: PropTypes.object,
	setSelectedCustomerId: PropTypes.func,
	getCustomerAddressContact: PropTypes.func,
	setHeaderDisplaySubData: PropTypes.func,
};


const mapStateToProp = (state) => ({
	processStatusValues: state.processDashboard.processStatusValues,
	taskStatusValues: state.processDashboard.taskStatusValues,
	roles: state.processDashboard.roles,
	processList: state.processDashboard.processList,
	isLoadingProcessDataList: state.processDashboard.isLoadingProcessDataList,
	selectedCustomer: state.lmglobal.selectedCustomer,
	isDashboardContent: state.user.isDashboardContent,
	pagination: state.processDashboard.processDataListPagination,
});

const mapDispatchToProps = (dispatch) => ({
	getProcessDataList: (requestQuery) => dispatch(getProcessDataList(requestQuery)),
	getSmeLoanRequests: (requestQuery) => dispatch(getSmeLoanRequests(requestQuery)),
	searchCustomer: (key, value, criteria, customerId, options) => dispatch(searchCustomer(key, value, criteria, customerId, options)),
	setSelectedCustomerId: (id) => dispatch(setSelectedCustomerId(id)),
	getCustomerAddressContact: (customerId, legalName, activeIndicatior) => dispatch(getCustomerAddressContact(customerId, legalName, activeIndicatior)),
	setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(CustomerOverviewFilter));