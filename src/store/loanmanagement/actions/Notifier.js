import { ENQUEUE_SNACKBAR, REMOVE_SNACKBAR } from "../constants/Notifier";

const enqueueSnackbar = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      ...notification,
   },
});

/**
 * Send the notification to the queue with the settings aplicable for each type
 * @param {String} message - Message to be shown
 * @param {String} type - [success,warning,error,info,default]
 */
export const displayNotification = (message, type, duration = null) => {
   let notification = {
      key: new Date().getTime() + Math.random(),
      message: type ? message : ''
   }
   if (!type) {
      notification = {
         ...message
      }
   }
   notification.key = new Date().getTime() + Math.random();

   return dispatch => {
      switch (type) {
         case 'success':
            dispatch(showSuccess(notification, duration))
            break;
         case 'error':
            dispatch(showError(notification))
            break;
         case 'warning':
            dispatch(showWarning(notification))
            break;
         case 'info':
            dispatch(showInfo(notification))
            break;
         case 'default':
            dispatch(showDefault(notification))
            break;
         case 'warning-stay':
            dispatch(showWarningStay(notification))
            break;
         default:
            dispatch(enqueueSnackbar(notification))
            break;
      }
   }
}

const showSuccess = (notification, duration) => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'success',
         autoHideDuration: duration ? duration : 3000
      },
      ...notification,
   },
});

const showError = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'error',
         autoHideDuration: 8000
      },
      ...notification,
   },
});

const showWarning = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'warning',
         autoHideDuration: 5000
      },
      ...notification,
   },
});

const showWarningStay = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'warning',
         autoHideDuration: null
      },
      ...notification,
   },
});

const showInfo = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'info',
         autoHideDuration: 5000
      },
      ...notification,
   },
});

const showDefault = notification => ({
   type: ENQUEUE_SNACKBAR,
   notification: {
      options: {
         variant: 'default',
      },
      ...notification,
   },
});

export const removeSnackbar = key => ({
   type: REMOVE_SNACKBAR,
   key,
});
