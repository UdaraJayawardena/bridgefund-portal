import {
  CLEAR_PERSON,
  SET_PERSON,
} from "../constants/Person";

const defaultState = {
  selectedPerson: { value: {}, ua: Date.now() },
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_PERSON:
      return {
        ...state,
        selectedPerson: { value: {}, ua: Date.now() }
      };

    case SET_PERSON:
      return {
        ...state,
        selectedPerson: { value: action.payload, ua: Date.now() }
      };

    default:
      return state;
  }
};
