import ENV from '../../../config/env';
import { httpService } from "../service/httpService";
import { displayNotification } from './Notifier';
import util from "lib/loanmanagement/utility";

const configurationApi = ENV.CONFIGURATION_URL;

export const getNextWorkingDate = (startDay, numberOfDaysAhead, country = 'NL') => {
  return dispatch => {

    const requestData = {
      url: configurationApi + `/holidays/next-working-day/${startDay}/${numberOfDaysAhead}?${util.addQueryParams({country: country})}`,
    };

    return httpService.get(requestData, dispatch)
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

  return dispatch => {

    const requestData = {
      url: configurationApi + `/holidays/previous-working-day/ ${startDay}/${numberOfDaysBehind}`,
    };

    return httpService.get(requestData, dispatch)
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
