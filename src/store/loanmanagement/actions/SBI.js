import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from "./Notifier";
import {
  SET_SBI_PARENT_LIST
} from '../constants/SBI';

const api = ENV.CONFIGURATION_URL;

export const getSBIParentList = () => {

  // const requestData = { url: api + '/sbis/parent' };

  // return dispatch => {
  //   return new Promise((resolve, reject) => {
  //     return httpService.get(requestData, dispatch)
  //       .then(result => {
  //         if (result.success) {
  //           dispatch(SetSBIParentList(result.data));
            
  //         }
  //         else {
  //           dispatch(displayNotification(result.error.errmsg, 'error'));
  //           dispatch(SetSBIParentList([]));
  //         }
  //       })
  //       .catch(error => {
  //         dispatch(displayNotification('Get SBI List - Unexpected Error occured', 'error'));
  //       });
  //   });
  // };

  return async dispatch => {
    await fetch(api + '/sbi/parent')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          dispatch(SetSBIParentList(result.data));
        }
        else {
          dispatch(displayNotification(result.error.errmsg, 'error'));
          dispatch(SetSBIParentList([]));
        }
      })
      .catch(() => {
        dispatch(displayNotification('Get SBI List - Unexpected Error occured', 'error'));
      });
  };
};

const SetSBIParentList = (SBI_List) => {
  return {
    type: SET_SBI_PARENT_LIST,
    SBI_List
  };
};