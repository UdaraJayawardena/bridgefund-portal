import { SET_CUSTOMER, SET_SELECTED_CUSTOMER_ID } from 'store/crm/constants/Customer';
import { CLEAR_CUSTOMER, CLEAR_SME_LOAN_REQUEST_DETAILS, GET_SME_LOAN_REQUEST_DETAILS } from 'store/initiation/constants/CreditRiskOverview';
// import { GET_CUSTOMER_DETAILS , CLEAR_CUSTOMER_DETAILS } from 'store/loanmanagement/constants/CustomerDetails';
import {
    SET_LM_CUTOMER_SYS_ID, SET_IMPORTED_LOAN_REQUST_CONTRACT_ID, SET_FULL_AMOUNT_OF_DATA
} from '../constants/LMGlobal';
import {
    SELECT_LOAN,
    CLEAR_LOANS,
    SAVE_NEW_SME_LOAN,
    CLEAR_SELECTED_LOAN,
    FIND_AND_UPDATE_LOAN,
    PROCESS_SME_LOANS_BY_CUSTOMER,
    GET_CALCULATED_DATA_OF_LOAN_TRANSACTIONS,
    CLEAR_CALCULATED_DATA_OF_LOAN_TRANSACTIONS,
} from '../constants/SmeLoans';
import {
    SET_FLEX_LOAN_OVERVIEW_DATA,
    CLEAR_FLEX_LOAN_OVERVIEW_DATA,
    SET_FLEX_LOAN_WITHDRAWALS,
    CLEAR_FLEX_LOAN_WITHDRAWALS,
    // SET_ALL_FLEX_LOANS,
    SET_INVERS_CONSENTS_FOR_SME
} from '../constants/FlexLoan';

import {
    GET_ALL_CUSTOMER_DETAILS,
    CHANGE_CUSTOMER_DETAILS,
    CLEAR_SELECTED_CUSTOMER,
    FIND_AND_SELECT_SME,
} from '../constants/HeaderNavigation';


const calculatedDataOfLoanTransactionsObj = {
    principleAmount: null,
    initialCostAmount: null,
    interestAmount: null,
    recurringCostAmount: null,
    totalMarginAmount: null,
    totalLoanAmount: null,
    otherCostsAmount: null,
    overallTotalLoanAmount: null,
    outstandingPrincipleAmount: null,
    outstandingInterestAmount: null,
    outstandingInitialFee: null,
    outstandingRecurringFee: null,
    outstandingTotalMarginAmount: null,
    outstandingTotalLoanAmount: null,
    outstandingOtherCostAmount: null,
    overallOutstandingTotalAmount: null,
    totalOverdueAmount: null,
    otherCostOverdueAmount: null,
    partialPaymentAmount: null,
    overallTotalOverdueAmount: null,
    plannedDDAmountNormalDD: null,
    plannedDDAmountSpecialDD: null,
    plannedNormalDDLength: null,
    totalPlannedAmount: null,
    totalOverduePercentage: null,
    overallTotalOverduePercentage: null,
};

const customerDetailsInitObj = {
    name: '',
    email: '',
    phone: '',
    id: '',
    company: '',
    accountNo: ''
};

const selectedLoanInitObj = {
    type: '',
    _id: '',
    contractId: ''
};

