import {
    GET_DEBT_FORM_DATA,
    CLEAR_DEBT_FORM_DATA,
    UPDATE_DEBT_AT_THIRD_PARTY,
    CLEAR_DEBT_AT_THIRD_PARTY,
    UPDATE_DEBITOR_CREDITOR,
    CLEAR_DEBITOR_CREDITOR,
    IMPORT_REQUEST_ID
} from "../constants/DebtForm";

const defaultState = {
    debtFormData: [],
    updatedDebtAtThirdParty: {},
    updateDebtorCreditor: {},
    requestId: ''
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_DEBT_FORM_DATA:
            return {
                ...state,
                debtFormData: action.payload
            };
        case CLEAR_DEBT_FORM_DATA:
            return {
            ...state,
            debtFormData: []
        };
        case UPDATE_DEBT_AT_THIRD_PARTY:
            return {
            ...state,
            updatedDebtAtThirdParty: action.payload
        };
        case CLEAR_DEBT_AT_THIRD_PARTY:
            return {
            ...state,
            updatedDebtAtThirdParty: {}
        };
        case UPDATE_DEBITOR_CREDITOR:
            return {
            ...state,
            updateDebtorCreditor: action.payload
        };
        case CLEAR_DEBITOR_CREDITOR:
            return {
            ...state,
            updateDebtorCreditor: {}
        };
        case IMPORT_REQUEST_ID:
            return {
            ...state,
            requestId: action.payload
        };

        default:
            return state;
    }
};


