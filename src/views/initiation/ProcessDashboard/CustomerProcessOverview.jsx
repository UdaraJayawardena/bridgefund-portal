import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { getProcessStatusesForSelectMenu, getProcessListForSelectMenu } from 'store/initiation/actions/ProcessDashboard.action';


import CustomerOverviewFilter from './FIlterComponents/CustomerOverviewFilter';
import CustomerOverviewTable from './TableComponents/CustomerOverviewTable';

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

class CustomerProcessOverview extends Component {

    componentDidMount() {

        this.props.getProcessStatusesForSelectMenu();
        this.props.getProcessListForSelectMenu({ manualOnly: true, latestVersion: true });
    }


    render() {


        return (
            <React.Fragment>
                <GridContainer>
                    <GridItem xs={12}>
                        <CustomerOverviewFilter />
                    </GridItem>
                </GridContainer>
                <GridContainer>
                    <GridItem xs={12}>
                        <CustomerOverviewTable />
                    </GridItem>
                </GridContainer>
            </React.Fragment>
        );
    }
}

CustomerProcessOverview.propTypes = {
    classes: PropTypes.object.isRequired,
    tabName: PropTypes.string.isRequired,
    getProcessStatusesForSelectMenu: PropTypes.func,
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
    getProcessListForSelectMenu: (queryData) => dispatch(getProcessListForSelectMenu(queryData)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(CustomerProcessOverview));