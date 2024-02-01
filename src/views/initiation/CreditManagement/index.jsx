import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Tabs, Tab, } from '@material-ui/core';
import ErrorBoundary from 'components/common/ErrorBoundary/ErrorBoundary';
import CreditManagementCharts from './Charts/CreditManagementCharts';
import { clearCustomerDetails, clearSmeLoanRequests } from 'store/initiation/actions/BankAccount.action';
import { clearSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import CategoryRules from 'views/initiation/CategoryRules/CategoryRules';
import DebtForm from 'views/initiation/InternalDebtFormOverview/DebtForm';
import CreditManagementCategories from './Categories/CreditManagementCategories';
import Parameters from './Parameters/ParametersOverview';
import CreditManagementInternalTypes from './InternalTypes/CreditManagementInternalTypes';

import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';
import MyTaskList from '../ProcessDashboard/MyTaskList';
import CustomerProcessOverview from '../ProcessDashboard/CustomerProcessOverview';
import CheckTransactionOverview from './CheckTransactions/CheckTransactionOverview';
/* Tab Panel */

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-force-tabpanel-${index}`}
			aria-labelledby={`scrollable-force-tab-${index}`}
			{...other}
			style={{ paddingTop: 10 }}
		>
			{value === index && children}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

/* ***END*** */
class CreditManagementDashBoard extends Component {

	constructor(props) {
		super(props);

		this.state = {
			tabIndex: 1,
			parameterList: [],
			creditRiskParameterTypes: []
		};
	}

	handleTabIndexChange = (e, value) => {
		this.setState({ tabIndex: value });
	};

	componentWillUnmount() {
		this.props.clearCustomerDetails();
		this.props.clearSmeLoanRequests();
		this.props.clearSmeLoanRequestDetails();
	}

	getHeaderData = () => {
		const { contractId, customer } = this.props;
		if (customer.legalName && !contractId) return ` - ${customer.legalName}`;
		if (!customer.legalName && !contractId) return ``;
		if (!customer.legalName && contractId) return ` - ${contractId}`;
		if (customer.legalName && contractId) return ` - ${customer.legalName} - ${contractId}`;
	}

	render() {

		const { classes, contractId, customer } = this.props;


		return (
			<ErrorBoundary>
				<React.Fragment>
					{/* <Notifier /> */}
					<div className={classes.header}>

						<Tabs
							value={this.state.tabIndex}
							onChange={this.handleTabIndexChange}
							variant="scrollable"
							scrollButtons="auto"
							// indicatorColor="primary"
							// textColor="primary"
							classes={{
								indicator: classes.tabIndicator
							}}
						>
							<Tab label='My-Tasks' id='crd-tab-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Charts' id='crd-tab-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Categories' id='crd-tab-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Internal Types' id='crd-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} disabled={contractId === undefined || contractId === null ? true : false}></Tab>
							<Tab label='Debt-Form' id='crd-tab-4' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} disabled={contractId === undefined || contractId === null ? true : false}></Tab>
							<Tab label='Parameters' id='crd-tab-5' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} disabled={contractId === undefined || contractId === null ? true : false}></Tab>
							<Tab label='Rules' id='crd-tab-6' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Customer Overview' id='crd-tab-7' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Check Transactions' id='crd-tab-8' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
						</Tabs>
					</div>
					<div>
						<TabPanel value={this.state.tabIndex} index={0}><MyTaskList /></TabPanel>
						<TabPanel value={this.state.tabIndex} index={1}><CreditManagementCharts /></TabPanel>
						<TabPanel value={this.state.tabIndex} index={2}><div className={classes.container}><CreditManagementCategories /></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={3}><div className={classes.container}><CreditManagementInternalTypes /></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={4}><div className={classes.container}><DebtForm requestContractId={contractId} customerLegalName={customer} origin="CREDIT_RISK_OVERVIEW" /></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={5}><div className={classes.container}><Parameters listData={this.state.parameterList} parameterTypes={this.state.creditRiskParameterTypes} /></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={6}><div className={classes.container}><CategoryRules origin="CREDIT_RISK_OVERVIEW" /></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={7}><CustomerProcessOverview /></TabPanel>
						<TabPanel value={this.state.tabIndex} index={8}><div className={classes.container}><CheckTransactionOverview /></div></TabPanel>
					</div>
				</React.Fragment>
			</ErrorBoundary>
		);
	}
}

CreditManagementDashBoard.propTypes = {
	classes: PropTypes.object.isRequired,
	customer: PropTypes.object,
	clearCustomerDetails: PropTypes.func,
	clearSmeLoanRequests: PropTypes.func,
	clearSmeLoanRequestDetails: PropTypes.func,
	contractId: PropTypes.string,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	contractId: state.lmglobal.overviewData.contractId,
	loanRequestId: state.lmglobal.overviewData.id
});

const mapDispatchToProps = (dispatch) => ({
	clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails())
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(CreditManagementDashBoard));