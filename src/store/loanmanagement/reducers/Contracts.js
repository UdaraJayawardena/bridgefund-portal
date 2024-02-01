import {
  // PROCESS_CONTRACTS,
  // SAVE_NEW_CONTRACT,
  // SAVE_NEW_CONTRACT_BUSSY,
  // SHOW_TERMINATE_CONTRACT_MODAL,
  // SELECT_CONTRACT,
  // SHOW_TEMPORARY_LOAN_STOP,
  // CLEAR_CONTRACTS,
  SET_OPPOTUNITY_DETAILS,
  CELAR_OPPOTUNITY_DETAILS,
  EDIT_CONTRACT_FIELD,
  TERMS_MAPPING,
  RE_CALCULATE_TOTAL_INTEREST,
  STORE_BASE_RATE
} from '../constants/Contracts';

import { vTigerValue, getPlannedDDCount } from 'constants/loanmanagement/sme-loan';

const initialOpportunityDetails = {
  type: '',
  frequency: '',
  riskCategory: '',
  amount: 0,
  interest: 0,
  fees: 0,
  surcharge: 0,
  totalInterest: 0,
  potentialNo: '',
  durationInMonths: 0,
  terms: 0,
};

const contracts = (
  state = {
    // contracts: [],
    // createContractIsBusy: false,
    // showTerminateContractModal: false,
    // selectedContractID: '',
    // selectedContract: {},
    numberOfTerms: '',
    frequency: 'daily',
    oppotunityDetails: JSON.parse(JSON.stringify(initialOpportunityDetails)),
    baseRate : '0.5'
  },
  action
) => {
  switch (action.type) {

    // case PROCESS_CONTRACTS: {
    //   const contracts = action.contracts.map(contract => {
    //     contract.totalAmount =
    //       contract.amount + contract.interest + contract.fees;
    //     contract.dailyAmount = contract.totalAmount / contract.terms;

    //     return contract;
    //   });

    //   return Object.assign({}, state, {
    //     contracts
    //   });
    // }

    // case SAVE_NEW_CONTRACT_BUSSY:
    //   return {
    //     ...state,
    //     createContractIsBusy: !state.createContractIsBusy
    //   };

    // case SHOW_TERMINATE_CONTRACT_MODAL:
    //   return {
    //     ...state,
    //     showTerminateContractModal: !state.showTerminateContractModal
    //   };

    // case SELECT_CONTRACT:
    //   return {
    //     ...state,
    //     selectedContractID: action.contract.contractNumber,
    //     selectedContract: action.contract
    //   };

    // case CLEAR_CONTRACTS:
    //   return {
    //     ...state,
    //     contracts: []
    //   };

    case SET_OPPOTUNITY_DETAILS: {
      const oppotunityDetails = mapOppotunityDetails(action.oppotunityDetails, state.baseRate);
      return Object.assign({}, state, {
        oppotunityDetails: oppotunityDetails,
        numberOfTerms: TERMS_MAPPING[oppotunityDetails.durationInMonths][oppotunityDetails.frequency],
        frequency: oppotunityDetails.frequency
      });
    }

    case CELAR_OPPOTUNITY_DETAILS:
      return Object.assign({}, state, {
        oppotunityDetails: JSON.parse(JSON.stringify(initialOpportunityDetails))
      });

    case EDIT_CONTRACT_FIELD: {

      const newData = {};
      newData[action.fieldName] = action.fieldValue || '';

      if (action.fieldName === 'frequency' && TERMS_MAPPING[state.oppotunityDetails.durationInMonths]) {
        newData.numberOfTerms =
          TERMS_MAPPING[state.oppotunityDetails.durationInMonths][action.fieldValue] || '';
      }

      return Object.assign({}, state, newData);
    }

    case RE_CALCULATE_TOTAL_INTEREST : {
     
      return Object.assign({}, state, {
        oppotunityDetails: {
          ...state.oppotunityDetails,
          totalInterest: Math.round(100 * (Number(state.baseRate) + Number(action.oppotunity.cf_potentials_interestincrement)) *
          action.oppotunity.cf_potentials_durationinmonths) / 100,
        },
      });
    }

    case STORE_BASE_RATE :  {
      return{
        ...state,
        baseRate: action.rate
      }
    } 

    default:
      return state;
  }
};

export default contracts;

const mapOppotunityDetails = (oppotunity, baseRate) => {

  return {
    type: vTigerValue[oppotunity.opportunity_type],
    frequency: vTigerValue[oppotunity.cf_potentials_loanpaymentschedule],
    riskCategory: oppotunity.cf_potentials_opportunityriskclassification,
    amount: Number(oppotunity.cf_potentials_loanquotationamount_currency_value) || 0,
    interest: Number(oppotunity.cf_potentials_interestincrementvalue_currency_value) || 0,
    fees: Number(oppotunity.cf_potentials_interestvalue_currency_value) || 0,
    surcharge: Number(oppotunity.cf_potentials_loaninterestincrement) || 0,
    totalInterest: Math.round(100 * (Number(baseRate) + Number(oppotunity.cf_potentials_loaninterestincrement)) *
oppotunity.cf_potentials_loanduration) / 100,
    potentialNo: oppotunity.potential_no,
    durationInMonths: Number(oppotunity.cf_potentials_loanduration),
    terms: getPlannedDDCount(vTigerValue[oppotunity.cf_potentials_loanpaymentschedule], oppotunity.cf_potentials_loanduration),
  };
};