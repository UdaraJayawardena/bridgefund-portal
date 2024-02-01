import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { getProcessStatusesForSelectMenu, getTaskStatusesForSelectMenu, getProcessListForSelectMenu } from 'store/initiation/actions/ProcessDashboard.action';
import StatusOverviewFilter from './FIlterComponents/StatusOverviewFilter';
import StatusOverviewTable from './TableComponents/StatusOverviewTable';



const style = (theme) => ({
	container: {
		marginLeft: theme.spacing(2),
	},
	smallBox: {
		paddingRight: '20px',
		width: '20%'
	},
	leftBorderCell: {
		borderLeft: '1px solid rgba(224, 224, 224, 1)'
	},
	rightBorderCell: {
		borderRight: '1px solid rgba(224, 224, 224, 1)'
	},
	leftAndRightBorderCell: {
		borderRight: '1px solid rgba(224, 224, 224, 1)',
		borderLeft: '1px solid rgba(224, 224, 224, 1)'
	}
});

class StatusProcessOverview extends Component {

	componentDidMount() {

		this.props.getProcessStatusesForSelectMenu();

		this.props.getTaskStatusesForSelectMenu();

		this.props.getProcessListForSelectMenu({ manualOnly: false, latestVersion: true });
	}

	render() {

		return (
			<React.Fragment>
				<GridContainer>
					<GridItem xs={12}>
						<StatusOverviewFilter />
					</GridItem>
				</GridContainer>
				<GridContainer>
					<GridItem xs={12}>
						<StatusOverviewTable />
					</GridItem>
				</GridContainer>
			</React.Fragment>
		);
	}
}

StatusProcessOverview.propTypes = {
	getProcessStatusesForSelectMenu: PropTypes.func,
	getTaskStatusesForSelectMenu: PropTypes.func,
	getProcessListForSelectMenu: PropTypes.func,
};

const mapStateToProp = (/* state */) => ({
	// customer: state.creditRiskOverview.customerDetails,
	// smeLoanRequests: state.creditRiskOverview.smeLoanRequests,
	// overviewData: state.creditRiskOverview.overviewData,
	// pricingParameter: state.creditRiskOverview.pricingParameter,
	// bankAccounts: state.creditRiskOverview.bankAccounts,
});

const mapDispatchToProps = (dispatch) => ({
	getProcessStatusesForSelectMenu: () => dispatch(getProcessStatusesForSelectMenu()),
	getTaskStatusesForSelectMenu: () => dispatch(getTaskStatusesForSelectMenu()),
	getProcessListForSelectMenu: (queryData) => dispatch(getProcessListForSelectMenu(queryData)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(StatusProcessOverview));