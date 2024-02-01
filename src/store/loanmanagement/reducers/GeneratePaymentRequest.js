import { SHOW_GENERATE_PAYMENT_REQUEST } from '../constants/GeneratePaymentRequest';

const generatepaymentrequest = (
  state = {
    showGeneratePaymentRequestDrayer: false
  },
  action
) => {
  switch (action.type) {
    case SHOW_GENERATE_PAYMENT_REQUEST:
      return {
        ...state,
        showGeneratePaymentRequestDrayer: !state.showGeneratePaymentRequestDrayer
      };
    default:
      return state;
  }
}

export default generatepaymentrequest;