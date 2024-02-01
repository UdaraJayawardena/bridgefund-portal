const mockData = {
    "dashboardItems": [
        {
            "id": "DI000002",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000109",
            "functionalityName": "Generic-Tab-Container",
            "dashboardItemName": "Charts",
            "sequenceNumber": 1,
            "wireframeName": "CreditManagementCharts",
            "primaryScreenIndicator": 1,
            "active": 1
        },
        {
            "id": "DI000003",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000110",
            "functionalityName": "CRM-custoemr-overview",
            "dashboardItemName": "Rules",
            "sequenceNumber": 2,
            "wireframeName": "CategoryRules",
            "primaryScreenIndicator": 0,
            "active": 1
        },
        {
            "id": "DI000005",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000110",
            "functionalityName": "CRM-custoemr-overview",
            "dashboardItemName": "Debt-Form",
            "sequenceNumber": 3,
            "wireframeName": "DebtForm",
            "primaryScreenIndicator": 0,
            "active": 1
        },
        {
            "id": "DI000006",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000110",
            "functionalityName": "CRM-custoemr-overview",
            "dashboardItemName": "Categories",
            "sequenceNumber": 4,
            "wireframeName": "CreditManagementCategories",
            "primaryScreenIndicator": 0,
            "active": 1
        },
        {
            "id": "DI000007",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000110",
            "functionalityName": "CRM-custoemr-overview",
            "dashboardItemName": "ProcessTabContent",
            "sequenceNumber": 5,
            "wireframeName": "ProcessTabContent",
            "primaryScreenIndicator": 0,
            "active": 1
        },
        {
            "id": "DI000008",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000110",
            "functionalityName": "CRM-custoemr-overview",
            "dashboardItemName": "Parameters",
            "sequenceNumber": 6,
            "wireframeName": "Parameters",
            "primaryScreenIndicator": 0,
            "active": 1
        },
        {
            "id": "DI000009",
            "dashboardId": "D000001",
            "myDashboardName": "Risk Dashboard",
            "functionalityId": "F000112",
            "functionalityName": "CRM-memo-overview",
            "dashboardItemName": "Internal-Types",
            "sequenceNumber": 7,
            "wireframeName": "CreditManagementInternalTypes",
            "primaryScreenIndicator": 0,
            "active": 1
        }
    ],
    "routes": [
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "SupervisedUserCircle",
            layout: "/user",
            name: "Customer Dashboard",
            origin: "http://localhost:7000",
            path: "/customer-dashboard",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 1,
            rtlName: ""
        },
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "Work",
            layout: "/user",
            name: "Contract Dashboard",
            origin: "http://localhost:7000",
            path: "/contact-dashboard",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 0,
            rtlName: ""
        },
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "AccountBalance",
            layout: "/user",
            name: "Risk Dashboard",
            origin: "http://localhost:7000",
            path: "/risk-dashboard",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 0,
            rtlName: ""
        },
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "Ballot",
            layout: "/user",
            name: "Loans Overview",
            origin: "http://localhost:7000",
            path: "/loans-overview",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 0,
            rtlName: ""
        },
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "Beenhere",/* VideoLabel,ChromeReaderMode,HowToVote,AccountBalanceWallet,LoanLatePaymentOverviewIcon */
            layout: "/user",
            name: "Asset Manager Dashboard",
            origin: "http://localhost:7000",
            path: "/asset-manager-dashboard",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 0,
            rtlName: ""
        },
        {
            children: null,
            cluster: "CRM",
            component: "GenericTabContainer",
            hide: false,
            icon: "ListAlt",
            layout: "/user",
            name: "Finance Dashboard",
            origin: "http://localhost:7000",
            path: "/finance-dashboard",
            permission: "Generic-Tab-Container",
            primaryScreenIndicator: 0,
            rtlName: ""
        }
    ]
};

export default mockData;