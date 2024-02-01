import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
// import Notifier from 'components/initiation/Notification/Notifier';
// import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import PropTypes from 'prop-types';
import { Typography, Tabs, Tab } from '@material-ui/core';
import ErrorBoundary from 'components/common/ErrorBoundary/ErrorBoundary';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';
import CategoryRules from '../CategoryRules/CategoryRules';
import BankTransactionTypeOverview from '../BankTrasactionTypeOverview/BankTrasactionTypeOverview';
import BanksOverview from '../BanksOverview/BanksOverview';
import PlatformOverview from '../PlatformOverview/PlatformOverview';
import CreditRiskParameterTypesOverview from '../CreditRiskParameterTypes/CreditRiskParameterTypesOverview';

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
class ParameterDashboard extends React.Component {

  constructor(props) {
		super(props);

		this.state = {
			tabIndex: 1,
		};
	}

	handleTabIndexChange = (e, value) => {
		this.setState({ tabIndex: value });
	};

  render() {

    const { classes } = this.props;

		let tabHeaderTitle;
		if (this.state.tabIndex === 0) {
			tabHeaderTitle = <Typography className={classes.tabHeaderTitle}><b>Category Rules</b></Typography>;
		}
		else if (this.state.tabIndex === 1) {
			tabHeaderTitle = <Typography className={classes.tabHeaderTitle}><b>Credit Risk Parameter Types</b></Typography>;
		}
		else if (this.state.tabIndex === 2) {
			tabHeaderTitle = <Typography className={classes.tabHeaderTitle}><b>Bank Transaction Type</b></Typography>;
		}
		else if (this.state.tabIndex === 3) {
			tabHeaderTitle = <Typography className={classes.tabHeaderTitle}><b>Bank Overview</b></Typography>;
		}
		else if (this.state.tabIndex === 4) {
			tabHeaderTitle = <Typography className={classes.tabHeaderTitle}><b>Platform Overview</b></Typography>;
		}
		

		return (
			<ErrorBoundary>
				<React.Fragment>
					<div className={classes.header}>
								{tabHeaderTitle}
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
							<Tab label='Category-Rules' id='crd-tab-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Credit-Risk-Parameter-Types' id='crd-tab-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Bank-Transaction-Type' id='crd-tab-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Bank-Overview' id='crd-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
							<Tab label='Platform-Overview' id='crd-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
						</Tabs>
					</div>
					<div>
						<TabPanel value={this.state.tabIndex} index={0}><CategoryRules/></TabPanel>
						<TabPanel value={this.state.tabIndex} index={1}><CreditRiskParameterTypesOverview/></TabPanel>
						<TabPanel value={this.state.tabIndex} index={2}><div className={classes.container}><BankTransactionTypeOverview/></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={3}><div className={classes.container}><BanksOverview/></div></TabPanel>
						<TabPanel value={this.state.tabIndex} index={4}><div className={classes.container}><PlatformOverview/></div></TabPanel>
					</div>
				</React.Fragment>
			</ErrorBoundary>
		);
	}
}

ParameterDashboard.propTypes = {
	classes: PropTypes.object.isRequired,
	customer: PropTypes.object,
	clearCustomerDetails: PropTypes.func,
	clearSmeLoanRequests: PropTypes.func,
	clearSmeLoanRequestDetails: PropTypes.func,
	contractId: PropTypes.string,
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = () => {
  return {

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(ParameterDashboard));

