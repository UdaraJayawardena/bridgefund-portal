import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from './Notifier';
import {
  SAVE_SME_EMAILS,
  CLEAR_SME_EMAILS,
  SAVE_NOTIFICATIONS,
  CLEAR_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
  UPDATE_NOTIFICATIONS,
  SET_SEARCHED_QUERY_FOR_MESSAGES_LIST,
  SET_PAGINATION_FOR_MESSAGES_LIST,
  SET_MESSAGES_LIST,
  HANDLE_LOADING_MESSAGES_LIST,
  CLEAR_MESSAGES_LIST_STATES,
  SET_SEARCHED_QUERY_FOR_ADMIN_MESSAGES_LIST,
  SET_ADMIN_MESSAGES_LIST,
  SET_PAGINATION_FOR_ADMIN_MESSAGES_LIST,
  HANDLE_LOADING_ADMIN_MESSAGES_LIST,
  CLEAR_ADMIN_MESSAGES_LIST_STATES
} from "../constants/Notifications";
import util from "lib/loanmanagement/utility";
import { addQueryParams, encodeQueryData } from 'lib/initiation/utility';

/******************************************
 *               BASE URLS                *
 *****************************************/

const NOTIFICATION_API = ENV.NOTIFICATION_SERVICE_URL;
const COMMUNICATION_SERVICE_API = ENV.COMMUNICATION_SERVICE_URL;

/******************************************
 *               API CALLS                *
 *****************************************/

export const retrieveNotifications = (params) => {

  const queryParams = {
    type: params.type,
    status: params.status,
  };
  const bodyParams = {
    dateRangeQuery: {
      startDate: params.startDate,
      endDate: params.endDate,
    }
  };

  const data = {
    url: NOTIFICATION_API + `/${params.method}/query?` + util.addQueryParams(queryParams),
    body: bodyParams
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          if (!result.success) throw result;
          dispatch(saveNotifications(result.data));
        })
        .catch(error => {
          if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
          else dispatch(displayNotification('Retrieve Notifications - Unexpected Error Occurred!', 'error'));
        });
    });
  };
};

export const retrieveEmailNotificationsBySme = requestData => {

  const data = {
    url: NOTIFICATION_API + ('/emails/query'),
    body: requestData
  };

  return async dispatch => {
    return await new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          if (!result.success) throw result;
          dispatch(saveSmeEmails(result.data));
          return result;
        })
        .catch(error => {
          if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
          else dispatch(displayNotification('Retrieve Email Notifications - Unexpected Error Occurred!', 'error'));
          return reject();
        });
    });
  };

  // return async dispatch => {
  //   await fetch(NOTIFICATION_API + '/emails/query', {
  //     method: 'post',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       metaQuery: {
  //         smeId: smeId
  //       }
  //     })
  //   })
  //     .then(res => res.json())
  //     .then(result => {
  //       if (!result.success) throw result;
  //       dispatch(saveSmeEmails(result.data));
  //     })
  //     .catch(error => {
  //       if (error.error && error.error.errmsg) dispatch(displayNotification(error.error.errmsg, 'error'));
  //       else dispatch(displayNotification('Retrieve Email Notifications - Unexpected Error Occurred!', 'error'));
  //     });
  // };
};

// New endpoint to retreive emails with pagination (communication-service)
export const getMessagesListForLoanDashboard = (requestParams) => async dispatch => {
	dispatch(setSearchedQueryForMessagesList(requestParams)); // to set the searched query
	dispatch(handleLoadingMessagesList(true));

	const request = {
		url: COMMUNICATION_SERVICE_API + '/emails?' + util.addQueryParams(requestParams),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_MESSAGES_LIST, payload: response.data.records });
		const metaData = response.data._metaData;
		delete metaData.links;
		dispatch(setPaginationForMessagesList({ ...metaData, page: metaData.page-1, perPage: requestParams.perPage }));
		dispatch(handleLoadingMessagesList(false));
		return response;

	} catch (error) {
		console.error('Fetching Messages List Failed. ', error);
		dispatch(handleLoadingMessagesList(false));
		dispatch(displayNotification("Fetching Messages List Failed. ", "error"));
		throw Error('Unexpected error occured while fetching messages! Please try again.');
	}
};

