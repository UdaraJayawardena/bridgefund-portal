import {
    GET_BANK_ACCOUNTS,
    CLEAR_BANK_ACCOUNTS_LIST
} from "../constants/BankAccount";

const defaultState = {
    bankAccounts: [],
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_BANK_ACCOUNTS:
            return {
                ...state,
                bankAccounts: action.payload
            };
        case CLEAR_BANK_ACCOUNTS_LIST:
                return {
                ...state,
                bankAccounts: []
            };
        default:
            return state;
    }
};