const lmglobal = (

    state = {
        //BFLM global properties
        smeLoans: [],
        selectedLoan: selectedLoanInitObj,
        selectedLoanIndex: -1,
        calculatedDataOfLoanTransactions: calculatedDataOfLoanTransactionsObj,
        flexLoanOverview: {},
        flexLoanWithdrawals: [],
        customers: [],
        customerDetails: customerDetailsInitObj,
        inversConsentsForSme: [],

        //CRM & LI global properties

        selectedCustomer: {},
        selectedCustomer_ua: Date.now(),
        selectedCustomerId: '',
        importedLoanRequestContractId: '',
        overviewData: {}, // CRM Dashboard stuff

    }, action) => {
    switch (action.type) {

        // start of BFLM reducers

        case SET_LM_CUTOMER_SYS_ID:
            return {
                ...state,
                customerDetails: { ...state.customerDetails, id: action.payload }
            };

        case GET_ALL_CUSTOMER_DETAILS:
            return Object.assign({}, state, {
                customers: action.customers
            });
        case CHANGE_CUSTOMER_DETAILS:
            return Object.assign({}, state, {
                customerDetails: setSelectedCustomer(action.customerDetails)
            });

        case CLEAR_SELECTED_CUSTOMER:
            return Object.assign({}, state, {
                customerDetails: customerDetailsInitObj
            });

        case FIND_AND_SELECT_SME: {
            const sme = state.customers.find(sme => sme.id === action.smeId);
            return {
                ...state,
                customerDetails: sme ? setSelectedCustomer(sme) : {}
            };
        }

        case PROCESS_SME_LOANS_BY_CUSTOMER:
            return {
                ...state,
                smeLoans: action.smeLoansByCustomer
            };

        case SELECT_LOAN:
            return {
                ...state,
                selectedLoan: action.loan,
                selectedLoanIndex: state.smeLoans.findIndex(loan => loan.contractId === action.loan.contractId)
            };

        case CLEAR_SELECTED_LOAN:
            return {
                ...state,
                selectedLoan: selectedLoanInitObj,
                selectedLoanIndex: -1
            };

        case CLEAR_LOANS:
            return {
                ...state,
                smeLoans: [],
                selectedLoan: selectedLoanInitObj,
                selectedLoanIndex: -1,
                calculatedDataOfLoanTransactions: {},
            };

        case FIND_AND_UPDATE_LOAN:
            return {
                ...state,
                smeLoans: state.smeLoans.map(loan => { return action.loan.contractId === loan.contractId ? action.loan : loan; }),
                selectedLoan: state.selectedLoan.contractId && state.selectedLoan.contractId === action.loan.contractId ? action.loan : state.selectedLoan
            };

        case SAVE_NEW_SME_LOAN: {
            const newObject = state.smeLoans.slice(0);
            const index = newObject.findIndex(loan => loan.contractId === action.newSmeLoan.contractId);
            index !== -1 ? newObject[index] = action.newSmeLoan : newObject.push(action.newSmeLoan);

            return {
                ...state,
                smeLoans: newObject,
                selectedLoan: state.selectedLoanIndex !== -1 && state.selectedLoan.contractId === action.newSmeLoan.contractId ? action.newSmeLoan : state.selectedLoan
            };
        }

        case SET_FULL_AMOUNT_OF_DATA:
            return {
                ...state,
                fullAmountOfData: action.fullAmountOfData
            };

        case GET_CALCULATED_DATA_OF_LOAN_TRANSACTIONS:

            return {
                ...state,
                calculatedDataOfLoanTransactions: action.payload
            };

        case CLEAR_CALCULATED_DATA_OF_LOAN_TRANSACTIONS:

            return {
                ...state,
                calculatedDataOfLoanTransactions: calculatedDataOfLoanTransactionsObj
            };

        case SET_FLEX_LOAN_OVERVIEW_DATA:
            return {
                ...state,
                flexLoanOverview: action.payload.overview
            };

        case CLEAR_FLEX_LOAN_OVERVIEW_DATA:
            return {
                ...state,
                flexLoanOverview: {},
                inversConsentsForSme: [],
            };

        case SET_FLEX_LOAN_WITHDRAWALS:
            return {
                ...state,
                flexLoanWithdrawals: action.payload
            };

        case CLEAR_FLEX_LOAN_WITHDRAWALS:
            return {
                ...state,
                flexLoanWithdrawals: []
            };

        case SET_INVERS_CONSENTS_FOR_SME:
            return {
                ...state,
                inversConsentsForSme: action.payload,
            };

        //end of BFLM reducers

        // start CRM & LI reducers

        case CLEAR_CUSTOMER:
            return {
                ...state,
                selectedCustomer: {},
                selectedCustomer_ua: Date.now(),
                selectedCustomerId: '',
                overviewData: {},
            };

        case SET_CUSTOMER:
            return {
                ...state,
                selectedCustomer: action.payload,
                selectedCustomer_ua: Date.now()
            };

        case SET_SELECTED_CUSTOMER_ID:
            return {
                ...state,
                selectedCustomerId: action.payload
            };

        case GET_SME_LOAN_REQUEST_DETAILS:
            return {
                ...state,
                overviewData: action.payload,
            };

        case CLEAR_SME_LOAN_REQUEST_DETAILS:
            return {
                ...state,
                overviewData: {},
            };
        case SET_IMPORTED_LOAN_REQUST_CONTRACT_ID:
            return {
                ...state,
                importedLoanRequestContractId: action.payload,
            };
        // end CRM & LI reducers
        default:
            return state;
    }
};

export default lmglobal;


const setSelectedCustomer = (customer) => {

    if (!customer.name)
        customer.name = customer.firstName + ' ' + customer.lastName;

    if (customer.id)
        customer.accountNo = customer.id;
    return customer;
};