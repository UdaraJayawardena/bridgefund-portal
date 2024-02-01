import ENV from '../../../config/env';
import { httpService } from "../service/httpService";
import { displayNotification } from './Notifier';
import { HANDLE_INTEREST_PANELTY_DRAWER, CHANGE_INTEREST_PENALTY_DESCRIPTION } from 'store/loanmanagement/constants/InterestPenalty'

const apiGatewayUrl = ENV.API_GATEWAY_URL;

export const showInterestPaneltyModel = () => ({ type: HANDLE_INTEREST_PANELTY_DRAWER });

export const changeInterestPenaltyDescription = (description) => {
  return {
    type: CHANGE_INTEREST_PENALTY_DESCRIPTION,
    payload: description
  };
};

export const confirmInterestPenaltyProcess = (reqData) => {
  const requestData = {
    url: apiGatewayUrl + ('/sme-loan-stop-change-interest-penalty'),
    body: reqData
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      return httpService.post(requestData, dispatch)
        .then(response => {
          if (response.success) {
          dispatch(displayNotification('Successfully Processed Interest Penalty', 'success'));
          dispatch(showInterestPaneltyModel());
          resolve(response);
          return response;
        }
          dispatch(displayNotification('Process Interest Penalty - Unexpected Error Occured', 'error'));
          return null;
                
        })
        .catch(() => {
          dispatch(displayNotification('confirmInterestPenaltyProcess - Unexpected Error Occured', 'error'));
        });
    });
  };

};
