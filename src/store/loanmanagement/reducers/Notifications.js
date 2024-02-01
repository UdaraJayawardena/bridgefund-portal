import {
  SAVE_SME_EMAILS,
  CLEAR_SME_EMAILS,
  SAVE_NOTIFICATIONS,
  CLEAR_NOTIFICATIONS,
  UPDATE_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
  SET_MESSAGES_LIST,
  CLEAR_MESSAGES_LIST_STATES,
  SET_SEARCHED_QUERY_FOR_MESSAGES_LIST,
  HANDLE_LOADING_MESSAGES_LIST,
  SET_PAGINATION_FOR_MESSAGES_LIST,
  HANDLE_LOADING_ADMIN_MESSAGES_LIST,
  SET_SEARCHED_QUERY_FOR_ADMIN_MESSAGES_LIST,
  SET_PAGINATION_FOR_ADMIN_MESSAGES_LIST,
  SET_ADMIN_MESSAGES_LIST,
  CLEAR_ADMIN_MESSAGES_LIST_STATES
} from "../constants/Notifications";

const Notification = (
  state = {
    smeEmails: [],
    notificationList: [],
    messagesListPagination: {
      page: 0,
      pageCount: 0,
      perPage: 25,
      totalCount: 0
    },
    adminMessagesListPagination: {
      page: 0,
      pageCount: 0,
      perPage: 25,
      totalCount: 0
    },
  },
  action
) => {
  switch (action.type) {
    case SAVE_SME_EMAILS:
      return {
        ...state,
        smeEmails: action.emails
      };
    case CLEAR_SME_EMAILS:
      return {
        ...state,
        smeEmails: []
      };

    case SAVE_NOTIFICATIONS:
      return {
        ...state,
        notificationList: action.notifications
      };

    case CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notificationList: []
      };

    case UPDATE_NOTIFICATION: {
      const allNotifications = JSON.parse(JSON.stringify(state.notificationList));
      const index = allNotifications.findIndex(notification => notification._id.toString() === action.notification._id.toString());
      allNotifications[index] = action.notification;
      return {
        ...state,
        notificationList: allNotifications
      };
    }

    case UPDATE_NOTIFICATIONS: {
      const allNotifications = JSON.parse(JSON.stringify(state.notificationList));
      const updatedData = updateNotifications(allNotifications, action.notifications)
      return {
        ...state,
        notificationList: updatedData
      };
    }

    case HANDLE_LOADING_MESSAGES_LIST:
			return {
				...state,
				isLoadingMessagesList: action.payload,
			};

    case SET_SEARCHED_QUERY_FOR_MESSAGES_LIST:
			return {
				...state,
				MessagesListQuery: action.payload,
			};

    case SET_MESSAGES_LIST:
			return {
				...state,
				smeEmails: action.payload,
		  };

    case CLEAR_MESSAGES_LIST_STATES:
      return {
        ...state,
        smeEmails: [],
        messagesListPagination: {
          page: 0,
          pageCount: 0,
          perPage: 25,
          totalCount: 0
        }
      };
    
    case SET_PAGINATION_FOR_MESSAGES_LIST:
      return {
        ...state,
        messagesListPagination: action.payload,
      };

    case HANDLE_LOADING_ADMIN_MESSAGES_LIST:
      return {
        ...state,
        isLoadingAdminMessagesList: action.payload,
      };
  
    case SET_SEARCHED_QUERY_FOR_ADMIN_MESSAGES_LIST:
      return {
        ...state,
        adminMessagesListQuery: action.payload,
      };
  
    case SET_ADMIN_MESSAGES_LIST:
      return {
        ...state,
        notificationList: action.payload,
      };
  
    case CLEAR_ADMIN_MESSAGES_LIST_STATES:
      return {
        ...state,
        notificationList: []
      };
      
    case SET_PAGINATION_FOR_ADMIN_MESSAGES_LIST:
      return {
        ...state,
        adminMessagesListPagination: action.payload,
      };

    default:
      return state;
  }
};

export default Notification;

const updateNotifications = (allNotifications, updatedData) => {

  for (const data of updatedData) {

    const index = allNotifications.findIndex(notification => notification._id.toString() === data._id.toString());

    if (index < 0) continue;

    allNotifications[index] = data;
  }
  return allNotifications;
};