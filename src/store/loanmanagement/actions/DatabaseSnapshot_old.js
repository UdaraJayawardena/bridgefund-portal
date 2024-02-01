import ENV from '../../../config/env';
import HTTP_SERVICE from '../service/httpService';
// import HTTP_SERVICE from '../service/httpService';

import { displayNotification } from './Notifier';

import {
  GET_ALL_SNAPSHOTS,
  SHOW_DATABASE_SNAPSHOTS_DIALOG,
  CLOSE_DATABASE_SNAPSHOTS_DIALOG,
  CREATE_SNAPSHOT_STARTED,
  RESTORE_SNAPSHOT_STARTED,
  CREATE_SNAPSHOT_COMPLETED,
  RESTORE_SNAPSHOT_COMPLETED
} from "../constants/DatabaseSnapshot";

/******************************************
 *               BASE URLS                *
 *****************************************/

const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

export const databaseSnapshotRequestUrls = {
  getAllDatabaseSnapshots: API_GATEWAY_URL + '/database-snapshots',
  createDatabaseSnapshot: API_GATEWAY_URL + '/create-database-snapshot',
  restoreDatabaseSnapshot: API_GATEWAY_URL + '/restore-database-snapshot'
};

/******************************************
 *               API CALLS                *
 *****************************************/

export const getAllDatabaseSnapshots = () => {
  return dispatch => {

    return new Promise((resolve, reject) => {

      let requestData = {
        url: databaseSnapshotRequestUrls.getAllDatabaseSnapshots
      };

      return HTTP_SERVICE.get(requestData, dispatch)
        .then((response) => {

          if (response && response.success && response.data) {

            dispatch({
              type: GET_ALL_SNAPSHOTS,
              payload: response.data
            });

            return resolve(response);

          }

          dispatch(displayNotification("Unable to get existing database snapshots", 'error'));
          return reject();

        })
        .catch(() => {

          dispatch(displayNotification("Unable to get existing database snapshots", 'error'));
          return reject();
        })

    });

  }
};

export const createDatabaseSnapshot = (description) => {

  return dispatch => {

    return new Promise((resolve, reject) => {

      dispatch({
        type: CREATE_SNAPSHOT_STARTED
      });

      // const formData = new FormData();
      // formData.append('description', description);
      // JSON.stringify(description)

      const requestData = {
        url: databaseSnapshotRequestUrls.createDatabaseSnapshot,
        body: { description }
      }

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(response => {

          if (response.success) {

            dispatch(getAllDatabaseSnapshots());
            dispatch(displayNotification('successfully created the database snapshot', 'success'));
            return resolve(response.data);
          }
          else {

            if (response.error && response.error.errmsg) {

              dispatch(displayNotification(response.error.errmsg, 'error'));
              reject(null);
            }
            throw response.error;
          }
        })
        .catch((error) => {

          dispatch(displayNotification('Create Database Snapshot - Unexpected error occured!', 'error'));
          return reject(error);
        }).finally(() => {
          dispatch({
            type: CREATE_SNAPSHOT_COMPLETED
          });
        });
    });
  };
};

export const restoreDatabaseSnapshot = (snapshotId) => {

  return dispatch => {

    return new Promise((resolve, reject) => {

      dispatch({
        type: RESTORE_SNAPSHOT_STARTED
      });

      // const formData = new FormData();
      // formData.append('snapshotId', snapshotId);

      const requestData = {
        url: databaseSnapshotRequestUrls.restoreDatabaseSnapshot,
        body: { snapshotId }
      };

      return HTTP_SERVICE.post(requestData, dispatch)
        .then(response => {

          if (response.success) {

            //dispatch(addFunderLoan(response.data));cd
            dispatch(displayNotification('successfully restored the database snapshot. Reloading system....',
              'success'));

            setTimeout(() => {
              window.location.reload();
            }, 3000);

            return resolve(response.data);
          }
          else {

            if (response.error && response.error.errmsg) {

              dispatch(displayNotification(response.error.errmsg, 'error'));
              reject(null);
            }
            throw response.error;
          }
        })
        .catch((error) => {

          dispatch(displayNotification('Restore Database Snapshot - Unexpected error occured!', 'error'));
          return reject(error);
        }).finally(() => {
          dispatch({
            type: RESTORE_SNAPSHOT_COMPLETED
          });
        });
    });
  };
};

/******************************************
 *             Redux Calls                *
 *****************************************/

export const showDatabaseShapshotsDialog = () => ({ type: SHOW_DATABASE_SNAPSHOTS_DIALOG });
export const closeDatabaseShapshotsDialog = () => ({ type: CLOSE_DATABASE_SNAPSHOTS_DIALOG });