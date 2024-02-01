import {
  CLEAR_COMPANY_STRUCTURE,
  SET_COMPANY_STRUCTURE,
  UPDATE_COMPANY_STRUCTURE,
} from "../constants/CompanyStructure";
import { cloneDeep } from "lodash";


const defaultState = {
  companyStructures: []
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_COMPANY_STRUCTURE:
      return {
        ...state,
        companyStructures: []
      };

    case SET_COMPANY_STRUCTURE:
      return {
        ...state,
        companyStructures: action.payload
      };

    case UPDATE_COMPANY_STRUCTURE:
      return {
        ...state,
        companyStructures: updateCS(state.companyStructures, action.payload)
      };

    default:
      return state;
  }
};

const updateCS = (companyStructures, payload) => {
  const newCompanyStructures = cloneDeep(companyStructures);

  payload.forEach(element => {

    const index = newCompanyStructures.findIndex(cs => cs.customerIdDaughter === element.customerIdDaughter && cs.customerIdMother === element.customerIdMother);
    index === -1 ? newCompanyStructures.push(element) : newCompanyStructures[index] = element;
  });
  return newCompanyStructures;
};
