import moment from 'moment';
import { SET_SIMULATION_DATE, CLEAR_SIMULATION_DATE, SIMULATION_DATE_REQUEST } from "../constants/Configurations";

const defaultState = {
  simulations: {
    systemDate: null,
    isWorkingDate: null,
    request: null //pending, success, failed
  }
};

if( process.env.REACT_APP_ENVIRONMENT === 'production' ) {
  defaultState.simulations.systemDate = moment();
}

export default (state = defaultState, action) => {
  switch (action.type) {

    case SET_SIMULATION_DATE: {

      const { simulations } = state;

      simulations.systemDate = action.payload.systemDate;
      simulations.isWorkingDate = action.payload.isWorkingDate;

      return {
        ...state,
        simulations,
      };

    }

    case SIMULATION_DATE_REQUEST: {

      const { simulations } = state;

      simulations.request = action.payload.status;

      return {
        ...state,
        simulations,
      };

    }

    case CLEAR_SIMULATION_DATE: {
      const { simulations } = state;

      simulations.systemDate = null;
      simulations.isWorkingDate = null;

      return {
        ...state,
        simulations,
      };
    }

    default:
      return state;
  }
};
