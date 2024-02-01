import {
  PROCESS_SELECTED_SME,
  CLEAR_SELECTED_SME
} from '../constants/Smes';

const smes = (
  state = {
    selectedSme: {}
  },
  action
) => {
  switch (action.type) {
    case PROCESS_SELECTED_SME:
      return {
        ...state,
        selectedSme: action.sme
      };

    case CLEAR_SELECTED_SME:
      return {
        ...state,
       selectedSme: {}
      };

    default:
      return state;
  }
};

export default smes;