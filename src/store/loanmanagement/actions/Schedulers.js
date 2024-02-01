import ENV from '../../../config/env';

import { displayNotification } from './Notifier';

import HTTP_SERVICE from '../service/httpService';

const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

export const smeLoanMaturityProcess = () => {

    return async dispatch => {

        return new Promise((resolve, reject) => {

            const requestData = {
                url: API_GATEWAY_URL + '/simulate-sme-loan-maturity-process'
            };

            return HTTP_SERVICE.post(requestData, dispatch)
                .then(response => {
                    if (response.success) {
                        dispatch(displayNotification('Processed Successfully', 'success'));
                        return resolve(response.data);
                    }
                })
                .catch(() => {
                    dispatch(displayNotification('Process Failed', 'error'));
                    return reject();
                });
        });
    };
};

export const generateDailyLoanHistory = () => {

    return async dispatch => {

        return new Promise((resolve, reject) => {

            const requestData = {
                url: API_GATEWAY_URL + '/simulate-daily-loan-history-process'
            };

            return HTTP_SERVICE.post(requestData, dispatch)
                .then(response => {
                    if (response.success) {
                        dispatch(displayNotification('Processed Successfully', 'success'));
                        return resolve(response.data);
                    }
                })
                .catch(() => {
                    dispatch(displayNotification('Process Failed', 'error'));
                    return reject();
                });
        });
    };
};

export const dailyLiquidityOverview = () => {

    return async dispatch => {

        return new Promise((resolve, reject) => {

            const requestData = {
                url: API_GATEWAY_URL + '/simulation-liquidity-overview-generate'
            };

            return HTTP_SERVICE.post(requestData, dispatch)
                .then(response => {
                    if (response.success) {
                        dispatch(displayNotification('Processed Successfully', 'success'));
                        return resolve(response.data);
                    }
                })
                .catch(() => {
                    dispatch(displayNotification('Process Failed', 'error'));
                    return reject();
                });
        });
    };
};

export const processAndReceiveBankTransactions = (body) => {

    return async dispatch => {

        return new Promise((resolve, reject) => {

            const requestData = {
                url: API_GATEWAY_URL + '/process-bank-transactions',
                body: { body }
            };

            return HTTP_SERVICE.post(requestData, dispatch)
                .then(response => {
                    if (response.success) {
                        dispatch(displayNotification('Processed Successfully', 'success'));
                        return resolve(response.data);
                    }
                })
                .catch(() => {
                    dispatch(displayNotification('Process Failed', 'error'));
                    return reject();
                });
        });
    };
};

export const directDebitBatchProcess = (params) => {
    return dispatch => {
        return new Promise((resolve, reject) => {

            const requestData = {
                url: API_GATEWAY_URL + '/generate-transaction-batch',
                body: { ...params, regenerate: false }
            };

            return HTTP_SERVICE.post(requestData, dispatch)
                .then(response => {
                    if (response.success) {
                        dispatch(displayNotification('Processed Successfully', 'success'));
                        return resolve(response.data);
                    }
                })
                .catch(() => {
                    dispatch(displayNotification('Process Failed', 'error'));
                    return reject();
                });
        });
    };
};