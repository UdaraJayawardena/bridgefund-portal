/* eslint-disable import/no-anonymous-default-export */
import {
	SET_ROLES_FOR_SELECT_MENU, SET_PROCESS_STATUSES_FOR_SELECT_MENU, SET_TASK_STATUSES_FOR_SELECT_MENU,
	SET_PROCESS_LIST_FOR_SELECT_MENU, SET_TASK_DATA_LIST, CLEAR_TASK_DATA_LIST, SET_USERS_FOR_SELECT_MENU, SET_PAGINATION_FOR_MY_TASKS_LIST,
	SET_SEARCHED_QUERY_FOR_MY_TASKS_LIST, CLEAR_PROCESS_DATA_LIST, SET_PROCESS_DATA_LIST, HANDLE_PROCESS_DATA_LIST_LOADING, HANDLE_TASK_DATA_LIST_LOADING,
	SET_PAGINATION_FOR_PROCESS_DATA_LIST,
	SET_SEARCHED_QUERY_FOR_PROCESS_DATA_LIST,
	SET_SELECTED_CONTRACT_ID
} from 'store/initiation/constants/ProcessDashboard';


const defaultState = {
	processStatusValues: [],
	taskStatusValues: [],
	roles: [],
	users: [],
	processList: [],
	searchedProcessDataList: [],
	searchedTaskDataList: [],
	myTaskListQuery: {},
	processDataListQuery: {},
	myTaskListPagination: {
		page: 0,
		pageCount: 0,
		perPage: 10,
		totalCount: 0
	},
	processDataListPagination: {
		page: 0,
		pageCount: 0,
		perPage: 10,
		totalCount: 0
	},
	isLoadingTaskDataList: false,
	isLoadingProcessDataList: false,
	selectedContractId: ''
};

export default (state = defaultState, action) => {
	switch (action.type) {

		case SET_PROCESS_STATUSES_FOR_SELECT_MENU:
			return {
				...state,
				processStatusValues: action.payload,
			};

		case SET_TASK_STATUSES_FOR_SELECT_MENU:
			return {
				...state,
				taskStatusValues: action.payload,
			};

		case SET_ROLES_FOR_SELECT_MENU:
			return {
				...state,
				roles: action.payload,
			};

		case SET_USERS_FOR_SELECT_MENU:
			return {
				...state,
				users: action.payload,
			};

		case SET_PROCESS_LIST_FOR_SELECT_MENU:
			return {
				...state,
				processList: action.payload,
			};

		case SET_TASK_DATA_LIST:
			return {
				...state,
				searchedTaskDataList: action.payload,
			};

		case CLEAR_TASK_DATA_LIST:
			return {
				...state,
				searchedTaskDataList: [],
			};

		case HANDLE_TASK_DATA_LIST_LOADING:
			return {
				...state,
				isLoadingTaskDataList: action.payload,
			};

		case SET_PROCESS_DATA_LIST:
			return {
				...state,
				searchedProcessDataList: action.payload,
			};

		case CLEAR_PROCESS_DATA_LIST:
			return {
				...state,
				searchedProcessDataList: [],
			};

		case HANDLE_PROCESS_DATA_LIST_LOADING:
			return {
				...state,
				isLoadingProcessDataList: action.payload,
			};

		case SET_SEARCHED_QUERY_FOR_MY_TASKS_LIST:
			return {
				...state,
				myTaskListQuery: action.payload,
			};

		case SET_SEARCHED_QUERY_FOR_PROCESS_DATA_LIST:
			return {
				...state,
				processDataListQuery: action.payload,
			};

		case SET_PAGINATION_FOR_MY_TASKS_LIST:
			return {
				...state,
				myTaskListPagination: action.payload,
			};

		case SET_PAGINATION_FOR_PROCESS_DATA_LIST:
			return {
				...state,
				processDataListPagination: action.payload,
			};
		
		case SET_SELECTED_CONTRACT_ID:
			return {
				...state,
				selectedMyTaskContractId: action.payload,
			};

		default:
			return state;
	}
};
