import {
  CLEAR_PERSON_STAKEHOLDER,
  SET_PERSON_STAKEHOLDER,
  SET_STAKEHOLDER,
  CLEAR_STAKEHOLDER,
  ADD_OR_UPDATE_STAKEHOLDER_LIST,
  ADD_STAKEHOLDER_LIST,
} from "../constants/Stakeholder";

const defaultState = {
  personStakeholder: { value: {}, ua: Date.now() },
  stakeholders: []
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_PERSON_STAKEHOLDER:
      return {
        ...state,
        personStakeholder: { value: {}, ua: Date.now() }
      };

    case SET_PERSON_STAKEHOLDER:
      return {
        ...state,
        personStakeholder: { value: action.payload, ua: Date.now() }
      };

    case SET_STAKEHOLDER:
      return {
        ...state,
        stakeholders: action.payload
      };

    case CLEAR_STAKEHOLDER:
      return {
        ...state,
        stakeholders: []
      };

    case ADD_OR_UPDATE_STAKEHOLDER_LIST: {
      const stakeholders = state.stakeholders;
      const index = stakeholders.findIndex(stkh => stkh._id === action.payload._id);
      if (index === -1) stakeholders.push(action.payload);
      else stakeholders[index](action.payload);
      return {
        ...state,
        stakeholders
      };
    }

    case ADD_STAKEHOLDER_LIST: {
      const stakeholders = state.stakeholders;

      action.payload.forEach(stakeholder => {
        const index = stakeholders.findIndex(stkh => stkh.customerId === stakeholder.customerId && stkh.personId === stakeholder.personId);
        index === -1 ? stakeholders.push(stakeholder) : stakeholders[index] = stakeholder;
      });

      return {
        ...state,
        stakeholders
      };
    }

    default:
      return state;
  }
};