export const getMessagesListForAdminDashboard = (requestParams) => async dispatch => {
	dispatch(setSearchedQueryForAdminMessagesList(requestParams)); // to set the searched query
	dispatch(handleLoadingAdminMessagesList(true));

	const request = {
		url: requestParams._id ? COMMUNICATION_SERVICE_API + '/emails/' + requestParams._id : COMMUNICATION_SERVICE_API + '/emails?' + util.addQueryParams(requestParams),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: SET_ADMIN_MESSAGES_LIST, payload: response.data.records });
		const metaData = response.data._metaData;
		delete metaData.links;
		dispatch(setPaginationForAdminMessagesList({ ...metaData, page: metaData.page-1, perPage: requestParams.perPage }));
		dispatch(handleLoadingAdminMessagesList(false));
		return response;

	} catch (error) {
		console.error('Fetching Messages List Failed. ', error);
		dispatch(handleLoadingAdminMessagesList(false));
		dispatch(displayNotification("Fetching Messages List Failed. ", "error"));
		throw Error('Unexpected error occured while fetching messages! Please try again.');
	}
};

export const sendEmail = emailContent => {
  const data = {
    url: NOTIFICATION_API + '/emails?onTimeSend=true',	
    body: emailContent
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(response => {
          if (response.success && response.data[0].status === "success") {	
            dispatch(displayNotification('Email sent to the client successfully', 'success'));	
          }else{	
            dispatch(displayNotification('Unexpected error occured when sending the email from backend responce', 'error'));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(displayNotification('Unexpected error occured when sending the email', 'error'));

        });
    });
  };
  // return async dispatch => {
  //   await fetch(NOTIFICATION_API + '/emails/',
  //     {
  //       method: 'post',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(emailContent)
  //     })
  //     .then(res => res.json())
  //     .then(response => {
  //       if (response.success)
  //         return fetch(NOTIFICATION_API + '/emails/send', {
  //           method: 'post',
  //           headers: {
  //             Accept: 'application/json',
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify({
  //             "type": emailContent.type,
  //             "cluster": emailContent.cluster
  //           })
  //         });
  //       else throw response;
  //     })
  //     .then(res => res.json())
  //     .then(response => {
  //       if (response.success) {
  //         dispatch(displayNotification('Email sent to the client successfully', 'success'));
  //       } else {
  //         console.log(response);
  //         dispatch(displayNotification('Email could not be sent', 'error'));
  //       }
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       dispatch(displayNotification('Unexpected error occured when sending the email', 'error'));
  //     });
  // };
};

export const sendNotificationById = (ids, method) => {

  const bodyParams = {
    queryArray: {
      _id: ids
    }
  };

  const data = {
    url: NOTIFICATION_API + `/${method}/send/query`,
    body: bodyParams
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(displayNotification('Email sent to the client successfully', 'success'));
            dispatch(updateNotifications(result.data));
          } else {
            dispatch(displayNotification('Email could not be sent', 'error'));
          }
        })
        .catch(error => {
          console.log('error', error);
          dispatch(displayNotification('Unexpected error occured when sending the email', 'error'));
        });
    });
  };

};

/******************************************
 *             Redux Calls                *
 *****************************************/

export const clearSmeEmailNotifications = () => ({ type: CLEAR_SME_EMAILS });

export const clearNotifications = () => ({ type: CLEAR_NOTIFICATIONS });

export const updateNotification = (notification) => ({ type: UPDATE_NOTIFICATION, notification });

/**************************
*    Private Functions   *
*************************/

const saveSmeEmails = emails => ({ type: SAVE_SME_EMAILS, emails });
const saveNotifications = (notifications) => ({ type: SAVE_NOTIFICATIONS, notifications });
const updateNotifications = (notifications) => ({ type: UPDATE_NOTIFICATIONS, notifications });

export const setSearchedQueryForMessagesList = (query) => {
	return {
		type: SET_SEARCHED_QUERY_FOR_MESSAGES_LIST,
		payload: query
	};
};

export const setPaginationForMessagesList = (data) => {
	return {
		type: SET_PAGINATION_FOR_MESSAGES_LIST,
		payload: data
	};
};

export const handleLoadingMessagesList = (isLoading) => {
	return {
		type: HANDLE_LOADING_MESSAGES_LIST,
		payload: isLoading
	};
};

export const clearMessagesListStates = () => {
	return {
		type: CLEAR_MESSAGES_LIST_STATES
	};
};

// Admin dashboard message methods
export const setSearchedQueryForAdminMessagesList = (query) => {
	return {
		type: SET_SEARCHED_QUERY_FOR_ADMIN_MESSAGES_LIST,
		payload: query
	};
};

export const setPaginationForAdminMessagesList = (data) => {
	return {
		type: SET_PAGINATION_FOR_ADMIN_MESSAGES_LIST,
		payload: data
	};
};

export const handleLoadingAdminMessagesList = (isLoading) => {
	return {
		type: HANDLE_LOADING_ADMIN_MESSAGES_LIST,
		payload: isLoading
	};
};

export const clearAdminMessagesListStates = () => {
	return {
		type: CLEAR_ADMIN_MESSAGES_LIST_STATES
	};
};