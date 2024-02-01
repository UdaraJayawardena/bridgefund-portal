import {
  PROCESS_PROVISION_DETAILS, PROCESS_DEFAULT_PROVISION_DETAILS
} from '../constants/ProvisionOverview';

const provisionOverview = (

  state = {
    provisions: [],
    loanInDefaultProvisions: { loanList: [] },
    defaultSettledProvisions: { loanList: [] },
  },
  action
) => {
  switch (action.type) {

    case PROCESS_PROVISION_DETAILS:

      return Object.assign({}, state, {

        provisions: action.provisions
      });

    case PROCESS_DEFAULT_PROVISION_DETAILS:

      return {
        ...state,
        defaultSettledProvisions: action.payload.defaultSettledProvisions,
        loanInDefaultProvisions: action.payload.loanInDefaultProvisions,
      };

    default:
      return state;
  }
};

export default provisionOverview;