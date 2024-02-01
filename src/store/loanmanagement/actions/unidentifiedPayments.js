// import ENV from '../../config/env';
// import { displayNotification } from "./Notifier";
// import {
//   PROCESS_UNIDENTIFIED_PAYMENTS,
//   SWITCH_SAVE_POPUP_STATE,
// } from '../constants/unidentifiedPayments';

// const api = ENV.CUSTOMER_CONTRACTS_URL;

// const requestUnidentifiedPayments = () => {
//   return async dispatch => {
//     await fetch(api + '/unidentifiedPayments')
//       .then(res => res.json())

//       .then(result => {
//         if (result.data == undefined) throw result;
//         return dispatch(processUnidentifiedPayments(result.data));
//       })
//       .catch(error => {
//         dispatch(processUnidentifiedPayments([]));
//         dispatch(displayNotification('Request Unidentified Payments - Unexpected error occured.', 'error'))
//       });
//   };
// };

// const ignorePayment = id => {
//   return async dispatch => {
//     await fetch(api + '/unidentifiedPayment/ignore', {
//       method: 'PUT',

//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ id: id })
//     })
//       .then(res => res.json())
//       .then(result => {
//         if (!result.data) {
//           dispatch(displayNotification('Ignore Payments - ' + result, 'error'))
//         } else {
//           dispatch(displayNotification('Payment ignored.', 'success'))
//           return dispatch(processUnidentifiedPayments(result.data));
//         }
//       })
//       .catch(error => {
//         dispatch(displayNotification('Ignore Payments - Unexpected error occured', 'error'))
//         // dispatch(processUnidentifiedPayments([]));
//       });
//   };
// };

// const addPayment = data => {
//   return async dispatch => {
//     await fetch(api + '/unidentifiedPayment/add', {
//       method: 'PUT',

//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)
//     })
//       .then(res => res.json())
//       .then(result => {
//         if (result.data == undefined) {
//           dispatch(displayNotification('Save Unidentified Payments - ' + result, 'error'))
//         } else {
//           dispatch(processUnidentifiedPayments(result.data));
//           dispatch(displayNotification('Unidentified payment saved', 'success'))
//           return dispatch(showHideSavePopup());
//         }
//       })
//       .catch(error => {
//         dispatch(displayNotification('Save Unidentified Payments - Unexpected error occured', 'error'))
//         console.log(error);
//       });
//   };
// };

// const showHideSavePopup = () => {
//   return {
//     type: SWITCH_SAVE_POPUP_STATE
//   };
// };

// const processUnidentifiedPayments = payments => {
//   return {
//     type: PROCESS_UNIDENTIFIED_PAYMENTS,
//     payments
//   };
// };

// export {
//   requestUnidentifiedPayments,
//   ignorePayment,
//   addPayment,
//   showHideSavePopup
// };
