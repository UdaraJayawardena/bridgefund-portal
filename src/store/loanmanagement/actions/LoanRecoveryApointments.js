import ENV from '../../../config/env';
import { displayNotification } from './Notifier';
import {
  SWITCH_ADD_NEW_LOAN_APPOINTMENT_POPUP_STATE,
  SET_LOAN_RECOVERY_APPOINTMENT_DATA,
  ADD_OR_UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
  UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
  STATE_OF_GET_NEW_LOAN_RECOVERY_APPOINTMENT_DATA
  // HANDLE_INTEREST_PANELTY_DRAWER
} from '../constants/LoanRecoveryApointments';

import httpService from "../service/httpService";
import { sendEmail } from "store/loanmanagement/actions/Notifications";	
import { SET_FULL_AMOUNT_OF_DATA } from '../constants/LMGlobal';

const api = ENV.LOAN_MANAGEMENT_URL;
const gateway = ENV.API_GATEWAY_URL;

export const getAllFilteredLoanAppointments = (searchOptions) => async dispatch => {

  try {
    if (searchOptions.smeId === "All" || searchOptions.smeId === "") {
      delete searchOptions.smeId;
    }
    if (searchOptions.internalExternalSwitch === "All" || searchOptions.internalExternalSwitch === "") {
      delete searchOptions.internalExternalSwitch;
    }
    if (searchOptions.status === "All" || searchOptions.status === "") {
      delete searchOptions.status;
    }
    if (searchOptions.country === "All" || searchOptions.country === "") {
      delete searchOptions.country;
    }

    const requestData = {
      url: gateway + ('/Sme-loan-recovery-appointment-get'),
      body: searchOptions
    };

    return httpService.post(requestData, dispatch)
      .then(result => {
        if (result.success) {
          dispatch(setLoanRecoveryAppointmentData(result.data));
          if (result.data.length > 0) dispatch(setAllGetDataAmount(result.data[0].fullLength));
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch(displayNotification('SME Loan Recovery Appointments - Unexpected Error Occured', 'error'));
      });
  } catch (e) {
    throw Error('SME Loan Recovery Appointments - Unexpected Error Occured');
  }
};

export const getLoanAppointmentsByLoanId = (loanId) => {
  return dispatch => {
    const requestData = {
      url: api + '/sme-loan-recovery-appointment/' + loanId
    };

    return httpService.get(requestData, dispatch)
      .then(result => {
        if (result.success) {
          dispatch(setLoanRecoveryAppointmentData(result.data));
        }
      })
      .catch(() => {
        dispatch(displayNotification('SME Loan Recovery Appointments - Unexpected Error Occured', 'error'));
      });
  };
};

export const cerateLoanRecoveryAppointment = (appointment) => {

  const requestData = {
    url: gateway + ('/Sme-loan-recovery-appointment'),
    body: appointment
  };

  return dispatch => {
    return new Promise((resolve, reject) => {

      dispatch(stateOfGetNewLoanRecoveryAppointmentData(false));
      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {
            dispatch(displayNotification('Successfully created the appointment', 'success'));
            //dispatch(addOrUpdateLoanRecoveryAppointments(result.data));
            dispatch(switchAddNewLoanAppointmentPopupState());
            dispatch(stateOfGetNewLoanRecoveryAppointmentData(true));
            if (appointment.externalMessage.trim() !== ''){	
              const  mail = {	
                to: appointment.smeStakeholderEmail,	
                cluster: 'loan-management',	
                type: 'sme-loan-recovery-appointment',	
                metaData: {	
                  templateType: 'LOAN_RECOVERY_APPOINTMENT',	
                  language: appointment.language,	
                  ...appointment	
                },	
                reason: 'sme-loan-recovery-appointment'	
              };	
              dispatch(sendEmail(mail));	
            }
          } else {
            dispatch(displayNotification('Appointment creation error', 'error'));
            dispatch(displayNotification(result.error.errmsg, 'error'));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(displayNotification('SME Loan Recovery Appointments - Unexpected Error Occured', 'error'));
        });
    });
  };

};

