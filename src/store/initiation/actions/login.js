import ENV from '../../../config/env';

import { displayNotification } from './Notifier';

import Cookies from 'universal-cookie';

import HTTP_SERVICE from '../service/httpService';

import { 
  USER_PERMISSION, SET_ROUTES, 
  SET_DASHBOARD_ITEMS, 
  SET_SELECTED_DASHBOARD_ITEMS, 
  SET_SELECTED_TAB_INDEX, 
  CHECK_IS_DASHBOARD_CONTENT, 
  SET_RESERVED_DASHBOARD, 
  SET_ALL_DASHBOARD_ITEMS , 
  SET_DASHBORDNAVIGATION_STATUS
} from 'store/initiation/constants/user';

import { createUrl, encodeQueryData } from 'lib/initiation/utility';

import { httpService } from 'store/crm/service/httpService';
import { setHeaderDisplayMainData } from 'store/loanmanagement/actions/HeaderNavigation';
import {
  clearHeaderDisplaySubData,
  clearHeaderDisplayMainData,
  clearSelectedCustomer
} from 'store/loanmanagement/actions/HeaderNavigation';
import { clearCalculatedDataOfLoanTransactions, clearLoans, clearSelectedLoan } from 'store/loanmanagement/actions/SmeLoans';
import { clearSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { CLEAR_CUSTOMER } from 'store/crm/constants/Customer';

// Create an encryptor:
// @ts-ignore
const encryptor = require('simple-encryptor')(ENV.ENCRYPTION_KEY);
const FOUNDATION_GATEWAY = createUrl(ENV.FOUNDATION_GATEWAY);

// @ts-ignore
// import {isNullOrEmpty} from 'lib/initiation/utility';

const API_GATEWAY = ENV.INITIATION_GATEWAY_URL;

const cookies = new Cookies();

/******************************************
 *               API CALLS                *
 *****************************************/

export const login = ({ userName, password, token = '' }) => {

  const data = {
    loginData: {
      userId: userName,
      password: password
    }
  };

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/log-in',
        body: data,
        ignoreSession: true
      };

      const routesAndPermissionRequest = {
        url: API_GATEWAY + '/get-permissions-and-routes-for-front-end?' + encodeQueryData({ cluster: 'BF_Initiation', isGetPermissions: true }),
        ignoreSession: false
      };
      const authorizationRequest = {
        url: API_GATEWAY + '/is-authorized',
        ignoreSession: false
      };

      const getToken = token === '' ? HTTP_SERVICE.post(requestData) : Promise.resolve({ token: token });

      return getToken
        .then(result => {
          token = result.token;
          cookies.set('session-token', token, { path: '/', expires: new Date(Date.now() + (12*3600*1000)) });
          return HTTP_SERVICE.get(routesAndPermissionRequest);
        })
        .then(response => {
          dispatch({ type: USER_PERMISSION, payload: response.permissions });
          dispatch({ type: SET_ROUTES, payload: response.routes });
          // dispatch({ type: SET_ROUTES, payload: mockData.routes }); // mock data
          const encrypted = encryptor.encrypt(response.permissions);
          const encryptedRoutes = encryptor.encrypt(response.routes);
          // const encryptedRoutes = encryptor.encrypt(mockData.routes); //mock data

          sessionStorage.setItem('userPermissions', encrypted);
          sessionStorage.setItem('routes', encryptedRoutes);
          return HTTP_SERVICE.post(authorizationRequest);
        })
        .then(authorizationResponse => {

          sessionStorage.setItem('user', authorizationResponse.userDetails.userName);
          sessionStorage.setItem('role', authorizationResponse.userDetails.role);
          // dispatch(setRoleIdInLocalStorage(authorizationResponse.userDetails.role));
          sessionStorage.setItem('userPreferredLanguage ', authorizationResponse.userDetails.preferredLanguage);
          sessionStorage.setItem('profileImage', authorizationResponse.userDetails.profileImage);
          dispatch(displayNotification('Credintial approved.', 'success'));
          dispatch(getMyDashboardsItems());
          return resolve(token);
        })
        .catch((err) => {
          console.error('login error', err);
          cookies.remove('session-token', { path: '/' });
          sessionStorage.clear();
          dispatch(displayNotification('User not authorized.', 'error'));
          return reject();
        });
    });
  };
};

export const isUserAuthentcate = (authenicateType) => {
  const logedInUser = cookies.get('session-token');
  const data = {
    type: authenicateType
  };

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/is-authenticate',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: logedInUser
        },
        body: JSON.stringify(data),
        ignoreSession: true
      };

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          return resolve(result);
        })
        .catch(() => {
          return reject();
        });
    });
  };
};

