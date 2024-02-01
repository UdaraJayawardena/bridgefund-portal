import {
  CLEAR_CDD_INFO,
  SET_CDD_INFO,
  CLEAR_PERSON_CDD_INFO,
} from "../constants/CddInfo";

const defaultState = {
  customerCddInfo: {},
  personCddInfo: {},
  customerCddInfo_ua: Date.now(),
  personCddInfo_ua: Date.now(),
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_CDD_INFO:
      return defaultState;

    case SET_CDD_INFO:
      return {
        ...state,
        ...setCddInfo(action.payload, state)
      };

    case CLEAR_PERSON_CDD_INFO:
      return {
        ...state,
        personCddInfo: {},
        personCddInfo_ua: Date.now(),
      };

    default:
      return state;
  }
};

const setCddInfo = (cddInfo, state) => {
  let customerCddInfo = {};
  let personCddInfo = {};
  let customerCddInfo_ua = state.customerCddInfo_ua;
  let personCddInfo_ua = state.personCddInfo_ua;
  let isPerson = false;

  if (cddInfo.customerId) { customerCddInfo = (cddInfo); customerCddInfo_ua = Date.now(); }
  else if (cddInfo.personId) { personCddInfo = (cddInfo); personCddInfo_ua = Date.now(); isPerson = true; }

  return {
    customerCddInfo: isPerson ? state.customerCddInfo : customerCddInfo,
    personCddInfo, customerCddInfo_ua, personCddInfo_ua
  };
};