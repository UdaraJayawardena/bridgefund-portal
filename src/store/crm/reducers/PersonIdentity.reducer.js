import {
  CLEAR_IDENTITY,
  SET_IDENTITY,
} from "../constants/PersonIdentity";

const defaultState = () => ({
  personIdentity: { value: {}, ua: Date.now() },
});

export default (state = defaultState(), action) => {
  switch (action.type) {

    case CLEAR_IDENTITY:
      return defaultState();

    case SET_IDENTITY:
      return {
        ...state,
        ...setIdentity(action.payload, state)
      };

    default:
      return state;
  }
};

const setIdentity = (identity, state) => {
  let personIdentity = { value: {}, ua: state.personIdentity.ua };

  if (identity.personId) personIdentity = { value: identity, ua: Date.now() };

  return { personIdentity };
};