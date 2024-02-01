import {
    USER_PERMISSION,
    SET_ROUTES,
    SET_DASHBOARD_ITEMS,
    SET_SELECTED_DASHBOARD_ITEMS,
    SET_SELECTED_TAB_INDEX,
    CHECK_IS_DASHBOARD_CONTENT,
    SET_RESERVED_DASHBOARD,
    SET_ALL_DASHBOARD_ITEMS,
    SET_DASHBORDNAVIGATION_STATUS,
} from "../constants/user";


const defaultState = {
    permissionList: [],
    routes: [],
    dashboardItems: [],
    selectedDashboardItems: [],
    selectedTabIndex: null,
    isDashboardContent: false,
    reservedDashboard: '',
    allDashboardItemsForCurrentUser: [],
    dashbordNavigationStatus: false
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = defaultState, action) => {
    switch (action.type) {

        case USER_PERMISSION:
            return {
                ...state,
                permissionList: action.payload
            };
        case SET_ROUTES:
            return {
                ...state,
                routes: action.payload
            };

        case SET_DASHBOARD_ITEMS:
            return {
                ...state,
                dashboardItems: action.payload
            };

        case SET_ALL_DASHBOARD_ITEMS:
            return {
                ...state,
                allDashboardItemsForCurrentUser: action.payload
            };

        case SET_SELECTED_DASHBOARD_ITEMS:
            return {
                ...state,
                selectedDashboardItems: action.payload
            };
        case SET_SELECTED_TAB_INDEX:
            return {
                ...state,
                selectedTabIndex: action.payload
            };
        case CHECK_IS_DASHBOARD_CONTENT:
            return {
                ...state,
                isDashboardContent: action.payload
            };
        case SET_RESERVED_DASHBOARD:
            return {
                ...state,
                reservedDashboard: action.payload
            };
        case SET_DASHBORDNAVIGATION_STATUS:
            return {
                ...state,
                dashbordNavigationStatus: action.payload
            };
        default:
            return state;
    }
};