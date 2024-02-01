import {
   SWITCH_ADD_NEW_LOAN_APPOINTMENT_POPUP_STATE,
   SET_LOAN_RECOVERY_APPOINTMENT_DATA,
   ADD_OR_UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
   UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA,
   HANDLE_INTEREST_PANELTY_DRAWER,
   STATE_OF_GET_NEW_LOAN_RECOVERY_APPOINTMENT_DATA
} from '../constants/LoanRecoveryApointments';

const loanRecoveryAppointments = (
   state = {
      addNewLoanAppointmentPopupState: false,
      smeLoanRecoveryAppointments: [],
      isOpenInterestPaneltyDrawer: false,
      stateOfGetNewLoanRecoveryData: false
   },
   action
) => {
   switch (action.type) {

      case SWITCH_ADD_NEW_LOAN_APPOINTMENT_POPUP_STATE:
         return Object.assign({}, state, {
            addNewLoanAppointmentPopupState: !state.addNewLoanAppointmentPopupState
         });

      case SET_LOAN_RECOVERY_APPOINTMENT_DATA:
         return Object.assign({}, state, {
            smeLoanRecoveryAppointments: action.appointments
         });
      case ADD_OR_UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA:
         return {
            ...state,
            smeLoanRecoveryAppointments: addOrUpdateArray(state.smeLoanRecoveryAppointments, action.appointment)
         }
      case UPDATE_LOAN_RECOVERY_APPOINTMENT_DATA:
         let index = state.smeLoanRecoveryAppointments.findIndex(appointment => appointment._id.toString() === action.appointment._id.toString())
         state.smeLoanRecoveryAppointments[index] = action.appointment;
         return state;

      case HANDLE_INTEREST_PANELTY_DRAWER:
         return {
            ...state,
            isOpenInterestPaneltyDrawer: !state.isOpenInterestPaneltyDrawer,
         };
      
      case STATE_OF_GET_NEW_LOAN_RECOVERY_APPOINTMENT_DATA:
         return {
            ...state,
            stateOfGetNewLoanRecoveryData: action.payload,
         };
   
         

      default:
         return state;
   }
};

const addOrUpdateArray = (array, newArray) => {
   for (let i = 0; i < newArray.length; i++) {
      let newAppointment = newArray[i];
      let index = array.findIndex(appointment => appointment._id.toString() === newAppointment._id.toString())

      if (index >= 0)
         array[index] = newAppointment;
      else
         array.push(newAppointment);
   }
   return array;
}

export default loanRecoveryAppointments;
