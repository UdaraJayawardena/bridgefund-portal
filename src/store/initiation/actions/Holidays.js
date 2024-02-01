import ENV from '../../../config/env';
import { displayNotification } from './Notifier';

const configurationApi = ENV.CONFIGURATION_URL;

export const getNextWorkingDate = (startDay, numberOfDaysAhead) => {
  return async dispatch => {
    return await fetch(configurationApi + `/holidays/next-working-day/${startDay}/${numberOfDaysAhead}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          return (result.data);
        }
        
          dispatch(displayNotification('get All Holidays By Start Day & Number Of Days Ahead - Unexpected Error Occured', 'error'));
          return null;
        
      })
      .catch(() => {
        dispatch(displayNotification('getNextWorkingDate - Unexpected Error Occured', 'error'));
      });
  };
};

export const getPreviousWorkingDate = (startDay, numberOfDaysBehind) => {
  return async dispatch => {
    return await fetch(configurationApi + `/holidays/previous-working-day/ ${startDay}/${numberOfDaysBehind}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          return (result.data);
        }
        
          dispatch(displayNotification('get All Holidays By Start Day & Number Of Previous Days - Unexpected Error Occured', 'error'));
          return null;
        
      })
      .catch(() => {
        dispatch(displayNotification('getPreviousWorkingDate - Unexpected Error Occured', 'error'));
      });
  };
};
