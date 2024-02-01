import {
    GET_CONTRACT_ID,
    GET_LOAN_REQUEST_LIST,
    PROCESS_LOAN_REQUEST,
    CLEAR_LOAN_REQUEST
} from "../constants/LoanRequest";

import { vTigerValue, getPlannedDDCount } from 'constants/initiation/sme-loan';

const defaultState = {
    selectedContractId: '',
    loanRequestList: []
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_CONTRACT_ID:
            return {
                ...state,
                selectedContractId: action.payload
            };

        case GET_LOAN_REQUEST_LIST: {
            const convertedResultList = convertTOJson(action.payload);
            const displayResultList = maploanDetails(convertedResultList);
            return Object.assign({}, state, {
                loanRequestList: displayResultList,
            });
        }

        case PROCESS_LOAN_REQUEST:
            return {
                ...state,
            };

        case CLEAR_LOAN_REQUEST:
            return {
                ...state,
                loanRequestList: []
            };

        default:
            return state;
    }
};
const maploanDetails = result => {
    try{
        for (const test of result) {
            const loan = test.variables.opportunity.value;
    
            let interestincrement, 
                durationinmonths,
                quotationamount,
                paymentschedule,
                bridgefundinterestvalue,
                bridgefundinterestincrementvalue;
    
            if(test.variables.loanType.value === 'fixed-loan'){
                interestincrement = loan.cf_potentials_loaninterestincrement;
                durationinmonths = loan.cf_potentials_loanduration;
                quotationamount = loan.cf_potentials_loanquotationamount_currency_value;
                paymentschedule = loan.cf_potentials_loanpaymentschedule;
                bridgefundinterestvalue = loan.cf_potentials_interestvalue_currency_value;
                bridgefundinterestincrementvalue = loan.cf_potentials_interestincrementvalue_currency_value;
            }else{
                interestincrement = loan.cf_potentials_creditlineinterestincrement;
                durationinmonths = loan.cf_potentials_creditlineduration;
                quotationamount = loan.cf_potentials_creditlinequotationamount_currency_value;
                paymentschedule = loan.cf_potentials_creditlinepaymentschedule;
            }
    
            const data = {
                type: vTigerValue[loan.opportunity_type],
                riskCategory: loan.cf_potentials_opportunityriskclassification,
                amount: Number(quotationamount) || 0,
                interest: Number(bridgefundinterestincrementvalue) || 0,
                fees: Number(bridgefundinterestvalue) || 0,
                surcharge: Number(interestincrement) || 0,
                totalInterest: Math.round(100 * (0.5 + Number(interestincrement)) * durationinmonths) / 100,
                recuringInterest: (Math.round(100 * Number(interestincrement)) / 100) || 0, /**Flex contact Recurring Interest%  , Algorithom : interest%base + interest%surcharge*/ 
                frequency: vTigerValue[paymentschedule],
                potentialNo: loan.potential_no,
                durationInMonths: Number(durationinmonths),
                terms: getPlannedDDCount(vTigerValue[paymentschedule], durationinmonths),
                loanType: loan.cf_potentials_loantype,
                refinancedLoan: loan.cf_potentials_refinancedloanid
            };
    
            test.variables.opportunity.value = {
                ...test.variables.opportunity.value,
                ...data
            };
        }
        return result;
    }catch(error){
        console.log("maploanDetails", error);
        return result;
    }
};

const convertTOJson = result => {
    for (const data of result) {
        for (const item in data.variables) {
            if (data.variables[item] && data.variables[item].type === 'Json') data.variables[item].value = JSON.parse(data.variables[item].value);
        }
    }
    return result;
};
