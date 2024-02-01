import {
    GET_FILTER_LIST
  } from "../constants/workflowManagement";
  
  const defaultState = {
    filterList: []
  };
  
  export default (state = defaultState, action) => {
    switch (action.type) {
  
      case GET_FILTER_LIST:
        return {
          ...state,
          filterList: action.payload,
        };
        
      default:
        return state;
    }
  };
  