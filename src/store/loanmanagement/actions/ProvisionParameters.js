// import moment from 'moment';
import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  PROVISION_PARAMETERS,
  PROVISION_PARAMETER_HISTORY,
  CREATE_PROVISION_PARAMETERS
} from '../constants/ProvisionParameters';

const api = ENV.SETTINGS_URL;

const getProvisionParameters = (status) => {

  const requestData = { url: api + '/system-configs/provision-parameter/' + status };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          dispatch(processProvisionParameters(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Get Provision Parameters - Unexpected error occured.', 'error'));
          reject(error);
        });
    });
  };

};

const getProvisionParameterHistory = (status) => {

  const requestData = { url: api + '/system-configs?name=ProvisionParameter' };

  return dispatch => {
    return new Promise((resolve, reject) => {
      return httpService.get(requestData, dispatch)
        .then(result => {
          dispatch(processProvisionParameterHistory(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Get Provision Parameter History - Unexpected error occured.', 'error'));
          reject(error);
        });
    });
  };
  
};

const createProvisionParameters = (newProvisionParameter) => {

  const newProvisionParameterList = newProvisionParameter.provisionParameters;
  // console.log('in action ',newProvisionParameterList);

  const data = {
    url: api + ('/system-configs/provision-parameter'),
    body: newProvisionParameterList
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(data, dispatch)
        .then(result => {
          dispatch(setProvisionParameters(result.data));
        })
        .catch(error => {
          dispatch(displayNotification('Create Provision Parameters - Unexpected error occured.', 'error'));
          reject(error);
        });
    });
  };
  
};

const emptyProvisionParameters = (object) => {

  return async (dispatch) => {
    dispatch(clearProvisionParameters([]));
  };

};

const processProvisionParameters = provisionParameters => {
  return {
    type: PROVISION_PARAMETERS,
    provisionParameters
  };
};

const processProvisionParameterHistory = provisionParameterHistory => {
  return {
    type: PROVISION_PARAMETER_HISTORY,
    provisionParameterHistory
  };
};

const setProvisionParameters = provisionParameters => {
  return {
    type: CREATE_PROVISION_PARAMETERS,
    provisionParameters
  };
};

const clearProvisionParameters = provisionParameters => {
  return {
    type: PROVISION_PARAMETERS,
    provisionParameters
  };
};

export { getProvisionParameters, getProvisionParameterHistory, createProvisionParameters, emptyProvisionParameters };