// export const updateLoanRecoveryAppointment = (appointment, popupShouldClose = true) => {
//   return async dispatch => {
//     await fetch(api + '/sme-loan-recovery-appointment', 
//     {
//       method: 'put',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(appointment)
//     })
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) {
//           dispatch(displayNotification('Successfully updated the appointment', 'success'));
//           dispatch(updateLoanRecoveryAppointmentData(result.data));
//           if (popupShouldClose) dispatch(switchAddNewLoanAppointmentPopupState());
//         } else {
//           dispatch(displayNotification(result.error.errmsg, 'error'));
//         }
//       })
//       .catch(error => {
//         console.log(error);
//         dispatch(displayNotification('SME Loan Recovery Appointments - Unexpected Error Occured', 'error'));
//       });
//   };
// };

export const updateLoanRecoveryAppointment = (appointment, popupShouldClose = true) => {
  const requestData = {
    url: gateway + ('/Loan-recovery-appointment-update'),
    body: appointment
  };

  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch(stateOfGetNewLoanRecoveryAppointmentData(false));
      return httpService.post(requestData, dispatch)
        .then(result => {
          if (result.success) {
            resolve(result.data);
            dispatch(displayNotification('Successfully updated the appointment', 'success'));
           // dispatch(updateLoanRecoveryAppointmentData(result.data));
            if (popupShouldClose) dispatch(switchAddNewLoanAppointmentPopupState());
            dispatch(stateOfGetNewLoanRecoveryAppointmentData(true));
          } else {
            // dispatch(displayNotification(result.error.errmsg, 'error'));
            dispatch(displayNotification('Error Occoured', 'error'));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(displayNotification('SME Loan Recovery Appointments - Unexpected Error Occured', 'error'));
          reject(error);
        });
    });
  };
};

export const getSmeLoanTransactionsOverview = (params) => {
  return async dispatch => {

    return new Promise((resolve, reject) => {

      if (params && params.loanId) {

        return httpService.get({ url: `${gateway}/sme-loan-transactions-overview?uniqueId=${params.loanId}` })
          .then((response) => resolve(response.data))
          .catch((error) => reject(error));

      }
      dispatch(displayNotification('SME Loan Overview Data - Unexpected Error Occured', 'error'));
      reject("Can't find loanId");


    });

  };
};

export const smeLoanSetInDefault = (params) => {
  return async dispatch => {

    return new Promise((resolve, reject) => {

      if (params && params.loanId) {

        const body = {
          // "loanId": params.loanId
          ...params
        };

        return httpService.post({ url: `${gateway}/sme-loan-set-in-default`, body }, dispatch)
          .then((response) => {
            dispatch(displayNotification('SME Loan Set In-Default - Success', 'success'));
            resolve(response.data);
          })
          .catch((error) => {
            dispatch(displayNotification('SME Loan Set In-Default - Unexpected Error Occured', 'error'));
            reject(error);
          });

      }
      dispatch(displayNotification('SME Loan Set In-Default - Unexpected Error Occured', 'error'));
      reject("Can't find loanId");


    });

  };
};

export const switchAddNewLoanAppointmentPopupState = () => {
  return {
    type: SWITCH_ADD_NEW_LOAN_APPOINTMENT_POPUP_STATE
  };
};

export const setLoanRecoveryAppointmentData = appointments => {
  return {
    type: SET_LOAN_RECOVERY_APPOINTMENT_DATA,
    appointments
  };
};

const addOrUpdateLoanRecoveryAppointments = (appointment) => {
  return {
    type: ADD_OR_UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
    appointment
  };
};

const updateLoanRecoveryAppointmentData = (appointment) => {
  return {
    type: UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
    appointment
  };
};

export const setAllGetDataAmount = fullAmountOfData => ({
  type: SET_FULL_AMOUNT_OF_DATA,
  fullAmountOfData
});

export const stateOfGetNewLoanRecoveryAppointmentData = (payload) => {
  return {
    type: STATE_OF_GET_NEW_LOAN_RECOVERY_APPOINTMENT_DATA,
    payload
  };
};

