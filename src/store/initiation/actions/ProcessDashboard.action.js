import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
import { displayNotification } from './Notifier';
import {
	SET_ROLES_FOR_SELECT_MENU, SET_PROCESS_STATUSES_FOR_SELECT_MENU, SET_TASK_STATUSES_FOR_SELECT_MENU, SET_PROCESS_LIST_FOR_SELECT_MENU,
	SET_TASK_DATA_LIST, CLEAR_TASK_DATA_LIST, SET_USERS_FOR_SELECT_MENU,
	SET_SEARCHED_QUERY_FOR_MY_TASKS_LIST,
	CLEAR_PROCESS_DATA_LIST,
	SET_PROCESS_DATA_LIST,
	HANDLE_TASK_DATA_LIST_LOADING,
	HANDLE_PROCESS_DATA_LIST_LOADING,
	SET_PAGINATION_FOR_PROCESS_DATA_LIST,
	SET_PAGINATION_FOR_MY_TASKS_LIST,
	SET_SEARCHED_QUERY_FOR_PROCESS_DATA_LIST,
	SET_SELECTED_CONTRACT_ID
} from 'store/initiation/constants/ProcessDashboard';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);
const FOUNDATION_GATEWAY_URL = createUrl(ENV.FOUNDATION_GATEWAY);
const CRM_GATEWAT_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getProcessStatusesForSelectMenu = () => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-process-definitions-status'),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_PROCESS_STATUSES_FOR_SELECT_MENU, payload: response });
		return response;

	} catch (error) {

		console.error('getProcessStatusesForSelectMenu err', error);
		dispatch(displayNotification("getProcessStatusesForSelectMenu err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
	// dispatch({ type: SET_PROCESS_STATUSES_FOR_SELECT_MENU, payload: statusList });
	// return statusList;
};

export const getTaskStatusesForSelectMenu = () => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-process-definitions-status'),
		//todo should be changed URL in future for task status values
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_TASK_STATUSES_FOR_SELECT_MENU, payload: response });
		return response;

	} catch (error) {

		console.error('getTaskStatusesForSelectMenu err', error);
		dispatch(displayNotification("getTaskStatusesForSelectMenu err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
	// dispatch({ type: SET_TASK_STATUSES_FOR_SELECT_MENU, payload: statusList });
	// return statusList;
};

export const getRolesForSelectMenu = () => async dispatch => {

	const request = {
		url: FOUNDATION_GATEWAY_URL('/get-role'),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_ROLES_FOR_SELECT_MENU, payload: response });
		return response;

	} catch (error) {

		console.error('getRolesForSelectMenu err', error);
		dispatch(displayNotification("getRolesForSelectMenu err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getCamundaUsersForSelectMenu = () => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-camunda-users'),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_USERS_FOR_SELECT_MENU, payload: response });
		return response;

	} catch (error) {

		console.error('getCamundaUsersForSelectMenu err', error);
		dispatch(displayNotification("getCamundaUsersForSelectMenu err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getProcessListForSelectMenu = (queryData) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-process-definitions?') + encodeQueryData(queryData),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_PROCESS_LIST_FOR_SELECT_MENU, payload: response });
		return response;

	} catch (error) {

		console.error('getProcessListForSelectMenu err', error);
		dispatch(displayNotification("getProcessListForSelectMenu err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getTasksList = (queryData) => async dispatch => {
	// console.log("queryData action getTasksList ", queryData);
	if (!queryData.sortBy) queryData.sortBy = 'startTime';
	if (!queryData.sortOrder) queryData.sortOrder = 'desc';

	dispatch(setSearchedQueryForMyTasksList(queryData)); // to set the searched query
	dispatch(handleTaskDataListLoading(true));

	const request = {
		url: INITIATION_GATEWAY_URL('/get-task-list?') + encodeQueryData(queryData),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_TASK_DATA_LIST, payload: response.records });
		const metaData = response._metaData;
		delete metaData.links;
		// console.log('action ', metaData);
		dispatch(setPaginationForMyTasksList({ ...metaData, page: metaData.page - 1, perPage: queryData.perPage }));
		dispatch(handleTaskDataListLoading(false));
		return response;

	} catch (error) {

		console.error('getTasksList err', error);
		dispatch(handleTaskDataListLoading(false));
		dispatch(displayNotification("getTasksList err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
	// dispatch({ type: SET_TASK_DATA_LIST, payload: serachedProcessList });
	// return serachedProcessList;
};

export const getProcessDataList = (queryData) => async dispatch => {
	// console.log('queryData in action ', queryData);
	if (!queryData.sortBy) queryData.sortBy = 'startTime';
	if (!queryData.sortOrder) queryData.sortOrder = 'desc';
	
	dispatch(setSearchedQueryForProcessDataList(queryData));
	const request = {
		url: INITIATION_GATEWAY_URL('/get-process-list?') + encodeQueryData(queryData),
	};

	dispatch(handleProcessDataListLoading(true));

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_PROCESS_DATA_LIST, payload: response.records });
		const metaData = response._metaData;
		delete metaData.links;
		dispatch(setPaginationForProcessDataList({ ...metaData, page: metaData.page - 1, perPage: queryData.perPage }));
		dispatch(handleProcessDataListLoading(false));
		return response;

	} catch (error) {

		console.error('getProcessDataList err', error);
		dispatch(handleProcessDataListLoading(false));
		dispatch(displayNotification("getProcessDataList err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}

};

export const getPersonListForCustomer = (queryData) => async dispatch => {
	// console.log("queryData action ", queryData);

	const request = {
		url: CRM_GATEWAT_URL('/get-stakeholder?') + encodeQueryData(queryData),
	};

	try {
		const response = await httpService.get(request, dispatch);
		return response;

	} catch (error) {

		console.error('getPersonListForCustomer err', error);
		dispatch(displayNotification("getPersonListForCustomer err ", "error"));
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const createMemo = (requestBody) => async dispatch => {

	const request = {
		url: CRM_GATEWAT_URL('/update-memo'),
		body: requestBody
	};

	try {
		const response = await httpService.post(request, dispatch);
		dispatch(displayNotification('Successfully created the Memo', 'success'));
		return response;

	}
	catch (error) {
		console.error('createMemo err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const completeUserTask = (updatedTask) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/complete-user-task'),
		body: updatedTask
	};

	try {
		const response = await httpService.post(request, dispatch);
		dispatch(displayNotification('Successfully completed the Task', 'success'));
		return response;

	}
	catch (error) {
		console.error('completeUserTask err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const clearTaskDataList = () => {
	return {
		type: CLEAR_TASK_DATA_LIST
	};
};

export const handleTaskDataListLoading = (isLoading) => {
	return {
		type: HANDLE_TASK_DATA_LIST_LOADING,
		payload: isLoading
	};

};

export const clearProcessDataList = () => {
	return {
		type: CLEAR_PROCESS_DATA_LIST
	};
};

export const handleProcessDataListLoading = (isLoading) => {
	return {
		type: HANDLE_PROCESS_DATA_LIST_LOADING,
		payload: isLoading
	};

};

export const setSearchedQueryForMyTasksList = (query) => {
	return {
		type: SET_SEARCHED_QUERY_FOR_MY_TASKS_LIST,
		payload: query
	};
};

export const setSearchedQueryForProcessDataList = (query) => {
	return {
		type: SET_SEARCHED_QUERY_FOR_PROCESS_DATA_LIST,
		payload: query
	};
};

export const setPaginationForMyTasksList = (data) => {
	return {
		type: SET_PAGINATION_FOR_MY_TASKS_LIST,
		payload: data
	};
};

export const setPaginationForProcessDataList = (data) => {
	return {
		type: SET_PAGINATION_FOR_PROCESS_DATA_LIST,
		payload: data
	};
};

export const setSelectedContractId = (id) => ({ type: SET_SELECTED_CONTRACT_ID, payload: id });
