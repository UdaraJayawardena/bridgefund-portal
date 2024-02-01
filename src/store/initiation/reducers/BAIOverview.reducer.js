import {
    GET_REQUEST_BLOCK_LIST,
    CLEAR_REQUEST_BLOCK_LIST
} from "../constants/BAIOverview";

const defaultState = {
    requestBlockList: []
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_REQUEST_BLOCK_LIST:
            return {
                ...state,
                requestBlockList: action.payload
            };
        case CLEAR_REQUEST_BLOCK_LIST:
            return {
            ...state,
            requestBlockList: []
        };

        default:
            return state;
    }
};


