import ENV from '../../../config/env';
import { createUrl } from 'lib/loanmanagement/utility';
import { httpService } from '../service/httpService';
import {
  GET_SNAPSHOT_LIST, HANDLE_SNAPSHOT_DIALOG_SHOWING,
  HANDLE_SNAPSHOT_DIALOG_LOADING
} from "../constants/Snapshot.js";
import { displayNotification } from './Notifier';


/******************************************
 *               BASE URLS                *
 *****************************************/

const FOUNDATION_GATEWAY_URL = createUrl(ENV.FOUNDATION_GATEWAY);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getAllSnapshots = () => async dispatch => {

  const request = { url: FOUNDATION_GATEWAY_URL('/get-snapshots') };

  try {
    const response = await httpService.get(request, dispatch);

    dispatch({ type: GET_SNAPSHOT_LIST, payload: response.data });
    // console.log(response);
    return response;

  } catch (error) {

    console.error('getAllSnapshots err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const createSnapshot = (requestBody) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY_URL('/create-snapshot'),
    body: requestBody
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch(displayNotification('Successfully created the Snapshot', 'success'));
    dispatch(getAllSnapshots());
    // dispatch(handleSnapshotDialogShowing(false));
    dispatch(handleSnapshotDialogLoading(false));

    return response;

  }
  catch (error) {
    dispatch(handleSnapshotDialogLoading(false));
    console.error('createSnapshot err', error);
    // throw Error('Unexpected error occured! Please try again.');
    dispatch(displayNotification(error.message, 'error'));
  }
};

export const restoreSnapshot = (requestBody) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY_URL('/restore-snapshot'),
    body: requestBody,
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch(displayNotification('Successfully restored the Snapshot', 'success'));
    dispatch(handleSnapshotDialogShowing(false));
    dispatch(handleSnapshotDialogLoading(false));

    return response;

  }
  catch (error) {
    dispatch(handleSnapshotDialogLoading(false));
    console.error('restoreSnapshot err', error);
    // throw Error('Unexpected error occured! Please try again.');
    dispatch(displayNotification(error.message, 'error'));
  }
};

export const deleteSnapshot = (requestBody) => async dispatch => {

  const request = {
    url: FOUNDATION_GATEWAY_URL('/delete-snapshot'),
    body: requestBody,
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch(displayNotification('Successfully deleted the Snapshot', 'success'));
    // dispatch(handleSnapshotDialogShowing(false));
    dispatch(getAllSnapshots());
    dispatch(handleSnapshotDialogLoading(false));

    return response;

  }
  catch (error) {
    dispatch(handleSnapshotDialogLoading(false));
    console.error('deleteSnapshot err', error);
    // throw Error('Unexpected error occured! Please try again.');
    dispatch(displayNotification(error.message, 'error'));
  }
};

export const downloadSnapshot = (requestURL) => async dispatch => {
  const request = { url: requestURL };

  try {
    httpService.download(request, dispatch)
   .then((response) => {
    dispatch(handleSnapshotDialogLoading(true));
    let fileName = "snapshot.zip"
    if(response.headers && response.headers.get('Content-Disposition').split('filename=')[1]){
      let newFileName = response.headers && response.headers.get('Content-Disposition').split('filename=')[1];
      fileName = newFileName.replace(/"/g, '');
    }

    response.blob().then(blob => {
      const url = window.URL.createObjectURL(
        new Blob([blob]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${fileName}`,
      );
      
      document.body.appendChild(link);
      // Start download
      link.click();
      link.parentNode.removeChild(link);
      dispatch(handleSnapshotDialogLoading(false));
    })    
   });
  }catch (error) {
    dispatch(handleSnapshotDialogLoading(false));
    console.error('downloadSnapshot err', error);
    // throw Error('Unexpected error occured! Please try again.');
    dispatch(displayNotification(error.message, 'error'));
  }
};


/******************************************
 *             Redux Calls                *
 *****************************************/

export const handleSnapshotDialogShowing = (isOpen) => ({ type: HANDLE_SNAPSHOT_DIALOG_SHOWING, payload: isOpen });

export const handleSnapshotDialogLoading = (isLoading) => ({ type: HANDLE_SNAPSHOT_DIALOG_LOADING, payload: isLoading });

/**************************
 *    Private Functions   *
 *************************/