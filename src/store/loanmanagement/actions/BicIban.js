import ENV from '../../../config/env';
import httpService from 'store/loanmanagement/service/httpService';

import { PROCESS_BIC } from '../constants/BicIban';

import { displayNotification } from './Notifier';

const configurationApi = ENV.CONFIGURATION_URL;

const getBicFrmIban = iban => {
  return dispatch => {
    const requestData = {
      url: configurationApi + '/banks/iban/' + iban
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        return dispatch(processBic(result.data));
      })
      .catch(() => {
        dispatch(displayNotification('Generate bic - Unexpected error occured!', 'error'));
      });
  };

};

const processBic = bic_no => {
  return {
    type: PROCESS_BIC,
    bic_no
  };
};

export { getBicFrmIban, processBic };
