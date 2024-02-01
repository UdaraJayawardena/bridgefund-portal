import { createUrl } from 'lib/crm/utility';
import ENV from '../../../config/env';
import httpService from '../service/httpService';
import { displayNotification } from './Notifier';

const SMS_ADAPTER_URL = createUrl(ENV.SMS_ADAPTER_URL);
const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

export const sendSMS = (requestBody) => async dispatch => {
    try {
        const request = {
            url: SMS_ADAPTER_URL('/sms/send'),
            body: requestBody
        };

        const response = await httpService.post(request, dispatch);

        dispatch(displayNotification('SMS sent successfully', 'success'));

        return response;

    } catch (error) {
        console.log('sendSMS', error);
        throw Error('Unexpected error occured! Please try again.');
    }
};

export const getPhoneNumber = (contractId) => async dispatch => {
    try {

        const request = {
            url: CRM_GATEWAY_URL(`/crm-management/vtiger-crm/potentials/contract-id/${contractId}/phone-number`)
        };

        const response = await httpService.get(request, dispatch);

        const phoneNumber = _validatePhone(response);

        return phoneNumber;

    } catch (error) {
        console.log('getPhoneNumber', error);
        throw Error('Unexpected error occured! Please try again.');
    }
};

const _validatePhone = (phone) => {
    const phoneNumber = phone.toString().replace(/\s|-/g, '').trim();
    const fromatedPhone = phoneNumber.replace(/^(31|0)/g, "+31");
    return fromatedPhone && fromatedPhone.length === 12 ? fromatedPhone : phoneNumber;
};