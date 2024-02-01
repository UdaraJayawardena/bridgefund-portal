import {
  CLEAR_HIGH_RISK_REGISTER,
  SET_HIGH_RISK_REGISTER,
  CLEAR_PERSON_HRR,
} from "../constants/HighRiskRegister";

const defaultState = () => ({
  customerHighRiskReg: { value: {}, ua: Date.now() },
  personHighRiskReg: { value: {}, ua: Date.now() },
});

export default (state = defaultState(), action) => {
  switch (action.type) {

    case CLEAR_HIGH_RISK_REGISTER:
      return defaultState();

    case SET_HIGH_RISK_REGISTER:
      return {
        ...state,
        ...setHRR(action.payload, state)
      };

    case CLEAR_PERSON_HRR:
      return { ...state, personHighRiskReg: { value: {}, ua: Date.now() } };

    default:
      return state;
  }
};

const setHRR = (hrr, state) => {

  if (hrr.customerId) { state.customerHighRiskReg.value = (hrr); state.customerHighRiskReg.ua = Date.now(); }
  else if (hrr.personId) { state.personHighRiskReg.value = (hrr); state.personHighRiskReg.ua = Date.now(); }

  return { customerHighRiskReg: state.customerHighRiskReg, personHighRiskReg: state.personHighRiskReg };
};