export const isUserAuthorized = () => {
  const logedInUser = cookies.get('session-token');
  return async dispatch => {

    return new Promise((resolve, reject) => {

      const requestData = {
        url: API_GATEWAY + '/is-authorized',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: logedInUser
        },
        ignoreSession: true
      };

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(result => {
          if (!result.success) throw result;
          console.log("result in auth ", result);
          return resolve(result);
        })
        .catch(() => {
          return reject();
        });
    });
  };
};

export const getUserPermission = () => {

  return async dispatch => {

    return new Promise((resolve, reject) => {

      const permissionRequest = {
        url: API_GATEWAY + '/get-permissions-according-to-user',
        ignoreSession: false
      };

      return HTTP_SERVICE.get(permissionRequest, dispatch)
        .then(permissionRequest => {
          // if(!authorizationResponse.success) throw authorizationResponse;
          dispatch({ type: USER_PERMISSION, payload: permissionRequest.pemissions });
          const encrypted = encryptor.encrypt(permissionRequest.pemissions);
          // sessionStorage.setItem('userPermissions', JSON.stringify(permissionRequest.pemissions));
          sessionStorage.setItem('userPermissions', encrypted);
          return resolve();
        })
        .catch(() => {
          cookies.remove('session-token', { path: '/' });
          sessionStorage.clear();
          return reject();
        });
    });
  };
};


export const getDashboardItems = (query) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY('/get-mydashboard-items?') + encodeQueryData(query),
  };

  try {
    const response = await httpService.get(request, dispatch);
    dispatch({ type: SET_DASHBOARD_ITEMS, payload: response });
    dispatch({ type: SET_ALL_DASHBOARD_ITEMS, payload: encryptor.decrypt(sessionStorage.getItem('all-dashboard-items')) });
    return response;

  } catch (error) {

    console.error('getDashboardItems err', error);
    dispatch(displayNotification("getDashboardItems err ", "error"));
    throw Error('Unexpected error occured! Please try again.');
  }
  // console.log('in action ', query);
  // dispatch({ type: SET_DASHBOARD_ITEMS, payload: mockData.dashboardItems });
  // return mockData.dashboardItems;
};

export const getMyDashboardsSelf = (id) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY(`/get-my-dashboards-self?frontEndPortalId=${id}`),
  };

  try {
    const response = await httpService.get(request, dispatch);
    return response;

  } catch (error) {

    console.error('getMyDashboardsSelf err', error);
    dispatch(displayNotification("getMyDashboardsSelf err ", "error"));
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const clearAllLmGlobal = () => async dispatch => {
  dispatch(clearSelectedCustomer());
  dispatch(clearHeaderDisplaySubData());
  dispatch(clearHeaderDisplayMainData());
  dispatch(clearSelectedLoan());
  dispatch(clearLoans());
  dispatch(clearCalculatedDataOfLoanTransactions());
  dispatch(clearSmeLoanRequestDetails());
  dispatch({ type: CLEAR_CUSTOMER });  
  
};

export const assignDashboards = (requestData) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY('/add-or-delete-multiple-dashboards-for-roles-and-users-by-user'),
    body: requestData
  };

  try {
    const response = await httpService.post(request, dispatch);
    dispatch(displayNotification("My Dashbord changes are accepted", 'success'));
    dispatch(displayNotification("You need to log in back to view dashboard changes", 'warning'));
    return response;
  }
  catch (error) {
    console.error('assignDashboards err', error);
    dispatch(displayNotification("My Dashbord error occured", 'error'));
    throw Error('assignDashboards Error Occurred!');
  }
};

export const getMyDashboardsItems = (myDashboardName = null, roleName = null, userName = null) => {

  return dispatch => {

    return new Promise((resolve, reject) => {
      const requestData = {
        url: FOUNDATION_GATEWAY('/get-mydashboard-items?') + encodeQueryData({ myDashboardName })
      };

      return httpService.get(requestData, dispatch)
        .then((response) => {
          if (myDashboardName === null && roleName === null && userName === null) {
            dispatch({ type: SET_ALL_DASHBOARD_ITEMS, payload: response });
            const encryptedDashboardItems = encryptor.encrypt(response);
            sessionStorage.setItem('all-dashboard-items', encryptedDashboardItems);
          }
          dispatch({ type: SET_ALL_DASHBOARD_ITEMS, payload: encryptor.decrypt(sessionStorage.getItem('all-dashboard-items')) });
          return resolve(response);
        })
        .catch(error => {
          console.error('getMyDashboardsItems', error);
          dispatch(displayNotification("My Dashbord items error occured", 'error'));
          return reject(error);
        });

    });

  };
};

