import { HANDLE_INTEREST_PANELTY_DRAWER, CHANGE_INTEREST_PENALTY_DESCRIPTION } from 'store/loanmanagement/constants/InterestPenalty'

const InterestPenalty = (
  state = {
    penaltyDescription: 'korting interest-claim',
    isOpenInterestPaneltyDrawer: false,
  },
  action
) => {
  switch (action.type) {
    case HANDLE_INTEREST_PANELTY_DRAWER:
      return {
        ...state,
        isOpenInterestPaneltyDrawer: !state.isOpenInterestPaneltyDrawer,
      };
      case CHANGE_INTEREST_PENALTY_DESCRIPTION:
      return {
        ...state,
        penaltyDescription: action.payload,
      };

    default:
      return state;
  }
};

export default InterestPenalty;
