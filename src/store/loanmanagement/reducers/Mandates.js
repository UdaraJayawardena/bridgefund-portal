import {
  PROCESS_MANDATES,
  TOGGLE_ADD_NEW_MANDATE,
  SAVE_NEW_MANDATE,
  SHOW_ADD_CONTRACT,
  SHOW_ADD_FLEX_CONTRACT,
  SHOW_ADD_TRANSACTION,
  SELECT_MANDATE,
  DE_SELECT_MANDATE,
  SAVE_MANDATE_ERROR,
  CLEAR_MANDATE_ERROR,
  SAVE_MANDATE_IS_BUSSY,
  CLEAR_BIC_FIELD,
  CLEAR_MANDATES
} from '../constants/Mandates';

import { PROCESS_BIC } from '../constants/BicIban';

const mandates = (
  state = {
    mandates: [],
    addingNewMandate: false,
    addNewMandateButton: 'Add New Mandate',
    selectedMandate: '',
    showAddContracts: false,
    showAddFlexContracts: false,
    showAddTransactions: false,
    serverError: '',
    addingMandateIsBusy: false,
    bic_number: '',
    // clearMandates: []
    selectedMandateFullObject: {},
    activeMandateByCustomer: {},
  },
  action
) => {
  switch (action.type) {
    case PROCESS_MANDATES:
      return Object.assign({}, state, {
        mandates: action.mandates,
        activeMandateByCustomer: getActiveMandate(action.mandates)
      });

    case TOGGLE_ADD_NEW_MANDATE:
      // eslint-disable-next-line no-case-declarations
      let toggleButton = '';

      if (state.addNewMandateButton === 'Add New Mandate') {
        toggleButton = 'Cancel';
      } else {
        toggleButton = 'Add New Mandate';
      }

      return {
        ...state,
        addingNewMandate: !state.addingNewMandate,
        addNewMandateButton: toggleButton
      };

    case SAVE_NEW_MANDATE:
      console.log('state.mandates', state.mandates);
      // eslint-disable-next-line no-case-declarations
      const newObject = state.mandates.slice(0);
      newObject.push(action.newMandate);

      return {
        ...state,
        mandates: newObject,
        serverError: ''
      };

    case SHOW_ADD_CONTRACT:
      return {
        ...state,
        showAddContracts: !state.showAddContracts
      };

    case SHOW_ADD_FLEX_CONTRACT:
      return {
        ...state,
        showAddFlexContracts: !state.showAddFlexContracts
      };

    case SHOW_ADD_TRANSACTION:
      return {
        ...state,
        showAddTransactions: !state.showAddTransactions
      };

    case SELECT_MANDATE:
      /*
                        let selectedMandatesArray = Object.assign({}, state);

                        selectedMandatesArray.countSelectedMandate.map((item) => item)

                        selectedMandatesArray.countSelectedMandate.push(action.mandateNumber);

                        console.log('kkkkk ' + JSON.stringify( selectedMandatesArray.countSelectedMandate))

                        return selectedMandatesArray;*/

      return {
        ...state,
        selectedMandate: action.mandate.mandateId,
        selectedMandateFullObject: action.mandate
      };

    case DE_SELECT_MANDATE:
      return {
        ...state,
        selectedMandate: '',
        selectedMandateFullObject: {}
      };

    case SAVE_MANDATE_ERROR:
      return {
        ...state,
        serverError: action.mandateSaveErr + "..!! Can't create mandate."
      };

    case CLEAR_MANDATE_ERROR:
      return {
        ...state,
        serverError: ''
      };

    case SAVE_MANDATE_IS_BUSSY:
      return {
        ...state,
        addingMandateIsBusy: !state.addingMandateIsBusy
      };

    case PROCESS_BIC:
      return {
        ...state,
        bic_number: action.bic_no
      };

    case CLEAR_BIC_FIELD:
      return {
        ...state,
        bic_number: ''
      };

    case CLEAR_MANDATES:
      return {
        ...state,
        mandates: []
      };

    default:
      return state;
  }
};


const getActiveMandate = (mandates) => {
  const activeMandate = mandates.find(mandate => mandate.status === 'active');
  if (activeMandate) {
    return activeMandate;
  }
  return {};
};
export default mandates;