export const updateMyDashboardItems = (requestData) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY('/update-my-dashboard-item'),
    body: requestData
  };

  try {
    const response = await httpService.post(request, dispatch);
    dispatch(displayNotification("My Dashbord item updated", 'success'));
    dispatch(displayNotification("You need to log in back to view dashboard changes", 'warning'));
    return response;
  }
  catch (error) {
    console.error('updateMyDashboardItems err', error);
    dispatch(displayNotification("Update my Dashbord item error occured", 'error'));
    throw Error('updateMyDashboardItems Error Occurred!');
  }
};

export const setRoutes = routes => ({
  type: SET_ROUTES,
  routes
});

export const setNavigationInDashboards = (navigatingWireFrame) => async dispatch => {

  const currentDashboard = window.location.pathname.replace('/user/', '');
  const allDashboardsForCurrentUser = encryptor.decrypt(sessionStorage.getItem('all-dashboard-items'));
  const foundDashboardItemFromCurrentDashboard = allDashboardsForCurrentUser.find(item => item.wireframeName === navigatingWireFrame && currentDashboard === item.myDashboardName);
  const foundDashboardItemFromAll = !foundDashboardItemFromCurrentDashboard ? allDashboardsForCurrentUser.find(item => item.wireframeName === navigatingWireFrame) : null;

  try {

    // selected wireframe is available in current dashboard
    if (foundDashboardItemFromCurrentDashboard) {
      dispatch(setSelectedTabIndex(foundDashboardItemFromCurrentDashboard.dashboardItemId));
      return null;
    }

    // selected wireframe is not available in current dashboard
    if (foundDashboardItemFromAll) {
      const allDashboardItemsForSelectedItem = allDashboardsForCurrentUser.filter(dItem => dItem.myDashboardName === foundDashboardItemFromAll.myDashboardName);
      const URL = `/user/${foundDashboardItemFromAll.myDashboardName}`;
      // window.history.pushState({ path: URL }, "", URL);
      dispatch(setSelectedDashboardItems(allDashboardItemsForSelectedItem.filter(tab => tab.active).sort((a, b) => a.sequenceNumber - b.sequenceNumber)));
      dispatch(setSelectedTabIndex(foundDashboardItemFromAll.dashboardItemId));
      dispatch(setHeaderDisplayMainData(foundDashboardItemFromAll.myDashboardName));
      return URL;
    }
    dispatch(displayNotification("You do not have access to requested Dashboard Item", 'warning'));
    return null;

  } catch (e) {
    console.error('setNavigationInDashboards err', e);
    dispatch(displayNotification("Update my Dashbord item error occured", 'error'));
    throw Error('setNavigationInDashboards Error Occurred!');
  }

};

export const setDashbordNavigationStatus = (status)  => ({ type: SET_DASHBORDNAVIGATION_STATUS, payload: status });

export const setSelectedDashboardItems = (items) => ({ type: SET_SELECTED_DASHBOARD_ITEMS, payload: items });

export const setSelectedTabIndex = (index) => ({ type: SET_SELECTED_TAB_INDEX, payload: index });

export const checkIsDashboardContent = (condition) => ({ type: CHECK_IS_DASHBOARD_CONTENT, payload: condition });

export const setReservedDashboard = (item) => ({ type: SET_RESERVED_DASHBOARD, payload: item });




export const getFrontEndPortal = (key) => async dispatch =>{

  const request = {
    url: FOUNDATION_GATEWAY(`/get-front-end-portals?key=${key}`)
  };

  try {
    const response = await httpService.get(request, dispatch);
    return response;
  }
  catch (error) {
    console.error('getFrontEndPortal err', error);
    dispatch(displayNotification("get front-end portal error occured", 'error'));
    throw Error('get front-end portal Error Occurred!');
  }
};



export const updateSingleMyDashbord = (requestData) => async dispatch =>{

  const request = {
    url: FOUNDATION_GATEWAY('/update-my-dashboard'),
    body: requestData
  };

  try {
    const response = await httpService.post(request, dispatch);
    dispatch(displayNotification("Update My Dashbord Succesfully", 'success'));
    dispatch(displayNotification("You need to log in back to view dashboard changes", 'warning'));
    return response;
  }
  catch (error) {
    console.error('UpdateSingleDashbords', error);
    dispatch(displayNotification("Update My Dashbords error occured", 'error'));
    throw Error('updateMyDashboardItems Error Occurred!');
  }
};

