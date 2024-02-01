import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import GenericTabContainer from 'views/common/DashboardView/GenericTabContainer';
import { clearHeaderDisplayMainData, clearHeaderDisplaySubData, /* setHeaderDisplayMainData */ } from 'store/loanmanagement/actions/HeaderNavigation';

const TABS = [
    {
        "id": "DI000002",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000109",
        "functionalityName": "CRM-customer-list",
        "name": "Charts",
        "sequenceNumber": 1,
        "wireframe": "CreditManagementCharts",
        "primaryScreenIndicator": 1,
        "active": 1
    },
    {
        "id": "DI000003",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000110",
        "functionalityName": "CRM-custoemr-overview",
        "name": "Rules",
        "sequenceNumber": 2,
        "wireframe": "CategoryRules",
        "primaryScreenIndicator": 0,
        "active": 1
    },
    {
        "id": "DI000005",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000110",
        "functionalityName": "CRM-custoemr-overview",
        "name": "Debt-Form",
        "sequenceNumber": 3,
        "wireframe": "DebtForm",
        "primaryScreenIndicator": 0,
        "active": 1
    },
    {
        "id": "DI000006",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000110",
        "functionalityName": "CRM-custoemr-overview",
        "name": "Categories",
        "sequenceNumber": 4,
        "wireframe": "CreditManagementCategories",
        "primaryScreenIndicator": 0,
        "active": 1
    },
    {
        "id": "DI000007",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000110",
        "functionalityName": "CRM-custoemr-overview",
        "name": "ProcessTabContent",
        "sequenceNumber": 5,
        "wireframe": "ProcessTabContent",
        "primaryScreenIndicator": 0,
        "active": 1
    },
    {
        "id": "DI000008",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000110",
        "functionalityName": "CRM-custoemr-overview",
        "name": "Parameters",
        "sequenceNumber": 6,
        "wireframe": "Parameters",
        "primaryScreenIndicator": 0,
        "active": 1
    },
    {
        "id": "DI000009",
        "dashboardId": "D000001",
        "dashboardName": "Credit Management Dashboard",
        "functionalityId": "F000112",
        "functionalityName": "CRM-memo-overview",
        "name": "Internal-Types",
        "sequenceNumber": 7,
        "wireframe": "CreditManagementInternalTypes",
        "primaryScreenIndicator": 0,
        "active": 1
    },
];

class CreditManagementDashBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // this.props.setHeaderDisplayMainData('Credit Management Dashboard');
    }


    render() {

        return (
            <GenericTabContainer tabsList={TABS} />
        );
    }

    componentWillUnmount() {
        this.props.clearHeaderDisplayMainData();
        this.props.clearHeaderDisplaySubData();
    }

}

CreditManagementDashBoard.propTypes = {
    // setHeaderDisplayMainData: PropTypes.func,
    clearHeaderDisplayMainData: PropTypes.func,
    clearHeaderDisplaySubData: PropTypes.func,
};


const mapStateToProp = (/* state */) => ({
});

const mapDispatchToProps = (dispatch) => ({
    // setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),
    clearHeaderDisplayMainData: () => dispatch(clearHeaderDisplayMainData()),
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
});

export default connect(mapStateToProp, mapDispatchToProps)(CreditManagementDashBoard);

