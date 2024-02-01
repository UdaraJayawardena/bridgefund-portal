
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import Notifier from 'components/initiation/Notification/Notifier';
import { Tabs, Tab, Typography, } from '@material-ui/core';

import { displayNotification } from 'store/initiation/actions/Notifier';

import ErrorBoundary from 'components/common/ErrorBoundary/ErrorBoundary';
import MyTaskList from './MyTaskList';// DashboardTabConcept

import Style from 'assets/jss/bridgefundPortal/views/dashboardStyle';
import CustomerProcessOverview from './CustomerProcessOverview';
import StatusProcessOverview from './StatusProcessOverview';
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

class ProcessDashboard extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			tabIndex: 0,
		};
	}


	handleTabIndexChange = (e, value) => {
		this.setState({ tabIndex: value });
	};


	render() {

		const { classes } = this.props;

		let tabHeaderTitle;
		if (this.state.tabIndex === 0) {
			tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}><b>Process Dashboard</b> &nbsp;- My Tasks List</Typography>;
		}
		else if (this.state.tabIndex === 1) {
			tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}><b>Process Dashboard</b>&nbsp;- Status Overview</Typography>;
		}
		else if (this.state.tabIndex === 2) {
			tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}><b>Process Dashboard</b> &nbsp;- Customer Overview</Typography>;
		}
		else if (this.state.tabIndex === 3) {
			tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}>Management Info</Typography>;
		}

		return (
			<ErrorBoundary>
				<React.Fragment>
					<Notifier />
					<div className={classes.header}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
							<div>
								{tabHeaderTitle}
							</div>

						</div>
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
							<Tab label='My Tasks List' id='my-tasks-list-tab-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Status Overview' id='process-overview-tab-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Customer Overview' id='customer-overview-tab-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} ></Tab>
							<Tab label='Management Info' id='management-info-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} disabled></Tab>
						</Tabs>
					</div>
					<div>
						<TabPanel value={this.state.tabIndex} index={0}><MyTaskList /></TabPanel>{/* // DashboardTabConcept */}
						<TabPanel value={this.state.tabIndex} index={1}><StatusProcessOverview /></TabPanel>
						<TabPanel value={this.state.tabIndex} index={2}><CustomerProcessOverview /></TabPanel>
						<TabPanel value={this.state.tabIndex} index={3}><div>Not Implemented Yet</div></TabPanel>
					</div>
				</React.Fragment>
			</ErrorBoundary>
		);
	}
}

ProcessDashboard.propTypes = {
	classes: PropTypes.object.isRequired,
	displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (/* state */) => ({

});

const mapDispatchToProps = (dispatch) => ({
	displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(Style)(ProcessDashboard));
