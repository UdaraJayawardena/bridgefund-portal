import {
  PROVISION_PARAMETERS,
  PROVISION_PARAMETER_HISTORY,
  CREATE_PROVISION_PARAMETERS
} from '../constants/ProvisionParameters';

const ProvisionParameters = (

  state = {
    provisionParameters: [],
    provisionParameterHistory: []
  },
  action
) => {
  switch (action.type) {

    case PROVISION_PARAMETERS:

      return Object.assign({}, state, {
        provisionParameters: action.provisionParameters
      });
    
    case PROVISION_PARAMETER_HISTORY:

      return Object.assign({}, state, {
        provisionParameterHistory: action.provisionParameterHistory
      });

    case CREATE_PROVISION_PARAMETERS:
      const newObject = state.provisionParameters.slice(0);
      newObject.push(action.newProvisionpParameter);
      return {
        ...state,
        provisionParameters: newObject
      };
    default:
      return state;
  }
};

export default ProvisionParameters;