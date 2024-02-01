import moment from "moment";

const defaultState = {
  systemDate: moment().format('YYYY-MM-DD'),

};

export default (state = defaultState, action) => {
  switch (action.type) {

    // case SET_SYSTEM_DATE:
    //   return {
    //     ...state,
    //     systemDate: action.payload
    //   };

    default:
      return state;
  }
};
