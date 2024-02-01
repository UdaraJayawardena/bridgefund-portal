/* eslint-disable import/no-anonymous-default-export */
import {
    GET_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW,
    CLEAR_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW,
    GET_SELECTED_BANK_TRANSACTION_FOR_MULTIPLE_IDS
} from "../constants/BankTransactions";

const defaultState = {
    bankTransactionsWithCategories: [],
    selectedBankTransactionsForCRParameters: []
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW:
            return {
                ...state,
                bankTransactionsWithCategories: action.payload
            };

        case CLEAR_BANK_TRANSACTION_FOR_CATEGORY_OVERVIEW:
            return {
                ...state,
                bankTransactionsWithCategories: []
            };

        case GET_SELECTED_BANK_TRANSACTION_FOR_MULTIPLE_IDS:
            return {
                ...state,
                selectedBankTransactionsForCRParameters: []
            };

        default:
            return state;
    }
};


